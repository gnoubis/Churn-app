from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    message = models.TextField()
    sentiment = models.CharField(max_length=20)  # "positif", "négatif", "neutre"
    confidence = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

class GeneratedMessage(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    tone = models.CharField(max_length=50)
    channel = models.CharField(max_length=20)
    recommended_offer = models.TextField()
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

