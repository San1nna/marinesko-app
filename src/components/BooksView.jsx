import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, UploadCloud, Search, Trash2, Download, Plus, X, FolderCheck } from 'lucide-react'
import { addBook, deleteBook, getBookBlob, clearAllBooks } from '../services/storage'
import ReaderModal from './ReaderModal'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Б'
  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function BooksView({ books, onUpdate }) {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [bookSubject, setBookSubject] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [activeReader, setActiveReader] = useState(null)
  const fileInputRef = useRef(null)

  const subjects = ['all', ...Array.from(new Set(books.map(b => b.subject).filter(Boolean)))]

  const filteredBooks = books.filter(book => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(search.toLowerCase()))
    const matchSubject = selectedSubject === 'all' || book.subject === selectedSubject
    return matchSearch && matchSubject
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadFile(file)
      if (!bookTitle) {
        setBookTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setUploadFile(file)
      if (!bookTitle) {
        setBookTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleSubmitBook = async (e) => {
    e.preventDefault()
    if (!uploadFile && !bookTitle) return

    setIsUploading(true)
    try {
      const newBookMeta = {
        id: Date.now().toString(),
        title: bookTitle.trim() || uploadFile?.name || 'Без названия',
        author: bookAuthor.trim() || 'Не указан',
        subject: bookSubject.trim() || 'Общее',
        sizeFormatted: uploadFile ? formatBytes(uploadFile.size) : '0 МБ',
        fileName: uploadFile?.name || '',
        fileType: uploadFile?.type || 'application/pdf',
        createdAt: new Date().toISOString()
      }

      const updated = await addBook(newBookMeta, uploadFile)
      onUpdate(updated)
      setShowUploadModal(false)
      setUploadFile(null)
      setBookTitle('')
      setBookAuthor('')
      setBookSubject('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Удалить эту книгу?')) {
      const updated = await deleteBook(id)
      onUpdate(updated)
      try {
        localStorage.removeItem(`book_page_${id}`)
      } catch {}
      if (activeReader?.book.id === id) {
        setActiveReader(null)
      }
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Удалить все книги из библиотеки?')) {
      for (const b of books) {
        try {
          localStorage.removeItem(`book_page_${b.id}`)
        } catch {}
      }
      const empty = await clearAllBooks()
      onUpdate(empty)
      setActiveReader(null)
    }
  }

  const handleOpenReader = async (book) => {
    if (book.isDemo) {
      setActiveReader({ book, blob: null })
      return
    }

    const blob = await getBookBlob(book.id)
    if (!blob) {
      alert('Файл книги не найден в памяти устройства')
      return
    }
    setActiveReader({ book, blob })
  }

  const handleDownload = async (book) => {
    if (book.isDemo) {
      const blob = new Blob([`Учебник: ${book.title}\nАвтор: ${book.author}\nПредмет: ${book.subject}`], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book.title}.txt`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      return
    }

    const blob = await getBookBlob(book.id)
    if (!blob) {
      alert('Файл не найден в памяти устройства')
      return
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = book.fileName || `${book.title}.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const getSavedPage = (bookId) => {
    try {
      const val = localStorage.getItem(`book_page_${bookId}`)
      const parsed = val ? parseInt(val, 10) : 0
      return parsed > 1 ? parsed : null
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold theme-text-main">Учебники</h2>
          <span className="text-xs theme-text-muted font-mono">{books.length}</span>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-btn-accent text-xs font-semibold active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Добавить</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none opacity-60" />
        <input
          type="text"
          placeholder="Поиск по названию или автору..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full theme-bg-input border theme-border rounded-xl pl-9 pr-3 py-2 text-xs theme-text-main placeholder:opacity-40 focus:outline-none transition-colors"
        />
      </div>

      {subjects.length > 2 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap active:scale-95 transition-all duration-150 ${
                selectedSubject === s
                  ? 'theme-btn-accent font-medium'
                  : 'theme-bg-subtle theme-text-muted hover:opacity-100'
              }`}
            >
              {s === 'all' ? 'Все предметы' : s}
            </button>
          ))}
        </div>
      )}

      {filteredBooks.length === 0 ? (
        <div className="rounded-xl border theme-border p-8 text-center theme-bg-card/40">
          <BookOpen className="w-6 h-6 theme-text-muted mx-auto mb-2 opacity-50 stroke-[1.5]" />
          <p className="text-xs theme-text-muted">
            {search ? 'Книг по запросу не найдено' : 'Библиотека пуста'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-3 text-xs theme-text-accent underline underline-offset-4 font-medium"
          >
            Загрузить учебник (PDF)
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map(book => {
            const savedPage = getSavedPage(book.id)
            return (
              <div
                key={book.id}
                className="theme-bg-card theme-bg-card-hover rounded-xl p-3.5 border theme-border transition-all duration-150 hover:scale-[1.008] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] theme-text-muted px-1.5 py-0.5 rounded theme-bg-subtle border theme-border">
                        {book.subject}
                      </span>
                      {savedPage && (
                        <span className="text-[10px] theme-text-accent font-mono">
                          стр. {savedPage}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-medium theme-text-main leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs theme-text-muted mt-1">
                      {book.author}
                    </p>

                    <span className="text-[10px] theme-text-muted opacity-60 font-mono mt-1.5 block">
                      {book.sizeFormatted}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenReader(book)}
                      className="px-3 py-1 rounded-md theme-btn-accent text-xs font-medium active:scale-95 transition-all"
                    >
                      Читать
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(book)}
                        className="p-1.5 theme-text-muted hover:theme-text-main rounded-md transition-colors"
                        title="Скачать"
                        aria-label="Скачать учебник"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-1.5 theme-text-muted hover:text-rose-400 rounded-md transition-colors"
                        title="Удалить"
                        aria-label="Удалить учебник"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {books.length > 0 && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleClearAll}
            className="text-[11px] theme-text-muted hover:text-rose-400 opacity-60 hover:opacity-100 transition-colors"
          >
            Очистить всю библиотеку
          </button>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="theme-bg-card border theme-border rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto animate-modal-up">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <h3 className="text-sm font-semibold theme-text-main">Добавить учебник</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-md theme-text-muted hover:theme-text-main"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitBook} className="mt-4 space-y-3.5 text-xs">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed theme-border hover:opacity-80 rounded-xl p-6 text-center cursor-pointer theme-bg-subtle transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.epub,.fb2,.djvu,.txt,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2 theme-text-main">
                    <FolderCheck className="w-4 h-4 theme-text-accent" />
                    <span className="truncate max-w-[200px]">{uploadFile.name}</span>
                    <span className="text-[10px] theme-text-muted font-mono">({formatBytes(uploadFile.size)})</span>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-6 h-6 theme-text-muted mx-auto mb-1 stroke-[1.5]" />
                    <p className="theme-text-main font-medium">Выберите файл</p>
                    <p className="text-[10px] theme-text-muted mt-0.5">PDF, DOCX, TXT</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block theme-text-muted font-medium mb-1">Название книги</label>
                <input
                  type="text"
                  required
                  placeholder="Высшая математика"
                  value={bookTitle}
                  onChange={e => setBookTitle(e.target.value)}
                  className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block theme-text-muted font-medium mb-1">Автор</label>
                <input
                  type="text"
                  placeholder="Иванов И.И."
                  value={bookAuthor}
                  onChange={e => setBookAuthor(e.target.value)}
                  className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block theme-text-muted font-medium mb-1">Предмет</label>
                <input
                  type="text"
                  placeholder="Математика"
                  value={bookSubject}
                  onChange={e => setBookSubject(e.target.value)}
                  className="w-full theme-bg-input border theme-border rounded-xl px-3 py-2 theme-text-main focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl theme-bg-subtle theme-text-muted font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl theme-btn-accent font-semibold disabled:opacity-50 transition-colors"
                >
                  {isUploading ? 'Сохранение...' : 'Загрузить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeReader && createPortal(
        <ReaderModal
          book={activeReader.book}
          blob={activeReader.blob}
          onClose={() => setActiveReader(null)}
          onDownload={() => handleDownload(activeReader.book)}
        />,
        document.body
      )}
    </div>
  )
}
