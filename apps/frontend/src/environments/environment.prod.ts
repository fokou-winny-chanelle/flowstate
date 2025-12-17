export const environment = {
  production: true,
  // API_URL will be replaced at build time by Render or build script
  // Default fallback (will be overridden)
  apiUrl: (typeof process !== 'undefined' && process.env?.['API_URL']) || 'https://flowstate-backend-fptr.onrender.com/api',
  enableDebug: false,
  version: '1.0.0',
};

