import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';
import { addReportJob, reportsQueue } from '../../shared/jobs/queue.js';

export const triggerJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobType, data } = req.body;
    
    // Admin only logic
    if (req.user?.role !== 'NGO_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden', message: 'Not authorized' });
    }

    const job = await addReportJob(jobType || 'GenerateReport', data || {});

    return res.status(200).json({ 
      message: 'Job successfully queued', 
      jobId: job.id,
      jobName: job.name
    });
  } catch (error) {
    console.error('Trigger Job Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getJobStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const job = await reportsQueue.getJob(id);

    if (!job) {
      return res.status(404).json({ error: 'Not Found', message: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return res.status(200).json({
      id: job.id,
      name: job.name,
      state,
      progress,
      result,
      failedReason,
      timestamp: job.timestamp
    });
  } catch (error) {
    console.error('Get Job Status Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
