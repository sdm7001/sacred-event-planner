import { NextRequest, NextResponse } from 'next/server'
import { createLogger } from '@/lib/logger'

const log = createLogger('client-error')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    log.error('Client-side error', { ...body })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
