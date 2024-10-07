import { saveAs } from 'file-saver';



export const generarArchivoTxt = (data) => {
    let contenido = '';

    data.forEach(row => {
        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}`
            + `${(row['TIPO DOC'] || '').toString().padStart(3, ' ')}`
            + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`
            + `${(row['Apellido y Nombres'] || '').toString().padStart(70, ' ')}`
            + `${(row['Fecha Ing Mutal'] || '').toString().padStart(8, ' ')}`
            + `${(row['Sexo'] || '').toString().padStart(1, ' ')}`
            + `${(row['ESTADO DE PMOS '] || '').toString().padStart(1, ' ')}`
            + `${(row['Domicilio'] || '').toString().padStart(40, ' ')}`
            + `${(row['LOCALIDAD'] || '').toString().padStart(20, ' ')}`
            + `${(row['PROVINCIA.'] || '').toString().padStart(1, ' ')}`
            + `${(row['CODIGO POSTAL'] || '').toString().padStart(8, ' ')}`
            + `${(row['TELEFONO_FIJO'] || '').toString().padStart(14, ' ')}`
            + `${(row['TELEFONO_CELULAR'] || '').toString().padStart(14, ' ')}`
            + `${(row['NACIONALIDAD'] || '').toString().padStart(1, ' ')}`
            + `${(row['RETORNO'] || '').toString().padStart(2, ' ')}`
            + `${''.padStart(69, ' ')}\r\n`;
        contenido += linea;
    });

    console.log("Generando archivo TXT...");
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'alta_deudores.txt');
    console.log("Archivo TXT generado y listo para descarga.");
};
