from flask import Flask, Response, render_template
import cv2
import argparse

app = Flask(__name__)

# Initialize the camera
camera = None  # No abrimos la cámara aún

def generate_frames():
    global camera
    camera = cv2.VideoCapture(0)  # Abrimos la cámara cuando se empieza a ver el stream
    try:
        while True:
            success, frame = camera.read()
            if not success:
                break
            else:
                # Convert the frame to JPEG format
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()

                # Yield the frame in byte format as part of a multipart HTTP response
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    finally:
        # Cuando el cliente cierra la conexión, liberamos la cámara
        camera.release()

@app.route('/video_feed')
def video_feed():
    """
    Endpoint to stream the video feed from the camera.
    Returns:
        Response: Streaming video in JPEG format as a multipart HTTP response.
    """
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    """
    Basic index route for testing.
    Returns:
        Video stream
    """
    return render_template('index.html')

@app.route('/recorder')
def recorder():
    """
    Recorder web app.
    """
    return render_template('recorder.html')

@app.route('/recorder_rasp')
def recorder_rasp():
    """
    Recorder web app.
    """
    return render_template('recorder_rasp.html')


if __name__ == "__main__":
    # Argument parser for optional port input
    parser = argparse.ArgumentParser(description='Flask server for streaming video.')
    parser.add_argument('--IP', type=str, default='0.0.0.0',
                        help='Host IP address of the server(default: 192.168.0.105).')
    parser.add_argument('--port', type=int, default=5000,
                        help='The port number to run the server on (default: 5000).')
    # Parse arguments
    args = parser.parse_args()

    # Start the Flask app, accessible on the local network
    app.run(host=args.IP, port=args.port)
