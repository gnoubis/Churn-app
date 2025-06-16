from django.shortcuts import render
import requests, csv
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework import status
from rest_framework.generics import ListAPIView
from .models import Client, ChurnPrediction, Recommendation, SentimentAnalysis, GeneratedMessage
from .serializers import (
    ClientHistorySerializer,
    ChurnPredictionSerializer,
    RecommendationSerializer,
    SentimentAnalysisSerializer,
    GeneratedMessageSerializer
)
from django.core.mail import send_mail


class GeneratedMessageListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GeneratedMessageSerializer

    def get_queryset(self):
        client_id = self.request.query_params.get('client_id')
        if client_id:
            return GeneratedMessage.objects.filter(client__id=client_id).order_by('-timestamp')
        return GeneratedMessage.objects.all().order_by('-timestamp')
    
class SendEmailAndStoreView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        client_name = request.data.get('client_name')
        email = request.data.get('email')
        subject = request.data.get('subject', 'Message Chronex')
        message = request.data.get('message')
        tone = request.data.get('tone', '')
        channel = 'email'
        recommended_offer = request.data.get('recommended_offer', '')
        prompt = request.data.get('prompt', None)
        temperature = request.data.get('temperature', 0.7)
        max_tokens = request.data.get('max_tokens', 200)

        if not all([client_name, email, message]):
            return Response({'error': 'client_name, email et message sont requis.'}, status=400)

        # Récupérer ou créer le client
        client, _ = Client.objects.get_or_create(
            name=client_name,
            defaults={'email': email}
        )

        try:
            send_mail(
                subject,
                message,
                'no-reply@chronex-app.com',  # expéditeur (à adapter)
                [email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'error': f'Erreur lors de l\'envoi de l\'email: {str(e)}'}, status=500)

        # Stocker le message envoyé avec tous les champs du modèle
        GeneratedMessage.objects.create(
            client=client,
            tone=tone,
            channel=channel,
            recommended_offer=recommended_offer,
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            message=message,
            model_response={'send_status': 'email_sent'}
        )

        return Response({'status': 'email_sent', 'client': client.name, 'client_id': client.id, 'email': email})


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
                prediction={
                    "churn_probability": result.get("churn_probability"),
                    "reasons": result.get("reasons", []),
                    "risk_level": result.get("risk_level")
                }
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
        required_fields = [
            'client_name', 'gender', 'SeniorCitizen', 'Partner', 'Dependents',
            'tenure', 'PhoneService', 'MultipleLines', 'InternetService',
            'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport',
            'StreamingTV', 'StreamingMovies', 'Contract', 'PaperlessBilling',
            'PaymentMethod', 'MonthlyCharges', 'TotalCharges'
        ]

        # Vérification des champs requis
        missing_fields = [field for field in required_fields if field not in request.data]
        if missing_fields:
            return Response({
                'error': f'Champs requis manquants: {", ".join(missing_fields)}'
            }, status=400)

        try:
            # Conversion des valeurs numériques
            payload = request.data.copy()
            try:
                payload['MonthlyCharges'] = float(payload['MonthlyCharges'])
                payload['TotalCharges'] = float(payload['TotalCharges'])
                payload['tenure'] = int(payload['tenure'])
                payload['SeniorCitizen'] = bool(payload['SeniorCitizen'])
            except (ValueError, TypeError):
                return Response({
                    'error': 'Les champs MonthlyCharges, TotalCharges doivent être des nombres, tenure doit être un entier, et SeniorCitizen doit être un booléen'
                }, status=400)

            # Appel au service de recommandation
            response = requests.post(settings.RECOMMENDER_URL, json=payload)
            response.raise_for_status()
            result = response.json()

            # Création ou récupération du client
            client, _ = Client.objects.get_or_create(
                name=payload['client_name'],
                defaults={
                    'email': payload.get('email', ''),
                    'phone': payload.get('phone', ''),
                    'gender': payload['gender'],
                    'SeniorCitizen': payload['SeniorCitizen'],
                    'Partner': payload['Partner'],
                    'Dependents': payload['Dependents'],
                    'tenure': payload['tenure'],
                    'PhoneService': payload['PhoneService'],
                    'MultipleLines': payload['MultipleLines'],
                    'InternetService': payload['InternetService'],
                    'OnlineSecurity': payload['OnlineSecurity'],
                    'OnlineBackup': payload['OnlineBackup'],
                    'DeviceProtection': payload['DeviceProtection'],
                    'TechSupport': payload['TechSupport'],
                    'StreamingTV': payload['StreamingTV'],
                    'StreamingMovies': payload['StreamingMovies'],
                    'Contract': payload['Contract'],
                    'PaperlessBilling': payload['PaperlessBilling'],
                    'PaymentMethod': payload['PaymentMethod'],
                    'MonthlyCharges': payload['MonthlyCharges'],
                    'TotalCharges': payload['TotalCharges']
                }
            )

            # Sauvegarde de la recommandation
            recommendation = Recommendation.objects.create(
                client=client,
                recommended_offer=result.get('recommended_offer', ''),
                model_response={
                    "recommendations": result.get('recommendations', []),
                    "details": result.get('details', {})
                }
            )

            serializer = RecommendationSerializer(recommendation)
            return Response(serializer.data)

        except requests.exceptions.RequestException as e:
            # Log l'erreur pour le débogage
            print(f"Erreur lors de l'appel au service de recommandation: {str(e)}")
            if hasattr(e.response, 'json'):
                try:
                    error_detail = e.response.json()
                    return Response({
                        'error': 'Erreur du service de recommandation',
                        'detail': error_detail
                    }, status=e.response.status_code)
                except ValueError:
                    pass
            return Response({
                'error': f'Erreur lors de l\'appel au service de recommandation: {str(e)}'
            }, status=500)

        except Exception as e:
            # Log l'erreur pour le débogage
            print(f"Erreur inattendue dans RecommendationView: {str(e)}")
            return Response({
                'error': f'Une erreur inattendue est survenue: {str(e)}'
            }, status=500)


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
                probabilities=result.get("probabilities", [])
            )

            serializer = SentimentAnalysisSerializer(sentiment)
            return Response(serializer.data)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=500)


class MessageGenerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Validation des champs requis
            required_fields = ['client_name', 'recommended_offer', 'channel', 'tone']
            missing_fields = [field for field in required_fields if field not in request.data]
            if missing_fields:
                return Response({
                    'error': f'Champs requis manquants: {", ".join(missing_fields)}'
                }, status=400)

            # Récupération ou création du client
            client, _ = Client.objects.get_or_create(
                name=request.data['client_name'],
                defaults={
                    'email': request.data.get('client_email', ''),
                    'phone': request.data.get('phone', '')
                }
            )

            # Formatage des données pour le service
            message_data = {
                'client_name': client.name,
                'recommended_offer': request.data['recommended_offer'],
                'channel': request.data['channel'],
                'tone': request.data['tone'],
                'client_email': request.data.get('client_email', client.email)
            }

            # Appel au service de génération de messages
            response = requests.post(settings.MESSAGE_URL, json=message_data)
            response.raise_for_status()
            result = response.json()

            # Sauvegarde du message généré
            message = GeneratedMessage.objects.create(
                client=client,
                tone=message_data['tone'],
                channel=message_data['channel'],
                recommended_offer=message_data['recommended_offer'],
                message=result.get('message', ''),
                model_response=result
            )

            # Préparation de la réponse
            response_data = {
                'id': message.id,
                'client_name': client.name,
                'tone': message.tone,
                'channel': message.channel,
                'recommended_offer': message.recommended_offer,
                'timestamp': message.timestamp,
                'message': message.message,
                'model_response': message.model_response
            }

            return Response(response_data)

        except requests.exceptions.RequestException as e:
            return Response({
                'error': f'Erreur lors de l\'appel au service de génération de messages: {str(e)}'
            }, status=500)
        except Exception as e:
            return Response({
                'error': f'Une erreur inattendue est survenue: {str(e)}'
            }, status=500)


class CustomMessageGenerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Validation des champs requis
            if 'prompt' not in request.data:
                return Response({
                    'error': 'Le champ prompt est requis'
                }, status=400)

            # Validation des paramètres optionnels
            try:
                temperature = float(request.data.get('temperature', 0.7))
                if not 0 <= temperature <= 1:
                    return Response({
                        'error': 'La température doit être comprise entre 0 et 1'
                    }, status=400)
            except ValueError:
                return Response({
                    'error': 'La température doit être un nombre entre 0 et 1'
                }, status=400)

            try:
                max_tokens = int(request.data.get('max_tokens', 200))
                if max_tokens <= 0:
                    return Response({
                        'error': 'Le nombre maximum de tokens doit être positif'
                    }, status=400)
            except ValueError:
                return Response({
                    'error': 'Le nombre maximum de tokens doit être un entier positif'
                }, status=400)

            # Formatage des données pour le service
            message_data = {
                'prompt': request.data['prompt'],
                'temperature': temperature,
                'max_tokens': max_tokens
            }

            # Appel au service de génération de messages personnalisés
            response = requests.post(settings.CUSTOM_MESSAGE_URL, json=message_data)
            response.raise_for_status()
            result = response.json()

            # Sauvegarde du message généré
            message = GeneratedMessage.objects.create(
                client=None,  # Pas de client associé pour les messages personnalisés
                prompt=message_data['prompt'],
                temperature=message_data['temperature'],
                max_tokens=message_data['max_tokens'],
                message=result.get('message', ''),
                model_response=result
            )

            # Préparation de la réponse
            response_data = {
                'id': message.id,
                'prompt': message.prompt,
                'temperature': message.temperature,
                'max_tokens': message.max_tokens,
                'timestamp': message.timestamp,
                'message': message.message,
                'model_response': {
                    k: v for k, v in result.items() if k != 'message'  # Exclure le message du model_response
                }
            }

            return Response(response_data)

        except requests.exceptions.RequestException as e:
            return Response({
                'error': f'Erreur lors de l\'appel au service de génération de messages personnalisés: {str(e)}'
            }, status=500)
        except Exception as e:
            return Response({
                'error': f'Une erreur inattendue est survenue: {str(e)}'
            }, status=500)


class ClientHistoryView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Client.objects.all()
    serializer_class = ClientHistorySerializer
    lookup_field = 'id'  # ou 'name' si tu préfères


class FullClientProcessingView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]

    def format_data_for_recommendation(self, data):
        """Formate les données selon le schéma attendu par le service de recommandation"""
        return {
            'gender': data['gender'],
            'SeniorCitizen': int(data['SeniorCitizen']),  # Conversion en int
            'Partner': data['Partner'],
            'Dependents': data['Dependents'],
            'tenure': int(data['tenure']),
            'PhoneService': data['PhoneService'],
            'MultipleLines': data['MultipleLines'],
            'InternetService': data['InternetService'],
            'OnlineSecurity': data['OnlineSecurity'],
            'OnlineBackup': data['OnlineBackup'],
            'DeviceProtection': data['DeviceProtection'],
            'TechSupport': data['TechSupport'],
            'StreamingTV': data['StreamingTV'],
            'StreamingMovies': data['StreamingMovies'],
            'Contract': data['Contract'],
            'PaperlessBilling': data['PaperlessBilling'],
            'PaymentMethod': data['PaymentMethod'],
            'MonthlyCharges': float(data['MonthlyCharges']),
            'TotalCharges': float(data['TotalCharges'])
        }

    def format_data_for_sentiment(self, data):
        """Formate les données pour le service de sentiment"""
        return {
            'text': data.get('message', '')
        }

    def call_service(self, service_url, data, service_name):
        """Appelle un service externe et gère les erreurs de connexion"""
        # S'assurer que l'URL se termine par un slash
        if not service_url.endswith('/'):
            service_url += '/'
            
        try:
            response = requests.post(
                service_url, 
                json=data, 
                timeout=5,
                allow_redirects=True  # Suivre les redirections automatiquement
            )
            response.raise_for_status()
            return response.json(), None
        except requests.exceptions.ConnectionError as e:
            print(f"Erreur de connexion au service {service_name}: {str(e)}")
            return None, f"Le service {service_name} n'est pas accessible pour le moment"
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de l'appel au service {service_name}: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status code: {e.response.status_code}")
                print(f"Response: {e.response.text}")
            return None, str(e)

    def post(self, request):
        # Vérifier si un fichier CSV a été fourni
        if 'file' in request.FILES:
            file = request.FILES['file']
            if not file.name.endswith('.csv'):
                return Response({'error': 'Le fichier doit être au format CSV'}, status=400)

            try:
                decoded_file = file.read().decode('utf-8').splitlines()
                reader = csv.DictReader(decoded_file)
                
                # Vérifier les champs requis dans le CSV
                required_fields = [
                    'client_name', 'gender', 'SeniorCitizen', 'Partner', 'Dependents',
                    'tenure', 'PhoneService', 'MultipleLines', 'InternetService',
                    'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport',
                    'StreamingTV', 'StreamingMovies', 'Contract', 'PaperlessBilling',
                    'PaymentMethod', 'MonthlyCharges', 'TotalCharges'
                ]
                
                # Vérifier que tous les champs requis sont présents dans le CSV
                missing_fields = [field for field in required_fields if field not in reader.fieldnames]
                if missing_fields:
                    return Response({
                        'error': f'Champs requis manquants dans le CSV: {", ".join(missing_fields)}'
                    }, status=400)

                results = []
                errors = []
                
                # Traiter chaque ligne du CSV
                for row in reader:
                    try:
                        # Appel au service de prédiction de churn
                        churn_result, churn_error = self.call_service(
                            settings.CHURN_URL,
                            row,
                            "prédiction de churn"
                        )

                        # Appel au service de recommandation
                        recommendation_data = self.format_data_for_recommendation(row)
                        rec_result, rec_error = self.call_service(
                            settings.RECOMMENDER_URL,
                            recommendation_data,
                            "recommandation"
                        )

                        # Si un message est fourni dans le CSV, faire l'analyse de sentiment
                        sentiment_result = None
                        if 'message' in row and row['message']:
                            sentiment_data = self.format_data_for_sentiment(row)
                            sentiment_result, sentiment_error = self.call_service(
                                settings.SENTIMENT_URL,
                                sentiment_data,
                                "analyse de sentiment"
                            )

                        # Créer ou mettre à jour le client
                        client, _ = Client.objects.get_or_create(
                            name=row['client_name'],
                            defaults={
                                'email': row.get('email', ''),
                                'phone': row.get('phone', ''),
                                'gender': row['gender'],
                                'SeniorCitizen': bool(int(row['SeniorCitizen'])),
                                'Partner': row['Partner'],
                                'Dependents': row['Dependents'],
                                'tenure': int(row['tenure']),
                                'PhoneService': row['PhoneService'],
                                'MultipleLines': row['MultipleLines'],
                                'InternetService': row['InternetService'],
                                'OnlineSecurity': row['OnlineSecurity'],
                                'OnlineBackup': row['OnlineBackup'],
                                'DeviceProtection': row['DeviceProtection'],
                                'TechSupport': row['TechSupport'],
                                'StreamingTV': row['StreamingTV'],
                                'StreamingMovies': row['StreamingMovies'],
                                'Contract': row['Contract'],
                                'PaperlessBilling': row['PaperlessBilling'],
                                'PaymentMethod': row['PaymentMethod'],
                                'MonthlyCharges': float(row['MonthlyCharges']),
                                'TotalCharges': float(row['TotalCharges'])
                            }
                        )

                        # Sauvegarder les résultats
                        client_results = {}
                        
                        if churn_result:
                            ChurnPrediction.objects.create(
                                client=client,
                                prediction={
                                    "churn_probability": churn_result.get("churn_probability"),
                                    "reasons": churn_result.get("reasons", []),
                                    "risk_level": churn_result.get("risk_level")
                                }
                            )
                            client_results["churn"] = churn_result

                        if rec_result:
                            Recommendation.objects.create(
                                client=client,
                                recommended_offer=rec_result.get("recommendations", []),
                                model_response={
                                    "recommendations": rec_result.get("recommendations", []),
                                    "details": rec_result.get("details", {})
                                }
                            )
                            client_results["recommendation"] = rec_result

                        if sentiment_result:
                            SentimentAnalysis.objects.create(
                                client=client,
                                message=row.get('message', ''),
                                sentiment=sentiment_result.get('label', ''),
                                probabilities=sentiment_result.get('probabilities', [])
                            )
                            client_results["sentiment"] = {
                                "sentiment": sentiment_result.get('label', ''),
                                "probabilities": sentiment_result.get('probabilities', [])
                            }

                        results.append({
                            'client_name': row['client_name'],
                            'results': client_results
                        })

                    except Exception as e:
                        errors.append({
                            'client_name': row.get('client_name', 'Unknown'),
                            'error': str(e)
                        })

                return Response({
                    'processed': len(results),
                    'errors': len(errors),
                    'results': results,
                    'error_details': errors
                })

            except Exception as e:
                return Response({
                    'error': f'Erreur lors du traitement du fichier CSV: {str(e)}'
                }, status=400)

        # Traitement d'un seul client (comportement existant)
        required_fields = [
            'client_name', 'gender', 'SeniorCitizen', 'Partner', 'Dependents',
            'tenure', 'PhoneService', 'MultipleLines', 'InternetService',
            'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport',
            'StreamingTV', 'StreamingMovies', 'Contract', 'PaperlessBilling',
            'PaymentMethod', 'MonthlyCharges', 'TotalCharges'
        ]

        # Vérification des champs requis
        missing_fields = [field for field in required_fields if field not in request.data]
        if missing_fields:
            return Response({
                'error': f'Champs requis manquants: {", ".join(missing_fields)}'
            }, status=400)

        try:
            results = {}

            # Appel au service de prédiction de churn
            churn_result, churn_error = self.call_service(
                settings.CHURN_URL,
                request.data,
                "prédiction de churn"
            )
            if churn_result:
                results["churn"] = churn_result
            if churn_error:
                results["churn_error"] = churn_error

            # Si un message est fourni, analyse du sentiment
            if request.data.get('message'):
                sentiment_data = self.format_data_for_sentiment(request.data)
                sentiment_result, sentiment_error = self.call_service(
                    settings.SENTIMENT_URL,
                    sentiment_data,
                    "analyse de sentiment"
                )
                if sentiment_result:
                    results["sentiment"] = {
                        "sentiment": sentiment_result["label"],
                        "probabilities": sentiment_result["probabilities"]
                    }
                if sentiment_error:
                    results["sentiment_error"] = sentiment_error

            # Appel au service de recommandation avec les données formatées
            recommendation_data = self.format_data_for_recommendation(request.data)
            rec_result, rec_error = self.call_service(
                settings.RECOMMENDER_URL,
                recommendation_data,
                "recommandation"
            )
            if rec_result:
                results["recommendation"] = rec_result
            if rec_error:
                results["recommendation_error"] = rec_error

            # Sauvegarde du client et des résultats
            try:
                client, _ = Client.objects.get_or_create(
                    name=request.data['client_name'],
                    defaults={
                        'email': request.data.get('email', ''),
                        'phone': request.data.get('phone', ''),
                        'gender': request.data['gender'],
                        'SeniorCitizen': bool(int(request.data['SeniorCitizen'])),
                        'Partner': request.data['Partner'],
                        'Dependents': request.data['Dependents'],
                        'tenure': int(request.data['tenure']),
                        'PhoneService': request.data['PhoneService'],
                        'MultipleLines': request.data['MultipleLines'],
                        'InternetService': request.data['InternetService'],
                        'OnlineSecurity': request.data['OnlineSecurity'],
                        'OnlineBackup': request.data['OnlineBackup'],
                        'DeviceProtection': request.data['DeviceProtection'],
                        'TechSupport': request.data['TechSupport'],
                        'StreamingTV': request.data['StreamingTV'],
                        'StreamingMovies': request.data['StreamingMovies'],
                        'Contract': request.data['Contract'],
                        'PaperlessBilling': request.data['PaperlessBilling'],
                        'PaymentMethod': request.data['PaymentMethod'],
                        'MonthlyCharges': float(request.data['MonthlyCharges']),
                        'TotalCharges': float(request.data['TotalCharges'])
                    }
                )

                if "churn" in results:
                    ChurnPrediction.objects.create(
                        client=client,
                        prediction={
                            "churn_probability": results["churn"].get("churn_probability"),
                            "reasons": results["churn"].get("reasons", []),
                            "risk_level": results["churn"].get("risk_level")
                        }
                    )

                if "recommendation" in results:
                    Recommendation.objects.create(
                        client=client,
                        recommended_offer=results["recommendation"].get("recommendations", []),
                        model_response={
                            "recommendations": results["recommendation"].get("recommendations", []),
                            "details": results["recommendation"].get("details", {})
                        }
                    )

                if "sentiment" in results:
                    SentimentAnalysis.objects.create(
                        client=client,
                        message=request.data.get("message", ""),
                        sentiment=results["sentiment"]["sentiment"],
                        probabilities=results["sentiment"]["probabilities"]
                    )

            except Exception as e:
                print(f"Erreur lors de la sauvegarde en base de données: {str(e)}")
                results["db_error"] = str(e)

            # Si aucun service n'a répondu, renvoyer une erreur
            if not any(key in results for key in ["churn", "sentiment", "recommendation"]):
                return Response({
                    'error': 'Aucun service n\'est accessible pour le moment',
                    'details': results
                }, status=503)

            return Response(results)

        except ValueError as e:
            return Response({
                'error': f'Erreur de validation des données: {str(e)}'
            }, status=400)
        except Exception as e:
            print(f"Erreur inattendue dans FullClientProcessingView: {str(e)}")
            return Response({
                'error': f'Une erreur inattendue est survenue: {str(e)}'
            }, status=500)


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


class AllClientsDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Vérifier si l'utilisateur est authentifié
            if not request.user.is_authenticated:
                return Response({
                    'detail': 'Authentication credentials were not provided.',
                    'code': 'not_authenticated'
                }, status=401)

            # Récupérer tous les clients avec leurs analyses
            clients = Client.objects.all()
            
            results = []
            for client in clients:
                client_data = {
                    'id': client.id,
                    'name': client.name,
                    'email': client.email,
                    'phone': client.phone,
                    'analyses': {
                        'churn_predictions': [],
                        'recommendations': [],
                        'sentiment_analyses': [],
                        'generated_messages': []
                    }
                }

                # Récupérer les prédictions de churn
                churn_predictions = ChurnPrediction.objects.filter(client=client).order_by('-timestamp')
                for prediction in churn_predictions:
                    client_data['analyses']['churn_predictions'].append({
                        'id': prediction.id,
                        'timestamp': prediction.timestamp,
                        'prediction': prediction.prediction
                    })

                # Récupérer les recommandations
                recommendations = Recommendation.objects.filter(client=client).order_by('-timestamp')
                for recommendation in recommendations:
                    client_data['analyses']['recommendations'].append({
                        'id': recommendation.id,
                        'timestamp': recommendation.timestamp,
                        'recommended_offer': recommendation.recommended_offer,
                        'model_response': recommendation.model_response
                    })

                # Récupérer les analyses de sentiment
                sentiment_analyses = SentimentAnalysis.objects.filter(client=client).order_by('-timestamp')
                for analysis in sentiment_analyses:
                    client_data['analyses']['sentiment_analyses'].append({
                        'id': analysis.id,
                        'timestamp': analysis.timestamp,
                        'message': analysis.message,
                        'sentiment': analysis.sentiment
                    })

                # Récupérer les messages générés
                generated_messages = GeneratedMessage.objects.filter(client=client).order_by('-timestamp')
                for message in generated_messages:
                    client_data['analyses']['generated_messages'].append({
                        'id': message.id,
                        'timestamp': message.timestamp,
                        'tone': message.tone,
                        'channel': message.channel,
                        'recommended_offer': message.recommended_offer,
                        'message': message.message
                    })

                results.append(client_data)

            return Response({
                'total_clients': len(results),
                'clients': results
            })

        except Exception as e:
            return Response({
                'detail': f'Une erreur est survenue lors de la récupération des données: {str(e)}',
                'code': 'server_error'
            }, status=500)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from django.db.models import Count, Q
            from django.utils import timezone
            from datetime import timedelta
            import json

            # Période pour les nouveaux clients (30 derniers jours)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            
            # Période pour l'évolution du taux de churn (6 derniers mois)
            six_months_ago = timezone.now() - timedelta(days=180)

            # 1. Clients Actifs
            # Un client est considéré comme actif s'il n'a pas de prédiction de churn récente avec une probabilité élevée
            active_clients = Client.objects.filter(
                ~Q(churnprediction__prediction__contains={'churn_probability': {'gt': 0.7}})
            ).distinct().count()

            # 2. Nouveaux Clients (créés dans les 30 derniers jours)
            new_clients = Client.objects.filter(
                created_at__gte=thirty_days_ago
            ).count()

            # 3. Taux de Churn actuel
            total_clients = Client.objects.count()
            churn_risk_clients = Client.objects.filter(
                churnprediction__prediction__contains={'churn_probability': {'gt': 0.7}}
            ).distinct().count()
            
            current_churn_rate = (churn_risk_clients / total_clients * 100) if total_clients > 0 else 0

            # 4. Évolution du Taux de Churn (6 derniers mois)
            # Créer des intervalles de 30 jours
            churn_evolution = []
            for i in range(6):
                start_date = six_months_ago + timedelta(days=i*30)
                end_date = start_date + timedelta(days=30)
                
                # Nombre total de clients dans cette période
                period_total = Client.objects.filter(
                    created_at__lte=end_date
                ).count()
                
                # Nombre de clients à risque de churn dans cette période
                period_churn_risk = Client.objects.filter(
                    churnprediction__timestamp__range=[start_date, end_date],
                    churnprediction__prediction__contains={'churn_probability': {'gt': 0.7}}
                ).distinct().count()
                
                # Calculer le taux de churn pour cette période
                period_churn_rate = (period_churn_risk / period_total * 100) if period_total > 0 else 0
                
                churn_evolution.append({
                    'date': start_date.strftime('%Y-%m-%d'),
                    'churn_rate': round(period_churn_rate, 2)
                })

            return Response({
                'active_clients': active_clients,
                'new_clients': new_clients,
                'current_churn_rate': round(current_churn_rate, 2),
                'churn_evolution': churn_evolution,
                'total_clients': total_clients
            })

        except Exception as e:
            return Response({
                'error': f'Une erreur est survenue lors de la récupération des statistiques: {str(e)}'
            }, status=500)
