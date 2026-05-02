import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const reportsQueue = new Queue('reportsQueue', { connection });
export const emailQueue = new Queue('emailQueue', { connection });

export const addReportJob = async (jobName: string, data: any) => {
  return await reportsQueue.add(jobName, data);
};

export const addEmailJob = async (data: { to: string; subject: string; html: string }) => {
  return await emailQueue.add('sendEmail', data);
};
