import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  constructor(private http: HttpClient) {}

  obtenerLote(loteid: number) {
    return this.http.post('https://valorapre.valmesa.es:3939/api/lote/listado',{
        id: loteid
    },{
        withCredentials: true
    });
  }
}

@Injectable({
  providedIn: 'root'  // Asegúrate de que esté aquí también
})
export class HistoryService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getHistoryState(): any {
    if (isPlatformBrowser(this.platformId)) {
      return window.history.state ? window.history.state.loteData : null;
    }
    return null;
  }
}