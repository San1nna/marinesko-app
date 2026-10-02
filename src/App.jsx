import { useState, useEffect, useMemo } from 'react'
import { Calendar, BookOpen, Clock } from 'lucide-react'
import {
  getSchedule,
  getBooks,
  getCallTimes,
  getInitialScheduleSync,
  getInitialBooksSync,
  getInitialCallTimesSync,
  switchGroup
} from './services/storage'
import ScheduleView from './components/ScheduleView'
import BooksView from './components/BooksView'
import InfoView from './components/InfoView'
import GroupSelectModal from './components/GroupSelectModal'

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule')
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [schedule, setSchedule] = useState(() => getInitialScheduleSync())
  const [books, setBooks] = useState(() => getInitialBooksSync())
  const [callTimes, setCallTimes] = useState(() => getInitialCallTimesSync())
  const [theme, setTheme] = useState(() => localStorage.getItem('college_theme') || 'slate')
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  })

  const handleSelectGroup = async (groupName) => {
    const updated = await switchGroup(groupName)
    if (updated) {
      setSchedule(updated)
    }
  }

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (['schedule', 'books', 'info'].includes(hash)) {
        setActiveTab(hash)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  useEffect(() => {
    const updateTime = () => setCurrentDate(new Date())
    const interval = setInterval(updateTime, 10000)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') updateTime()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', updateTime)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', updateTime)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('college_theme', theme)
  }, [theme])

  useEffect(() => {
    async function loadData() {
      const [schedData, booksData, callsData] = await Promise.all([
        getSchedule(),
        getBooks(),
        getCallTimes()
      ])
      if (schedData) setSchedule(schedData)
      if (booksData) setBooks(booksData)
      if (callsData) setCallTimes(callsData)
    }
    loadData()
  }, [])

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(currentDate)
  }, [currentDate])

  return (
    <div className="min-h-screen theme-bg-main theme-text-main flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen flex flex-col px-4 pb-28 safe-area-top">
        <header className="flex items-center justify-between pb-3 mb-4 border-b theme-border">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-base font-semibold tracking-tight theme-text-main">
              Marinesko App
            </h1>
            <span className="text-xs theme-text-muted capitalize">
              {todayStr}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="text-[11px] font-semibold theme-text-accent px-2.5 py-0.5 rounded-md theme-bg-subtle border theme-border hover:border-zinc-700 active:scale-95 transition-all"
            >
              {schedule?.group || 'Выбрать'}
            </button>
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                isOnline ? 'bg-emerald-500/90' : 'bg-amber-500/90'
              }`}
              title={isOnline ? 'В сети' : 'Офлайн режим'}
            />
          </div>
        </header>

        <main className="flex-1">
          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'schedule' && (
              <ScheduleView schedule={schedule} onUpdate={setSchedule} currentDate={currentDate} />
            )}

            {activeTab === 'books' && (
              <BooksView books={books} onUpdate={setBooks} />
            )}

            {activeTab === 'info' && (
              <InfoView
                schedule={schedule}
                onUpdate={setSchedule}
                callTimes={callTimes}
                onUpdateCalls={setCallTimes}
                currentTheme={theme}
                onSelectTheme={setTheme}
                currentDate={currentDate}
                isOnline={isOnline}
                isStandalone={isStandalone}
                installPrompt={installPrompt}
                onInstall={handleInstallClick}
              />
            )}
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 bg-[var(--bg-main)]/95 backdrop-blur-md border-t theme-border z-40 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg active:scale-90 transition-all duration-150 ${
              activeTab === 'schedule'
                ? 'theme-text-accent font-semibold scale-105'
                : 'theme-text-muted opacity-60 hover:opacity-100'
            }`}
            aria-label="Вкладка Пары"
          >
            <Calendar className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] tracking-tight font-medium">Пары</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg active:scale-90 transition-all duration-150 ${
              activeTab === 'books'
                ? 'theme-text-accent font-semibold scale-105'
                : 'theme-text-muted opacity-60 hover:opacity-100'
            }`}
            aria-label="Вкладка Книги"
          >
            <BookOpen className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] tracking-tight font-medium">Книги</span>
            {books.length > 0 && (
              <span className="absolute top-0.5 right-1.5 w-1.5 h-1.5 theme-btn-accent rounded-full animate-pulse-glow" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg active:scale-90 transition-all duration-150 ${
              activeTab === 'info'
                ? 'theme-text-accent font-semibold scale-105'
                : 'theme-text-muted opacity-60 hover:opacity-100'
            }`}
            aria-label="Вкладка Звонки"
          >
            <Clock className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] tracking-tight font-medium">Звонки</span>
          </button>
        </div>
      </nav>

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
