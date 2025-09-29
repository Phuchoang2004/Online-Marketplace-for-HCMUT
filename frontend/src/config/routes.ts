export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  
  // Protected routes
  DASHBOARD: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Fallback
  NOT_FOUND: '/404',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];