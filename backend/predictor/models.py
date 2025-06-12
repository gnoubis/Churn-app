from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female')
    ]
    CONTRACT_CHOICES = [
        ('Month-to-month', 'Month-to-month'),
        ('One year', 'One year'),
        ('Two year', 'Two year')
    ]
    PAYMENT_CHOICES = [
        ('Electronic check', 'Electronic check'),
        ('Mailed check', 'Mailed check'),
        ('Bank transfer (automatic)', 'Bank transfer (automatic)'),
        ('Credit card (automatic)', 'Credit card (automatic)')
    ]
    SERVICE_CHOICES = [
        ('No', 'No'),
        ('Yes', 'Yes'),
        ('No internet service', 'No internet service')
    ]
    INTERNET_SERVICE_CHOICES = [
        ('DSL', 'DSL'),
        ('Fiber optic', 'Fiber optic'),
        ('No', 'No')
    ]
    YES_NO_CHOICES = [
        ('Yes', 'Yes'),
        ('No', 'No')
    ]

    # Informations de base
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Informations démographiques
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    SeniorCitizen = models.BooleanField(default=False)
    Partner = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='No')
    Dependents = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='No')

    # Services de téléphonie
    tenure = models.IntegerField(default=0)
    PhoneService = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='No')
    MultipleLines = models.CharField(max_length=20, choices=[('No phone service', 'No phone service'), ('No', 'No'), ('Yes', 'Yes')], default='No phone service')

    # Services Internet
    InternetService = models.CharField(max_length=20, choices=INTERNET_SERVICE_CHOICES, default='No')
    OnlineSecurity = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='No')
    OnlineBackup = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='No')
    DeviceProtection = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='No')
    TechSupport = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='No')
    StreamingTV = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='No')
    StreamingMovies = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='No')

    # Informations de contrat et paiement
    Contract = models.CharField(max_length=20, choices=CONTRACT_CHOICES, default='Month-to-month')
    PaperlessBilling = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='No')
    PaymentMethod = models.CharField(max_length=30, choices=PAYMENT_CHOICES, default='Electronic check')
    MonthlyCharges = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    TotalCharges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        ordering = ['-created_at']

class ChurnPrediction(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    prediction = models.JSONField()  # peut contenir {'churn': True, 'score': 0.87}
    timestamp = models.DateTimeField(auto_now_add=True)

class Recommendation(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    recommended_offer = models.TextField()
    model_response = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

class SentimentAnalysis(models.Model):
    SENTIMENT_CHOICES = [
        ('très négatif', 'Très négatif'),
        ('négatif', 'Négatif'),
        ('neutre', 'Neutre'),
        ('positif', 'Positif'),
        ('très positif', 'Très positif'),
        ('inconnu', 'Inconnu')
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    message = models.TextField()
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES)
    probabilities = models.JSONField(default=dict)  # Stocke les probabilités pour chaque classe
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sentiment pour {self.client.name}: {self.sentiment}"

class GeneratedMessage(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    # Champs pour le format standard
    tone = models.CharField(max_length=50, blank=True, null=True)
    channel = models.CharField(max_length=20, blank=True, null=True)
    recommended_offer = models.TextField(blank=True, null=True)
    # Champs pour le format personnalisé
    prompt = models.TextField(blank=True, null=True)
    temperature = models.FloatField(default=0.7, null=True)
    max_tokens = models.IntegerField(default=200, null=True)
    # Champs communs
    message = models.TextField()
    model_response = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message for {self.client.name if self.client else 'Custom'} generated at {self.timestamp}"

