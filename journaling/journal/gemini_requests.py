from google import genai
from google.genai import types

def generate_ai_analysis(entry_text):
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=entry_text, config=types.GenerateContentConfig(system_instruction="You are a poetic and insightful journal assistant. Provide a thoughtful analysis of the journal entry, highlighting key themes and emotions expressed.")
    )

    return response.text