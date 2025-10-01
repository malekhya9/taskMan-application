import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/users`);
  }

  getLeads(): Observable<{ leads: User[] }> {
    return this.http.get<{ leads: User[] }>(`${this.apiUrl}/users/leads`);
  }

  getMembers(): Observable<{ members: User[] }> {
    return this.http.get<{ members: User[] }>(`${this.apiUrl}/users/members`);
  }

  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/users`, { 
      responseType: 'blob' 
    });
  }
}
