// East Africa Time (EAT: UTC+3) and Adaptive Global Time System for CampusFlow TZ

export type TimezoneMode = 'eat' | 'auto' | 'local';

export interface TimezoneInfo {
  mode: TimezoneMode;
  detectedTimezone: string;
  isEastAfrica: boolean;
  offsetHours: number;
  label: string;
  shortCode: string;
}

const STORAGE_KEY = 'campusflow_timezone_mode_v1';

export const TimeService = {
  getDetectedTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Dar_es_Salaam';
    } catch {
      return 'Africa/Dar_es_Salaam';
    }
  },

  isEastAfricaTimezone(tz?: string): boolean {
    const timezone = tz || TimeService.getDetectedTimezone();
    const eastAfricanZones = [
      'Africa/Dar_es_Salaam',
      'Africa/Nairobi',
      'Africa/Kampala',
      'Africa/Kigali',
      'Africa/Bujumbura',
      'Africa/Addis_Ababa',
      'Africa/Mogadishu',
      'Africa/Djibouti',
      'Africa/Asmara',
      'Indian/Antananarivo',
      'Indian/Comoro',
    ];

    if (eastAfricanZones.includes(timezone)) return true;

    // Check UTC offset (+3 hours)
    try {
      const now = new Date();
      // Date in UTC vs local
      const localOffsetMinutes = -now.getTimezoneOffset(); // e.g. +180 for UTC+3
      return localOffsetMinutes === 180;
    } catch {
      return true; // Default to true for CampusFlow TZ
    }
  },

  getSavedMode(): TimezoneMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as TimezoneMode;
      if (saved && ['eat', 'auto', 'local'].includes(saved)) {
        return saved;
      }
    } catch {}
    // Default: 'auto', which resolves to EAT if in East Africa or shows EAT campus clock with local adaptation
    return 'auto';
  },

  setMode(mode: TimezoneMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  },

  getTimezoneInfo(): TimezoneInfo {
    const mode = TimeService.getSavedMode();
    const detectedTimezone = TimeService.getDetectedTimezone();
    const isEastAfrica = TimeService.isEastAfricaTimezone(detectedTimezone);

    let shortCode = 'EAT';
    let label = 'East Africa Time (UTC+3)';
    let offsetHours = 3;

    if (mode === 'local') {
      try {
        const now = new Date();
        offsetHours = -now.getTimezoneOffset() / 60;
        shortCode = detectedTimezone.split('/').pop()?.replace(/_/g, ' ') || 'Local';
        label = `Local Time (${detectedTimezone}, UTC${offsetHours >= 0 ? '+' : ''}${offsetHours})`;
      } catch {
        shortCode = 'Local';
      }
    } else if (mode === 'auto') {
      if (isEastAfrica) {
        shortCode = 'EAT';
        label = 'East Africa Time (Dar es Salaam, UTC+3)';
        offsetHours = 3;
      } else {
        try {
          const now = new Date();
          const localOffset = -now.getTimezoneOffset() / 60;
          shortCode = `Local (UTC${localOffset >= 0 ? '+' : ''}${localOffset}) • Campus EAT (UTC+3)`;
          label = `Local (${detectedTimezone}) • Official Campus EAT (UTC+3)`;
          offsetHours = localOffset;
        } catch {
          shortCode = 'EAT';
        }
      }
    }

    return {
      mode,
      detectedTimezone,
      isEastAfrica,
      offsetHours,
      label,
      shortCode,
    };
  },

  /**
   * Format a date into East Africa Time (UTC+3)
   */
  formatInEAT(dateInput: Date | string | number = new Date(), options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Dar_es_Salaam',
      hour: '2-digit',
      minute: '2-digit',
      second: undefined,
      hour12: true,
      ...options,
    };

    try {
      return new Intl.DateTimeFormat('en-GB', defaultOptions).format(date);
    } catch {
      // Fallback manual UTC+3 shift
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const eatDate = new Date(utc + 3 * 3600000);
      return eatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  },

  /**
   * Get current time string formatted according to active timezone mode
   */
  getCurrentFormattedTime(): { primary: string; secondary?: string; badge: string } {
    const info = TimeService.getTimezoneInfo();
    const now = new Date();

    const eatFormatted = TimeService.formatInEAT(now, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (info.mode === 'eat' || (info.mode === 'auto' && info.isEastAfrica)) {
      return {
        primary: `${eatFormatted} EAT`,
        badge: 'EAT (UTC+3)',
      };
    }

    if (info.mode === 'local') {
      const localFormatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return {
        primary: `${localFormatted} (Local)`,
        secondary: `Campus: ${eatFormatted} EAT`,
        badge: 'Local Time',
      };
    }

    // Auto mode for non-East African users: Show both local and campus EAT
    const localFormatted = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      primary: `${localFormatted} (Your Time)`,
      secondary: `Campus Official: ${eatFormatted} EAT`,
      badge: 'Auto (Dual EAT)',
    };
  },

  /**
   * Convert time string (e.g. "09:30" or "09:30 - 10:30 AM") for display
   */
  formatSlotTimeForDisplay(timeStr: string): string {
    const info = TimeService.getTimezoneInfo();
    if (info.isEastAfrica || info.mode === 'eat') {
      return timeStr.includes('EAT') ? timeStr : `${timeStr} EAT`;
    }

    // If student is in another region, calculate local equivalent
    try {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (!match) return `${timeStr} EAT`;

      const [_, hStr, mStr] = match;
      const hours = parseInt(hStr, 10);
      const minutes = parseInt(mStr, 10);

      // EAT is UTC+3. Convert to local.
      const now = new Date();
      // Create a Date representing today at this EAT time
      const utcHours = hours - 3;
      const dateInUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), utcHours, minutes));

      const localTime = dateInUtc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${timeStr} EAT (${localTime} Local)`;
    } catch {
      return `${timeStr} EAT`;
    }
  }
};
