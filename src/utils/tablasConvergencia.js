// Función de conversión para provincias
export const convertirProvincia = (provincia) => {
    const provincias = {
        'SALTA': 'A',
        'BUENOS AIRES': 'B',
        'CABA': 'C',
        'SAN LUIS': 'D',
        'ENTRE RIOS': 'E',
        'LA RIOJA': 'F',
        'SANTIAGO DEL ESTERO': 'G',
        'CHACO': 'H',
        'SIN PROVINCIA': 'I',
        'SAN JUAN': 'J',
        'CATAMARCA': 'K',
        'LA PAMPA': 'L',
        'MENDOZA': 'M',
        'MISIONES': 'N',
        'FORMOSA': 'P',
        'NEUQUEN': 'Q',
        'RIO NEGRO': 'R',
        'SANTA FE': 'S',
        'TUCUMAN': 'T',
        'CHUBUT': 'U',
        'TIERRA DEL FUEGO': 'V',
        'CORRIENTES': 'W',
        'CORDOBA': 'X',
        'JUJUY': 'Y',
        'SANTA CRUZ': 'Z'
    };
    return provincias[provincia.toUpperCase()] || ' ';
};

// Función de conversión para tipo de sociedad o persona
export const convertirTipoSociedadPersona = (tipoSociedad) => {
    const sociedades = {
        'sociedad': 'S',
        'masculino': 'M',
        'femenino': 'F',
        'no declara': 'I'
    };

    return sociedades[tipoSociedad.toLowerCase()] || 'I'; // Convertir a minúsculas y asignar 'I' por defecto
};

// Función de conversión para grado
export const convertirGrado = (grado) => {
    const grados = {
        'Cooperativa': 'CO',
        'Federación de cooperativas': 'FC',
        'Confederación de cooperativas': 'CC',
        'Mutual': 'MM',
        'Federación de mutuales': 'FM',
        'Confederación de mutuales': 'CM'
    };
    return grados[grado] || ' ';
};

// Función de conversión para nacionalidad
export const convertirNacionalidad = (nacionalidad) => {
    const nacionalidades = {
        'ARGENTINA': 'A',
        'EXTRANJERO': 'E',
        'DESCONOCIDA': ' '
    };

    // Convertir a minúsculas antes de buscar en el diccionario
    return nacionalidades[nacionalidad.toLowerCase()] || 'A';
};


// Función de conversión para estado de deuda
export const convertirEstadoDeuda = (estado) => {
    const estados = {
        'Normal. Hasta 30 días de atraso': '1',
        'Atraso entre 31 y 60 días': '2',
        'Atraso entre 61 y 90 días': '3',
        'Atraso entre 91 y 120 días': '4',
        'Atraso entre 121 y 180 días': '5',
        'Atraso entre 181 y 360 días': '6',
        'Gestión de Cobranza extrajudicial': 'G',
        'En Juicio': 'J',
        'En Legales o Amparo. NO REPORTAR': 'L',
        'En Legales o Amparo. REPORTAR': 'R',
        'Incobrable': 'I',
        'Finalizada/Sin Deuda': 'F'
    };
    return estados[estado] || ' ';
};

// Función de conversión para estado INAES
export const convertirEstadoInaes = (estado) => {
    const estadosInaes = {
        'Normal: A Vencer o con atraso hasta 30 días': '1',
        'Riesgo Bajo: De 31 a 90 días de atraso': '2',
        'Riesgo Medio: De 91 a 180 días de atraso': '3',
        'Riesgo Alto: De 181 a 365 días de atraso': '4',
        'Irrecuperables: Más de 365 días de atraso': '5'
    };
    return estadosInaes[estado] || ' ';
};

// Función de conversión para tipo de cartera
export const convertirTipoCartera = (tipoCartera) => {
    const carteras = {
        'No Informado': 'NI',
        'Prendario': 'PR',
        'Hipotecario': 'HI',
        'Vivienda': 'VI',
        'Consumo': 'CO'
    };
    return carteras[tipoCartera] || ' ';
};

// Función de conversión para tipo de documento
export const convertirTipoDocumento = (tipoDocumento) => {
    const documentos = {
        'Documento Nacional de Identidad': 'DNI',
        'Libreta de Enrolamiento': 'LEN',
        'Libreta Cívica': 'LCI',
        'Pasaporte': 'PSP'
    };
    return documentos[tipoDocumento] || 'DNI';
};

// Función de conversión para estado civil
export const convertirEstadoCivil = (estadoCivil) => {
    const estadosCiviles = {
        'No declara': ' ',
        'Soltero/a': 'S',
        'Casado/a': 'C',
        'Divorciado/a': 'D',
        'Viudo/a': 'V',
        'Concubino/a': 'J'
    };
    return estadosCiviles[estadoCivil] || ' ';
};
