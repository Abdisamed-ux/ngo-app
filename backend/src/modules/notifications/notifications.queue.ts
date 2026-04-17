import { Queue, Worker, Job } from 'bullmq';
import { sendEmailStub, sendSmsStub } from './notification.service.js';

// Connection details for Redis
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const notificationQueue = new Queue('notificationQueue', { connection });

// Define the worker that processes notification jobs
const worker = new Worker(
  'notificationQueue',
  async (job: Job) => {
    switch (job.name) {
      case 'send-receipt-email':
        await sendEmailStub(job.data.email, 'Your Donation Receipt', `Thank you! Receipt Number: ${job.data.receiptNumber}`);
        break;
      case 'send-status-sms':
        await sendSmsStub(job.data.phone, `Your case status is now: ${job.data.status}`);
        break;
      default:
        console.warn(`Unknown job name: ${job.name}`);
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job with id ${job?.id} has failed with ${err.message}`);
});
