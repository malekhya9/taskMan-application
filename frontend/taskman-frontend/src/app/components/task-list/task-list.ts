import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskFilters, TASK_STATUSES } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];
  isLoading = true;
  filters: TaskFilters = {};
  taskStatuses = TASK_STATUSES;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.filters).subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.totalItems = this.tasks.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  updateTaskStatus(task: Task, newStatus: string): void {
    this.taskService.updateTaskStatus(task.id, { status: newStatus as any }).subscribe({
      next: (response) => {
        task.status = response.task.status;
        task.deadlineColor = response.task.deadlineColor;
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        alert(error.error?.message || 'Failed to update task status');
      }
    });
  }

  canUpdateStatus(task: Task, newStatus: string): boolean {
    if (this.authService.isLead()) {
      return true; // Leads can move between any states
    }
    
    if (this.authService.isMember()) {
      // Members can only move defined → in-progress and in-progress → review
      return (task.status === 'defined' && newStatus === 'in-progress') ||
             (task.status === 'in-progress' && newStatus === 'review');
    }
    
    return false;
  }

  getStatusLabel(status: string): string {
    const statusObj = this.taskStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getDeadlineColorClass(color: string): string {
    return `deadline-${color}`;
  }

  getPaginatedTasks(): Task[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.tasks.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
}

  getStatusColor(status: string): string {
    const statusObj = this.taskStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6c757d';
  }
}
