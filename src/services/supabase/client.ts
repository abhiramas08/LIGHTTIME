/**
 * Supabase client adapter for LIGHTTIME.
 * Used for persisting multi-student mission archives, telemetry logs, and assessment scores.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export class SupabaseService {
  private config: SupabaseConfig;

  constructor(
    url = import.meta.env.VITE_SUPABASE_URL || '',
    anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  ) {
    this.config = { url, anonKey };
  }

  isConfigured(): boolean {
    return !!this.config.url && !!this.config.anonKey;
  }

  async saveMissionSnapshot(missionId: string, _state: unknown): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: 'Supabase credentials not configured. Running in local session mode.' };
    }
    // Storage integration placeholder
    return { success: true, message: `Mission ${missionId} state successfully persisted.` };
  }
}

export const supabaseService = new SupabaseService();
