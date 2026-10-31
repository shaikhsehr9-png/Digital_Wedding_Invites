/**
 * ============================================================================
 * LUXURY DIGITAL WEDDING INVITATION — JAVASCRIPT CONTROLLER
 * Asif Shaikh & Dua Shaikh • Thursday, 3 December 2026
 * ============================================================================
 */

'use strict';

/* ============================================================================
   1. BUSINESS-READY CUSTOMIZATION CONFIGURATION (Requirement 9)
   Customize everything for any client by simply modifying this config object!
   ============================================================================ */
const WEDDING_CONFIG = {
  // Couple Information
  couple: {
    groom: "Asif Shaikh",
    bride: "Dua Shaikh",
    groomShort: "Asif",
    brideShort: "Dua",
    initials: "A & D",
    hashtag: "#AsifDuaForever",
    family: "The Shaikh Family",
    groomParents: "Mr. & Mrs. Shaikh",
    brideParents: "Mr. & Mrs. Shaikh"
  },

  // Main Wedding Target Date & Countdown (ISO-8601 Format)
  // Target: Thursday, 3 December 2026 at 9:00 PM
  weddingDateFormatted: "3 December 2026",
  weddingDayName: "Thursday",
  weddingTime: "9:00 PM",
  targetDate: "2026-12-03T21:00:00",

  // Theme Colors (Used to update CSS variables or canvas particles dynamically)
  theme: {
    champagne: "#FAF4EB",
    ivory: "#FFFDF9",
    blush: "#F9E9EC",
    burgundy: "#7C2A3E",
    deepBurgundy: "#581A2B",
    gold: "#C6A265",
    goldLight: "#E0C491",
    goldLighter: "#F6EBD7",
    softBeige: "#EFE4D6"
  },

  // Audio Configuration
  audio: {
    src: "assets/music/wedding-melody.mp3",
    backupSrc: "assets/music/wedding-melody.wav",
    defaultVolume: 0.65,
    enableWebAudioFallback: true
  },

  // Wedding Events (Editable details, venues, timings)
  events: [
    {
      id: "baraat",
      name: "The Baraat",
      subName: "Wedding Ceremony & Dinner Reception",
      day: "Thursday",
      date: "3 December 2026",
      time: "9:00 PM Sharp",
      venue: "Sapna Lawn",
      hall: "Grand Royal Marquee",
      address: "Sapna Lawn, Ghinti Phatak, Larkana, Sindh, Pakistan",
      dressCode: "Pastel Elegance / Traditional Royal",
      calendarStart: "20261203T210000",
      calendarEnd: "20261204T020000"
    }
  ],

  // Venue Information
  venue: {
    primaryName: "Sapna Lawn",
    subtitle: "Ghinti Phatak, Larkana, Sindh",
    address: "Sapna Lawn, Ghinti Phatak, Larkana, Sindh, Pakistan",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sapna+Lawn+Ghinti+Phatak+Larkana"
  },

  // RSVP Contact Information
  rsvp: {
    whatsappNumber: "923001234567", // Country code + digits without '+' for wa.me links
    deadline: "20 November 2026"
  }
};

/* ============================================================================
   2. DOM ELEMENTS CACHE
   ============================================================================ */
const DOM = {
  body: document.body,
  envelopeScreen: document.getElementById('envelope-screen'),
  envelopeWrapper: document.getElementById('envelope-wrapper'),
  waxSeal: document.getElementById('wax-seal'),
  openInvitationBtn: document.getElementById('open-invitation-btn'),
  mainContent: document.getElementById('main-content'),

  // Navigation
  topNav: document.getElementById('top-nav'),
  navToggle: document.getElementById('nav-toggle'),
  navLinks: document.getElementById('nav-links'),

  // Countdown Elements
  days: document.getElementById('countdown-days'),
  hours: document.getElementById('countdown-hours'),
  minutes: document.getElementById('countdown-minutes'),
  seconds: document.getElementById('countdown-seconds'),
  daysBox: document.getElementById('timer-days-box'),
  hoursBox: document.getElementById('timer-hours-box'),
  minutesBox: document.getElementById('timer-minutes-box'),
  secondsBox: document.getElementById('timer-seconds-box'),
  btnAddCalendar: document.getElementById('btn-add-calendar'),
  calendarDropdown: document.getElementById('calendar-dropdown'),
  calGoogle: document.getElementById('cal-google'),
  calApple: document.getElementById('cal-apple'),
  calOutlook: document.getElementById('cal-outlook'),

  // Music Player
  musicPlayer: document.getElementById('floating-music-player'),
  musicToggleBtn: document.getElementById('music-toggle-btn'),
  audioElement: document.getElementById('wedding-audio'),
  musicTooltip: document.getElementById('music-tooltip'),

  // Venue & RSVP
  btnCopyAddress: document.getElementById('btn-copy-address'),
  btnMapsLink: document.getElementById('btn-maps-link'),
  rsvpForm: document.getElementById('rsvp-form'),
  rsvpSuccess: document.getElementById('rsvp-success'),
  rsvpSuccessMsg: document.getElementById('rsvp-success-msg'),
  btnWhatsappConfirm: document.getElementById('btn-whatsapp-confirm'),
  btnEditRsvp: document.getElementById('btn-edit-rsvp'),

  // Share Modal & Closing
  btnShareInvite: document.getElementById('btn-share-invite'),
  shareModal: document.getElementById('share-modal'),
  shareModalClose: document.getElementById('share-modal-close'),
  shareUrlInput: document.getElementById('share-url-input'),
  btnCopyShareUrl: document.getElementById('btn-copy-share-url'),
  btnReplayEnvelope: document.getElementById('btn-replay-envelope'),
  toastNotification: document.getElementById('toast-notification'),
  toastText: document.getElementById('toast-text'),

  // Canvas
  petalsCanvas: document.getElementById('petals-canvas')
};

/* ============================================================================
   3. AUDIO CONTROLLER WITH WEB AUDIO API PROCEDURAL SYNTH FALLBACK
   ============================================================================ */
class WeddingAudioController {
  constructor() {
    this.audioEl = DOM.audioElement;
    this.isPlaying = false;
    this.isMuted = false;
    this.synthActive = false;
    this.synthContext = null;
    this.synthInterval = null;
    this.hasUserInteracted = false;

    this.initAudioElement();
  }

  initAudioElement() {
    if (!this.audioEl) return;
    this.audioEl.volume = 0; // Start at 0 for smooth fade-in
  }

  // Fade-in volume
  fadeIn(targetVolume = WEDDING_CONFIG.audio.defaultVolume, durationMs = 1500) {
    if (!this.audioEl) return;
    const step = 0.05;
    const intervalTime = durationMs / (targetVolume / step);
    let currentVol = 0;
    this.audioEl.volume = 0;

    const fade = setInterval(() => {
      currentVol = Math.min(targetVolume, currentVol + step);
      this.audioEl.volume = currentVol;
      if (currentVol >= targetVolume) clearInterval(fade);
    }, intervalTime);
  }

  play() {
    this.hasUserInteracted = true;

    // Try HTML5 audio first
    if (this.audioEl && !this.synthActive) {
      const playPromise = this.audioEl.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.fadeIn();
            this.updateUI(true);
          })
          .catch((err) => {
            console.warn("HTML5 audio playback failed, falling back to Web Audio synth:", err);
            this.startWebAudioSynth();
          });
      }
    } else if (this.synthActive) {
      this.resumeWebAudioSynth();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.audioEl && !this.synthActive) {
      this.audioEl.pause();
    }
    if (this.synthActive && this.synthContext) {
      this.synthContext.suspend();
    }
    this.updateUI(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateUI(playing) {
    if (!DOM.musicPlayer) return;
    if (playing) {
      DOM.musicPlayer.classList.add('playing');
      if (DOM.musicTooltip) DOM.musicTooltip.textContent = "Click to pause romantic melody";
    } else {
      DOM.musicPlayer.classList.remove('playing');
      if (DOM.musicTooltip) DOM.musicTooltip.textContent = "Click to play romantic melody";
    }
  }

  /* Procedural Romantic Acoustic Chimes / Harp Web Audio Synthesizer Fallback */
  startWebAudioSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.synthContext = new AudioCtx();
      this.synthActive = true;
      this.isPlaying = true;
      this.updateUI(true);

      // Canon in D chord notes in frequencies (Hz)
      const canonChords = [
        [293.66, 440.00, 587.33, 739.99], // D maj (D4, A4, D5, F#5)
        [220.00, 329.63, 440.00, 554.37], // A maj (A3, E4, A4, C#5)
        [246.94, 369.99, 493.88, 587.33], // B min (B3, F#4, B4, D5)
        [185.00, 277.18, 369.99, 440.00], // F# min (F#3, C#4, F#4, A4)
        [196.00, 293.66, 392.00, 493.88], // G maj (G3, D4, G4, B4)
        [293.66, 440.00, 587.33, 739.99], // D maj (D4, A4, D5, F#5)
        [196.00, 293.66, 392.00, 493.88], // G maj (G3, D4, G4, B4)
        [220.00, 329.63, 440.00, 554.37]  // A maj (A3, E4, A4, C#5)
      ];

      let chordIdx = 0;
      let noteStep = 0;

      const playPluck = (freq) => {
        if (!this.synthContext || this.synthContext.state !== 'running') return;
        const now = this.synthContext.currentTime;

        const osc = this.synthContext.createOscillator();
        const gain = this.synthContext.createGain();

        // Warm triangle/sine mix for harp feel
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft hammer strike and natural acoustic ring decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.synthContext.destination);

        osc.start(now);
        osc.stop(now + 1.85);
      };

      this.synthInterval = setInterval(() => {
        if (!this.isPlaying) return;
        const currentChord = canonChords[chordIdx];
        const note = currentChord[noteStep % currentChord.length];
        playPluck(note);

        noteStep++;
        if (noteStep >= 4) {
          noteStep = 0;
          chordIdx = (chordIdx + 1) % canonChords.length;
        }
      }, 550);

    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  resumeWebAudioSynth() {
    if (this.synthContext && this.synthContext.state === 'suspended') {
      this.synthContext.resume();
    }
    this.isPlaying = true;
    this.updateUI(true);
  }
}

const audioController = new WeddingAudioController();

/* ============================================================================
   4. ENVELOPE OPENING ANIMATION ENGINE (Requirement 3)
   ============================================================================ */
function initEnvelopeOpening() {
  let isOpened = false;

  const triggerOpen = () => {
    if (isOpened) return;
    isOpened = true;

    // 1. Play Opening Sound & Background Music
    audioController.play();

    // 2. Add opening state to envelope
    DOM.envelopeScreen.classList.add('opening');

    // 3. Trigger celebratory golden sparkles & rose petals burst on canvas
    if (petalsEngine) {
      petalsEngine.burstCelebration();
    }

    // 4. Smooth reveal transition after flap flips and letter elevates
    setTimeout(() => {
      DOM.envelopeScreen.classList.add('opened');
      DOM.body.classList.remove('loading-locked');
      DOM.mainContent.setAttribute('aria-hidden', 'false');

      // Initialize scroll animations
      initScrollReveal();

      // Show brief welcoming toast
      showToast("Welcome to Asif & Dua's Wedding Celebration");
    }, 1400);
  };

  // Click & Touch events
  if (DOM.waxSeal) {
    DOM.waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerOpen();
    });
  }

  if (DOM.openInvitationBtn) {
    DOM.openInvitationBtn.addEventListener('click', triggerOpen);
  }

  if (DOM.envelopeWrapper) {
    DOM.envelopeWrapper.addEventListener('click', triggerOpen);
    DOM.envelopeWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerOpen();
      }
    });
  }

  // Replay envelope animation button in closing section
  if (DOM.btnReplayEnvelope) {
    DOM.btnReplayEnvelope.addEventListener('click', () => {
      isOpened = false;
      DOM.envelopeScreen.classList.remove('opened', 'opening');
      DOM.body.classList.add('loading-locked');
      DOM.mainContent.setAttribute('aria-hidden', 'true');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ============================================================================
   5. FLOATING ROSE PETALS & GOLDEN PARTICLES CANVAS (Requirement 5)
   ============================================================================ */
class AmbientPetalsCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = window.innerWidth < 768 ? 24 : 45;
    this.animId = null;
    this.isRunning = false;

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.start();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const isGoldSparkle = Math.random() > 0.65;
    return {
      type: isGoldSparkle ? 'sparkle' : 'petal',
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20,
      size: isGoldSparkle ? (Math.random() * 2.5 + 1.5) : (Math.random() * 10 + 9),
      speedY: isGoldSparkle ? (Math.random() * 0.8 + 0.4) : (Math.random() * 1.2 + 0.8),
      speedX: (Math.random() - 0.5) * 0.7,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.03 + 0.015,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      opacity: Math.random() * 0.5 + 0.4,
      color: isGoldSparkle
        ? (Math.random() > 0.5 ? '#E0C491' : '#F6EBD7')
        : (Math.random() > 0.6 ? '#F9DCE2' : (Math.random() > 0.3 ? '#F3BCC7' : '#973A50'))
    };
  }

  burstCelebration() {
    const burstCount = 60;
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 7 + 2;
      this.particles.push({
        type: Math.random() > 0.5 ? 'sparkle' : 'petal',
        x: this.width / 2,
        y: this.height / 2,
        size: Math.random() * 10 + 6,
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity,
        swing: 0,
        swingSpeed: 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0.05,
        opacity: 0.95,
        decay: true,
        color: Math.random() > 0.5 ? '#DFC491' : (Math.random() > 0.5 ? '#F4BFCB' : '#973A50')
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update positions
      if (p.decay) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.08; // gravity
        p.speedX *= 0.98;
        p.opacity -= 0.012;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      } else {
        p.swing += p.swingSpeed;
        p.x += Math.sin(p.swing) * 0.9 + p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Reset when falling past bottom
        if (p.y > this.height + 25 || p.x < -30 || p.x > this.width + 30) {
          this.particles[i] = this.createParticle(false);
          continue;
        }
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.type === 'sparkle') {
        // Draw glittering gold diamond star
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Cross sparkle glint
        this.ctx.strokeStyle = '#FFF3D4';
        this.ctx.lineWidth = 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(-p.size * 1.8, 0);
        this.ctx.lineTo(p.size * 1.8, 0);
        this.ctx.moveTo(0, -p.size * 1.8);
        this.ctx.lineTo(0, p.size * 1.8);
        this.ctx.stroke();
      } else {
        // Draw elegant curved rose petal
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size * 1.2);
        this.ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
        this.ctx.fill();

        // Subtle petal highlight curve
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    if (this.isRunning) {
      this.animId = requestAnimationFrame(() => this.draw());
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.draw();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

let petalsEngine = null;

/* ============================================================================
   6. COUNTDOWN TIMER ENGINE (Requirement 4)
   Target: February 14, 2027 at 7:00 PM
   ============================================================================ */
function initCountdownTimer() {
  const targetTime = new Date(WEDDING_CONFIG.targetDate).getTime();
  let prevValues = { days: null, hours: null, minutes: null, seconds: null };

  const updateTimer = () => {
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      DOM.days.textContent = "00";
      DOM.hours.textContent = "00";
      DOM.minutes.textContent = "00";
      DOM.seconds.textContent = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const pad = (num, length = 2) => String(num).padStart(length, '0');

    // Update Days
    if (prevValues.days !== days) {
      DOM.days.textContent = pad(days, 3);
      animateTick(DOM.daysBox);
      prevValues.days = days;
    }

    // Update Hours
    if (prevValues.hours !== hours) {
      DOM.hours.textContent = pad(hours);
      animateTick(DOM.hoursBox);
      prevValues.hours = hours;
    }

    // Update Minutes
    if (prevValues.minutes !== minutes) {
      DOM.minutes.textContent = pad(minutes);
      animateTick(DOM.minutesBox);
      prevValues.minutes = minutes;
    }

    // Update Seconds
    if (prevValues.seconds !== seconds) {
      DOM.seconds.textContent = pad(seconds);
      animateTick(DOM.secondsBox);
      prevValues.seconds = seconds;
    }
  };

  const animateTick = (boxEl) => {
    if (!boxEl) return;
    const card = boxEl.querySelector('.timer-card');
    if (!card) return;
    card.classList.add('tick');
    setTimeout(() => card.classList.remove('tick'), 400);
  };

  updateTimer();
  setInterval(updateTimer, 1000);

  // Calendar Sync Dropdown & Generator
  initCalendarSync();
}

/* Calendar generator for Google, Apple, and Outlook (.ics) */
function initCalendarSync() {
  if (!DOM.btnAddCalendar) return;

  DOM.btnAddCalendar.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.calendarDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    if (DOM.calendarDropdown) DOM.calendarDropdown.classList.add('hidden');
  });

  const eventTitle = encodeURIComponent(`${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride}'s Wedding (The Baraat)`);
  const eventDetails = encodeURIComponent(`You are joyfully invited to celebrate the wedding of ${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride}. Venue: ${WEDDING_CONFIG.venue.primaryName}`);
  const eventLocation = encodeURIComponent(WEDDING_CONFIG.venue.address);
  const startIso = "20261203T210000";
  const endIso = "20261204T020000";

  // Google Calendar URL
  if (DOM.calGoogle) {
    DOM.calGoogle.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startIso}/${endIso}&details=${eventDetails}&location=${eventLocation}`;
  }

  // Outlook Calendar URL
  if (DOM.calOutlook) {
    DOM.calOutlook.href = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventTitle}&body=${eventDetails}&location=${eventLocation}&startdt=2026-12-03T21:00:00&enddt=2026-12-04T02:00:00`;
  }

  // Apple iCal / ICS Download file
  if (DOM.calApple) {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AsifDuaWedding//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride} Wedding (The Baraat)`,
      `DESCRIPTION:${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride} Wedding Celebration at Sapna Lawn Larkana`,
      `LOCATION:${WEDDING_CONFIG.venue.address}`,
      `DTSTART;TZID=Asia/Karachi:${startIso}`,
      `DTEND;TZID=Asia/Karachi:${endIso}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    DOM.calApple.href = URL.createObjectURL(blob);
  }

  // Individual event card calendar buttons
  const eventCalBtns = document.querySelectorAll('.btn-single-cal');
  eventCalBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-event-index'), 10);
      const ev = WEDDING_CONFIG.events[idx] || WEDDING_CONFIG.events[0];
      const gTitle = encodeURIComponent(`${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride} — ${ev.name}`);
      const gDesc = encodeURIComponent(`${ev.name} (${ev.subName}) - ${ev.venue}, ${ev.address}. Dress code: ${ev.dressCode}`);
      const gLoc = encodeURIComponent(`${ev.venue}, ${ev.address}`);
      const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gTitle}&dates=${ev.calendarStart}/${ev.calendarEnd}&details=${gDesc}&location=${gLoc}`;
      window.open(gUrl, '_blank', 'noopener,noreferrer');
    });
  });
}

/* ============================================================================
   7. SCROLL REVEAL & NAVIGATION
   ============================================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

function initNavigation() {
  // Mobile Nav Toggle
  if (DOM.navToggle && DOM.navLinks) {
    DOM.navToggle.addEventListener('click', () => {
      DOM.navLinks.classList.toggle('open');
      const expanded = DOM.navLinks.classList.contains('open');
      DOM.navToggle.setAttribute('aria-expanded', expanded);
    });

    // Close mobile nav on link click
    DOM.navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        DOM.navLinks.classList.remove('open');
      });
    });
  }

  // Scroll shadow on nav
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      DOM.topNav.classList.add('scrolled');
    } else {
      DOM.topNav.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ============================================================================
   8. VENUE ACTIONS & RSVP FORM SUBMISSION
   ============================================================================ */
function initVenueAndRsvp() {
  // Copy Venue Address
  if (DOM.btnCopyAddress) {
    DOM.btnCopyAddress.addEventListener('click', () => {
      const addressText = `${WEDDING_CONFIG.venue.primaryName}, ${WEDDING_CONFIG.venue.address}`;
      navigator.clipboard.writeText(addressText)
        .then(() => showToast("Address copied to clipboard!"))
        .catch(() => showToast("Address: " + addressText));
    });
  }

  // Check for existing saved RSVP in localStorage
  const savedRsvp = localStorage.getItem('wedding_rsvp_asif_dua');
  if (savedRsvp) {
    try {
      const data = JSON.parse(savedRsvp);
      displayRsvpSuccess(data.name, data.events, data.guests);
    } catch (e) {}
  }

  // RSVP Form submission
  if (DOM.rsvpForm) {
    DOM.rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('rsvp-name');
      const phoneInput = document.getElementById('rsvp-phone');
      const guestsInput = document.getElementById('rsvp-guests');
      const dietInput = document.getElementById('rsvp-diet');
      const messageInput = document.getElementById('rsvp-message');
      const eventCheckboxes = document.querySelectorAll('input[name="attendance"]:checked');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Phone
      if (!phoneInput.value.trim() || phoneInput.value.trim().length < 7) {
        phoneInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        phoneInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate at least one event selected
      const selectedEvents = Array.from(eventCheckboxes).map(cb => cb.value);
      if (selectedEvents.length === 0) {
        document.getElementById('err-events').style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('err-events').style.display = 'none';
      }

      if (!isValid) return;

      const rsvpData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        events: selectedEvents,
        guests: guestsInput.value,
        diet: dietInput.value.trim(),
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('wedding_rsvp_asif_dua', JSON.stringify(rsvpData));

      // Show celebration confetti on canvas
      if (petalsEngine) petalsEngine.burstCelebration();

      // Show confirmation card
      displayRsvpSuccess(rsvpData.name, rsvpData.events, rsvpData.guests);

      // Setup WhatsApp confirmation button
      setupWhatsAppRSVP(rsvpData);

      showToast("Thank you! Your RSVP has been confirmed.");
    });
  }

  // Edit RSVP Button
  if (DOM.btnEditRsvp) {
    DOM.btnEditRsvp.addEventListener('click', () => {
      DOM.rsvpSuccess.classList.add('hidden');
      DOM.rsvpForm.classList.remove('hidden');
      DOM.rsvpForm.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function displayRsvpSuccess(name, events, guests) {
  if (!DOM.rsvpSuccess || !DOM.rsvpForm) return;
  DOM.rsvpForm.classList.add('hidden');
  DOM.rsvpSuccess.classList.remove('hidden');
  DOM.rsvpSuccessMsg.textContent = `Thank you, ${name}! We are ecstatic to have you celebrate our special wedding day with us (${guests} guests attending: ${events.join(', ')}).`;
}

function setupWhatsAppRSVP(data) {
  if (!DOM.btnWhatsappConfirm) return;

  const text = encodeURIComponent(
    `*Wedding RSVP Confirmation*\n` +
    `Guest Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Attending: ${data.events.join(', ')}\n` +
    `Number of Guests: ${data.guests}\n` +
    (data.diet ? `Notes: ${data.diet}\n` : '') +
    (data.message ? `Wishes: "${data.message}"\n` : '') +
    `Looking forward to celebrating with Asif & Dua!`
  );

  DOM.btnWhatsappConfirm.onclick = () => {
    window.open(`https://wa.me/${WEDDING_CONFIG.rsvp.whatsappNumber}?text=${text}`, '_blank');
  };
}

/* ============================================================================
   9. SHARING & MODALS
   ============================================================================ */
function initSharingAndModals() {
  const currentUrl = window.location.href;
  const shareTitle = `${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride} — Wedding Invitation`;
  const shareText = `You are cordially invited to celebrate the wedding of ${WEDDING_CONFIG.couple.groom} & ${WEDDING_CONFIG.couple.bride} on ${WEDDING_CONFIG.weddingDateFormatted}. Open the invitation:`;

  if (DOM.shareUrlInput) {
    DOM.shareUrlInput.value = currentUrl;
  }

  // Share CTA Button
  if (DOM.btnShareInvite) {
    DOM.btnShareInvite.addEventListener('click', async () => {
      // Use native Web Share API on mobile devices if supported
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: currentUrl
          });
          return;
        } catch (err) {
          // If cancelled or failed, fall back to custom modal
        }
      }

      // Open Modal
      openShareModal();
    });
  }

  function openShareModal() {
    if (!DOM.shareModal) return;
    DOM.shareModal.classList.remove('hidden');

    // Social Links
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(shareText);

    document.getElementById('share-wa').href = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
    document.getElementById('share-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    document.getElementById('share-tw').href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    document.getElementById('share-tg').href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  }

  // Close Share Modal
  if (DOM.shareModalClose) {
    DOM.shareModalClose.addEventListener('click', () => {
      DOM.shareModal.classList.add('hidden');
    });
  }

  if (DOM.shareModal) {
    DOM.shareModal.addEventListener('click', (e) => {
      if (e.target === DOM.shareModal) {
        DOM.shareModal.classList.add('hidden');
      }
    });
  }

  // Copy Share Link Button
  if (DOM.btnCopyShareUrl) {
    DOM.btnCopyShareUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          showToast("Invitation link copied to clipboard!");
          DOM.shareModal.classList.add('hidden');
        })
        .catch(() => showToast("Link: " + currentUrl));
    });
  }
}

/* Reusable Toast Notification */
function showToast(message) {
  if (!DOM.toastNotification || !DOM.toastText) return;
  DOM.toastText.textContent = message;
  DOM.toastNotification.classList.remove('hidden');

  clearTimeout(DOM.toastNotification._timeout);
  DOM.toastNotification._timeout = setTimeout(() => {
    DOM.toastNotification.classList.add('hidden');
  }, 3500);
}

/* ============================================================================
   10. MUSIC TOGGLE CONTROLLER
   ============================================================================ */
function initMusicToggle() {
  if (!DOM.musicToggleBtn) return;
  DOM.musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audioController.toggle();
  });
}

/* ============================================================================
   11. INITIALIZATION ON DOM READY
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Start canvas particle engine
  if (DOM.petalsCanvas) {
    petalsEngine = new AmbientPetalsCanvas(DOM.petalsCanvas);
  }

  // Initialize opening envelope
  initEnvelopeOpening();

  // Initialize countdown timer
  initCountdownTimer();

  // Initialize navigation & scroll behavior
  initNavigation();

  // Initialize venue & RSVP features
  initVenueAndRsvp();

  // Initialize sharing & modals
  initSharingAndModals();

  // Initialize floating music player
  initMusicToggle();
});
