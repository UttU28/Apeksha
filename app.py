from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import requests
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import ollama
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


TTS_CONFIGS = [
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "as", "sourceScriptCode": "Beng"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "bn", "sourceScriptCode": "Beng"},
    {"serviceId": "ai4bharat/indic-tts-coqui-misc-gpu--t4", "sourceLanguage": "brx", "sourceScriptCode": "Deva"},
    {"serviceId": "ai4bharat/indic-tts-coqui-misc-gpu--t4", "sourceLanguage": "en", "sourceScriptCode": "Latn"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "gu", "sourceScriptCode": "Gujr"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "hi", "sourceScriptCode": "Deva"},
    {"serviceId": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", "sourceLanguage": "kn", "sourceScriptCode": "Knda"},
    {"serviceId": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", "sourceLanguage": "ml", "sourceScriptCode": "Mlym"},
    {"serviceId": "ai4bharat/indic-tts-coqui-misc-gpu--t4", "sourceLanguage": "mni", "sourceScriptCode": "Beng"},
    {"serviceId": "ai4bharat/indic-tts-coqui-misc-gpu--t4", "sourceLanguage": "mni", "sourceScriptCode": "Mtei"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "mr", "sourceScriptCode": "Deva"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "or", "sourceScriptCode": "Orya"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "pa", "sourceScriptCode": "Guru"},
    {"serviceId": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", "sourceLanguage": "raj", "sourceScriptCode": "Deva"},
    {"serviceId": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", "sourceLanguage": "ta", "sourceScriptCode": "Taml"},
    {"serviceId": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", "sourceLanguage": "te", "sourceScriptCode": "Telu"},
]


# CUDA setup for model
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

# Load Whisper ASR model
model_id = "openai/whisper-large-v3-turbo"
model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True)
model.to(device)
processor = AutoProcessor.from_pretrained(model_id)

# Initialize ASR pipeline
pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)

# Centralized API Configuration
API_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": os.getenv("HEADER_AUTHORIZATION"),
}
API_BASE_URL = os.getenv("API_BASE_URL")

# Initialize Ollama for response generation
def get_response(prompt):
    try:
        response = ollama.chat(
            model='llama3.2',
            messages=[{'role': 'user', 'content': prompt}],
        )
        return response.get('message', 'No response content')
    except Exception as e:
        return f"Error: {str(e)}"


# Translation API call
def translate_content(sourceLanguage, targetLanguage, content):
    service_id = "ai4bharat/indictrans-v2-all-gpu--t4"
    payload = {
        "pipelineTasks": [{"taskType": "translation", "config": {"language": {"sourceLanguage": sourceLanguage, "targetLanguage": targetLanguage}, "serviceId": service_id}}],
        "inputData": {"input": [{"source": content}]}
    }
    try:
        response = requests.post(f"{API_BASE_URL}/pipeline", json=payload, headers=API_HEADERS)
        response.raise_for_status()
        translated_content = response.json()["pipelineResponse"][0]["output"][0]["target"]
        return {"status_code": 200, "message": "Translation successful", "translated_content": translated_content}
    except Exception as e:
        return {"status_code": 500, "message": f"Translation failed: {str(e)}"}

# TTS API call
def call_tts_api(target_language, content):
    # Find the matching configuration for the target language
    config = next((cfg for cfg in TTS_CONFIGS if cfg["sourceLanguage"] == target_language), None)
    if not config:
        return {"error": f"No TTS configuration found for language: {target_language}"}

    serviceID = config["serviceId"]
    gender = "female"  # Default gender

    payload = {
        "pipelineTasks": [
            {
                "taskType": "tts",
                "config": {
                    "language": {"sourceLanguage": target_language},
                    "serviceId": serviceID,
                    "gender": gender,
                    "samplingRate": 8000
                }
            }
        ],
        "inputData": {"input": [{"source": content}]}
    }

    try:
        response = requests.post(f"{API_BASE_URL}/pipeline", json=payload, headers=API_HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e)}

# Route to transcribe audio file
@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    audio_path = f"/tmp/{audio_file.filename}"
    audio_file.save(audio_path)

    transcription = pipe(audio_path, generate_kwargs={"task": "transcribe"}, return_timestamps=True)["text"]
    return jsonify({"transcription": transcription}), 200

# Route to get AI response from prompt
@app.route('/getResponse', methods=['POST'])
def respond():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    try:
        ai_response = get_response(data['text'])
        if isinstance(ai_response, dict):
            response_content = ai_response.get('message', 'No response message')
        else:
            response_content = str(ai_response)
            response_content = response_content.removeprefix("role='assistant' content='").removesuffix("' images=None tool_calls=None").strip()
        return jsonify({"response": response_content}), 200
    except Exception as e:
        return jsonify({"error": f"Error generating response: {str(e)}"}), 500

# Route to translate text content
@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    if not data or not all(key in data for key in ("sourceLanguage", "targetLanguage", "content")):
        return jsonify({"error": "Invalid input data"}), 400
    
    translation_result = translate_content(data["sourceLanguage"], data["targetLanguage"], data["content"])
    audio_result = call_tts_api(data["targetLanguage"], translation_result['translated_content'])
    try: audioContent = audio_result["pipelineResponse"][0]["audio"][0]["audioContent"]
    except: audioContent = None
    translation_result["audioContent"] = audioContent
    return jsonify(translation_result), translation_result["status_code"]

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
