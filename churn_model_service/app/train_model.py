import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
import joblib

# Charger les données
df = pd.read_csv("data/telco_churn.csv", sep=";")

# Cible
df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

# Nettoyage des données
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())

# Vérification des valeurs manquantes
if df.isnull().sum().sum() > 0:
    print("Attention : des valeurs manquantes ont été détectées.")
    df = df.fillna(method="ffill")  # Remplissage par propagation

# Colonnes
X = df.drop("Churn", axis=1)
y = df["Churn"]

categorical_cols = X.select_dtypes(include=["object"]).columns.tolist()
numeric_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

# Vérification des colonnes catégoriques et numériques
if not categorical_cols:
    print("Aucune colonne catégorique détectée.")
if not numeric_cols:
    print("Aucune colonne numérique détectée.")

# Pipeline de prétraitement
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
        ('num', StandardScaler(), numeric_cols)
    ]
)

# Pipeline complet
clf = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Entraînement
clf.fit(X, y)

# Sauvegarde
joblib.dump(clf, "model.joblib")
print("Modèle et preprocessing sauvegardés.")