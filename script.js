let currentLanguage = 'es';
let colorIndex = 0;
let tiltIntensity = 0;

const girlyColors = [
    { name: 'Classic Pink', text: '#fbc6d0', accent: '#f8a5c2', glow: 'rgba(251, 198, 208, 0.3)' },
    { name: 'Lavender Mist', text: '#dcd0ff', accent: '#c3a6ff', glow: 'rgba(220, 208, 255, 0.3)' },
    { name: 'Mint Dream', text: '#b2f2bb', accent: '#8ce99a', glow: 'rgba(178, 242, 187, 0.3)' },
    { name: 'Sky Blue', text: '#a5d8ff', accent: '#74c0fc', glow: 'rgba(165, 216, 255, 0.3)' },
    { name: 'Peach Puff', text: '#ffdab9', accent: '#ffc078', glow: 'rgba(255, 218, 185, 0.3)' },
    { name: 'Vanilla Heart', text: '#ffeaa7', accent: '#fab1a0', glow: 'rgba(255, 234, 167, 0.3)' }
];

const months = {
    es: ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"],
    en: ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
};

const weekdays = {
    es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    en: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};

function init() {
    updateTime();
    updateDateAndWeather();
    updateMonthProgress();
    generateCalendar();
    loadPersistence();
    setup3DEffect();
    setupModal();

    setInterval(updateTime, 1000);
    setInterval(updateDateAndWeather, 60000);
    setInterval(updateMonthProgress, 3600000); 
}

function updateTime() {
    const now = new Date();
    const s = JSON.parse(localStorage.getItem('widget-settings')) || {};
    const format = s.timeFormat || '24h';
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    let ampm = '';

    if (format === '12h') {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
    }

    const hStr = hours.toString().padStart(2, '0');
    document.getElementById('time-display').innerText = `${hStr}:${minutes}${ampm}`;
}

function updateDateAndWeather() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', options);
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    document.getElementById('full-date').innerText = formattedDate;

    const hour = now.getHours();
    const iconContainer = document.getElementById('weather-icon-container');
    
    if (hour > 6 && hour < 18) {
        // Sun SVG
        iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    } else {
        // Moon SVG
        iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
}

function updateMonthProgress() {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const progress = Math.round((now.getDate() / endOfMonth.getDate()) * 100);

    document.getElementById('progress-text').innerText = `${progress}%`;
    const circle = document.querySelector('.progress-ring__circle');
    const radius = 26;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;
}

function generateCalendar() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();
    
    document.getElementById('month-header').innerText = months[currentLanguage][currentMonth];
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    weekdays[currentLanguage].forEach(wd => {
        const div = document.createElement('div');
        div.className = 'weekday';
        div.innerText = wd;
        grid.appendChild(div);
    });
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
    for (let d = 1; d <= daysInMonth; d++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.innerText = d;
        if (d === today) div.classList.add('today');
        grid.appendChild(div);
    }
}

function setup3DEffect() {
    const widget = document.getElementById('main-widget');
    document.addEventListener('mousemove', (e) => {
        if (tiltIntensity === 0) return;
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        
        const tiltX = -y * tiltIntensity;
        const tiltY = x * tiltIntensity;
        
        document.documentElement.style.setProperty('--tilt-x', `${tiltX}deg`);
        document.documentElement.style.setProperty('--tilt-y', `${tiltY}deg`);
    });
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

function setupModal() {
    const modal = document.getElementById('settings-modal');
    const btn = document.getElementById('btn-settings');
    const close = document.getElementById('close-modal');
    const save = document.getElementById('save-settings');
    const reset = document.getElementById('reset-settings');

    btn.onclick = () => modal.style.display = 'flex';
    close.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    save.onclick = () => {
        const settings = {
            owner: document.getElementById('owner-name').value,
            bgColor: document.getElementById('bg-color-picker').value,
            accentColor: document.getElementById('accent-color-picker').value,
            taskTextColor: document.getElementById('task-text-color').value,
            darkMode: document.getElementById('dark-mode-toggle').checked,
            timeFormat: document.getElementById('time-format').value,
            opacity: document.getElementById('bg-opacity').value,
            tilt: document.getElementById('tilt-intensity').value,
            font: document.getElementById('font-select').value,
            weather: document.getElementById('show-weather').checked,
            progress: document.getElementById('show-progress').checked
        };
        localStorage.setItem('widget-settings', JSON.stringify(settings));
        applySettings(settings);
        modal.style.display = 'none';
    };

    reset.onclick = () => {
        localStorage.removeItem('widget-settings');
        location.reload();
    };
}

function applySettings(s) {
    if (!s) return;
    tiltIntensity = parseInt(s.tilt);
    
    // Background and Dark Mode
    const rgb = hexToRgb(s.bgColor || '#ffffff');
    document.documentElement.style.setProperty('--bg-grad-1', rgb);
    document.documentElement.style.setProperty('--bg-grad-2', rgb);
    document.documentElement.style.setProperty('--opacity', s.opacity);
    
    // Accent Color
    if (s.accentColor) {
        document.documentElement.style.setProperty('--text-pink', s.accentColor);
        document.documentElement.style.setProperty('--accent', s.accentColor);
        document.documentElement.style.setProperty('--glow-color', `${s.accentColor}4D`); 
    }

    // Task & Today Highlight Color Override
    if (s.taskTextColor) {
        document.getElementById('main-task').style.color = s.taskTextColor;
        document.querySelector('.task-container .label').style.color = s.taskTextColor;
        
        // Sync today highlight with task color choice
        const todayStyle = document.createElement('style');
        // If box is white (#ffffff), text should be dark (#5d5d5d)
        // If box is dark (#5d5d5d), text should be white (#ffffff)
        const contrastColor = (s.taskTextColor === '#ffffff') ? '#5d5d5d' : '#ffffff';
        
        todayStyle.innerHTML = `
            .today::before { background: ${s.taskTextColor} !important; }
            .today { color: ${contrastColor} !important; }
        `;
        document.head.appendChild(todayStyle);
    } else {
        // If no override, use accent color for label too
        document.querySelector('.task-container .label').style.color = s.accentColor;
    }
    
    if (s.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    document.documentElement.style.setProperty('--font-main', s.font);
    document.querySelector('.date-weather').style.display = s.weather ? 'flex' : 'none';
    document.querySelector('.progress-section').style.display = s.progress ? 'flex' : 'none';
    if (s.owner) document.getElementById('main-task').placeholder = `${s.owner}, ¿qué harás hoy?`;
    
    updateTime();
}

function loadPersistence() {
    const savedTask = localStorage.getItem('premium-widget-task');
    if (savedTask) document.getElementById('main-task').value = savedTask;
    document.getElementById('main-task').addEventListener('input', (e) => {
        localStorage.setItem('premium-widget-task', e.target.value);
    });

    const s = JSON.parse(localStorage.getItem('widget-settings'));
    if (s) {
        document.getElementById('owner-name').value = s.owner || '';
        document.getElementById('bg-color-picker').value = s.bgColor || '#ffffff';
        document.getElementById('accent-color-picker').value = s.accentColor || '#fbc6d0';
        document.getElementById('task-text-color').value = s.taskTextColor || '#ffffff';
        document.getElementById('dark-mode-toggle').checked = s.darkMode;
        document.getElementById('time-format').value = s.timeFormat || '24h';
        document.getElementById('bg-opacity').value = s.opacity;
        document.getElementById('tilt-intensity').value = s.tilt;
        document.getElementById('font-select').value = s.font;
        document.getElementById('show-weather').checked = s.weather;
        document.getElementById('show-progress').checked = s.progress;
        
        applySettings(s);
    } else {
        // Default settings for first load: PINK THEME
        applySettings({
            owner: '',
            bgColor: '#fbc6d0', // Pink background
            accentColor: '#ffffff', // White accent (for numbers/dates)
            taskTextColor: '#ffffff', // White task text
            darkMode: false,
            timeFormat: '24h',
            opacity: 0.9,
            tilt: 0,
            font: "'Playfair Display', serif",
            weather: true,
            progress: true
        });
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    updateDateAndWeather();
    generateCalendar();
}

document.getElementById('btn-lang').addEventListener('click', toggleLanguage);

init();
