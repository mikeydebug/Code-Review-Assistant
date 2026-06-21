export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  _count: {
    files: number;
    reviews: number;
  };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}
