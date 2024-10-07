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

export const validarCampos = (data) => {
    return data.map((row) => {
        const legajo = row['LEGAJO'] || 'sin legajo'; // Valor del LEGAJO o un valor por defecto si no existe

        // Validación del campo "Apellido y Nombres"
        if (row['Apellido y Nombres']) {
            const nombreValidado = validarNombre(row['Apellido y Nombres'], legajo);
            if (!nombreValidado) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Apellido y Nombres'] = nombreValidado;
        }

        // Validación del campo "Domicilio" (Obligatorio)
        if (row['Domicilio']) {
            const domicilioValidado = validarDireccion(row['Domicilio'], legajo, 'Domicilio');
            if (!domicilioValidado) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Domicilio'] = domicilioValidado;
        } else {
            // Mostrar un mensaje si el campo "Domicilio" está vacío
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Domicilio" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Validación del campo "Altura" (Obligatorio)
        if (row['Altura'] !== undefined && row['Altura'] !== null) {
            // Convertir "Altura" a cadena si es un número
            const alturaValidada = validarDireccion(String(row['Altura']), legajo, 'Altura');
            if (!alturaValidada) {
                return null; // Si la validación falla, detener el proceso
            }
            row['Altura'] = alturaValidada;
        } else {
            // Mostrar un mensaje si el campo "Altura" está vacío
            Swal.fire({
                icon: 'error',
                title: `Error en el LEGAJO ${legajo}`,
                text: `El campo "Altura" en el LEGAJO ${legajo} es obligatorio.`,
            });
            return null;
        }

        // Continuar con otras validaciones...

        return row;
    });
};

export const procesarArchivos = (sociosData, prestamosData) => {
    console.log("Procesando archivos...");
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


    console.log("Archivos procesados con éxito");
    return datosValidados;
};
