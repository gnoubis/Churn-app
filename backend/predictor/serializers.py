from rest_framework import serializers
from .models import Client, ChurnPrediction, Recommendation, SentimentAnalysis, GeneratedMessage



class ClientSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone']

class GeneratedMessageSerializer(serializers.ModelSerializer):
    client = ClientSimpleSerializer(read_only=True)  # Ajout du client associé

    class Meta:
        model = GeneratedMessage
        fields = '__all__'


class ChurnPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChurnPrediction
        fields = '__all__'


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = '__all__'


class SentimentAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentimentAnalysis
        fields = '__all__'


class ClientHistorySerializer(serializers.ModelSerializer):
    churn_predictions = ChurnPredictionSerializer(many=True, read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)
    sentiment_analyses = SentimentAnalysisSerializer(many=True, read_only=True)
    generated_messages = GeneratedMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name',
            'churn_predictions',
            'recommendations',
            'sentiment_analyses',
            'generated_messages'
        ]