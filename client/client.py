import cv2
import requests
from load_ip import load_ip
import numpy as np
import argparse

def main(ip: str, port: int):
    """
    Stream video from a Raspberry Pi using the provided IP and port, or defaults to 
    values from a JSON file for IP and port 5000 if not provided.

    Args:
        ip (str): The IP address of the Raspberry Pi.
        port (int): The port number to connect to the Raspberry Pi.
    """
    # Construct the URL with the provided IP and port
    raspberry_pi_url = f'http://{ip}:{port}/video_feed'

    # Open the video stream from the Raspberry Pi
    stream = requests.get(raspberry_pi_url, stream=True)

    if stream.status_code == 200:
        bytes_data = b''
        for chunk in stream.iter_content(chunk_size=1024):
            bytes_data += chunk
            a = bytes_data.find(b'\xff\xd8')  # Start of JPEG
            b = bytes_data.find(b'\xff\xd9')  # End of JPEG
            if a != -1 and b != -1:
                # Extract JPEG image from the byte stream
                jpg = bytes_data[a:b+2]
                bytes_data = bytes_data[b+2:]
                img = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)

                if img is not None:
                    cv2.imshow('Raspberry Pi Stream', img)

                # Exit if 'ESC' key is pressed
                if cv2.waitKey(1) == 27:
                    break

    # Clean up windows
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # Argument parser for optional IP and port inputs
    parser = argparse.ArgumentParser(description='Stream video from a Raspberry Pi.')
    parser.add_argument('--ip', type=str, default=load_ip(), 
                        help='The IP address of the Raspberry Pi (default: loaded from JSON).')
    parser.add_argument('--port', type=int, default=5000, 
                        help='The port number to connect to (default: 5000).')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Run the main function with the provided or default IP and port
    main(args.ip, args.port)
