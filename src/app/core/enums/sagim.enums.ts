/**
 * Enums compartidos con el backend
 */

// User roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PRESIDENTE = 'PRESIDENTE',
  CONTRALOR = 'CONTRALOR',
  DIF = 'DIF',
  CATASTRO = 'CATASTRO',
  TESORERIA = 'TESORERIA',
  SOPORTE = 'SOPORTE',
}

// Vulnerable groups
export enum VulnerableGroup {
  ADULTO_MAYOR = 'ADULTO_MAYOR',
  DISCAPACIDAD = 'DISCAPACIDAD',
  MADRE_SOLTERA = 'MADRE_SOLTERA',
  POBREZA_EXTREMA = 'POBREZA_EXTREMA',
  INDIGENA = 'INDIGENA',
}

// Support types (DIF)
export enum SupportType {
  DESPENSA = 'DESPENSA',
  ECONOMICO = 'ECONOMICO',
  MEDICAMENTO = 'MEDICAMENTO',
  APARATO_FUNCIONAL = 'APARATO_FUNCIONAL',
  OTRO = 'OTRO',
}

// Report types
export enum ReportType {
  BASURA = 'BASURA',
  ALUMBRADO = 'ALUMBRADO',
  BACHE = 'BACHE',
  AGUA = 'AGUA',
  DRENAJE = 'DRENAJE',
  OTRO = 'OTRO',
}

// Report status
export enum ReportStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  ATENDIDO = 'ATENDIDO',
  RECHAZADO = 'RECHAZADO',
}

// Property use types
export enum PropertyUse {
  HABITACIONAL = 'HABITACIONAL',
  COMERCIAL = 'COMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MIXTO = 'MIXTO',
  AGRICOLA = 'AGRICOLA',
}

// Appointment status
export enum AppointmentStatus {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

// Payment concepts
export enum PaymentConcept {
  PREDIAL = 'PREDIAL',
  AGUA = 'AGUA',
  MULTA = 'MULTA',
  LICENCIA = 'LICENCIA',
  TRAMITE = 'TRAMITE',
  OTRO = 'OTRO',
}

// Payment status
export enum PaymentStatus {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  CANCELADO = 'CANCELADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

// Notification types
export enum NotificationType {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

// Audit action types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PAYMENT = 'PAYMENT',
  EXPORT = 'EXPORT',
}

// Labels para mostrar en UI
export const VulnerableGroupLabels: Record<VulnerableGroup, string> = {
  [VulnerableGroup.ADULTO_MAYOR]: 'Adulto Mayor',
  [VulnerableGroup.DISCAPACIDAD]: 'Discapacidad',
  [VulnerableGroup.MADRE_SOLTERA]: 'Madre Soltera',
  [VulnerableGroup.POBREZA_EXTREMA]: 'Pobreza Extrema',
  [VulnerableGroup.INDIGENA]: 'Indígena',
};

export const SupportTypeLabels: Record<SupportType, string> = {
  [SupportType.DESPENSA]: 'Despensa',
  [SupportType.ECONOMICO]: 'Económico',
  [SupportType.MEDICAMENTO]: 'Medicamento',
  [SupportType.APARATO_FUNCIONAL]: 'Aparato Funcional',
  [SupportType.OTRO]: 'Otro',
};
