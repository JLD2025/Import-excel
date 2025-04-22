import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoteService } from '../services/lote.service';

@Component({
  selector: 'app-principal-pantalla',
  templateUrl: './principal-pantalla.component.html',
  styleUrl: './principal-pantalla.component.css'
})
export class PrincipalPantallaComponent implements OnInit {
  constructor(private router : Router, private loteService: LoteService){}
  currentDate: string = "";

  ngOnInit() {
    this.updateTime();
  }

  updateTime(){
    this.getCurrentDate();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => this.updateTime()); // Llama de nuevo si estamos en un navegador
    }
  }

  // Función para obtener la fecha y hora actuales
  getCurrentDate() {
    const ahora = new Date();
    this.currentDate = ahora.toLocaleString('es-ES');
  }

  AltaLotes(data?: any){
    this.router.navigate(['/alta-lotes'], {state: { loteData: data } })
  }

  Conexion() {
    const loteid = 690;
     console.log('Intentando hacer la conexión...');
    this.loteService.obtenerLote(loteid).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);
        //alert('Conexión exitosa: ' + JSON.stringify(res));
        this.AltaLotes(res);
        // Aquí podrías guardar los datos en una propiedad para mostrarlos en la vista
      },
      error: (err) => {
        console.error('Error al conectar:', err);
        alert('Error al conectar');
      }
    });
  }
}