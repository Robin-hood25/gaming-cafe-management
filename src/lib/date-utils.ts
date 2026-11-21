/**
 * Date and time utilities for Gaming Cafe
 * Default Timezone: Asia/Kolkata (IST: UTC+05:30)
 */

export function formatTimeIST(dateString: string | Date | null | undefined): string {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '--:--';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateTimeIST(dateString: string | Date | null | undefined): string {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '--:--';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateOnlyIST(dateString: string | Date | null | undefined): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculates remaining seconds until target timestamp.
 * Returns 0 if already passed.
 */
export function getRemainingSeconds(targetDateString: string | Date | null | undefined): number {
  if (!targetDateString) return 0;
  const targetTime = new Date(targetDateString).getTime();
  if (isNaN(targetTime)) return 0;

  const now = Date.now();
  const diffMs = targetTime - now;
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Formats seconds into HH:MM:SS
 */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

