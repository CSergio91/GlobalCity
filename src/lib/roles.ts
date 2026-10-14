/**
 * ============================================================================
 * EKLIPSE FUNDED — GOBERNANZA INSTITUCIONAL DE ROLES Y CONTROL DE ACCESO (RBAC)
 * ============================================================================
 * Fuente única de verdad para la resolución de privilegios y seguridad.
 * Erradica la exposición dispersa de arrays de roles en componentes de interfaz.
 * ============================================================================
 */

export type UserRole = 'admin' | 'soporte' | 'marketing' | 'trader';

/**
 * Conjunto inmutable de roles administrativos y de backoffice autorizados
 */
const STAFF_ROLES = new Set<string>([
  'admin',
  'superadmin',
  'administrator',
  'soporte',
  'support',
  'marketing',
  'compliance'
]);

/**
 * Verifica si un rol pertenece al equipo administrativo/operativo interno
 */
export function isStaffRole(role?: string | null): boolean {
  if (!role) return false;
  return STAFF_ROLES.has(role.trim().toLowerCase());
}

/**
 * Verifica si un rol tiene privilegios de superadministrador
 */
export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const clean = role.trim().toLowerCase();
  return clean === 'admin' || clean === 'superadmin' || clean === 'administrator';
}

/**
 * Verifica si un rol tiene acceso autorizado al ERP Nexus CRM & Risk Engine
 */
export function hasCrmAccess(role?: string | null): boolean {
  return isStaffRole(role);
}
