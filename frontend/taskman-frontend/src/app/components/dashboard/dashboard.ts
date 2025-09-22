import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskFilters } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];
  isLoading = true;
  filters: TaskFilters = {};
  
  // Statistics
  totalTasks = 0;
  completedTasks = 0;
  overdueTasks = 0;
  tasksInProgress = 0;

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
        this.calculateStatistics();
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

  calculateStatistics(): void {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    this.overdueTasks = this.tasks.filter(task => task.deadlineColor === 'red').length;
    this.tasksInProgress = this.tasks.filter(task => task.status === 'in-progress').length;
  }

  onFilterChange(): void {
    this.loadTasks();
  }

  exportTasks(): void {
    this.taskService.exportTasks(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting tasks:', error);
      }
    });
  }

  getDeadlineColorClass(color: string): string {
    return `deadline-${color}`;
  }
}
