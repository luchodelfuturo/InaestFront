import { saveAs } from 'file-saver';
import { convertirProvincia, convertirTipoDocumento, convertirEstadoDeuda, convertirTipoCartera, convertirEstadoINAES } from './tablasConvergencia'; // Asegúrate de tener estas funciones

// Función para generar el archivo de actualizaciones
export const generarArchivoActualizaciones = (data) => {
    let contenido = generarContenidoActualizaciones(data);

    // Crear un blob con el contenido del archivo y descargarlo con file-saver
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizaciones.txt');

    console.log("Archivo TXT de actualizaciones generado y listo para descarga.");
};

// Función para generar el contenido de las actualizaciones en formato requerido
const generarContenidoActualizaciones = (data) => {
    let contenido = '';

    data.forEach(row => {
        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}`        // REG-CUIT-REPORTADO
            + `${convertirTipoDocumento(row['TIPO DOC'] || '').padStart(3, ' ')}`          // REG-TIPO-DOCUMENTO (Convierto el tipo de documento según la tabla)
            + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`                     // REG-NRO-DOCUMENTO
            + `${''.padStart(16, ' ')}`                                                   // SIN USO (BLANCOS)
            + `0`.padStart(3, ' ')                                                        // REG-DIAS-ATRASO (Siempre será "0")
            + `${convertirTipoCartera(row['Tipo de Cartera'] || '').padStart(2, ' ')}`    // REG-TIPO (Convierto el tipo de cartera)
            + `1`.padStart(1, ' ')                                                        // REG-ESTADO (Siempre será "1" - Normal)
            + `1`.padStart(1, ' ')                                                        // REG-ESTADO-INAES (Siempre será "1")
            + `${(row['Compromiso Corriente'] || '').toString().padStart(9, ' ')}`        // REG-COMPROMISO-CORRIENTE
            + `${(row['Saldo Total'] || '').toString().padStart(9, ' ')}`                 // REG-SALDO-TOTAL
            + `${(row['Saldo Vencido'] || '').toString().padStart(9, ' ')}`               // REG-SALDO-VENCIDO
            + `${''.padStart(2, ' ')}`                                                    // REG-RETORNO
            + `${(row['Fecha Informacion'] || '').toString().padStart(6, ' ')}`           // REG-FECHA-INFORMACION
            + `${''.padStart(208, ' ')}\r\n`;                                             // SIN USO (BLANCOS)
        
        contenido += linea;
    });

    return contenido;
};

// Función para generar el header de las actualizaciones
export const generarHeaderActualizaciones = () => {
    const CUIT_ENTIDAD = "30622242644"; // CUIT de la entidad
    const TIPO_REG = "HH";              // Tipo de registro
    const MATRICULA = "000000816";       // Matrícula
    const PROVINCIA = "C";               // Código de provincia (ver tabla)
    const GRADO = "MM";                  // Grado para mutuales
    const FECHA_GRABACION = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Formato AAAAMMDD
    const HORA_GRABACION = new Date().toTimeString().slice(0, 8).replace(/:/g, '');  // Formato HHMMSS

    let header = `${CUIT_ENTIDAD.padStart(11, ' ')}` 
        + `${TIPO_REG.padStart(2, ' ')}` 
        + `${MATRICULA.padStart(9, ' ')}` 
        + `${PROVINCIA.padStart(1, ' ')}` 
        + `${GRADO.padStart(2, ' ')}` 
        + `${'  '.padStart(2, ' ')}`  // Espacio para HDR-RETORNO
        + `${''.padStart(8, ' ')}`    // Espacio sin uso
        + `${'M'.padStart(1, ' ')}`   // Constante "M" para actualizaciones
        + `${FECHA_GRABACION.padStart(8, ' ')}` 
        + `${HORA_GRABACION.padStart(6, ' ')}` 
        + `${''.padStart(250, ' ')}\r\n`;

    return header;
};

// Función para generar el tráiler de las actualizaciones
export const generarTrailerActualizaciones = (cantidadRegistros, sumatoriaSaldoTotal) => {
    const CUIT_ENTIDAD = "30622242644"; // CUIT de la entidad
    const TIPO_REG = "TT";              // Constante "TT" para el tráiler

    let trailer = `${CUIT_ENTIDAD.padStart(11, ' ')}` 
        + `${TIPO_REG.padStart(2, ' ')}` 
        + `${''.padStart(17, ' ')}`     // Espacio sin uso
        + `${cantidadRegistros.toString().padStart(10, ' ')}` // Cantidad de registros
        + `${sumatoriaSaldoTotal.toString().padStart(18, ' ')}` // Sumatoria de saldos
        + `${''.padStart(242, ' ')}\r\n`;

    return trailer;
};

// Función principal para generar todo el archivo de actualizaciones con header, registros y trailer
export const generarArchivoActualizacionesCompleto = (data) => {
    let contenido = '';

    // Generar el header
    contenido += generarHeaderActualizaciones();

    // Generar los registros
    contenido += generarContenidoActualizaciones(data);

    // Sumar el saldo total para el tráiler
    const sumatoriaSaldoTotal = data.reduce((acc, row) => acc + (parseInt(row['Saldo Total']) || 0), 0);

    // Generar el tráiler
    contenido += generarTrailerActualizaciones(data.length, sumatoriaSaldoTotal);

    // Crear el archivo TXT y descargarlo
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizacion_deudores_completo.txt');

    console.log("Archivo TXT de actualizaciones completo generado y listo para descarga.");
};
