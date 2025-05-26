import joblib
from app.utils import preprocess
from app.schemas import ClientData
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer


model = joblib.load("model.joblib")

def predict_churn(data: ClientData):
    # Utiliser les noms des colonnes attendus par le modèle (via alias)
    input_dict = data.dict(by_alias=True)
    input_df = pd.DataFrame([input_dict])

    expected_columns = model.feature_names_in_
    missing_cols = set(expected_columns) - set(input_df.columns)
    if missing_cols:
        raise ValueError(f"Colonnes manquantes : {missing_cols}")

    prediction = model.predict_proba(input_df)[0][1]  # probabilité de churn
    return {"churn_probability": prediction}
