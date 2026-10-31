import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react'

export default function ResumeUpload({ profile, onUploaded, onError, loading, setLoading }) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)
  const ALLOWED = ['.pdf', '.docx', '.txt']

  const handleFile = async (file) => {
    if (!file) return
    if (!ALLOWED.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      onError('Please upload a PDF, DOCX, or TXT resume.')
      return
    }
    setLoading(true)
    try {
      await onUploaded(file)
    } catch (err) {
      onError(err?.response?.data?.detail || 'Failed to analyze resume.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Resume &amp; Profile</h2>
        <p className="text-sm text-muted mt-1">
          Upload a PDF resume — the Resume Agent extracts skills, education, projects, and
          experience, then indexes it into the knowledge base for retrieval.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={`panel px-6 py-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
          ${dragActive ? 'border-cobalt bg-cobalt-light/40' : 'hover:border-ink'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {loading ? (
          <Loader2 className="animate-spin text-cobalt" size={28} />
        ) : (
          <UploadCloud className="text-muted" size={28} />
        )}
        <p className="text-sm font-medium mt-3">
          {loading
            ? 'Resume Agent is extracting your profile…'
            : 'Drop your resume here, or click to browse'}
        </p>
        <p className="text-xs text-muted mt-1">PDF, DOCX, or TXT only, up to ~10 pages</p>
      </div>

      {profile && (
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-signal-green" />
            <span className="text-sm font-medium">Profile extracted</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="eyebrow mb-2">Name / Contact</p>
              <p className="text-sm">{profile.name || '—'}</p>
              <p className="text-sm text-muted">{profile.email || '—'}</p>
            </div>
            <div>
              <p className="eyebrow mb-2">Education</p>
              {profile.education?.length ? (
                profile.education.map((e, i) => (
                  <p key={i} className="text-sm">
                    {e.degree} · {e.institution} {e.year && `(${e.year})`}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted">—</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-2">Skills ({profile.skills?.length || 0})</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills?.map((s, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-2 py-1 rounded bg-paper border border-hairline"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {profile.projects?.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Projects</p>
              <ul className="space-y-1.5">
                {profile.projects.map((p, i) => (
                  <li key={i} className="text-sm text-ink leading-snug">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.experience?.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Experience</p>
              <ul className="space-y-1.5">
                {profile.experience.map((p, i) => (
                  <li key={i} className="text-sm text-ink leading-snug">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
