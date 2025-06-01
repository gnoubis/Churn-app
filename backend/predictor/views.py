from django.shortcuts import render
import requests, csv
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from .models import Client, ChurnPrediction, Recommendation, SentimentAnalysis, GeneratedMessage
from .serializers import (
    ClientHistorySerializer,
    ChurnPredictionSerializer,
    RecommendationSerializer,
    SentimentAnalysisSerializer,
    GeneratedMessageSerializer
)


class ChurnPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.data

        # Validation minimale
        if not payload.get("client_name"):
            return Response({"error": "client_name is required."}, status=400)

        try:
            # Appel à l'API FastAPI de prédiction
            response = requests.post(settings.CHURN_URL, json=payload)
            response.raise_for_status()  # Lève une exception si status_code >= 400

            result = response.json()

            # Création ou récupération du client
            client, _ = Client.objects.get_or_create(
                name=payload.get("client_name"),
                defaults={
                    "email": payload.get("email", ""),
                    "phone": payload.get("phone", "")
                }
            )

            # Sauvegarde de la prédiction liée au client
            prediction = ChurnPrediction.objects.create(
                client=client,
                prediction=result
            )

            # Sérialisation et réponse
            serializer = ChurnPredictionSerializer(prediction)
            return Response(serializer.data)

        except requests.exceptions.RequestException as e:
            return Response({"error": f"Erreur lors de l'appel au service de prédiction: {str(e)}"}, status=500)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.data
        try:
            response = requests.post(settings.RECOMMENDER_URL, json=payload)
            result = response.json()

            client, _ = Client.objects.get_or_create(name=payload.get("client_name"))

            recommendation = Recommendation.objects.create(
                client=client,
                recommended_offer=result.get("recommended_offer", ""),
                model_response=result
            )

            serializer = RecommendationSerializer(recommendation)
            return Response(serializer.data)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=500)


class SentimentAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.data
        try:
            response = requests.post(settings.SENTIMENT_URL, json=payload)
            result = response.json()

            client, _ = Client.objects.get_or_create(name=payload.get("client_name"))

            sentiment = SentimentAnalysis.objects.create(
                client=client,
                message=payload.get("message", ""),
                sentiment=result.get("sentiment", "inconnu"),
                confidence=result.get("confidence", 0.0)
            )

            serializer = SentimentAnalysisSerializer(sentiment)
            return Response(serializer.data)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=500)


class MessageGenerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.data
        try:
            response = requests.post(settings.MESSAGE_URL, json=payload)
            result = response.json()

            client, _ = Client.objects.get_or_create(name=payload.get("client_name"))

            message = GeneratedMessage.objects.create(
                client=client,
                tone=payload.get("tone", "inconnu"),
                channel=payload.get("channel", "inconnu"),
                recommended_offer=payload.get("recommended_offer", ""),
                message=result.get("message", "")
            )

            serializer = GeneratedMessageSerializer(message)
            return Response(serializer.data)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=500)


class ClientHistoryView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Client.objects.all()
    serializer_class = ClientHistorySerializer
    lookup_field = 'id'  # ou 'name' si tu préfères


class FullClientProcessingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        client = None
        if "client_id" in request.data:
            client = Client.objects.filter(id=request.data["client_id"]).first()
        elif "client_name" in request.data:
            client = Client.objects.filter(name=request.data["client_name"]).first()

        if not client:
            return Response({"error": "Client introuvable"}, status=404)


        payload = {
            "client_name": client.name,
            "phone": client.phone,
            "email": client.email or "",
            "message": request.data.get("message", ""),  # utilisé par le sentiment
            "tone": request.data.get("tone", "neutral"),  # utilisé par message generation
            "channel": request.data.get("channel", "sms"),  # idem
        }

        results = {}

        try:
            churn_res = requests.post(settings.CHURN_URL, json=payload).json()
            ChurnPrediction.objects.create(client=client, prediction=churn_res)
            results["churn"] = churn_res
        except Exception as e:
            results["churn_error"] = str(e)

        try:
            rec_res = requests.post(settings.RECOMMENDER_URL, json=payload).json()
            Recommendation.objects.create(client=client, recommended_offer=rec_res.get("recommended_offer", ""), model_response=rec_res)
            results["recommendation"] = rec_res
        except Exception as e:
            results["recommendation_error"] = str(e)

        try:
            senti_res = requests.post(settings.SENTIMENT_URL, json=payload).json()
            SentimentAnalysis.objects.create(client=client, message=payload.get("message", ""), sentiment=senti_res.get("sentiment", ""), confidence=senti_res.get("confidence", 0.0))
            results["sentiment"] = senti_res
        except Exception as e:
            results["sentiment_error"] = str(e)

        try:
            msg_res = requests.post(settings.MESSAGE_URL, json=payload).json()
            GeneratedMessage.objects.create(
                client=client,
                tone=payload["tone"],
                channel=payload["channel"],
                recommended_offer=payload.get("recommended_offer", ""),
                message=msg_res.get("message", "")
            )
            results["generated_message"] = msg_res
        except Exception as e:
            results["message_error"] = str(e)

        return Response(results)


class ImportClientsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni.'}, status=400)

        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        created_clients = []
        for row in reader:
            client, created = Client.objects.get_or_create(
                name=row.get('name'),
                defaults={
                    'phone': row.get('phone', ''),
                    'email': row.get('email', None)
                }
            )
            if created:
                created_clients.append(client.name)

        return Response({'message': f"{len(created_clients)} client(s) importé(s)", 'clients': created_clients}, status=201)
