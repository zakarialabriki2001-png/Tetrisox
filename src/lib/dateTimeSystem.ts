import { Match } from '../types';

export class DateTimeSystem {
  public static parse(kickoff: string): Date {
    try {
      return new Date(kickoff);
    } catch {
      return new Date();
    }
  }

  public static toLocalDateString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  public static isMatchFinished(m: Match): boolean {
    return m.status === 'FINISHED' || (m.ft_home !== undefined && m.ft_home !== null);
  }

  public static isMatchLive(m: Match): boolean {
    return m.status === 'LIVE';
  }

  public static isMatchUpcoming(m: Match): boolean {
    return !this.isMatchFinished(m) && !this.isMatchLive(m);
  }

  public static formatTime(date: Date): string {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
