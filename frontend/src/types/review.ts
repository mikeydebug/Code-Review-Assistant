export type ReviewType = 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY';
export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Issue {
  id: string;
  title: string;
  description: string;
  recommendation: string | null;
  severity: IssueSeverity;
  fileName: string | null;
  lineNumber: number | null;
  reviewId: string;
}

export interface Review {
  id: string;
  type: ReviewType;
  status: ReviewStatus;
  summary: string | null;
  createdAt: string;
  completedAt: string | null;
  projectId: string;
  _count?: {
    issues: number;
    files: number;
  };
  issues?: Issue[];
  files?: { file: { name: string; language: string; size: number } }[];
}

export interface CreateReviewPayload {
  projectId: string;
  type: ReviewType;
  fileIds: string[];
}
