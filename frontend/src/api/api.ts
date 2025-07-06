import axios from 'axios';

// Configuration des URLs des microservices
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Configuration d'Axios
const createAxiosInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Instances Axios pour chaque microservice
const churnAPI = createAxiosInstance(API_URL);
const sentimentAPI = createAxiosInstance(API_URL);
const communicationAPI = createAxiosInstance(API_URL);

// Types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  churnRisk: number;
  sentiment: string;
  lastContact: string;
}

export interface ChurnPrediction {
  clientId: number;
  probability: number;
  factors: string[];
}

export interface SentimentAnalysis {
  clientId: number;
  sentiment: string;
  score: number;
}

// API Calls
export const clientAPI = {
  // Récupérer la liste des clients
  getClients: async () => {
    const response = await churnAPI.get<Client[]>('/clients');
    return response.data;
  },

  // Récupérer un client spécifique
  getClient: async (id: number) => {
    const response = await churnAPI.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Obtenir les prédictions de churn
  getChurnPrediction: async (clientId: number) => {
    const response = await churnAPI.get<ChurnPrediction>(`/predictions/${clientId}`);
    return response.data;
  },

  // Analyser le sentiment
  analyzeSentiment: async (clientId: number, text: string) => {
    const response = await sentimentAPI.post<SentimentAnalysis>('/analyze', {
      clientId,
      text,
    });
    return response.data;
  },

  // Envoyer un email
  sendEmail: async (clientId: number, subject: string, content: string) => {
    const response = await communicationAPI.post('/email', {
      clientId,
      subject,
      content,
    });
    return response.data;
  },

  // Envoyer un SMS
  sendSMS: async (clientId: number, message: string) => {
    const response = await communicationAPI.post('/sms', {
      clientId,
      message,
    });
    return response.data;
  },
};

export default clientAPI; 