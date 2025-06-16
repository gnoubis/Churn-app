from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx
from httpx import ReadTimeout, HTTPError
from typing import Literal
import os
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

OPENROUTER_API_KEY = "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"


class MessageRequest(BaseModel):
    client_name: str = Field(..., min_length=2, max_length=100)
    recommended_offer: str = Field(..., min_length=10, max_length=500)
    channel: Literal["email", "sms"] = Field(...)
    tone: Literal["formel", "informel", "amical"] = Field(...)

class CustomPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=1000)
    temperature: float = Field(0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(200, ge=1, le=1000)

@app.post("/generate-message/")
async def generate_message(data: MessageRequest):
    prompt = (
        f"Rédige un message {data.channel} au ton {data.tone} pour un client nommé "
        f"{data.client_name}, lui proposant cette offre : {data.recommended_offer}. "
        "Le message doit être clair, engageant et personnalisé."
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Message Generator"
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
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            message = result["choices"][0]["message"]["content"]
            
            # Validation de la longueur pour les SMS
            if data.channel == "sms" and len(message) > 160:
                message = message[:157] + "..."

            return {"message": message}

    except ReadTimeout:
        raise HTTPException(status_code=504, detail="L'API OpenRouter a mis trop de temps à répondre (timeout).")
    except HTTPError as http_err:
        raise HTTPException(status_code=500, detail=f"Erreur HTTP: {http_err}")
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Une erreur inattendue s'est produite: {err}")

@app.post("/generate-custom-text/")
async def generate_custom_text(data: CustomPromptRequest):
    """
    Génère du texte à partir d'un prompt personnalisé.
    
    - prompt: Le texte de la requête
    - temperature: Contrôle la créativité (0.0 à 1.0)
    - max_tokens: Nombre maximum de tokens dans la réponse
    """
    logger.info(f"Reçu une requête avec le prompt: {data.prompt[:50]}...")
    
    # Validation supplémentaire du prompt
    if not data.prompt.strip():
        raise HTTPException(status_code=400, detail="Le prompt ne peut pas être vide")
    
    if len(data.prompt) < 10:
        raise HTTPException(status_code=400, detail="Le prompt doit contenir au moins 10 caractères")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Message Generator"
    }

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {"role": "user", "content": data.prompt}
        ],
        "temperature": data.temperature,
        "max_tokens": data.max_tokens
    }

    try:
        logger.info("Envoi de la requête à OpenRouter...")
        async with httpx.AsyncClient(timeout=30.0) as client:  # Réduit le timeout à 30 secondes
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Erreur OpenRouter: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erreur OpenRouter: {response.text}"
                )
            
            result = response.json()
            logger.info("Réponse reçue de OpenRouter")
            return {"message": result["choices"][0]["message"]["content"]}

    except ReadTimeout:
        logger.error("Timeout lors de l'appel à OpenRouter")
        raise HTTPException(status_code=504, detail="L'API OpenRouter a mis trop de temps à répondre (timeout).")
    except HTTPError as http_err:
        logger.error(f"Erreur HTTP: {str(http_err)}")
        raise HTTPException(status_code=500, detail=f"Erreur HTTP: {str(http_err)}")
    except Exception as err:
        logger.error(f"Erreur inattendue: {str(err)}")
        raise HTTPException(status_code=500, detail=f"Une erreur inattendue s'est produite: {str(err)}")
