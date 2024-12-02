import os
import struct
import wave
from datetime import datetime
from dotenv import load_dotenv

import pvporcupine
from pvrecorder import PvRecorder


def main():
    load_dotenv()
    access_key = os.getenv("ACCESS_KEY")
    model_path = os.getenv("MODEL_PATH")
    keyword_path = os.getenv("KEYWORD_PATH")

    if not all([access_key, model_path, keyword_path]):
        print("Missing necessary environment variables.")
        return

    print("Available Audio Devices:")
    devices = PvRecorder.get_available_devices()
    for i, device in enumerate(devices):
        print(f"Device {i}: {device}")

    selected_index = int(input("Enter the index of the audio device you want to use: "))
    print(f"Selected device: {devices[selected_index]}")

    try:
        porcupine = pvporcupine.create(
            access_key=access_key,
            model_path=model_path,
            keyword_paths=[keyword_path],
            sensitivities=[0.5]
        )
    except pvporcupine.PorcupineError as e:
        print("Failed to initialize Porcupine", e)
        return

    print('Porcupine version: %s' % porcupine.version)

    recorder = PvRecorder(
        frame_length=porcupine.frame_length,
        device_index=selected_index
    )
    recorder.start()

    print('Listening ... (press Ctrl+C to exit)')

    try:
        while True:
            pcm = recorder.read()
            result = porcupine.process(pcm)

            if result >= 0:
                print('[%s] Detected %s' % (str(datetime.now()), "APEKSHAAAAA"))
    except KeyboardInterrupt:
        print('Stopping ...')
    finally:
        recorder.delete()
        porcupine.delete()


if __name__ == '__main__':
    main()
