import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExcelImporterComponent } from './excel-importer/excel-importer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExcelImporterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Import-excel';
}
