from flask import Flask, Response, render_template
import cv2
import argparse

app = Flask(__name__)

# Initialize the camera
camera = cv2.VideoCapture(0)

def generate_frames():
    """
    Continuously capture frames from the camera and convert them to a byte stream
    in JPEG format, yielding them as part of a multipart HTTP response.
    """
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


if __name__ == "__main__":
    # Argument parser for optional port input
    parser = argparse.ArgumentParser(description='Flask server for streaming video.')
    parser.add_argument('--port', type=int, default=5000,
                        help='The port number to run the server on (default: 5000).')

    # Parse arguments
    args = parser.parse_args()

    # Start the Flask app, accessible on the local network
    app.run(host="0.0.0.0", port=args.port)
