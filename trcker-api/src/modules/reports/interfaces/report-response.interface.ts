import { ReportTemplate } from '../entities/report-template.entity';
import { ReportExecution } from '../entities/report-execution.entity';

export interface PaginatedTemplatesResponse {
  items: ReportTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedExecutionsResponse {
  items: ReportExecution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GenerateReportResponse {
  execution: ReportExecution;
  downloadUrl?: string;
  data?: any;
}