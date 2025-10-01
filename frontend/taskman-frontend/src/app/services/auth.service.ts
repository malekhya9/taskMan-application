import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, VerifyRequest, AuthResponse, CreateLeadRequest, CreateMemberRequest, UpdateProfileRequest, ChangePasswordRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: RegisterRequest): Observable<{ message: string; userId: number }> {
    return this.http.post<{ message: string; userId: number }>(`${this.apiUrl}/auth/register`, userData);
  }

  verifyEmail(verifyData: VerifyRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/verify`, verifyData);
  }

  resendOTP(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/resend-otp`, { email });
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`);
  }

  createLead(leadData: CreateLeadRequest): Observable<{ message: string; lead: User }> {
    return this.http.post<{ message: string; lead: User }>(`${this.apiUrl}/users/leads`, leadData);
  }

  createMember(memberData: CreateMemberRequest): Observable<{ message: string; member: User }> {
    return this.http.post<{ message: string; member: User }>(`${this.apiUrl}/users/members`, memberData);
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(`${this.apiUrl}/users/profile`, profileData)
      .pipe(
        tap(response => {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/users/password`, passwordData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isLead(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'lead';
  }

  isMember(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'member';
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
