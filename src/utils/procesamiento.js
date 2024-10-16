
// validaciones
import Swal from 'sweetalert2';


export const validarNombre = (nombre, legajo) => {
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ'\s]+$/; // Permitir letras, apóstrofe y espacios
    // Eliminar caracteres no válidos
    let nombreValidado = nombre.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'\s]/g, '');

    // Verificar si el campo quedó vacío
    if (!nombreValidado.trim()) {
        Swal.fire({
            icon: 'error',
            title: `Error en el LEGAJO ${legajo}`,
            text: `El campo "Apellido y Nombres" en el LEGAJO ${legajo} no puede estar vacío o contiene caracteres no válidos.`,
        });
        return null; // En lugar de lanzar un error, devolvemos `null` o un valor que indique que falló la validación
    }

    return nombreValidado;
};

export const validarDireccion = (valor, legajo, campo) => {
    // Si el valor es null o undefined, lo convertimos a una cadena vacía
    if (valor === null || valor === undefined) {
        valor = '';
    }

    // Asegurarnos de que siempre es una cadena
    valor = String(valor);

    const regex = /^[A-Za-z0-9\s\-]+$/; // Permitir letras, números, espacios y guiones
    // Eliminar caracteres no válidos
    let valorValidado = valor.replace(/[^A-Za-z0-9\s\-]/g, '');

    // Verificar si el campo quedó vacío
    if (!valorValidado.trim()) {
        Swal.fire({
            icon: 'error',
            title: `Error en el LEGAJO ${legajo}`,
            text: `El campo "${campo}" en el LEGAJO ${legajo} no puede estar vacío o contiene caracteres no válidos. Solo se permiten letras, números o guiones.`,
        });
        return null; // Retornar null para indicar que la validación falló
    }

    return valorValidado;
};

export const reemplazarEnie = (texto) => {
    // Si el valor es null o undefined, lo convertimos a una cadena vacía
    if (texto === null || texto === undefined) {
        texto = '';
    }

    // Asegurarnos de que siempre es una cadena
    texto = String(texto);

    // Reemplazar ñ por n
    return texto.replace(/ñ/g, 'n').replace(/Ñ/g, 'N');
};

export const eliminarAcentos = (texto) => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Eliminar diacríticos (acentos y diéresis)
};

const esNumero = (valor) => {
    return !isNaN(valor) && !isNaN(parseFloat(valor)); // Verifica si es un número válido
};

const truncarMiles = (valor) => {
    if (esNumero(valor)) {
        return Math.floor(valor / 1000); // Truncar en miles
    }
    return valor; // Si no es un número, devolver el valor tal cual
};

//asegurarnos de que no contenga acentos, diéresis o 
//caracteres no válidos, excepto los caracteres especiales permitidos como guion (-), barra (/), y el símbolo &.

export const validarContenido = (data) => {
    const camposSaldos = ['CUOTA', 'CUOTA MUTUAL', 'CUOTA SEPTIEMBRE', 'DEUDA', 'IMPORTE', 'TOTAL'];

    return data.map((row) => {
        // Iterar sobre cada campo del objeto (fila de datos)
        for (let key in row) {
            if (row.hasOwnProperty(key)) {
                let valor = row[key];

                // Si el valor es numérico y es uno de los campos de saldos, truncar en miles de pesos
                if (camposSaldos.includes(key) && esNumero(valor)) {
                    row[key] = truncarMiles(valor);
                    continue; // Pasar al siguiente campo
                }

                // Si el valor es numérico y no es un saldo, no hacer nada
                if (esNumero(valor)) {
                    continue; // Saltar la validación para este campo, ya que es numérico
                }

                // Convertir a string si es necesario
                if (valor !== null && valor !== undefined) {
                    valor = String(valor);
                } else {
                    valor = ''; // Si es null o undefined, asignar un valor vacío
                }

                // Reemplazar ñ por n, eliminar acentos y diéresis
                valor = eliminarAcentos(reemplazarEnie(valor));

                // Permitir solo letras, números, espacios, guion, barra y símbolo &
                valor = valor.replace(/[^A-Za-z0-9\s\-\/&]/g, '');

                // Asignar el valor procesado de vuelta al objeto
                row[key] = valor;
            }
        }

        return row; // Retornar la fila validada
    });
};

export const validarCampos = (data) => {
    return data.map((row) => {
        const legajo = row['LEGAJO'] || 'sin legajo'; // Valor del LEGAJO o un valor por defecto si no existe

        // Validación del campo "Apellido y Nombres" (incluyendo reemplazo de ñ por n)
        if (row['Apellido y Nombres']) {
            let nombreSinEnie = reemplazarEnie(row['Apellido y Nombres']); // Reemplazar ñ por n
            const nombreValidado = validarNombre(nombreSinEnie, legajo);
            if (!nombreValidado) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Apellido y Nombres'] = nombreValidado; // Guardar el nombre modificado
        }

        // Validación del campo "Domicilio" (Obligatorio, incluyendo reemplazo de ñ por n)
        if (row['Domicilio']) {
            let domicilioSinEnie = reemplazarEnie(row['Domicilio']); // Reemplazar ñ por n
            const domicilioValidado = validarDireccion(domicilioSinEnie, legajo, 'Domicilio');
            if (!domicilioValidado) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Domicilio'] = domicilioValidado; // Guardar el domicilio modificado
        } else {
            // Mostrar un mensaje si el campo "Domicilio" está vacío
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Domicilio" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "Altura" (Obligatorio, aunque no debería tener ñ, lo consideramos)
        if (row['Altura'] !== undefined && row['Altura'] !== null) {
            let alturaSinEnie = reemplazarEnie(String(row['Altura'])); // Convertir a string y reemplazar ñ por n
            const alturaValidada = validarDireccion(alturaSinEnie, legajo, 'Altura');
            if (!alturaValidada) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Altura'] = alturaValidada; // Guardar la altura modificada
        } else {
            // Mostrar un mensaje si el campo "Altura" está vacío
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Altura" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "CUIT"
        if (!row['NRO. de CUIL'] || String(row['NRO. de CUIL']).trim() === '') {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "CUIT" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null; // Detener el proceso si el campo es obligatorio
        }


        // Validación del campo "TIPO DOC"
        if (!row['TIPO DOC'] || row['TIPO DOC'].trim() === '') {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Tipo de Documento" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null; // Detener el proceso si el campo es obligatorio
        }

        // Validación del campo "NUMERO" (Número de documento)
        if (!row['NUMERO'] || String(row['NUMERO']).trim() === '') {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Número de Documento" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null; // Detener el proceso si el campo es obligatorio
        }

        return row;
    });
};

export const procesarArchivos = (sociosData, prestamosData) => {

    console.log("Procesando archivos...");
    console.log("prestamos data ", prestamosData);

    const sociosMap = sociosData.reduce((map, socio) => {
        map[socio['LEGAJO BBVA']] = socio;
        return map;
    }, {});

    const mergedData = prestamosData.map(prestamo => {
        const socio = sociosMap[prestamo['LEGAJO']] || {};
        return { ...prestamo, ...socio };
    });

    console.log(mergedData);

    // Validar los datos procesados
    const datosValidados = validarCampos(mergedData);

    if (!datosValidados) {
        console.log("Error durante la validación de campos");
        return null; // Detener si la validación de campos falla
    }

    // Aplicar la validación de contenido a los datos procesados
    const datosProcesados = validarContenido(datosValidados);

    console.log("Archivos procesados con éxito");
    return datosProcesados;
};

