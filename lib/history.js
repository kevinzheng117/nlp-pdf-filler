const KEY = "pdf-filler:history";

export function loadHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  sessionStorage.setItem(KEY, JSON.stringify(items.slice(0, 5)));
}

export function addHistory(text) {
  const list = loadHistory();
  if (!text || text.trim().length === 0) return list;
  if (list[0] && list[0] === text) return list; // no consecutive dup
  const updated = [text, ...list].slice(0, 5);
  saveHistory(updated);
  return updated;
}

export function clearHistory() {
  saveHistory([]);
}
