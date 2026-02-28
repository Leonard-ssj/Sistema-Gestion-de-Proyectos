import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para crear un equipo completo automaticamente
 * 
 * Crea: 1 Owner + Proyecto + 3 Empleados + 5 Tareas
 * Guarda credenciales en: playwright-tests/team-credentials.json
 * 
 * Uso:
 * npx playwright test playwright-tests/create-team.spec.ts --headed
 */

interface TeamCredentials {
  timestamp: string;
  owner: {
    email: string;
    password: string;
    name: string;
    access_token: string;
    project: {
      id: string;
      name: string;
      description: string;
    };
  };
  employees: Array<{
    email: string;
    password: string;
    name: string;
    access_token: string;
    invite_token: string;
    invite_link: string;
    user_id: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    assigned_to: string | null;
    assigned_to_name: string | null;
    due_date: string;
  }>;
}

test.describe('Create Complete Team', () => {
  const BASE_URL = 'http://localhost:3000';
  const timestamp = Date.now();
  
  const teamData = {
    owner: {
      email: `carlos.mendez.${timestamp}@acmeconsulting.com`,
      password: 'SecurePass2024!',
      name: 'Carlos Mendez',
    },
    project: {
      name: 'Auditoria Financiera Q1 2024',
      description: 'Proyecto de auditoria y revision de estados financieros del primer trimestre',
    },
    employees: [
      {
        email: `ana.rodriguez.${timestamp}@acmeconsulting.com`,
        password: 'SecurePass2024!',
        name: 'Ana Rodriguez',
      },
      {
        email: `miguel.torres.${timestamp}@acmeconsulting.com`,
        password: 'SecurePass2024!',
        name: 'Miguel Torres',
      },
      {
        email: `laura.garcia.${timestamp}@acmeconsulting.com`,
        password: 'SecurePass2024!',
        name: 'Laura Garcia',
      },
    ],
    tasks: [
      {
        title: 'Revision de balance general',
        description: 'Analizar y validar el balance general del trimestre, verificando activos, pasivos y patrimonio',
        priority: 'urgent',
        assignedToIndex: 0,
      },
      {
        title: 'Analisis de flujo de efectivo',
        description: 'Revisar movimientos de efectivo, entradas y salidas, conciliaciones bancarias',
        priority: 'high',
        assignedToIndex: 1,
      },
      {
        title: 'Validacion de cuentas por cobrar',
        description: 'Verificar antiguedad de saldos, provisiones y recuperabilidad de cuentas por cobrar',
        priority: 'high',
        assignedToIndex: 2,
      },
      {
        title: 'Preparar informe ejecutivo',
        description: 'Consolidar hallazgos y preparar presentacion para la direccion',
        priority: 'medium',
        assignedToIndex: 0,
      },
      {
        title: 'Revision de cumplimiento fiscal',
        description: 'Verificar declaraciones, retenciones y cumplimiento de obligaciones tributarias',
        priority: 'medium',
        assignedToIndex: null,
      },
    ],
  };

  test('Crear equipo completo con owner, empleados y tareas', async ({ browser }) => {
    test.setTimeout(300000);
    
    // Crear contexto con permisos de clipboard
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write']
    });
    
    const credentials: TeamCredentials = {
      timestamp: new Date().toISOString(),
      owner: {
        email: teamData.owner.email,
        password: teamData.owner.password,
        name: teamData.owner.name,
        access_token: '',
        project: {
          id: '',
          name: teamData.project.name,
          description: teamData.project.description,
        },
      },
      employees: [],
      tasks: [],
    };

    console.log('\nIniciando creacion de equipo completo');
    console.log('=====================================\n');

    // FASE 1: REGISTRAR OWNER Y CREAR PROYECTO
    console.log('FASE 1: Registrar Owner y Crear Proyecto');
    console.log('-----------------------------------------');
    
    const ownerPage = await context.newPage();
    
    let ownerToken = '';
    ownerPage.on('response', async (response) => {
      if (response.url().includes('/auth/register') && response.status() === 201) {
        try {
          const data = await response.json();
          if (data.access_token) {
            ownerToken = data.access_token;
            console.log('  Token de owner capturado');
          }
        } catch (e) {}
      }
    });
    
    console.log('Navegando a registro');
    await ownerPage.goto(`${BASE_URL}/auth/register`);
    await ownerPage.waitForLoadState('networkidle');
    await ownerPage.waitForTimeout(1500);
    
    console.log(`Registrando owner: ${teamData.owner.name}`);
    await ownerPage.fill('input[name="email"]', teamData.owner.email);
    await ownerPage.waitForTimeout(500);
    await ownerPage.fill('input[name="password"]', teamData.owner.password);
    await ownerPage.waitForTimeout(500);
    await ownerPage.fill('input[name="confirmPassword"]', teamData.owner.password);
    await ownerPage.waitForTimeout(500);
    await ownerPage.fill('input[name="name"]', teamData.owner.name);
    await ownerPage.waitForTimeout(1000);
    await ownerPage.click('button[type="submit"]');
    await ownerPage.waitForLoadState('networkidle');
    
    await ownerPage.waitForTimeout(2000);
    credentials.owner.access_token = ownerToken;
    
    await expect(ownerPage).toHaveURL(/\/onboarding/, { timeout: 10000 });
    console.log('Owner registrado correctamente');
    
    let projectId = '';
    ownerPage.on('response', async (response) => {
      if (response.url().includes('/projects') && response.status() === 201) {
        try {
          const data = await response.json();
          if (data.project && data.project.id) {
            projectId = data.project.id;
            console.log(`  Project ID capturado: ${projectId}`);
          }
        } catch (e) {}
      }
    });
    
    console.log(`Creando proyecto: ${teamData.project.name}`);
    
    // Paso 1: Nombre del proyecto
    await ownerPage.fill('input[id="project-name"]', teamData.project.name);
    await ownerPage.waitForTimeout(1000);
    await ownerPage.click('button:has-text("Siguiente")');
    await ownerPage.waitForTimeout(1000);
    
    // Paso 2: Descripcion
    await ownerPage.fill('textarea[id="project-desc"]', teamData.project.description);
    await ownerPage.waitForTimeout(1000);
    await ownerPage.click('button:has-text("Siguiente")');
    await ownerPage.waitForTimeout(1000);
    
    // Paso 3: Categoria - seleccionar "Consultoria"
    await ownerPage.click('button:has-text("Consultoria")');
    await ownerPage.waitForTimeout(800);
    await ownerPage.click('button:has-text("Crear Proyecto")');
    await ownerPage.waitForLoadState('networkidle');
    
    await ownerPage.waitForTimeout(2000);
    credentials.owner.project.id = projectId;
    
    await expect(ownerPage).toHaveURL(/\/app\/dashboard/, { timeout: 10000 });
    console.log('Proyecto creado correctamente\n');

    // FASE 2: CREAR INVITACIONES
    console.log('FASE 2: Crear Invitaciones');
    console.log('---------------------------');
    
    await ownerPage.goto(`${BASE_URL}/app/team`);
    await ownerPage.waitForLoadState('networkidle');
    await ownerPage.waitForTimeout(2000);
    
    const inviteLinks: string[] = [];
    
    // Datos de enriquecimiento para cada empleado
    const employeeEnrichment = [
      {
        job_title: 'Analista Senior de Auditoria',
        department: 'Auditoria Financiera',
        description: 'Especialista en revision de estados financieros y balance general',
        responsibilities: 'Analisis de balance general, revision de activos y pasivos, preparacion de informes ejecutivos',
        skills: 'Contabilidad, Auditoria, Excel Avanzado, NIIF',
        shift: 'morning' as const,
        phone: '+52 55 1234 5678'
      },
      {
        job_title: 'Analista de Flujo de Efectivo',
        department: 'Auditoria Financiera',
        description: 'Experto en analisis de movimientos de efectivo y conciliaciones bancarias',
        responsibilities: 'Revision de flujo de efectivo, conciliaciones bancarias, analisis de liquidez',
        skills: 'Finanzas, Analisis de Flujo, Conciliaciones, SAP',
        shift: 'morning' as const,
        phone: '+52 55 2345 6789'
      },
      {
        job_title: 'Especialista en Cuentas por Cobrar',
        department: 'Auditoria Financiera',
        description: 'Especialista en validacion de cuentas por cobrar y provisiones',
        responsibilities: 'Validacion de cuentas por cobrar, analisis de antiguedad de saldos, calculo de provisiones',
        skills: 'Credito y Cobranza, Analisis de Cartera, Excel, Power BI',
        shift: 'afternoon' as const,
        phone: '+52 55 3456 7890'
      }
    ];
    
    for (let i = 0; i < teamData.employees.length; i++) {
      const employee = teamData.employees[i];
      const enrichment = employeeEnrichment[i];
      console.log(`Invitacion ${i + 1}/${teamData.employees.length}: ${employee.name}`);
      
      // Abrir dialogo de invitacion
      await ownerPage.waitForTimeout(2000);
      await ownerPage.click('button:has-text("Invitar Miembro")');
      await ownerPage.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
      await ownerPage.waitForTimeout(1500);
      
      // Llenar email
      console.log('  Llenando formulario de invitacion...');
      await ownerPage.fill('input[type="email"]', employee.email);
      await ownerPage.waitForTimeout(800);
      
      // Llenar datos de enriquecimiento
      await ownerPage.fill('input[placeholder*="Puesto"]', enrichment.job_title);
      await ownerPage.waitForTimeout(500);
      
      await ownerPage.fill('input[placeholder*="departamento"]', enrichment.department);
      await ownerPage.waitForTimeout(500);
      
      await ownerPage.fill('textarea[placeholder*="descripción"]', enrichment.description);
      await ownerPage.waitForTimeout(500);
      
      await ownerPage.fill('textarea[placeholder*="responsabilidades"]', enrichment.responsibilities);
      await ownerPage.waitForTimeout(500);
      
      await ownerPage.fill('input[placeholder*="Habilidades"]', enrichment.skills);
      await ownerPage.waitForTimeout(500);
      
      // Seleccionar turno
      await ownerPage.click('button:has-text("Seleccionar turno")');
      await ownerPage.waitForTimeout(500);
      const shiftMap = {
        'morning': 'Mañana',
        'afternoon': 'Tarde',
        'night': 'Noche',
        'flexible': 'Flexible'
      };
      await ownerPage.click(`[role="option"]:has-text("${shiftMap[enrichment.shift]}")`);
      await ownerPage.waitForTimeout(500);
      
      await ownerPage.fill('input[type="tel"]', enrichment.phone);
      await ownerPage.waitForTimeout(1000);
      
      // Enviar invitacion
      await ownerPage.click('button:has-text("Enviar Invitacion")');
      console.log('  Enviando invitacion...');
      
      // Esperar a que el dialogo se cierre (indica que la invitacion se envio)
      await ownerPage.waitForSelector('input[type="email"]', { state: 'hidden', timeout: 10000 });
      await ownerPage.waitForTimeout(2000);
      
      // Esperar a que aparezca la invitacion en la tabla
      await ownerPage.waitForSelector(`text=${employee.email}`, { timeout: 10000 });
      console.log('  Invitacion creada en la tabla');
      
      // Hacer click en el boton de copiar link (el primer boton de la fila de esta invitacion)
      const copyButton = ownerPage.locator(`tr:has-text("${employee.email}") button[title="Copiar link de invitación"]`).first();
      await copyButton.click();
      await ownerPage.waitForTimeout(1500);
      
      // Obtener el link del clipboard usando evaluate
      const inviteLink = await ownerPage.evaluate(async () => {
        return await navigator.clipboard.readText();
      });
      
      inviteLinks.push(inviteLink);
      console.log(`  Link copiado: ${inviteLink.substring(0, 50)}...`);
      await ownerPage.waitForTimeout(2000);
    }
    console.log('');

    // FASE 3: ACEPTAR INVITACIONES
    console.log('FASE 3: Aceptar Invitaciones');
    console.log('-----------------------------');
    
    for (let i = 0; i < teamData.employees.length; i++) {
      const employee = teamData.employees[i];
      const inviteLink = inviteLinks[i];
      
      console.log(`Empleado ${i + 1}/${teamData.employees.length}: ${employee.name}`);
      console.log(`  Abriendo link: ${inviteLink.substring(0, 50)}...`);
      
      const empContext = await browser.newContext();
      const empPage = await empContext.newPage();
      
      let empToken = '';
      let empUserId = '';
      empPage.on('response', async (response) => {
        if (response.url().includes('/auth/accept-invite') && response.status() === 201) {
          try {
            const data = await response.json();
            if (data.access_token) {
              empToken = data.access_token;
            }
            if (data.user && data.user.id) {
              empUserId = data.user.id;
            }
            console.log('  Token de empleado capturado');
          } catch (e) {}
        }
      });
      
      await empPage.goto(inviteLink);
      await empPage.waitForLoadState('networkidle');
      await empPage.waitForTimeout(2000);
      
      await empPage.fill('input[id="name"]', employee.name);
      await empPage.waitForTimeout(500);
      await empPage.fill('input[id="password"]', employee.password);
      await empPage.waitForTimeout(500);
      await empPage.fill('input[id="confirmPassword"]', employee.password);
      await empPage.waitForTimeout(1000);
      await empPage.click('button[type="submit"]');
      
      await empPage.waitForTimeout(3000);
      
      await expect(empPage).toHaveURL(/\/work\/my-tasks/, { timeout: 10000 });
      console.log('  Empleado registrado correctamente');
      
      // Extraer token del link
      const token = inviteLink.split('token=')[1] || '';
      
      credentials.employees.push({
        email: employee.email,
        password: employee.password,
        name: employee.name,
        access_token: empToken,
        invite_token: token,
        invite_link: inviteLink,
        user_id: empUserId,
      });
      
      await empContext.close();
      await ownerPage.waitForTimeout(2000);
    }
    console.log('');

    // FASE 4: CREAR TAREAS
    console.log('FASE 4: Crear Tareas');
    console.log('--------------------');
    
    await ownerPage.goto(`${BASE_URL}/app/tasks`);
    await ownerPage.waitForLoadState('networkidle');
    
    for (let i = 0; i < teamData.tasks.length; i++) {
      const task = teamData.tasks[i];
      console.log(`Tarea ${i + 1}/${teamData.tasks.length}: ${task.title}`);
      
      const taskPromise = new Promise<any>((resolve) => {
        const handler = async (response: any) => {
          if (response.url().includes('/tasks') && response.status() === 201) {
            try {
              const data = await response.json();
              if (data.task) {
                ownerPage.off('response', handler);
                resolve(data.task);
              }
            } catch (e) {}
          }
        };
        ownerPage.on('response', handler);
      });
      
      await ownerPage.click('button:has-text("Nueva Tarea")');
      await ownerPage.waitForSelector('input[id="new-title"]', { state: 'visible' });
      await ownerPage.waitForTimeout(1000);
      
      await ownerPage.fill('input[id="new-title"]', task.title);
      await ownerPage.waitForTimeout(800);
      await ownerPage.fill('textarea[id="new-desc"]', task.description);
      await ownerPage.waitForTimeout(800);
      
      await ownerPage.locator('#new-priority').click();
      await ownerPage.waitForTimeout(800);
      
      const priorityMap: Record<string, string> = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
      };
      await ownerPage.locator(`[role="option"]:has-text("${priorityMap[task.priority]}")`).click();
      await ownerPage.waitForTimeout(800);
      
      // Primero asignar empleado si corresponde (ANTES de la fecha)
      if (task.assignedToIndex !== null && credentials.employees[task.assignedToIndex]) {
        await ownerPage.locator('#new-assignee').click();
        await ownerPage.waitForTimeout(800);
        
        const empName = credentials.employees[task.assignedToIndex].name;
        await ownerPage.locator(`[role="option"]:has-text("${empName}")`).click();
        await ownerPage.waitForTimeout(800);
        console.log(`  Asignado a: ${empName}`);
      }
      
      // Seleccionar fecha usando el CalendarWithPresets
      // 1. Hacer click en el botón que dice "Seleccionar fecha"
      await ownerPage.click('button:has-text("Seleccionar fecha")');
      await ownerPage.waitForTimeout(1500);
      
      // 2. Hacer click directamente en el botón "Tomorrow" del preset
      // El popover se abre automáticamente, no necesitamos esperar por un selector específico
      await ownerPage.click('button:has-text("Tomorrow")');
      await ownerPage.waitForTimeout(800);
      
      // 3. Calcular la fecha de mañana para el registro
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      console.log(`  Fecha seleccionada: ${tomorrow.toLocaleDateString()}`);
      
      // Hacer click en "Crear Tarea" y esperar la respuesta con timeout
      await ownerPage.click('button:has-text("Crear Tarea")');
      
      try {
        const createdTask = await Promise.race([
          taskPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout esperando respuesta de creación de tarea')), 15000))
        ]);
        await ownerPage.waitForTimeout(2000);
        
        console.log('  Tarea creada');
        
        credentials.tasks.push({
          id: createdTask.id || `task_${i}`,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'pending',
          assigned_to: task.assignedToIndex !== null ? credentials.employees[task.assignedToIndex].user_id : null,
          assigned_to_name: task.assignedToIndex !== null ? credentials.employees[task.assignedToIndex].name : null,
          due_date: tomorrowStr,
        });
      } catch (error) {
        console.log(`  Error creando tarea: ${error}`);
        console.log('  Continuando con la siguiente tarea...');
        
        // Agregar tarea con ID temporal
        credentials.tasks.push({
          id: `task_${i}_temp`,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'pending',
          assigned_to: task.assignedToIndex !== null ? credentials.employees[task.assignedToIndex].user_id : null,
          assigned_to_name: task.assignedToIndex !== null ? credentials.employees[task.assignedToIndex].name : null,
          due_date: tomorrowStr,
        });
        
        // Cerrar el diálogo si está abierto
        try {
          await ownerPage.click('button:has-text("Cancelar")');
          await ownerPage.waitForTimeout(1000);
        } catch (e) {
          // El diálogo ya se cerró
        }
      }
    }
    console.log('');

    // FASE 5: GUARDAR CREDENCIALES
    console.log('FASE 5: Guardar Credenciales');
    console.log('-----------------------------');
    
    const outputPath = path.join(__dirname, 'team-credentials.json');
    fs.writeFileSync(outputPath, JSON.stringify(credentials, null, 2), 'utf-8');
    
    console.log(`Credenciales guardadas en: ${outputPath}`);
    
    console.log('\nRESUMEN:');
    console.log(`  Owner: ${credentials.owner.email}`);
    console.log(`  Proyecto: ${credentials.owner.project.name}`);
    console.log(`  Empleados: ${credentials.employees.length}`);
    console.log(`  Tareas: ${credentials.tasks.length}`);
    console.log(`  Tareas asignadas: ${credentials.tasks.filter(t => t.assigned_to).length}`);

    await context.close();
    
    console.log('\n=====================================');
    console.log('Equipo creado exitosamente');
    console.log('=====================================\n');
  });
});
