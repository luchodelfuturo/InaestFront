// import React, { useState } from 'react';
// import {  ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from './firebaseConfig';  // Asegúrate de que estás importando el almacenamiento correctamente
// import './App.css';
// import axios from 'axios';

// function App() {
//     const [sociosFile, setSociosFile] = useState(null);
//     const [prestamosFile, setPrestamosFile] = useState(null);
//     const [fileUrl, setFileUrl] = useState(null);
//     const [testMessage, setTestMessage] = useState('');

//     const handleFileChange = (e, setFile) => {
//         setFile(e.target.files[0]);
//     };

//     const uploadToFirebase = async (file, folderName) => {
//         const storageRef = ref(storage, `${folderName}/${file.name}`);
//         try {
//             // Subir archivo
//             await uploadBytes(storageRef, file);
//             // Obtener URL de descarga
//             const url = await getDownloadURL(storageRef);
//             return url;
//         } catch (error) {
//             console.error("Error al subir archivo: ", error);
//             throw error;
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
    
//         try {
//             // Subir archivos a Firebase Storage
//             const sociosUrl = await uploadToFirebase(sociosFile, 'socios');
//             const prestamosUrl = await uploadToFirebase(prestamosFile, 'prestamos');
    
//             // Enviar las URLs al backend para que procese los archivos
//             const response = await axios.post('https://inaesbot.vercel.app/api/process-files', {
//                 sociosUrl,
//                 prestamosUrl
//             }, { responseType: 'blob' });  // Asegurarte de que la respuesta es un archivo (blob)
    
//             // Crear un enlace de descarga para el archivo recibido
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', 'alta_deudores.txt');  // Nombre del archivo
//             document.body.appendChild(link);
//             link.click();
//         } catch (error) {
//             console.error('Error al subir o procesar archivos:', error);
//             alert('Error: ' + error.message);
//         }
//     };

//     const testConnection = async () => {
//         setTestMessage("Firebase Storage está funcionando correctamente.");
//     };

//     return (
//         <div className="App">
//             <h1>Cargar Planillas</h1>
//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label>Planilla de Socios:</label>
//                     <input type="file" onChange={(e) => handleFileChange(e, setSociosFile)} />
//                 </div>
//                 <div>
//                     <label>Planilla de Préstamos:</label>
//                     <input type="file" onChange={(e) => handleFileChange(e, setPrestamosFile)} />
//                 </div>
//                 <button type="submit">Subir y Procesar</button>
//             </form>

//             {fileUrl && (
//                 <div>
//                     <a href={fileUrl} download>Descargar archivo generado</a>
//                 </div>
//             )}

//             <div style={{ marginTop: '20px' }}>
//                 <h2>Prueba de Conexión</h2>
//                 <button onClick={testConnection}>Testear Conexión</button>
//                 {testMessage && <p>{testMessage}</p>}
//             </div>
//         </div>
//     );
// }

// export default App;

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const procesarArchivos = (sociosData, prestamosData) => {
        // Filtrar y unir los datos de socios y préstamos
        const sociosMap = sociosData.reduce((map, socio) => {
            map[socio['LEGAJO BBVA']] = socio;
            return map;
        }, {});

        const mergedData = prestamosData.map(prestamo => {
            const socio = sociosMap[prestamo['LEGAJO']] || {};
            return { ...prestamo, ...socio };
        });

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

        // Crear el archivo de texto y ofrecerlo para descargar
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'alta_deudores.txt');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Leer los archivos de socios y préstamos
        const sociosReader = new FileReader();
        const prestamosReader = new FileReader();

        sociosReader.onload = (e) => {
            const sociosWorkbook = XLSX.read(e.target.result, { type: 'binary' });
            const sociosSheet = sociosWorkbook.Sheets[sociosWorkbook.SheetNames[0]];
            const sociosData = XLSX.utils.sheet_to_json(sociosSheet);

            prestamosReader.onload = (e) => {
                const prestamosWorkbook = XLSX.read(e.target.result, { type: 'binary' });
                const prestamosSheet = prestamosWorkbook.Sheets[prestamosWorkbook.SheetNames[0]];
                const prestamosData = XLSX.utils.sheet_to_json(prestamosSheet, { range: 4 });

                // Procesar los archivos
                const mergedData = procesarArchivos(sociosData, prestamosData);
                
                // Generar el archivo de texto
                generarArchivoTxt(mergedData);
            };
            prestamosReader.readAsBinaryString(prestamosFile);
        };
        sociosReader.readAsBinaryString(sociosFile);
    };

    return (
        <div className="App">
            <h1>Cargar Planillas</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Planilla de Socios:</label>
                    <input type="file" onChange={(e) => handleFileChange(e, setSociosFile)} />
                </div>
                <div>
                    <label>Planilla de Préstamos:</label>
                    <input type="file" onChange={(e) => handleFileChange(e, setPrestamosFile)} />
                </div>
                <button type="submit">Subir y Procesar</button>
            </form>
        </div>
    );
}

export default App;