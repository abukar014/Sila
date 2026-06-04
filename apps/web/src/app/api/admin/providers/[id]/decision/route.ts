import { NextRequest, NextResponse } from 'next/server'
import { applyProviderDecision, DecisionStatus } from '@/lib/providerDecision'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { decision, notes, requestCorrections = false, failedChecks = [] } = await request.json()

  const { error } = await applyProviderDecision(id, decision as DecisionStatus, {
    notes,
    requestCorrections,
    failedChecks,
  })

  if (error) {
    const status = error.includes('excluded') ? 400 : 500
    return NextResponse.json({ error }, { status })
  }

  return NextResponse.json({ success: true })
}
