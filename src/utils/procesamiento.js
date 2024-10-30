
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

export const truncarMiles = (valor) => {
    const numero = parseFloat(valor);
    if (!isNaN(numero)) {
        return Math.floor(numero / 1000); // Trunca a miles de pesos
    }
    return 0; // Retorna 0 si no es un número válido
};


//asegurarnos de que no contenga acentos, diéresis o 
//caracteres no válidos, excepto los caracteres especiales permitidos como guion (-), barra (/), y el símbolo &.

export const validarContenido = (data) => {
    const camposSaldos = [
        'IMPORTE CUOTA', 
        'MONTO ACORDADO', 
        'AMORT DE CAPITAL', 
        'SALDO TOTAL', 
        'SALDO VENCIDO', 
        'SALDO DE DEUDA'
    ];

    return data.map((row) => {
        for (let key in row) {
            if (row.hasOwnProperty(key)) {
                let valor = row[key];

                // Truncar en miles de pesos si es un campo de saldo
                if (camposSaldos.includes(key) && esNumero(valor)) {
                    row[key] = truncarMiles(valor);
                    continue;
                }

                // Si es numérico y no es saldo, continuar
                if (esNumero(valor)) {
                    continue;
                }

                // Convertir a string, reemplazar ñ y eliminar acentos
                valor = valor ? String(valor) : '';
                valor = eliminarAcentos(reemplazarEnie(valor));

                // Permitir solo caracteres válidos
                valor = valor.replace(/[^A-Za-z0-9\s\-\/&]/g, '');
                row[key] = valor;
            }
        }
        return row;
    });
};


export const validarCampos = (data) => {
    return data.map((row) => {
        const legajo = row['NRO LEGAJO'] || 'sin legajo'; // Ajuste aquí para el nuevo nombre

        // Validación del campo "APELLIDO Y NOMBRE"
        if (row['APELLIDO Y NOMBRE']) {
            let nombreSinEnie = reemplazarEnie(row['APELLIDO Y NOMBRE']); // Ajuste para el nuevo nombre
            const nombreValidado = validarNombre(nombreSinEnie, legajo);
            if (!nombreValidado) {
                return null; // Si la validación falla, detener el proceso
            }
            row['APELLIDO Y NOMBRE'] = nombreValidado; // Guardar el nombre modificado
        }

        // Validación del campo "Domicilio" (Obligatorio)
        if (row['Domicilio']) {
            let domicilioSinEnie = reemplazarEnie(row['Domicilio']);
            const domicilioValidado = validarDireccion(domicilioSinEnie, legajo, 'Domicilio');
            if (!domicilioValidado) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Domicilio'] = domicilioValidado;
        } else {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Domicilio" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "Altura" (Obligatorio)
        if (row['Altura'] !== undefined && row['Altura'] !== null) {
            let alturaSinEnie = reemplazarEnie(String(row['Altura']));
            const alturaValidada = validarDireccion(alturaSinEnie, legajo, 'Altura');
            if (!alturaValidada) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Altura'] = alturaValidada;
        } else {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Altura" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "NRO. de CUIL"
        if (!row['NRO. de CUIL'] || String(row['NRO. de CUIL']).trim() === '') {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "NRO. de CUIL" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "TIPO DOC"
        if (!row['TIPO DOC'] || row['TIPO DOC'].trim() === '') {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "TIPO DOC" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "NUMERO" (Número de documento)
        if (!row['NUMERO'] || String(row['NUMERO']).trim() === '') {
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "NUMERO" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        return row;
    });
};


export const procesarArchivos = (sociosData, prestamosData) => {
    console.log("Procesando archivos...");
    console.log("prestamos data ", prestamosData);

    // Crear un mapa de socios usando `LEGAJO BBVA` convertido a cadena
    const sociosMap = sociosData.reduce((map, socio) => {
        const legajoBBVA = String(socio['LEGAJO BBVA']);
        map[legajoBBVA] = socio;
        return map;
    }, {});

    // Combinar los datos de préstamos con los datos de socios usando `NRO LEGAJO` convertido a cadena
    const mergedData = prestamosData.map(prestamo => {
        const nroLegajo = String(prestamo['NRO LEGAJO']);
        const socio = sociosMap[nroLegajo] || {};
        return { ...prestamo, ...socio };
    });

    console.log("merged data", mergedData);

    // Validar los datos procesados
    const datosValidados = validarCampos(mergedData);

    if (!datosValidados || datosValidados.includes(null)) {
        console.log("Error durante la validación de campos");
        return null; // Detener si la validación de campos falla
    }

    // Aplicar la validación de contenido a los datos procesados
    const datosProcesados = validarContenido(datosValidados);

    console.log("Archivos procesados con éxito");
    return datosProcesados;
};


export const clasificarRegistros = (data) => {
    const altas = [];
    const actualizaciones = [];

    data.forEach(row => {
        const cuotasAbonadas = parseInt(row['CUOTAS ABONADAS'], 10); // Convertir a entero

        if (cuotasAbonadas === 0 || cuotasAbonadas === 1) {
            altas.push(row); // Clasificar como alta
        } else if (cuotasAbonadas > 1) {
            actualizaciones.push(row); // Clasificar como actualización
        }
    });

    return { altas, actualizaciones };
};



