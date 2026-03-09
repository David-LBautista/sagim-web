// ── Onboarding State ─────────────────────────────────────────────────────────
export interface OnboardingSteps {
  datos: boolean;
  servicios: boolean;
  equipo: boolean;
  padron: boolean;
}

export interface OnboardingMunicipioInfo {
  _id: string;
  nombre: string;
  logoUrl?: string;
  estado?: string;
  estadoId?: { _id: string; nombre: string };
  poblacion?: number;
  contactoEmail?: string;
  contactoTelefono?: string;
  direccion?: string;
  porcentajeContribucion?: number;
  config?: { modulos: Record<string, boolean> };
}

export interface OnboardingState {
  onboardingCompletado: boolean;
  pasoActual: number; // 1–4
  steps: OnboardingSteps;
  operadoresCount: number;
  municipio: OnboardingMunicipioInfo;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface OnboardingDatosDto {
  contactoEmail?: string;
  contactoTelefono?: string;
  direccion?: string;
  porcentajeContribucion?: number;
}

export interface OnboardingPadronDto {
  saltado?: boolean;
}

// ── Operador para paso 3 ──────────────────────────────────────────────────────
export interface OnboardingOperador {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  moduloId?: { _id: string; nombre: string };
}
