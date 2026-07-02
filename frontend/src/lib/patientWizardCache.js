const CACHE_KEY = 'patient_wizard_draft_v1';

export const loadWizardCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveWizardCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — ignore */
  }
};

export const clearWizardCache = () => {
  sessionStorage.removeItem(CACHE_KEY);
};
