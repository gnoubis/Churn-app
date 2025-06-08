from django.urls import path
from .views import (
    ChurnPredictionView,
    RecommendationView,
    SentimentAnalysisView,  
    MessageGenerationView,
    ClientHistoryView,
    ImportClientsView,
    FullClientProcessingView,
    AllClientsDataView,
    DashboardStatsView,
)

urlpatterns = [
    path('predict-churn/', ChurnPredictionView.as_view()),
    path('recommend/', RecommendationView.as_view()),
    path('sentiment/', SentimentAnalysisView.as_view()),
    path('message-generation/', MessageGenerationView.as_view()),
    path('clients/<int:id>/history/', ClientHistoryView.as_view(), name='client-history'),
    path('clients/import/', ImportClientsView.as_view(), name='import-clients'),
    path('clients/process/', FullClientProcessingView.as_view(), name='process-client'),
    path('clients/all/', AllClientsDataView.as_view(), name='all-clients-data'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
