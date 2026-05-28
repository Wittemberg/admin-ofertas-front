export const ROLE_LABELS = {
  admin: 'Administrador',
  editor: 'Editor',
  operator: 'Operador',
  viewer: 'Visualizador',
  superadmin: 'Super Admin'
}

export const ROLE_OPTIONS = [
  { value: 'admin', label: ROLE_LABELS.admin },
  { value: 'editor', label: ROLE_LABELS.editor },
  { value: 'operator', label: ROLE_LABELS.operator },
  { value: 'viewer', label: ROLE_LABELS.viewer }
]

export function canAccess(user, roles = []) {
  if (!user) return false
  return roles.length === 0 || roles.includes(user.role)
}
