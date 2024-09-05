import cv2
import requests
from load_ip import load_ip
import numpy as np

# Replace this URL with the IP address of your Raspberry Pi
ip = load_ip()
raspberry_pi_url = f'http://{ip}/video_feed'

stream = requests.get(raspberry_pi_url, stream=True)

if stream.status_code == 200:
    bytes_data = b''
    for chunk in stream.iter_content(chunk_size=1024):
        bytes_data += chunk
        a = bytes_data.find(b'\xff\xd8')
        b = bytes_data.find(b'\xff\xd9')
        if a != -1 and b != -1:
            jpg = bytes_data[a:b+2]
            bytes_data = bytes_data[b+2:]
            img = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
            if img is not None:
                cv2.imshow('Raspberry Pi Stream', img)

            if cv2.waitKey(1) == 27:  # Press 'ESC' to exit
                break

cv2.destroyAllWindows()
