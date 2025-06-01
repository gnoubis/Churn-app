from pydantic import BaseModel, Field

class ClientData(BaseModel):
    gender: str
    senior_citizen: int = Field(alias="SeniorCitizen")
    partner: str = Field(alias="Partner")
    dependents: str = Field(alias="Dependents")
    tenure: int
    phone_service: str = Field(alias="PhoneService")
    multiple_lines: str = Field(alias="MultipleLines")
    internet_service: str = Field(alias="InternetService")
    online_security: str = Field(alias="OnlineSecurity")
    online_backup: str = Field(alias="OnlineBackup")
    device_protection: str = Field(alias="DeviceProtection")
    tech_support: str = Field(alias="TechSupport")
    streaming_tv: str = Field(alias="StreamingTV")
    streaming_movies: str = Field(alias="StreamingMovies")
    contract: str = Field(alias="Contract")
    paperless_billing: str = Field(alias="PaperlessBilling")
    payment_method: str = Field(alias="PaymentMethod")
    monthly_charges: float = Field(alias="MonthlyCharges")
    total_charges: float = Field(alias="TotalCharges")

class ChurnReason(BaseModel):
    feature: str
    importance: float
    value: str
    impact: str

class Prediction(BaseModel):
    churn_probability: float
    reasons: list[ChurnReason]
    risk_level: str