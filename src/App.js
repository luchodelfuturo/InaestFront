import React, { useState } from 'react';
import {  ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';  // Asegúrate de que estás importando el almacenamiento correctamente
import './App.css';
import axios from 'axios';

function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [testMessage, setTestMessage] = useState('');

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const uploadToFirebase = async (file, folderName) => {
        const storageRef = ref(storage, `${folderName}/${file.name}`);
        try {
            // Subir archivo
            await uploadBytes(storageRef, file);
            // Obtener URL de descarga
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error("Error al subir archivo: ", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Subir archivos a Firebase Storage
            const sociosUrl = await uploadToFirebase(sociosFile, 'socios');
            const prestamosUrl = await uploadToFirebase(prestamosFile, 'prestamos');
            console.log("Se subieron a firestore wi..")
            // Enviar las URLs al backend para que procese los archivos
            const response = await axios.post('https://inaesbot.vercel.app/api/process-files', {
                sociosUrl,
                prestamosUrl
            });
    
            alert("Archivos procesados exitosamente por el backend");
        } catch (error) {
            console.error('Error al subir o procesar archivos:', error);
            alert('Error: ' + error.message);
        }
    };

    const testConnection = async () => {
        setTestMessage("Firebase Storage está funcionando correctamente.");
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

            {fileUrl && (
                <div>
                    <a href={fileUrl} download>Descargar archivo generado</a>
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <h2>Prueba de Conexión</h2>
                <button onClick={testConnection}>Testear Conexión</button>
                {testMessage && <p>{testMessage}</p>}
            </div>
        </div>
    );
}

export default App;