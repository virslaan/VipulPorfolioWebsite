// =====================
// Mind-Blowing Minimalistic Portfolio JS
// =====================

// Project URLs mapping
const projectUrls = {
    'wind-turbine': 'https://virslaan.github.io/Wind-Turbine-Blades-CUCP/',
    'veemusic': 'https://virslaan.github.io/VeeMusic/',
    'dj-software': 'https://virslaan.github.io/POC_DJ_Software/',
    'medical-passport': 'https://virslaan.github.io/medicalPassportversion2/',
    'techhub': 'https://virslaan.github.io/TechHub---By-Vipul-Rules/'
};

const projectTitles = {
    'wind-turbine': 'Wind Turbine Blade Repurposing',
    'veemusic': 'VeeMusic',
    'dj-software': 'DJ Software POC',
    'medical-passport': 'Medical Passport',
    'techhub': 'TechHub'
};

// Audio Visualizer - Using native browser audio
let audioContext = null;
let analyser = null;
let dataArray = null;
let source = null;
let animationFrame = null;
let isPlaying = false;
let useSimpleAudio = false; // Fallback to simple audio if Web Audio API fails

function initAudioVisualizer() {
    const audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer) {
        console.error('Audio player element not found');
        return;
    }
    
    const ringToggle = document.getElementById('ringToggle');
    const ringPlayer = document.getElementById('ringPlayer');
    const ringVisualization = document.getElementById('ringVisualization');
    const miniPlayer = document.getElementById('miniPlayer');
    
    if (!ringToggle || !ringPlayer || !miniPlayer) {
        console.error('Ring player elements not found');
        return;
    }
    
    const playIcon = ringToggle.querySelector('.ring-play-icon');
    const pauseIcon = ringToggle.querySelector('.ring-pause-icon');
    
    // Create visualization bars around the ring
    const barCount = 16;
    const radius = 30; // Distance from center
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'ring-bar';
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2; // Start from top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        bar.style.transform = `translate(${x}px, ${y}px) rotate(${angle + Math.PI / 2}rad)`;
        ringVisualization.appendChild(bar);
    }
    
    const ringBars = ringVisualization.querySelectorAll('.ring-bar');
    
    // Log audio source for debugging
    console.log('Audio source:', audioPlayer.src || audioPlayer.currentSrc);
    console.log('Audio readyState:', audioPlayer.readyState);
    console.log('Protocol:', window.location.protocol);
    
    // Note about file:// protocol limitations
    if (window.location.protocol === 'file:') {
        console.log('⚠️ Running from file:// - Some features may be limited. For full functionality, use a local server:');
        console.log('   Python: python -m http.server 8000');
        console.log('   Node: npx http-server');
        console.log('   Then open: http://localhost:8000');
    }
    
    // Mini player text animation
    function startMiniPlayerText() {
        const miniPlayerText = document.getElementById('miniPlayerText');
        if (!miniPlayerText) return;
        
        const textWrapper = miniPlayerText.querySelector('.mini-player-text-wrapper');
        if (!textWrapper) return;
        
        // Reset and start animation
        textWrapper.style.animation = 'none';
        setTimeout(() => {
            textWrapper.style.animation = 'flowText 180s linear infinite';
        }, 10);
    }
    
    // Update ring visualization
    function updateRingVisualization() {
        if (!isPlaying || !analyser || !dataArray || !ringBars) {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            return;
        }
        
        animationFrame = requestAnimationFrame(updateRingVisualization);
        
        analyser.getByteFrequencyData(dataArray);
        
        ringBars.forEach((bar, i) => {
            const dataIndex = Math.floor((i / barCount) * dataArray.length);
            const value = dataArray[dataIndex];
            const height = Math.max(4, (value / 255) * 16);
            bar.style.height = `${height}px`;
        });
    }
    
    // Initialize audio context - using Chrome's native audio
    function setupAudioContext() {
        if (!audioContext) {
            try {
                // Use Chrome's native AudioContext
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Only setup analyser if we can connect (not file:// protocol)
                if (window.location.protocol !== 'file:') {
                    try {
                        analyser = audioContext.createAnalyser();
                        analyser.fftSize = 256;
                        analyser.smoothingTimeConstant = 0.8;
                        
                        const bufferLength = analyser.frequencyBinCount;
                        dataArray = new Uint8Array(bufferLength);
                        
                        // Check if audio element is already connected
                        if (audioPlayer.src || audioPlayer.currentSrc) {
                            source = audioContext.createMediaElementSource(audioPlayer);
                            source.connect(analyser);
                            analyser.connect(audioContext.destination);
                            console.log('Audio context setup complete with visualization');
                        }
                    } catch (corsError) {
                        console.warn('Web Audio API not available, using native HTML5 audio only');
                        useSimpleAudio = true;
                    }
                } else {
                    // For file:// protocol, just use native audio playback
                    console.log('Using native HTML5 audio (file:// protocol)');
                    useSimpleAudio = true;
                }
            } catch (error) {
                console.warn('Audio context setup failed, using native HTML5 audio:', error);
                useSimpleAudio = true;
            }
        }
    }
    
    // No visualization needed - just color inversion
    
    // Check if audio file exists and handle errors
    audioPlayer.addEventListener('error', (e) => {
        const error = audioPlayer.error;
        console.error('Audio error:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
        console.error('Audio src:', audioPlayer.src || audioPlayer.currentSrc);
        console.error('Audio readyState:', audioPlayer.readyState);
        
        let errorMsg = 'Audio file error. ';
        if (error) {
            switch(error.code) {
                case error.MEDIA_ERR_ABORTED:
                    errorMsg += 'Playback aborted.';
                    break;
                case error.MEDIA_ERR_NETWORK:
                    errorMsg += 'Network error. Please check your connection.';
                    break;
                case error.MEDIA_ERR_DECODE:
                    errorMsg += 'Audio decode error. File may be corrupted.';
                    break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMsg += 'Audio format not supported or file not found.';
                    break;
                default:
                    errorMsg += 'Unknown error occurred.';
            }
        }
        console.error(errorMsg);
    });
    
    audioPlayer.addEventListener('canplay', () => {
        console.log('Audio can play - readyState:', audioPlayer.readyState);
    });
    
    audioPlayer.addEventListener('loadstart', () => {
        console.log('Audio loading started');
    });
    
    audioPlayer.addEventListener('loadeddata', () => {
        console.log('Audio data loaded');
    });
    
    // Try to load audio on page load
    audioPlayer.load();
    
    // Test if file is accessible (only works with http/https, not file://)
    // Skip fetch check if using file:// protocol to avoid CORS errors
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        fetch('assets/shining-spotlight.mp3', { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    console.log('Audio file found and accessible');
                } else {
                    console.warn('Audio file not found or not accessible:', response.status);
                }
            })
            .catch(error => {
                console.warn('Could not verify audio file (this is normal with file:// protocol):', error);
            });
    } else {
        console.log('Running from file:// protocol - audio will work when served via http://');
    }
    
    // Toggle play/pause
    ringToggle.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            // Setup audio context on first interaction (optional for visualization)
            if (!audioContext && !useSimpleAudio) {
                try {
                    setupAudioContext();
                } catch (contextError) {
                    console.warn('Audio context setup failed, using native audio:', contextError);
                    useSimpleAudio = true;
                }
            }
            
            // Resume audio context if suspended (only if using Web Audio API)
            if (audioContext && !useSimpleAudio && audioContext.state === 'suspended') {
                try {
                    await audioContext.resume();
                } catch (resumeError) {
                    console.warn('Could not resume audio context:', resumeError);
                    useSimpleAudio = true;
                }
            }
            
            // For native HTML5 audio, we don't need audio context
            // Chrome's built-in audio player will handle everything
            
            if (isPlaying) {
                // Pause
                audioPlayer.pause();
                isPlaying = false;
                miniPlayer.classList.remove('active');
                ringPlayer.classList.remove('active');
                document.body.classList.remove('music-playing');
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                } else {
                // Play using Chrome's native HTML5 audio API
                try {
                    // Check for errors first
                    if (audioPlayer.error) {
                        throw new Error(`Audio error: ${audioPlayer.error.message || 'Unknown error'}`);
                    }
                    
                    // Use Chrome's native audio.play() method directly
                    // This is the simplest and most reliable way
                    console.log('Using Chrome native audio.play() - ReadyState:', audioPlayer.readyState);
                    
                    // Ensure audio is loaded
                    if (audioPlayer.readyState < 2) {
                        console.log('Loading audio with Chrome native loader...');
                        audioPlayer.load();
                        
                        // Wait briefly for Chrome to load the audio
                        await new Promise((resolve) => {
                            if (audioPlayer.readyState >= 2) {
                                resolve();
    } else {
                                const checkReady = () => {
                                    if (audioPlayer.readyState >= 2) {
                                        audioPlayer.removeEventListener('canplay', checkReady);
                                        audioPlayer.removeEventListener('loadeddata', checkReady);
                                        resolve();
                                    }
                                };
                                audioPlayer.addEventListener('canplay', checkReady, { once: true });
                                audioPlayer.addEventListener('loadeddata', checkReady, { once: true });
                                // Timeout after 2 seconds
                                setTimeout(resolve, 2000);
        }
    });
}

                    // Use Chrome's built-in play() method - no Web Audio API needed
                    console.log('Calling Chrome native audio.play()...');
                    // Chrome's native play() method - works with file:// protocol
                    const playPromise = audioPlayer.play();
                    
                    // Handle the promise returned by Chrome's play() method
                    if (playPromise !== undefined) {
                        await playPromise;
                        console.log('✅ Audio playing successfully with Chrome native player');
                    }
                    
                    isPlaying = true;
                    miniPlayer.classList.add('active');
                    ringPlayer.classList.add('active');
                    document.body.classList.add('music-playing');
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                    
                    // Start mini player text animation
                    startMiniPlayerText();
                    
                    // Start ring visualization
                    if (analyser && dataArray) {
                        updateRingVisualization();
                    }
                } catch (playError) {
                    console.error('Play error:', playError);
                    console.error('Audio element:', {
                        src: audioPlayer.src,
                        currentSrc: audioPlayer.currentSrc,
                        readyState: audioPlayer.readyState,
                        error: audioPlayer.error
                    });
                    
                    let errorMessage = 'Unable to play audio. ';
                    if (playError.name === 'NotAllowedError') {
                        errorMessage += 'Please interact with the page first (browser autoplay restriction).';
                    } else if (playError.name === 'NotSupportedError') {
                        errorMessage += 'Audio format not supported.';
                    } else if (audioPlayer.error) {
                        errorMessage += audioPlayer.error.message || 'Audio file error.';
                    } else if (playError.message && playError.message.includes('CORS')) {
                        errorMessage += 'CORS restriction with file:// protocol. Audio may play but visualizer is limited. Try using a local server (see console for instructions).';
    } else {
                        errorMessage += playError.message || 'Please check if the file exists at: assets/shining-spotlight.mp3';
                    }
                    
                    // Only show alert for critical errors, not CORS warnings
                    if (!playError.message || !playError.message.includes('CORS')) {
                        console.warn(errorMessage);
  } else {
                        console.warn('Audio CORS warning (normal with file://):', playError.message);
                    }
                }
            }
        } catch (error) {
            console.error('Error with audio:', error);
            alert('Audio error: ' + error.message);
        }
    });
    
    // Handle audio end
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        miniPlayer.classList.remove('active');
        ringPlayer.classList.remove('active');
        document.body.classList.remove('music-playing');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    });
    
    // Handle audio errors
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });
    
    // Make startMiniPlayerText available globally
    window.startMiniPlayerText = startMiniPlayerText;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio visualizer
    initAudioVisualizer();
    
    // Resume Section Toggle
    const resumeToggle = document.getElementById('resumeToggle');
    const resumePreview = document.getElementById('resumePreview');
    
    if (resumeToggle && resumePreview) {
        resumeToggle.addEventListener('click', () => {
            const isActive = resumePreview.classList.contains('active');
            if (isActive) {
                resumePreview.classList.remove('active');
                resumeToggle.classList.remove('active');
    } else {
                resumePreview.classList.add('active');
                resumeToggle.classList.add('active');
            }
        });
    }
    // Human Verification System
    const verificationOverlay = document.getElementById('verificationOverlay');
    const verifyButton = document.getElementById('verifyButton');
    
    // Ensure elements exist
    if (!verificationOverlay || !verifyButton) {
        console.error('Verification elements not found');
        // If elements don't exist, ensure body is not locked
        document.body.classList.remove('verification-active');
        return;
    }
    
    // Check if localStorage is available
    let isVerified = false;
    try {
        isVerified = localStorage.getItem('humanVerified') === 'true';
    } catch (e) {
        console.warn('localStorage not available:', e);
        // If localStorage fails, show verification
        isVerified = false;
    }
    
    // Show or hide overlay based on verification status
    if (isVerified) {
        verificationOverlay.classList.add('hidden');
        document.body.classList.remove('verification-active');
    } else {
        // Ensure overlay is visible
        verificationOverlay.classList.remove('hidden');
        verificationOverlay.style.display = 'flex';
        verificationOverlay.style.opacity = '1';
        verificationOverlay.style.visibility = 'visible';
        document.body.classList.add('verification-active');
    }
    
    // Handle verification button click
    verifyButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            // Store verification in localStorage
            try {
                localStorage.setItem('humanVerified', 'true');
            } catch (storageError) {
                console.warn('Could not save to localStorage:', storageError);
            }
            
            // Hide overlay with smooth animation
            verificationOverlay.classList.add('hidden');
            document.body.classList.remove('verification-active');
            
            // Ensure overlay is completely hidden
    setTimeout(() => {
                verificationOverlay.style.display = 'none';
            }, 500);
    
            // Trigger hero animation after verification
    setTimeout(() => {
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.opacity = '0';
                    heroContent.style.transform = 'translateY(30px)';
                    heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
            setTimeout(() => {
                        heroContent.style.opacity = '1';
                        heroContent.style.transform = 'translateY(0)';
                    }, 100);
                }
            }, 300);
        } catch (error) {
            console.error('Verification error:', error);
            // Fallback: just hide the overlay
            verificationOverlay.classList.add('hidden');
            verificationOverlay.style.display = 'none';
            document.body.classList.remove('verification-active');
        }
    });
    
    // Also handle Enter key on button
    verifyButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            verifyButton.click();
        }
    });
    
    // Navigation scroll effect - minimalistic
    const nav = document.getElementById('nav');
    
    function handleNavScroll() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 20) {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.borderBottomColor = 'rgba(0, 0, 0, 0.08)';
    } else {
            nav.style.background = 'rgba(255, 255, 255, 0.8)';
            nav.style.borderBottomColor = 'rgba(0, 0, 0, 0.05)';
        }
    }
    
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
    
    // Enhanced smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = nav.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                // Smooth scroll with easing
                smoothScrollTo(targetPosition, 800);
            }
        });
    });
    
    // Custom smooth scroll function with easing
    function smoothScrollTo(target, duration) {
        const start = window.pageYOffset;
        const distance = target - start;
        let startTime = null;
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, start + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    // Hero Video Setup - Random Video Selection
    const heroVideo = document.querySelector('.hero-video');
    const heroImage = document.querySelector('.hero-image');
    const heroSection = document.querySelector('.hero');
    const heroOverlay = document.querySelector('.hero-overlay');
    
    // Array of available videos
    const videoFiles = [
        'assets/img/hero-video.mp4',
        'assets/img/hero-video-2.mp4',
        'assets/img/hero-video-3.mp4',
        'assets/img/hero-video-4.mp4',
        'assets/img/hero-video-5.mp4',
        'assets/img/hero-video-6.mp4',
        'assets/img/hero-video-7.mp4',
        'assets/img/hero-video-8.mp4'
    ];
    
    // Current video index
    let currentVideoIndex = Math.floor(Math.random() * videoFiles.length);
    console.log('Selected random video:', videoFiles[currentVideoIndex]);
    
    // Video navigation functions
    function changeVideo(direction) {
        if (direction === 'next') {
            currentVideoIndex = (currentVideoIndex + 1) % videoFiles.length;
        } else if (direction === 'prev') {
            currentVideoIndex = (currentVideoIndex - 1 + videoFiles.length) % videoFiles.length;
        }
        
        if (heroVideo) {
            // Fade out
            heroVideo.style.opacity = '0';
            heroVideo.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                heroVideo.src = videoFiles[currentVideoIndex];
                heroVideo.loop = false; // Ensure loop is off
                heroVideo.load();
                
                // Fade in after load
                heroVideo.addEventListener('loadeddata', function fadeIn() {
                    heroVideo.style.opacity = '0.5';
                    heroVideo.play().catch(() => {});
                    heroVideo.removeEventListener('loadeddata', fadeIn);
                }, { once: true });
            }, 300);
        }
    }
    
    // Video navigation buttons
    const videoPrev = document.getElementById('videoPrev');
    const videoNext = document.getElementById('videoNext');
    
    if (videoPrev) {
        videoPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            changeVideo('prev');
        });
    }
    
    if (videoNext) {
        videoNext.addEventListener('click', (e) => {
            e.stopPropagation();
            changeVideo('next');
        });
    }
    
    // Randomly select initial video
    const randomVideo = videoFiles[currentVideoIndex];
    
    // Ensure video loads and plays
    if (heroVideo) {
        // Set the randomly selected video source
        heroVideo.src = randomVideo;
        
        // Load the video
        heroVideo.load();
        
        // Make video visible
        heroVideo.style.display = 'block';
        heroVideo.style.opacity = '0.5';
        
        // Force video attributes
        heroVideo.muted = true;
        heroVideo.loop = false; // Play once, then change
        heroVideo.playsInline = true;
        
        // When video ends, automatically change to next video
        heroVideo.addEventListener('ended', function() {
            changeVideo('next');
        });
        
        // Handle successful video load
        heroVideo.addEventListener('loadeddata', function() {
            this.style.opacity = '0.5';
            this.play().catch(e => {
                console.log('Play error (will retry):', e);
    });
});

        heroVideo.addEventListener('canplay', function() {
            this.play().catch(e => {
                console.log('Canplay - play error:', e);
            });
        });
        
        heroVideo.addEventListener('canplaythrough', function() {
            this.play().catch(e => {
                console.log('Canplaythrough - play error:', e);
    });
});

        // Handle video errors - show fallback image
        heroVideo.addEventListener('error', function(e) {
            console.log('Video error:', this.error);
            if (heroSection) {
                heroSection.classList.add('no-video');
            }
        });
        
        // Check if video can actually play
        heroVideo.addEventListener('loadedmetadata', function() {
            console.log('Video metadata loaded, duration:', this.duration);
            if (this.duration && this.duration > 0) {
                this.play().catch(e => {
                    console.log('Metadata loaded but play failed:', e);
                });
            }
        });
        
        // Try to play immediately
    setTimeout(() => {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Initial play failed:', error);
                    // Video will play after user interaction
                    const playOnInteraction = () => {
                        heroVideo.play().catch(() => {});
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('scroll', playOnInteraction);
                    };
                    document.addEventListener('click', playOnInteraction, { once: true });
                    document.addEventListener('scroll', playOnInteraction, { once: true });
                });
            }
        }, 200);
    }
    
    // Enhanced smooth parallax effect for hero video/image
    let ticking = false;
    let lastScrollY = 0;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const deltaY = scrolled - lastScrollY;
        lastScrollY = scrolled;
        
        if (scrolled < window.innerHeight) {
            const parallaxSpeed = 0.25; // Slightly slower for smoother effect
            const scale = 1 + (scrolled * 0.0001); // Subtle scale effect
            
            if (heroVideo && heroVideo.style.display !== 'none') {
                heroVideo.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(${scale})`;
                heroVideo.style.transition = 'transform 0.1s ease-out';
            }
            if (heroImage && heroImage.style.display === 'block') {
                heroImage.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(${scale})`;
                heroImage.style.transition = 'transform 0.1s ease-out';
            }
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    
    // Interactive Timeline with Scroll Reveals and Click to Expand
    const experienceSection = document.querySelector('.experience-section');
    const timelineThread = document.querySelector('.timeline-thread');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (experienceSection && timelineThread && timelineItems.length > 0) {
        let timelineTicking = false;
        let activeItem = null;
        
        // Intersection Observer for revealing timeline items
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 150);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });
        
        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
        
        // Click to expand/collapse details (manual override)
        timelineItems.forEach(item => {
            item.addEventListener('click', function() {
                // Close other items
                timelineItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.classList.remove('scroll-expanded');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                activeItem = item.classList.contains('active') ? item : null;
            });
        });
        
        // Update timeline thread progress and animate images on scroll
        function updateTimelineThread() {
            const sectionTop = experienceSection.offsetTop;
            const sectionHeight = experienceSection.offsetHeight;
            const scrollPos = window.pageYOffset;
            const viewportHeight = window.innerHeight;
            
            // Calculate scroll progress through the section
            const scrollProgress = Math.max(0, Math.min(1, 
                (scrollPos + viewportHeight - sectionTop) / sectionHeight
            ));
            
            // Update timeline thread height
            timelineThread.style.transform = `scaleY(${scrollProgress})`;
            
            // Update moving dot position
            const timelineHeight = experienceSection.offsetHeight;
            const dotOffset = (timelineHeight * scrollProgress);
            timelineThread.style.setProperty('--dot-offset', `${dotOffset}px`);
            
            // Auto-expand descriptions based on scroll position (no image animations)
            timelineItems.forEach((item, index) => {
                const details = item.querySelector('.timeline-details');
                const image = item.querySelector('.timeline-image');
                
                if (details) {
                    const itemTop = item.offsetTop + experienceSection.offsetTop;
                    const itemCenter = itemTop + item.offsetHeight / 2;
                    const viewportCenter = scrollPos + viewportHeight / 2;
                    
                    // Calculate distance from viewport center
                    const distance = viewportCenter - itemCenter;
                    
                    // Auto-expand description when item is centered (within 200px of viewport center)
                    if (Math.abs(distance) < 200) {
                        item.classList.add('scroll-expanded');
                        // Make image colorful when expanded
                        if (image) {
                            image.style.filter = 'grayscale(0%)';
                        }
    } else {
                        // Only remove scroll-expanded if not manually active
                        if (!item.classList.contains('active')) {
                            item.classList.remove('scroll-expanded');
                            // Make image grayscale when not expanded
                            if (image) {
                                image.style.filter = 'grayscale(100%)';
                            }
                        }
                    }
                }
            });
            
            timelineTicking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!timelineTicking) {
                window.requestAnimationFrame(updateTimelineThread);
                timelineTicking = true;
            }
        }, { passive: true });
        
        // Initial update
        updateTimelineThread();
    }
    
    // Enhanced Intersection Observer for smoother fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations more smoothly
    setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 20);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.education-item, .project-thumbnail, .contact-card, .awards-list li'
    );
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(15px)';
        element.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        element.style.willChange = 'opacity, transform';
        observer.observe(element);
    });
    
    // Hero content animation (only if verified)
    if (isVerified) {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 300);
        }
    }
    
    // Project Modal Functionality
    const projectModal = document.getElementById('projectModal');
    const modalIframe = document.getElementById('modalIframe');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const projectThumbnails = document.querySelectorAll('.project-thumbnail');
    
    // Open modal function
    function openModal(projectId) {
        const url = projectUrls[projectId];
        const title = projectTitles[projectId];
        
        if (url && title) {
            modalIframe.src = url;
            modalTitle.textContent = title;
            projectModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
    
    // Close modal function
    function closeModal() {
        projectModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Clear iframe src after animation to stop loading
    setTimeout(() => {
            modalIframe.src = '';
        }, 300);
}

    // Add click handlers to project thumbnails
    projectThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            // Only open modal if project has a URL
            if (projectUrls[projectId]) {
                openModal(projectId);
            }
            // For projects without URLs (like capstone), just show the image
        });
    });
    
    // Close modal on close button click
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal on outside click
    projectModal.addEventListener('click', function(e) {
        if (e.target === projectModal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && projectModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('.section, .hero');
    
    function updateActiveNav() {
        const scrollPos = window.scrollY + nav.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    const linkHref = link.getAttribute('href');
                    if (linkHref === `#${sectionId}`) {
                        link.style.opacity = '1';
    } else {
                        link.style.opacity = '0.6';
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
    
    // Image loading optimization
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
    } else {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
                this.style.transition = 'opacity 0.5s ease-in-out';
            });
            img.style.opacity = '0';
        }
    });
    
    // Skill tags animation
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach((tag) => {
        tag.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
    
    // Forbes Badge Click Animation
    const forbesBadge = document.getElementById('forbesBadge');
    const forbesModal = document.getElementById('forbesModal');
    const forbesModalClose = document.getElementById('forbesModalClose');
    const confettiCanvas = document.getElementById('confettiCanvas');
    
    if (forbesBadge && forbesModal) {
        // Subtle Confetti Animation Function
        function createConfetti() {
            const ctx = confettiCanvas.getContext('2d');
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
            
            const particles = [];
            // More subtle, elegant colors
            const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#98D8C8'];
            const particleCount = 60; // Reduced for subtlety
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * confettiCanvas.width,
                    y: -20,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: Math.random() * 2 + 1.5,
                    size: Math.random() * 6 + 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 8,
                    shape: Math.random() > 0.4 ? 'circle' : 'square',
                    opacity: Math.random() * 0.5 + 0.5,
                    life: 1.0
                });
            }
            
            let frameCount = 0;
            const maxFrames = 120; // Stop after ~2 seconds at 60fps
            
            function animate() {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                frameCount++;
                
                particles.forEach((particle, index) => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.08; // gentler gravity
                    particle.rotation += particle.rotationSpeed;
                    particle.life -= 0.01;
                    
                    if (particle.life <= 0 || particle.y > confettiCanvas.height + 30) {
                        particles.splice(index, 1);
                        return;
                    }
                    
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation * Math.PI / 180);
                    ctx.globalAlpha = particle.opacity * particle.life;
                    ctx.fillStyle = particle.color;
                    
                    if (particle.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                        ctx.fill();
    } else {
                        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    }
                    
                    ctx.restore();
                });
                
                if (particles.length > 0 && frameCount < maxFrames) {
                    requestAnimationFrame(animate);
                } else {
                    // Fade out canvas
                    let fadeOut = 1;
                    const fadeInterval = setInterval(() => {
                        fadeOut -= 0.05;
                        if (fadeOut <= 0) {
                            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                            clearInterval(fadeInterval);
                        }
                    }, 16);
                }
            }
            
            animate();
        }
        
        // Open modal with animation
        forbesBadge.addEventListener('click', () => {
            forbesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Trigger subtle confetti after modal appears
    setTimeout(() => {
                createConfetti();
            }, 300);
            
            // Add subtle click effect to badge
            forbesBadge.style.transform = 'scale(0.98)';
    setTimeout(() => {
                forbesBadge.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Close modal
        function closeModal() {
            forbesModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        forbesModalClose.addEventListener('click', closeModal);
        
        // Close on backdrop click
        forbesModal.addEventListener('click', (e) => {
            if (e.target === forbesModal || e.target.classList.contains('forbes-modal-backdrop')) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && forbesModal.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            if (confettiCanvas) {
                confettiCanvas.width = window.innerWidth;
                confettiCanvas.height = window.innerHeight;
            }
        });
    }
    
});
