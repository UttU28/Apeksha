from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import ollama

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

print("CUDA Available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("Device Name:", torch.cuda.get_device_name(0))

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
model_id = "openai/whisper-large-v3-turbo"
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)
processor = AutoProcessor.from_pretrained(model_id)
pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)


def get_response(prompt):
    response = ollama.chat(
        model='llama3.2',
        messages=[{'role': 'user', 'content': prompt}],
    )
    return response['message']


@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    audio_path = f"/tmp/{audio_file.filename}"
    audio_file.save(audio_path)
    
    # Transcribe audio
    transcription = pipe(audio_path, generate_kwargs={"task": "transcribe"}, return_timestamps=True)["text"]
    
    # Send transcription back to the client
    response = {"transcription": transcription}
    return jsonify(response), 200


@app.route('/getResponse', methods=['POST'])
def respond():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text']
    
    # Get response from Ollama
    ai_response = get_response(text)
    
    # Ensure ai_response is JSON serializable
    if isinstance(ai_response, dict):
        # If it's a dictionary, return it as is
        response_data = ai_response
    elif hasattr(ai_response, 'to_dict'):
        # If it has a `to_dict` method, use it
        response_data = ai_response.to_dict()
    elif isinstance(ai_response, str):
        # If it's already a string, wrap it in a dictionary
        response_data = {"response": ai_response}
    else:
        # Fallback: Convert to string (may lose structure)
        response_data = {"response": str(ai_response)}

    return jsonify(response_data), 200


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
