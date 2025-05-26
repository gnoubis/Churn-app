import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from joblib import dump

# Chargement des données
df = pd.read_csv('./data/client_data.csv')

X = df[['age', 'months_active', 'nb_complaints']]
y = df['churn']

# Séparation train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entraînement
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Sauvegarde du modèle
dump(model, './models/churn_model.pkl')

print("Modèle entraîné et sauvegardé !")
