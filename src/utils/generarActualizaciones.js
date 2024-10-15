import { saveAs } from 'file-saver';

// Función para generar el archivo de actualizaciones
export const generarArchivoActualizaciones = (data) => {
    let contenido = generarContenidoActualizaciones(data);

    // Crear un blob con el contenido del archivo y descargarlo con file-saver
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'actualizacion_deudores.txt');

    console.log("Archivo TXT de actualizaciones generado y listo para descarga.");
};

// Función para generar el contenido de las actualizaciones en formato requerido
const generarContenidoActualizaciones = (data) => {
    let contenido = '';

    data.forEach(row => {
        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}`
            + `${(row['TIPO DOC'] || '').toString().padStart(3, ' ')}`
            + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`
            + `${''.padStart(16, ' ')}`
            + `${(row['Dias de Atraso'] || '').toString().padStart(3, ' ')}`
            + `${(row['Tipo de Cartera'] || '').toString().padStart(2, ' ')}`
            + `${(row['Estado Deuda'] || '').toString().padStart(1, ' ')}`
            + `${(row['Estado INAES'] || '').toString().padStart(1, ' ')}`
            + `${(row['Compromiso Corriente'] || '').toString().padStart(9, ' ')}`
            + `${(row['Saldo Total'] || '').toString().padStart(9, ' ')}`
            + `${(row['Saldo Vencido'] || '').toString().padStart(9, ' ')}`
            + `${(row['Retorno'] || '').toString().padStart(2, ' ')}`
            + `${(row['Fecha Informacion'] || '').toString().padStart(6, ' ')}`
            + `${''.padStart(208, ' ')}\r\n`;
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
