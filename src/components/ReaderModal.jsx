import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Sliders
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function ReaderModal({ book, blob, onClose, onDownload }) {
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState(null)
  const [textContent, setTextContent] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem(`book_page_${book.id}`)
      return saved ? Math.max(1, parseInt(saved, 10)) : 1
    } catch {
      return 1
    }
  })
  const [totalPages, setTotalPages] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [fitMode, setFitMode] = useState('width')
  const [showControls, setShowControls] = useState(true)
  const [showJumpModal, setShowJumpModal] = useState(false)
  const [jumpInput, setJumpInput] = useState('')

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const touchDistanceRef = useRef(null)
  const startZoomRef = useRef(1.0)
  const lastTapTimeRef = useRef(0)

  useEffect(() => {
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origOverflow
    }
  }, [])

  useEffect(() => {
    try {
      if (book?.id && currentPage) {
        localStorage.setItem(`book_page_${book.id}`, currentPage.toString())
      }
    } catch {}
  }, [book?.id, currentPage])

  useEffect(() => {
    let active = true

    async function loadContent() {
      setLoading(true)
      setError(null)
      setTextContent(null)
      setImageUrl(null)
      setPdfDoc(null)

      if (book.isDemo) {
        setTextContent(
          `Учебное пособие: ${book.title}\nАвтор: ${book.author}\nДисциплина: ${book.subject}\n\n` +
          `Глава 1. Введение в предмет\n\n` +
          `Данное методическое пособие предназначено для студентов колледжа очной и заочной форм обучения.\n\n` +
          `Тема 1. Основные понятия и определения\n` +
          `Изучение данной дисциплины позволяет сформировать ключевые профессиональные компетенции.\n\n` +
          `Вы можете загрузить свои собственные PDF-учебники через кнопку добавления во вкладке учебников.`
        )
        setLoading(false)
        return
      }

      if (!blob) {
        setError('Файл не найден в памяти устройства')
        setLoading(false)
        return
      }

      const fileType = (book.fileType || blob.type || '').toLowerCase()
      const fileName = (book.fileName || book.title || '').toLowerCase()

      if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
        const url = URL.createObjectURL(blob)
        setImageUrl(url)
        setLoading(false)
        return
      }

      if (fileType.includes('text') || fileName.endsWith('.txt')) {
        try {
          const text = await blob.text()
          if (active) {
            setTextContent(text)
            setLoading(false)
          }
        } catch {
          if (active) {
            setError('Не удалось прочитать файл')
            setLoading(false)
          }
        }
        return
      }

      try {
        const buffer = await blob.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: buffer })
        const pdf = await loadingTask.promise
        if (!active) return

        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)

        const savedPage = localStorage.getItem(`book_page_${book.id}`)
        if (savedPage) {
          const parsed = parseInt(savedPage, 10)
          if (parsed >= 1 && parsed <= pdf.numPages) {
            setCurrentPage(parsed)
          } else {
            setCurrentPage(1)
          }
        } else {
          setCurrentPage(1)
        }

        setLoading(false)
      } catch {
        if (!active) return
        setError('Не удалось открыть документ')
        setLoading(false)
      }
    }

    loadContent()

    return () => {
      active = false
    }
  }, [book, blob])

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return
    setRendering(true)
    try {
      const page = await pdfDoc.getPage(currentPage)
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext('2d')

      const containerWidth = containerRef.current.clientWidth || window.innerWidth
      const containerHeight = containerRef.current.clientHeight || window.innerHeight

      const unscaledViewport = page.getViewport({ scale: 1.0 })

      let baseScale = 1.0
      if (fitMode === 'height') {
        const scaleH = (containerHeight - 16) / unscaledViewport.height
        const scaleW = containerWidth / unscaledViewport.width
        baseScale = Math.min(scaleH, scaleW)
      } else {
        baseScale = containerWidth / unscaledViewport.width
      }

      const finalScale = Math.max(0.4, baseScale * zoomLevel)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5)
      const viewport = page.getViewport({ scale: finalScale * pixelRatio })

      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${viewport.width / pixelRatio}px`
      canvas.style.height = `${viewport.height / pixelRatio}px`

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise
    } catch {} finally {
      setRendering(false)
    }
  }, [pdfDoc, currentPage, zoomLevel, fitMode])

  useEffect(() => {
    renderPage()
  }, [renderPage])

  useEffect(() => {
    const handleResize = () => {
      renderPage()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [renderPage])

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1)
      if (containerRef.current) containerRef.current.scrollTop = 0
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1)
      if (containerRef.current) containerRef.current.scrollTop = 0
    }
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchDistanceRef.current = dist
      startZoomRef.current = zoomLevel
      return
    }

    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchDistanceRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / touchDistanceRef.current
      const newZoom = Math.min(3.5, Math.max(0.6, startZoomRef.current * factor))
      setZoomLevel(Number(newZoom.toFixed(2)))
    }
  }

  const handleTouchEnd = (e) => {
    if (touchDistanceRef.current) {
      touchDistanceRef.current = null
      return
    }

    const touchDuration = Date.now() - touchStartTime.current
    const diffX = touchStartX.current - (e.changedTouches[0]?.clientX || touchStartX.current)
    const diffY = touchStartY.current - (e.changedTouches[0]?.clientY || touchStartY.current)

    if (Math.abs(diffX) > 55 && Math.abs(diffY) < 60 && zoomLevel <= 1.1) {
      if (diffX > 0) {
        handleNextPage()
      } else {
        handlePrevPage()
      }
      return
    }

    if (touchDuration < 280 && Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
      const now = Date.now()
      if (now - lastTapTimeRef.current < 320) {
        setZoomLevel(z => (z > 1.2 ? 1.0 : 1.8))
        lastTapTimeRef.current = 0
        return
      }
      lastTapTimeRef.current = now

      const clickX = e.changedTouches[0]?.clientX || 0
      const screenW = window.innerWidth
      if (clickX < screenW * 0.18 && zoomLevel <= 1.05) {
        handlePrevPage()
      } else if (clickX > screenW * 0.82 && zoomLevel <= 1.05) {
        handleNextPage()
      } else {
        setShowControls(c => !c)
      }
    }
  }

  const handleOpenJump = () => {
    setJumpInput(currentPage.toString())
    setShowJumpModal(true)
  }

  const handleJumpSubmit = (e) => {
    e.preventDefault()
    const target = parseInt(jumpInput, 10)
    if (target >= 1 && target <= totalPages) {
      setCurrentPage(target)
      if (containerRef.current) containerRef.current.scrollTop = 0
    }
    setShowJumpModal(false)
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-[#000000] text-zinc-100 flex flex-col w-screen h-screen overflow-hidden select-none">
      <header
        className={`fixed top-0 inset-x-0 z-20 h-13 bg-black/85 backdrop-blur-md border-b border-white/[0.08] px-3 flex items-center justify-between transition-transform duration-200 ${
          showControls ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        }`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs">Назад</span>
        </button>

        <div className="flex-1 min-w-0 mx-2 text-center" onClick={handleOpenJump}>
          <h3 className="text-xs font-medium text-zinc-100 truncate">{book.title}</h3>
          <p className="text-[10px] text-zinc-500 font-mono truncate">
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : (book.author || book.subject)}
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          {pdfDoc && (
            <>
              <button
                onClick={() => setFitMode(m => (m === 'width' ? 'height' : 'width'))}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title={fitMode === 'width' ? 'По высоте' : 'По ширине'}
                aria-label={fitMode === 'width' ? 'По высоте' : 'По ширине'}
              >
                {fitMode === 'width' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Уменьшить"
                aria-label="Уменьшить масштаб"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(z => Math.min(3.5, z + 0.25))}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Увеличить"
                aria-label="Увеличить масштаб"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onDownload}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors ml-0.5"
            title="Скачать"
            aria-label="Скачать файл"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 w-full h-full overflow-auto bg-[#000000] flex flex-col items-center justify-start relative pt-13 pb-16"
      >
        {loading && (
          <div className="my-auto flex flex-col items-center gap-2 text-zinc-500">
            <Loader2 className="w-7 h-7 text-zinc-300 animate-spin stroke-[1.5]" />
            <span className="text-xs">Загрузка...</span>
          </div>
        )}

        {error && (
          <div className="my-auto max-w-xs text-center p-5 bg-zinc-900 border border-white/[0.08] rounded-2xl space-y-3 mx-4">
            <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto stroke-[1.5]" />
            <p className="text-xs text-zinc-300">{error}</p>
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-950 text-xs font-medium rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать</span>
            </button>
          </div>
        )}

        {textContent && (
          <div className="w-full max-w-2xl bg-zinc-900/90 border border-white/[0.08] rounded-xl p-5 my-4 mx-2">
            <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {textContent}
            </pre>
          </div>
        )}

        {imageUrl && (
          <div className="w-full h-full flex items-center justify-center my-auto p-2">
            <img src={imageUrl} alt={book.title} className="max-w-full max-h-full object-contain" />
          </div>
        )}

        {pdfDoc && (
          <div className="w-full flex justify-center items-start my-auto min-h-full">
            <canvas ref={canvasRef} className="block max-w-none" />
          </div>
        )}

        {rendering && (
          <div className="absolute top-15 right-3 bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/[0.08] flex items-center gap-1 pointer-events-none">
            <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
            <span className="text-[9px] font-mono text-zinc-400">Рендер</span>
          </div>
        )}
      </main>

      {pdfDoc && totalPages > 1 && (
        <footer
          className={`fixed bottom-0 inset-x-0 z-20 bg-black/85 backdrop-blur-md border-t border-white/[0.08] px-3 py-2 flex flex-col gap-1.5 transition-transform duration-200 ${
            showControls ? 'translate-y-0' : 'translate-y-full pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenJump}
              className="px-2.5 py-0.5 rounded-md hover:bg-white/[0.06] text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors"
              aria-label="Выбрать страницу"
            >
              <Sliders className="w-3 h-3 text-zinc-500" />
              <span>{currentPage}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-500">{totalPages}</span>
            </button>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
              aria-label="Следующая страница"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full px-2 flex items-center gap-2">
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={e => setCurrentPage(parseInt(e.target.value, 10))}
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </footer>
      )}

      {showJumpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/[0.08] rounded-xl w-full max-w-xs p-4 space-y-3 animate-modal-up">
            <div className="text-center">
              <h4 className="text-xs font-semibold text-white">Перейти на страницу</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Всего: {totalPages}</p>
            </div>
            <form onSubmit={handleJumpSubmit} className="space-y-3">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpInput}
                autoFocus
                onChange={e => setJumpInput(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] text-center text-base font-mono font-semibold text-white py-1.5 rounded-lg focus:outline-none focus:border-white/40"
              />
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowJumpModal(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-white text-zinc-950 font-medium hover:bg-zinc-200"
                >
                  Перейти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
