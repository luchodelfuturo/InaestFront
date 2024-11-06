import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import "./App.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { procesarArchivos, clasificarRegistros } from './utils/procesamiento';
import { generarArchivoAltasCompleto } from './utils/generarAltas';
import { generarArchivoActualizacionesCompleto } from './utils/generarActualizaciones';

function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [selectedDate, setSelectedDate] = useState(null); // Estado para el selector de fecha

    // Función para manejar cambios en los archivos de socios y préstamos
    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];
        if (file && file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            setStatusMessage("Por favor, selecciona un archivo Excel válido.");
            return;
        }
        setFile(file);
        setStatusMessage('');
    };

    // Obtener el período de información en formato AAAAMM
    const obtenerPeriodoInformacion = () => {
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Mes en formato 01, 02, ..., 12
            return `${year}${month}`;
        }
        return '';
    };

    // Validar y procesar los archivos
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que el usuario haya seleccionado un período
        if (!selectedDate) {
            setStatusMessage("Por favor, selecciona un mes y un año.");
            return;
        }

        setIsProcessing(true);
        setStatusMessage("Leyendo archivo de socios...");

        try {
            const sociosReader = new FileReader();
            const prestamosReader = new FileReader();

            sociosReader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const sociosWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sociosSheet = sociosWorkbook.Sheets[sociosWorkbook.SheetNames[0]];
                const sociosData = XLSX.utils.sheet_to_json(sociosSheet);
                setStatusMessage("Leyendo archivo de préstamos...");

                prestamosReader.onload = (e) => {
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
                    generarArchivoAltasCompleto(altas, obtenerPeriodoInformacion());

                    // Generar el archivo de actualizaciones completo
                    generarArchivoActualizacionesCompleto(actualizaciones, obtenerPeriodoInformacion());

                    setIsProcessing(false);
                    setStatusMessage("Archivos procesados correctamente.");
                    setSociosFile(null);
                    setPrestamosFile(null);
                };

                prestamosReader.readAsArrayBuffer(prestamosFile);
            };

            sociosReader.readAsArrayBuffer(sociosFile);
        } catch (error) {
            console.error("Error durante el procesamiento:", error);
            setIsProcessing(false);
            setStatusMessage("Ocurrió un error al procesar los archivos. Verifica los datos y el formato.");
        }
    };

    return (
        <div className="App">
            <h1>Cargar Planillas</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Período de Información (Mes y Año):</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        placeholderText="Selecciona mes y año"
                        required
                    />
                </div>
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

            {statusMessage && <p className="status-message">{statusMessage}</p>}

        </div>
    );
}

export default App;

