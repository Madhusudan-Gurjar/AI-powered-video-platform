# import sys
# import assemblyai as aai
# import os
# from deep_translator import GoogleTranslator

# # Get file path from command line
# file_path = sys.argv[1] if len(sys.argv) > 1 else "./testaudio.mp3"

# # AssemblyAI setup
# aai.settings.api_key = "56d949ec2a2445a0a6eb39b48d1f71e2"
# transcriber = aai.Transcriber()

# if not os.path.isfile(file_path):
#     raise FileNotFoundError(f"Audio file not found: {file_path}")

# config = aai.TranscriptionConfig(
#     speaker_labels=True,
#     punctuate=True,
#     format_text=True,
#     language_detection=True,
# )

# transcript = transcriber.transcribe(file_path, config=config)
# detected_language = transcript.json_response.get("language_code", "en")
# translated_text = GoogleTranslator(source=detected_language, target=detected_language).translate(transcript.text)

# print(translated_text)  # Print the result for use by Node.js
import sys
import assemblyai as aai
import os
from deep_translator import GoogleTranslator

# Get file path from command line
file_path = sys.argv[1] if len(sys.argv) > 1 else "./testaudio.mp3"

# AssemblyAI setup
aai.settings.api_key = "56d949ec2a2445a0a6eb39b48d1f71e2"
transcriber = aai.Transcriber()

# Validate file existence
if not os.path.isfile(file_path):
    raise FileNotFoundError(f"Audio file not found: {file_path}")

# Transcription config
config = aai.TranscriptionConfig(
    speaker_labels=True,
    punctuate=True,
    format_text=True,
    language_detection=True,
)

# Run transcription
transcript = transcriber.transcribe(file_path, config=config)
detected_language = transcript.json_response.get("language_code", "en")
text = transcript.text

# Set target language (can be changed dynamically later)
target_language = "en"

# Translate only if necessary and safe
if detected_language != target_language and text is not None and 1 <= len(text) <= 5000:

    translated_text = GoogleTranslator(source=detected_language, target=target_language).translate(text)
else:
    translated_text = text

# Output final transcription for backend to capture
print(translated_text)
