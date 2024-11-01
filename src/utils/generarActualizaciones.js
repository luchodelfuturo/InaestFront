import { saveAs } from 'file-saver';
import { convertirProvincia, convertirTipoDocumento, convertirEstadoDeuda, convertirTipoCartera, convertirEstadoINAES } from './tablasConvergencia'; // Asegúrate de tener estas funciones
import {
    truncarMiles
} from './procesamiento'; // Ajusta la ruta según la ubicación real


// Función para generar el archivo de actualizaciones
export const generarArchivoActualizaciones = (data) => {

    let contenido = generarContenidoActualizaciones(data);



    // Crear un blob con el contenido del archivo y descargarlo con el nombre "actualizaciones.txt"
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizaciones.txt');


    console.log("Archivo TXT de actualizaciones generado y listo para descarga.");
};

// Función para generar el contenido de las actualizaciones en formato requerido
const generarContenidoActualizaciones = (data) => {
    let contenido = '';

    data.forEach(row => {
        // Verificar si "CUOTAS ABONADAS" es igual a "PLAN DE CUOTAS"
        const esDeudaFinalizada = row['CUOTAS ABONADAS'] === row['PLAN DE CUOTAS'];
        
        // Definir valores para REG-ESTADO, REG-ESTADO-INAES, y REG-SALDO-TOTAL
        const estadoInterno = esDeudaFinalizada ? 'F' : '1'; // "F" para finalización, "1" para normal
        const estadoINAES = '1'; // Siempre "1" según normativa INAES
        const saldoTotal = esDeudaFinalizada ? 0 : truncarMiles(row['SALDO DE DEUDA'] || 0);

        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}`
            + `${convertirTipoDocumento(row['TIPO DOC'] || '').padStart(3, ' ')}`
            + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`
            + `${''.padStart(16, ' ')}` // SIN USO (BLANCOS)
            + `0`.padStart(3, ' ') // REG-DIAS-ATRASO
            + `${convertirTipoCartera(row['Tipo de Cartera'] || '').padStart(2, ' ')}`
            + `${estadoInterno.padStart(1, ' ')}` // REG-ESTADO (Condicional)
            + `${estadoINAES.padStart(1, ' ')}` // REG-ESTADO-INAES (Siempre "1")
            + `${truncarMiles(row['IMPORTE CUOTA'] || 0).toString().padStart(9, ' ')}`
            + `${saldoTotal.toString().padStart(9, ' ')}` // REG-SALDO-TOTAL (Condicional)
            + `0`.padStart(9, ' ') // REG-SALDO-VENCIDO siempre 0
            + `${''.padStart(2, ' ')}` // REG-RETORNO
            + `${(row['Fecha Informacion'] || '').toString().padStart(6, ' ')}`
            + `${''.padStart(208, ' ')}\r\n`; // SIN USO (BLANCOS)
        
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
        + `${''.padStart(2, ' ')}`             // HDR-RETORNO
        + `${''.padStart(8, ' ')}`             // SIN USO (BLANCOS)
        + `M`                                  // HDR-ARCHIVO
        + `${FECHA_GRABACION.padStart(8, ' ')}`
        + `${HORA_GRABACION.padStart(6, ' ')}`
        + `${''.padStart(250, ' ')}\r\n`;      // SIN USO (BLANCOS)

    return header;
};


// Función para generar el tráiler de las actualizaciones
export const generarTrailerActualizaciones = (cantidadRegistros, sumatoriaSaldoTotal) => {
    const CUIT_ENTIDAD = "30622242644"; // CUIT de la entidad
    const TIPO_REG = "TT";              // Constante "TT" para el tráiler

    let trailer = `${CUIT_ENTIDAD.padStart(11, ' ')}`
        + `${TIPO_REG.padStart(2, ' ')}`
        + `${''.padStart(17, ' ')}`                     // SIN USO (BLANCOS)
        + `${cantidadRegistros.toString().padStart(10, ' ')}` // TRL-CANT-REGISTROS
        + `${sumatoriaSaldoTotal.toString().padStart(18, ' ')}` // TRL-SUMATORIA-SALDO-TOTAL
        + `${''.padStart(242, ' ')}\r\n`;               // SIN USO (BLANCOS)

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
    const sumatoriaSaldoTotal = data.reduce((acc, row) => acc + (truncarMiles(row['SALDO DE DEUDA']) || 0), 0);

    // Generar el tráiler
    contenido += generarTrailerActualizaciones(data.length, sumatoriaSaldoTotal);

    // Crear el archivo TXT y descargarlo
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizacion.txt');

    console.log("Archivo TXT de actualizaciones completo generado y listo para descarga.");
};
