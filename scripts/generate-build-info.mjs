import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageJsonPath = path.resolve(__dirname, '../package.json')
const outputDir = path.resolve(__dirname, '../src/generated')
const outputPath = path.join(outputDir, 'buildInfo.ts')

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  const builtAt = new Date().toISOString()
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || ''
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_COMMIT_REF || ''
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || ''

  const content = `export const buildInfo = {
  version: ${JSON.stringify(packageJson.version || '0.0.0')},
  builtAt: ${JSON.stringify(builtAt)},
  commitSha: ${JSON.stringify(commitSha)},
  commitRef: ${JSON.stringify(commitRef)},
  deploymentId: ${JSON.stringify(deploymentId)},
} as const
`

  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, content, 'utf8')
  console.log(`[build-info] wrote ${outputPath}`)
}

main().catch((error) => {
  console.error('[build-info] generation failed')
  console.error(error)
  process.exitCode = 1
})
