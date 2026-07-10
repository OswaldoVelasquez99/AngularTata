import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Producto, ProductResponse} from '../models/Product.model';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3002/bp/products';

  getProducts(): Observable<Producto[]> {
    return this.http
      .get<ProductResponse>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  postProducts(producto: Producto): Observable<Producto> {
    return this.http
      .post<Producto>(this.apiUrl, producto);
  }

  verificarExistenciaId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification?id=${id}`);
  }

  getProductoById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  putProducto(id: string, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  deleteProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  constructor() { }
}
