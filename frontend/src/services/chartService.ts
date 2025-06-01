import axios from 'axios';
import { API_URLS } from '../api/api';

export interface ChartSettings {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  chartType: 'line' | 'bar';
  selectedMetrics: string[];
  startDate?: string;
  endDate?: string;
}

export interface ChurnData {
  month: string;
  churnRate: number;
  trend: number;
}

class ChartService {
  private readonly baseURL = API_URLS.churn;

  async getChurnData(settings: ChartSettings): Promise<ChurnData[]> {
    try {
      const response = await axios.get(`${this.baseURL}/churn/history`, {
        params: {
          timeframe: settings.timeframe,
          startDate: settings.startDate,
          endDate: settings.endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de churn:', error);
      throw error;
    }
  }

  async saveChartSettings(settings: ChartSettings): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/settings/chart`, settings);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      throw error;
    }
  }

  async loadChartSettings(): Promise<ChartSettings> {
    try {
      const response = await axios.get(`${this.baseURL}/settings/chart`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      // Retourner des paramètres par défaut en cas d'erreur
      return {
        timeframe: 'month',
        chartType: 'line',
        selectedMetrics: ['churnRate']
      };
    }
  }

  // Fonction pour exporter les données au format CSV
  exportToCSV(data: ChurnData[]): string {
    const headers = ['Date', 'Taux de Churn', 'Tendance'];
    const csvRows = [headers];

    data.forEach(row => {
      csvRows.push([row.month, row.churnRate.toString(), row.trend.toString()]);
    });

    return csvRows.map(row => row.join(',')).join('\n');
  }

  // Fonction pour sauvegarder le CSV
  downloadCSV(data: ChurnData[], filename: string = 'churn-data.csv'): void {
    const csv = this.exportToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export const chartService = new ChartService(); 