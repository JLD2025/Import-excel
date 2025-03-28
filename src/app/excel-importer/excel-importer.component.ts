import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-excel-importer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-importer.component.html',
  styleUrls: ['./excel-importer.component.css']
})

export class ExcelImporterComponent implements OnInit {
  excelData: any[] = []; //Sirve par almacenar los datos
  sheetNames: string[] = []; //Sirve para almacenar los diferentes nombres de las hojas que contiene un excel en particular.
  selectedSheetIndex: number = 0; //Indice de la hoja seleccionada de un excel.

  workbook: XLSX.WorkBook | null = null; // Almacena el workbook
  currentDate: string = '';

  dynamicBackground: string = 'dynamic-background';

  selectedCellValue: string = '';

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

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const arrayBuffer: ArrayBuffer = e.target.result;
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' });

      this.sheetNames = this.workbook.SheetNames; //Esta parte sirve para obtener los nombres de las hojas por la cuál se compone un excel.

      if(this.sheetNames.length > 0){
        this.loadSheet(0); //Empezar por la primera hoja por defecto
      }

      /* Leer la primera hoja de un excel
      const sheetName: string = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Convierte la hoja a JSON, usando las cabeceras como la primera fila
      this.excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      */
     
    };

    // Cambié a 'readAsArrayBuffer'
    reader.readAsArrayBuffer(file);
  }

  loadSheet(index: number) : void {
    if(this.workbook){

      this.selectedSheetIndex = index;
      const sheetName: string = this.sheetNames[index];
      const sheet: XLSX.WorkSheet = this.workbook.Sheets[sheetName];

      if(sheet){
        this.excelData = XLSX.utils.sheet_to_json(sheet, {header : 1});
      }

    }

  }

  exportToExcel() {
    const worksheet = XLSX.utils.aoa_to_sheet(this.excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Editados');

    XLSX.writeFile(workbook, `${this.sheetNames}Datos_Modificados.xlsx`);
  }

  selectCell(rowIndex: number, colIndex: number) {
    this.selectedCellValue = this.excelData[rowIndex][colIndex];
  }

}
