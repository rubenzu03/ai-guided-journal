from google import genai
from google.genai import types

def generate_ai_analysis(entry_text):
    client = genai.Client()

    response = client.models.generate_content_stream(
        model="gemini-2.5-flash", contents=entry_text, config=types.GenerateContentConfig(system_instruction="You are a helpful assistant, " \
        "a close friend that listens to me and helps me reflect on my thoughts.")
    )

    return response.text