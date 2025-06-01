import joblib
from app.utils import preprocess
from app.schemas import ClientData, ChurnReason
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer


model = joblib.load("model.joblib")

def get_feature_impact(feature_name: str, feature_value: str, importance: float) -> str:
    """Détermine l'impact d'une feature sur le risque de churn."""
    high_risk_indicators = {
        "Contract": {"Month-to-month": "Contrat mensuel indique une faible fidélité"},
        "tenure": lambda x: "Faible ancienneté (moins d'un an)" if float(x) < 12 else None,
        "MonthlyCharges": lambda x: "Charges mensuelles élevées" if float(x) > 70 else None,
        "InternetService": {"Fiber optic": "Service Internet fibre optique plus sujet au churn"},
        "OnlineSecurity": {"No": "Absence de sécurité en ligne"},
        "TechSupport": {"No": "Absence de support technique"},
        "PaymentMethod": {"Electronic check": "Paiement par chèque électronique plus risqué"}
    }

    if feature_name in high_risk_indicators:
        if callable(high_risk_indicators[feature_name]):
            return high_risk_indicators[feature_name](feature_value) or "Impact neutre"
        elif isinstance(high_risk_indicators[feature_name], dict):
            return high_risk_indicators[feature_name].get(feature_value, "Impact neutre")
    return "Impact neutre"

def predict_churn(data: ClientData):
    # Utiliser les noms des colonnes attendus par le modèle (via alias)
    input_dict = data.dict(by_alias=True)
    input_df = pd.DataFrame([input_dict])

    expected_columns = model.feature_names_in_
    missing_cols = set(expected_columns) - set(input_df.columns)
    if missing_cols:
        raise ValueError(f"Colonnes manquantes : {missing_cols}")

    # Prédiction
    prediction_proba = model.predict_proba(input_df)[0][1]
    
    # Analyse des features importantes
    feature_importance = dict(zip(model.feature_names_in_, model.named_steps['classifier'].feature_importances_))
    
    # Trier les features par importance
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    
    # Prendre les 5 features les plus importantes
    top_reasons = []
    for feature_name, importance in sorted_features[:5]:
        if importance > 0.01:  # Seuil minimal d'importance
            feature_value = str(input_df[feature_name].iloc[0])
            impact = get_feature_impact(feature_name, feature_value, importance)
            
            reason = ChurnReason(
                feature=feature_name,
                importance=float(importance),
                value=feature_value,
                impact=impact
            )
            top_reasons.append(reason)
    
    # Déterminer le niveau de risque
    risk_level = "Élevé" if prediction_proba > 0.7 else "Moyen" if prediction_proba > 0.3 else "Faible"
    
    return {
        "churn_probability": prediction_proba,
        "reasons": top_reasons,
        "risk_level": risk_level
    }
