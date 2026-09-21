import { query } from '../database/pool';

export interface SettingRow {
  id: number;
  setting_key: string;
  setting_value: any;
  setting_group: string | null;
  created_at: string;
  updated_at: string;
}

export const SettingsRepository = {
  async getAll(): Promise<Record<string, any>> {
    const rows = await query.rows<SettingRow>('SELECT setting_key, setting_value, setting_group FROM settings');
    const result: Record<string, any> = {};
    for (const r of rows) {
      let val = r.setting_value;
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch {
          // keep as string
        }
      }
      result[r.setting_key] = val;
    }
    return result;
  },

  async get(key: string): Promise<any> {
    const row = await query.one<SettingRow>('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    if (!row) return null;
    let val = row.setting_value;
    if (typeof val === 'string') {
      try {
        val = JSON.parse(val);
      } catch {
        // keep string
      }
    }
    return val;
  },

  async save(key: string, value: any, group: string = 'general'): Promise<void> {
    const valJson = JSON.stringify(value);
    await query.run(
      `INSERT INTO settings (setting_key, setting_value, setting_group)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_group = VALUES(setting_group), updated_at = NOW()`,
      [key, valJson, group]
    );
  },

  async saveMany(settings: Record<string, any>, group: string = 'general'): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.save(key, value, group);
    }
  },
};
