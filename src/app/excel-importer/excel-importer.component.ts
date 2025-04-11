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
  fileName: string = '';
  currentDate: string = '';

  dynamicBackground: string = 'dynamic-background';

  selectedCellValue: string = '';
  selectedRow: number | null = null;
  selectedCol: number | null = null;

  datos: any[] = [];

  mostrarBuscador: boolean = false;
  provinciaSeleccionada: string = '';
  municipioIngresado: string = '';

  provincias: string[] = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz',
    'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real',
    'Córdoba', 'La Coruña', 'Cuenca', 'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa',
    'Huelva', 'Huesca', 'Islas Baleares', 'Jaén', 'León', 'Lérida', 'Lugo', 'Madrid',
    'Málaga', 'Murcia', 'Navarra', 'Orense', 'Palencia', 'Las Palmas', 'Pontevedra',
    'La Rioja', 'Salamanca', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Santa Cruz de Tenerife',
    'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
  ];

  mostrarVentana: boolean = false;
  referenciaIngresado: string = "";

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

  loadSheet(index: number): void {
    if (this.workbook) {
      this.selectedSheetIndex = index;
      const sheetName: string = this.sheetNames[index];
      const sheet: XLSX.WorkSheet = this.workbook.Sheets[sheetName];
      if (sheet) {
        // Convertir la hoja a un array de objetos, donde la primera fila contiene los encabezados
        this.excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Obtener los encabezados de la primera fila
        const headers: string[] = this.excelData[0];
    
        // Asignar los datos a this.datos, mapeando las filas usando los encabezados
        this.datos = this.excelData.slice(1).map((row) => {
          let rowData: any = {};
  
          headers.forEach((header, index) => {
            // Asignar directamente el valor usando los encabezados tal cual están
            rowData[header] = row[index] !== undefined ? row[index] : null;
          });
  
          return rowData;
      });
    
        console.log("Datos cargados dinámicamente:", this.datos);
      }
    }
  }
  

  loadDataFromExcelData(excelData: any[][]): void {
    const headers: string[] = excelData[0];
  
    this.datos = excelData.slice(1).map((row) => {
      let rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] !== undefined ? row[index] : null;
      });
      return rowData;
    });
  
    console.log("Datos actualizados desde el Excel modificado:", this.datos);
  }
  

  exportToExcel() {
    const worksheet = XLSX.utils.aoa_to_sheet(this.excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Editados');

    XLSX.writeFile(workbook, `${this.fileName}_Datos_Modificados.xlsx`);

    this.loadDataFromExcelData(this.excelData);
  }


  revisarControlesIniciales() {
    let errores = [];
  
    // Verificar que los datos han sido importados correctamente
    if (!this.datos || this.datos.length === 0) {
      this.mostrarErrores(["No se han importado datos."]);
      return false;
    }
    
    // Obtener los encabezados dinámicamente de los datos
    const headers = Object.keys(this.datos[0]);
  
    const requiredHeaders = ['Nº Finca', 'Nº Registro', 'Código Postal'];

    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
      if (missingHeaders.length === requiredHeaders.length) {
        // Si faltan todos los encabezados, muestra solo un mensaje
        errores.push(`No corresponde a este Excel. Botón inhabilitado`);
      } else {
        // Si faltan solo algunos encabezados, muestra un mensaje por cada encabezado faltante
        missingHeaders.forEach(header => {
          errores.push(`Falta el encabezado: ${header}`);
        });
      }
    }
  
    // Si los encabezados necesarios están presentes, revisar que los registros tengan valores válidos
    if (!errores.length) {
      const verificarCampo = (campo : string, nombreCampo : string) => {
        return this.datos
          .map((item, index) => (!item[campo] ? { fila: index + 1, columna: headers.indexOf(nombreCampo) + 1 } : null))
          .filter(item => item !== null);
      };
      
      // Verificar registros sin finca asignada
      const sinFinca = verificarCampo('Nº Finca', 'Nº Finca');
      if (sinFinca.length > 0) {
        const detalles = sinFinca.map(item => `Fila: ${item.fila}, Columna: ${item.columna} (Nº Finca)`);
        errores.push(`Registros sin finca asignada en las posiciones: ${detalles.join(', ')}`);
      }
      
      // Verificar registros sin registro de propiedad
      const sinRegistroPropiedad = verificarCampo('Nº Registro', 'Nº Registro');
      if (sinRegistroPropiedad.length > 0) {
        const detalles = sinRegistroPropiedad.map(item => `Fila: ${item.fila}, Columna: ${item.columna} (Nº Registro)`);
        errores.push(`Registros sin registro de propiedad en las posiciones: ${detalles.join(', ')}`);
      }
      
      // Verificar registros sin código postal
      const sinCodigoPostal = verificarCampo('Código Postal', 'Código Postal');
      if (sinCodigoPostal.length > 0) {
        const detalles = sinCodigoPostal.map(item => `Fila: ${item.fila}, Columna: ${item.columna} (Código Postal)`);
        errores.push(`Registros sin código postal en las posiciones: ${detalles.join(', ')}`);
      }
      

    }
  
    // Si existen errores, mostrarlos
    if (errores.length > 0) {
      this.mostrarErrores(errores);
      return false;
    }
  
    // Si todo está correcto, mostrar mensaje de éxito
    this.mostrarMensaje('Todos los controles iniciales son correctos');
    return true;
  }
  
  // Métodos para mostrar errores y mensajes
  mostrarErrores(errores: string[]) {
    const container = document.getElementById('error-container');
    const lista = document.getElementById('error-list');
    const closeButton = document.getElementById('close-btn');
    
    if (!container || !lista) return;

    lista.innerHTML = '';

    if (errores.length === 0) {
      container.style.display = 'none';
      return;
    }

    errores.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      lista.appendChild(li);
    });

    container.style.display = 'block';

    if (closeButton) {
      closeButton.addEventListener('click', this.cerrarErrores);
    }
  }

  cerrarErrores(){
    const container = document.getElementById('error-container');
    if (container ) {
      container.style.display = 'none';
    }
  }

  
  mostrarMensaje(mensaje: string) {
    alert(`Mensaje: ${mensaje}`);
  }

  onCellEdit(event: any, rowIndex: number, colIndex: number): void {
    const newValue = event.target.innerText.trim();
    // Verificar que el nuevo valor no esté vacío antes de asignarlo
    if (newValue !== '') {
      // Actualizar el valor en la celda correspondiente
      this.excelData[rowIndex] = [...this.excelData[rowIndex]]; // Crear una nueva referencia para la fila
      this.excelData[rowIndex][colIndex] = newValue;  // Actualizar la celda específica
    }
  } 
  
  buscarFilas(): void {
    const errores: string[] = [];
  
    if (!this.provinciaSeleccionada) {
      errores.push('Debes seleccionar una provincia.');
    }
  
    if (!this.municipioIngresado || this.municipioIngresado.trim() === '') {
      errores.push('Debes escribir un municipio.');
    }
  
    if (errores.length > 0) {
      this.mostrarErrores(errores);
      return;
    }
  
    const municipio = this.municipioIngresado.toLowerCase();
    const provincia = this.provinciaSeleccionada.toLowerCase();
  
    // Buscar en excelData
    const filasCoincidentes: number[] = [];
    this.excelData.forEach((fila, index) => {
      const contieneMunicipio = fila.some((celda : any) => celda?.toString().toLowerCase().includes(municipio));
      const contieneProvincia = fila.some((celda : any) => celda?.toString().toLowerCase().includes(provincia));
  
      if (contieneMunicipio && contieneProvincia) {
        filasCoincidentes.push(index); // Sumar 1 si quieres mostrar la fila como número humano (no índice)
      }
    });
  
    if (filasCoincidentes.length === 0) {
      this.mostrarMensaje(`No se encontraron coincidencias para "${this.municipioIngresado}" en "${this.provinciaSeleccionada}".`);
    } else {
      this.mostrarMensaje(`Coincidencias encontradas en las filas: ${filasCoincidentes.join(', ')}`);
    }
  }

  buscarRegistros(): void {
    const errores: string[] = [];
  
    if (!this.referenciaIngresado || this.referenciaIngresado.trim() === '') {
      errores.push('Debes escribir una referencia catastral.');
    }
  
    if (errores.length > 0) {
      this.mostrarErrores(errores);
      return;
    }
  
    const referencia = this.referenciaIngresado.toLowerCase();
  
    // Buscar en excelData
    const filasCoincidentes: number[] = [];
    this.excelData.forEach((fila, index) => {
      const contieneReferencia = fila.some((celda : any) => celda?.toString().toLowerCase().includes(referencia));
  
      if (contieneReferencia) {
        filasCoincidentes.push(index); // Sumar 1 si quieres mostrar la fila como número humano (no índice)
      }
    });
  
    if (filasCoincidentes.length === 0) {
      this.mostrarMensaje(`No se encontraron coincidencias para "${this.referenciaIngresado}".`);
    } else {
      const coincidenciasDetalles: string[] = filasCoincidentes.map((index) => {
        const fila = this.excelData[index];
  
        // Suponiendo que las columnas "Tipo Registro", "Localidad Registro", "Nº Registro"
        const tipoRegistro = fila[12]; 
        const localidadRegistro = fila[13]; 
        const numeroRegistro = fila[14]; 
  
        return `Fila ${index}: Tipo Registro: ${tipoRegistro}, Localidad Registro: ${localidadRegistro}, Nº Registro: ${numeroRegistro}`;
      });
  
      // Mostrar las coincidencias encontradas con los detalles de las columnas
      this.mostrarMensaje(`Coincidencias encontradas:\n${coincidenciasDetalles.join('\n')}`);
    }
  }
  
}
