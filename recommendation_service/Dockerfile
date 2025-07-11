# Utilise une image Python légère comme base
FROM python:3.11-slim

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie le fichier des dépendances Python
COPY requirements.txt .

# Installe les dépendances Python
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copie tout le code de l'application dans le conteneur
COPY . .

# Expose le port utilisé par le service (5001)
EXPOSE 5001

# Commande pour démarrer le service avec Uvicorn
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "5001"]