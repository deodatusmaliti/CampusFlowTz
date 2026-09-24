// ============================================================================
// TimeService: Real Time, Timezone Conversion & Adaptive Global System
// Unified across Timetable, Assignments, Exams, Alerts and System Notices
// ============================================================================

import { TimezoneSettingMode, UserTimezoneConfig } from '../types';

export interface TimezoneOption {
  iana: string;
  label: string;
  region: string;
  offset: string;
}

export const POPULAR_TIMEZONES: TimezoneOption[] = [
  // East Africa & Horn
  { iana: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam, Tanzania (EAT)', region: 'East Africa', offset: 'UTC+3' },
  { iana: 'Africa/Nairobi', label: 'Nairobi, Kenya (EAT)', region: 'East Africa', offset: 'UTC+3' },
  { iana: 'Africa/Kampala', label: 'Kampala, Uganda (EAT)', region: 'East Africa', offset: 'UTC+3' },
  { iana: 'Africa/Kigali', label: 'Kigali, Rwanda (CAT)', region: 'Central/East Africa', offset: 'UTC+2' },
  { iana: 'Africa/Bujumbura', label: 'Bujumbura, Burundi (CAT)', region: 'Central/East Africa', offset: 'UTC+2' },
  { iana: 'Africa/Addis_Ababa', label: 'Addis Ababa, Ethiopia (EAT)', region: 'East Africa', offset: 'UTC+3' },
  
  // Other Africa
  { iana: 'Africa/Johannesburg', label: 'Johannesburg, South Africa (SAST)', region: 'Southern Africa', offset: 'UTC+2' },
  { iana: 'Africa/Lagos', label: 'Lagos, Nigeria (WAT)', region: 'West Africa', offset: 'UTC+1' },
  { iana: 'Africa/Accra', label: 'Accra, Ghana (GMT)', region: 'West Africa', offset: 'UTC+0' },
  { iana: 'Africa/Cairo', label: 'Cairo, Egypt (EET/EEST)', region: 'North Africa', offset: 'UTC+2/+3' },

  // International
  { iana: 'Europe/London', label: 'London, UK (GMT / BST)', region: 'Europe', offset: 'UTC+0/+1' },
  { iana: 'Europe/Paris', label: 'Paris, France (CET / CEST)', region: 'Europe', offset: 'UTC+1/+2' },
  { iana: 'America/New_York', label: 'New York, USA (EST / EDT)', region: 'Americas', offset: 'UTC-5/-4' },
  { iana: 'America/Chicago', label: 'Chicago, USA (CST / CDT)', region: 'Americas', offset: 'UTC-6/-5' },
  { iana: 'America/Los_Angeles', label: 'Los Angeles, USA (PST / PDT)', region: 'Americas', offset: 'UTC-8/-7' },
  { iana: 'Asia/Dubai', label: 'Dubai, UAE (GST)', region: 'Middle East', offset: 'UTC+4' },
  { iana: 'Asia/Kolkata', label: 'New Delhi / Mumbai, India (IST)', region: 'Asia', offset: 'UTC+5:30' },
  { iana: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia', offset: 'UTC+8' },
  { iana: 'Asia/Tokyo', label: 'Tokyo, Japan (JST)', region: 'Asia', offset: 'UTC+9' },
  { iana: 'Australia/Sydney', label: 'Sydney, Australia (AEST / AEDT)', region: 'Oceania', offset: 'UTC+10/+11' },
  { iana: 'UTC', label: 'Coordinated Universal Time (UTC)', region: 'Global', offset: 'UTC+0' },
];

const STORAGE_KEY_MODE = 'campusflow_tz_mode_v2';
const STORAGE_KEY_MANUAL = 'campusflow_tz_manual_v2';

export interface ActiveTimezoneState {
  mode: TimezoneSettingMode;
  activeTimezone: string;
  detectedTimezone: string;
  isTanzaniaSelected: boolean;
  timeZoneAbbreviation: string;
  fullDisplayName: string;
  utcOffsetString: string;
}

export const TimeService = {
  /**
   * Automatically detect the browser's device timezone
   */
  getDetectedTimezone(): string {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz || 'Africa/Dar_es_Salaam';
    } catch {
      return 'Africa/Dar_es_Salaam';
    }
  },

  /**
   * Retrieve saved user timezone configuration
   */
  getSavedConfig(): UserTimezoneConfig {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as TimezoneSettingMode;
      const savedManual = localStorage.getItem(STORAGE_KEY_MANUAL) || 'Africa/Dar_es_Salaam';
      
      const mode: TimezoneSettingMode = (['auto', 'tanzania', 'manual'].includes(savedMode))
        ? savedMode
        : 'auto';

      return {
        mode,
        manualTimezone: savedManual,
      };
    } catch {
      return { mode: 'auto', manualTimezone: 'Africa/Dar_es_Salaam' };
    }
  },

  /**
   * Save timezone configuration
   */
  saveConfig(config: UserTimezoneConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, config.mode);
      if (config.manualTimezone) {
        localStorage.setItem(STORAGE_KEY_MANUAL, config.manualTimezone);
      }
    } catch {}
  },

  /**
   * Resolve active IANA timezone based on mode and settings
   */
  getActiveTimezone(): string {
    const config = TimeService.getSavedConfig();
    if (config.mode === 'tanzania') {
      return 'Africa/Dar_es_Salaam';
    }
    if (config.mode === 'manual' && config.manualTimezone) {
      return config.manualTimezone;
    }
    return TimeService.getDetectedTimezone();
  },

  /**
   * Determine whether the active timezone is Tanzania/East Africa Time
   */
  isEastAfrica(timezone?: string): boolean {
    const tz = timezone || TimeService.getActiveTimezone();
    const eastAfricanZones = [
      'Africa/Dar_es_Salaam',
      'Africa/Nairobi',
      'Africa/Kampala',
      'Africa/Addis_Ababa',
      'Africa/Mogadishu',
      'Africa/Djibouti',
      'Africa/Asmara',
    ];
    return eastAfricanZones.includes(tz);
  },

  /**
   * Get formatted timezone abbreviation (e.g. EAT, GMT, BST, WAT, CAT, EDT, etc.)
   * Only returns "EAT" when corresponding to an actual East African timezone!
   */
  getTimezoneAbbr(timezone: string = TimeService.getActiveTimezone(), date: Date = new Date()): string {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      }).formatToParts(date);
      const abbrPart = parts.find(p => p.type === 'timeZoneName')?.value;
      if (abbrPart) {
        // If browser returns "GMT+3", format appropriately
        if (abbrPart === 'GMT+3' && TimeService.isEastAfrica(timezone)) {
          return 'EAT';
        }
        return abbrPart;
      }
      return TimeService.isEastAfrica(timezone) ? 'EAT' : 'Local';
    } catch {
      return TimeService.isEastAfrica(timezone) ? 'EAT' : 'Local';
    }
  },

  /**
   * Returns complete active timezone state
   */
  getActiveTimezoneState(): ActiveTimezoneState {
    const config = TimeService.getSavedConfig();
    const detectedTimezone = TimeService.getDetectedTimezone();
    const activeTimezone = TimeService.getActiveTimezone();
    const isTanzaniaSelected = activeTimezone === 'Africa/Dar_es_Salaam' || TimeService.isEastAfrica(activeTimezone);
    const timeZoneAbbreviation = TimeService.getTimezoneAbbr(activeTimezone);

    // Compute UTC offset string
    let utcOffsetString = 'UTC+3';
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: activeTimezone,
        timeZoneName: 'longOffset',
      }).formatToParts(now);
      const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value;
      if (offsetPart) {
        utcOffsetString = offsetPart.replace('GMT', 'UTC');
      }
    } catch {}

    const friendlyName = activeTimezone.split('/').pop()?.replace(/_/g, ' ') || activeTimezone;
    const fullDisplayName = `${friendlyName} (${timeZoneAbbreviation}, ${utcOffsetString})`;

    return {
      mode: config.mode,
      activeTimezone,
      detectedTimezone,
      isTanzaniaSelected,
      timeZoneAbbreviation,
      fullDisplayName,
      utcOffsetString,
    };
  },

  /**
   * Format any Date or ISO timestamp in the active user timezone
   */
  formatInActiveTimezone(
    dateInput: Date | string | number = new Date(),
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const activeTz = TimeService.getActiveTimezone();
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: activeTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
    };

    try {
      return new Intl.DateTimeFormat('en-GB', defaultOptions).format(date);
    } catch {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  },

  /**
   * Format specifically in Tanzania East Africa Time (Africa/Dar_es_Salaam)
   */
  formatInEAT(
    dateInput: Date | string | number = new Date(),
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Dar_es_Salaam',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
    };

    try {
      return new Intl.DateTimeFormat('en-GB', defaultOptions).format(date);
    } catch {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  },

  /**
   * Convert a time string ("HH:mm") from source timezone to target timezone
   * Handles DST adjustments seamlessly via native Intl
   */
  convertTime(
    timeStr: string,
    sourceTimezone: string = 'Africa/Dar_es_Salaam',
    targetTimezone: string = TimeService.getActiveTimezone(),
    referenceDate: Date = new Date()
  ): { timeFormatted: string; hours: number; minutes: number } {
    if (!timeStr || typeof timeStr !== 'string') {
      return { timeFormatted: timeStr || '09:00', hours: 9, minutes: 0 };
    }

    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
      return { timeFormatted: timeStr, hours: 0, minutes: 0 };
    }

    const origHours = parseInt(match[1], 10);
    const origMinutes = parseInt(match[2], 10);

    if (sourceTimezone === targetTimezone) {
      const d = new Date();
      d.setHours(origHours, origMinutes, 0, 0);
      const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return { timeFormatted, hours: origHours, minutes: origMinutes };
    }

    try {
      // Find exact UTC timestamp for [origHours:origMinutes] in sourceTimezone
      // We parse today's date formatted in UTC
      const year = referenceDate.getUTCFullYear();
      const month = String(referenceDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(referenceDate.getUTCDate()).padStart(2, '0');
      
      // Binary search or offset-based alignment
      // 1. Get offset of source timezone on this date
      const testDate = new Date(Date.UTC(year, referenceDate.getUTCMonth(), referenceDate.getUTCDate(), 12, 0, 0));
      
      const getTzOffsetMinutes = (tz: string, d: Date): number => {
        const utcStr = d.toLocaleString('en-US', { timeZone: 'UTC', hour12: false });
        const tzStr = d.toLocaleString('en-US', { timeZone: tz, hour12: false });
        const diffMs = new Date(tzStr).getTime() - new Date(utcStr).getTime();
        return Math.round(diffMs / 60000);
      };

      const sourceOffset = getTzOffsetMinutes(sourceTimezone, testDate);
      const targetOffset = getTzOffsetMinutes(targetTimezone, testDate);

      // Total minutes from midnight in source
      const totalSourceMinutes = origHours * 60 + origMinutes;
      // Convert to target: add (targetOffset - sourceOffset)
      let totalTargetMinutes = totalSourceMinutes + (targetOffset - sourceOffset);
      
      // Wrap around 24 hours (1440 minutes)
      while (totalTargetMinutes < 0) totalTargetMinutes += 1440;
      totalTargetMinutes = totalTargetMinutes % 1440;

      const convertedHours = Math.floor(totalTargetMinutes / 60);
      const convertedMinutes = totalTargetMinutes % 60;

      // Format nicely in 12-hour AM/PM
      const dummy = new Date();
      dummy.setHours(convertedHours, convertedMinutes, 0, 0);
      const timeFormatted = dummy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      return { timeFormatted, hours: convertedHours, minutes: convertedMinutes };
    } catch {
      return { timeFormatted: timeStr, hours: origHours, minutes: origMinutes };
    }
  },

  /**
   * Format slot time for display in timetable cards and headers
   * Correctly reflects whether user is on Tanzania EAT or another timezone
   */
  formatSlotTimeForDisplay(
    startTime: string,
    endTime: string,
    sourceTimezone: string = 'Africa/Dar_es_Salaam'
  ): {
    display: string;
    targetAbbr: string;
    isDualTimezone: boolean;
    campusEatDisplay?: string;
  } {
    const state = TimeService.getActiveTimezoneState();
    const sourceAbbr = TimeService.getTimezoneAbbr(sourceTimezone);
    const targetAbbr = state.timeZoneAbbreviation;

    // If active timezone matches campus timezone (Tanzania / East Africa)
    if (state.activeTimezone === sourceTimezone || (state.isTanzaniaSelected && TimeService.isEastAfrica(sourceTimezone))) {
      return {
        display: `${startTime} – ${endTime} ${sourceAbbr}`,
        targetAbbr: sourceAbbr,
        isDualTimezone: false,
      };
    }

    // User is in a different timezone (e.g. London, Lagos, New York, etc.)
    const convertedStart = TimeService.convertTime(startTime, sourceTimezone, state.activeTimezone);
    const convertedEnd = TimeService.convertTime(endTime, sourceTimezone, state.activeTimezone);

    return {
      display: `${convertedStart.timeFormatted} – ${convertedEnd.timeFormatted} ${targetAbbr}`,
      targetAbbr,
      isDualTimezone: true,
      campusEatDisplay: `${startTime} – ${endTime} Campus ${sourceAbbr}`,
    };
  },

  /**
   * Get current live clock data for calendar/timetable headers
   */
  getCurrentHeaderClock(): {
    dateFormatted: string;
    timeFormatted: string;
    timeZoneAbbreviation: string;
    timeZoneName: string;
    isEastAfricaTime: boolean;
    fullBadge: string;
  } {
    const state = TimeService.getActiveTimezoneState();
    const now = new Date();

    const dateFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: state.activeTimezone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(now);

    const timeFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: state.activeTimezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);

    return {
      dateFormatted,
      timeFormatted,
      timeZoneAbbreviation: state.timeZoneAbbreviation,
      timeZoneName: state.activeTimezone,
      isEastAfricaTime: state.isTanzaniaSelected,
      fullBadge: `${state.timeZoneAbbreviation} (${state.utcOffsetString})`,
    };
  },
};
