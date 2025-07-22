// =====================
// Vipul OS Portfolio Main JS
// =====================

// Boot Sequence Logic
window.addEventListener('DOMContentLoaded', () => {
    const boot = document.getElementById('boot-sequence');
    setTimeout(() => {
        boot.style.opacity = 0;
        setTimeout(() => boot.style.display = 'none', 1200);
    }, 2200); // Boot duration
});

// Parallax Stars Background
const starsCanvas = document.getElementById('stars-canvas');
if (starsCanvas) {
    const ctx = starsCanvas.getContext('2d');
    let stars = [];
    function resizeStars() {
        starsCanvas.width = window.innerWidth;
        starsCanvas.height = window.innerHeight;
        stars = Array.from({length: 120}, () => ({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            r: Math.random() * 1.2 + 0.3,
            o: Math.random() * 0.5 + 0.5,
            tw: Math.random() * Math.PI * 2
        }));
    }
    function drawStars() {
        ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
        for (const s of stars) {
            // Twinkle: vary opacity with a sine wave
            s.tw += 0.02 + Math.random() * 0.01;
            const twinkle = 0.5 + 0.5 * Math.sin(s.tw);
            ctx.globalAlpha = s.o * twinkle;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
            ctx.fillStyle = '#60AAD8';
            ctx.shadowColor = '#60AAD8';
            ctx.shadowBlur = 8;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    function animateStars() {
        for (const s of stars) {
            s.x += 0.01 * (s.r - 0.3);
            if (s.x > starsCanvas.width) s.x = 0;
        }
        drawStars();
        requestAnimationFrame(animateStars);
    }
    window.addEventListener('resize', resizeStars);
    resizeStars();
    animateStars();
}

// Dock Navigation & Window Logic
const dock = document.getElementById('dock');
const windows = document.querySelectorAll('.window');
const windowsContainer = document.getElementById('windows-container');
let zIndexCounter = 100;

function openWindow(winId) {
    const win = document.getElementById('window-' + winId);
    if (!win) return;
    win.style.display = 'flex';
    win.style.zIndex = ++zIndexCounter;
    win.classList.add('active');
    // Center window if not already moved
    if (!win.dataset.moved) {
        win.style.left = Math.max(20, (window.innerWidth - win.offsetWidth) / 2) + 'px';
        win.style.top = Math.max(40, (window.innerHeight - win.offsetHeight) / 2) + 'px';
    }
}
function closeWindow(winId) {
    const win = document.getElementById('window-' + winId);
    if (!win) return;
    win.style.display = 'none';
    win.classList.remove('active');
}
function minimizeWindow(winId) {
    const win = document.getElementById('window-' + winId);
    if (!win) return;
    win.style.display = 'none';
}
function maximizeWindow(winId) {
    const win = document.getElementById('window-' + winId);
    if (!win) return;
    win.style.left = '2vw';
    win.style.top = '2vh';
    win.style.width = '96vw';
    win.style.height = '90vh';
    win.dataset.moved = 'true';
}

dock.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-window]');
    if (!li) return;
    const winId = li.getAttribute('data-window');
    openWindow(winId);
    // Bounce animation
    li.classList.add('active');
    setTimeout(() => li.classList.remove('active'), 600);
});

// Window Controls
windows.forEach(win => {
    const winId = win.dataset.window;
    win.querySelector('.win-close').onclick = () => closeWindow(winId);
    win.querySelector('.win-min').onclick = () => minimizeWindow(winId);
    win.querySelector('.win-max').onclick = () => maximizeWindow(winId);
});

// Draggable Windows
windows.forEach(win => {
    const header = win.querySelector('.window-header');
    let offsetX, offsetY, dragging = false;
    header.addEventListener('mousedown', (e) => {
        dragging = true;
        win.style.zIndex = ++zIndexCounter;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
        win.dataset.moved = 'true';
    });
    document.addEventListener('mouseup', () => {
        dragging = false;
        document.body.style.userSelect = '';
    });
});

// Easter Egg: Show credits window on secret icon or shortcut
const easterIcon = document.querySelector('#dock li.easter-egg');
easterIcon.addEventListener('click', () => openWindow('easter'));
// Optionally: open credits with a keyboard shortcut (e.g., Ctrl+Shift+C)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        openWindow('easter');
    }
});

// === Unique Star Pixel that follows mouse (add pulse) ===
const starPixel = document.getElementById('star-pixel');
if (starPixel) {
  document.addEventListener('mousemove', (e) => {
    starPixel.style.transform = `translate(${e.clientX - 9}px, ${e.clientY - 9}px)`;
  });
  // Add pulse animation
  starPixel.animate([
    { transform: 'scale(1)', boxShadow: '0 0 24px 8px #60AAD8, 0 0 4px 2px #fff, 0 0 0 2px #1a2a3a' },
    { transform: 'scale(1.18)', boxShadow: '0 0 36px 16px #60AAD8, 0 0 8px 4px #fff, 0 0 0 2px #1a2a3a' },
    { transform: 'scale(1)', boxShadow: '0 0 24px 8px #60AAD8, 0 0 4px 2px #fff, 0 0 0 2px #1a2a3a' }
  ], {
    duration: 1800,
    iterations: Infinity
  });
}

// === Terminal in Contact Window (AI-like typing, friendlier responses) ===
const terminal = document.getElementById('contact-terminal');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');

// Friendlier, conversational AI responses
const terminalInfo = {
  help: `Hi! 👋 Here are some things you can ask me:\n• about\n• skills\n• projects\n• experience\n• awards\n• contact\n• resume\n• clear\n(Type a command and I'll help!)`,
  about: `I'm Vipul H Harihar, an AI engineer, Forbes 30U30 nominee, and tech enthusiast based in NYC. I love building intelligent systems that make a difference.`,
  skills: `Here are some of my favorite tools and skills:\nPython, Java, JavaScript, SQL, Bash, HTML/CSS\nFlask, Angular, Spring, React, Node.js\nAWS, GCP, RedHat, CI/CD, Docker\nNLP, LLMs, Data Pipelines, Security`,
  projects: `Check out my top projects:\n• Wind Turbine Blade Repurposing\n• VeeMusic\n• DJ Software POC\n• Medical Passport\n• TechHub\n(Type 'resume' for flagship solo projects)`,
  experience: `Here's a quick look at my journey:\nGenTrust: Chief AI Architect\nNYC-DDC: Infrastructure Fellow\nNYP-Columbia: Research Engineer\nIBM: Full Stack Dev\nIRSC: Software Eng Intern`,
  awards: `Some highlights I'm proud of:\nColumbia PDL Fellow\nIBM Python & Cognos\nGoogle Data Analytics\nAzure Fundamentals\nIBM Mastery Awards`,
  contact: `You can reach me at:\nvhh2105@columbia.edu\nLinkedIn: vipulhharihar\nLocation: Manhattan, NY`,
  resume: `Flagship Projects (solo, 4 months, <$50 infra):\nA: Portfolio oversight & compliance AI\nB: Generative advisor assistant\nC: Document summarizer dashboard\nD: Meeting insights engine\n(Download my full resume in the Resume window!)`,
  clear: ''
};

function printTerminalLine(text, prompt = true, isAI = false) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  if (prompt) {
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = 'vipul@portfolio:~$';
    line.appendChild(promptSpan);
  }
  if (isAI) {
    // Typing animation for AI output
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        line.appendChild(document.createTextNode(text[i]));
        i++;
        terminal.scrollTop = terminal.scrollHeight;
        setTimeout(typeChar, 12 + Math.random() * 30);
      }
    }
    setTimeout(typeChar, 200); // Short delay before AI starts typing
  } else {
    line.appendChild(document.createTextNode(text));
  }
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

if (terminalForm && terminalInput && terminal) {
  terminalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const cmd = terminalInput.value.trim().toLowerCase();
    if (!cmd) return;
    printTerminalLine(cmd, true);
    if (cmd in terminalInfo) {
      if (cmd === 'clear') {
        terminal.innerHTML = '';
      } else {
        printTerminalLine(terminalInfo[cmd], false, true);
      }
    } else {
      printTerminalLine("Sorry, I didn't understand that. Type 'help' for options!", false, true);
    }
    terminalInput.value = '';
  });
  // Print welcome/help on load
  printTerminalLine('Welcome to the Vipul AI Terminal! Type help for commands.', false, true);
}

// === Top Navbar Logic (Browser & OS detection) ===
const navbarUser = document.getElementById('navbar-user');
const navbarClock = document.getElementById('navbar-clock');
const navbarCalendar = document.getElementById('navbar-calendar');
const calendarDropdown = document.getElementById('calendar-dropdown');

function detectBrowserOS() {
  const ua = window.navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  let os = 'OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  return `${browser} on ${os}`;
}
if (navbarUser) {
  navbarUser.textContent = detectBrowserOS();
}
// Live clock
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  navbarClock.textContent = `⏰ ${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();
// Calendar dropdown
function getTodayString() {
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}
if (navbarCalendar && calendarDropdown) {
  navbarCalendar.onclick = function(e) {
    e.stopPropagation();
    calendarDropdown.textContent = getTodayString();
    calendarDropdown.style.display = calendarDropdown.style.display === 'block' ? 'none' : 'block';
  };
  document.addEventListener('click', function(e) {
    if (!navbarCalendar.contains(e.target)) {
      calendarDropdown.style.display = 'none';
    }
  });
}

// === Skills Ring Animation ===
const skillOrbit = document.querySelector('.skill-orbit');
const skillIcons = document.querySelectorAll('.skill-icon');
if (skillOrbit && skillIcons.length) {
  const N = skillIcons.length;
  let angle = 0;
  function animateRing() {
    angle += 0.0035; // speed
    for (let i = 0; i < N; ++i) {
      const theta = angle + (i * 2 * Math.PI / N);
      const r = skillOrbit.offsetWidth / 2 - 36;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      skillIcons[i].style.left = (skillOrbit.offsetWidth/2 + x - skillIcons[i].offsetWidth/2) + 'px';
      skillIcons[i].style.top = (skillOrbit.offsetHeight/2 + y - skillIcons[i].offsetHeight/2) + 'px';
    }
    requestAnimationFrame(animateRing);
  }
  animateRing();
}

// TODO: Add logic for resume download, contact terminal, window stacking, mobile snap, etc.
// Expand window content and micro-interactions as needed! 