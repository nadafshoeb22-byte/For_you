/* ==========================================================================
   FOR FIZA ❤️ — App Logic
   Sections:
   1. Page navigation (single-page app, one screen visible at a time)
   2. Ripple + button micro-interactions
   3. Home page
   4. Love page (typing animation + floating hearts)
   5. Letter page (envelope open + typewriter letter)
   6. Voice page (custom audio player + waveform)
   7. Surprise page (particles: gold sparks, stars, confetti + hearts)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1. PAGE NAVIGATION
  ------------------------------------------------------------------ */
  const screens   = document.querySelectorAll('.screen');
  const navBtns   = document.querySelectorAll('.nav-btn');
  const navGlow   = document.getElementById('navGlow');
  const bottomNav = document.getElementById('bottomNav');

  const pageOrder = ['home', 'love', 'letter', 'voice', 'surprise'];

  function positionNavGlow(activeBtn){
    if (!activeBtn) return;
    const navRect = bottomNav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const center = (btnRect.left - navRect.left) + (btnRect.width / 2) - 3; // 3 = half glow dot
    navGlow.style.left = `${center}px`;
  }

  function goToPage(name){
    const target = document.getElementById(`page-${name}`);
    if (!target) return;

    screens.forEach(s => {
      if (s.classList.contains('active') && s !== target){
        s.classList.add('leaving');
        s.classList.remove('active');
        setTimeout(() => s.classList.remove('leaving'), 600);
      }
    });

    target.classList.add('active');

    navBtns.forEach(b => b.classList.toggle('active', b.dataset.target === name));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${name}"]`);
    positionNavGlow(activeBtn);

    // Page-specific "on enter" behaviour
    if (name === 'love')     startLoveHearts();
    if (name === 'voice')    initWaveformIdle();
    if (name === 'surprise') enterSurprisePage();
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.target));
  });

  // Position the glow dot correctly once layout has settled
  window.addEventListener('load', () => positionNavGlow(document.querySelector('.nav-btn.active')));
  window.addEventListener('resize', () => positionNavGlow(document.querySelector('.nav-btn.active')));

  /* ------------------------------------------------------------------
     2. RIPPLE + BUTTON PRESS EFFECT
  ------------------------------------------------------------------ */
  function attachRipple(el){
    el.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${(e.clientX ?? rect.left + rect.width/2) - rect.left - size/2}px`;
      ripple.style.top  = `${(e.clientY ?? rect.top + rect.height/2) - rect.top - size/2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }
  document.querySelectorAll('.ripple-btn').forEach(attachRipple);

  /* ------------------------------------------------------------------
     3. HOME PAGE
  ------------------------------------------------------------------ */
  document.getElementById('startSurpriseBtn').addEventListener('click', () => {
    goToPage('love');
  });

  /* ------------------------------------------------------------------
     4. LOVE PAGE — typing animation + floating hearts
  ------------------------------------------------------------------ */
  const loveMessages = [
    "Har din tumhare bina adhoora lagta hai... tum meri sabse pyari duaa ho.",
    "Tumhari muskurahat meri sabse khoobsurat wish hai, jaldi theek ho jao.",
    "Main tumhare saath hoon, har lamha, har dua mein.",
    "Tum bohot strong ho meri jaan, thoda sa aur sabr — main yahin hoon.",
    "Allah tumhe jaldi shifa de, tumhare bina sab kuch adhoora hai."
  ];
  let loveIndex = 0;
  let typingTimer = null;
  const loveTypingEl = document.getElementById('loveTypingText');

  function typeMessage(text){
    clearInterval(typingTimer);
    loveTypingEl.innerHTML = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.innerHTML = '&nbsp;';

    typingTimer = setInterval(() => {
      if (i < text.length){
        loveTypingEl.textContent = text.slice(0, i + 1);
        loveTypingEl.appendChild(cursor);
        i++;
      } else {
        clearInterval(typingTimer);
      }
    }, 32);
  }

  document.getElementById('loveNextBtn').addEventListener('click', () => {
    loveIndex = (loveIndex + 1) % loveMessages.length;
    typeMessage(loveMessages[loveIndex]);
  });
  document.getElementById('lovePrevBtn').addEventListener('click', () => {
    loveIndex = (loveIndex - 1 + loveMessages.length) % loveMessages.length;
    typeMessage(loveMessages[loveIndex]);
  });

  let loveStarted = false;
  function startLoveHearts(){
    if (!loveStarted){
      typeMessage(loveMessages[loveIndex]);
      loveStarted = true;
    }
  }

  const loveHeartsContainer = document.getElementById('loveHearts');
  const heartEmojis = ['❤️','💗','💕','💖','💓'];
  function spawnFloatingHeart(container){
    if (!container) return;
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    const startX = Math.random() * 100;
    const drift = (Math.random() * 80 - 40) + 'px';
    const duration = 5 + Math.random() * 5;
    heart.style.left = `${startX}%`;
    heart.style.setProperty('--drift', drift);
    heart.style.animationDuration = `${duration}s`;
    heart.style.fontSize = `${14 + Math.random() * 14}px`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 200);
  }
  // Continuously spawn hearts on love + surprise pages
  setInterval(() => {
    const lovePage = document.getElementById('page-love');
    const surprisePage = document.getElementById('page-surprise');
    if (lovePage.classList.contains('active')) spawnFloatingHeart(loveHeartsContainer);
    if (surprisePage.classList.contains('active')) spawnFloatingHeart(document.getElementById('surpriseHearts'));
  }, 700);

  /* ------------------------------------------------------------------
     5. LETTER PAGE — envelope open + typewriter letter
  ------------------------------------------------------------------ */
  const envelope     = document.getElementById('envelope');
  const letterPaper   = document.getElementById('letterPaper');
  const envelopeWrap  = document.getElementById('envelopeWrap');
  const letterTypedEl = document.getElementById('letterTypedText');

  const letterFullText =
`Mujhe pata hai ye din thode mushkil hain, lekin main chahta hoon tumhe yaad rahe ke tum akeli nahi ho.

Tumhari himmat aur tumhari muskurahat hi meri sabse badi taqat hai.

Jald hi sab theek ho jayega, aur hum phir se un pyaare pal ko jiyenge.

Tum jaldi theek ho jao — yahi meri sabse badi dua hai.`;

  let letterOpened = false;
  let letterTypeTimer = null;

  function typeLetter(){
    clearInterval(letterTypeTimer);
    letterTypedEl.textContent = '';
    let i = 0;
    letterTypeTimer = setInterval(() => {
      if (i < letterFullText.length){
        letterTypedEl.textContent += letterFullText.charAt(i);
        i++;
      } else {
        clearInterval(letterTypeTimer);
      }
    }, 22);
  }

  envelope.addEventListener('click', () => {
    if (letterOpened) return;
    letterOpened = true;
    envelope.classList.add('open');
    envelopeWrap.classList.add('opened');
    setTimeout(() => {
      letterPaper.classList.add('visible');
      typeLetter();
    }, 350);
  });

  /* ------------------------------------------------------------------
     6. VOICE PAGE — custom audio player + waveform
  ------------------------------------------------------------------ */
  const audio         = document.getElementById('voiceAudio');
  const playPauseBtn  = document.getElementById('playPauseBtn');
  const iconPlay      = document.getElementById('iconPlay');
  const iconPause     = document.getElementById('iconPause');
  const progressTrack = document.getElementById('progressTrack');
  const progressFill  = document.getElementById('progressFill');
  const progressKnob  = document.getElementById('progressKnob');
  const timeCurrent   = document.getElementById('timeCurrent');
  const timeTotal     = document.getElementById('timeTotal');
  const vinyl         = document.getElementById('vinyl');
  const waveform      = document.getElementById('waveform');

  // Build waveform bars
  const BAR_COUNT = 28;
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++){
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    waveform.appendChild(bar);
    bars.push(bar);
  }
  let waveAnimId = null;
  function animateWaveform(active){
    bars.forEach(bar => {
      const h = active ? (6 + Math.random() * 38) : 8;
      bar.style.height = `${h}px`;
    });
    if (active) waveAnimId = requestAnimationFrame(() => animateWaveform(true));
  }
  function initWaveformIdle(){
    if (!waveAnimId) bars.forEach(bar => bar.style.height = '8px');
  }

  function formatTime(sec){
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function playAudio(){
    audio.play().then(() => {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      vinyl.classList.add('spinning');
      if (!waveAnimId){ animateWaveform(true); }
    }).catch(() => { /* autoplay blocked — user gesture required */ });
  }
  function pauseAudio(){
    audio.pause();
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    vinyl.classList.remove('spinning');
    cancelAnimationFrame(waveAnimId);
    waveAnimId = null;
    animateWaveform(false);
  }

  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) playAudio(); else pauseAudio();
  });

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    progressFill.style.width = `${pct}%`;
    progressKnob.style.left = `${pct}%`;
    timeCurrent.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener('ended', () => pauseAudio());

  // Seek by tapping/dragging the progress track
  function seekFromEvent(e){
    const rect = progressTrack.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    if (isFinite(audio.duration)) audio.currentTime = pct * audio.duration;
  }
  progressTrack.addEventListener('click', seekFromEvent);

  /* ------------------------------------------------------------------
     7. SURPRISE PAGE — particles (gold sparks, stars, confetti)
  ------------------------------------------------------------------ */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let particlesRunning = false;

  function resizeCanvas(){
    const frame = document.getElementById('appFrame');
    canvas.width = frame.clientWidth;
    canvas.height = frame.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = ['#ff4f9a', '#ffd48a', '#ffffff', '#ff8ac0'];

  function createParticle(){
    const type = Math.random();
    const base = {
      x: Math.random() * canvas.width,
      y: -10,
      vy: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.6,
      size: 2 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 4,
      opacity: 0.6 + Math.random() * 0.4
    };
    if (type < 0.34){
      return { ...base, kind: 'star', color: '#ffffff' };
    } else if (type < 0.67){
      return { ...base, kind: 'spark', color: '#ffd48a', size: 1.5 + Math.random() * 2 };
    } else {
      return { ...base, kind: 'confetti', color: confettiColors[Math.floor(Math.random() * confettiColors.length)], size: 4 + Math.random() * 4 };
    }
  }

  function drawParticle(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    if (p.kind === 'star'){
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      drawStarShape(p.size);
    } else if (p.kind === 'spark'){
      ctx.shadowColor = '#ffd48a';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowBlur = 0;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
    }
    ctx.restore();
  }

  function drawStarShape(size){
    ctx.beginPath();
    for (let i = 0; i < 5; i++){
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size, -Math.sin((18 + i * 72) * Math.PI / 180) * size);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * size * 0.4, -Math.sin((54 + i * 72) * Math.PI / 180) * size * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }

  function particleLoop(){
    if (!particlesRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.55 && particles.length < 140){
      particles.push(createParticle());
    }

    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rotation += p.rotSpeed;
      drawParticle(p);
    });

    particles = particles.filter(p => p.y < canvas.height + 20);
    requestAnimationFrame(particleLoop);
  }

  function enterSurprisePage(){
    resizeCanvas();
    if (!particlesRunning){
      particlesRunning = true;
      particleLoop();
    }
    typeSurpriseMessage();
    // Attempt autoplay of the voice message on the surprise reveal
    audio.currentTime = 0;
    playAudio();
  }

  const surpriseFullMessage = "Allah tumhe jaldi se mukammal shifa de.";
  const surpriseMsgEl = document.getElementById('surpriseMessage');
  let surpriseTyped = false;
  function typeSurpriseMessage(){
    if (surpriseTyped) return;
    surpriseTyped = true;
    let i = 0;
    surpriseMsgEl.textContent = '';
    const timer = setInterval(() => {
      if (i < surpriseFullMessage.length){
        surpriseMsgEl.textContent += surpriseFullMessage.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 45);
  }

  // Stagger the title word-reveal animation delays
  document.querySelectorAll('#surpriseTitle .word').forEach((word, i) => {
    word.style.animationDelay = `${0.15 + i * 0.18}s`;
  });

});
