import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskStatusRequest, AddAssigneeRequest, AddCommentRequest, TaskFilters } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTasks(filters?: TaskFilters): Observable<{ tasks: Task[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.projectTag) params = params.set('projectTag', filters.projectTag);
      if (filters.assigneeId) params = params.set('assigneeId', filters.assigneeId.toString());
    }
    return this.http.get<{ tasks: Task[] }>(`${this.apiUrl}/tasks`, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  createTask(taskData: CreateTaskRequest): Observable<{ message: string; task: Task }> {
    return this.http.post<{ message: string; task: Task }>(`${this.apiUrl}/tasks`, taskData);
  }

  updateTaskStatus(id: number, statusData: UpdateTaskStatusRequest): Observable<{ message: string; task: Task }> {
    return this.http.patch<{ message: string; task: Task }>(`${this.apiUrl}/tasks/${id}/status`, statusData);
  }

  addAssignees(id: number, assigneeData: AddAssigneeRequest): Observable<{ message: string; assignees: any[] }> {
    return this.http.post<{ message: string; assignees: any[] }>(`${this.apiUrl}/tasks/${id}/assignees`, assigneeData);
  }

  removeAssignee(taskId: number, assigneeId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/tasks/${taskId}/assignees/${assigneeId}`);
  }

  uploadAttachments(id: number, files: File[]): Observable<{ message: string; attachments: any[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post<{ message: string; attachments: any[] }>(`${this.apiUrl}/tasks/${id}/attachments`, formData);
  }

  addComment(id: number, commentData: AddCommentRequest): Observable<{ message: string; comments: any[] }> {
    return this.http.post<{ message: string; comments: any[] }>(`${this.apiUrl}/tasks/${id}/comments`, commentData);
  }

  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/tasks/${id}`);
  }

  exportTasks(filters?: TaskFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.projectTag) params = params.set('projectTag', filters.projectTag);
      if (filters.assigneeId) params = params.set('assigneeId', filters.assigneeId.toString());
    }
    return this.http.get(`${this.apiUrl}/export/tasks`, { 
      params, 
      responseType: 'blob' 
    });
  }
}
