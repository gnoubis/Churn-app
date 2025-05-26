import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Pré-encodage manuel si on connaît les catégories
label_encoders = {
    "gender": LabelEncoder().fit(["Male", "Female"]),
    "partner": LabelEncoder().fit(["Yes", "No"]),
    "contract": LabelEncoder().fit(["Month-to-month", "One year", "Two year"]),
    "payment_method": LabelEncoder().fit([
        "Electronic check", "Mailed check", 
        "Bank transfer (automatic)", "Credit card (automatic)"
    ]),
    "internet_service": LabelEncoder().fit(["DSL", "Fiber optic", "No"]),
    "phone_service": LabelEncoder().fit(["Yes", "No"])
}

def preprocess(data_dict: dict) -> pd.DataFrame:
    df = pd.DataFrame([data_dict])

    # Convertir certaines colonnes numériques si ce n'est pas déjà fait
    df["senior_citizen"] = pd.to_numeric(df["senior_citizen"], errors="coerce")
    df["tenure"] = pd.to_numeric(df["tenure"], errors="coerce")
    df["monthly_charges"] = pd.to_numeric(df["monthly_charges"], errors="coerce")
    df["total_charges"] = pd.to_numeric(df["total_charges"], errors="coerce")

    # Encoder les variables catégorielles
    for col, le in label_encoders.items():
        if col in df:
            df[col] = le.transform(df[col])

    # Gestion des valeurs manquantes (remplacer par 0, ou moyenne selon le cas)
    df = df.fillna(0)

    return df
