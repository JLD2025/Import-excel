import { Routes } from '@angular/router';
import { ExcelImporterComponent } from './excel-importer/excel-importer.component';
import { PrincipalPantallaComponent } from './principal-pantalla/principal-pantalla.component';


export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }, // redirige al inicio
  { path: 'inicio', component: PrincipalPantallaComponent },
  { path: 'alta-lotes', component: ExcelImporterComponent },
];
