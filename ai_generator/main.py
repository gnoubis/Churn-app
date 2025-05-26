from fastapi import FastAPI
from pydantic import BaseModel
import httpx
from httpx import ReadTimeout, HTTPError

app = FastAPI()

OPENROUTER_API_KEY = "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"

class MessageRequest(BaseModel):
    client_name: str
    recommended_offer: str
    channel: str
    tone: str

@app.post("/generate-message/")
async def generate_message(data: MessageRequest):
    prompt = (
        f"Rédige un message {data.channel} au ton {data.tone} pour un client nommé "
        f"{data.client_name}, lui proposant cette offre : {data.recommended_offer}. "
        "Le message doit être clair, engageant et personnalisé."
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 200
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:  # Timeout augmenté
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()  # Lève une exception si le code HTTP est 4xx ou 5xx
            result = response.json()
            message = result["choices"][0]["message"]["content"]
            return {"message": message}

    except ReadTimeout:
        return {"error": "L'API OpenRouter a mis trop de temps à répondre (timeout)."}
    except HTTPError as http_err:
        return {"error": f"Erreur HTTP: {http_err}"}
    except Exception as err:
        return {"error": f"Une erreur inattendue s'est produite: {err}"}
