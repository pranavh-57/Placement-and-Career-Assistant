import { useEffect, useRef } from 'react'
import { Activity } from 'lucide-react'

const AGENT_COLORS = {
  Orchestrator: 'bg-ink',
  'Resume Agent': 'bg-cobalt-DEFAULT',
  'Job Matching Agent': 'bg-signal-green',
  'Skill Gap Agent': 'bg-signal-amber',
  'Learning Recommendation Agent': 'bg-cobalt-DEFAULT',
  'Interview Agent': 'bg-signal-red',
  RAG: 'bg-muted',
  'Job Search (MCP)': 'bg-signal-green',
  'GitHub Analysis (MCP)': 'bg-signal-green',
}

function dotColor(agent) {
  return AGENT_COLORS[agent] || 'bg-muted'
}

export default function AgentActivityPanel({ steps, running }) {
  const logEndRef = useRef(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [steps])

  return (
    <aside className="w-80 shrink-0 border-l border-hairline bg-panel flex flex-col">
      <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-muted" />
          <span className="eyebrow">Agent Activity</span>
        </div>
        {running && (
          <span className="flex items-center gap-1.5">
            <span className="status-dot status-dot--active bg-cobalt-DEFAULT" />
            <span className="text-[11px] font-mono text-cobalt-dark">running</span>
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {steps.length === 0 && (
          <p className="text-sm text-muted leading-relaxed">
            Agent reasoning and tool calls will appear here as you use the assistant —
            each entry shows which agent acted, what it did, and why.
          </p>
        )}
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2.5">
            <div className="flex flex-col items-center pt-1">
              <span className={`status-dot ${dotColor(step.agent)}`} />
              {i < steps.length - 1 && <span className="w-px flex-1 bg-hairline mt-1" />}
            </div>
            <div className="pb-2">
              <p className="text-[11px] font-mono uppercase tracking-wide text-muted">
                {step.agent}
              </p>
              <p className="text-sm text-ink font-medium leading-snug mt-0.5">{step.action}</p>
              {step.detail && (
                <p className="text-xs text-muted leading-snug mt-0.5">{step.detail}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </aside>
  )
}
