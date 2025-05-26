import joblib
import pandas as pd

model = joblib.load("model/recommender_pipeline.pkl")

labels = [
    "Proposer 1 mois gratuit sur le support technique",
    "Offrir une réduction sur Online Backup",
    "Proposer un essai gratuit pour Streaming TV"
]

def recommend_actions(client_data: dict):
    df = pd.DataFrame([client_data])

    # Accéder au transformateur (pipeline) pour identifier les colonnes catégorielles
    column_transformer = model.named_steps['preprocessor']  # adapte le nom si différent
    for name, transformer, columns in column_transformer.transformers_:
        if name == 'cat':  # ou autre nom que tu as donné
            for col in columns:
                if col in df.columns:
                    df[col] = df[col].astype(str)

    # Remplace les valeurs manquantes
    df.fillna('missing', inplace=True)

    # Prédiction
    predictions = model.predict(df)[0]
    return [label for pred, label in zip(predictions, labels) if pred == 1]
