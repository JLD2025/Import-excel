import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal-pantalla',
  templateUrl: './principal-pantalla.component.html',
  styleUrl: './principal-pantalla.component.css'
})
export class PrincipalPantallaComponent {
  constructor(private router : Router){}

  AltaLotes(){
    this.router.navigate(['/alta-lotes'])
  }

  Conexion(){
    this.router.navigate(['/inicio'])
  }

}
