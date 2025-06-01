import axios from 'axios';
import { JWTResponse, LoginCredentials, User } from '../types/user';

const API_URL = 'http://localhost:8000';

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  private constructor() {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        this.user = JSON.parse(storedUser);
      } else {
        this.user = null;
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de session:', error);
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // 1. Obtenir les tokens JWT
      const response = await axios.post<JWTResponse>(`${API_URL}/auth/jwt/create/`, credentials);
      
      if (!response.data.access || !response.data.refresh) {
        throw new Error('Tokens non reçus');
      }

      this.accessToken = response.data.access;
      this.refreshToken = response.data.refresh;
      
      // Sauvegarder les tokens
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      
      // Configurer axios avec le token d'accès
      this.setupAxiosInterceptors();
      
      // 2. Récupérer les informations de l'utilisateur
      const userResponse = await axios.get<User>(`${API_URL}/auth/users/me/`);
      
      if (!userResponse.data) {
        throw new Error('Données utilisateur non reçues');
      }

      this.user = userResponse.data;
      localStorage.setItem('user', JSON.stringify(this.user));
      
      return this.user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw new Error('Échec de la connexion');
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      if (!this.refreshToken) {
        throw new Error('Pas de token de rafraîchissement');
      }

      const response = await axios.post<{ access: string }>(`${API_URL}/auth/jwt/refresh/`, {
        refresh: this.refreshToken
      });

      if (!response.data.access) {
        throw new Error('Nouveau token non reçu');
      }

      this.accessToken = response.data.access;
      localStorage.setItem('accessToken', this.accessToken);
      return this.accessToken;
    } catch (error) {
      this.logout();
      throw new Error('Échec du rafraîchissement du token');
    }
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken && !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  setupAxiosInterceptors(): void {
    // Supprimer les intercepteurs existants
    axios.interceptors.request.eject(0);
    axios.interceptors.response.eject(0);

    // Ajouter le token d'accès à toutes les requêtes
    axios.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Gérer les erreurs 401 et rafraîchir le token
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export default AuthService.getInstance(); 