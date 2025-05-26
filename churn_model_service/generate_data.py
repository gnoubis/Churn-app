import pandas as pd
import numpy as np

# Fixer la graine aléatoire pour reproductibilité
np.random.seed(42)

# Nombre de clients
n_clients = 500

# Génération des données synthétiques
data = {
    "age": np.random.randint(18, 70, size=n_clients),
    "months_active": np.random.randint(1, 24, size=n_clients),
    "nb_complaints": np.random.poisson(1.5, size=n_clients),
}

# Calcul simplifié du churn (abandon)
# Par exemple : plus le client est jeune et plus il a de plaintes, plus il risque d’abandonner
prob_churn = (
    0.3 * (data["age"] < 30).astype(float) +
    0.4 * (data["months_active"] < 6).astype(float) +
    0.5 * (data["nb_complaints"] > 2).astype(float)
)

# Conversion en 0/1 selon un seuil
churn = (prob_churn > 0.5).astype(int)

data["churn"] = churn

# Création du DataFrame
df = pd.DataFrame(data)

# Sauvegarde dans un CSV
df.to_csv("data/client_data.csv", index=False)

print("Fichier client_data.csv généré avec succès !")
