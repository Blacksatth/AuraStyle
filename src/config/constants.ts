/**
 * Correos con acceso al panel de administración.
 * Fase 2: reemplazar por custom claims de Firebase + reglas de Firestore.
 */
export const ADMIN_EMAILS = [
  "santiago.cifuentes@correo.tdea.edu.co",
  "santiagocifuenteslora@gmail.com",
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
