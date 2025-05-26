from fastapi import FastAPI
from app.schema import ClientData, RecommendationResult
from app.model import recommend_actions

app = FastAPI(title="Recommendation Microservice")

@app.post("/recommend", response_model=RecommendationResult)
def generate_recommendations(data: ClientData):
    recommendations = recommend_actions(data.dict())
    return RecommendationResult(recommendations=recommendations)