import { test } from "@playwright/test"
import { TEAM_SCENARIOS } from "./team-scenarios"
import { runTeamScenario } from "./team-runner"

test("Crear equipo (escenario seleccionable)", async ({ browser }) => {
  test.setTimeout(20 * 60 * 1000)

  const rawScenario = (process.env.TEAM_SCENARIO || "marketing").toLowerCase()
  const scenario = (TEAM_SCENARIOS as any)[rawScenario] ?? TEAM_SCENARIOS.marketing
  const delayMs = Number.isFinite(Number(process.env.TEAM_DELAY_MS)) ? Number(process.env.TEAM_DELAY_MS) : 1000
  const seed = Number.isFinite(Number(process.env.TEAM_SEED)) ? Number(process.env.TEAM_SEED) : Date.now()
  const baseUrl = process.env.TEAM_BASE_URL || "http://localhost:3000"

  await runTeamScenario(browser, { scenario, delayMs, seed, baseUrl })
})
