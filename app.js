// MarineskoApp iOS Native Web Application Logic
// With Hardware Fingerprint & Supabase Permanent Device Lock

const SUPABASE_URL = 'https://cyzexurrqqnjyeenqhis.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RcR2Wo1VlKhjg3yHHHZ9tQ_a7_59ykM';

// --- COLLEGE GROUPS & SCHEDULE DATA ---
const COLLEGE_GROUPS = [
  // 1 курс (11 кл)
  { group: '111', course: 1, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '112', course: 1, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '121', course: 1, base: '11 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '122', course: 1, base: '11 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '131', course: 1, base: '11 кл', spec: 'Електромеханічне', shift: 1 },
  { group: '141', course: 1, base: '11 кл', spec: 'Організація перевезень', shift: 1 },

  // 1 курс (9 кл)
  { group: '111-9', course: 1, base: '9 кл', spec: 'Судноводіння', shift: 1 },
  { group: '112-9', course: 1, base: '9 кл', spec: 'Судноводіння', shift: 1 },
  { group: '121-9', course: 1, base: '9 кл', spec: 'Судномеханічне', shift: 1 },

  // 2 курс
  { group: '211', course: 2, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '212', course: 2, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '213', course: 2, base: '9 кл', spec: 'Судноводіння', shift: 1 },
  { group: '221', course: 2, base: '11 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '222', course: 2, base: '9 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '231', course: 2, base: '11 кл', spec: 'Електромеханічне', shift: 1 },
  { group: '241', course: 2, base: '11 кл', spec: 'Організація перевезень', shift: 2 },

  // 3 курс
  { group: '311', course: 3, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '312', course: 3, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '321', course: 3, base: '11 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '322', course: 3, base: '11 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '331', course: 3, base: '11 кл', spec: 'Електромеханічне', shift: 1 },

  // 4 курс
  { group: '411', course: 4, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '412', course: 4, base: '11 кл', spec: 'Судноводіння', shift: 1 },
  { group: '421', course: 4, base: '11 кл', spec: 'Судномеханічне', shift: 1 },
  { group: '431', course: 4, base: '11 кл', spec: 'Електромеханічне', shift: 1 }
];

const SCHEDULES = {
  '111': {
    mon: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Теорія та будова судна', room: '501', teacher: 'Александровська Н.І.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Фізика та основи тех. механіки', room: '104', teacher: 'Чеботар Р.Г.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Навігація і лоція', room: 'каб/нав', teacher: 'Юхименко Г.Г.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Теорія та будова судна', room: '501', teacher: 'Александровська Н.І.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Фізика та основи тех. механіки', room: '104', teacher: 'Чеботар Р.Г.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Фізика та основи тех. механіки', room: '104', teacher: 'Чеботар Р.Г.', type: 'Практика' }
      ]
    },
    tue: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Математика', room: '402', teacher: 'Медведєва І.О.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Англійська мова (проф.)', room: '310', teacher: 'Кулікова І.Я.', type: 'Практика' },
        { num: 3, time: '12:10 - 13:30', name: 'Фізичне виховання', room: 'С/З', teacher: 'Луговський А.П.', type: 'Спорт' },
        { num: 4, time: '13:40 - 15:00', name: 'Нарисна геометрія та інж. графіка', room: '313', teacher: 'Орлова А.В.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Математика', room: '402', teacher: 'Медведєва І.О.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Англійська мова (проф.)', room: '310', teacher: 'Кулікова І.Я.', type: 'Практика' },
        { num: 3, time: '12:10 - 13:30', name: 'Фізичне виховання', room: 'С/З', teacher: 'Луговський А.П.', type: 'Спорт' }
      ]
    },
    wed: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Основи правознавства', room: '103', teacher: 'Надибська С.Б.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Математика', room: '402', teacher: 'Медведєва І.О.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Історія України', room: '103', teacher: 'Надибська С.Б.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Основи правознавства', room: '103', teacher: 'Надибська С.Б.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Математика', room: '402', teacher: 'Медведєва І.О.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Історія України', room: '103', teacher: 'Надибська С.Б.', type: 'Практика' }
      ]
    },
    thu: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Океанські шляхи світу', room: '214', teacher: 'Корончук В.Ю.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Основи економічної теорії', room: '502', teacher: 'Віннічук М.В.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Теорія та будова судна', room: '501', teacher: 'Александровська Н.І.', type: 'Практика' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Океанські шляхи світу', room: '214', teacher: 'Корончук В.Ю.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Основи економічної теорії', room: '502', teacher: 'Віннічук М.В.', type: 'Семінар' },
        { num: 3, time: '12:10 - 13:30', name: 'Навігація і лоція', room: 'каб/нав', teacher: 'Юхименко Г.Г.', type: 'Практика' }
      ]
    },
    fri: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Англійська мова (проф.)', room: '310', teacher: 'Кулікова І.Я.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Інформатика та ІТ', room: 'Лаб 1', teacher: 'Попов О.М.', type: 'Лабораторна' },
        { num: 3, time: '12:10 - 13:30', name: 'Безпека життєдіяльності', room: '115', teacher: 'Павлов В.І.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Англійська мова (проф.)', room: '310', teacher: 'Кулікова І.Я.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Інформатика та ІТ', room: 'Лаб 1', teacher: 'Попов О.М.', type: 'Лабораторна' }
      ]
    }
  },
  '211': {
    mon: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Морська астрономія', room: '304', teacher: 'Сидоренко А.А.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Електронна картографія', room: 'Лаб 2', teacher: 'Ткаченко Д.О.', type: 'Лабораторна' },
        { num: 3, time: '12:10 - 13:30', name: 'Морське право', room: '401', teacher: 'Григор’єв М.В.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Морська астрономія', room: '304', teacher: 'Сидоренко А.А.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Теорія маневрування', room: '301', teacher: 'Ткаченко Д.О.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Морське право', room: '401', teacher: 'Григор’єв М.В.', type: 'Семінар' }
      ]
    },
    tue: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Морська навігація', room: 'каб/нав', teacher: 'Юхименко Г.Г.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Maritime English', room: '208', teacher: 'Коваленко О.В.', type: 'Практика' },
        { num: 3, time: '12:10 - 13:30', name: 'МППСС-72', room: '305', teacher: 'Ільїн К.С.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Морська навігація', room: 'каб/нав', teacher: 'Юхименко Г.Г.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Maritime English', room: '208', teacher: 'Коваленко О.В.', type: 'Практика' },
        { num: 3, time: '12:10 - 13:30', name: 'МППСС-72', room: '305', teacher: 'Ільїн К.С.', type: 'Практика' }
      ]
    },
    wed: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Гідрометеорологія', room: '312', teacher: 'Мороз С.М.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Електрообладнання суден', room: '201', teacher: 'Васильєв П.П.', type: 'Лекція' },
        { num: 3, time: '12:10 - 13:30', name: 'Фізичне виховання', room: 'С/З', teacher: 'Луговський А.П.', type: 'Спорт' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Гідрометеорологія', room: '312', teacher: 'Мороз С.М.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Електрообладнання суден', room: '201', teacher: 'Васильєв П.П.', type: 'Лабораторна' }
      ]
    },
    thu: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Управління судном', room: '301', teacher: 'Ткаченко Д.О.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Морське радіозв’язок ГМЗЛБ', room: 'Радіокаб', teacher: 'Федоров Є.В.', type: 'Практика' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Управління судном', room: '301', teacher: 'Ткаченко Д.О.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Морське радіозв’язок ГМЗЛБ', room: 'Радіокаб', teacher: 'Федоров Є.В.', type: 'Практика' }
      ]
    },
    fri: {
      odd: [
        { num: 1, time: '09:00 - 10:20', name: 'Теорія та будова судна', room: '501', teacher: 'Александровська Н.І.', type: 'Практика' },
        { num: 2, time: '10:30 - 11:50', name: 'Охорона праці на судні', room: '115', teacher: 'Павлов В.І.', type: 'Лекція' }
      ],
      even: [
        { num: 1, time: '09:00 - 10:20', name: 'Теорія та будова судна', room: '501', teacher: 'Александровська Н.І.', type: 'Лекція' },
        { num: 2, time: '10:30 - 11:50', name: 'Охорона праці на судні', room: '115', teacher: 'Павлов В.І.', type: 'Семінар' }
      ]
    }
  }
};

// Books Database
const BOOKS = [
  {
    id: 1,
    title: 'Теорія та будова судна',
    author: 'Александровська Н.І.',
    cat: 'Судноводіння',
    pages: 342,
    desc: 'Базовий підручник для судноводіїв та механіків: розрахунок плавучості, остійності, непотоплюваності та міцності корпусу морських суден.'
  },
  {
    id: 2,
    title: 'Морська навігація і лоція',
    author: 'Юхименко Г.Г.',
    cat: 'Навігація',
    pages: 488,
    desc: 'Основи картографії, розрахунок курсів, плавання по ДБК та робота з морськими навігаційними посібниками й картами.'
  },
  {
    id: 3,
    title: 'МППСС-72 з офіційними коментарями',
    author: 'Міжнародна морська організація (ІМО)',
    cat: 'Правила ІМО',
    pages: 184,
    desc: 'Міжнародні правила запобігання зіткненню суден у морі з докладними ілюстраціями вогнів, знаків та звукових сигналів.'
  },
  {
    id: 4,
    title: 'Maritime English for Cadets',
    author: 'Коваленко О.В., Кулікова І.Я.',
    cat: 'Англійська',
    pages: 226,
    desc: 'Професійна морська англійська: команди на містку SMCP, ведення радіопереговорів VHF та ділова кореспонденція.'
  },
  {
    id: 5,
    title: 'Морська астрономія',
    author: 'Сидоренко А.А.',
    cat: 'Астрономія',
    pages: 310,
    desc: 'Визначення координат судна в морі за світилами, робота з секстаном, розрахунок поправок компаса за Сонцем та зорями.'
  },
  {
    id: 6,
    title: 'Електронна картографія та ECDIS',
    author: 'Ткаченко Д.О.',
    cat: 'Електроніка',
    pages: 260,
    desc: 'Практичний посібник з використання електронно-картографічних навігаційних інформаційних систем на ходовому містку.'
  }
];

// Bell schedule table (in minutes from midnight)
const BELLS_SHIFT1 = [
  { pair: 1, start: '09:00', end: '10:20', startMin: 9 * 60, endMin: 10 * 60 + 20, breakAfter: 10 },
  { pair: 2, start: '10:30', end: '11:50', startMin: 10 * 60 + 30, endMin: 11 * 60 + 50, breakAfter: 20 },
  { pair: 3, start: '12:10', end: '13:30', startMin: 12 * 60 + 10, endMin: 13 * 60 + 30, breakAfter: 10 },
  { pair: 4, start: '13:40', end: '15:00', startMin: 13 * 60 + 40, endMin: 15 * 60, breakAfter: 0 }
];

// App State
let currentGroup = localStorage.getItem('marinesko_group') || '111';
let isGroupLocked = false;
let cachedDeviceId = null;
let currentWeek = 'odd'; // 'odd' or 'even'
let currentDay = 'mon';
let activeTab = 'schedule';

// Determine initial day of week
const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const todayIdx = new Date().getDay();
if (todayIdx >= 1 && todayIdx <= 5) {
  currentDay = dayMap[todayIdx];
} else {
  currentDay = 'mon';
}

// Admin mode detection
const urlParams = new URLSearchParams(window.location.search);
let isAdmin = urlParams.has('admin') || 
              window.location.pathname.includes('admin') || 
              window.location.href.includes('admin') ||
              localStorage.getItem('marinesko_admin') === 'true';

if (isAdmin) {
  localStorage.setItem('marinesko_admin', 'true');
  isGroupLocked = false;
}

// --- HARDWARE FINGERPRINT GENERATOR ---
async function getDeviceFingerprint() {
  if (cachedDeviceId) return cachedDeviceId;
  const parts = [];

  // Hardware metrics
  parts.push(navigator.hardwareConcurrency || 4);
  parts.push(navigator.deviceMemory || 4);
  parts.push(screen.width + 'x' + screen.height + 'x' + screen.colorDepth);
  parts.push(window.devicePixelRatio || 1);
  parts.push(navigator.platform || '');
  parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');

  // WebGL GPU Renderer (hardware specific)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        parts.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        parts.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {}

  // Canvas 2D render subtle differences
  try {
    const c2d = document.createElement('canvas');
    c2d.width = 180;
    c2d.height = 40;
    const ctx = c2d.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(100, 1, 50, 20);
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('Marinesko,⚓', 2, 12);
    parts.push(c2d.toDataURL());
  } catch (e) {}

  // Compute SHA-256
  const rawString = parts.join('###');
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  cachedDeviceId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return cachedDeviceId;
}

// --- SUPABASE DEVICE LOCK SERVICE ---
async function checkSupabaseLock() {
  if (isAdmin) {
    console.log('Admin mode active: all 53 groups unlocked.');
    isGroupLocked = false;
    return false;
  }

  try {
    const deviceId = await getDeviceFingerprint();
    const url = `${SUPABASE_URL}/rest/v1/user_devices?device_id=eq.${deviceId}&select=group_name`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0) {
        const lockedGroup = rows[0].group_name;
        applyPermanentLock(lockedGroup);
        return true;
      }
    }
  } catch (err) {
    console.warn('Supabase check skipped:', err);
  }

  // Fallback to local storage lock
  if (!isAdmin && localStorage.getItem('marinesko_group_locked') === 'true') {
    applyPermanentLock(localStorage.getItem('marinesko_group') || '111');
    return true;
  }
  return false;
}

function applyPermanentLock(lockedGroup) {
  if (isAdmin) return; // Never lock admin!

  isGroupLocked = true;
  currentGroup = lockedGroup;
  localStorage.setItem('marinesko_group', lockedGroup);
  localStorage.setItem('marinesko_group_locked', 'true');

  const groupPill = document.getElementById('groupPill');
  const chevron = document.getElementById('groupChevron');

  if (groupPill) {
    groupPill.style.pointerEvents = 'none';
  }
  if (chevron) {
    chevron.style.display = 'none';
  }

  updateGroupBadge();
  renderSchedule();

  // Close modal if open
  const modal = document.getElementById('groupModal');
  if (modal) modal.classList.add('hidden');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved theme
  const savedTheme = localStorage.getItem('marinesko_theme') || 'slate';
  applyTheme(savedTheme);

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Bind Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Bind Day Selector
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.day-btn').forEach(b => {
        b.classList.remove('theme-bg-accent', 'text-white', 'shadow-md');
        b.classList.add('opacity-70');
      });
      btn.classList.add('theme-bg-accent', 'text-white', 'shadow-md');
      btn.classList.remove('opacity-70');
      currentDay = btn.dataset.day;
      renderSchedule();
    });
  });

  // Bind Week Toggle
  const weekToggle = document.getElementById('weekToggle');
  if (weekToggle) {
    weekToggle.addEventListener('click', () => {
      currentWeek = currentWeek === 'odd' ? 'even' : 'odd';
      weekToggle.textContent = currentWeek === 'odd' ? 'Чисельник' : 'Знаменник';
      renderSchedule();
    });
  }

  // Bind Group Switcher Modal
  const groupPill = document.getElementById('groupPill');
  const groupModal = document.getElementById('groupModal');
  const closeGroupModal = document.getElementById('closeGroupModal');
  const groupSearch = document.getElementById('groupSearch');
  const anchorBtn = document.getElementById('anchorBtn');

  // Secret Admin Toggle: 5 taps on the anchor icon
  let anchorClicks = 0;
  let anchorTimer = null;
  if (anchorBtn) {
    anchorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      anchorClicks++;
      clearTimeout(anchorTimer);
      anchorTimer = setTimeout(() => { anchorClicks = 0; }, 1500);
      if (anchorClicks >= 5) {
        anchorClicks = 0;
        isAdmin = !isAdmin;
        localStorage.setItem('marinesko_admin', isAdmin ? 'true' : 'false');
        alert(isAdmin ? 'Режим адміністратора: всі 53 групи розблоковано!' : 'Режим адміністратора вимкнено.');
        location.reload();
      }
    });
  }

  if (groupPill && groupModal) {
    groupPill.addEventListener('click', () => {
      if (isGroupLocked && !isAdmin) return;
      openGroupModal();
    });
  }
  if (closeGroupModal && groupModal) {
    closeGroupModal.addEventListener('click', () => {
      groupModal.classList.add('hidden');
    });
  }
  if (groupSearch) {
    groupSearch.addEventListener('input', (e) => {
      renderGroupList(e.target.value.trim().toLowerCase());
    });
  }

  // Bind Book Reader Modal
  const readerModal = document.getElementById('readerModal');
  const closeReaderModal = document.getElementById('closeReaderModal');
  if (closeReaderModal && readerModal) {
    closeReaderModal.addEventListener('click', () => {
      readerModal.classList.add('hidden');
    });
  }

  // Detect iOS Safari for Install Toast Prompt
  checkIosInstallPrompt();

  // Initial Renders
  if (isAdmin) {
    isGroupLocked = false;
    localStorage.removeItem('marinesko_group_locked');
    const chevron = document.getElementById('groupChevron');
    const groupPill = document.getElementById('groupPill');
    if (groupPill) groupPill.style.pointerEvents = 'auto';
    if (chevron) chevron.style.display = 'block';
  }

  updateGroupBadge();
  highlightActiveDay();
  renderSchedule();
  renderBooks();
  startBellTimer();

  // Check hardware lock from Supabase (skip for admin)
  if (!isAdmin) {
    await checkSupabaseLock();
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Switch Active Tab
function switchTab(tabId) {
  activeTab = tabId;

  // Update Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.dataset.tab === tabId) {
      b.classList.add('theme-accent');
      b.classList.remove('opacity-50');
    } else {
      b.classList.remove('theme-accent');
      b.classList.add('opacity-50');
    }
  });

  // Update Sections
  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.remove('hidden');
      view.classList.add('animate-fade-in');
    } else {
      view.classList.add('hidden');
    }
  });
}

// Render Schedule
function renderSchedule() {
  const container = document.getElementById('scheduleList');
  if (!container) return;

  const currentGroupData = SCHEDULES[currentGroup] || SCHEDULES['111'];
  const daySchedule = (currentGroupData[currentDay] || currentGroupData['mon'])[currentWeek] || [];

  if (daySchedule.length === 0) {
    container.innerHTML = `
      <div class="app-card p-8 text-center space-y-2">
        <i data-lucide="coffee" class="w-10 h-10 theme-accent mx-auto opacity-70"></i>
        <div class="text-base font-bold">Сьогодні пар немає!</div>
        <div class="text-xs opacity-60">Можна відпочити або підготуватися до наступних занять.</div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  let html = '';
  daySchedule.forEach(lesson => {
    const isLecture = lesson.type.includes('Лекц');
    const badgeBg = isLecture 
      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' 
      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';

    html += `
      <div class="app-card p-4 space-y-2.5 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg theme-bg-accent text-white flex items-center justify-center font-bold text-xs">
              ${lesson.num}
            </span>
            <span class="text-xs font-mono opacity-60">${lesson.time}</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold ${badgeBg}">
            ${lesson.type}
          </span>
        </div>

        <div class="text-sm font-bold leading-snug">
          ${lesson.name}
        </div>

        <div class="flex items-center justify-between text-xs pt-1 border-t border-white/5 opacity-80">
          <span class="truncate">${lesson.teacher}</span>
          <span class="font-bold theme-accent ml-2 shrink-0">ауд. ${lesson.room}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

// Highlight Current Day button
function highlightActiveDay() {
  document.querySelectorAll('.day-btn').forEach(btn => {
    if (btn.dataset.day === currentDay) {
      btn.classList.add('theme-bg-accent', 'text-white', 'shadow-md');
      btn.classList.remove('opacity-70');
    } else {
      btn.classList.remove('theme-bg-accent', 'text-white', 'shadow-md');
      btn.classList.add('opacity-70');
    }
  });
}

// Update Group Badge
function updateGroupBadge() {
  const lbl = document.getElementById('currentGroupLabel');
  if (lbl) {
    lbl.textContent = `Група ${currentGroup}`;
  }
}

// Open Group Select Modal
function openGroupModal() {
  if (isGroupLocked && !isAdmin) return;
  const modal = document.getElementById('groupModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderGroupList('');
  const searchInput = document.getElementById('groupSearch');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
}

// Render Group List in Modal
function renderGroupList(query) {
  const listElem = document.getElementById('modalGroupList');
  if (!listElem) return;

  const filtered = COLLEGE_GROUPS.filter(g => {
    if (!query) return true;
    return g.group.toLowerCase().includes(query) || 
           g.spec.toLowerCase().includes(query) || 
           `${g.course} курс`.includes(query);
  });

  let html = '';
  filtered.forEach(g => {
    const isSelected = g.group === currentGroup;
    html += `
      <div onclick="confirmSelectGroup('${g.group}')" class="p-3 rounded-xl flex items-center justify-between cursor-pointer border ${isSelected ? 'theme-border-accent bg-indigo-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'} transition-all tap-effect">
        <div class="space-y-0.5">
          <div class="text-sm font-bold ${isSelected ? 'theme-accent' : ''}">${g.group}</div>
          <div class="text-[11px] opacity-60">${g.spec} • ${g.course} курс (${g.base})</div>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-medium">Обрати</span>
      </div>
    `;
  });

  listElem.innerHTML = html;
}

// Silent Group Selection (Permanent Device Lock for Users, Free Switch for Admin)
window.confirmSelectGroup = async function(grp) {
  if (isGroupLocked && !isAdmin) return;

  if (isAdmin) {
    currentGroup = grp;
    localStorage.setItem('marinesko_group', grp);
    updateGroupBadge();
    renderSchedule();
    const modal = document.getElementById('groupModal');
    if (modal) modal.classList.add('hidden');
    return;
  }

  // Regular user: silent permanent lock (no notification/confirm popup)
  applyPermanentLock(grp);

  // Send hardware lock to Supabase
  try {
    const deviceId = await getDeviceFingerprint();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_devices`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        device_id: deviceId,
        group_name: grp
      })
    });
    if (res.ok) {
      console.log('Device locked on Supabase successfully!');
    }
  } catch (err) {
    console.error('Lock registration failed:', err);
  }
};

// Start Live Bell Countdown Timer
function startBellTimer() {
  updateTimer();
  setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = new Date();
  const curMin = now.getHours() * 60 + now.getMinutes();
  const curSec = now.getSeconds();

  let activePair = null;
  let activeBreak = null;

  for (let i = 0; i < BELLS_SHIFT1.length; i++) {
    const b = BELLS_SHIFT1[i];
    if (curMin >= b.startMin && curMin < b.endMin) {
      activePair = b;
      break;
    }
    const nextB = BELLS_SHIFT1[i + 1];
    if (nextB && curMin >= b.endMin && curMin < nextB.startMin) {
      activeBreak = { from: b, to: nextB, endMin: nextB.startMin };
      break;
    }
  }

  const timerTitle = document.getElementById('timerStatusTitle');
  const timerCountdown = document.getElementById('timerCountdown');
  const timerBar = document.getElementById('timerProgressBar');

  if (activePair) {
    const totalSecs = (activePair.endMin - activePair.startMin) * 60;
    const passedSecs = (curMin - activePair.startMin) * 60 + curSec;
    const leftSecs = Math.max(0, totalSecs - passedSecs);

    const mLeft = Math.floor(leftSecs / 60);
    const sLeft = leftSecs % 60;

    if (timerTitle) timerTitle.textContent = `Зараз іде ${activePair.pair} пара (${activePair.start} - ${activePair.end})`;
    if (timerCountdown) timerCountdown.textContent = `${mLeft} хв ${sLeft < 10 ? '0' : ''}${sLeft} сек`;
    if (timerBar) {
      const pct = Math.min(100, Math.floor((passedSecs / totalSecs) * 100));
      timerBar.style.width = `${pct}%`;
    }
  } else if (activeBreak) {
    const totalSecs = (activeBreak.endMin - activeBreak.from.endMin) * 60;
    const passedSecs = (curMin - activeBreak.from.endMin) * 60 + curSec;
    const leftSecs = Math.max(0, totalSecs - passedSecs);

    const mLeft = Math.floor(leftSecs / 60);
    const sLeft = leftSecs % 60;

    if (timerTitle) timerTitle.textContent = `Перерва перед ${activeBreak.to.pair} парою`;
    if (timerCountdown) timerCountdown.textContent = `${mLeft} хв ${sLeft < 10 ? '0' : ''}${sLeft} сек`;
    if (timerBar) {
      const pct = Math.min(100, Math.floor((passedSecs / totalSecs) * 100));
      timerBar.style.width = `${pct}%`;
    }
  } else {
    if (timerTitle) timerTitle.textContent = 'Занять зараз немає';
    if (timerCountdown) timerCountdown.textContent = 'Звонки 1-ї зміни з 09:00';
    if (timerBar) timerBar.style.width = '0%';
  }
}

// Render Books Library
function renderBooks() {
  const container = document.getElementById('booksList');
  if (!container) return;

  let html = '';
  BOOKS.forEach(b => {
    html += `
      <div onclick="openReader(${b.id})" class="app-card p-4 space-y-2 cursor-pointer transition-all hover:border-indigo-500/40">
        <div class="flex items-start justify-between gap-2">
          <div class="text-sm font-bold">${b.title}</div>
          <span class="text-[10px] px-2 py-0.5 rounded-full theme-bg-accent text-white font-semibold whitespace-nowrap">
            ${b.cat}
          </span>
        </div>
        <div class="text-xs opacity-60">${b.author} • ${b.pages} сторінок</div>
        <p class="text-xs opacity-75 line-clamp-2">${b.desc}</p>
        <div class="pt-2 flex items-center justify-between text-xs theme-accent font-semibold">
          <span>Читати офлайн</span>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

// Open Reader Modal
window.openReader = function(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById('readerModal');
  const title = document.getElementById('readerTitle');
  const meta = document.getElementById('readerMeta');
  const body = document.getElementById('readerBody');

  if (title) title.textContent = book.title;
  if (meta) meta.textContent = `${book.author} • ${book.pages} стор. • ${book.cat}`;
  if (body) {
    body.innerHTML = `
      <div class="space-y-4 text-sm leading-relaxed opacity-90">
        <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs theme-accent font-semibold flex items-center gap-2">
          <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
          <span>Підручник збережено в офлайн-пам'яті пристрою. Доступний без інтернету.</span>
        </div>
        <h4 class="text-base font-bold pt-2">Введення та опис курсу</h4>
        <p>${book.desc}</p>
        <h4 class="text-base font-bold pt-2">Розділ 1: Загальні положення та визначення</h4>
        <p>Матеріал підготовлено кафедрою Мореходного фахового коледжу технічного флоту ім. О.І. Марінеско НУ «ОМА». Зміст адаптовано для підготовки курсантів плавскладу цивільного та технічного флоту відповідно до вимог конвенції STCW/ПДНВ.</p>
        <p class="opacity-60 text-xs italic">Для завантаження повної версії PDF підключіться до внутрішньої мережі бібліотеки коледжу або зверніться до викладача.</p>
      </div>
    `;
  }

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

// Theme Manager
window.applyTheme = function(themeName) {
  document.body.setAttribute('data-theme', themeName);
  localStorage.setItem('marinesko_theme', themeName);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.themeName === themeName) {
      btn.classList.add('ring-2', 'ring-indigo-500', 'scale-105');
    } else {
      btn.classList.remove('ring-2', 'ring-indigo-500', 'scale-105');
    }
  });
};

// Detect iOS Safari and show prompt
function checkIosInstallPrompt() {
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

  const promptElem = document.getElementById('iosInstallPrompt');
  if (promptElem && isIos && !isStandalone) {
    promptElem.classList.remove('hidden');
  }
}

window.dismissIosPrompt = function() {
  const promptElem = document.getElementById('iosInstallPrompt');
  if (promptElem) promptElem.classList.add('hidden');
};
