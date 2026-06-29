/**
 * UI store — global signals for non-co-located components.
 * Currently: auth-prompt (login drawer) request.
 */
import { create } from 'zustand';

interface UiState {
  authPromptOpen: boolean;
  redirectAfterAuth: string | null;
}

interface UiActions {
  openAuthPrompt: (redirect?: string) => void;
  closeAuthPrompt: () => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  authPromptOpen: false,
  redirectAfterAuth: null,

  openAuthPrompt: (redirect?) =>
    set({ authPromptOpen: true, redirectAfterAuth: redirect ?? null }),

  closeAuthPrompt: () =>
    set({ authPromptOpen: false, redirectAfterAuth: null }),
}));
