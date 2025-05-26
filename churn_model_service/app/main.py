from fastapi import FastAPI
from app.model import predict_churn
from app.schemas import ClientData, Prediction

app = FastAPI(title="Churn Prediction Microservice")

@app.post("/predict", response_model=Prediction)
def predict(data: ClientData):
    result = predict_churn(data)
    return result
