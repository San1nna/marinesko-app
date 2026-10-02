import { useState, useMemo } from 'react'
import { Search, X, Check, GraduationCap, Clock } from 'lucide-react'
import { GROUP_LIST } from '../data/collegeScheduleData'

export default function GroupSelectModal({ currentGroup, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [baseFilter, setBaseFilter] = useState('all')

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    return GROUP_LIST.filter(g => {
      if (courseFilter !== 'all' && g.course !== Number(courseFilter)) return false
      if (baseFilter !== 'all' && g.base !== baseFilter) return false
      if (!q) return true
      return (
        g.group.toLowerCase().includes(q) ||
        `${g.course} курс`.toLowerCase().includes(q) ||
        g.base.toLowerCase().includes(q)
      )
    })
  }, [search, courseFilter, baseFilter])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="theme-bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl border theme-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-modal-up">
        <div className="p-4 border-b theme-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 theme-text-accent" />
            <div>
              <h2 className="text-sm font-semibold tracking-tight theme-text-main">
                Выбор группы
              </h2>
              <p className="text-[11px] theme-text-muted">
                53 официальные группы колледжа
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="p-1.5 rounded-lg theme-text-muted hover:theme-text-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b theme-border space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск группы (111, 111-А, 121, 211)..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg theme-bg-input border theme-border theme-text-main placeholder:theme-text-muted focus:outline-none focus:border-[var(--text-accent)] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[10px] theme-text-muted uppercase font-medium mr-1">
              Курс:
            </span>
            {[
              { id: 'all', label: 'Все' },
              { id: '1', label: '1 курс' },
              { id: '2', label: '2 курс' },
              { id: '3', label: '3 курс' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCourseFilter(f.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  courseFilter === f.id
                    ? 'theme-bg-subtle theme-text-accent font-semibold border theme-border'
                    : 'theme-text-muted hover:theme-text-main'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="w-[1px] h-3 bg-zinc-700/50 mx-1" />

            <span className="text-[10px] theme-text-muted uppercase font-medium mr-1">
              База:
            </span>
            {[
              { id: 'all', label: 'Все' },
              { id: '9 кл', label: '9 кл (-А)' },
              { id: '11 кл', label: '11 кл' }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setBaseFilter(b.id)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  baseFilter === b.id
                    ? 'theme-bg-subtle theme-text-accent font-semibold border theme-border'
                    : 'theme-text-muted hover:theme-text-main'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center text-xs theme-text-muted">
              Группы не найдены
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredGroups.map(g => {
                const isSelected = g.group === currentGroup
                return (
                  <button
                    key={g.group}
                    onClick={() => {
                      onSelect(g.group)
                      onClose()
                    }}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-[var(--text-accent)] bg-[var(--bg-subtle)] shadow-sm'
                        : 'theme-border hover:border-zinc-700 hover:bg-[var(--bg-subtle)]/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight theme-text-main">
                          {g.group}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded border theme-border theme-text-muted">
                          {g.course} курс • {g.base}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] theme-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {g.shiftName}
                        </span>
                        <span>•</span>
                        <span>{g.totalLessons} пар</span>
                      </div>

                      <div className="text-[10px] theme-text-muted truncate max-w-[200px]">
                        {g.address}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full theme-bg-main border theme-border flex items-center justify-center theme-text-accent shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
