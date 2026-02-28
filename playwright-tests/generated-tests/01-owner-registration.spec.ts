import { test, expect } from '@playwright/test';

/**
 * Test: Owner Registration Flow (Escenario 1.1)
 * 
 * Este test valida el flujo completo de registro de un nuevo usuario OWNER:
 * 1. Registro en /auth/register
 * 2. Onboarding (creación de proyecto)
 * 3. Redirección a dashboard
 * 4. Logout
 * 
 * Basado en:
 * - Diagrama: playwright-tests/flow-diagrams/01-owner-registration.mmd
 * - Escenarios: playwright-tests/test-scenarios/01-owner-registration-scenarios.md
 */

test.describe('Owner Registration Flow', () => {
  
  // Datos de prueba
  const testData = {
    email: `test_owner_${Date.now()}@example.com`, // Email único para evitar conflictos
    password: 'Owner123456',
    name: 'Test Owner New',
    role: 'OWNER',
    project: {
      name: 'Mi Proyecto Test',
      description: 'Proyecto de prueba para Playwright MCP',
      category: 'software'
    }
  };

  test.beforeEach(async ({ page }) => {
    // Configurar timeout más largo para este test
    test.setTimeout(120000); // 2 minutos
  });

  test('Escenario 1.1: Registro exitoso de nuevo OWNER con creación de proyecto', async ({ page }) => {
    
    // PASO 1: Navegar a página de registro
    console.log('✅ Paso 1: Navegando a /auth/register');
    await page.goto('http://localhost:3000/auth/register');
    
    // Verificar que la página cargó
    await expect(page).toHaveURL(/\/auth\/register/);
    console.log('✅ Página de registro cargada correctamente');
    
    // Screenshot 1: Formulario vacío
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/01-empty-form.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Formulario vacío');

    // PASO 2: Llenar formulario de registro
    console.log('✅ Paso 2: Llenando formulario de registro');
    
    // Llenar email
    await page.fill('input[name="email"]', testData.email);
    console.log(`   - Email: ${testData.email}`);
    
    // Llenar password
    await page.fill('input[name="password"]', testData.password);
    console.log(`   - Password: ${testData.password}`);
    
    // Llenar name
    await page.fill('input[name="name"]', testData.name);
    console.log(`   - Name: ${testData.name}`);
    
    // Verificar que role OWNER está seleccionado (si hay selector de rol)
    // await page.selectOption('select[name="role"]', 'OWNER');
    
    // Screenshot 2: Formulario lleno
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/02-form-filled.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Formulario lleno');

    // PASO 3: Enviar formulario
    console.log('✅ Paso 3: Enviando formulario');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta del servidor (max 5 segundos)
    await page.waitForLoadState('networkidle', { timeout: 5000 });

    // PASO 4: Verificar tokens en localStorage
    console.log('✅ Paso 4: Verificando tokens en localStorage');
    
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    
    expect(accessToken).not.toBeNull();
    expect(refreshToken).not.toBeNull();
    console.log('   - Access token: ✅ Guardado');
    console.log('   - Refresh token: ✅ Guardado');

    // PASO 5: Verificar redirección a onboarding
    console.log('✅ Paso 5: Verificando redirección a onboarding');
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    console.log('   - Redirigido correctamente a /onboarding');
    
    // Screenshot 3: Página de onboarding
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/03-onboarding-page.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Página de onboarding');

    // PASO 6: Verificar elementos de onboarding
    console.log('✅ Paso 6: Verificando elementos de onboarding');
    
    // Verificar que el formulario de proyecto está visible
    await expect(page.locator('form')).toBeVisible();
    console.log('   - Formulario de proyecto: ✅ Visible');

    // PASO 7: Llenar formulario de proyecto
    console.log('✅ Paso 7: Llenando formulario de proyecto');
    
    await page.fill('input[name="name"]', testData.project.name);
    console.log(`   - Nombre: ${testData.project.name}`);
    
    await page.fill('textarea[name="description"]', testData.project.description);
    console.log(`   - Descripción: ${testData.project.description}`);
    
    // Seleccionar categoría (ajustar selector según implementación)
    // await page.selectOption('select[name="category"]', testData.project.category);
    
    // Screenshot 4: Proyecto lleno
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/04-project-form-filled.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Formulario de proyecto lleno');

    // PASO 8: Crear proyecto
    console.log('✅ Paso 8: Creando proyecto');
    await page.click('button[type="submit"]');
    
    // Esperar redirección (max 3 segundos)
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // PASO 9: Verificar dashboard
    console.log('✅ Paso 9: Verificando dashboard');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 10000 });
    console.log('   - Redirigido correctamente a /app/dashboard');
    
    // Screenshot 5: Dashboard con proyecto
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/05-dashboard.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Dashboard con proyecto');

    // PASO 10: Verificar elementos del dashboard
    console.log('✅ Paso 10: Verificando elementos del dashboard');
    
    // Verificar que el nombre del proyecto está visible
    await expect(page.locator('text=' + testData.project.name)).toBeVisible();
    console.log('   - Nombre del proyecto: ✅ Visible');
    
    // Verificar menú lateral
    // await expect(page.locator('nav')).toBeVisible();
    // console.log('   - Menú lateral: ✅ Visible');

    // PASO 11: Probar logout
    console.log('✅ Paso 11: Probando logout');
    
    // Buscar y hacer click en botón de logout (ajustar selector según implementación)
    await page.click('button:has-text("Cerrar Sesión"), button:has-text("Logout")');
    
    // Esperar redirección
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // PASO 12: Verificar logout
    console.log('✅ Paso 12: Verificando logout');
    
    // Verificar que los tokens fueron eliminados
    const accessTokenAfterLogout = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshTokenAfterLogout = await page.evaluate(() => localStorage.getItem('refresh_token'));
    
    expect(accessTokenAfterLogout).toBeNull();
    expect(refreshTokenAfterLogout).toBeNull();
    console.log('   - Tokens eliminados: ✅');
    
    // Verificar redirección a login
    await expect(page).toHaveURL(/\/auth\/login/);
    console.log('   - Redirigido a /auth/login: ✅');
    
    // Screenshot 6: Login page después de logout
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/06-after-logout.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Login page después de logout');

    console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE\n');
  });

  // Escenario 1.2: Email ya registrado
  test('Escenario 1.2: Email ya registrado', async ({ page }) => {
    console.log('✅ Escenario 1.2: Probando email ya registrado');
    
    await page.goto('http://localhost:3000/auth/register');
    
    // Usar email que ya existe
    await page.fill('input[name="email"]', 'owner@example.com');
    await page.fill('input[name="password"]', 'Owner123456');
    await page.fill('input[name="name"]', 'Test Owner Duplicate');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=/Email ya registrado|Email already exists/i')).toBeVisible({ timeout: 5000 });
    console.log('   - Mensaje de error visible: ✅');
    
    // Screenshot del error
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/error-email-exists.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Error email ya registrado');
  });

  // Escenario 1.3: Password débil
  test('Escenario 1.3: Password débil', async ({ page }) => {
    console.log('✅ Escenario 1.3: Probando password débil');
    
    await page.goto('http://localhost:3000/auth/register');
    
    await page.fill('input[name="email"]', `test_weak_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="name"]', 'Test Weak Password');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=/Password debe contener|Password must contain/i')).toBeVisible({ timeout: 5000 });
    console.log('   - Mensaje de error visible: ✅');
    
    // Screenshot del error
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/error-weak-password.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Error password débil');
  });

  // Escenario 1.4: Campos vacíos
  test('Escenario 1.4: Campos vacíos', async ({ page }) => {
    console.log('✅ Escenario 1.4: Probando campos vacíos');
    
    await page.goto('http://localhost:3000/auth/register');
    
    // Intentar enviar sin llenar campos
    await page.click('button[type="submit"]');
    
    // Verificar mensajes de error de validación
    const errorMessages = await page.locator('text=/requerido|required/i').count();
    expect(errorMessages).toBeGreaterThan(0);
    console.log(`   - Mensajes de error encontrados: ${errorMessages} ✅`);
    
    // Screenshot del error
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/error-empty-fields.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Error campos vacíos');
  });

});
