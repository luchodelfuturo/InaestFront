import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [sociosFile, setSociosFile] = useState(null);
    const [prestamosFile, setPrestamosFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [testMessage, setTestMessage] = useState('');

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
            })
            console.log('Respuesta del servidor:', response.data);
            if (response.data.filePath) {
                setFileUrl(`https://inaesbot.vercel.app${response.data.filePath}`);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error uploading files:', error);

            if (error.response) {
                console.error('Error en la respuesta del servidor:', error.response.data);
                alert('Error del servidor: ' + error.response.data.message);
            } else if (error.request) {
                console.error('No hubo respuesta del servidor:', error.request);
                alert('No se pudo conectar con el servidor. Verificá la configuración del backend.');
            } else {
                console.error('Error al realizar la solicitud:', error.message);
                alert('Error al realizar la solicitud: ' + error.message);
            }
        }
    };

    const testConnection = async () => {
        try {
            const response = await axios.get('https://inaesbot.vercel.app/api/test');
            console.log('Respuesta de la prueba de conexión:', response.data);
            setTestMessage(response.data.message);
        } catch (error) {
            console.error('Error al probar la conexión:', error);
            setTestMessage('Error al probar la conexión');
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

            <div style={{ marginTop: '20px' }}>
                <h2>Prueba de Conexión</h2>
                <button onClick={testConnection}>Testear Conexión</button>
                {testMessage && <p>{testMessage}</p>}
            </div>
        </div>
    );
}

export default App;