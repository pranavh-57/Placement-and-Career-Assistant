import { FileText, Search, Target, BookOpen, MessagesSquare, LayoutGrid } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'resume', label: 'Resume & Profile', icon: FileText },
  { id: 'jobs', label: 'Job Search', icon: Search },
  { id: 'match', label: 'Match & Skill Gap', icon: Target },
  { id: 'learning', label: 'Learning Roadmap', icon: BookOpen },
  { id: 'interview', label: 'Interview Prep', icon: MessagesSquare },
]

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="w-60 shrink-0 border-r border-hairline bg-panel flex flex-col">
      <div className="px-5 py-6 border-b border-hairline">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
            <span className="text-white font-display font-semibold text-sm">W</span>
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight">Wayfind</span>
        </div>
        <p className="eyebrow mt-2">Placement &amp; Career Assistant</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive ? 'bg-cobalt-light text-cobalt-dark' : 'text-muted hover:bg-paper hover:text-ink'}`}
            >
              <Icon size={16} strokeWidth={2} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-hairline">
        <p className="eyebrow">Agents online</p>
        <p className="text-xs text-muted mt-1 font-mono">6 / 6 configured</p>
      </div>
    </aside>
  )
}
