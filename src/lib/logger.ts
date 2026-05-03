/**
 * Server-side logger for sacred-event-planner (Next.js).
 * Writes structured JSON to /home/aiciv/logs/sacred-event-planner/YYYY-MM-DD.log
 * and stdout simultaneously.
 *
 * Usage:
 *   import { createLogger } from '@/lib/logger'
 *   const log = createLogger('my-route')
 *   log.info('message', { key: 'value' })
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const LOG_DIR = '/home/aiciv/logs/sacred-event-planner'

// Ensure log dir exists at module load (server-side only)
if (typeof window === 'undefined') {
  try { mkdirSync(LOG_DIR, { recursive: true }) } catch { /* ignore */ }
}

function logFilePath() {
  return join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.log`)
}

type Level = 'debug' | 'info' | 'warn' | 'error'

function write(level: Level, service: string, msg: string, extra?: Record<string, unknown>) {
  if (typeof window !== 'undefined') return // client-side: no-op
  const entry = {
    time: new Date().toISOString(),
    level,
    service,
    msg,
    ...extra,
  }
  const line = JSON.stringify(entry) + '\n'
  try { appendFileSync(logFilePath(), line) } catch { /* ignore */ }
  if (level === 'error') {
    process.stderr.write(line)
  } else {
    process.stdout.write(line)
  }
}

export function createLogger(service: string) {
  return {
    debug: (msg: string, extra?: Record<string, unknown>) => write('debug', service, msg, extra),
    info:  (msg: string, extra?: Record<string, unknown>) => write('info',  service, msg, extra),
    warn:  (msg: string, extra?: Record<string, unknown>) => write('warn',  service, msg, extra),
    error: (msg: string, extra?: Record<string, unknown>) => write('error', service, msg, extra),
  }
}
