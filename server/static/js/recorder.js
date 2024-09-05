let mediaRecorder;
let recordedChunks = [];

// Toggle streaming video from the server or camera
function toggleStream() {
    const videoStream = document.getElementById('videoStream');
    const toggle = document.getElementById('toggleStream');

    if (toggle.checked) {
        // Intentar obtener el stream de la cámara
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                videoStream.srcObject = stream; // Asignar el stream al video
            })
            .catch((error) => {
                console.error('Error accessing camera: ', error);
            });
    } else {
        // Detener el stream
        let stream = videoStream.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(track => track.stop()); // Detener todas las pistas
        videoStream.srcObject = null;
    }
}

// Start recording the video stream
function startRecording() {
    const videoStream = document.getElementById('videoStream');

    // Check if the video stream is already playing
    if (videoStream.srcObject) {
        const stream = videoStream.srcObject; // Captura el stream desde el video element
        mediaRecorder = new MediaRecorder(stream);

        // When data is available, push it to the recordedChunks array
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Start recording
        mediaRecorder.start();

        // Indicate that recording has started
        const recordIndicator = document.getElementById('recordIndicator');
        recordIndicator.style.display = 'flex';

        // Stop recording after the specified time
        const recordTime = document.getElementById('recordTime').value * 1000; // Convert to ms
        setTimeout(() => {
            stopRecording();
            showNotification('Recording stopped automatically after ' + recordTime / 1000 + ' seconds.');
        }, recordTime);
    } else {
        alert("Please start the video stream first.");
    }
}

// Stop recording and save the video
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop(); // Stop the recording

        // When the recording stops, save the video file
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded_video.webm'; // Name of the file to be saved
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            // Clear the recorded chunks for future recordings
            recordedChunks = [];

            // Hide the recording indicator
            const recordIndicator = document.getElementById('recordIndicator');
            recordIndicator.style.display = 'none';

            // Show notification that recording has stopped
            showNotification('Recording stopped.');
        };
    }
}

// Stop the video stream
function stopStream() {
    const videoStream = document.getElementById('videoStream');
    let stream = videoStream.srcObject;
    let tracks = stream.getTracks();

    tracks.forEach(track => track.stop()); // Detener todas las pistas
    videoStream.srcObject = null; // Stop the video stream
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
