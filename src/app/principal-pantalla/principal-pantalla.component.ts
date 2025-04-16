import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal-pantalla',
  templateUrl: './principal-pantalla.component.html',
  styleUrl: './principal-pantalla.component.css'
})
export class PrincipalPantallaComponent implements OnInit {
  constructor(private router : Router){}
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

  AltaLotes(){
    this.router.navigate(['/alta-lotes'])
  }

  Conexion(){
    this.router.navigate(['/alta-lotes'])
  }

}
