import { saveAs } from 'file-saver';
import { convertirProvincia, convertirTipoDocumento, convertirEstadoDeuda, convertirTipoCartera, convertirEstadoINAES } from './tablasConvergencia'; // Asegúrate de tener estas funciones
import {
    truncarMiles
} from './procesamiento'; // Ajusta la ruta según la ubicación real



function obtenerFechaUltimoDia(periodo) {
    const anio = parseInt(periodo.slice(0, 4), 10);
    const mes = parseInt(periodo.slice(4, 6), 10);

    // Crear la fecha para el último día del mes
    const ultimoDia = new Date(anio, mes, 0).getDate();
    
    // Retornar en formato AAAAMMDD
    return `${anio}${String(mes).padStart(2, '0')}${String(ultimoDia).padStart(2, '0')}`;
}



// Función para generar el archivo de actualizaciones
export const generarArchivoActualizaciones = (data) => {

    let contenido = generarContenidoActualizaciones(data);



    // Crear un blob con el contenido del archivo y descargarlo con el nombre "actualizaciones.txt"
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizaciones.txt');


    console.log("Archivo TXT de actualizaciones generado y listo para descarga.");
};

// Función para generar el contenido de las actualizaciones en formato requerido
const generarContenidoActualizaciones = (data, periodoInformacion) => {
    let contenido = '';

    data.forEach(row => {
        // Determina el estado interno basado en la condición de finalización
        const estadoInterno = parseInt(row['CUOTAS ABONADAS']) === parseInt(row['PLAN DE CUOTAS']) ? 'F' : '1';

        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}`
            + `DNI`.padStart(3, ' ') // Tipo de documento por defecto en este caso
            + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`
            + `${''.padStart(16, ' ')}`
            + `0`.padStart(3, ' ') // REG-DIAS-ATRASO
            + `NI`.padStart(2, ' ') // Tipo de cartera (fijo como "NI")
            + `${estadoInterno.padStart(1, ' ')}` // Estado interno, condicional
            + `1`.padStart(1, ' ') // Estado INAES siempre 1
            + `${(row['IMPORTE CUOTA'] || 0).toString().padStart(9, ' ')}`
            + `${(row['SALDO DE DEUDA'] || 0).toString().padStart(9, ' ')}`
            + `0`.padStart(9, ' ') // Saldo vencido siempre 0
            + `${''.padStart(2, ' ')}`
            + `${periodoInformacion.padStart(6, ' ')}` // REG-FECHA-INFORMACION en formato AAAAMM
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
export const generarArchivoActualizacionesCompleto = (data, periodoInformacion) => {
    let contenido = '';

    // Generar el header
    contenido += generarHeaderActualizaciones();

    // Generar los registros de actualizaciones
    contenido += generarContenidoActualizaciones(data, periodoInformacion);

    // Sumar el saldo total para el tráiler
    const sumatoriaSaldoTotal = data.reduce((acc, row) => acc + ((row['SALDO DE DEUDA']) || 0), 0);

    // Generar el tráiler
    contenido += generarTrailerActualizaciones(data.length, sumatoriaSaldoTotal);

    // Crear el archivo TXT y descargarlo
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizacion.txt');

    console.log("Archivo TXT de actualizaciones completo generado y listo para descarga.");
};