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
      description: 'Proyecto de prueba para Playwright MCP con descripcion suficiente.',
      category: 'Marketing',
      timezone: 'America/Mexico_City',
      state: 'Ciudad de Mexico'
    }
  };

  test.beforeEach(async ({ page }) => {
    // Configurar timeout más largo para este test
    test.setTimeout(120000); // 2 minutos
  });

  test('Escenario 1.1: Registro exitoso de nuevo OWNER con creación de proyecto', async ({ page }) => {
    
    // PASO 1: Navegar a página de registro
    console.log('Paso 1: Navegando a /auth/register');
    await page.goto('/auth/register');
    
    // Verificar que la página cargó
    await expect(page).toHaveURL(/\/auth\/register/);
    console.log('Página de registro cargada correctamente');
    
    // Screenshot 1: Formulario vacío
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/01-empty-form.png',
      fullPage: true 
    });
    console.log('Screenshot: Formulario vacío');

    // PASO 2: Llenar formulario de registro
    console.log('Paso 2: Llenando formulario de registro');
    
    // Llenar email
    await page.fill('input[name="email"]', testData.email);
    console.log(`   - Email: ${testData.email}`);
    
    // Llenar password
    await page.fill('input[name="password"]', testData.password);
    console.log(`   - Password: ${testData.password}`);
    
    // Llenar confirmPassword
    await page.fill('input[name="confirmPassword"]', testData.password);
    console.log('   - Confirm Password: OK');

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
    console.log('Screenshot: Formulario lleno');

    // PASO 3: Enviar formulario
    console.log('Paso 3: Enviando formulario');
    await page.click('button[type="submit"]');

    // PASO 4: Verificar tokens en localStorage
    console.log('Paso 4: Verificando tokens en localStorage');
    
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    
    expect(accessToken).not.toBeNull();
    expect(refreshToken).not.toBeNull();
    console.log('   - Access token: Guardado');
    console.log('   - Refresh token: Guardado');

    // PASO 5: Verificar redirección a onboarding
    console.log('Paso 5: Verificando redirección a onboarding');
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    console.log('   - Redirigido correctamente a /onboarding');
    
    // Screenshot 3: Página de onboarding
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/03-onboarding-page.png',
      fullPage: true 
    });
    console.log('Screenshot: Página de onboarding');

    // PASO 6: Verificar elementos de onboarding
    console.log('Paso 6: Verificando elementos de onboarding');
    
    // Verificar que el formulario de proyecto está visible
    await expect(page.locator('form')).toBeVisible();
    console.log('   - Formulario de proyecto: Visible');

    // PASO 7: Onboarding Step 1 (Nombre + Descripción)
    console.log('Paso 7: Onboarding - Step 1 (Nombre + Descripción)');

    await page.fill('#project-name', testData.project.name);
    console.log(`   - Nombre: ${testData.project.name}`);

    await page.fill('#project-desc', testData.project.description);
    console.log(`   - Descripción: ${testData.project.description}`);

    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/04-onboarding-step1-filled.png',
      fullPage: true 
    });
    console.log('Screenshot: Onboarding step 1 lleno');

    await page.click('button:has-text("Siguiente")');

    // PASO 8: Onboarding Step 2 (Categoría + Zona horaria + Estado)
    console.log('Paso 8: Onboarding - Step 2 (Categoría + Zona horaria + Estado)');

    await page.click(`button:has-text("${testData.project.category}")`);

    await page.click('#timezone');
    await page.click(`[role="option"]:has-text("${testData.project.timezone}")`);

    await page.click('#state');
    await page.click(`[role="option"]:has-text("${testData.project.state}")`);

    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/05-onboarding-step2-filled.png',
      fullPage: true 
    });
    console.log('Screenshot: Onboarding step 2 lleno');

    await page.click('button:has-text("Siguiente")');

    // PASO 9: Onboarding Step 3 (Avatar + Crear)
    console.log('Paso 9: Onboarding - Step 3 (Avatar + Crear)');

    await page.click('button[aria-label^="Seleccionar avatar"]');

    // Screenshot 6: Proyecto listo
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/06-onboarding-step3.png',
      fullPage: true 
    });
    console.log('Screenshot: Onboarding step 3');

    // PASO 10: Crear proyecto
    console.log('Paso 10: Creando proyecto');
    await page.click('button[type="submit"]');
    
    // PASO 11: Verificar dashboard
    console.log('Paso 11: Verificando dashboard');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 10000 });
    console.log('   - Redirigido correctamente a /app/dashboard');
    
    // Screenshot 7: Dashboard con proyecto
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/07-dashboard.png',
      fullPage: true 
    });
    console.log('Screenshot: Dashboard con proyecto');

    // PASO 12: Verificar elementos del dashboard
    console.log('Paso 12: Verificando elementos del dashboard');
    
    // Verificar que el nombre del proyecto está visible
    await expect(page.locator('text=' + testData.project.name)).toBeVisible();
    console.log('   - Nombre del proyecto: Visible');
    
    // Verificar menú lateral
    // await expect(page.locator('nav')).toBeVisible();
    // console.log('   - Menú lateral: Visible');

    // PASO 13: Probar logout
    console.log('Paso 13: Probando logout');

    await page.click(`button:has-text("${testData.name}")`);
    await page.click('[role="menuitem"]:has-text("Cerrar sesion")');
    
    // Esperar redirección
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // PASO 14: Verificar logout
    console.log('Paso 14: Verificando logout');
    
    // Verificar que los tokens fueron eliminados
    const accessTokenAfterLogout = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshTokenAfterLogout = await page.evaluate(() => localStorage.getItem('refresh_token'));
    
    expect(accessTokenAfterLogout).toBeNull();
    expect(refreshTokenAfterLogout).toBeNull();
    console.log('   - Tokens eliminados');
    
    // Verificar redirección a login
    await expect(page).toHaveURL(/\/auth\/login/);
    console.log('   - Redirigido a /auth/login');
    
    // Screenshot 6: Login page después de logout
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/06-after-logout.png',
      fullPage: true 
    });
    console.log('Screenshot: Login page después de logout');

    console.log('\nTEST COMPLETADO EXITOSAMENTE\n');
  });

  // Escenario 1.2: Email ya registrado
  test('Escenario 1.2: Email ya registrado', async ({ page }) => {
    console.log('Escenario 1.2: Probando email ya registrado');
    
    await page.goto('/auth/register');
    
    // Usar email que ya existe
    await page.fill('input[name="email"]', 'owner@example.com');
    await page.fill('input[name="password"]', 'Owner123456');
    await page.fill('input[name="confirmPassword"]', 'Owner123456');
    await page.fill('input[name="name"]', 'Test Owner Duplicate');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=/Email ya registrado|Email already exists/i')).toBeVisible({ timeout: 5000 });
    console.log('   - Mensaje de error visible');
    
    // Screenshot del error
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/error-email-exists.png',
      fullPage: true 
    });
    console.log('Screenshot: Error email ya registrado');
  });

  // Escenario 1.3: Password débil
  test('Escenario 1.3: Password débil', async ({ page }) => {
    console.log('Escenario 1.3: Probando password débil');
    
    await page.goto('/auth/register');
    
    await page.fill('input[name="email"]', `test_weak_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    await page.fill('input[name="name"]', 'Test Weak Password');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=/Password debe contener|Password must contain/i')).toBeVisible({ timeout: 5000 });
    console.log('   - Mensaje de error visible');
    
    // Screenshot del error
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/error-weak-password.png',
      fullPage: true 
    });
    console.log('Screenshot: Error password débil');
  });

  // Escenario 1.4: Campos vacíos
  test('Escenario 1.4: Campos vacíos', async ({ page }) => {
    console.log('Escenario 1.4: Probando campos vacíos');
    
    await page.goto('/auth/register');
    
    // Intentar enviar sin llenar campos
    await page.click('button[type="submit"]');
    
    // Verificar mensajes de error de validación
    await expect(page.locator('text=Revisa los campos')).toBeVisible({ timeout: 5000 });
    console.log('   - Mensajes de error visibles');
    
    // Screenshot del error
    await page.screenshot({ 
      path: 'playwright-tests/screenshots/01-owner-registration/error-empty-fields.png',
      fullPage: true 
    });
    console.log('Screenshot: Error campos vacíos');
  });

});
