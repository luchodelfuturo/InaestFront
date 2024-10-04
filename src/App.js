import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('socios', sociosFile);
        formData.append('prestamos', prestamosFile);

        console.log('Enviando archivos:', sociosFile, prestamosFile);

        try {
            const response = await axios.post(`https://inaesbot.vercel.app/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Respuesta del servidor:', response.data);
            if (response.data.filePath) {
                setFileUrl(`https://inaesbot.vercel.app${response.data.filePath}`);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files: ' + error.message);
        }
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
                    <a href={fileUrl} download="alta_deudores.txt">Descargar archivo generado</a>
                </div>
            )}
        </div>
    );
}

export default App;