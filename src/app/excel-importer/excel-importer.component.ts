import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

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
  fileName: string = '';
  currentDate: string = '';

  dynamicBackground: string = 'dynamic-background';

  selectedCellValue: string = '';
  selectedRow: number | null = null;
  selectedCol: number | null = null;

  datos: any[] = [];

  constructor(private cd: ChangeDetectorRef) {}

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

    this.fileName = file.name.split('.')[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const arrayBuffer: ArrayBuffer = e.target.result;
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' });

      this.sheetNames = this.workbook.SheetNames; //Esta parte sirve para obtener los nombres de las hojas por la cuál se compone un excel.

      if(this.sheetNames.length > 0){
        this.loadSheet(0); //Empezar por la primera hoja por defecto
      }
     
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

        // Actualizar también el array datos con la información procesada
        //this.processExcelData();
  
      }
    }
  }

/*
  processExcelData() {
    // Asegurarse de que hay datos para procesar
    if (this.excelData.length <= 1) {
      this.datos = [];
      return;
    }
    // Asumimos que la primera fila contiene los encabezados
    const headers = this.excelData[0];
    // Verificar que headers sea un array válido
    if (!Array.isArray(headers)) {
      this.datos = [];
      return;
    }
    this.datos = this.excelData.slice(1).map(row => {
      const item: any = {};
      // Verificar que row sea un array válido
      if (!Array.isArray(row)) {
        return item;
      }
      // Iterar solo sobre headers válidos
      for (let index = 0; index < headers.length; index++) {
        const header = headers[index];
        // Asegurarse de que el header es una cadena válida
        if (header && typeof header === 'string') {
          item[header] = index < row.length ? row[index] : null;
        }
      }
      return item;
    });
  }
  */

  exportToExcel() {
    const worksheet = XLSX.utils.aoa_to_sheet(this.excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Editados');

    XLSX.writeFile(workbook, `${this.fileName}_Datos_Modificados.xlsx`);
  }

  revisarControlesIniciales() {
    let errores = [];
    
    // Revisar que todos tengan finca
    const sinFinca = this.datos.filter(item => !item.finca);
    if (sinFinca.length > 0) {
      errores.push(`${sinFinca.length} registros sin finca asignada`);
    }
    
    // Revisar registros de propiedad
    const sinRegistroPropiedad = this.datos.filter(item => !item.registroPropiedad);
    if (sinRegistroPropiedad.length > 0) {
      errores.push(`${sinRegistroPropiedad.length} registros sin registro de propiedad`);
    }
    
    // Revisar código postal
    const sinCodigoPostal = this.datos.filter(item => !item.codigoPostal);
    if (sinCodigoPostal.length > 0) {
      errores.push(`${sinCodigoPostal.length} registros sin código postal`);
    }
    
    if (errores.length > 0) {
      this.mostrarErrores(errores);
      return false;
    }
    
    this.mostrarMensaje('Todos los controles iniciales son correctos');
    return true;
  }
  
  // Métodos que faltaban para mostrar errores y mensajes
  mostrarErrores(errores: string[]) {
    // Implementación del método para mostrar errores
    console.error('Errores encontrados:', errores);
    // Aquí podrías implementar la lógica para mostrar errores en la UI
  }
  
  mostrarMensaje(mensaje: string) {
    // Implementación del método para mostrar mensajes
    console.log('Mensaje:', mensaje);
    // Aquí podrías implementar la lógica para mostrar mensajes en la UI
  }

}
