function startStream() {
    const videoStream = document.getElementById('videoStream');
    videoStream.src = '/video_feed'; // Ruta del servidor Flask que proporciona el stream de video
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