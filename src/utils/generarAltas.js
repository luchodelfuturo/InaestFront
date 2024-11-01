import { saveAs } from 'file-saver';

import { convertirProvincia, convertirTipoDocumento, convertirTipoSociedadPersona, convertirEstadoCivil, convertirNacionalidad } from './tablasConvergencia.js'; // Asegúrate de tener estas funciones


// Función para generar el archivo de altas
export const generarArchivoAltas = (data) => {
    // Generar el contenido de las altas
    let contenido = generarContenidoAltas(data);


// Crear un blob con el contenido del archivo y descargarlo con el nombre "altas.txt"
const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
saveAs(blob, 'altas.txt');

    console.log("Archivo TXT de altas generado y listo para descarga.");
};

// Función para generar el contenido de las altas en formato requerido
const generarContenidoAltas = (data) => {
    let contenido = '';

    data.forEach(row => {
        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}` // REG-CUIT-REPORTADO
            + `${convertirTipoDocumento(row['TIPO DOC'] || '').padStart(3, ' ')}`    // REG-TIPO-DOCUMENTO (Convierto el tipo de documento según la tabla)
            + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`               // REG-NRO-DOCUMENTO
            + `${''.padStart(16, ' ')}`                                             // SIN USO (BLANCOS)
            + `${(row['Apellido y Nombres'] || '').toString().padStart(70, ' ')}`   // REG-APELLIDO-Y-NOMBRE
            + `${(row['FECHA NACIMIENTO'] || '').toString().padStart(8, ' ')}`      // REG-FECHA-NACIMIENTO (Formato AAAAMMDD)
            + `${''.padStart(1, ' ')}`                                              // SIN USO (BLANCOS)
            + `${convertirTipoSociedadPersona(row['TIPO_SOCIEDAD_PERSONA'] || '').padStart(1, ' ')}` // REG-TIPO-SOCIEDAD-PERSONA (Utilizamos la tabla para convertir)
            + `${convertirEstadoCivil(row['EST_CIVIL'] || '').padStart(1, ' ')}`    // REG-EST-CIVIL (Conversión desde la tabla de estado civil)
            + `${(row['Domicilio'] || '').toString().padStart(40, ' ')}`            // REG-DIRECCION
            + `${(row['LOCALIDAD'] || '').toString().padStart(20, ' ')}`            // REG-LOCALIDAD
            + `${convertirProvincia(row['PROVINCIA'] || '').padStart(1, ' ')}`      // REG-PROVINCIA (Convierto la provincia según tabla)
            + `${(row['CODIGO POSTAL'] || '').toString().padStart(8, ' ')}`         // REG-COD-POSTAL
            + `${(row['TELEFONO_FIJO'] || '').toString().padStart(14, ' ')}`        // REG-TELEFONO-FIJO
            + `${(row['Celulares'] || '').toString().padStart(14, ' ')}`     // REG-TELEFONO-CELULAR
            + `${convertirNacionalidad(row['NACIONALIDAD'] || '').padStart(1, ' ')}`// REG-NACIONALIDAD (Usar la función de la tabla de nacionalidades)
            + `${''.padStart(2, ' ')}`                                              // REG-RETORNO
            + `${''.padStart(69, ' ')}\r\n`;                                        // SIN USO (BLANCOS)

        contenido += linea;
    });

    return contenido;
};

// Función para generar el header de las altas
export const generarHeaderAltas = () => {
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
        + `${'A'.padStart(1, ' ')}`   // Constante "A" para altas
        + `${FECHA_GRABACION.padStart(8, ' ')}`
        + `${HORA_GRABACION.padStart(6, ' ')}`
        + `${''.padStart(250, ' ')}\r\n`;

    return header;
};

// Función para generar el tráiler de las altas
export const generarTrailerAltas = (cantidadRegistros) => {
    const CUIT_ENTIDAD = "30622242644"; // CUIT de la entidad
    const TIPO_REG = "TT";              // Constante "TT" para el tráiler

    let trailer = `${CUIT_ENTIDAD.padStart(11, ' ')}`
        + `${TIPO_REG.padStart(2, ' ')}`
        + `${''.padStart(20, ' ')}`     // Espacio sin uso
        + `${cantidadRegistros.toString().padStart(10, ' ')}` // Cantidad de registros
        + `${''.padStart(257, ' ')}\r\n`;

    return trailer;
};

// Función principal para generar todo el archivo de altas con header, registros y trailer
export const generarArchivoAltasCompleto = (data) => {
    let contenido = '';

    // Generar el header
    contenido += generarHeaderAltas();

    // Generar los registros
    contenido += generarContenidoAltas(data);

    // Generar el tráiler
    contenido += generarTrailerAltas(data.length);

    // Crear el archivo TXT y descargarlo
    const blob = new Blob([contenido], { type: 'text/plain;charset=ascii' });
    saveAs(blob, 'alta.txt');

    console.log("Archivo TXT de altas completo generado y listo para descarga.");
};
