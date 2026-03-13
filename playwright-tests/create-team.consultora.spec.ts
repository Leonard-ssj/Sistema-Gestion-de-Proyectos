import { test } from "@playwright/test"
import { TEAM_SCENARIOS } from "./team-scenarios"
import { runTeamScenario } from "./team-runner"

test("Crear equipo - Consultora", async ({ browser }) => {
  test.setTimeout(20 * 60 * 1000)
  const delayMs = 1000
  const seed = Date.now()
  await runTeamScenario(browser, { scenario: TEAM_SCENARIOS.consultora, delayMs, seed })
})

