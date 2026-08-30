import { useState } from 'react'
import { Loader2, MessagesSquare, Send } from 'lucide-react'

const CATEGORY_STYLES = {
  technical: 'bg-cobalt-light text-cobalt-dark',
  behavioral: 'bg-signal-amber/10 text-signal-amber',
  system_design: 'bg-signal-green/10 text-signal-green',
}

function QuestionCard({ q, index, onEvaluate }) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const res = await onEvaluate(q.question, answer)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug">
          <span className="font-mono text-muted mr-2">{index + 1}.</span>
          {q.question}
        </p>
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded shrink-0 ${CATEGORY_STYLES[q.category] || 'bg-paper text-muted'}`}>
          {q.category}
        </span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer, then submit for feedback…"
        rows={3}
        className="w-full mt-3 text-sm px-3 py-2.5 rounded-md border border-hairline focus:border-cobalt-DEFAULT outline-none resize-none"
      />
      <div className="flex justify-end mt-2">
        <button onClick={submit} className="btn-secondary !px-3 !py-1.5 text-xs" disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Get feedback
        </button>
      </div>

      {result && (
        <div className="mt-3 pt-3 border-t border-hairline">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-medium text-cobalt-dark">{result.score}/10</span>
            <span className="eyebrow">Interview Agent feedback</span>
          </div>
          <p className="text-sm text-ink leading-relaxed">{result.feedback}</p>
          {result.improved_answer_tips?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.improved_answer_tips.map((t, i) => (
                <li key={i} className="text-sm text-muted leading-snug">· {t}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function InterviewPrep({ questions, loading, onGenerate, onEvaluate, defaultRole }) {
  const [role, setRole] = useState(defaultRole || '')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Interview Preparation</h2>
        <p className="text-sm text-muted mt-1">
          The Interview Agent generates role-specific questions grounded in retrieved prep
          material, then scores your answers with concrete feedback.
        </p>
      </div>

      <div className="panel p-4 flex gap-3">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Target role, e.g. Backend Engineer Intern"
          className="flex-1 text-sm px-3 py-2.5 rounded-md border border-hairline focus:border-cobalt-DEFAULT outline-none"
        />
        <button
          onClick={() => role.trim() && onGenerate(role)}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <MessagesSquare size={16} />}
          Generate questions
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} onEvaluate={onEvaluate} />
        ))}
        {questions.length === 0 && !loading && (
          <p className="text-sm text-muted">No questions yet — enter a role above to start.</p>
        )}
      </div>
    </div>
  )
}
