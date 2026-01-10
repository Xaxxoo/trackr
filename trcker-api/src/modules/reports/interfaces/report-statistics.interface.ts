export interface ReportStatistics {
  totalTemplates: number;
  activeTemplates: number;
  totalExecutions: number;
  templatesByCategory: {
    category: string;
    count: number;
  }[];
  executionsByStatus: {
    status: string;
    count: number;
  }[];
  averageExecutionTime: number;
  totalReportsGenerated: number;
  scheduledReports: number;
}