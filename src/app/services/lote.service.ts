import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private apiUrl = 'https://localhost:3939/api/lote/listado';

  constructor(private http: HttpClient) {}

  obtenerLote(loteid: number) {
    // Crear el objeto para el cuerpo de la solicitud
    const body = { id: loteid };

    // Configuración opcional de los headers (si es necesario)
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(this.apiUrl, body, { headers });
  }
}