let mediaRecorder;
let recordedChunks = [];
let canvasStream;
let canvas, ctx;
let recordTimeout;  // Variable para almacenar el temporizador

// Inicializar el canvas
function setupCanvas() {
    const videoStream = document.getElementById('videoStream');
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    // Establece el tamaño del canvas igual al tamaño del video
    canvas.width = videoStream.width;
    canvas.height = videoStream.height;

    // Capturar el video en el canvas
    setInterval(() => {
        ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
    }, 1000 / 30); // 30 fps
}

// Iniciar la grabación desde el canvas
function startRecording() {
    const videoStream = document.getElementById('videoStream');

    // Verificar si el stream de video está activo
    if (videoStream.src.includes("/video_feed")) {
        // Iniciar el canvas para capturar el video
        setupCanvas();

        // Crear un MediaStream a partir del canvas
        canvasStream = canvas.captureStream(30); // 30 fps

        // Crear el MediaRecorder a partir del canvasStream
        mediaRecorder = new MediaRecorder(canvasStream);

        // Guardar los chunks grabados
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Iniciar la grabación
        mediaRecorder.start();

        // Mostrar el indicador de grabación
        document.getElementById('recordIndicator').style.display = 'flex';

        // Detener la grabación después de cierto tiempo
        const recordTime = document.getElementById('recordTime').value * 1000; // ms
        recordTimeout = setTimeout(() => {
            stopRecording();
            showNotification('Recording stopped automatically after ' + recordTime / 1000 + ' seconds.');
        }, recordTime);
    } else {
        alert("Please start the video stream first.");
    }
}

// Detener la grabación y guardar el video
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();

        // Limpiar el temporizador para detener la cuenta si se presiona "Stop"
        clearTimeout(recordTimeout);

        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded_video.webm'; // Nombre del archivo
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            // Limpiar los chunks para futuras grabaciones
            recordedChunks = [];

            // Ocultar el indicador de grabación
            document.getElementById('recordIndicator').style.display = 'none';

            // Mostrar notificación de que la grabación ha finalizado
            showNotification('Recording stopped.');
        };
    }
}

// Toggle streaming video from the server or camera
function toggleStream() {
    const videoStream = document.getElementById('videoStream');
    const toggle = document.getElementById('toggleStream');

    if (toggle.checked) {
        // Iniciar el stream desde el servidor Flask
        videoStream.src = "/video_feed";
    } else {
        // Detener el stream quitando el src
        stopStream()
        videoStream.src = "";
    }
}


// Stop the video stream
function stopStream() {
    const videoStream = document.getElementById('videoStream');

    // Verifica si el stream tiene un src válido
    if (videoStream.src && videoStream.src !== "") {
        // Detener el stream quitando el src
        videoStream.src = "";  // Limpiamos el src del video
    } else {
        console.warn("No stream to stop.");
    }
}

// Show a notification message
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');

    notificationMessage.textContent = message;
    notification.style.display = 'block';

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
