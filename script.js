let currentDate = new Date();
let slideIndex = 0;
let currentLang = localStorage.getItem('widget-lang') || 'es';
let currentAccent = localStorage.getItem('widget-accent') || '#ff8fb1';
let currentFont = localStorage.getItem('widget-font') || "'Outfit', sans-serif";

const i18n = {
    es: {
        months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        weekdays: ["D", "L", "M", "M", "J", "V", "S"],
        dateLocale: 'es-ES',
        phases: ["Luna Nueva", "Luna Creciente", "Cuarto Creciente", "Luna Gibosa", "Luna Llena", "Luna Menguante", "Cuarto Menguante", "Luna Menguante"]
    },
    en: {
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        weekdays: ["S", "M", "T", "W", "T", "F", "S"],
        dateLocale: 'en-US',
        phases: ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
    },
    fr: {
        months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        weekdays: ["D", "L", "M", "M", "J", "V", "S"],
        dateLocale: 'fr-FR',
        phases: ["Nouvelle Lune", "Premier Croissant", "Premier Quartier", "Gibbeuse Croissante", "Pleine Lune", "Gibbeuse Décroissante", "Dernier Quartier", "Dernier Croissant"]
    }
};

function init() {
    applyStoredSettings();
    updateTime();
    renderCalendar();
    updateMoonPhase();
    setupSlider();
    setupSettings();
    
    setInterval(updateTime, 1000);
    setInterval(updateMoonPhase, 3600000); 
}

function applyStoredSettings() {
    document.documentElement.style.setProperty('--accent-pink', currentAccent);
    document.documentElement.style.setProperty('--font-main', currentFont);
    document.body.style.fontFamily = currentFont;
    
    document.getElementById('langSelect').value = currentLang;
    document.getElementById('fontSelect').value = currentFont;
    
    document.querySelectorAll('.color-dot').forEach(dot => {
        if (dot.dataset.color === currentAccent) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').innerText = `${hours}:${minutes}`;
    
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    let dateStr = now.toLocaleDateString(i18n[currentLang].dateLocale, options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    document.getElementById('date').innerText = dateStr;
}

function updateMoonPhase() {
    const now = new Date();
    const phaseIndex = calculateMoonPhase(now);
    document.getElementById('moonPhaseName').innerText = i18n[currentLang].phases[phaseIndex];
}

function calculateMoonPhase(date) {
    const lp = 2551443; 
    const new_moon = new Date(1970, 0, 7, 20, 35, 0);
    const phase = ((date.getTime() - new_moon.getTime()) / 1000) % lp;
    const phaseNum = Math.floor((phase / lp) * 8);
    return (phaseNum < 0) ? 8 + phaseNum : phaseNum;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('monthName').innerText = i18n[currentLang].months[month];
    
    const weekdaysRow = document.getElementById('weekdaysRow');
    weekdaysRow.innerHTML = i18n[currentLang].weekdays.map(d => `<span>${d}</span>`).join('');
    
    const daysGrid = document.getElementById('daysGrid');
    daysGrid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    for (let i = 0; i < firstDay; i++) {
        const span = document.createElement('span');
        span.className = 'calendar-day empty';
        daysGrid.appendChild(span);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const span = document.createElement('span');
        span.className = 'calendar-day';
        span.innerText = day;
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            span.classList.add('today');
        }
        daysGrid.appendChild(span);
    }
}

function setupSettings() {
    const modal = document.getElementById('settingsModal');
    const openBtn = document.getElementById('openSettings');
    const closeBtn = document.getElementById('closeSettings');
    
    openBtn.onclick = () => modal.classList.add('active');
    closeBtn.onclick = () => modal.classList.remove('active');
    
    document.getElementById('langSelect').onchange = (e) => {
        currentLang = e.target.value;
        localStorage.setItem('widget-lang', currentLang);
        updateTime();
        renderCalendar();
        updateMoonPhase();
    };
    
    document.getElementById('fontSelect').onchange = (e) => {
        currentFont = e.target.value;
        localStorage.setItem('widget-font', currentFont);
        document.documentElement.style.setProperty('--font-main', currentFont);
        document.body.style.fontFamily = currentFont;
        // Update name font too
        document.getElementById('moonPhaseName').style.fontFamily = currentFont;
    };
    
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.onclick = () => {
            currentAccent = dot.dataset.color;
            localStorage.setItem('widget-accent', currentAccent);
            document.documentElement.style.setProperty('--accent-pink', currentAccent);
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        };
    });
}

function setupSlider() {
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.dot');
    
    function goToSlide(index) {
        slideIndex = index;
        slider.style.transform = `translateX(-${index * 50}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.index));
        });
    });

    let touchStartX = 0;
    const container = document.querySelector('.widget-container');
    
    container.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, false);
    container.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) goToSlide(1);
        if (touchEndX > touchStartX + 50) goToSlide(0);
    }, false);

    let isDragging = false;
    let startPos = 0;
    container.addEventListener('mousedown', e => { isDragging = true; startPos = e.pageX; });
    container.addEventListener('mouseup', e => {
        if (!isDragging) return;
        const endPos = e.pageX;
        const diff = startPos - endPos;
        if (diff > 50) goToSlide(1);
        if (diff < -50) goToSlide(0);
        isDragging = false;
    });
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

init();
