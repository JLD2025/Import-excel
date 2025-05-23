export interface FieldMapping {
  origen: string;
  valor: string;
  destino: string;
}

import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { HistoryService } from '../services/lote.service';

@Component({
  selector: 'app-excel-importer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-importer.component.html',
  styleUrls: ['./excel-importer.component.css'],
  providers: [HistoryService]
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

  fieldMappings: FieldMapping[] = [
    { origen: 'Encargo', valor: '', destino: '' },
    { origen: 'Expediente', valor: '', destino: ''},
    { origen: 'S/Referencia', valor: '', destino: ''},
    { origen: 'Nº Acuerdo', valor: '', destino: ''},
    { origen: 'Id. Bien', valor: '', destino: ''},
    { origen: 'Tipo', valor: '', destino: ''},
    { origen: 'Descripción tipo Bien', valor: '', destino: ''},
    { origen: 'Domicilio Bien', valor: '', destino: '' },
    { origen: 'Código Postal', valor: '', destino: ''},
    { origen: 'Localidad', valor: '', destino: ''},
    { origen: 'Provincia', valor: '', destino: ''},
    { origen: 'Referencia Catastral', valor: '', destino: ''},
    { origen: 'Tipo Registro', valor: '', destino: '' },
    { origen: 'Localidad Registro', valor: '', destino: ''},
    { origen: 'Nº Registro', valor: '', destino: ''},
    { origen: 'Nº Inscripcion', valor: '', destino: ''},
    { origen: 'Tomo', valor: '', destino: '' },
    { origen: 'Libro', valor: '', destino: ''},
    { origen: 'Folio', valor: '', destino: '' },
    { origen: 'Nº Finca', valor: '', destino: ''},
    { origen: 'Tasadora actual', valor: '', destino: ''},
  ];
  
  columnasDestino = [
    'Encargo', 'Expediente', 'SuReferencia', 
    'Acuerdo', 'IdBien', 'TipoBien', 'CodigoPostal', 
    'Municipio', 'Provincia', 'ReferenciaCatastral', 'Inscripcion',
    'Tomo', 'Libro', 'Folio'
  ];

  ordenCampos = [
    'ind', 'LoteId', 'Encargo', 'Expediente', 'Oficina', 'SuReferencia', 'Acuerdo',
    'IdBien', 'ReferenciaCatastral', 'TipoBien', 'CodigoPostal', 'NomCalle', 'Municipio',
    'Provincia', 'NomRegistroPropiedad', 'NumRegistroPropiedad', 'FincaStr', 'Idufir',
    'Tomo', 'Libro', 'Folio', 'Inscripcion', 'ValorPrevisto', 'FechaValorPrevisto', 'TipoVisita',
    'ContactoNombre', 'ContactoTelefono', 'ContactoEmail', 'ContactoObservacion', 'Delegacionid',
    'Encargoid', 'Fecha', 'ExpeId', 'ClienteId', 'TipoBienId', 'MunicipioId', 'ProvinciaId',
    'RegistroPropiedadId', 'claveExpeAnterior', 'fechaexpeanterior', 'copiado', 'FechaLimite',
    'varios', 'Documentacion', 'Observacion', 'TipoValoracion', 'Prioridad', 'TipoFicha',
    'TitularNif', 'SubclienteId', 'FechaEncargo', 'Entidad', 'NumActivo'
  ];

  estadoVentana: string | null = null;
  referenciaIngresado: string = "";
  idBien: number | null = null;

  mensajeVisible: boolean = false;
  mensajeLote: boolean = false;
  contenidoMensaje: string = '';
  contenidoMensajeLote: string = '';
  estiloMensaje: any = {};
  estiloMensajeLote: any = {};

  selectedRowIndex: number | null = null;
  selectedRowData: string | null = null;

  constructor(private historyService: HistoryService) {}
  

  ngOnInit() {
    this.updateTime();
    const data = this.historyService.getHistoryState();
  
    if (data) {
      
      let dataMessage = '';
  
      if (Array.isArray(data)) {
        // Si es un array, procesamos cada ítem
        dataMessage = data.map((item) => {
          return Object.entries(item).map(([key, value]) => {
            return `<strong>${key}:</strong> ${value}`;
          }).join('<br/>');
        }).join('<br/>');
      } else if (typeof data === 'object') {
        // Si es un objeto, procesamos sus claves y valores
        dataMessage = Object.entries(data).map(([key, value]) => {
          return `<strong>${key}:</strong> ${value}`;
        }).join('<br/>');
      } else {
        // Si no es un objeto ni un array, lo convertimos a string
        dataMessage = data.toString();
      }
  
      const mensajeCompleto = dataMessage;
  
      this.mostrarLote(mensajeCompleto);
    }
  }   

  updateTime(){
    this.getCurrentDate();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => this.updateTime());
    }
  }

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

      this.sheetNames = this.workbook.SheetNames; 
      //Esta parte sirve para obtener los nombres de las hojas por la cuál se compone un excel.

       // Pedir al usuario el nombre de la hoja a cargar
       const sheetName = prompt("Selecciona el nombre de la hoja:", this.sheetNames.join(', '));
      
       if (sheetName && this.sheetNames.includes(sheetName)) {
         const index = this.sheetNames.indexOf(sheetName);
         this.loadSheet(index); // Cargar la hoja seleccionada
       } else {
         alert("La hoja no existe o no se seleccionó ninguna.");
       }
     
    };

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
  
    if (errores.length > 0) {
      this.mostrarErrores(errores);
      return false;
    }
  
    this.mostrarMensaje('Todos los controles iniciales son correctos');
    return true;
  }
  
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
      closeButton.addEventListener('click', this.cerrarErrores.bind(this));
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
  
  onDestinoChange(mapping: FieldMapping, index: number): void {
  
    const currentDestino = this.fieldMappings[index].destino.trim();
    const currentOrigen = mapping.origen;
  
    if (!this.ordenCampos.includes(currentDestino)) {
        console.log(currentDestino + ', ' + currentOrigen);
        console.log('El destino no contiene el origen, no se puede actualizar.');
        return;
    }

    const selectedValue = this.selectedRowData ? this.selectedRowData[index] : undefined;

    if (selectedValue !== undefined) {
        this.fieldMappings[index].valor = selectedValue; 
    } else {
        this.fieldMappings[index].valor = 'No Disponible';
    }

    const originalDestino = currentDestino;

    if (currentDestino !== mapping.origen) {
        const transformedDestino: string = this.transformarYMapear(currentOrigen, currentDestino);
        this.fieldMappings[index].destino = transformedDestino;
    }

    const mensajeLote = selectedValue === undefined ? currentOrigen : originalDestino;

    this.mostrarLoteConDatosActualizados(mensajeLote);
  }

  transformarYMapear(origen: string, destino: string): string {
      let normalizedOrigen: string[] = origen
          .toLowerCase()
          .split(' ')
          .filter((word: string) => word.length > 0);

      let normalizedDestino: string[] = destino
          .toLowerCase()
          .split(' ')
          .filter((word: string) => word.length > 0);

      let palabrasComunes: string[] = normalizedOrigen.filter((word: string) => normalizedDestino.includes(word));

      if (palabrasComunes.length > 0) {
          let nuevoDestino: string = palabrasComunes
              .map((palabra: string) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
              .join('');
          return nuevoDestino;
      }

      return destino;
  }

  mostrarLote(mensaje: string) {
    this.mensajeLote = true;
    const encabezado = `✅ Conexión exitosa al siguiente lote: `;
    const filasHtml = mensaje.split("<br/>").slice(0).map(line => {
      return `<div style="font-family: monospace; text-align: left; margin: 5px 0;">
                ${line}
              </div>`;
    }).join('');
  
    this.contenidoMensajeLote = `
      <div style="margin-bottom: 1rem; text-align: center;">
        <strong>${encabezado}</strong>
      </div>
      ${filasHtml}
    `;
  
    this.estiloMensajeLote = {
      width: '300px',
      height: '210px',
      overflowX: 'auto',
      border: '1px solid black',
      background: 'white',
      paddingLeft: '45px',
      paddingTop: '5px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      top: '80px', 
      left: '20px',
      borderRadius: '6px',
      zIndex: '999',
      fontFamily: 'sans-serif',
      fontSize: 'small',
    };    

    // Mostrar el mensaje en la consola
    console.log(encabezado);
    mensaje.split("<br/>").forEach(line => {
      console.log(line.trim());  // Imprime cada línea sin espacios adicionales
    });
  }

  mostrarLoteConDatosActualizados(campoModificado: string): void {
    const updatedMessage = this.ordenCampos.map(campo => {
        
        const mappingDestino = this.fieldMappings.find(m => m.destino.startsWith(campo[0]) && 
        m.destino.endsWith(campo.slice(-3)) ||
        m.destino.includes(campo));
        
        // Buscar el mapeo correspondiente en fieldMappings comparando las últimas 3 letras de origen cuando el destino está vacío
        const mappingOrigenVacío = this.fieldMappings.find(m => m.origen === campo && (!m.destino));

        console.log('campoModificado:', campoModificado);
        console.log('mappingDestino:', mappingDestino);
        console.log('mappingOrigenVacío:', mappingOrigenVacío);

        if (campoModificado === campo) {
            const valor = mappingDestino && mappingDestino.valor && mappingDestino.valor !== 'No Disponible'
                ? `campo: ${mappingDestino.valor}`  // Mostrar valor actualizado
                : `campo: ${campo}`;  // Si no hay valor, mostrar el nombre del campo

            console.log(`Valor actualizado para ${campo}: ${valor}`);
            return valor;
        }

        // Si no coinciden, devolver el valor original
        const valorActual = (mappingDestino && mappingDestino.valor && mappingDestino.valor !== 'No Disponible' && mappingDestino.destino !== '-- Origen --')
            ? `campo: ${mappingDestino.valor}`
            : `campo: ${campo}`;

        console.log(`Valor no actualizado para ${campo}: ${valorActual}`);

        // Si el destino está vacío, hacer la comparación con el origen
        if (mappingOrigenVacío) {
            console.log(`Se encontró un mapeo con origen vacío. Comparando origen: ${campo} con origen mapeado: ${mappingOrigenVacío.origen}`);
            return `campo: ${mappingOrigenVacío.valor}`;
        }

        return valorActual;
    }).join('<br/>');

    this.mostrarLote(updatedMessage);
  }

  cerrarMensaje() {
    this.mensajeVisible = false;
  }

  onCellEdit(event: any, rowIndex: number, colIndex: number): void {
    const newValue = event.target.innerText.trim();
   
    if (newValue === '') {
      this.excelData[rowIndex] = [...this.excelData[rowIndex]];
      this.excelData[rowIndex][colIndex] = ''; 
    } else {
       
        this.excelData[rowIndex] = [...this.excelData[rowIndex]]; 
        this.excelData[rowIndex][colIndex] = newValue; 
    }
  } 

  onRowClick(index: number): void{
    if(this.selectedRowIndex === index){
      this.selectedRowIndex = null;
      this.selectedRowData = null;
    }else{
      this.selectedRowIndex = index;
      this.selectedRowData = this.excelData[index];
    }

    this.asignarValoresAFIELDMappings(this.selectedRowData);

    this.mostrarLoteConDatosActualizados(this.selectedRowData || '');

    console.log('selectedRowData:', this.selectedRowData);
  }

  asignarValoresAFIELDMappings(selectedRowData: any): void {
      // Recorremos los fieldMappings y asignamos los valores correspondientes de selectedRowData
      this.fieldMappings.forEach((mapping, index) => {
          if (selectedRowData[index]) {
              mapping.valor = selectedRowData[index];
          }
      });

      // Verifica los valores asignados
      console.log('fieldMappings actualizados:', this.fieldMappings);
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
        filasCoincidentes.push(index); 
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
  
    const filasCoincidentes: number[] = [];
    this.excelData.forEach((fila, index) => {
      const contieneReferencia = fila.some((celda : any) => celda?.toString().toLowerCase().includes(referencia));
  
      if (contieneReferencia) {
        filasCoincidentes.push(index); 
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
    
          const tipo = fila[5]; 
          const descripcionTipoBien = fila[6]; 
          const domicilioBien = fila[7]; 
    
          return `Fila ${index}: Id. bien: ${bien}, Tipo: ${tipo}, Localidad Registro: ${descripcionTipoBien}, Nº Registro: ${domicilioBien}`;
        });

      
        this.mostrarMensaje(`Coincidencias encontradas:\n${coincidenciasDetalles.join('\n')}`);
    }
  
  }

  generarEncargo() {
    if (this.selectedRowIndex !== null) {
     
      const filaSeleccionada = this.excelData[this.selectedRowIndex];

      const referenciaCatastral = filaSeleccionada[11];
    
      const idBien = filaSeleccionada[4];

  
      this.procesarGeneracionEncargo(referenciaCatastral, idBien);
    }
  }

  procesarGeneracionEncargo(referenciaCatastral: string, idBien: string) {
    // Crear una nueva instancia de jsPDF
    const doc = new jsPDF();

    // Agregar el encabezado
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Encargo de Inscripción Catastral', 20, 20);

    // Agregar la fecha de emisión
    const fechaEmision = new Date();
    const fechaTexto = `${fechaEmision.getDate()}/${fechaEmision.getMonth() + 1}/${fechaEmision.getFullYear()}`;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Emisión: ${fechaTexto}`, 20, 30);

    // Agregar los datos del encargo
    doc.setFontSize(14);
    doc.text('Datos del Encargo:', 20, 40);

    doc.setFontSize(12);
    doc.text(`Referencia Catastral: ${referenciaCatastral}`, 20, 50);
    doc.text(`Id. Bien: ${idBien}`, 20, 55);

    // Agregar detalles adicionales
    doc.text('Detalles del Encargo:', 20, 70);
    doc.text('El encargo tiene como objetivo proceder con la inscripción catastral del bien.', 20, 80);
    doc.text('El plazo para completar el proceso es de 30 días hábiles a partir de la fecha de emisión.', 20, 85);

    // Agregar la firma
    doc.text('Firma del Responsable:', 20, 100);
    doc.text('____________________________________', 20, 105); // Línea para la firma

    // Agregar un pie de página
    doc.setFontSize(10);
    doc.text('Este documento es confidencial y está destinado exclusivamente para el proceso de inscripción catastral.', 20, 200);

    // Guardar el archivo PDF
    try {
      doc.save(`Encargo_Inscripcion_Catastral_${referenciaCatastral}.pdf`);
      
      // Si todo sale bien, mostrar mensaje de éxito
      this.mensajeVisible = true;
      this.contenidoMensaje = `¡Encargo generado con éxito para la referencia catastral ${referenciaCatastral}!`;
      this.estiloMensaje = { color: 'green' };
    } catch (error) {
      // Si hay un error, mostrar mensaje de error
      this.mensajeVisible = true;
      this.contenidoMensaje = 'Hubo un error al generar el encargo. Intenta nuevamente.';
      this.estiloMensaje = { color: 'red' };
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
