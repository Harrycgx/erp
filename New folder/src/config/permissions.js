export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  SALES: 'sales',
  PRODUCTION: 'production',
  HR: 'hr',
  FINANCE: 'finance',
  PROCUREMENT: 'procurement',
};

export const ROLE_HOME_PATHS = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.STAFF]: '/dashboard',
  [ROLES.CUSTOMER]: '/customer',
  [ROLES.VENDOR]: '/vendor',
};

export const ROLE_GROUPS = {
  internal: [ROLES.ADMIN, ROLES.STAFF, ROLES.SALES, ROLES.PRODUCTION, ROLES.HR, ROLES.FINANCE, ROLES.PROCUREMENT],
  staff: [ROLES.ADMIN, ROLES.STAFF],
  admin: [ROLES.ADMIN],
  customer: [ROLES.CUSTOMER],
  vendor: [ROLES.VENDOR],
  sales: [ROLES.ADMIN, ROLES.SALES, ROLES.STAFF],
  production: [ROLES.ADMIN, ROLES.PRODUCTION, ROLES.STAFF],
  hr: [ROLES.ADMIN, ROLES.HR],
  finance: [ROLES.ADMIN, ROLES.FINANCE, ROLES.STAFF],
  procurement: [ROLES.ADMIN, ROLES.PROCUREMENT, ROLES.STAFF],
};

export function hasRole(profile, allowedRoles = []) {
  if (!profile?.role) return false;
  return allowedRoles.includes(profile.role);
}

export function getRoleHomePath(role) {
  return ROLE_HOME_PATHS[role] ?? ROLE_HOME_PATHS[ROLES.STAFF];
}

export function canAccessModule(profile, moduleName) {
  return hasRole(profile, ROLE_GROUPS[moduleName] || []);
}
