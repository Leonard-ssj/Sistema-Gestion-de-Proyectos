const { spawnSync } = require("node:child_process")
const path = require("node:path")
const fs = require("node:fs")

const scenario = (process.argv[2] || "").toLowerCase()
const delayMs = process.argv[3] || "1000"
let extraArgs = process.argv.slice(4)

const scenarios = ["marketing", "consultora", "legal", "base"]

if (!scenario || !scenarios.includes(scenario)) {
  process.stdout.write(`Uso:\n  node playwright-tests/run-team-scenario.cjs <${scenarios.join("|")}> [delayMs]\n\n`)
  process.stdout.write(
    `Ejemplos:\n  node playwright-tests/run-team-scenario.cjs marketing 1000 --headed\n  node playwright-tests/run-team-scenario.cjs consultora 800\n  node playwright-tests/run-team-scenario.cjs marketing 500 https://sistema-gestion-de-proyectos-dev.vercel.app\n\n`
  )
  process.exit(1)
}

let baseUrl = null
if (extraArgs[0] && /^https?:\/\//i.test(extraArgs[0])) {
  baseUrl = extraArgs[0]
  extraArgs = extraArgs.slice(1)
}
for (let i = 0; i < extraArgs.length; i++) {
  const arg = extraArgs[i]
  if (arg === "--base-url" && extraArgs[i + 1]) {
    baseUrl = extraArgs[i + 1]
    extraArgs.splice(i, 2)
    break
  }
  if (typeof arg === "string" && arg.startsWith("--base-url=")) {
    baseUrl = arg.slice("--base-url=".length)
    extraArgs.splice(i, 1)
    break
  }
}

const repoRoot = path.resolve(__dirname, "..")
const playwrightBin = path.join(
  repoRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "playwright.cmd" : "playwright"
)

if (!fs.existsSync(playwrightBin)) {
  process.stderr.write(
    `No se encontró el binario local de Playwright:\n  ${playwrightBin}\n\n` +
      `Solución:\n  1) cd ${repoRoot}\n  2) npm install\n\n`
  )
  process.exit(1)
}

const env = { ...process.env, TEAM_SCENARIO: scenario, TEAM_DELAY_MS: String(delayMs) }
if (baseUrl) env.TEAM_BASE_URL = baseUrl
const baseArgs = ["test", "playwright-tests/create-team.spec.ts", "--project=chromium", "--workers=1", "--reporter=line", ...extraArgs]
const command = process.platform === "win32" ? "cmd.exe" : playwrightBin
const args = process.platform === "win32" ? ["/c", playwrightBin, ...baseArgs] : baseArgs
const result = spawnSync(command, args, { stdio: "inherit", env, cwd: repoRoot })

if (result.error) {
  process.stderr.write(`Error ejecutando Playwright: ${String(result.error)}\n`)
}
process.exit(result.status ?? 1)
