from flask import Flask, Response
import cv2
import socket
import threading

app = Flask(__name__)

# Initialize camera
camera = cv2.VideoCapture(0)

def generate_frames():
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
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return "Camera Streaming. Access video at /video_feed"

if __name__ == "__main__":
    # Start the Flask app, accessible on the local network
    # Replace with the IP of the Raspberry Pi, if needed.
    app.run(host="0.0.0.0", port=5000)