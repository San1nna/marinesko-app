import { get, set, del } from 'idb-keyval'
import { getScheduleForGroup } from '../data/collegeScheduleData'

const DEFAULT_CALL_TIMES = [
  { id: '1-1', shift: '1 смена', pair: '1 пара', start: '09:00', end: '10:20' },
  { id: '1-2', shift: '1 смена', pair: '2 пара', start: '10:30', end: '11:50' },
  { id: '1-3', shift: '1 смена', pair: '3 пара', start: '12:10', end: '13:30' },
  { id: '1-4', shift: '1 смена', pair: '4 пара', start: '13:40', end: '15:00' },
  { id: '2-1', shift: '2 смена', pair: '1 пара', start: '13:40', end: '15:00' },
  { id: '2-2', shift: '2 смена', pair: '2 пара', start: '15:10', end: '16:30' },
  { id: '2-3', shift: '2 смена', pair: '3 пара', start: '16:40', end: '18:00' }
]

const EMPTY_SCHEDULE = {
  group: '',
  course: null,
  base: '',
  shift: 1,
  shiftName: '',
  address: '',
  weekType: 'all',
  days: [
    { id: 'mon', name: 'Понедельник', lessons: [] },
    { id: 'tue', name: 'Вторник', lessons: [] },
    { id: 'wed', name: 'Среда', lessons: [] },
    { id: 'thu', name: 'Четверг', lessons: [] },
    { id: 'fri', name: 'Пятница', lessons: [] },
    { id: 'sat', name: 'Суббота', lessons: [] }
  ]
}

const DEFAULT_SCHEDULE = EMPTY_SCHEDULE
const DEFAULT_BOOKS = []

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('college_clean_v4') !== 'true') {
      localStorage.removeItem('college_books_backup')
      localStorage.removeItem('college_schedule_backup')
      localStorage.removeItem('college_user_selected_group')
      del('college_books_meta').catch(() => {})
      del('college_schedule').catch(() => {})
      localStorage.setItem('college_clean_v4', 'true')
    }
  } catch {}
}

export function getInitialScheduleSync() {
  try {
    if (!localStorage.getItem('college_user_selected_group')) {
      return DEFAULT_SCHEDULE
    }
    const local = localStorage.getItem('college_schedule_backup')
    if (local) {
      const parsed = JSON.parse(local)
      if (parsed && Array.isArray(parsed.days) && parsed.group) {
        return parsed
      }
    }
  } catch {}
  return DEFAULT_SCHEDULE
}

export function getInitialBooksSync() {
  try {
    const local = localStorage.getItem('college_books_backup')
    if (local) {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed)) return parsed.filter(b => !b.isDemo && !b.id?.startsWith('demo-'))
    }
  } catch {}
  return DEFAULT_BOOKS
}

export function getInitialCallTimesSync() {
  try {
    const local = localStorage.getItem('college_calls_backup')
    if (local) {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return DEFAULT_CALL_TIMES
}

export async function getSchedule() {
  if (typeof window !== 'undefined' && !localStorage.getItem('college_user_selected_group')) {
    return DEFAULT_SCHEDULE
  }
  let data = null
  try {
    data = await get('college_schedule')
  } catch {}
  if (!data || !Array.isArray(data.days) || !data.group) {
    const local = localStorage.getItem('college_schedule_backup')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (parsed && Array.isArray(parsed.days) && parsed.group) {
          data = parsed
        }
      } catch {}
    }
  }
  if (!data || !data.group) {
    return DEFAULT_SCHEDULE
  }
  return data
}

export async function saveSchedule(schedule) {
  try {
    localStorage.setItem('college_schedule_backup', JSON.stringify(schedule))
  } catch {}
  await set('college_schedule', schedule)
}

export async function switchGroup(groupName) {
  const collegeGroup = getScheduleForGroup(groupName)
  if (!collegeGroup) return null
  const newSchedule = {
    group: collegeGroup.group,
    course: collegeGroup.course,
    base: collegeGroup.base,
    shift: collegeGroup.shift,
    shiftName: collegeGroup.shiftName,
    address: collegeGroup.address,
    weekType: 'all',
    days: collegeGroup.days
  }
  try {
    localStorage.setItem('college_user_selected_group', collegeGroup.group)
  } catch {}
  await saveSchedule(newSchedule)
  return newSchedule
}

export async function resetScheduleToDefault(groupName) {
  const collegeGroup = getScheduleForGroup(groupName || '111') || DEFAULT_SCHEDULE
  const sched = {
    group: collegeGroup.group,
    course: collegeGroup.course,
    base: collegeGroup.base,
    shift: collegeGroup.shift,
    shiftName: collegeGroup.shiftName,
    address: collegeGroup.address,
    weekType: 'all',
    days: collegeGroup.days
  }
  await saveSchedule(sched)
  return sched
}

export async function clearAllSchedule() {
  const emptySchedule = {
    ...DEFAULT_SCHEDULE,
    days: DEFAULT_SCHEDULE.days.map(d => ({ ...d, lessons: [] }))
  }
  await saveSchedule(emptySchedule)
  return emptySchedule
}

export async function getBooks() {
  let books = await get('college_books_meta')
  if (books === undefined || books === null) {
    const local = localStorage.getItem('college_books_backup')
    if (local) {
      try {
        books = JSON.parse(local)
      } catch {}
    }
  }
  if (books === undefined || books === null) {
    await set('college_books_meta', DEFAULT_BOOKS)
    try {
      localStorage.setItem('college_books_backup', JSON.stringify(DEFAULT_BOOKS))
    } catch {}
    return DEFAULT_BOOKS
  }
  return Array.isArray(books) ? books.filter(b => !b.isDemo && !b.id?.startsWith('demo-')) : []
}

export async function addBook(meta, fileBlob) {
  const books = await getBooks()
  const updated = [meta, ...books]
  await set('college_books_meta', updated)
  try {
    localStorage.setItem('college_books_backup', JSON.stringify(updated))
  } catch {}
  if (fileBlob) {
    await set(`book_blob_${meta.id}`, fileBlob)
  }
  return updated
}

export async function deleteBook(id) {
  const books = await getBooks()
  const updated = books.filter(b => b.id !== id)
  await set('college_books_meta', updated)
  try {
    localStorage.setItem('college_books_backup', JSON.stringify(updated))
  } catch {}
  await del(`book_blob_${id}`)
  return updated
}

export async function clearAllBooks() {
  const books = await getBooks()
  for (const b of books) {
    await del(`book_blob_${b.id}`)
  }
  await set('college_books_meta', [])
  try {
    localStorage.setItem('college_books_backup', JSON.stringify([]))
  } catch {}
  return []
}

export async function getBookBlob(id) {
  return await get(`book_blob_${id}`)
}

export async function getCallTimes() {
  let calls = await get('college_call_times')
  if (calls === undefined || calls === null) {
    const local = localStorage.getItem('college_calls_backup')
    if (local) {
      try {
        calls = JSON.parse(local)
      } catch {}
    }
  }
  if (calls === undefined || calls === null) {
    await saveCallTimes(DEFAULT_CALL_TIMES)
    return DEFAULT_CALL_TIMES
  }
  return calls || []
}

export async function saveCallTimes(calls) {
  try {
    localStorage.setItem('college_calls_backup', JSON.stringify(calls))
  } catch {}
  await set('college_call_times', calls)
}

export async function resetCallTimes() {
  await saveCallTimes(DEFAULT_CALL_TIMES)
  return DEFAULT_CALL_TIMES
}
