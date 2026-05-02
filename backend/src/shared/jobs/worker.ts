import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { sendEmail } from '../services/email.service.js';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const setupWorkers = () => {
  const worker = new Worker('reportsQueue', async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}...`);
    
    // Simulate a heavy operation
    let progress = 0;
    while (progress < 100) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Sleep for 1s
      progress += 20;
      await job.updateProgress(progress);
    }

    console.log(`Job ${job.id} completed.`);
    return { status: 'SUCCESS', message: 'Report generated', generatedAt: new Date() };
  }, { connection });

  worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
  });

  const emailWorker = new Worker('emailQueue', async (job: Job) => {
    console.log(`Processing email job ${job.id} for ${job.data.to}...`);
    await sendEmail(job.data);
    return { status: 'SUCCESS' };
  }, { connection });

  emailWorker.on('failed', (job, err) => {
    console.error(`Email Job ${job?.id} failed:`, err);
  });

  return [worker, emailWorker];
};
