import { useState, useMemo } from 'react'
import { Plus, Trash2, RotateCcw, Check, X, GraduationCap, MapPin, Clock, Calendar, Send, MessageCircle, Headphones, ExternalLink } from 'lucide-react'
import { saveCallTimes, resetCallTimes, switchGroup, resetScheduleToDefault } from '../services/storage'
import { getCollegeWeekInfo } from '../data/collegeScheduleData'
import GroupSelectModal from './GroupSelectModal'

const THEMES = [
  { id: 'slate', name: 'Zinc Dark', bg: '#09090b', dot: '#ffffff' },
  { id: 'oled', name: 'OLED Black', bg: '#000000', dot: '#ffffff' },
  { id: 'midnight', name: 'Midnight Blue', bg: '#060c14', dot: '#38bdf8' },
  { id: 'emerald', name: 'Emerald Green', bg: '#050f09', dot: '#34d399' },
  { id: 'amethyst', name: 'Amethyst Purple', bg: '#0c0614', dot: '#c084fc' },
  { id: 'ruby', name: 'Ruby Crimson', bg: '#120508', dot: '#fb7185' },
  { id: 'light', name: 'Minimal Light', bg: '#f8fafc', dot: '#0f172a', isLight: true }
]

export default function InfoView({ schedule, onUpdate, callTimes, onUpdateCalls, currentTheme, onSelectTheme, currentDate = new Date() }) {
  const weekInfo = useMemo(() => getCollegeWeekInfo(currentDate), [currentDate])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [activeShift, setActiveShift] = useState('1 смена')
  const [showAddCall, setShowAddCall] = useState(false)
  const [newPair, setNewPair] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')

  const handleSelectGroup = async (selected) => {
    const updated = await switchGroup(selected)
    if (updated) {
      onUpdate(updated)
    }
  }

  const handleResetSchedule = async () => {
    if (window.confirm(`Сбросить расписание группы ${schedule?.group || ''} к официальному?`)) {
      const reset = await resetScheduleToDefault(schedule?.group)
      onUpdate(reset)
    }
  }

  const handleDeleteCall = async (id) => {
    const safeCalls = Array.isArray(callTimes) ? callTimes : []
    const updated = safeCalls.filter(c => c.id !== id)
    await saveCallTimes(updated)
    onUpdateCalls(updated)
  }

  const handleAddCall = async (e) => {
    e.preventDefault()
    if (!newPair.trim() || !newStart.trim() || !newEnd.trim()) return

    const newItem = {
      id: Date.now().toString(),
      shift: activeShift,
      pair: newPair.trim(),
      start: newStart.trim(),
      end: newEnd.trim(),
      breakTime: 'перемена'
    }

    const updated = [...callTimes, newItem]
    await saveCallTimes(updated)
    onUpdateCalls(updated)
    setShowAddCall(false)
    setNewPair('')
    setNewStart('')
    setNewEnd('')
  }

  const handleResetCalls = async () => {
    if (window.confirm('Сбросить звонки к официальному расписанию?')) {
      const def = await resetCallTimes()
      onUpdateCalls(def)
    }
  }

  const safeCalls = Array.isArray(callTimes) ? callTimes : []
  const currentShiftCalls = safeCalls.filter(c => {
    if (activeShift === '1 смена') return !c.shift || c.shift === '1 смена' || c.shift === '1 зміна'
    return c.shift === '2 смена' || c.shift === '2 зміна'
  })

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      <div className="theme-bg-card rounded-xl p-4 border theme-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 theme-text-accent" />
            <div>
              <span className="text-[10px] theme-text-muted font-medium uppercase tracking-wider block">
                Учебная группа
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-bold theme-text-main">
                  {schedule?.group || 'Выбрать'}
                </span>
                {schedule?.course && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border theme-border theme-text-muted">
                    {schedule.course} курс • {schedule?.base}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowGroupModal(true)}
            className="px-3 py-1.5 rounded-lg theme-btn-accent text-xs font-semibold active:scale-95 transition-all"
          >
            Выбрать из списка
          </button>
        </div>

        {schedule?.address && (
          <div className="pt-2 border-t theme-border flex flex-col gap-1 text-[11px] theme-text-muted">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 theme-text-accent shrink-0" />
              <span>{schedule.address}</span>
            </div>
            {schedule?.shiftName && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 theme-text-accent shrink-0" />
                <span>{schedule.shiftName} (звонки по графику Маринеско)</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={handleResetSchedule}
            className="text-[11px] theme-text-muted hover:theme-text-main flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить к официальному</span>
          </button>
        </div>
      </div>

      <div className="theme-bg-card rounded-xl p-4 border theme-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 theme-text-accent" />
            <h3 className="text-sm font-semibold theme-text-main">
              Учебный график (Маринеско)
            </h3>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {weekInfo.weekLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-lg theme-bg-subtle border theme-border">
            <span className="text-[10px] theme-text-muted block mb-0.5">Текущая неделя</span>
            <span className="font-semibold theme-text-main text-sm">
              {weekInfo.weekNum}-я неделя
            </span>
          </div>
          <div className="p-2.5 rounded-lg theme-bg-subtle border theme-border">
            <span className="text-[10px] theme-text-muted block mb-0.5">Тип недели</span>
            <span className="font-semibold theme-text-accent text-sm">
              {weekInfo.weekLabel}
            </span>
          </div>
        </div>

        <div className="text-[11px] theme-text-muted space-y-0.5 pt-1">
          <div>Семестр: 31 августа — 26 декабря 2026 г.</div>
          <div>Сессия: 21 — 26 декабря 2026 г. (17-я неделя)</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold theme-text-main">Звонки</h3>
            <span className="text-xs theme-text-muted font-mono opacity-75">09:00 минута молчания</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCalls}
              className="text-[11px] theme-text-muted hover:opacity-100 flex items-center gap-1 transition-colors"
              title="Сброс"
              aria-label="Сбросить звонки"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сброс</span>
            </button>
            <button
              onClick={() => setShowAddCall(true)}
              className="p-1 rounded-md theme-bg-subtle theme-text-main hover:opacity-80 transition-colors"
              title="Добавить звонок"
              aria-label="Добавить звонок"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex theme-bg-subtle p-0.5 rounded-lg border theme-border text-xs">
          <button
            onClick={() => setActiveShift('1 смена')}
            className={`flex-1 py-1 rounded-md font-medium active:scale-95 transition-all duration-150 ${
              activeShift === '1 смена'
                ? 'theme-btn-accent shadow-sm'
                : 'theme-text-muted hover:opacity-100'
            }`}
          >
            1 смена
          </button>
          <button
            onClick={() => setActiveShift('2 смена')}
            className={`flex-1 py-1 rounded-md font-medium active:scale-95 transition-all duration-150 ${
              activeShift === '2 смена'
                ? 'theme-btn-accent shadow-sm'
                : 'theme-text-muted hover:opacity-100'
            }`}
          >
            2 смена
          </button>
        </div>

        <div className="theme-bg-card rounded-xl border theme-border divide-y divide-[var(--border-color)]">
          {currentShiftCalls.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center justify-between p-3 text-xs theme-bg-card-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-[11px] font-mono theme-text-muted opacity-60">
                  #{idx + 1}
                </span>
                <span className="font-medium theme-text-main">
                  {item.pair}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono theme-text-main font-medium">
                  {item.start} — {item.end}
                </span>
                <button
                  onClick={() => handleDeleteCall(item.id)}
                  className="p-1 theme-text-muted hover:text-rose-400 transition-colors"
                  title="Удалить звонок"
                  aria-label="Удалить звонок"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-semibold theme-text-main px-1">Тема оформления</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {THEMES.map(theme => {
            const isSelected = currentTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs text-left active:scale-95 transition-all duration-150 ${
                  isSelected
                    ? 'border-2 border-[var(--accent)] theme-bg-card theme-text-main font-semibold shadow-sm'
                    : 'border theme-border theme-bg-subtle theme-text-muted hover:opacity-100'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: theme.bg }}
                />
                <span className="truncate">{theme.name}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 ml-auto theme-text-accent stroke-[2.5]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="theme-bg-card rounded-xl p-4 border theme-border space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 theme-text-accent" />
          <h3 className="text-xs font-semibold theme-text-main">
            Канал и поддержка
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          <a
            href="https://t.me/MarineskoApp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl theme-bg-subtle border theme-border hover:border-zinc-700 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4 theme-text-accent" />
              <div>
                <span className="text-xs font-semibold theme-text-main block">
                  Телеграм-канал
                </span>
                <span className="text-[11px] theme-text-muted">
                  @MarineskoApp
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 theme-text-muted" />
          </a>

          <a
            href="https://t.me/San1nnaaa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl theme-bg-subtle border theme-border hover:border-zinc-700 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 theme-text-accent" />
              <div>
                <span className="text-xs font-semibold theme-text-main block">
                  Техподдержка
                </span>
                <span className="text-[11px] theme-text-muted">
                  @San1nnaaa
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 theme-text-muted" />
          </a>
        </div>
      </div>

      {showAddCall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="theme-bg-card border theme-border rounded-2xl w-full max-w-xs p-5 shadow-2xl space-y-3 text-xs animate-modal-up">
            <div className="flex items-center justify-between pb-2 border-b theme-border">
              <h4 className="font-semibold theme-text-main">Добавить звонок ({activeShift})</h4>
              <button onClick={() => setShowAddCall(false)} className="theme-text-muted hover:theme-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCall} className="space-y-3">
              <div>
                <label className="block theme-text-muted mb-1">Номер пары</label>
                <input
                  type="text"
                  placeholder="5 пара"
                  value={newPair}
                  onChange={e => setNewPair(e.target.value)}
                  className="w-full theme-bg-input border theme-border rounded-xl px-3 py-1.5 theme-text-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block theme-text-muted mb-1">Начало</label>
                  <input
                    type="text"
                    placeholder="18:10"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-1.5 theme-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block theme-text-muted mb-1">Конец</label>
                  <input
                    type="text"
                    placeholder="19:30"
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-1.5 theme-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCall(false)}
                  className="flex-1 py-2 rounded-xl theme-bg-subtle theme-text-muted hover:opacity-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl theme-btn-accent font-semibold"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGroupModal && (
        <GroupSelectModal
          currentGroup={schedule?.group}
          onSelect={handleSelectGroup}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </div>
  )
}
