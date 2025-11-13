export type ActivityRecord = {
  id: string;
  description: string;
  timestamp: number; // epoch millis
};

const STORAGE_KEY = 'recentActivities';

type Listener = () => void;

function now() {
  return Date.now();
}

function load(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(list: ActivityRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function relativeTime(ts: number): string {
  const diff = Math.max(0, now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'hace unos segundos';
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} minuto${min === 1 ? '' : 's'}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} hora${hr === 1 ? '' : 's'}`;
  const d = Math.floor(hr / 24);
  return `hace ${d} día${d === 1 ? '' : 's'}`;
}

class ActivityService {
  private listeners: Set<Listener> = new Set();

  subscribe(cb: Listener) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    for (const l of this.listeners) {
      try {
        l();
      } catch {
        // noop
      }
    }
  }

  log(description: string) {
    const current = load();
    const rec: ActivityRecord = { id: crypto.randomUUID(), description, timestamp: now() };
    // Insert at top; keep last 50
    const updated = [rec, ...current].slice(0, 50);
    save(updated);
    this.notify();
  }

  getRecent(limit = 10) {
    const list = load().slice(0, limit);
    // map to UI type shape
    return list.map((r) => ({ id: r.id, description: r.description, time: relativeTime(r.timestamp) }));
  }
}

export const activityService = new ActivityService();
