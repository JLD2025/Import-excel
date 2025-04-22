import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class LoteService {
  constructor(private http: HttpClient) {}

  obtenerLote(loteid: number) {
    return this.http.post('https://localhost:3939/api/lote/listado',{
        id: loteid
    });
  }
}