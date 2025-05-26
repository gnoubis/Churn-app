# app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.model import SentimentAnalyzer

app = FastAPI()
analyzer = SentimentAnalyzer()

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict_sentiment(request: TextRequest):
    try:
        result = analyzer.predict(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
