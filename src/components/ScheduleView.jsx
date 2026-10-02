import { useState, useEffect, useRef, useMemo } from 'react'
import { Plus, Trash2, Edit2, X, Calendar, ChevronLeft, ChevronRight, FileText, GraduationCap } from 'lucide-react'
import { saveSchedule, clearAllSchedule, switchGroup } from '../services/storage'
import { getCollegeWeekInfo } from '../data/collegeScheduleData'
import GroupSelectModal from './GroupSelectModal'

const DAYS_MAP = [
  { id: 'mon', label: 'Пн', full: 'Понедельник' },
  { id: 'tue', label: 'Вт', full: 'Вторник' },
  { id: 'wed', label: 'Ср', full: 'Среда' },
  { id: 'thu', label: 'Чт', full: 'Четверг' },
  { id: 'fri', label: 'Пт', full: 'Пятница' },
  { id: 'sat', label: 'Суббота', full: 'Суббота' }
]

const QUICK_TIMES_SHIFT_1 = [
  { pair: '1 пара', time: '09:00 - 10:20' },
  { pair: '2 пара', time: '10:30 - 11:50' },
  { pair: '3 пара', time: '12:10 - 13:30' },
  { pair: '4 пара', time: '13:40 - 15:00' }
]

const QUICK_TIMES_SHIFT_2 = [
  { pair: '1 пара', time: '13:40 - 15:00' },
  { pair: '2 пара', time: '15:10 - 16:30' },
  { pair: '3 пара', time: '16:40 - 18:00' }
]

const getTodayDayId = (date = new Date()) => {
  const d = date.getDay()
  const map = ['mon', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return map[d] || 'mon'
}

export default function ScheduleView({ schedule, onUpdate, currentDate = new Date() }) {
  const currentWeekInfo = useMemo(() => getCollegeWeekInfo(currentDate), [currentDate])
  const todayDayId = useMemo(() => getTodayDayId(currentDate), [currentDate])
  const [activeDay, setActiveDay] = useState(() => todayDayId)

  const prevTodayRef = useRef(todayDayId)
  useEffect(() => {
    if (prevTodayRef.current !== todayDayId) {
      prevTodayRef.current = todayDayId
      setActiveDay(todayDayId)
    }
  }, [todayDayId])

  const [weekFilter, setWeekFilter] = useState('auto')
  const [showModal, setShowModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [noteModalLesson, setNoteModalLesson] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [slideDir, setSlideDir] = useState('right')

  const touchStartX = useRef(0)

  const handleSelectGroup = async (groupName) => {
    const updated = await switchGroup(groupName)
    if (updated) {
      onUpdate(updated)
    }
  }

  const effectiveWeekFilter = weekFilter === 'auto' ? currentWeekInfo.weekType : weekFilter

  const [lessonForm, setLessonForm] = useState({
    day: todayDayId,
    name: '',
    time: '09:00 - 10:20',
    room: '',
    teacher: '',
    type: 'Лекция',
    week: 'all',
    note: ''
  })

  const currentDayIndex = DAYS_MAP.findIndex(d => d.id === activeDay)
  const safeDays = Array.isArray(schedule?.days) ? schedule.days : []
  const currentDayData = safeDays.find(d => d.id === activeDay) || { lessons: [] }

  const filteredLessons = currentDayData.lessons.filter(lesson => {
    if (effectiveWeekFilter === 'all') return true
    return lesson.week === 'all' || lesson.week === effectiveWeekFilter
  })

  const handlePrevDay = () => {
    setSlideDir('left')
    const prevIndex = currentDayIndex > 0 ? currentDayIndex - 1 : DAYS_MAP.length - 1
    setActiveDay(DAYS_MAP[prevIndex].id)
  }

  const handleNextDay = () => {
    setSlideDir('right')
    const nextIndex = currentDayIndex < DAYS_MAP.length - 1 ? currentDayIndex + 1 : 0
    setActiveDay(DAYS_MAP[nextIndex].id)
  }

  const handleSelectDay = (id) => {
    const targetIdx = DAYS_MAP.findIndex(d => d.id === id)
    setSlideDir(targetIdx >= currentDayIndex ? 'right' : 'left')
    setActiveDay(id)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextDay()
      } else {
        handlePrevDay()
      }
    }
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setLessonForm({
      day: activeDay,
      name: '',
      time: '09:00 - 10:20',
      room: '',
      teacher: '',
      type: 'Лекция',
      week: 'all',
      note: ''
    })
    setShowModal(true)
  }

  const handleOpenEdit = (lesson) => {
    setEditingId(lesson.id)
    setLessonForm({
      day: activeDay,
      name: lesson.name || '',
      time: lesson.time || '09:00 - 10:20',
      room: lesson.room === '—' ? '' : (lesson.room || ''),
      teacher: lesson.teacher === '—' ? '' : (lesson.teacher || ''),
      type: lesson.type || 'Лекция',
      week: lesson.week || 'all',
      note: lesson.note || ''
    })
    setShowModal(true)
  }

  const handleSaveLesson = async (e) => {
    e.preventDefault()
    if (!lessonForm.name.trim()) return

    const lessonData = {
      id: editingId || Date.now().toString(),
      name: lessonForm.name.trim(),
      time: lessonForm.time.trim(),
      room: lessonForm.room.trim() || '—',
      teacher: lessonForm.teacher.trim() || '—',
      type: lessonForm.type,
      week: lessonForm.week,
      note: lessonForm.note ? lessonForm.note.trim() : ''
    }

    let updatedDays
    if (editingId) {
      updatedDays = safeDays.map(day => {
        const withoutTarget = (day.lessons || []).filter(l => l.id !== editingId)
        if (day.id === lessonForm.day) {
          return {
            ...day,
            lessons: [...withoutTarget, lessonData]
          }
        }
        return {
          ...day,
          lessons: withoutTarget
        }
      })
    } else {
      updatedDays = safeDays.map(day => {
        if (day.id === lessonForm.day) {
          return {
            ...day,
            lessons: [...(day.lessons || []), lessonData]
          }
        }
        return day
      })
    }

    const updatedSchedule = { ...schedule, days: updatedDays }
    await saveSchedule(updatedSchedule)
    onUpdate(updatedSchedule)
    setShowModal(false)
  }

  const handleDeleteLesson = async (dayId, lessonId) => {
    const updatedDays = safeDays.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          lessons: (day.lessons || []).filter(l => l.id !== lessonId)
        }
      }
      return day
    })
    const updatedSchedule = { ...schedule, days: updatedDays }
    await saveSchedule(updatedSchedule)
    onUpdate(updatedSchedule)
  }

  const handleClearCurrentDay = async () => {
    if (!window.confirm(`Очистить расписание за ${DAYS_MAP[currentDayIndex].full}?`)) return
    const updatedDays = safeDays.map(day => {
      if (day.id === activeDay) {
        return { ...day, lessons: [] }
      }
      return day
    })
    const updatedSchedule = { ...schedule, days: updatedDays }
    await saveSchedule(updatedSchedule)
    onUpdate(updatedSchedule)
  }

  const handleClearAll = async () => {
    if (!window.confirm('Очистить все пары на неделю?')) return
    const empty = await clearAllSchedule()
    onUpdate(empty)
  }

  const handleOpenNoteModal = (lesson) => {
    setNoteModalLesson(lesson)
    setNoteText(lesson.note || '')
  }

  const handleSaveNote = async (e) => {
    e.preventDefault()
    if (!noteModalLesson) return
    const targetId = noteModalLesson.id
    const updatedDays = safeDays.map(day => ({
      ...day,
      lessons: (day.lessons || []).map(l => (l.id === targetId ? { ...l, note: noteText.trim() } : l))
    }))
    const updatedSchedule = { ...schedule, days: updatedDays }
    await saveSchedule(updatedSchedule)
    onUpdate(updatedSchedule)
    setNoteModalLesson(null)
  }

  const handleClearNote = async () => {
    if (!noteModalLesson) return
    const targetId = noteModalLesson.id
    const updatedDays = safeDays.map(day => ({
      ...day,
      lessons: (day.lessons || []).map(l => (l.id === targetId ? { ...l, note: '' } : l))
    }))
    const updatedSchedule = { ...schedule, days: updatedDays }
    await saveSchedule(updatedSchedule)
    onUpdate(updatedSchedule)
    setNoteModalLesson(null)
  }

  return (
    <div
      className="space-y-4 pb-20 select-none animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setShowGroupModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl theme-bg-card border theme-border hover:border-zinc-700 active:scale-95 transition-all text-left"
        >
          <GraduationCap className="w-4 h-4 theme-text-accent shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold theme-text-main">
              {schedule?.group || 'Выбрать'}
            </span>
            {schedule?.group && schedule?.course && (
              <span className="text-[10px] theme-text-muted px-1.5 py-0.2 rounded theme-bg-subtle border theme-border">
                {schedule.course} курс
              </span>
            )}
            {schedule?.group && schedule?.shiftName && (
              <span className="text-[10px] theme-text-accent px-1.5 py-0.2 rounded theme-bg-subtle border theme-border">
                {schedule.shiftName}
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="flex theme-bg-subtle p-0.5 rounded-lg border theme-border text-xs">
            <button
              onClick={() => setWeekFilter('auto')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                weekFilter === 'auto'
                  ? 'theme-btn-accent shadow-sm'
                  : 'theme-text-muted hover:opacity-100'
              }`}
              title={`Автоматически: ${currentWeekInfo.weekLabel}`}
            >
              Авто
            </button>
            <button
              onClick={() => setWeekFilter('odd')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                weekFilter === 'odd'
                  ? 'theme-btn-accent shadow-sm'
                  : 'theme-text-muted hover:opacity-100'
              }`}
              title="Числитель (нечетная)"
            >
              Числ
            </button>
            <button
              onClick={() => setWeekFilter('even')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                weekFilter === 'even'
                  ? 'theme-btn-accent shadow-sm'
                  : 'theme-text-muted hover:opacity-100'
              }`}
              title="Знаменатель (четная)"
            >
              Знам
            </button>
            <button
              onClick={() => setWeekFilter('all')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                weekFilter === 'all'
                  ? 'theme-btn-accent shadow-sm'
                  : 'theme-text-muted hover:opacity-100'
              }`}
            >
              Все
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            aria-label="Добавить пару"
            className="flex items-center justify-center p-2 rounded-lg theme-btn-accent active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] theme-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium theme-text-main">
            {currentWeekInfo.weekNum}-я неделя
          </span>
          <span className="opacity-40">•</span>
          <span className="theme-text-accent font-semibold">
            {currentWeekInfo.weekLabel}
          </span>
        </div>
        {weekFilter === 'auto' ? (
          <span className="text-[10px] theme-text-muted px-1.5 py-0.2 rounded theme-bg-subtle border theme-border font-medium">
            Автоопределение
          </span>
        ) : (
          <button
            onClick={() => setWeekFilter('auto')}
            className="text-[10px] theme-text-accent hover:underline font-medium"
          >
            Вернуть авто
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 gap-1 theme-bg-subtle p-1 rounded-xl border theme-border">
        {DAYS_MAP.map((d) => {
          const dayLessons = safeDays.find(item => item.id === d.id)?.lessons || []
          const isActive = activeDay === d.id
          const isToday = d.id === todayDayId
          return (
            <button
              key={d.id}
              onClick={() => handleSelectDay(d.id)}
              className={`relative flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? 'theme-btn-accent font-semibold'
                  : 'theme-text-muted hover:opacity-100'
              }`}
            >
              {isToday && (
                <span
                  className="absolute top-1 right-1 w-1 h-1 rounded-full opacity-80"
                  style={{ backgroundColor: isActive ? 'currentColor' : 'var(--accent)' }}
                />
              )}
              <span className="text-xs">{d.label}</span>
              <span className="text-[10px] mt-0.5 opacity-60 font-mono">
                {dayLessons.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs py-1 px-1">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-md theme-text-muted hover:opacity-100 transition-colors"
          title="Предыдущий день"
          aria-label="Предыдущий день"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold theme-text-main text-sm">
            {DAYS_MAP[currentDayIndex].full}
          </span>
          <span className="theme-text-muted font-mono text-xs opacity-75">
            {filteredLessons.length} {filteredLessons.length === 1 ? 'пара' : filteredLessons.length > 1 && filteredLessons.length < 5 ? 'пары' : 'пар'}
          </span>
          {activeDay !== todayDayId && (
            <button
              onClick={() => handleSelectDay(todayDayId)}
              className="text-[10px] font-medium px-2 py-0.5 rounded theme-text-accent theme-bg-subtle border theme-border transition-colors"
            >
              Сегодня
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {currentDayData.lessons.length > 0 && (
            <button
              onClick={handleClearCurrentDay}
              className="p-1.5 rounded-md theme-text-muted hover:text-rose-400 transition-colors"
              title="Очистить день"
              aria-label="Очистить день"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-md theme-text-muted hover:opacity-100 transition-colors"
            title="Следующий день"
            aria-label="Следующий день"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        key={activeDay}
        className={`space-y-2.5 ${slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
      >
        {!schedule?.group ? (
          <div className="rounded-2xl border theme-border p-8 text-center theme-bg-card space-y-3">
            <div className="w-12 h-12 rounded-xl theme-bg-subtle border theme-border flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6 theme-text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold theme-text-main">
                Группа не выбрана
              </h3>
              <p className="text-xs theme-text-muted mt-1 max-w-xs mx-auto">
                Нажмите «Выбрать», чтобы загрузить расписание для своей группы
              </p>
            </div>
            <button
              onClick={() => setShowGroupModal(true)}
              className="px-4 py-2 rounded-xl theme-btn-accent text-xs font-semibold active:scale-95 transition-all inline-flex items-center gap-2"
            >
              Выбрать группу
            </button>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="rounded-xl border theme-border p-8 text-center theme-bg-card/40">
            <Calendar className="w-6 h-6 theme-text-muted mx-auto mb-2 opacity-50 stroke-[1.5]" />
            <p className="text-xs theme-text-muted">В этот день пар нет</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-xs theme-text-accent underline underline-offset-4 font-medium"
            >
              Добавить пару
            </button>
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="theme-bg-card theme-bg-card-hover rounded-xl p-3.5 border theme-border transition-all duration-150 hover:scale-[1.008] active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono theme-text-main font-medium">
                      {lesson.time}
                    </span>
                    <span className="text-[10px] theme-text-accent font-medium lowercase">
                      {lesson.type}
                    </span>
                    {lesson.week !== 'all' && (
                      <span className="text-[10px] theme-text-accent px-1.5 py-0.2 rounded theme-bg-subtle border theme-border font-medium">
                        {lesson.week === 'odd' ? 'Числитель' : 'Знаменатель'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-medium theme-text-main leading-snug">
                    {lesson.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs theme-text-muted">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded theme-bg-subtle border theme-border">
                      {lesson.room ? `каб. ${lesson.room}` : 'каб. —'}
                    </span>
                    {lesson.teacher && lesson.teacher !== '—' && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="truncate max-w-[220px] font-medium theme-text-main/90">
                          {lesson.teacher}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleOpenNoteModal(lesson)}
                    className={`p-1.5 rounded-md transition-colors ${
                      lesson.note
                        ? 'theme-text-accent theme-bg-subtle'
                        : 'theme-text-muted hover:theme-text-main'
                    }`}
                    title={lesson.note ? 'Заметка к паре' : 'Добавить заметку'}
                    aria-label={lesson.note ? 'Заметка к паре' : 'Добавить заметку'}
                  >
                    <FileText className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(lesson)}
                    className="p-1.5 theme-text-muted hover:theme-text-main rounded-md transition-colors"
                    title="Изменить"
                    aria-label="Изменить пару"
                  >
                    <Edit2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(activeDay, lesson.id)}
                    className="p-1.5 theme-text-muted hover:text-rose-400 rounded-md transition-colors"
                    title="Удалить"
                    aria-label="Удалить пару"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                </div>
              </div>

              {lesson.note && (
                <div
                  onClick={() => handleOpenNoteModal(lesson)}
                  className="mt-2.5 pt-2 border-t theme-border flex items-start gap-2 cursor-pointer group"
                >
                  <FileText className="w-3.5 h-3.5 theme-text-accent shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
                  <p className="text-xs theme-text-main/90 leading-relaxed break-words flex-1 font-sans">
                    {lesson.note}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {safeDays.some(d => (d.lessons || []).length > 0) && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleClearAll}
            className="text-[11px] theme-text-muted hover:text-rose-400 opacity-60 hover:opacity-100 transition-colors"
          >
            Очистить все расписание
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="theme-bg-card border theme-border rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto animate-modal-up">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <h3 className="text-sm font-semibold theme-text-main">
                {editingId ? 'Редактировать пару' : 'Новая пара'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md theme-text-muted hover:theme-text-main"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block theme-text-muted font-medium mb-1">День недели</label>
                <div className="grid grid-cols-6 gap-1">
                  {DAYS_MAP.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setLessonForm({ ...lessonForm, day: d.id })}
                      className={`py-1.5 rounded-lg font-medium transition-colors ${
                        lessonForm.day === d.id
                          ? 'theme-btn-accent font-semibold'
                          : 'theme-bg-subtle theme-text-muted hover:opacity-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block theme-text-muted font-medium mb-1">Название предмета</label>
                <input
                  type="text"
                  required
                  placeholder="Математика"
                  value={lessonForm.name}
                  onChange={e => setLessonForm({ ...lessonForm, name: e.target.value })}
                  className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="theme-text-muted font-medium">Время</label>
                  <span className="text-[10px] theme-text-muted font-mono">{lessonForm.time}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-4 gap-1">
                    {QUICK_TIMES_SHIFT_1.map(qt => (
                      <button
                        key={qt.pair}
                        type="button"
                        onClick={() => setLessonForm({ ...lessonForm, time: qt.time })}
                        className={`py-1 px-1 rounded-lg text-[10px] font-medium transition-colors ${
                          lessonForm.time === qt.time
                            ? 'theme-btn-accent font-semibold'
                            : 'theme-bg-subtle theme-text-muted hover:opacity-100'
                        }`}
                      >
                        {qt.pair}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {QUICK_TIMES_SHIFT_2.map(qt => (
                      <button
                        key={`s2-${qt.pair}`}
                        type="button"
                        onClick={() => setLessonForm({ ...lessonForm, time: qt.time })}
                        className={`py-1 px-1 rounded-lg text-[10px] font-medium transition-colors ${
                          lessonForm.time === qt.time
                            ? 'theme-btn-accent font-semibold'
                            : 'theme-bg-subtle theme-text-muted hover:opacity-100'
                        }`}
                      >
                        2см • {qt.pair}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="09:00 - 10:20"
                    value={lessonForm.time}
                    onChange={e => setLessonForm({ ...lessonForm, time: e.target.value })}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-1.5 theme-text-main focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block theme-text-muted font-medium mb-1">Кабинет</label>
                  <input
                    type="text"
                    placeholder="302"
                    value={lessonForm.room}
                    onChange={e => setLessonForm({ ...lessonForm, room: e.target.value })}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block theme-text-muted font-medium mb-1">Преподаватель</label>
                  <input
                    type="text"
                    placeholder="Иванов И.И."
                    value={lessonForm.teacher}
                    onChange={e => setLessonForm({ ...lessonForm, teacher: e.target.value })}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block theme-text-muted font-medium mb-1">Тип занятия</label>
                  <select
                    value={lessonForm.type}
                    onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                  >
                    <option value="Лекция">Лекция</option>
                    <option value="Практика">Практика</option>
                    <option value="Лабораторная">Лабораторная</option>
                    <option value="Семинар">Семинар</option>
                    <option value="Зачет / Экзамен">Экзамен</option>
                  </select>
                </div>
                <div>
                  <label className="block theme-text-muted font-medium mb-1">Неделя</label>
                  <select
                    value={lessonForm.week}
                    onChange={e => setLessonForm({ ...lessonForm, week: e.target.value })}
                    className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                  >
                    <option value="all">Каждая неделя</option>
                    <option value="odd">1-я неделя</option>
                    <option value="even">2-я неделя</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block theme-text-muted font-medium mb-1">Заметка / Домашнее задание</label>
                <textarea
                  rows={2}
                  placeholder="Домашнее задание, темы для подготовки..."
                  value={lessonForm.note}
                  onChange={e => setLessonForm({ ...lessonForm, note: e.target.value })}
                  className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl theme-bg-subtle theme-text-muted font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl theme-btn-accent font-semibold transition-colors"
                >
                  {editingId ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {noteModalLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="theme-bg-card border theme-border rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 animate-modal-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div>
                <h3 className="text-sm font-semibold theme-text-main">
                  Заметка к паре
                </h3>
                <p className="text-[11px] theme-text-muted mt-0.5">
                  {noteModalLesson.name} • {noteModalLesson.time}
                </p>
              </div>
              <button
                onClick={() => setNoteModalLesson(null)}
                className="p-1 rounded-md theme-text-muted hover:theme-text-main"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-3">
              <textarea
                autoFocus
                rows={4}
                placeholder="Напишите задание, конспект, вопросы к преподавателю..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-main focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                {noteModalLesson.note && (
                  <button
                    type="button"
                    onClick={handleClearNote}
                    className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
                  >
                    Удалить заметку
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setNoteModalLesson(null)}
                    className="px-4 py-2 rounded-xl theme-bg-subtle theme-text-muted hover:opacity-100 font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl theme-btn-accent font-semibold active:scale-95 transition-all"
                  >
                    Сохранить
                  </button>
                </div>
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
