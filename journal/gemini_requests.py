from google import genai
from google.genai import types
from django.http import JsonResponse, StreamingHttpResponse
import json
from google import genai
from google.genai import types

def generate_ai_analysis(entry_text):
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=entry_text, config=types.GenerateContentConfig(system_instruction="You are a poetic and insightful journal assistant. Provide a thoughtful analysis of the journal entry, highlighting key themes and emotions expressed.")
    )

    return response.text

async def generate_analysis_stream(request):
    """Async endpoint that streams AI analysis chunks as they arrive.

    Expects POST JSON: { "text": "..." }
    Returns a streaming response with chunked text (plain text). The client
    should use fetch and read the response.body as a stream.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body.decode() or "{}")
        entry_text = data.get('text', '')
    except Exception:
        return JsonResponse({'error': 'invalid request'}, status=400)

    async def event_stream():
        client = genai.Client()
        async for chunk in await client.aio.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=entry_text,
            config=types.GenerateContentConfig(system_instruction="You are a poetic and insightful journal assistant. Provide a thoughtful analysis of the journal entry, highlighting key themes and emotions expressed.")
        ):
            text = chunk.text or ''
            for line in text.splitlines(True):
                yield f"data: {line}\n\n"

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream; charset=utf-8')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

