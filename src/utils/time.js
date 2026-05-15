export const GAME_SECONDS = 60 * 60;
export const HALF_SECONDS = 30 * 60;
export const MINIMUM_SECONDS = 30 * 60;

export function formatClock(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatMinutes(seconds) {
  return `${Math.round((seconds || 0) / 60)} min`;
}

export function secondsFromMinuteInput(value) {
  const minutes = Number(value);
  if (Number.isNaN(minutes)) return 0;
  return Math.max(0, Math.min(GAME_SECONDS, Math.round(minutes * 60)));
}
