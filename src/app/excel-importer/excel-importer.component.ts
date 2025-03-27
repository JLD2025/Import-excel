import { Component } from '@angular/core';
import * as XLSX from 'xlsx'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-excel-importer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './excel-importer.component.html',
  styleUrls: ['./excel-importer.component.css']
})
export class ExcelImporterComponent {
  excelData: any[] = [];

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) return;

    const file = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const arrayBuffer: ArrayBuffer = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: 'array' });

      const sheetName: string = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Convierte la hoja a JSON, usando las cabeceras como la primera fila
      this.excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    };

    // Cambié a 'readAsArrayBuffer'
    reader.readAsArrayBuffer(file);
  }
}
