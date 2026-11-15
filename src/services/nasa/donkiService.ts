export interface SolarFlareNotification {
  flrID: string;
  beginTime: string;
  peakTime: string;
  classType: string; // e.g. "X1.2", "M5.4"
  sourceLocation: string;
}

export class NasaDonkiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey = 'DEMO_KEY', baseUrl = 'https://api.nasa.gov') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getRecentSolarFlares(startDate?: string, endDate?: string): Promise<SolarFlareNotification[]> {
    try {
      const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];
      const url = `${this.baseUrl}/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`NASA DONKI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Unable to reach NASA DONKI API, using fallback telemetry:', err);
      return [];
    }
  }
}

export const nasaDonkiService = new NasaDonkiService();
