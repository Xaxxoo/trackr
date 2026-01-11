// src/lib/config/navigation.ts

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  
  // Inventory routes
  INVENTORY: '/inventory',
  INVENTORY_DETAIL: (id: string) => `/inventory/${id}`,
  INVENTORY_EDIT: (id: string) => `/inventory/${id}/edit`,
  INVENTORY_NEW: '/inventory/new',
  INVENTORY_MOVEMENTS: '/inventory/movements',
  INVENTORY_ADJUSTMENTS: '/inventory/adjustments',
  INVENTORY_ANALYTICS: '/inventory/analytics',
  
  // Products routes
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_NEW: '/products/new',
  
  // Raw materials routes
  RAW_MATERIALS: '/raw-materials',
  RAW_MATERIAL_DETAIL: (id: string) => `/raw-materials/${id}`,
  RAW_MATERIAL_NEW: '/raw-materials/new',
  
  // BOM routes
  BOM: '/bom',
  BOM_DETAIL: (id: string) => `/bom/${id}`,
  BOM_EDIT: (id: string) => `/bom/${id}/edit`,
  BOM_VERSIONS: (id: string) => `/bom/${id}/versions`,
  BOM_NEW: '/bom/new',
  
  // Production routes
  PRODUCTION: '/production',
  PRODUCTION_DETAIL: (id: string) => `/production/${id}`,
  PRODUCTION_BATCHES: (id: string) => `/production/${id}/batches`,
  PRODUCTION_CONSUMPTION: (id: string) => `/production/${id}/consumption`,
  PRODUCTION_NEW: '/production/new',
  PRODUCTION_SCHEDULE: '/production/schedule',
  PRODUCTION_ANALYTICS: '/production/analytics',
  
  // Warehouses routes
  WAREHOUSES: '/warehouses',
  WAREHOUSE_DETAIL: (id: string) => `/warehouses/${id}`,
  WAREHOUSE_LOCATIONS: (id: string) => `/warehouses/${id}/locations`,
  WAREHOUSE_STOCK: (id: string) => `/warehouses/${id}/stock`,
  WAREHOUSE_MOVEMENTS: (id: string) => `/warehouses/${id}/movements`,
  WAREHOUSE_NEW: '/warehouses/new',
  
  // Stock movements routes
  STOCK_MOVEMENTS: '/stock-movements',
  STOCK_RECEIPTS: '/stock-movements/receipts',
  STOCK_ISSUES: '/stock-movements/issues',
  STOCK_TRANSFERS: '/stock-movements/transfers',
  STOCK_TRANSFER_NEW: '/stock-movements/transfers/new',
  STOCK_ADJUSTMENTS: '/stock-movements/adjustments',
  STOCK_RESERVATIONS: '/stock-movements/reservations',
  
  // Reports routes
  REPORTS: '/reports',
  REPORT_TEMPLATES: '/reports/templates',
  REPORT_TEMPLATE_NEW: '/reports/templates/new',
  REPORT_GENERATE: '/reports/generate',
  REPORT_SCHEDULES: '/reports/schedules',
  REPORT_EXECUTIONS: '/reports/executions',
  REPORT_CATEGORY: (category: string) => `/reports/${category}`,
  
  // Users & roles routes
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  USER_NEW: '/users/new',
  ROLES: '/roles',
  ROLE_DETAIL: (id: string) => `/roles/${id}`,
  
  // Settings routes
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_PREFERENCES: '/settings/preferences',
} as const;

// Navigation menu structure
export const NAVIGATION_MENU = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
    permission: 'dashboard:read',
  },
  {
    title: 'Inventory',
    icon: 'Package',
    permission: 'inventory:read',
    children: [
      { title: 'All Inventory', href: ROUTES.INVENTORY },
      { title: 'Stock Movements', href: ROUTES.INVENTORY_MOVEMENTS },
      { title: 'Adjustments', href: ROUTES.INVENTORY_ADJUSTMENTS },
      { title: 'Analytics', href: ROUTES.INVENTORY_ANALYTICS },
    ],
  },
  {
    title: 'Products',
    href: ROUTES.PRODUCTS,
    icon: 'Box',
    permission: 'products:read',
  },
  {
    title: 'Raw Materials',
    href: ROUTES.RAW_MATERIALS,
    icon: 'Archive',
    permission: 'raw_materials:read',
  },
  {
    title: 'BOM',
    href: ROUTES.BOM,
    icon: 'List',
    permission: 'bom:read',
  },
  {
    title: 'Production',
    icon: 'Factory',
    permission: 'production:read',
    children: [
      { title: 'Orders', href: ROUTES.PRODUCTION },
      { title: 'Schedule', href: ROUTES.PRODUCTION_SCHEDULE },
      { title: 'Analytics', href: ROUTES.PRODUCTION_ANALYTICS },
    ],
  },
  {
    title: 'Warehouses',
    href: ROUTES.WAREHOUSES,
    icon: 'Warehouse',
    permission: 'warehouses:read',
  },
  {
    title: 'Stock Movements',
    icon: 'TruckIcon',
    permission: 'inventory:read',
    children: [
      { title: 'All Movements', href: ROUTES.STOCK_MOVEMENTS },
      { title: 'Receipts', href: ROUTES.STOCK_RECEIPTS },
      { title: 'Issues', href: ROUTES.STOCK_ISSUES },
      { title: 'Transfers', href: ROUTES.STOCK_TRANSFERS },
      { title: 'Reservations', href: ROUTES.STOCK_RESERVATIONS },
    ],
  },
  {
    title: 'Reports',
    icon: 'FileText',
    permission: 'reports:read',
    children: [
      { title: 'Dashboard', href: ROUTES.REPORTS },
      { title: 'Templates', href: ROUTES.REPORT_TEMPLATES },
      { title: 'Generate', href: ROUTES.REPORT_GENERATE },
      { title: 'Schedules', href: ROUTES.REPORT_SCHEDULES },
      { title: 'Executions', href: ROUTES.REPORT_EXECUTIONS },
    ],
  },
  {
    title: 'Administration',
    icon: 'Settings',
    permission: 'users:read',
    children: [
      { title: 'Users', href: ROUTES.USERS },
      { title: 'Roles', href: ROUTES.ROLES },
      { title: 'Settings', href: ROUTES.SETTINGS },
    ],
  },
];