import { Request, Response, NextFunction } from 'express';
import * as dashboardModel from '../models/dashboardModel';

export async function getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [stats, recentActivity, charts] = await Promise.all([
      dashboardModel.getDashboardStats(),
      dashboardModel.getRecentActivity(5),
      dashboardModel.getChartData()
    ]);
    
    res.json({
      success: true,
      data: {
        stats,
        recentActivity,
        charts
      }
    });
  } catch (err) {
    next(err);
  }
}
