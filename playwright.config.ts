import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para ProGest
 * 
 * Este archivo configura Playwright para ejecutar tests E2E
 * en el proyecto ProGest (Sistema de Gestión de Proyectos SaaS)
 */

export default defineConfig({
  // Directorio donde están los tests
  testDir: './playwright-tests',
  
  // Timeout global para cada test
  timeout: 120 * 1000, // 2 minutos
  
  // Configuración de expect
  expect: {
    timeout: 10 * 1000, // 10 segundos para assertions
  },
  
  // Ejecutar tests en paralelo
  fullyParallel: false, // Desactivado para evitar conflictos de datos
  
  // Fallar el build si hay tests con .only
  forbidOnly: !!process.env.CI,
  
  // Reintentos en caso de fallo
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers (tests en paralelo)
  workers: process.env.CI ? 1 : 1,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-tests/test-results/html-report' }],
    ['json', { outputFile: 'playwright-tests/test-results/results.json' }],
    ['list']
  ],
  
  // Configuración compartida para todos los tests
  use: {
    // URL base
    baseURL: 'http://localhost:3000',
    
    // Capturar trace solo en caso de fallo
    trace: 'on-first-retry',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Video
    video: 'retain-on-failure',
    
    // Timeout para acciones individuales
    actionTimeout: 10 * 1000,
    
    // Timeout para navegación
    navigationTimeout: 30 * 1000,
  },

  // Proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Descomentar para probar en otros navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Tests en mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Servidor de desarrollo (opcional)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
