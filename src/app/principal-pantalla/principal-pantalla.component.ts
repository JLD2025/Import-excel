import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoteService } from '../services/lote.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, CommonModule],
  selector: 'app-principal-pantalla',
  templateUrl: './principal-pantalla.component.html',
  styleUrl: './principal-pantalla.component.css'
})
export class PrincipalPantallaComponent implements OnInit {
  constructor(private router : Router, private loteService: LoteService){}
  currentDate: string = "";
  mostrarVentana: boolean = false;
  idIngresado: number | null = null;

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
    const errores: string[] = [];
  
    if (!this.idIngresado || isNaN(this.idIngresado) || this.idIngresado.toString().trim() === '') {
      errores.push('No puede estar vacio.');
    }

    if (errores.length > 0) {
      alert(errores);
      return;
    }

    console.log('Intentando hacer la conexión...');
    if(this.idIngresado !== null){
      const loteid = this.idIngresado;
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

  cancelarBusqueda() {
    // Vaciamos los campos
    this.idIngresado = null;
  
    // Cerramos los modales
    this.mostrarVentana = false;
  }  
}