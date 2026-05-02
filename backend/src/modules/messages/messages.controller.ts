import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { sendMessageSchema } from '../../shared/validators/messages.validators.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';
import { io } from '../../server.js';

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = sendMessageSchema.parse(req.body);
    const senderId = req.user?.userId;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure receiver exists
    const receiver = await prisma.users.findUnique({
      where: { id: validatedData.receiverId }
    });
    if (!receiver) {
      return res.status(404).json({ error: 'Not Found', message: 'Receiver not found' });
    }

    const message = await prisma.messages.create({
      data: {
        sender_id: senderId,
        receiver_id: validatedData.receiverId,
        subject: validatedData.subject,
        body: validatedData.body,
      },
      include: {
        sender: { select: { id: true, full_name: true, role: true } },
      }
    });

    // Notify receiver via WebSockets
    io.to(validatedData.receiverId).emit('new_message', {
      id: message.id,
      sender: message.sender.full_name,
      subject: message.subject,
    });

    // Also send a general notification to the bell
    const notification = await prisma.notifications.create({
      data: {
        user_id: validatedData.receiverId,
        type: 'NEW_MESSAGE',
        message: `New message from ${message.sender.full_name}: ${message.subject}`,
      }
    });
    io.to(validatedData.receiverId).emit('notification', notification);

    return res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', message: error.errors });
    }
    console.error('Send Message Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInbox = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const messages = await prisma.messages.findMany({
      where: { receiver_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        sender: { select: { id: true, full_name: true, role: true } }
      }
    });

    return res.status(200).json({ data: messages });
  } catch (error) {
    console.error('Get Inbox Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSentMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const messages = await prisma.messages.findMany({
      where: { sender_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        receiver: { select: { id: true, full_name: true, role: true } }
      }
    });

    return res.status(200).json({ data: messages });
  } catch (error) {
    console.error('Get Sent Messages Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const message = await prisma.messages.findUnique({ where: { id } });
    if (!message) return res.status(404).json({ error: 'Not Found' });
    if (message.receiver_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    const updatedMessage = await prisma.messages.update({
      where: { id },
      data: { is_read: true },
    });

    return res.status(200).json({ data: updatedMessage });
  } catch (error) {
    console.error('Mark Message Read Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
