import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreateDto, ProductUpdateDto, PagedResult } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(pageNumber = 1, pageSize = 12, categoryId?: number): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<PagedResult<Product>>(`${this.base}/paged`, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(dto: ProductCreateDto): Observable<Product> {
    return this.http.post<Product>(this.base, dto);
  }

  update(id: number, dto: ProductUpdateDto): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
