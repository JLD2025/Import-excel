import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExcelImporterComponent } from './excel-importer/excel-importer.component';
import { CommonModule } from '@angular/common';
import { PrincipalPantallaComponent } from "./principal-pantalla/principal-pantalla.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Import-excel';
}