import { useState } from 'react'
import { Loader2, Play, MapPin } from 'lucide-react'

export default function JobRoleForm({ onRunPipeline, loading, job }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    onRunPipeline(query, location)
  }

  return (
    <div className="panel p-6 space-y-4">
      <div>
        <p className="eyebrow mb-1">Step 2</p>
        <h2 className="font-display text-base font-semibold">Target role</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job role, e.g. backend engineer intern"
          className="w-full text-sm px-3 py-2.5 rounded-md border border-hairline focus:border-cobalt-DEFAULT outline-none"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="w-full text-sm px-3 py-2.5 rounded-md border border-hairline focus:border-cobalt-DEFAULT outline-none"
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? 'Running full workflow…' : 'Run full workflow'}
        </button>
      </form>

      {job && !loading && (
        <div className="pt-3 border-t border-hairline">
          <p className="text-sm font-medium">{job.title}</p>
          <p className="text-xs text-muted">{job.company}</p>
          {job.location && (
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {job.location}
            </p>
          )}
        </div>
      )}
    </div>
  )
}