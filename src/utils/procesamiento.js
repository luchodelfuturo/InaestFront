
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
        const legajo = row['NRO LEGAJO'] || 'sin legajo'; // Valor del LEGAJO o un valor por defecto si no existe

        try {
            // Validación del campo "Apellido y Nombres" (incluyendo reemplazo de ñ por n)
            if (row['Apellido y Nombres']) {
                let nombreSinEnie = reemplazarEnie(String(row['Apellido y Nombres'])); // Convertir a string y reemplazar ñ por n
                const nombreValidado = validarNombre(nombreSinEnie, legajo);
                if (!nombreValidado) {
                    console.warn(`Error en la validación de nombre para LEGAJO ${legajo}`);
                    return null; // Omitir registro si falla la validación
                }
                row['Apellido y Nombres'] = nombreValidado;
            }

            // Validación del campo "Domicilio" (Obligatorio)
            if (row['Domicilio']) {
                let domicilioSinEnie = reemplazarEnie(String(row['Domicilio'])); // Convertir a string y reemplazar ñ por n
                const domicilioValidado = validarDireccion(domicilioSinEnie, legajo, 'Domicilio');
                if (!domicilioValidado) {
                    console.warn(`Error en la validación de domicilio para LEGAJO ${legajo}`);
                    return null;
                }
                row['Domicilio'] = domicilioValidado;
            } else {
                row['Domicilio'] = '-'; // Completar con "-" si está vacío
            }

            // Validación del campo "Altura" (Obligatorio)
            if (row['Altura'] !== undefined && row['Altura'] !== null) {
                let alturaValidada = validarDireccion(String(row['Altura']), legajo, 'Altura'); // Convertir a string
                if (!alturaValidada) {
                    console.warn(`Error en la validación de altura para LEGAJO ${legajo}`);
                    return null;
                }
                row['Altura'] = alturaValidada;
            } else {
                row['Altura'] = '-'; // Completar con "-" si está vacío
            }

            // Validación del campo "Piso" (Opcional)
            const pisoValor = row['Piso'] !== undefined && row['Piso'] !== null ? String(row['Piso']).trim() : '-';
            row['Piso'] = pisoValor ? validarDireccion(pisoValor, legajo, 'Piso') : '-'; // Validar contenido o asignar "-"

            return row;
        } catch (error) {
            console.error(`Error procesando LEGAJO ${legajo}:`, error);
            return null;
        }
    }).filter(row => row !== null); // Filtrar cualquier fila que devuelva null
};

export const clasificarRegistros = (data) => {

    console.log("data en clasificar " , data)
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

export const procesarArchivos = (sociosData, prestamosData) => {
    console.log("Procesando archivos...");

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



