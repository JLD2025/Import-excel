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

  estadoVentana: string | null = null;
  referenciaIngresado: string = "";
  idBien: number | null = null;

  mensajeVisible: boolean = false;
  contenidoMensaje: string = '';
  estiloMensaje: any = {};

  selectedRowIndex: number | null = null;
  selectedRowData: string | null = null;
  

  ngOnInit() {
    this.updateTime();
    const data = history.state.loteData;

    if (data) {
      this.mostrarLote('Conexión exitosa: ' + JSON.stringify(data));
    }
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
    this.cancelarBusqueda();
  }


  revisarControlesIniciales() {
    let errores: string[] = [];
  
    // Verificar que los datos han sido importados correctamente
    if (!this.datos || this.datos.length === 0) {
      this.mostrarErrores(["No se han importado datos."]);
      return false;
    }
    
    // Obtener los encabezados dinámicamente de los datos
    const headers = Object.keys(this.datos[0]);
  
    const input = prompt('Ingresa los encabezados requeridos, separados por comas (ejemplo: "Nº Finca, Nº Registro, Código Postal"):');

    if (input !== null) {
      // Convertir la entrada en un array
      const requiredHeaders = input.split(',').map(header => header.trim());
  
      // Filtrar los encabezados faltantes
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
      if (missingHeaders.length > 0) {
          console.log('Faltan los siguientes encabezados:', missingHeaders);
      } else {
          console.log('Todos los encabezados están presentes.');
      }
    } else {
        console.log('No se proporcionaron encabezados.');
    }
    
    // Si los encabezados necesarios están presentes, revisar que los registros tengan valores válidos
    // Si no hay errores previos, verificamos los campos faltantes en los registros
    if (!errores.length) {
      // Función para verificar campos vacíos en los registros
      const verificarCampo = (campo: string) => {
        return this.datos
          .map((item, index) => (!item[campo] ? { fila: index + 1, columna: headers.indexOf(campo) + 1 } : null))
          .filter(item => item !== null);
      };

      // Iterar sobre cada encabezado y verificar los registros sin datos en esa columna
      headers.forEach(header => {
        const registrosVacios = verificarCampo(header);
        if (registrosVacios.length > 0) {
          const detalles = registrosVacios.map(item => `Fila: ${item.fila}, Columna: ${item.columna} (${header})`);
          errores.push(`Registros sin datos en la columna '${header}' en las posiciones: ${detalles.join(', ')}`);
        }
      });
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
    this.mensajeVisible = true;
    this.contenidoMensaje = `✅ ${mensaje}`;
    this.estiloMensaje = {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid rgb(0, 0, 0)',
    };
  }
  
  mostrarLote(mensaje: string) {
    this.mensajeVisible = true;
  
    const regex = /^(.*?)\s*(\[.*\])$/s;
    const match = mensaje.match(regex);
  
    let encabezado = '✅ ';
    let filasHtml = '';
  
    if (match) {
      encabezado += match[1];
      try {
        const data: Record<string, any>[] = JSON.parse(match[2]);
  
        if (Array.isArray(data) && data.length > 0) {
          // Crear una fila con cada clave-valor
          const filas = data.map((obj: Record<string, any>) =>
            Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
              let value = obj[key];
              // Si es null, undefined o vacío, mostrarlo explícitamente
              if (value === null) {
                acc[key] = `"null"`;
              } else if (value === undefined) {
                acc[key] = `"undefined"`;
              } else if (value === '') {
                acc[key] = `"empty"`;
              } else {
                acc[key] = `"${value}"`;
              }
              return acc;
            }, {})
          );
  
          // Crear el HTML con los datos sin ordenarlos
          filasHtml = filas.map(obj => {
            const formattedObj = JSON.stringify(obj, null, 2); // Para dar formato de objeto JSON
            return `
              <pre style="font-family: monospace; text-align: left; margin: 10px 0;">${formattedObj}</pre>
            `;
          }).join('');
        } else {
          filasHtml = '<p style="text-align: center;">No hay datos para mostrar.</p>';
        }
      } catch (e) {
        filasHtml = `<p style="color: red; text-align: center;">Error al parsear JSON</p>`;
      }
    } else {
      encabezado += mensaje;
    }
  
    this.contenidoMensaje = `
      <div style="margin-bottom: 1rem; text-align: center;">
        <strong>${encabezado}</strong>
      </div>
      ${filasHtml}
    `;
  
    this.estiloMensaje = {
      margin: 'auto',
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      overflowX: 'auto',
      position: 'fixed',    
      left: '250px',
      border: '1px solid black',     
      background: 'white'    
    };
  }  

  cerrarMensaje() {
    this.mensajeVisible = false;
  }

  onCellEdit(event: any, rowIndex: number, colIndex: number): void {
    const newValue = event.target.innerText.trim();
    // Verificar que el nuevo valor no esté vacío antes de asignarlo
    if (newValue === '') {
      this.excelData[rowIndex] = [...this.excelData[rowIndex]]; // Crear una nueva referencia para la fila
      this.excelData[rowIndex][colIndex] = '';  // Dejar la celda vacía
    } else {
        // Si el valor no es vacío, actualizamos normalmente
        this.excelData[rowIndex] = [...this.excelData[rowIndex]]; // Crear una nueva referencia para la fila
        this.excelData[rowIndex][colIndex] = newValue;  // Actualizar la celda específica
    }
  } 

  onRowClick(index: number){
    if(this.selectedRowIndex === index){
      this.selectedRowIndex = null;
      this.selectedRowData = null;
    }else{
      this.selectedRowIndex = index;
      this.selectedRowData = this.excelData[index];
    }
  }

  onBuscarAntecedentes() {
    const errores: string[] = [];
    if (!this.selectedRowData || Object.keys(this.selectedRowData).length === 0) {
      errores.push('No se han importado datos. No hay tablas disponibles para seleccionar.');
      this.mostrarErrores(errores);
    } else {
      const fila = this.selectedRowData;

      const headers = Object.keys(fila);
      const valores = Object.values(fila);

      let tablaHtml = `
          <table border="1" cellspacing="0" cellpadding="1">
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
            <tr>
              ${valores.map(valor => `<td>${valor}</td>`).join('')}
            </tr>
          </table>
      `;

      this.mostrarMensaje('Mostrando antecedentes: ' + tablaHtml);
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
      setTimeout(() => {
        this.cerrarErrores(); 
    }, 3500);
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
      this.mostrarErrores(['No se encontraron coincidencias para ' + this.municipioIngresado + ' en ' + this.provinciaSeleccionada]);
      setTimeout(() => {
          this.cerrarErrores(); 
      }, 3500);
        return;
    }
    
    const coincidenciasDetalles: string[] = filasCoincidentes.map((index) => {
      const fila = this.excelData[index];
      const tipoRegistro = fila[12]; 
      const localidadRegistro = fila[13]; 
      const numeroRegistro = fila[14]; 
    
      return `Fila ${index}: Tipo Registro: ${tipoRegistro}, Localidad Registro: ${localidadRegistro}, Nº Registro: ${numeroRegistro}`;
    });
    
    let tablaHtml = `
    <table border="1" cellspacing="0" cellpadding="1">
      <tr>
        <th>Nombre</th>
      </tr>
      ${coincidenciasDetalles.map(detalle => {
        const [nombre] = detalle.split('|').map(x => x.trim());
        return `<tr><td>${nombre}</td></tr>`;
      }).join('')}
    </table>
  `;

  this.mostrarMensaje(`Coincidencias encontradas:<br>${tablaHtml}`);
  
  }

  buscarRegistros(): void {
    const errores: string[] = [];
  
    if (!this.referenciaIngresado || this.referenciaIngresado.trim() === '') {
      errores.push('No puede estar vacio.');
    }

    if (errores.length > 0) {
      this.mostrarErrores(errores);
      setTimeout(() => {
        this.cerrarErrores(); 
      }, 3500);
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
      this.mostrarErrores(['Debes escribir una referencia catastral.']);
      setTimeout(() => {
          this.cerrarErrores(); 
      }, 3500);
        return;
    }
    
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

  buscarTipoBien(): void {
    const errores: string[] = [];
  
    if (!this.idBien || isNaN(this.idBien) || this.idBien.toString().trim() === '') {
      errores.push('No puede estar vacio.');
    }

    if (errores.length > 0) {
      this.mostrarErrores(errores);
      setTimeout(() => {
        this.cerrarErrores(); 
      }, 3500);
      return;
    }
  
    if(this.idBien !== null){
      const bien = this.idBien;
  
      // Buscar en excelData
      const filasCoincidentes: number[] = [];
      this.excelData.forEach((fila, index) => {
        const contieneBien = fila.some((celda : any) => celda?.toString().toLowerCase().includes(bien));
    
        if (contieneBien) {
          filasCoincidentes.push(index); // Sumar 1 si quieres mostrar la fila como número humano (no índice)
        }
      });
    
      if (filasCoincidentes.length === 0) {
        this.mostrarErrores(['Debes escribir una referencia catastral.']);
        setTimeout(() => {
            this.cerrarErrores(); 
        }, 3500);
          return;
      }
      
        const coincidenciasDetalles: string[] = filasCoincidentes.map((index) => {
        const fila = this.excelData[index];
    
          // Suponiendo que las columnas "Tipo Registro", "Localidad Registro", "Nº Registro"
          const tipo = fila[5]; 
          const descripcionTipoBien = fila[6]; 
          const domicilioBien = fila[7]; 
    
          return `Fila ${index}: Id. bien: ${bien}, Tipo: ${tipo}, Localidad Registro: ${descripcionTipoBien}, Nº Registro: ${domicilioBien}`;
        });

        // Mostrar las coincidencias encontradas con los detalles de las columnas
        this.mostrarMensaje(`Coincidencias encontradas:\n${coincidenciasDetalles.join('\n')}`);
    }
  
  }

  toggleVentana(nombre: string) {
    this.estadoVentana = this.estadoVentana === nombre ? null : nombre;
  }

  cancelarBusqueda() {
    // Limpiar campos
    this.provinciaSeleccionada = '';
    this.municipioIngresado = '';
    this.referenciaIngresado = '';
    this.idBien = null;

  }
  
}
