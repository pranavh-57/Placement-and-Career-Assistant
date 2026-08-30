import { useState } from 'react'
import { Loader2, Play, Send } from 'lucide-react'

export default function Overview({ profile, onRunWorkflow, workflowLoading, onChat }) {
  const [jobQuery, setJobQuery] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  const submitChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const message = chatInput
    setChatLog((log) => [...log, { role: 'user', text: message }])
    setChatInput('')
    setChatLoading(true)
    try {
      const reply = await onChat(message)
      setChatLog((log) => [...log, { role: 'assistant', text: reply }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Mission control</p>
        <h1 className="font-display text-2xl font-semibold mt-1">
          {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Placement & Career Assistant'}
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed">
          Run the full agent pipeline end-to-end — search a role, match it against your resume,
          find skill gaps, build a learning roadmap, and generate interview questions — or work
          through each step manually from the sidebar.
        </p>
      </div>

      <div className="panel p-6">
        <p className="eyebrow mb-3">Full pipeline</p>
        <div className="flex gap-3">
          <input
            value={jobQuery}
            onChange={(e) => setJobQuery(e.target.value)}
            placeholder="e.g. machine learning engineer intern"
            className="flex-1 text-sm px-3 py-2.5 rounded-md border border-hairline focus:border-cobalt-DEFAULT outline-none"
          />
          <button
            onClick={() => jobQuery.trim() && onRunWorkflow(jobQuery)}
            className="btn-primary"
            disabled={workflowLoading || !profile}
          >
            {workflowLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run full workflow
          </button>
        </div>
        {!profile && (
          <p className="text-xs text-signal-amber mt-2">Upload a resume first from Resume &amp; Profile.</p>
        )}
      </div>

      <div className="panel p-6">
        <p className="eyebrow mb-3">Ask the assistant</p>
        <p className="text-xs text-muted mb-4">
          Free-form questions route through the Orchestrator Agent, which picks the right
          agent or MCP tool for you — try "find me jobs in fintech" or "analyze github user torvalds".
        </p>
        <div className="space-y-3 max-h-72 overflow-y-auto mb-3">
          {chatLog.map((m, i) => (
            <div key={i} className={`text-sm leading-relaxed ${m.role === 'user' ? 'text-ink' : 'text-cobalt-dark'}`}>
              <span className="font-mono text-[11px] uppercase text-muted mr-2">
                {m.role === 'user' ? 'you' : 'assistant'}
              </span>
              {m.text}
            </div>
          ))}
          {chatLoading && <Loader2 size={14} className="animate-spin text-muted" />}
        </div>
        <form onSubmit={submitChat} className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 text-sm px-3 py-2.5 rounded-md border border-hairline focus:border-cobalt-DEFAULT outline-none"
          />
          <button type="submit" className="btn-secondary" disabled={chatLoading}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
