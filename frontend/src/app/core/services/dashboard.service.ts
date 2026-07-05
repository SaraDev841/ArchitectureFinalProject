import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CatalogPageDto {
  products: any[];
  categories: any[];
  totalProductCount: number;
}

export interface UserDashboardDto {
  user: any;
  recentOrders: any[];
  totalSpent: number;
  orderCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getCatalogPage(): Observable<CatalogPageDto> {
    return this.http.get<CatalogPageDto>(`${environment.apiUrl}/bff/dashboard/catalog`);
  }

  getUserDashboard(userId: number): Observable<UserDashboardDto> {
    return this.http.get<UserDashboardDto>(`${environment.apiUrl}/bff/dashboard/user/${userId}`);
  }
}
