import { expect } from "@playwright/test"
import type { Browser, Locator, Page } from "@playwright/test"
import type { TeamScenario, TeamTaskSpec } from "./team-scenarios"
import fs from "node:fs"
import path from "node:path"

type RunOptions = {
  scenario: TeamScenario
  delayMs: number
  seed: number
  baseUrl?: string
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function pause(page: Page, ms: number) {
  await page.waitForTimeout(ms)
}

async function pickCalendarDay(page: Page, offsetDays: number) {
  const calendarGrid = page.locator('[role="grid"]').last()
  await expect(calendarGrid).toBeVisible()
  const enabledDays = calendarGrid.locator("button:not([disabled])")
  const count = await enabledDays.count()
  const index = Math.max(0, Math.min(offsetDays, count - 1))
  await enabledDays.nth(index).click()
}

const presetToOffsetDays: Record<string, number> = {
  Today: 0,
  Tomorrow: 1,
  "In 3 days": 3,
  "In a week": 7,
  "In 2 weeks": 14,
}

async function pickRandomAvatar(page: Page, rng: () => number) {
  const buttons = page.locator('button[aria-label^="Seleccionar avatar"]')
  const count = await buttons.count()
  if (count === 0) return
  const index = Math.floor(rng() * count)
  await buttons.nth(index).click()
}

async function ensureLoggedIn(page: Page, email: string, password: string, delayMs: number) {
  if (!page.url().includes("/auth/login")) return
  await page.locator("#email").fill(email)
  await pause(page, delayMs)
  await page.locator("#password").fill(password)
  await pause(page, delayMs)
  await page.getByRole("button", { name: "Iniciar Sesion" }).click()
  await pause(page, Math.max(delayMs, 500))
}

async function fillChecklist(page: Page, dialog: Locator, items: string[], delayMs: number) {
  if (items.length === 0) return
  for (const item of items.slice(0, 6)) {
    const input = dialog.locator("#new-checklist")
    await input.fill(item)
    await pause(page, delayMs)
    await dialog.getByRole("button", { name: "Agregar" }).click()
    await pause(page, delayMs)
    const list = dialog.getByRole("list").first()
    await expect(list.getByText(item, { exact: true })).toBeVisible()
  }
}

async function createTask(page: Page, task: TeamTaskSpec, employees: { name: string }[], sprints: { name: string }[], delayMs: number) {
  await page.getByRole("button", { name: "Nueva Tarea" }).click()
  await pause(page, delayMs)
  const dialog = page.getByRole("dialog", { name: "Crear Nueva Tarea" })

  await dialog.getByLabel("Título").fill(task.title)
  await pause(page, delayMs)
  await dialog.getByLabel("Descripción").fill(task.description)
  await pause(page, delayMs)

  await dialog.getByLabel("Prioridad").click()
  await pause(page, delayMs)
  await page.getByRole("option", { name: task.priority }).click()
  await pause(page, delayMs)

  await dialog.locator("#new-assignee").click()
  await pause(page, delayMs)
  const assignee = employees[Math.max(0, Math.min(task.assigneeIndex, employees.length - 1))].name
  await page.getByRole("option", { name: new RegExp(`${escapeRegExp(assignee)}$`) }).click()
  await pause(page, delayMs)

  if (task.sprintIndex !== null) {
    const sprintName = sprints[Math.max(0, Math.min(task.sprintIndex, sprints.length - 1))].name
    await dialog.locator("#new-sprint").click()
    await pause(page, delayMs)
    await page.getByRole("option", { name: new RegExp(escapeRegExp(sprintName)) }).first().click()
    await pause(page, delayMs)
  }

  if (task.withStartDate) {
    const startBlock = dialog.locator("label", { hasText: "Fecha de inicio (opcional)" }).locator("..")
    await startBlock.getByRole("button", { name: "Seleccionar fecha" }).click()
    await pause(page, delayMs)
    await pickCalendarDay(page, presetToOffsetDays[task.startPreset] ?? 1)
    await pause(page, delayMs)
  }

  const dueBlock = dialog.locator("label", { hasText: "Fecha de vencimiento" }).locator("..")
  await dueBlock.getByRole("button", { name: "Seleccionar fecha" }).click()
  await pause(page, delayMs)
  await pickCalendarDay(page, presetToOffsetDays[task.duePreset] ?? 7)
  await pause(page, delayMs)

  await dialog.locator("#new-tags").fill(task.tags.join(", "))
  await pause(page, delayMs)

  await fillChecklist(page, dialog, task.checklist, delayMs)

  await dialog.getByRole("button", { name: "Crear Tarea" }).click()
  await pause(page, delayMs)

  const confirm = page.getByRole("dialog", { name: "Vencimiento fuera del sprint" })
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.getByRole("button", { name: "Ajustar fecha" }).click()
    await pause(page, delayMs)
  }

  await expect(page.getByText(task.title)).toBeVisible()
  return task.title
}

export async function runTeamScenario(browser: Browser, options: RunOptions) {
  const { scenario, delayMs, seed } = options
  const baseUrl = (options.baseUrl || "http://localhost:3000").replace(/\/+$/, "")
  const baseOrigin = new URL(baseUrl).origin
  const rng = mulberry32(seed)
  const timestamp = Date.now()

  const ownerEmail = `owner_${scenario.id}_${timestamp}@test.com`
  const ownerPassword = "Test12345A"
  const employeePassword = "Test12345A"

  const employees = scenario.employees.map((e, i) => ({
    ...e,
    email: `employee_${scenario.id}_${i + 1}_${timestamp}@test.com`,
  }))

  const projectName = `${scenario.project.namePrefix} ${timestamp}`

  const log = (msg: string) => console.log(`[team:${scenario.id}] ${msg}`)

  log(`Escenario: ${scenario.label}`)
  log(`Base URL: ${baseUrl}`)
  log(`Owner: ${ownerEmail} / ${ownerPassword}`)
  log(`Empleados: ${employees.map((e) => `${e.name} <${e.email}>`).join(", ")}`)
  log(`Password empleados: ${employeePassword}`)

  const credentialsPath = path.join(__dirname, `team-credentials.${scenario.id}.${timestamp}.json`)
  fs.writeFileSync(
    credentialsPath,
    JSON.stringify(
      {
        scenario: scenario.id,
        baseUrl,
        timestamp,
        owner: { name: scenario.owner.name, email: ownerEmail, password: ownerPassword },
        employees: employees.map((e) => ({ name: e.name, email: e.email, password: employeePassword })),
      },
      null,
      2
    ),
    "utf8"
  )
  log(`Credenciales guardadas: ${credentialsPath}`)

  const ownerContext = await browser.newContext({ baseURL: baseUrl })
  try {
    await ownerContext.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseOrigin })
  } catch {
  }
  const ownerPage = await ownerContext.newPage()

  log("Registro owner")
  await ownerPage.goto("/auth/register")
  await pause(ownerPage, delayMs)
  await ownerPage.getByLabel("Nombre completo").fill(scenario.owner.name)
  await pause(ownerPage, delayMs)
  await ownerPage.getByLabel("Email").fill(ownerEmail)
  await pause(ownerPage, delayMs)
  await ownerPage.locator("#password").fill(ownerPassword)
  await pause(ownerPage, delayMs)
  await ownerPage.locator("#confirmPassword").fill(ownerPassword)
  await pause(ownerPage, delayMs)
  await ownerPage.getByRole("button", { name: "Registrarme" }).click()
  await pause(ownerPage, delayMs)
  await expect(ownerPage).toHaveURL(/\/onboarding/)

  log("Onboarding - proyecto")
  await ownerPage.getByLabel("Nombre del Proyecto").fill(projectName)
  await pause(ownerPage, delayMs)
  await ownerPage.getByLabel("Descripcion").fill(scenario.project.description)
  await pause(ownerPage, delayMs)
  await ownerPage.getByRole("button", { name: "Siguiente" }).click()
  await pause(ownerPage, delayMs)

  log("Onboarding - categoria/sprints")
  await ownerPage.getByRole("button", { name: scenario.category }).click()
  await pause(ownerPage, delayMs)

  const stateTrigger = ownerPage.locator("#state")
  if (await stateTrigger.isVisible().catch(() => false)) {
    await stateTrigger.click()
    await pause(ownerPage, delayMs)
    await ownerPage.getByRole("option", { name: "Ciudad de Mexico" }).click()
    await pause(ownerPage, delayMs)
  }

  const sprintSection = ownerPage.locator("div", { hasText: "Habilitar sprints" }).first()
  const sprintSwitch = sprintSection.locator('button[role="switch"]')
  await expect(sprintSwitch).toBeVisible()
  if ((await sprintSwitch.getAttribute("aria-checked")) !== "true") {
    await sprintSwitch.click()
    await pause(ownerPage, delayMs)
  }

  await ownerPage.getByRole("button", { name: "Siguiente" }).click()
  await pause(ownerPage, delayMs)

  log("Onboarding - avatar")
  await pickRandomAvatar(ownerPage, rng)
  await pause(ownerPage, delayMs)
  await ownerPage.getByRole("button", { name: "Crear mi espacio" }).click()
  await pause(ownerPage, delayMs)
  await expect(ownerPage).toHaveURL(/\/app\/dashboard/)

  log("Owner cambia avatar en perfil")
  await ownerPage.goto("/app/profile")
  await pause(ownerPage, delayMs)
  await pickRandomAvatar(ownerPage, rng)
  await pause(ownerPage, delayMs)
  await ownerPage.getByRole("button", { name: "Guardar" }).click()
  await pause(ownerPage, delayMs)
  await expect(ownerPage.getByText("Perfil actualizado")).toBeVisible()

  log("Ajustar configuración")
  await ownerPage.goto("/app/settings")
  await pause(ownerPage, delayMs)
  await expect(ownerPage).toHaveURL(/\/app\/settings/)
  const retentionBlock = ownerPage.locator("div.grid.gap-2").filter({
    has: ownerPage.locator("label", { hasText: "Retencion de tareas completadas (dias)" }),
  }).first()
  await expect(retentionBlock).toBeVisible()
  const retentionInput = retentionBlock.locator('input[type="number"]').first()
  await expect(retentionInput).toBeEnabled()
  await retentionInput.fill(String(scenario.settings.tasksRetentionDays))
  await pause(ownerPage, delayMs)
  const sprintLengthBlock = ownerPage.locator("div.grid.gap-2").filter({
    has: ownerPage.locator("label", { hasText: "Duracion del sprint (dias)" }),
  }).first()
  await expect(sprintLengthBlock).toBeVisible()
  const sprintLengthInput = sprintLengthBlock.locator('input[type="number"]').first()
  await expect(sprintLengthInput).toBeEnabled()
  await sprintLengthInput.fill(String(scenario.settings.sprintLengthDays))
  await pause(ownerPage, delayMs)
  await expect(ownerPage.getByText("Rango permitido: 7 a 30 días.")).toBeVisible()

  log("Crear 4 sprints")
  for (const sp of scenario.sprints) {
    await ownerPage.getByRole("button", { name: "Crear sprint" }).click()
    await pause(ownerPage, delayMs)
    const sprintDialog = ownerPage.getByRole("dialog", { name: "Crear sprint" })
    await expect(sprintDialog).toBeVisible()
    await sprintDialog.locator("input").first().fill(sp.name)
    await pause(ownerPage, delayMs)
    await sprintDialog.getByRole("button", { name: sp.color }).click()
    await pause(ownerPage, delayMs)
    const startSection = sprintDialog.locator("label", { hasText: "Fecha de inicio" }).locator("..")
    await startSection.getByRole("button", { name: "Seleccionar fecha" }).click()
    await pause(ownerPage, delayMs)
    await pickCalendarDay(ownerPage, sp.offsetDays)
    await pause(ownerPage, delayMs)
    await sprintDialog.getByRole("button", { name: "Crear" }).click()
    await pause(ownerPage, delayMs)
    await expect(ownerPage.getByText(sp.name)).toBeVisible()
  }

  log("Activar primer sprint")
  const firstSprintRow = ownerPage.locator("div.rounded-lg.border").filter({ hasText: scenario.sprints[0].name }).first()
  await firstSprintRow.getByRole("button", { name: "Activar" }).first().click()
  await pause(ownerPage, delayMs)
  await expect(firstSprintRow.getByText(/·\s*active/i)).toBeVisible()

  log("Invitar 10 empleados")
  await ownerPage.goto("/app/team")
  await pause(ownerPage, delayMs)
  await expect(ownerPage).toHaveURL(/\/app\/team/)

  const inviteLinks: string[] = []
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i]
    await ownerPage.getByRole("button", { name: "Invitar Miembro" }).click()
    await pause(ownerPage, delayMs)
    const inviteDialog = ownerPage.getByRole("dialog", { name: "Invitar al Equipo" })
    await inviteDialog.locator('input[type="email"]').fill(employee.email)
    await pause(ownerPage, delayMs)
    await inviteDialog.getByPlaceholder("Ej: Puesto del empleado").fill(`Rol ${i + 1}`)
    await pause(ownerPage, delayMs)
    await inviteDialog.getByPlaceholder("Ej: Nombre del departamento").fill(i % 2 === 0 ? "Operaciones" : "Marketing")
    await pause(ownerPage, delayMs)
    await inviteDialog.getByPlaceholder("Breve descripción del empleado...").fill(`Perfil del empleado ${i + 1} para escenario ${scenario.id}.`)
    await pause(ownerPage, delayMs)
    await inviteDialog.getByPlaceholder("Principales responsabilidades del puesto...").fill(`Responsabilidades clave ${i + 1}.`)
    await pause(ownerPage, delayMs)
    await inviteDialog.getByPlaceholder("Ej: Habilidades separadas por comas").fill(`Comunicación, Excel, Gestión, ${scenario.id}`)
    await pause(ownerPage, delayMs)
    await inviteDialog.locator('button:has-text("Seleccionar turno")').click()
    await pause(ownerPage, delayMs)
    await ownerPage.getByRole("option", { name: i % 3 === 0 ? "Mañana" : i % 3 === 1 ? "Tarde" : "Flexible" }).click()
    await pause(ownerPage, delayMs)
    await inviteDialog.locator('input[type="tel"]').fill(`+52 55 10${String(i).padStart(2, "0")} 0000`)
    await pause(ownerPage, delayMs)
    const inviteResponsePromise = ownerPage.waitForResponse((resp) => {
      try {
        return resp.url().includes("/api/invites") && resp.request().method() === "POST"
      } catch {
        return false
      }
    })
    await inviteDialog.getByRole("button", { name: "Enviar Invitacion" }).click()
    await pause(ownerPage, delayMs)
    await expect(inviteDialog).toBeHidden()

    let token: string | null = null
    try {
      const resp = await inviteResponsePromise
      const data = await resp.json().catch(() => null)
      token = data?.invite?.token ?? data?.token ?? null
    } catch {
      token = null
    }

    if (!token) {
      await ownerPage.locator(`tr:has-text("${employee.email}") button[title="Copiar link de invitación"]`).first().click()
      await pause(ownerPage, delayMs)
      const inviteLink = await ownerPage.evaluate(async () => navigator.clipboard.readText())
      expect(inviteLink).toContain("token=")
      inviteLinks.push(inviteLink)
    } else {
      inviteLinks.push(`${baseUrl}/invite/accept?token=${token}`)
    }
  }

  log("Aceptar invitaciones (nuevas ventanas)")
  for (let i = 0; i < inviteLinks.length; i++) {
    const employee = employees[i]
    const employeeContext = await browser.newContext({ baseURL: baseUrl })
    const employeePage = await employeeContext.newPage()
    await employeePage.goto(inviteLinks[i])
    await pause(employeePage, delayMs)
    await employeePage.getByLabel("Nombre").fill(employee.name)
    await pause(employeePage, delayMs)
    await pickRandomAvatar(employeePage, rng)
    await pause(employeePage, delayMs)
    await employeePage.locator("#password").fill(employeePassword)
    await pause(employeePage, delayMs)
    await employeePage.locator("#confirmPassword").fill(employeePassword)
    await pause(employeePage, delayMs)
    await employeePage.getByRole("button", { name: "Crear Cuenta" }).click()
    await pause(employeePage, delayMs)
    await expect(employeePage).toHaveURL(/\/work\/my-tasks/, { timeout: 30000 })

    if (i === 0) {
      log("Empleado 1 cambia avatar en /work/profile")
      await employeePage.goto("/work/profile")
      await pause(employeePage, delayMs)
      await pickRandomAvatar(employeePage, rng)
      await pause(employeePage, delayMs)
      await employeePage.getByRole("button", { name: "Guardar" }).click()
      await pause(employeePage, delayMs)
      await expect(employeePage.getByText("Perfil actualizado")).toBeVisible()
    }

    await employeeContext.close()
  }

  log("Crear 15 tareas con tags/checklist")
  await ownerPage.goto("/app/tasks")
  await pause(ownerPage, delayMs)
  await expect(ownerPage).toHaveURL(/\/app\/tasks/)

  const sprintNames = scenario.sprints.map((s) => ({ name: s.name }))
  const createdTitles: string[] = []
  for (const baseTask of scenario.tasks) {
    const title = `${baseTask.title} - ${timestamp}`
    const createdTitle = await createTask(
      ownerPage,
      { ...baseTask, title },
      employees,
      sprintNames,
      delayMs
    )
    createdTitles.push(createdTitle)
  }

  log("Actualizar estatus y agregar comentarios a tareas")
  const statusExamples: { title: string; statusLabel: string; comment: string }[] = [
    { title: createdTitles[0], statusLabel: "En Progreso", comment: "Arrancamos ejecución. Primeros avances y próximos pasos definidos." },
    { title: createdTitles[1], statusLabel: "En Revisión", comment: "Listo para revisión. Favor validar checklist y comentarios." },
    { title: createdTitles[2], statusLabel: "Bloqueada", comment: "Bloqueada por dependencias externas. Se requiere aprobación/insumo." },
    { title: createdTitles[3], statusLabel: "Hecha", comment: "Entregable finalizado y validado. Cerramos tarea." },
  ].filter((x) => !!x.title)

  for (const ex of statusExamples) {
    await ownerPage.goto("/app/tasks")
    await pause(ownerPage, delayMs)
    await ownerPage.getByPlaceholder("Buscar tareas...").fill(ex.title)
    await pause(ownerPage, delayMs)
    await ownerPage.getByRole("link", { name: ex.title }).first().click()
    await pause(ownerPage, delayMs)

    const statusBlock = ownerPage.locator("div", { has: ownerPage.locator("span", { hasText: "Estado" }) }).first()
    const statusCombo = statusBlock.getByRole("combobox").first()
    await statusCombo.click()
    await pause(ownerPage, delayMs)
    await ownerPage.getByRole("option", { name: ex.statusLabel }).click()
    await pause(ownerPage, delayMs)

    await ownerPage.getByPlaceholder("Escribe un comentario...").fill(ex.comment)
    await pause(ownerPage, delayMs)
    await ownerPage.locator("button:has(svg.lucide-send)").click()
    await pause(ownerPage, delayMs)
    await expect(ownerPage.getByText(ex.comment)).toBeVisible()
  }

  log("Mover una tarea en Board")
  await ownerPage.goto("/app/board")
  await pause(ownerPage, delayMs)
  await expect(ownerPage).toHaveURL(/\/app\/board/)
  await expect(ownerPage.getByRole("heading", { name: "En Revisión" })).toBeVisible()
  await expect(ownerPage.getByRole("heading", { name: "En Progreso" })).toBeVisible()
  const draggableCard = ownerPage.locator('[draggable="true"]').first()
  const inProgressColumn = ownerPage.getByRole("heading", { name: "En Progreso" }).locator("..").locator("..")
  if (await draggableCard.isVisible().catch(() => false)) {
    await draggableCard.dragTo(inProgressColumn)
    await pause(ownerPage, delayMs)
    await expect(ownerPage.getByText("Estado actualizado")).toBeVisible()
  }

  log("Validar Timeline")
  await ownerPage.goto("/app/timeline")
  await ownerPage.waitForLoadState("domcontentloaded")
  await pause(ownerPage, Math.max(delayMs, 500))
  await ensureLoggedIn(ownerPage, ownerEmail, ownerPassword, delayMs)
  if (ownerPage.url().includes("/auth/login")) {
    await ownerPage.goto("/app/timeline")
    await ownerPage.waitForLoadState("domcontentloaded")
    await pause(ownerPage, Math.max(delayMs, 500))
  }
  await expect(ownerPage).toHaveURL(/\/app\/timeline/)
  await expect(ownerPage.locator("h1", { hasText: "Timeline" })).toBeVisible({ timeout: 30000 })
  await expect(ownerPage.getByPlaceholder("Título o descripción")).toBeVisible()
  const sampleTaskTitle = `${scenario.tasks[0].title} - ${timestamp}`
  await ownerPage.getByPlaceholder("Título o descripción").fill(sampleTaskTitle)
  await pause(ownerPage, delayMs)
  await expect(ownerPage.getByRole("link", { name: sampleTaskTitle })).toBeVisible()

  log("Validar Calendar")
  await ownerPage.goto("/app/calendar")
  await pause(ownerPage, delayMs)
  await ensureLoggedIn(ownerPage, ownerEmail, ownerPassword, delayMs)
  if (ownerPage.url().includes("/auth/login")) {
    await ownerPage.goto("/app/calendar")
    await pause(ownerPage, delayMs)
  }
  await expect(ownerPage).toHaveURL(/\/app\/calendar/)
  await expect(ownerPage.getByText("Tareas organizadas por fecha de vencimiento")).toBeVisible()
  await ownerPage.getByPlaceholder("Título o descripción").fill(sampleTaskTitle)
  await pause(ownerPage, delayMs)
  const taskLinkInCalendar = ownerPage.getByRole("link", { name: sampleTaskTitle }).first()
  await expect(taskLinkInCalendar).toBeVisible()
  const dayCell = taskLinkInCalendar.locator('xpath=ancestor::div[contains(@class,"min-h-[80px]")]')
  await dayCell.click({ position: { x: 6, y: 6 } })
  await pause(ownerPage, delayMs)
  await expect(ownerPage.getByRole("dialog")).toBeVisible()
  await expect(ownerPage.getByRole("dialog").getByText(sampleTaskTitle)).toBeVisible()

  log("Cerrar sprint activo")
  await ownerPage.goto("/app/settings")
  await pause(ownerPage, delayMs)
  const rowToClose = ownerPage.locator("div.rounded-lg.border").filter({ hasText: scenario.sprints[0].name }).first()
  await expect(rowToClose.getByText(/·\s*active/i)).toBeVisible()
  await rowToClose.getByRole("button", { name: "Cerrar" }).first().click()
  await pause(ownerPage, delayMs)
  await expect(rowToClose.getByText(/·\s*closed/i)).toBeVisible()

  log("DONE")
  await ownerContext.close()
}
