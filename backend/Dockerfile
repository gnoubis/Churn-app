FROM python:3.11-slim

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application Django
COPY  . .

# Exposer le port utilisé par Django
EXPOSE 8000

# Commande de lancement (à adapter si tu utilises gunicorn en prod)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]