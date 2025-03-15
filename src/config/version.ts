// src/config/version.ts
// Application version information

export const versionInfo = {
    version: '0.2.2',
    buildNumber: process.env.BUILD_ID || 'dev',
    buildDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    environment: process.env.NODE_ENV || 'development'
  };
  
  export default versionInfo;