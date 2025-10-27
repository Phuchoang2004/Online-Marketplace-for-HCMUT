export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Protected routes
  DASHBOARD: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PRODUCTS: '/products',
  
  // FE7 - Vendor Register, Admin Confirm
  REGISTER_VENDOR: '/register-vendor',
  ADMIN_VENDORS: '/admin/vendors',
  // FE7 - Vendor Register, Admin Confirm

  // Fallback
  NOT_FOUND: '/404',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];