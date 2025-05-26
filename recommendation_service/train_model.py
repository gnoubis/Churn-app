import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
import joblib

# Charger les données
df = pd.read_csv("training_data.csv", sep=';', encoding='utf-8')

# Génération des colonnes cibles (exemple selon ton code)
df["Offer_TechSupport_FreeMonth"] = df.apply(
    lambda row: 1 if row["TechSupport"] == "No" and row["InternetService"] != "No" else 0,
    axis=1
)
df["Offer_OnlineBackup_Discount"] = df.apply(
    lambda row: 1 if row["OnlineBackup"] == "No" and row["InternetService"] != "No" else 0,
    axis=1
)
df["Offer_StreamingTV_FreeTrial"] = df.apply(
    lambda row: 1 if row["StreamingTV"] == "No" and row["InternetService"] != "No" else 0,
    axis=1
)

# Séparation des features et des cibles
X = df.drop(columns=[
    "Offer_TechSupport_FreeMonth",
    "Offer_OnlineBackup_Discount",
    "Offer_StreamingTV_FreeTrial",
    "Churn"  # si non utilisé
])
y = df[[
    "Offer_TechSupport_FreeMonth",
    "Offer_OnlineBackup_Discount",
    "Offer_StreamingTV_FreeTrial"
]]

# Détection des colonnes
categorical_cols = X.select_dtypes(include=["object"]).columns.tolist()
numeric_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

# Pipeline de prétraitement
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
        ('num', StandardScaler(), numeric_cols)
    ]
)

# Pipeline complet avec multi-output
clf = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42)))
])

# Entraînement
clf.fit(X, y)

# Sauvegarde du pipeline complet (prétraitement + modèle)
joblib.dump(clf, "model/recommender_pipeline.pkl")

print("✅ Modèle multi-output entraîné et pipeline sauvegardé avec succès.")
