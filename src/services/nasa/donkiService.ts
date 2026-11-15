import { donkiAdapter } from '@/services/scientific/donkiAdapter';

export interface SolarFlareNotification {
  flrID: string;
  beginTime: string;
  peakTime: string;
  classType: string;
  sourceLocation: string;
}

export class NasaDonkiService {
  async getRecentSolarFlares(startDate?: string, endDate?: string): Promise<SolarFlareNotification[]> {
    try {
      const normalizedFlares = await donkiAdapter.getSolarFlares({ startDate, endDate });
      return normalizedFlares.map((f) => ({
        flrID: f.flrId,
        beginTime: f.beginTime,
        peakTime: f.peakTime,
        classType: f.classType,
        sourceLocation: f.sourceLocation,
      }));
    } catch (err) {
      console.warn('Unable to reach NASA DONKI API, using fallback telemetry:', err);
      return [];
    }
  }
}

export const nasaDonkiService = new NasaDonkiService();
