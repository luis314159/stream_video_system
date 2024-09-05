let mediaRecorder;
let recordedChunks = [];

// Toggle streaming video from the server
function toggleStream() {
    const videoStream = document.getElementById('videoStream');
    const toggle = document.getElementById('toggleStream');

    if (toggle.checked) {
        videoStream.src = '/video_feed'; // URL of the Flask server video feed
    } else {
        videoStream.src = ''; // Stop the stream
    }
}

// Start recording the video stream
function startRecording() {
    const videoStream = document.getElementById('videoStream');

    // Check if the video stream is already playing
    if (videoStream.src) {
        const stream = videoStream.captureStream(); // Capture the stream from the video element
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
        };
    }
}

// Stop the video stream
function stopStream() {
    const videoStream = document.getElementById('videoStream');
    videoStream.src = ''; // Stop the video stream
}
