import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// 프로젝트 루트의 .env를 파싱한다(의존성 없이). 이미 process.env에 있으면 그 값을 우선한다.
export const readEnv = (filename = '.env') => {
  const here = dirname(fileURLToPath(import.meta.url))
  const envPath = resolve(here, '..', filename)
  const result = {}
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      result[key] = value
    }
  } catch {
    // .env 없으면 process.env만 사용
  }
  return { ...result, ...process.env }
}
