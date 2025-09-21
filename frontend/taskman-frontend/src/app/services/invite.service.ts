import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SendInviteRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface AcceptInviteRequest {
  email: string;
  password: string;
}

export interface InviteStatus {
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  sendInvite(inviteData: SendInviteRequest): Observable<{ message: string; memberId: number }> {
    return this.http.post<{ message: string; memberId: number }>(`${this.apiUrl}/invites/send`, inviteData);
  }

  acceptInvite(acceptData: AcceptInviteRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/invites/accept`, acceptData);
  }

  getInviteStatus(email: string): Observable<InviteStatus> {
    return this.http.get<InviteStatus>(`${this.apiUrl}/invites/status/${email}`);
  }
}
