export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "ohm-theme";
const preferences: readonly ThemePreference[] = ["system", "light", "dark"];

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (preferences.includes(stored as ThemePreference)) {
      return stored as ThemePreference;
    }
  } catch {
    // Presentation preference remains optional when storage is unavailable.
  }

  return "system";
}

export function applyTheme(preference: ThemePreference): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    preference === "dark" || (preference === "system" && prefersDark),
  );
  document.documentElement.dataset.theme = preference;
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Theme still applies for current document.
  }
}

export function nextThemePreference(
  preference: ThemePreference,
): ThemePreference {
  const index = preferences.indexOf(preference);
  return preferences[(index + 1) % preferences.length];
}
