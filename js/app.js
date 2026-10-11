/**
 * Ashima & Arpit Royal Wedding Website
 * Interactive Engine: Countdown, Web Audio Sitar/Shehnai Synth, RSVP Manager, 
 * Calendar Generator, Lightbox, Falling Petals & Guestbook
 */

// --- 1. COUNTDOWN TIMER ---
function initCountdown() {
  // Wedding Date: January 25, 2027 10:30:00 IST
  const weddingDate = new Date('2027-01-25T10:30:00+05:30').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  const statusEl = document.getElementById('cd-status');

  function update() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      if (statusEl) {
        statusEl.innerHTML = '<span class="text-amber-300 font-semibold tracking-wider uppercase">✨ Joined In Eternal Matrimony ✨</span>';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    if (statusEl) statusEl.textContent = '';
  }

  update();
  setInterval(update, 1000);
}

// --- 2. AMBIENT ROYAL MUSIC & SYNTHESIZER ENGINE ---
class RoyalMusicEngine {
  constructor() {
    this.isPlaying = false;
    this.audioEl = null;
    this.ctx = null;
    this.droneGain = null;
    this.melodyGain = null;
    this.masterGain = null;
    this.timerId = null;
    this.volume = 0.55;
    this.isUsingCustomAudio = false;
    this.hasUserInteracted = false;
  }

  init() {
    this.audioEl = document.getElementById('wedding-audio');
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
      this.audioEl.addEventListener('ended', () => {
        this.audioEl.currentTime = 0;
        this.audioEl.play().catch(() => {});
      });
    }
  }

  initSynth() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Warm acoustic reverb convolver simulation
    this.delay = this.ctx.createDelay();
    this.delay.delayTime.value = 0.35;
    this.feedback = this.ctx.createGain();
    this.feedback.gain.value = 0.35;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 2200;

    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.filter);
    this.filter.connect(this.masterGain);

    this.startTanpuraDrone();
  }

  startTanpuraDrone() {
    const droneFreqs = [73.42, 110.00, 146.83, 220.00];
    droneFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.15 + idx * 0.08;
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);

      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      if (pan) {
        pan.pan.value = (idx % 2 === 0 ? -0.4 : 0.4);
        gain.connect(pan);
        pan.connect(this.masterGain);
        pan.connect(this.delay);
      } else {
        gain.connect(this.masterGain);
        gain.connect(this.delay);
      }

      osc.start();
      lfo.start();
    });
  }

  playInstrumentNote(freq, duration = 2.2, type = 'sitar') {
    if (!this.ctx || !this.isPlaying) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (type === 'shehnai') {
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.8, t);
      filter.Q.value = 4.0;
    } else {
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, t);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.8, t + duration);
    }

    const bend = (Math.random() - 0.5) * 8;
    osc1.frequency.setValueAtTime(freq, t);
    osc1.frequency.exponentialRampToValueAtTime(freq + bend, t + 0.4);
    osc2.frequency.setValueAtTime(freq * 2.005, t);

    noteGain.gain.setValueAtTime(0.001, t);
    noteGain.gain.exponentialRampToValueAtTime(0.12, t + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);
    noteGain.connect(this.delay);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  startMelodyLoop() {
    const ragaNotes = [
      293.66, 329.63, 369.99, 440.00, 493.88, 587.33,
      493.88, 440.00, 369.99, 440.00, 329.63, 293.66,
      220.00, 293.66, 369.99, 329.63, 293.66
    ];
    let noteIndex = 0;

    const scheduleNext = () => {
      if (!this.isPlaying || this.isUsingCustomAudio) return;
      const freq = ragaNotes[noteIndex % ragaNotes.length];
      const instrument = Math.random() > 0.4 ? 'sitar' : 'shehnai';
      const duration = 1.8 + Math.random() * 1.2;
      this.playInstrumentNote(freq, duration, instrument);

      noteIndex++;
      const nextTime = 900 + Math.random() * 1400;
      this.timerId = setTimeout(scheduleNext, nextTime);
    };

    scheduleNext();
  }

  async play() {
    this.init();

    // 1. First attempt to play custom user audio file from assets/audio/wedding_music.mp3
    if (this.audioEl) {
      try {
        await this.audioEl.play();
        this.isPlaying = true;
        this.isUsingCustomAudio = true;
        this.updateUI('Wedding Melody');
        return true;
      } catch (err) {
        // Audio element couldn't play (e.g. file not uploaded yet or blocked)
        // If it was blocked by browser autoplay policy, bubble error
        if (err.name === 'NotAllowedError') {
          throw err;
        }
      }
    }

    // 2. Fallback: Classical Sitar & Shehnai Web Audio Synthesis
    try {
      this.initSynth();
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.isPlaying = true;
      this.isUsingCustomAudio = false;
      this.startMelodyLoop();
      this.updateUI('Shehnai & Sitar');
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw err;
      }
      return false;
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.audioEl && !this.audioEl.paused) {
      this.audioEl.pause();
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.updateUI();
  }

  async toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      try {
        await this.play();
      } catch (e) {
        console.warn('Playback error:', e);
      }
    }
  }

  setupAutoPlay() {
    const startAudio = () => {
      this.play().then(() => {
        cleanupListeners();
      }).catch((e) => {
        // Autoplay policy prevented playback, keep listeners active for first interaction
      });
    };

    const handleFirstInteraction = () => {
      if (this.isPlaying) return;
      startAudio();
    };

    const events = ['click', 'touchstart', 'scroll', 'keydown'];
    const cleanupListeners = () => {
      events.forEach(evt => window.removeEventListener(evt, handleFirstInteraction));
    };

    events.forEach(evt => {
      window.addEventListener(evt, handleFirstInteraction, { passive: true });
    });

    // Try immediate autoplay on page launch
    startAudio();
  }

  updateUI(sourceLabel = 'Shehnai & Sitar') {
    const playBtn = document.getElementById('music-toggle-btn');
    const disc = document.getElementById('music-disc');
    const label = document.getElementById('music-label');
    const subtitle = playBtn ? playBtn.querySelector('p.text-\\[10px\\]') : null;
    const wave = document.getElementById('music-wave');

    if (this.isPlaying) {
      if (disc) disc.classList.remove('paused');
      if (label) label.textContent = 'Music Playing';
      if (subtitle) subtitle.textContent = sourceLabel;
      if (wave) wave.classList.remove('hidden');
      if (playBtn) {
        playBtn.setAttribute('title', 'Pause Royal Music');
        playBtn.classList.add('ring-2', 'ring-amber-400', 'shadow-gold');
      }
    } else {
      if (disc) disc.classList.add('paused');
      if (label) label.textContent = 'Play Royal Music';
      if (wave) wave.classList.add('hidden');
      if (playBtn) {
        playBtn.setAttribute('title', 'Play Royal Music');
        playBtn.classList.remove('ring-2', 'ring-amber-400', 'shadow-gold');
      }
    }
  }
}

const musicEngine = new RoyalMusicEngine();

// --- 3. FALLING MARIGOLD & ROSE PETALS (Canvas) ---
function initPetalShower() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const maxPetals = window.innerWidth < 768 ? 24 : 45;
  let isPetalActive = true;

  // Colors: Marigold Orange/Gold & Royal Rose Red
  const petalColors = [
    { fill: '#F59E0B', edge: '#D97706' }, // Marigold orange
    { fill: '#FBBF24', edge: '#F59E0B' }, // Marigold yellow
    { fill: '#BE123C', edge: '#881337' }, // Rose crimson
    { fill: '#E11D48', edge: '#9F1239' }, // Vibrant rose
    { fill: '#FCD34D', edge: '#F59E0B' }  // Golden petal
  ];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = 9 + Math.random() * 12;
      this.speedY = 0.8 + Math.random() * 1.6;
      this.speedX = Math.sin(Math.random() * 6) * 1.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.035;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = 0.02 + Math.random() * 0.03;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.opacity = 0.55 + Math.random() * 0.4;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.015) * 0.8 + this.speedX;
      this.rotation += this.rotSpeed;
      this.flip += this.flipSpeed;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.sin(this.flip), 1);
      ctx.globalAlpha = this.opacity;

      // Draw petal shape
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.9, this.size * 0.5, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.9, this.size * 0.5, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
      ctx.closePath();

      ctx.fillStyle = this.color.fill;
      ctx.fill();
      ctx.strokeStyle = this.color.edge;
      ctx.lineWidth = 0.75;
      ctx.stroke();

      ctx.restore();
    }
  }

  for (let i = 0; i < maxPetals; i++) {
    petals.push(new Petal());
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    if (isPetalActive) {
      petals.forEach((p) => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(loop);
  }
  loop();

  // Petal Toggle control
  const toggleBtn = document.getElementById('petal-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPetalActive = !isPetalActive;
      toggleBtn.classList.toggle('text-gold', isPetalActive);
      toggleBtn.classList.toggle('opacity-50', !isPetalActive);
      const label = toggleBtn.querySelector('span');
      if (label) {
        label.textContent = isPetalActive ? 'Petals: On' : 'Petals: Off';
      }
    });
  }
}

// --- 4. CALENDAR EXPORTER (.ICS & GOOGLE CALENDAR) ---
function initCalendarButtons() {
  const icsBtn = document.getElementById('btn-download-ics');
  const gcalBtn = document.getElementById('btn-google-cal');

  const eventData = {
    title: "Ashima & Arpit's Royal Wedding Celebration",
    description: "Together with their families, Ashima & Arpit invite you to celebrate their union at AKM Resorts, Patiala Road, Zirakpur, Punjab.\\n\\nSchedule:\\n• 10:30 AM onwards: Haldi & Chuda Ceremony (Gulmohar Lawn)\\n• 06:30 PM: Baraat Arrival\\n• 07:00 PM: Royal Wedding & Pheras (Grand Lawn & Banquet)\\n\\nVenue: AKM Resorts, Patiala Road, near Swastik Vihar, Zirakpur, Punjab 140603.",
    location: "AKM Resorts, Patiala Road, near Swastik Vihar, Zirakpur, Punjab 140603",
    start: "20270125T050000Z", // 10:30 AM IST is 05:00 UTC
    end: "20270125T183000Z"    // 12:00 AM IST next day is 18:30 UTC
  };

  if (icsBtn) {
    icsBtn.addEventListener('click', () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ashima & Arpit Wedding//Digital Invitation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `SUMMARY:${eventData.title}`,
        `DESCRIPTION:${eventData.description}`,
        `LOCATION:${eventData.location}`,
        `DTSTART:${eventData.start}`,
        `DTEND:${eventData.end}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "BEGIN:VALARM",
        "TRIGGER:-PT24H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: Ashima & Arpit Wedding Tomorrow!",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Ashima-Arpit-Wedding-Jan25.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  if (gcalBtn) {
    gcalBtn.addEventListener('click', () => {
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        eventData.title
      )}&dates=${eventData.start}/${eventData.end}&details=${encodeURIComponent(
        eventData.description.replace(/\\n/g, '\n')
      )}&location=${encodeURIComponent(eventData.location)}`;
      window.open(gcalUrl, '_blank');
    });
  }
}

// --- 5. PHOTO GALLERY LIGHTBOX ---
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!modal) return;

  const galleryItems = Array.from(document.querySelectorAll('[data-gallery-item]'));
  let currentIndex = 0;

  function showImage(idx) {
    if (idx < 0) idx = galleryItems.length - 1;
    if (idx >= galleryItems.length) idx = 0;
    currentIndex = idx;

    const item = galleryItems[currentIndex];
    const src = item.getAttribute('data-full-img') || item.getAttribute('src');
    const title = item.getAttribute('data-title') || 'Ashima & Arpit';
    const desc = item.getAttribute('data-caption') || '';

    imgEl.src = src;
    imgEl.alt = title;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0', 'pointer-events-none');
    }, 10);
    document.body.classList.add('overflow-hidden');
  }

  function hideModal() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }, 300);
  }

  galleryItems.forEach((el, index) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showImage(index);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-backdrop')) {
      hideModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') hideModal();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

// --- 6. RSVP MODAL & SUBMISSION ENGINE ---
function initRSVP() {
  const openModalBtns = document.querySelectorAll('[data-open-rsvp]');
  const rsvpModal = document.getElementById('rsvp-modal');
  const closeRsvpBtn = document.getElementById('close-rsvp-modal');
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const successModal = document.getElementById('rsvp-success-modal');
  const closeSuccessBtn = document.getElementById('close-success-modal');

  function openModal() {
    if (rsvpModal) {
      rsvpModal.classList.remove('hidden');
      setTimeout(() => {
        rsvpModal.classList.remove('opacity-0', 'pointer-events-none');
      }, 10);
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeModal() {
    if (rsvpModal) {
      rsvpModal.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        rsvpModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }, 300);
    }
  }

  openModalBtns.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeRsvpBtn) closeRsvpBtn.addEventListener('click', closeModal);

  if (rsvpModal) {
    rsvpModal.addEventListener('click', (e) => {
      if (e.target === rsvpModal || e.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });
  }

  // Handle Form Submission
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(rsvpForm);
      const guestName = formData.get('guestName') || 'Honored Guest';
      const contact = formData.get('contact') || '';
      const attendance = formData.get('attendance') || 'Joyfully Accepts';
      const guestCount = formData.get('guestCount') || '1';
      const dietary = formData.get('dietary') || 'Pure Vegetarian';
      const message = formData.get('message') || '';

      const rsvpEntry = {
        guestName,
        contact,
        attendance,
        guestCount,
        dietary,
        message,
        timestamp: new Date().toISOString()
      };

      // Store in localStorage
      const existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      existing.push(rsvpEntry);
      localStorage.setItem('wedding_rsvps', JSON.stringify(existing));

      // Close RSVP form modal
      closeModal();

      // Show Royal Confirmation Pass Modal
      if (successModal) {
        const nameDisplay = document.getElementById('success-guest-name');
        const countDisplay = document.getElementById('success-guest-count');
        const statusDisplay = document.getElementById('success-status');

        if (nameDisplay) nameDisplay.textContent = guestName;
        if (countDisplay) countDisplay.textContent = `${guestCount} Guest${guestCount > 1 ? 's' : ''}`;
        if (statusDisplay) {
          statusDisplay.textContent = attendance === 'Joyfully Accepts' ? 'Attending with Joy' : 'Regretfully Declined';
        }

        successModal.classList.remove('hidden');
        setTimeout(() => {
          successModal.classList.remove('opacity-0', 'pointer-events-none');
        }, 10);
      }

      // Also auto add their wish to Blessings Wall if message is present
      if (message.trim().length > 3) {
        addBlessingToWall(guestName, message);
      }

      rsvpForm.reset();
    });
  }

  if (closeSuccessBtn && successModal) {
    closeSuccessBtn.addEventListener('click', () => {
      successModal.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        successModal.classList.add('hidden');
      }, 300);
    });
  }
}

// --- 7. BLESSINGS WALL / GUESTBOOK ---
function initBlessingsWall() {
  const form = document.getElementById('blessings-form');
  const defaultWishes = [
    {
      name: "The Oberoi & Verma Family",
      text: "Wishing radiant Ashima and Arpit a lifetime of golden sunsets, unconditional laughter, and eternal love. Cannot wait to dance at the Baraat in Zirakpur!",
      time: "2 hours ago"
    },
    {
      name: "Rohan & Meher",
      text: "Congratulations to the royal couple! May your journey together be as majestic and joyous as your wedding celebration. Counting down the days!",
      time: "Yesterday"
    },
    {
      name: "Dadi & Dadaji",
      text: "May Waheguru shower our beloved children Ashima and Arpit with endless happiness, health, and harmony as you begin this sacred chapter together.",
      time: "3 days ago"
    }
  ];

  const listContainer = document.getElementById('blessings-list');
  if (!listContainer) return;

  // Load from localStorage or defaults
  const stored = JSON.parse(localStorage.getItem('wedding_blessings') || 'null');
  const wishes = stored || defaultWishes;

  renderWishes(wishes);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('blessing-author');
      const textInput = document.getElementById('blessing-text');

      if (!nameInput.value || !textInput.value) return;

      addBlessingToWall(nameInput.value, textInput.value);

      nameInput.value = '';
      textInput.value = '';

      // Toast feedback
      showToast('Your heartfelt blessing has been inscribed on the Royal Scroll! ✨');
    });
  }
}

function addBlessingToWall(name, text) {
  const current = JSON.parse(localStorage.getItem('wedding_blessings') || '[]');
  const newBlessing = {
    name,
    text,
    time: "Just now"
  };
  current.unshift(newBlessing);
  localStorage.setItem('wedding_blessings', JSON.stringify(current));

  renderWishes(current);
}

function renderWishes(items) {
  const container = document.getElementById('blessings-list');
  if (!container) return;

  container.innerHTML = items
    .slice(0, 6)
    .map(
      (b) => `
    <div class="royal-card p-5 rounded-xl border border-amber-600/30 relative overflow-hidden transition-all duration-300 hover:border-amber-400/60">
      <div class="corner-flourish corner-tl opacity-60"></div>
      <div class="corner-flourish corner-br opacity-60"></div>
      <p class="font-elegant text-lg md:text-xl text-amber-100 italic leading-relaxed mb-3">
        "${escapeHtml(b.text)}"
      </p>
      <div class="flex items-center justify-between text-xs tracking-wider border-t border-amber-800/40 pt-3">
        <span class="font-royal font-bold text-amber-300 uppercase">${escapeHtml(b.name)}</span>
        <span class="text-amber-200/50">${b.time}</span>
      </div>
    </div>
  `
    )
    .join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function showToast(message) {
  let toast = document.getElementById('royal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'royal-toast';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-amber-950/95 text-amber-100 px-6 py-3 rounded-full border border-amber-400 shadow-2xl text-sm font-royal z-50 transition-all duration-300 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 4000);
}

// --- 8. SCROLL REVEAL OBSERVER ---
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

// --- 9. MOBILE MENU TOGGLE ---
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !menu) return;

  function toggle() {
    const isClosed = menu.classList.contains('hidden');
    if (isClosed) {
      menu.classList.remove('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      menu.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  toggleBtn.addEventListener('click', toggle);

  links.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

// --- DOM READY INIT ---
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initPetalShower();
  initCalendarButtons();
  initLightbox();
  initRSVP();
  initBlessingsWall();
  initScrollReveal();
  initMobileMenu();

  // Floating Music Button listener
  const musicBtn = document.getElementById('music-toggle-btn');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      musicEngine.toggle();
    });
  }

  // Automatic Audio Playback on Launch / First User Interaction
  musicEngine.setupAutoPlay();
});

