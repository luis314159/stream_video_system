function startStream() {
    const videoStream = document.getElementById('videoStream');
    videoStream.src = '/video_feed'; // Ruta del servidor Flask que proporciona el stream de video
}
