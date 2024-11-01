import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import "./App.css"
import {
    procesarArchivos,
    clasificarRegistros
} from './utils/procesamiento'; // Ajusta la ruta según la ubicación real


// Asegúrate de importar generarArchivoTxt si está en otro archivo
import { generarArchivoAltasCompleto } from './utils/generarAltas'; // Importar la función si está en un archivo separado
import { generarArchivoActualizacionesCompleto } from './utils/generarActualizaciones'; // Ajusta la ruta si es necesario


function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el loader
    const [statusMessage, setStatusMessage] = useState(''); // Estado para mostrar el estado

    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];
        if (file && file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            setStatusMessage("Por favor, selecciona un archivo Excel válido.");
            return;
        }
        setFile(file);
        setStatusMessage(''); // Limpiar el mensaje de estado
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true); // Mostrar el loader
        setStatusMessage("Leyendo archivo de socios...");

        try {
            const sociosReader = new FileReader();
            const prestamosReader = new FileReader();

            sociosReader.onload = (e) => {
                console.log("Leyendo archivo de socios...");
                const arrayBuffer = e.target.result;
                const sociosWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sociosSheet = sociosWorkbook.Sheets[sociosWorkbook.SheetNames[0]];
                const sociosData = XLSX.utils.sheet_to_json(sociosSheet);

                // Filtrar filas no deseadas
           

                setStatusMessage("Leyendo archivo de préstamos...");

                prestamosReader.onload = (e) => {
                    console.log("Leyendo archivo de préstamos...");
                    const arrayBuffer = e.target.result;
                    const prestamosWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const prestamosSheet = prestamosWorkbook.Sheets[prestamosWorkbook.SheetNames[0]];
                    const prestamosData = XLSX.utils.sheet_to_json(prestamosSheet, { range: 4 });

                    const prestamosDataFiltrado = prestamosData.filter(row => row.hasOwnProperty('NRO LEGAJO') && row['NRO LEGAJO']);

                    // Procesar los archivos
                    setStatusMessage("Procesando archivos...");
                    const mergedData = procesarArchivos(sociosData, prestamosDataFiltrado);

                    // Clasificar registros en altas y actualizaciones según "CUOTAS ABONADAS"
                    const { altas, actualizaciones } = clasificarRegistros(mergedData);



                    // Generar el archivo de altas completo
                    generarArchivoAltasCompleto(altas);

                    // Generar el archivo de actualizaciones completo
                    generarArchivoActualizacionesCompleto(actualizaciones);

                    setIsProcessing(false); // Ocultar el loader
                    setStatusMessage("Archivos procesados correctamente.");

                    // Limpiar los archivos seleccionados
                    setSociosFile(null);
                    setPrestamosFile(null);
                };

                prestamosReader.readAsArrayBuffer(prestamosFile);
            };

            sociosReader.readAsArrayBuffer(sociosFile);
        } catch (error) {
            console.error("Error durante el procesamiento:", error);
            setIsProcessing(false);
            setStatusMessage("Ocurrió un error al procesar los archivos. Verifica el formato.");
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

            {isProcessing && (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Procesando archivos, por favor espera...</p>
                </div>
            )}

            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );


}

export default App;