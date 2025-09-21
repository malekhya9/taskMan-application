export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'backlogged' | 'defined' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  projectTag: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deadlineColor: 'green' | 'yellow' | 'red' | 'gray';
  assignees?: Assignee[];
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Assignee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  url?: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate?: string;
  projectTag?: string;
  assigneeIds?: number[];
}

export interface UpdateTaskStatusRequest {
  status: Task['status'];
}

export interface AddAssigneeRequest {
  assigneeIds: number[];
}

export interface AddCommentRequest {
  content: string;
}

export interface TaskFilters {
  status?: string;
  projectTag?: string;
  assigneeId?: number;
}

export const TASK_STATUSES = [
  { value: 'backlogged', label: 'Backlogged', color: '#6c757d' },
  { value: 'defined', label: 'Defined', color: '#17a2b8' },
  { value: 'in-progress', label: 'In Progress', color: '#007bff' },
  { value: 'review', label: 'Review', color: '#ffc107' },
  { value: 'completed', label: 'Completed', color: '#28a745' }
];

export const DEADLINE_COLORS = {
  green: '#28a745',
  yellow: '#ffc107',
  red: '#dc3545',
  gray: '#6c757d'
};
