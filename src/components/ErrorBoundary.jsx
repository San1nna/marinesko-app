import { Component } from 'react'
import { RotateCcw, AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    try {
      console.error(error, errorInfo)
    } catch {}
  }

  handleReset = () => {
    try {
      localStorage.removeItem('college_schedule_backup')
      localStorage.removeItem('college_schedule')
    } catch {}
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-base font-semibold mb-2">Ошибка отображения</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Произошла ошибка при загрузке данных. Нажмите кнопку ниже для сброса и перезапуска.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-zinc-100 text-zinc-900 hover:bg-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Перезапустить приложение
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
