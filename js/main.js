// =====================
// Vipul OS Portfolio Main JS
// =====================

// Elegant Boot Sequence Logic
window.addEventListener('DOMContentLoaded', () => {
    const boot = document.getElementById('boot-sequence');
    setTimeout(() => {
        boot.style.opacity = 0;
        setTimeout(() => {
            boot.style.display = 'none';
        }, 1200);
    }, 3000); // Elegant timing
});

// Enhanced Parallax Stars Background with Galaxy Effects
const starsCanvas = document.getElementById('stars-canvas');
if (starsCanvas) {
    const ctx = starsCanvas.getContext('2d');
    let stars = [];
    let particles = [];
    let nebulas = [];
    let trees = [];
    let animationId;
    
    function resizeCanvas() {
        starsCanvas.width = window.innerWidth;
        starsCanvas.height = window.innerHeight;
        initializeElements();
    }
    
    function initializeElements() {
        // Stars with different types
        stars = Array.from({length: 200}, () => ({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            r: Math.random() * 2 + 0.5,
            o: Math.random() * 0.8 + 0.2,
            tw: Math.random() * Math.PI * 2,
            color: Math.random() > 0.8 ? '#ff77c6' : Math.random() > 0.6 ? '#77dce2' : Math.random() > 0.4 ? '#0a84ff' : '#ffffff',
            type: Math.random() > 0.9 ? 'pulsar' : Math.random() > 0.7 ? 'binary' : 'normal',
            speed: Math.random() * 0.02 + 0.01
        }));
        
        // Floating particles
        particles = Array.from({length: 50}, () => ({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
            life: Math.random() * 100 + 50,
            maxLife: Math.random() * 100 + 50
        }));
        
        // Nebula clouds
        nebulas = Array.from({length: 8}, () => ({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            radius: Math.random() * 100 + 50,
            color: `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.1)`,
            pulse: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01
        }));
        
        // Tree-like structures
        trees = Array.from({length: 15}, () => ({
            x: Math.random() * starsCanvas.width,
            y: starsCanvas.height + 50,
            branches: Math.floor(Math.random() * 3) + 2,
            height: Math.random() * 80 + 40,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            color: `hsl(${Math.random() * 30 + 120}, 60%, 40%)`
        }));
    }
    
    function drawStars() {
        for (const s of stars) {
            // Twinkle effect
            s.tw += s.speed;
            const twinkle = 0.5 + 0.5 * Math.sin(s.tw);
            
            ctx.globalAlpha = s.o * twinkle;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = s.r * 4;
            ctx.fill();
            
            // Special effects for different star types
            if (s.type === 'pulsar') {
                ctx.globalAlpha = 0.3 * twinkle;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3, 0, 2 * Math.PI);
                ctx.fillStyle = s.color;
                ctx.fill();
            } else if (s.type === 'binary') {
                ctx.globalAlpha = 0.2 * twinkle;
                ctx.beginPath();
                ctx.arc(s.x + s.r * 2, s.y, s.r * 0.8, 0, 2 * Math.PI);
                ctx.fillStyle = s.color;
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
    
    function drawParticles() {
        for (const p of particles) {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // Wrap around edges
            if (p.x < 0) p.x = starsCanvas.width;
            if (p.x > starsCanvas.width) p.x = 0;
            if (p.y < 0) p.y = starsCanvas.height;
            if (p.y > starsCanvas.height) p.y = 0;
            
            // Reset particle if life is over
            if (p.life <= 0) {
                p.life = p.maxLife;
                p.x = Math.random() * starsCanvas.width;
                p.y = Math.random() * starsCanvas.height;
            }
            
            // Draw particle
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, 2 * Math.PI);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 2;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    function drawNebulas() {
        for (const n of nebulas) {
            n.pulse += n.speed;
            const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
            
            // Create gradient for nebula
            const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * pulse);
            gradient.addColorStop(0, n.color.replace('0.1', '0.3'));
            gradient.addColorStop(0.5, n.color);
            gradient.addColorStop(1, n.color.replace('0.1', '0'));
            
            ctx.globalAlpha = 0.3 * pulse;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius * pulse, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    function drawTrees() {
        for (const t of trees) {
            t.sway += t.swaySpeed;
            const swayOffset = Math.sin(t.sway) * 10;
            
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            
            // Draw trunk
            ctx.beginPath();
            ctx.moveTo(t.x + swayOffset, t.y);
            ctx.lineTo(t.x + swayOffset, t.y - t.height);
            ctx.stroke();
            
            // Draw branches
            for (let i = 0; i < t.branches; i++) {
                const branchY = t.y - (t.height * (i + 1) / (t.branches + 1));
                const branchLength = 20 + Math.random() * 15;
                const branchAngle = (Math.PI / 4) * (i % 2 === 0 ? 1 : -1);
                
                ctx.beginPath();
                ctx.moveTo(t.x + swayOffset, branchY);
                ctx.lineTo(
                    t.x + swayOffset + Math.cos(branchAngle) * branchLength,
                    branchY - Math.sin(branchAngle) * branchLength
                );
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
    }
    
    function drawGalaxy() {
        // Create spiral galaxy effect
        const centerX = starsCanvas.width * 0.2;
        const centerY = starsCanvas.height * 0.3;
        const time = Date.now() * 0.0001;
        
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 4 + time;
            const radius = (i / 100) * 150;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (x >= 0 && x <= starsCanvas.width && y >= 0 && y <= starsCanvas.height) {
                ctx.globalAlpha = 0.3 * (1 - i / 100);
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.fillStyle = `hsl(${200 + i * 0.5}, 70%, 60%)`;
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
    
    function animateBackground() {
        ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
        
        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, starsCanvas.width, starsCanvas.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(0.3, '#1a1a2e');
        gradient.addColorStop(0.7, '#16213e');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, starsCanvas.width, starsCanvas.height);
        
        // Draw nebulas first (background)
        drawNebulas();
        
        // Draw galaxy
        drawGalaxy();
        
        // Draw trees
        drawTrees();
        
        // Draw particles
        drawParticles();
        
        // Draw stars last (foreground)
        drawStars();
        
        // Add subtle mouse interaction
        if (mouseX && mouseY) {
            ctx.globalAlpha = 0.1;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 100, 0, 2 * Math.PI);
            ctx.fillStyle = '#00d4ff';
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        animationId = requestAnimationFrame(animateBackground);
    }
    
    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    starsCanvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    starsCanvas.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
    });
    
    // Initialize and start animation
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateBackground();
}

// === Clickable Vipul OS with Futuristic Animation ===
const navbarLeft = document.getElementById('navbar-left');
if (navbarLeft) {
    navbarLeft.addEventListener('click', () => {
        // Create futuristic particle effect
        createFuturisticEffect();
        
        // Show achievements showcase
        setTimeout(() => {
            showAchievementsShowcase();
        }, 500);
    });
}

function createFuturisticEffect() {
    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(particleContainer);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #00d4ff, #ff6b6b, #a855f7);
            border-radius: 50%;
            pointer-events: none;
            animation: futuristic-particle 2s ease-out forwards;
        `;
        
        // Random position around the navbar
        const startX = 100 + Math.random() * 200;
        const startY = 20 + Math.random() * 20;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = startY + (Math.random() - 0.5) * 400;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.setProperty('--end-x', endX + 'px');
        particle.style.setProperty('--end-y', endY + 'px');
        particle.style.setProperty('--delay', Math.random() * 0.5 + 's');
        
        particleContainer.appendChild(particle);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes futuristic-particle {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(calc(var(--end-x) - 100px), calc(var(--end-y) - 20px)) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove particles after animation
    setTimeout(() => {
        document.body.removeChild(particleContainer);
        document.head.removeChild(style);
    }, 2500);
}

// === Comprehensive Achievements Showcase ===
function showAchievementsShowcase() {
    const showcase = document.getElementById('achievements-showcase');
    if (showcase) {
        showcase.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAchievementsShowcase() {
    const showcase = document.getElementById('achievements-showcase');
    if (showcase) {
        showcase.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Category filtering for achievements
document.addEventListener('DOMContentLoaded', () => {
    const categoryFilters = document.querySelectorAll('.category-filter');
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.getAttribute('data-category');
            
            // Update active filter
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            // Filter cards
            achievementCards.forEach(card => {
                const cardCategories = card.getAttribute('data-category').split(' ');
                if (category === 'all' || cardCategories.includes(category)) {
                    card.style.display = 'block';
                    card.style.animation = 'achievement-card-appear 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Add animation for achievement cards
    const style = document.createElement('style');
    style.textContent = `
        @keyframes achievement-card-appear {
            0% {
                transform: translateY(20px);
                opacity: 0;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});

// Close achievements showcase when clicking outside
document.addEventListener('click', (e) => {
    const showcase = document.getElementById('achievements-showcase');
    if (showcase && showcase.classList.contains('active')) {
        if (!showcase.contains(e.target) && !navbarLeft.contains(e.target)) {
            closeAchievementsShowcase();
        }
    }
});

// === Enhanced Navbar Notifications (No auto-show) ===
const navbarCenter = document.getElementById('navbar-center');
let notificationCounter = 0;

const navbarNotifications = [
    {
        type: 'info',
        icon: '💼',
        message: 'Chief AI Architect at $5B firm'
    },
    {
        type: 'success',
        icon: '🏆',
        message: 'Forbes 30U30 Nominee'
    },
    {
        type: 'info',
        icon: '🎓',
        message: 'Columbia MSDS Graduate'
    },
    {
        type: 'achievement',
        icon: '⚡',
        message: '4 AI systems deployed'
    },
    {
        type: 'success',
        icon: '💰',
        message: '$2M+ annual savings'
    },
    {
        type: 'info',
        icon: '🌍',
        message: 'From India to NYC'
    },
    {
        type: 'achievement',
        icon: '🤖',
        message: '25+ data pipelines'
    },
    {
        type: 'success',
        icon: '🏅',
        message: 'Golden Graduate Marshal'
    }
];

function showNavbarNotification(notification) {
    if (!navbarCenter) return;
    
    const notif = document.createElement('div');
    notif.className = `navbar-notification ${notification.type}`;
    notif.innerHTML = `
        <span style="margin-right: 6px;">${notification.icon}</span>
        ${notification.message}
    `;
    
    navbarCenter.appendChild(notif);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.animation = 'navbar-notification-slide 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 300);
        }
    }, 4000);
    
    // Remove on click
    notif.addEventListener('click', () => {
        if (notif.parentNode) {
            notif.style.animation = 'navbar-notification-slide 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 300);
        }
    });
}

// Only show notifications when explicitly triggered, not automatically

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
    
    // Open window and track for achievements
    openWindow(winId);
    trackWindowOpening(winId);
    
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

// Enhanced Draggable Windows with bounds checking
windows.forEach(win => {
    const header = win.querySelector('.window-header');
    let offsetX, offsetY, dragging = false;
    
    header.addEventListener('mousedown', (e) => {
        dragging = true;
        win.style.zIndex = ++zIndexCounter;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        document.body.style.userSelect = 'none';
        header.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        
        // Calculate new position
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;
        
        // Get window and viewport dimensions
        const winRect = win.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Constrain to viewport bounds (leave 50px margin)
        const minLeft = -winRect.width + 100; // Allow partial off-screen but keep 100px visible
        const maxLeft = viewportWidth - 100;
        const minTop = 44; // Below navbar
        const maxTop = viewportHeight - 100; // Keep 100px visible at bottom
        
        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
        newTop = Math.max(minTop, Math.min(maxTop, newTop));
        
        win.style.left = newLeft + 'px';
        win.style.top = newTop + 'px';
        win.dataset.moved = 'true';
    });
    
    document.addEventListener('mouseup', () => {
        dragging = false;
        document.body.style.userSelect = '';
        header.style.cursor = 'grab';
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
  // Add subtle pulse animation
  starPixel.animate([
    { transform: 'scale(1)', opacity: '0.8' },
    { transform: 'scale(1.1)', opacity: '1' },
    { transform: 'scale(1)', opacity: '0.8' }
  ], {
    duration: 2000,
    iterations: Infinity,
    easing: 'ease-in-out'
  });
}

// === Terminal in Contact Window (AI-like typing, friendlier responses) ===
const terminal = document.getElementById('contact-terminal');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');

// ChatGPT-style intelligent responses
const terminalInfo = {
  help: `🤖 Welcome to Vipul's AI Assistant! I can help you explore his portfolio.\n\n💬 Try these commands:\n• about - Learn about Vipul\n• skills - Deep dive into expertise\n• projects - Explore innovations\n• experience - Career journey\n• awards - Achievements & recognition\n• contact - Get in touch\n• resume - Professional summary\n• joke - Need a laugh?\n• inspire - Get motivated\n• clear - Clean slate\n\n✨ Pro tip: I understand natural language too! Try "tell me about Vipul's AI work"`,
  
  about: `👨‍💻 Meet Vipul H Harihar\n\n🌟 Forbes 30 Under 30 nominee and AI innovator\n🎓 Columbia University Master's graduate (GPA: 3.6/4.0)\n🏢 Chief AI Architect at $5B investment firm\n💡 Built 4 production AI systems saving $2M+ annually\n🌍 From Dehradun, India to Manhattan, NYC\n\n"I believe in building AI that doesn't just work, but transforms how people work." - Vipul`,
  
  skills: `🚀 Vipul's Technical Arsenal\n\n🐍 Languages: Python (5+ yrs), JavaScript, Java, SQL, Bash\n🧠 AI/ML: Deep Learning, NLP, LLMs, Real-time AI\n☁️ Cloud: AWS, GCP, Docker, Microservices, CI/CD\n🌐 Full-Stack: React, Angular, Node.js, Flask, Spring\n🔒 Security: Encryption, Compliance, Secure deployments\n\n💪 Impact: Reduced hosting costs 33%, built systems for millions of users`,
  
  projects: `🚀 Innovation Showcase\n\n🌱 Wind Turbine Blade Repurposing - Sustainable AI for 70K+ blades in NY\n🎵 VeeMusic - Next-gen streaming with real-time recommendations\n🎧 DJ Software POC - Live audio analysis and mixing\n🏥 Medical Passport - Encrypted healthcare for cardiac patients\n🔧 TechHub - Developer resource aggregator\n\n✨ Each project solves real problems with cutting-edge tech!`,
  
  experience: `📈 Professional Journey\n\n🏢 GenTrust (Current) - Chief AI Architect\n   • Built 4 core AI systems for $5B firm\n   • Saved $2M+ through automation\n   • 25+ data pipelines deployed\n\n🏛️ NYC-DDC - Infrastructure Fellow\n   • Sustainable city planning with AI\n\n🏥 NYP-Columbia - Research Engineer\n   • Clinical AI tools development\n\n💼 IBM - Full Stack Developer\n   • Enterprise microservices\n   • 33% cost reduction achieved`,
  
  awards: `🏆 Recognition & Excellence\n\n🎓 Academic:\n   • Columbia Golden Graduate Marshal 2023\n   • Best Teaching Assistant Award (2022 & 2023)\n   • Academic Excellence Scholar (3 years)\n   • Gold Medalist (9.62/10.0 GPA)\n\n🌟 Professional:\n   • Columbia PDL Fellow\n   • IBM Certified Python & Cognos Developer\n   • Google Data Analytics Professional\n   • Microsoft Azure Fundamentals\n   • IBM AI Analyst Mastery`,
  
  contact: `📬 Let's Connect!\n\n📧 Email: vhh2105@columbia.edu\n🔗 LinkedIn: linkedin.com/in/vipulhharihar\n📍 Location: Manhattan, New York\n🌐 GitHub: github.com/virslaan\n\n💼 Open to:\n   • AI/ML opportunities\n   • Technical consulting\n   • Speaking engagements\n   • Collaboration on innovative projects\n\n✨ "I'm always excited to discuss how AI can solve real-world problems!"`,
  
  resume: `📄 Executive Summary\n\n🎯 Core Achievements:\n   • Product A: Portfolio oversight AI (real-time compliance)\n   • Product B: Generative advisor assistant (LLM-powered)\n   • Product C: Document intelligence dashboard\n   • Product D: Meeting insights engine\n\n💰 Business Impact: $2M+ annual savings\n🏗️ Infrastructure: <$50 monthly costs\n⏱️ Timeline: 4 months solo development\n\n📥 Download full resume from the Resume window!`,
  
  joke: `😄 Why do AI engineers prefer Python?\n\nBecause it's the only language that doesn't judge them for talking to their computer all day!\n\n🐍 Fun fact: Vipul has written over 100K lines of Python code. That's enough to wrap around the Earth... digitally! 🌍`,
  
  inspire: `✨ Daily Inspiration from Vipul's Journey\n\n"Every algorithm I write is a step toward a future where technology serves humanity, not the other way around."\n\n🚀 From a small town in India to Forbes 30U30 nominee in NYC\n💡 4 AI products deployed in production\n🎓 Top graduate from Columbia University\n\n🌟 Remember: Your next breakthrough is just one commit away!`,
  
  clear: '',
  
  // Natural language understanding
  'tell me about vipul': `👋 I'd love to tell you about Vipul! He's an incredible AI engineer who's making waves in the tech world. Check out 'about' for his full story!`,
  'ai work': `🤖 Vipul's AI work is fascinating! He's built 4 production AI systems that save millions. Type 'skills' or 'projects' to learn more!`,
  'columbia': `🎓 Vipul's time at Columbia was amazing! Golden Graduate Marshal, Best TA Award winner, and 3.6 GPA in Data Science. Type 'awards' for more!`,
  'new york': `🗽 Vipul loves NYC! From Columbia University to his current role in Manhattan, the city has been central to his journey.`
};

function printTerminalLine(text, prompt = true, isAI = false) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  
  if (prompt) {
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = 'vipul@ai-portfolio:~$';
    line.appendChild(promptSpan);
    line.appendChild(document.createTextNode(' ' + text));
  } else if (isAI) {
    // Create AI response with special styling
    const responseDiv = document.createElement('div');
    responseDiv.className = 'ai-response';
    
    // Typing animation for AI output
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        responseDiv.appendChild(document.createTextNode(text[i]));
        terminal.scrollTop = terminal.scrollHeight;
        i++;
        setTimeout(typeChar, 8 + Math.random() * 15); // Faster typing like ChatGPT
      }
    }
    
    line.appendChild(responseDiv);
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    
    setTimeout(typeChar, 300); // Brief pause before AI responds
    return;
  } else {
    line.appendChild(document.createTextNode(text));
  }
  
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

if (terminalForm && terminalInput && terminal) {
  terminalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const cmd = terminalInput.value.trim();
    const cmdLower = cmd.toLowerCase();
    if (!cmd) return;
    
    // Show user input
    printTerminalLine(cmd, true);
    
    // Process command
    if (cmdLower === 'clear') {
      setTimeout(() => {
        terminal.innerHTML = '';
        printTerminalLine('✨ Terminal cleared! How can I help you explore Vipul\'s portfolio?', false, true);
      }, 500);
    } else if (cmdLower in terminalInfo) {
      printTerminalLine(terminalInfo[cmdLower], false, true);
    } else {
      // Natural language processing
      let response = `🤔 Hmm, I'm not sure about "${cmd}". `;
      
      if (cmdLower.includes('hello') || cmdLower.includes('hi')) {
        response = `👋 Hello there! I'm Vipul's AI assistant. I'm here to help you explore his amazing portfolio and achievements. Type 'help' to see what I can do!`;
      } else if (cmdLower.includes('thanks') || cmdLower.includes('thank you')) {
        response = `😊 You're very welcome! I'm here whenever you need to learn more about Vipul's work. Is there anything specific you'd like to know?`;
      } else if (cmdLower.includes('impressive') || cmdLower.includes('amazing') || cmdLower.includes('great')) {
        response = `🌟 Thank you! Vipul has indeed accomplished some remarkable things. His journey from India to becoming a Forbes 30U30 nominee in NYC is truly inspiring!`;
      } else {
        response += `Try typing 'help' to see available commands, or ask me something like "tell me about Vipul's AI work"!`;
      }
      
      printTerminalLine(response, false, true);
    }
    
    terminalInput.value = '';
    terminalInput.placeholder = 'Ask me anything about Vipul...';
  });
  
  // Enhanced welcome message
  printTerminalLine('🚀 Welcome to Vipul\'s AI-Powered Portfolio Terminal!\n\n✨ I\'m your intelligent guide through his incredible journey from India to NYC, his Forbes 30U30 nomination, and his groundbreaking AI innovations.\n\n💡 Type "help" for commands or just chat with me naturally!', false, true);
}

// === Elegant Top Navbar Logic ===
const navbarClock = document.getElementById('navbar-clock');
const navbarCalendar = document.getElementById('navbar-calendar');
const calendarDropdown = document.getElementById('calendar-dropdown');
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

// === Enhanced Skills Section ===
const skillOrbit = document.querySelector('.skill-orbit');
const skillIcons = document.querySelectorAll('.skill-icon');
const skillsRing = document.querySelector('.skills-ring');
const skillsDetail = document.getElementById('skills-detail');
const expandBtn = document.getElementById('skills-expand-btn');
const skillsInstruction = document.getElementById('skills-instruction');

let skillsExpanded = false;
let skillAnimationId;

if (skillOrbit && skillIcons.length) {
  const N = skillIcons.length;
  let angle = 0;
  
  function animateRing() {
    if (!skillsExpanded) {
      angle += 0.0035; // normal speed
    } else {
      angle += 0.001; // slower when expanded
    }
    
    for (let i = 0; i < N; ++i) {
      const theta = angle + (i * 2 * Math.PI / N);
      const r = skillOrbit.offsetWidth / 2 - (skillsExpanded ? 30 : 36);
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      skillIcons[i].style.left = (skillOrbit.offsetWidth/2 + x - skillIcons[i].offsetWidth/2) + 'px';
      skillIcons[i].style.top = (skillOrbit.offsetHeight/2 + y - skillIcons[i].offsetHeight/2) + 'px';
    }
    skillAnimationId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Skills expansion functionality
  if (expandBtn) {
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSkillsDetail();
    });
  }

  // Also allow clicking the center to expand
  const skillsCenter = document.querySelector('.skills-center');
  if (skillsCenter) {
    skillsCenter.addEventListener('click', () => {
      toggleSkillsDetail();
    });
  }

  function toggleSkillsDetail() {
    skillsExpanded = !skillsExpanded;
    
    if (skillsExpanded) {
      skillsRing.classList.add('compressed');
      skillsDetail.classList.add('active');
      expandBtn.classList.add('rotated');
      skillsInstruction.textContent = 'Click again to close detailed view';
    } else {
      skillsRing.classList.remove('compressed');
      skillsDetail.classList.remove('active');
      expandBtn.classList.remove('rotated');
      skillsInstruction.textContent = 'Click the center to see detailed expertise!';
    }
  }
}

// === Live OS Achievement News Ticker ===
const achievementNews = [
    {
        icon: '🏆',
        message: 'Forbes 30 Under 30 Nominee 2026'
    },
    {
        icon: '💼',
        message: 'Chief AI Architect/ Lead SWE at $5B AUM Wealth management firm'
    },
    {
        icon: '🎓',
        message: 'Columbia Golden Graduate Marshal 2023'
    },
    {
        icon: '💰',
        message: '$2M+ annual savings through advanced algorithms'
    },
    {
        icon: '🌍',
        message: 'From India to NYC - Global journey'
    },
    {
        icon: '🤖',
        message: '25+ automated serverless data pipelines deployed'
    },
    {
        icon: '🏅',
        message: 'Columbia University Best TA Award 2022 & 2023'
    },
    {
        icon: '⚡',
        message: 'Product A: Portfolios oversight AI'
    },
    {
        icon: '🧠',
        message: 'Product B: Generative advisor assistant'
    },
    {
        icon: '📊',
        message: 'Product C: Document intelligence'
    },
    {
        icon: '🎯',
        message: 'Product D: Meeting insights engine'
    },
    {
        icon: '🔒',
        message: 'Medical Passport - Healthcare system'
    },
    {
        icon: '🌱',
        message: 'Wind Turbine AI - 70K+ blades'
    },
    {
        icon: '🎵',
        message: 'VeeMusic - AI streaming platform'
    },
    {
        icon: '🎧',
        message: 'DJ Software - Live audio analysis'
    },
    {
        icon: '🔧',
        message: 'TechHub - Developer resources'
    },
    {
        icon: '☁️',
        message: 'AWS, GCP, Docker expert'
    },
    {
        icon: '🐍',
        message: 'Python, Deep Learning, NLP, LLMs'
    },
    {
        icon: '🏛️',
        message: 'NYC-DDC Infrastructure Fellow'
    },
    {
        icon: '🏥',
        message: 'NYP-Columbia Research Engineer'
    },
    {
        icon: '💻',
        message: 'IBM - 33% cost reduction'
    }
];

let currentNewsIndex = 0;
let newsTickerInterval;

function startNewsTicker() {
    // Clear any existing interval
    if (newsTickerInterval) {
        clearInterval(newsTickerInterval);
    }
    
    // Start the news ticker
    newsTickerInterval = setInterval(() => {
        showNewsAlert();
    }, 15000); // Every 15 seconds
    
    // Show first news immediately
    setTimeout(() => {
        showNewsAlert();
    }, 2000);
}

function showNewsAlert() {
    if (!navbarCenter) return;
    
    const news = achievementNews[currentNewsIndex];
    const newsAlert = document.createElement('div');
    newsAlert.className = 'news-alert';
    newsAlert.innerHTML = `
        <span class="news-icon">${news.icon}</span>
        <span class="news-text">${news.message}</span>
        <span class="news-timestamp">${new Date().toLocaleTimeString()}</span>
    `;
    
    navbarCenter.appendChild(newsAlert);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (newsAlert.parentNode) {
            newsAlert.style.animation = 'news-alert-fade-out 0.5s ease-out forwards';
            setTimeout(() => {
                if (newsAlert.parentNode) {
                    newsAlert.parentNode.removeChild(newsAlert);
                }
            }, 500);
        }
    }, 8000);
    
    // Remove on click
    newsAlert.addEventListener('click', () => {
        if (newsAlert.parentNode) {
            newsAlert.style.animation = 'news-alert-fade-out 0.3s ease-out forwards';
            setTimeout(() => {
                if (newsAlert.parentNode) {
                    newsAlert.parentNode.removeChild(newsAlert);
                }
            }, 300);
        }
    });
    
    // Move to next news item
    currentNewsIndex = (currentNewsIndex + 1) % achievementNews.length;
}

// Start the news ticker when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        startNewsTicker();
    }, 5000); // Start after 5 seconds to let boot sequence complete
});

// Track window openings (for potential future use)
function trackWindowOpening(winId) {
    // Keep this function for potential future enhancements
    console.log(`Window opened: ${winId}`);
} 

// =====================
// Cinematic Notifications Panel System
// =====================

// Global notifications state
let notifications = [];
let currentTab = 'all';

// Professional Timeline - Full-Stack Focus
const sampleNotifications = [
    {
        id: 1,
        type: 'current',
        title: '💼 Chief AI Architect - GenTrust',
        message: 'Leading full-stack AI systems: 4 core products, 25+ data pipelines, real-time integrations.',
        time: 'Aug 2022 - Present',
        icon: 'fa-solid fa-robot',
        category: 'timeline'
    },
    {
        id: 2,
        type: 'achievement',
        title: '🌟 Forbes 30 Under 30 Nominee',
        message: 'Recognized for AI innovation in finance technology.',
        time: '2024',
        icon: 'fa-solid fa-star',
        category: 'achievements'
    },
    {
        id: 3,
        type: 'education',
        title: '🎓 Columbia University MSDS',
        message: 'Master of Science in Data Science, 3.6/4.0 GPA. Golden Graduate Marshal 2023.',
        time: '2022',
        icon: 'fa-solid fa-graduation-cap',
        category: 'timeline'
    },
    {
        id: 4,
        type: 'project',
        title: '🏛️ NYC Infrastructure Fellow',
        message: 'Wind energy sustainability modeling for 70K+ turbine blades.',
        time: 'Sep-Dec 2022',
        icon: 'fa-solid fa-leaf',
        category: 'timeline'
    },
    {
        id: 5,
        type: 'project',
        title: '🔒 Healthcare Security Project',
        message: 'Encrypted medical passport system for pediatric cardiac patients.',
        time: 'May-Dec 2022',
        icon: 'fa-solid fa-shield-halved',
        category: 'timeline'
    },
    {
        id: 6,
        type: 'experience',
        title: '💻 IBM Full Stack Developer',
        message: 'Financial infrastructure modernization, 33% cost reduction.',
        time: 'Feb 2020 - Aug 2021',
        icon: 'fa-solid fa-code',
        category: 'timeline'
    },
    {
        id: 7,
        type: 'skills',
        title: '🛠️ Full-Stack Development',
        message: 'Python, React, Node.js, AWS, Docker, real-time systems, distributed architecture.',
        time: 'Core skills',
        icon: 'fa-solid fa-code',
        category: 'skills'
    },
    {
        id: 8,
        type: 'contact',
        title: '📞 Contact Vipul H. Harihar',
        message: 'Manhattan, NY • Full-stack development & project leadership roles.',
        time: 'Available',
        icon: 'fa-solid fa-phone',
        category: 'contact'
    }
];

// Initialize notifications
function initializeNotifications() {
    notifications = [...sampleNotifications];
    updateNotificationCount();
    renderNotifications();
}

// Toggle notifications panel
function toggleNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    const isActive = panel.classList.contains('active');
    
    if (!isActive) {
        // Add cinematic entrance effect
        createPanelEntranceEffect();
        
        // Show panel with delay for effect
        setTimeout(() => {
            panel.classList.add('active');
            renderNotifications();
        }, 200);
    } else {
        closeNotificationsPanel();
    }
}

// Create cinematic entrance effect
function createPanelEntranceEffect() {
    // Create particle effect
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(particleContainer);
    
    // Create entrance particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: linear-gradient(45deg, #00d4ff, #a855f7);
            border-radius: 50%;
            pointer-events: none;
            animation: panel-entrance-particle 1.5s ease-out forwards;
        `;
        
        // Random position
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        particleContainer.appendChild(particle);
    }
    
    // Remove particles after animation
    setTimeout(() => {
        document.body.removeChild(particleContainer);
    }, 1500);
}

// Close notifications panel
function closeNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.remove('active');
}

// Render notifications based on current tab
function renderNotifications() {
    const container = document.getElementById('notifications-list');
    const filteredNotifications = currentTab === 'all' 
        ? notifications 
        : notifications.filter(n => n.category === currentTab);
    
    container.innerHTML = '';
    
    if (filteredNotifications.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
                <i class="fa-solid fa-bell-slash" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <div style="font-size: 1.1rem; margin-bottom: 8px;">No notifications</div>
                <div style="font-size: 0.9rem;">You're all caught up!</div>
            </div>
        `;
        return;
    }
    
    filteredNotifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        container.appendChild(notificationElement);
    });
    
    updateNotificationStats();
}

// Create individual notification element
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = 'notification-item';
    element.dataset.id = notification.id;
    
    // Special handling for contact notification
    if (notification.category === 'contact') {
        element.innerHTML = `
            <div class="notification-header">
                <div style="display: flex; align-items: center;">
                    <div class="notification-icon ${notification.type}">
                        <i class="${notification.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">
                            <i class="fa-regular fa-clock"></i>
                            ${notification.time}
                        </div>
                    </div>
                </div>
            </div>
            <div class="notification-actions">
                <button class="notification-action-btn" onclick="showContactOptions()">
                    <i class="fa-solid fa-share"></i>
                    Contact Options
                </button>
                <button class="notification-action-btn" onclick="copyContactInfo()">
                    <i class="fa-solid fa-copy"></i>
                    Copy Info
                </button>
            </div>
        `;
    } else {
        element.innerHTML = `
            <div class="notification-header">
                <div style="display: flex; align-items: center;">
                    <div class="notification-icon ${notification.type}">
                        <i class="${notification.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">
                            <i class="fa-regular fa-clock"></i>
                            ${notification.time}
                        </div>
                    </div>
                </div>
            </div>
            <div class="notification-actions">
                <button class="notification-action-btn" onclick="markAsRead(${notification.id})">
                    <i class="fa-solid fa-check"></i>
                    Mark Read
                </button>
                <button class="notification-action-btn" onclick="deleteNotification(${notification.id})">
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>
            </div>
        `;
    }
    
    // Add click animation
    element.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-action-btn')) {
            element.style.transform = 'scale(0.98)';
            setTimeout(() => {
                element.style.transform = '';
            }, 150);
        }
    });
    
    return element;
}

// Mark notification as read
function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationCount();
        showSuccessMessage('Notification marked as read');
    }
}

// Delete notification
function deleteNotification(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.style.animation = 'notification-slide-out 0.3s ease-in forwards';
            setTimeout(() => {
                notifications.splice(index, 1);
                updateNotificationCount();
                renderNotifications();
                showSuccessMessage('Notification deleted');
            }, 300);
        }
    }
}

// Clear all notifications
function clearAllNotifications() {
    if (notifications.length === 0) {
        showWarningMessage('No notifications to clear');
        return;
    }
    
    const container = document.getElementById('notifications-list');
    const elements = container.querySelectorAll('.notification-item');
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.animation = 'notification-slide-out 0.3s ease-in forwards';
        }, index * 50);
    });
    
    setTimeout(() => {
        notifications = [];
        updateNotificationCount();
        renderNotifications();
        showSuccessMessage('All notifications cleared');
    }, elements.length * 50 + 300);
}

// Update notification count
function updateNotificationCount() {
    const countElement = document.getElementById('notification-count');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        countElement.textContent = unreadCount;
        countElement.style.display = 'flex';
    } else {
        countElement.style.display = 'none';
    }
}

// Update notification stats
function updateNotificationStats() {
    const statsElement = document.getElementById('total-notifications');
    const filteredCount = currentTab === 'all' 
        ? notifications.length 
        : notifications.filter(n => n.category === currentTab).length;
    statsElement.textContent = filteredCount;
}

// Tab switching functionality
function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Re-render notifications
    renderNotifications();
}

// Add new notification
function addNotification(notification) {
    notification.id = Date.now();
    notification.time = 'Just now';
    notification.read = false;
    
    notifications.unshift(notification);
    updateNotificationCount();
    
    if (document.getElementById('notifications-panel').classList.contains('active')) {
        renderNotifications();
    }
    
    // Show toast notification
    showToastNotification(notification);
}

// Show toast notification
function showToastNotification(notification) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        padding: 16px;
        color: var(--text-primary);
        z-index: 10001;
        max-width: 300px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: toast-slide-in 0.5s ease-out;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div class="notification-icon ${notification.type}" style="width: 32px; height: 32px; font-size: 1rem;">
                <i class="${notification.icon}"></i>
            </div>
            <div>
                <div style="font-weight: 700; margin-bottom: 4px;">${notification.title}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${notification.message}</div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 0.8rem; color: var(--primary);">
            Click to view details →
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Hover effect
    toast.addEventListener('mouseenter', () => {
        toast.style.transform = 'translateX(-5px) scale(1.02)';
        toast.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    });
    
    toast.addEventListener('mouseleave', () => {
        toast.style.transform = 'translateX(0) scale(1)';
        toast.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    });
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        toast.style.animation = 'toast-slide-out 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 8000);
    
    // Click to open panel
    toast.addEventListener('click', () => {
        if (!document.getElementById('notifications-panel').classList.contains('active')) {
            toggleNotificationsPanel();
        }
        // Remove toast when clicked
        toast.style.animation = 'toast-slide-out 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    });
}

// Success message
function showSuccessMessage(message) {
    showToastNotification({
        type: 'system',
        title: '✅ Success',
        message: message,
        icon: 'fa-solid fa-check-circle',
        category: 'system'
    });
}

// Warning message
function showWarningMessage(message) {
    showToastNotification({
        type: 'warning',
        title: '⚠️ Warning',
        message: message,
        icon: 'fa-solid fa-exclamation-triangle',
        category: 'system'
    });
}

// Contact sharing functions
function showContactOptions() {
    const contactModal = document.createElement('div');
    contactModal.className = 'contact-modal';
    contactModal.innerHTML = `
        <div class="contact-modal-content">
            <div class="contact-modal-header">
                <h3>📞 Contact Vipul H. Harihar</h3>
                <button class="contact-modal-close" onclick="closeContactModal()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fa-solid fa-phone"></i>
                    <span>+1 (917) 214-5091</span>
                    <button onclick="copyToClipboard('+1 (917) 214-5091')" class="copy-btn">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
                <div class="contact-item">
                    <i class="fa-solid fa-envelope"></i>
                    <span>vhh2105@columbia.edu</span>
                    <button onclick="copyToClipboard('vhh2105@columbia.edu')" class="copy-btn">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
                <div class="contact-item">
                    <i class="fa-solid fa-map-marker-alt"></i>
                    <span>Manhattan, New York, NY</span>
                    <button onclick="copyToClipboard('Manhattan, New York, NY')" class="copy-btn">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
                <div class="contact-item">
                    <i class="fa-brands fa-linkedin"></i>
                    <span>linkedin.com/in/vipulhharihar</span>
                    <button onclick="openLinkedIn()" class="copy-btn">
                        <i class="fa-solid fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
            <div class="contact-actions">
                <button onclick="generateQRCode()" class="contact-action-btn">
                    <i class="fa-solid fa-qrcode"></i>
                    Generate QR Code
                </button>
                <button onclick="downloadVCard()" class="contact-action-btn">
                    <i class="fa-solid fa-download"></i>
                    Download vCard
                </button>
                <button onclick="shareContact()" class="contact-action-btn">
                    <i class="fa-solid fa-share-alt"></i>
                    Share Contact
                </button>
            </div>
            <div id="qr-code-container" style="display: none; text-align: center; margin-top: 20px;">
                <canvas id="qr-canvas"></canvas>
                <button onclick="downloadQR()" class="contact-action-btn" style="margin-top: 10px;">
                    <i class="fa-solid fa-download"></i>
                    Download QR
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(contactModal);
    setTimeout(() => contactModal.classList.add('active'), 10);
}

function closeContactModal() {
    const modal = document.querySelector('.contact-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessMessage('Copied to clipboard!');
    }).catch(() => {
        showWarningMessage('Failed to copy to clipboard');
    });
}

function copyContactInfo() {
    const contactInfo = `Vipul H. Harihar
Phone: +1 (917) 214-5091
Email: vhh2105@columbia.edu
Location: Manhattan, New York, NY
LinkedIn: linkedin.com/in/vipulhharihar
Available for: Full-stack development & project leadership roles`;
    
    copyToClipboard(contactInfo);
}

function openLinkedIn() {
    window.open('https://www.linkedin.com/in/vipulhharihar', '_blank');
}

function generateQRCode() {
    const contactData = `BEGIN:VCARD
VERSION:3.0
FN:Vipul H. Harihar
TEL:+1-917-214-5091
EMAIL:vhh2105@columbia.edu
ADR:;;Manhattan;New York;NY;10032;USA
URL:https://www.linkedin.com/in/vipulhharihar
NOTE:Full-stack development & project leadership roles
END:VCARD`;
    
    // Simple QR code generation (you can use a library like qrcode.js for better results)
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Create a simple QR-like pattern (for demo purposes)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, 10, 180, 180);
    ctx.fillStyle = '#000';
    ctx.fillRect(20, 20, 160, 160);
    
    document.getElementById('qr-code-container').style.display = 'block';
}

function downloadQR() {
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    link.download = 'vipul-contact-qr.png';
    link.href = canvas.toDataURL();
    link.click();
}

function downloadVCard() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Vipul H. Harihar
TEL:+1-917-214-5091
EMAIL:vhh2105@columbia.edu
ADR:;;Manhattan;New York;NY;10032;USA
URL:https://www.linkedin.com/in/vipulhharihar
NOTE:Full-stack development & project leadership roles
END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vipul-harihar.vcf';
    link.click();
    window.URL.revokeObjectURL(url);
}

function shareContact() {
    if (navigator.share) {
        navigator.share({
            title: 'Vipul H. Harihar - Contact Info',
            text: 'Full-stack developer & project leader',
            url: window.location.href
        });
    } else {
        copyContactInfo();
    }
}

// Show left-side notification for sharing contact
function showLeftSideNotification(notification) {
    const leftNotification = document.createElement('div');
    leftNotification.className = 'left-notification';
    leftNotification.style.cssText = `
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        padding: 20px;
        color: var(--text-primary);
        z-index: 10001;
        max-width: 280px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: left-notification-slide-in 0.5s ease-out;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Nunito', sans-serif;
    `;
    
    leftNotification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #00d4ff, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="${notification.icon}"></i>
            </div>
            <div>
                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 4px;">${notification.title}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${notification.message}</div>
            </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button class="share-btn" style="flex: 1; background: linear-gradient(135deg, #00d4ff, #0099cc); border: none; border-radius: 8px; padding: 8px 12px; color: #0a0a0f; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;">
                <i class="fa-solid fa-share"></i> Share
            </button>
            <button class="close-btn" style="background: rgba(255, 255, 255, 0.1); border: none; border-radius: 8px; padding: 8px 12px; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; transition: all 0.2s;">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(leftNotification);
    
    // Hover effects
    leftNotification.addEventListener('mouseenter', () => {
        leftNotification.style.transform = 'translateY(-50%) scale(1.02)';
        leftNotification.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    });
    
    leftNotification.addEventListener('mouseleave', () => {
        leftNotification.style.transform = 'translateY(-50%) scale(1)';
        leftNotification.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    });
    
    // Share button functionality
    const shareBtn = leftNotification.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareContact();
        showSuccessMessage('Contact information shared!');
        removeLeftNotification(leftNotification);
    });
    
    // Close button functionality
    const closeBtn = leftNotification.querySelector('.close-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeLeftNotification(leftNotification);
    });
    
    // Click outside to close
    leftNotification.addEventListener('click', () => {
        removeLeftNotification(leftNotification);
    });
    
    // Auto remove after 15 seconds
    setTimeout(() => {
        removeLeftNotification(leftNotification);
    }, 15000);
    
    return leftNotification;
}

// Remove left notification with animation
function removeLeftNotification(notification) {
    notification.style.animation = 'left-notification-slide-out 0.3s ease-in forwards';
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// Function to show contact share notification
function showContactShareNotification() {
    showLeftSideNotification({
        title: '📞 Share Contact',
        message: 'Want to connect? Share Vipul\'s contact information with your network!',
        icon: 'fa-solid fa-address-card'
    });
}

// Show left-side skills and achievements showcase as a proper sidebar
function showLeftSideSkillsPanel() {
    // Remove any existing left panel
    const existingPanel = document.querySelector('.left-skills-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const leftSidebar = document.createElement('div');
    leftSidebar.className = 'left-sidebar';
    leftSidebar.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 320px;
        height: 100vh;
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
        backdrop-filter: blur(25px);
        border-right: 2px solid rgba(0, 212, 255, 0.3);
        color: var(--text-primary);
        z-index: 10001;
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Nunito', sans-serif;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--primary) transparent;
    `;
    
    leftSidebar.innerHTML = `
        <div style="padding: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #00d4ff, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fa-solid fa-star"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 2px;">Vipul's Expertise</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Chief AI Architect & Full-Stack Engineer</div>
                    </div>
                </div>
                <button class="close-sidebar-btn" style="background: rgba(255, 255, 255, 0.1); border: none; border-radius: 8px; padding: 8px; color: var(--text-primary); cursor: pointer; font-size: 1rem; transition: all 0.2s;">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div class="expertise-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <div style="background: rgba(0, 212, 255, 0.1); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(0, 212, 255, 0.2);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #00d4ff; margin-bottom: 2px;">4</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">AI Systems</div>
                </div>
                <div style="background: rgba(168, 85, 247, 0.1); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(168, 85, 247, 0.2);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #a855f7; margin-bottom: 2px;">$2M+</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Annual Savings</div>
                </div>
                <div style="background: rgba(81, 207, 102, 0.1); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(81, 207, 102, 0.2);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #51cf66; margin-bottom: 2px;">25+</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Data Pipelines</div>
                </div>
                <div style="background: rgba(255, 212, 59, 0.1); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(255, 212, 59, 0.2);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #ffd43b; margin-bottom: 2px;">3.6</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Columbia GPA</div>
                </div>
            </div>
            
            <div class="skills-categories">
                <div class="skill-category-item" style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.03)); border-radius: 12px; border-left: 3px solid #00d4ff;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <i class="fa-solid fa-robot" style="color: #00d4ff; font-size: 1rem;"></i>
                        <h4 style="margin: 0; font-size: 1rem; color: #00d4ff; font-weight: 600;">🤖 AI & Machine Learning</h4>
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                        <li style="margin-bottom: 4px;">Built 4 core AI systems at $5B investment firm</li>
                        <li style="margin-bottom: 4px;">Deep Learning, NLP, LLMs, Real-time AI</li>
                        <li style="margin-bottom: 0;">Forbes 30 Under 30 Nominee</li>
                    </ul>
                </div>
                
                <div class="skill-category-item" style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.03)); border-radius: 12px; border-left: 3px solid #a855f7;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <i class="fa-solid fa-code" style="color: #a855f7; font-size: 1rem;"></i>
                        <h4 style="margin: 0; font-size: 1rem; color: #a855f7; font-weight: 600;">💻 Full-Stack Development</h4>
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                        <li style="margin-bottom: 4px;">Python, JavaScript, Java, React, Angular</li>
                        <li style="margin-bottom: 4px;">25+ data pipelines deployed</li>
                        <li style="margin-bottom: 0;">33% cost reduction at IBM</li>
                    </ul>
                </div>
                
                <div class="skill-category-item" style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 107, 107, 0.03)); border-radius: 12px; border-left: 3px solid #ff6b6b;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <i class="fa-solid fa-cloud" style="color: #ff6b6b; font-size: 1rem;"></i>
                        <h4 style="margin: 0; font-size: 1rem; color: #ff6b6b; font-weight: 600;">☁️ Cloud & Infrastructure</h4>
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                        <li style="margin-bottom: 4px;">AWS, GCP, Docker, CI/CD</li>
                        <li style="margin-bottom: 4px;">Secure cloud deployments</li>
                        <li style="margin-bottom: 0;">Healthcare & Finance compliance</li>
                    </ul>
                </div>
                
                <div class="skill-category-item" style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, rgba(81, 207, 102, 0.08), rgba(81, 207, 102, 0.03)); border-radius: 12px; border-left: 3px solid #51cf66;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <i class="fa-solid fa-award" style="color: #51cf66; font-size: 1rem;"></i>
                        <h4 style="margin: 0; font-size: 1rem; color: #51cf66; font-weight: 600;">🏆 Awards & Recognition</h4>
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                        <li style="margin-bottom: 4px;">Columbia Golden Graduate Marshal 2023</li>
                        <li style="margin-bottom: 4px;">Best Teaching Assistant Award</li>
                        <li style="margin-bottom: 0;">Gold Medalist (9.62/10.0 GPA)</li>
                    </ul>
                </div>
                
                <div class="skill-category-item" style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, rgba(255, 212, 59, 0.08), rgba(255, 212, 59, 0.03)); border-radius: 12px; border-left: 3px solid #ffd43b;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <i class="fa-solid fa-briefcase" style="color: #ffd43b; font-size: 1rem;"></i>
                        <h4 style="margin: 0; font-size: 1rem; color: #ffd43b; font-weight: 600;">💼 Leadership & Impact</h4>
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                        <li style="margin-bottom: 4px;">$2M+ annual savings through automation</li>
                        <li style="margin-bottom: 4px;">NYC Infrastructure Fellow</li>
                        <li style="margin-bottom: 0;">Medical passport for cardiac patients</li>
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="showContactShareNotification()" style="background: linear-gradient(135deg, #00d4ff, #0099cc); border: none; border-radius: 10px; padding: 10px 16px; color: #0a0a0f; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.3s ease;">
                        <i class="fa-solid fa-share"></i> Share Contact
                    </button>
                    <button onclick="openWindow('resume')" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; border-radius: 10px; padding: 10px 16px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.3s ease;">
                        <i class="fa-solid fa-file-arrow-down"></i> Resume
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(leftSidebar);
    
    // Slide in the sidebar
    setTimeout(() => {
        leftSidebar.style.transform = 'translateX(0)';
    }, 10);
    
    // Close button functionality
    const closeBtn = leftSidebar.querySelector('.close-sidebar-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeLeftSidebar(leftSidebar);
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!leftSidebar.contains(e.target) && e.target !== document.querySelector('.share-contact-icon')) {
            removeLeftSidebar(leftSidebar);
        }
    });
    
    // Auto remove after 60 seconds
    setTimeout(() => {
        removeLeftSidebar(leftSidebar);
    }, 60000);
    
    return leftSidebar;
}

// Remove left sidebar with animation
function removeLeftSidebar(sidebar) {
    sidebar.style.transform = 'translateX(-100%)';
    setTimeout(() => {
        if (sidebar.parentNode) {
            document.body.removeChild(sidebar);
        }
    }, 400);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize notifications
    initializeNotifications();
    
    // Add tab click listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notifications-panel');
        
        if (panel.classList.contains('active') && 
            !panel.contains(e.target)) {
            closeNotificationsPanel();
        }
    });
    
    // Show initial notifications automatically
    setTimeout(() => {
        addNotification({
            type: 'current',
            title: '💼 Chief AI Architect - GenTrust',
            message: 'Leading full-stack AI systems: 4 core products, 25+ data pipelines, real-time integrations.',
            icon: 'fa-solid fa-robot',
            category: 'timeline'
        });
    }, 2000);
    
    setTimeout(() => {
        addNotification({
            type: 'achievement',
            title: '🌟 Forbes 30 Under 30 Nominee',
            message: 'Recognized for AI innovation in finance technology.',
            icon: 'fa-solid fa-star',
            category: 'achievements'
        });
    }, 5000);
    
    setTimeout(() => {
        addNotification({
            type: 'contact',
            title: '🛠️ Available for Full-Stack Projects',
            message: 'Vipul is open to full-stack development and project leadership roles. Click for contact options.',
            icon: 'fa-solid fa-code',
            category: 'contact'
        });
    }, 8000);
    
    // Show comprehensive expertise panel after 12 seconds
    setTimeout(() => {
        showVipulExpertisePanel();
    }, 12000);
});

    // Add hover effects for share button
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('button') && e.target.closest('button').textContent.includes('Share Contact Info')) {
            const btn = e.target.closest('button');
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 4px 16px rgba(0, 212, 255, 0.4)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('button') && e.target.closest('button').textContent.includes('Share Contact Info')) {
            const btn = e.target.closest('button');
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 2px 8px rgba(0, 212, 255, 0.3)';
        }
    });

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes panel-entrance-particle {
        0% {
            opacity: 1;
            transform: scale(1) translateX(0);
        }
        100% {
            opacity: 0;
            transform: scale(0) translateX(-100px);
        }
    }
    
    @keyframes notification-slide-out {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    @keyframes toast-slide-in {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes toast-slide-out {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes left-notification-slide-in {
        from {
            opacity: 0;
            transform: translateY(-50%) translateX(-100%);
        }
        to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
        }
    }
    
    @keyframes left-notification-slide-out {
        from {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
        }
        to {
            opacity: 0;
            transform: translateY(-50%) translateX(-100%);
        }
    }

    @keyframes left-panel-slide-in {
        from {
            opacity: 0;
            transform: translateY(-50%) translateX(-100%);
        }
        to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
        }
    }

    @keyframes left-panel-slide-out {
        from {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
        }
        to {
            opacity: 0;
            transform: translateY(-50%) translateX(-100%);
        }
    }
    
    @keyframes pulse-glow {
        0%, 100% {
            box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);
        }
        50% {
            box-shadow: 0 4px 24px rgba(0, 212, 255, 0.5);
        }
    }
    
    @keyframes progress-fill {
        from {
            width: 0%;
        }
        to {
            width: var(--progress-width);
        }
    }
    
    /* Enhanced floating animations */
    @keyframes float-gentle {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
        }
        33% {
            transform: translateY(-10px) rotate(1deg);
        }
        66% {
            transform: translateY(-5px) rotate(-1deg);
        }
    }
    
    @keyframes float-slow {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-15px);
        }
    }
    
    @keyframes glow-pulse {
        0%, 100% {
            filter: brightness(1) drop-shadow(0 0 5px rgba(0, 212, 255, 0.3));
        }
        50% {
            filter: brightness(1.2) drop-shadow(0 0 15px rgba(0, 212, 255, 0.6));
        }
    }
    
    @keyframes sparkle {
        0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
    }
    
    @keyframes wave {
        0%, 100% {
            transform: translateX(0);
        }
        50% {
            transform: translateX(2px);
        }
    }
    
    @keyframes breathe {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    /* Apply floating animations to various elements */
    #vipul-signature {
        animation: float-gentle 6s ease-in-out infinite;
    }
    
    #star-pixel {
        animation: float-slow 8s ease-in-out infinite;
    }
    
    .window-header {
        animation: glow-pulse 4s ease-in-out infinite;
    }
    
    #dock li .icon-bubble {
        animation: breathe 3s ease-in-out infinite;
    }
    
    #dock li:nth-child(odd) .icon-bubble {
        animation-delay: 1.5s;
    }
    
    /* Enhanced hover effects */
    .window:hover {
        animation: glow-pulse 2s ease-in-out infinite;
    }
    
    .achievement-card:hover {
        animation: float-gentle 2s ease-in-out infinite;
    }
    
    /* Sparkle effect for special elements */
    .sparkle {
        position: relative;
    }
    
    .sparkle::before {
        content: '✨';
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 1.2rem;
        animation: sparkle 3s ease-in-out infinite;
        pointer-events: none;
    }
    
    /* Wave animation for text */
    .wave-text {
        display: inline-block;
        animation: wave 4s ease-in-out infinite;
    }
    
    .wave-text:nth-child(2) { animation-delay: 0.5s; }
    .wave-text:nth-child(3) { animation-delay: 1s; }
    .wave-text:nth-child(4) { animation-delay: 1.5s; }
    .wave-text:nth-child(5) { animation-delay: 2s; }
    
    /* Enhanced background transitions */
    body {
        transition: background 0.5s ease-in-out;
    }
    
    /* Particle trail effect */
    .particle-trail {
        position: absolute;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #00d4ff, transparent);
        border-radius: 50%;
        pointer-events: none;
        animation: particle-trail 2s linear forwards;
    }
    
    @keyframes particle-trail {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
    
    /* Enhanced scrollbar */
    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #00d4ff, #a855f7);
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #4de8ff, #c084fc);
    }
`;
document.head.appendChild(style); 

// Add particle trail effects and enhanced mouse interactions
document.addEventListener('DOMContentLoaded', () => {
    // Particle trail effect on mouse move
    let isMouseMoving = false;
    let mouseTrailTimeout;
    
    document.addEventListener('mousemove', (e) => {
        if (!isMouseMoving) {
            isMouseMoving = true;
        }
        
        // Create particle trail
        if (Math.random() > 0.7) {
            createParticleTrail(e.clientX, e.clientY);
        }
        
        // Clear timeout
        clearTimeout(mouseTrailTimeout);
        mouseTrailTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });
    
    function createParticleTrail(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle-trail';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = `radial-gradient(circle, ${getRandomColor()}, transparent)`;
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                document.body.removeChild(particle);
            }
        }, 2000);
    }
    
    function getRandomColor() {
        const colors = ['#00d4ff', '#a855f7', '#ff6b6b', '#51cf66', '#ffd43b'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Add sparkle effect to special elements
    const specialElements = document.querySelectorAll('.achievement-card, .window-header, #navbar-left');
    specialElements.forEach(el => {
        el.classList.add('sparkle');
    });
    
    // Add wave animation to text elements
    const waveTexts = document.querySelectorAll('.window-title, .achievement-title');
    waveTexts.forEach(text => {
        const letters = text.textContent.split('');
        text.innerHTML = letters.map(letter => 
            `<span class="wave-text">${letter}</span>`
        ).join('');
    });
    
    // Enhanced click effects
    document.addEventListener('click', (e) => {
        createClickEffect(e.clientX, e.clientY);
    });
    
    function createClickEffect(x, y) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x - 25}px;
            top: ${y - 25}px;
            width: 50px;
            height: 50px;
            border: 2px solid #00d4ff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: ripple-effect 0.6s ease-out forwards;
        `;
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                document.body.removeChild(ripple);
            }
        }, 600);
    }
    
    // Add ripple effect animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple-effect {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
});
