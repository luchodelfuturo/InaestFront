import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import "./App.css"

function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el loader
    const [statusMessage, setStatusMessage] = useState(''); // Estado para mostrar el estado

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
        setStatusMessage(''); // Limpiar el mensaje de estado
    };

    const procesarArchivos = (sociosData, prestamosData) => {
        console.log("Procesando archivos...");
        const sociosMap = sociosData.reduce((map, socio) => {
            map[socio['LEGAJO BBVA']] = socio;
            return map;
        }, {});

        const mergedData = prestamosData.map(prestamo => {
            const socio = sociosMap[prestamo['LEGAJO']] || {};
            return { ...prestamo, ...socio };
        });

        console.log("Archivos procesados con éxito");
        return mergedData;
    };

    const generarArchivoTxt = (data) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true); // Mostrar el loader
        setStatusMessage("Procesando archivos...");

        try {
            const sociosReader = new FileReader();
            const prestamosReader = new FileReader();

            sociosReader.onload = (e) => {
                console.log("Leyendo archivo de socios...");
                const sociosWorkbook = XLSX.read(e.target.result, { type: 'binary' });
                const sociosSheet = sociosWorkbook.Sheets[sociosWorkbook.SheetNames[0]];
                const sociosData = XLSX.utils.sheet_to_json(sociosSheet);

                prestamosReader.onload = (e) => {
                    console.log("Leyendo archivo de préstamos...");
                    const prestamosWorkbook = XLSX.read(e.target.result, { type: 'binary' });
                    const prestamosSheet = prestamosWorkbook.Sheets[prestamosWorkbook.SheetNames[0]];
                    const prestamosData = XLSX.utils.sheet_to_json(prestamosSheet, { range: 4 });

                    // Procesar los archivos
                    const mergedData = procesarArchivos(sociosData, prestamosData);
                    generarArchivoTxt(mergedData); // Generar y descargar el archivo

                    setIsProcessing(false); // Ocultar el loader
                    setStatusMessage("Archivos procesados correctamente.");
                };
                prestamosReader.readAsBinaryString(prestamosFile);
            };
            sociosReader.readAsBinaryString(sociosFile);
        } catch (error) {
            console.error("Error durante el procesamiento:", error);
            setIsProcessing(false);
            setStatusMessage("Ocurrió un error al procesar los archivos.");
        }
    };

    return (
        <div className="App">
            <h1>Cargar Planillas</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Planilla de Socios:</label>
                    <input type="file" onChange={(e) => handleFileChange(e, setSociosFile)} required />
                </div>
                <div>
                    <label>Planilla de Préstamos:</label>
                    <input type="file" onChange={(e) => handleFileChange(e, setPrestamosFile)} required />
                </div>
                <button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Procesando..." : "Subir y Procesar"}
                </button>
            </form>

            {isProcessing && <p>Procesando archivos, por favor espera...</p>}

            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
}

export default App;