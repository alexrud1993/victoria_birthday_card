import confetti from 'canvas-confetti';
import './style.css';

const CORRECT_ANSWER = '32';
const CELEBRATION_DURATION = 4500;
const SLIDE_DURATION = 4000;
const FIREWORK_COUNT = 12;
const MUSIC_VOLUME = 0.35;
const app = document.querySelector('#app');
const getAssetPath = (path) => `${import.meta.env.BASE_URL}${path}`;
const MUSIC_SRC = getAssetPath('assets/music/music.mp3');
const GIFT_WRAP_SRC = getAssetPath('assets/gifts/paket.jpg');

const slides = [
  {
    image: getAssetPath('assets/photos/photo1.jpg'),
    title: 'Сьогодні не просто дата',
    text: 'Це день людини, яка робить мій світ теплішим.',
  },
  {
    image: getAssetPath('assets/photos/photo2.jpg'),
    title: '31 + 1 = 32',
    text: 'Але це не просто число. Це ще один рік твоєї краси, сили й світла.',
  },
  {
    image: getAssetPath('assets/photos/photo3.jpg'),
    title: 'Твоя усмішка',
    text: 'Вона вміє робити звичайний день особливим.',
  },
  {
    image: getAssetPath('assets/photos/photo4.jpg'),
    title: 'Твоя ніжність',
    text: 'У ній є те, що не купиш і не підробиш.',
  },
  {
    image: getAssetPath('assets/photos/photo5.jpg'),
    title: 'Твоя сила',
    text: 'Ти проходиш своє красиво, навіть коли непросто.',
  },
  {
    image: getAssetPath('assets/photos/photo6.jpg'),
    title: 'І моє головне бажання',
    text: 'Щоб ти частіше посміхалась і відчувала себе коханою.',
  },
];

const gifts = [
  {
    image: getAssetPath('assets/gifts/comb.png'),
    label: 'Подарунок №1',
    title: 'Розчіска',
    text: 'Щоб кожен день починався з краси.',
    fallback: '✨',
  },
  {
    image: getAssetPath('assets/gifts/necklace.png'),
    label: 'Подарунок №2',
    title: 'Намисто',
    text: 'Бо тобі пасує сяяти.',
    fallback: '💎',
  },
];

let celebrationTimerId;
let slideTimerId;
let slideRenderTimerId;
let musicAudio;
let musicFadeTimerId;
let activeSlideIndex = 0;
let openedGiftIndexes = new Set();
let isMusicOn = false;
let isMusicUnavailable = false;

function isCorrectAnswer(answer) {
  return answer.trim() === CORRECT_ANSWER;
}

function clearCelebrationTimer() {
  if (celebrationTimerId) {
    window.clearTimeout(celebrationTimerId);
    celebrationTimerId = undefined;
  }
}

function clearSlideTimer() {
  if (slideTimerId) {
    window.clearTimeout(slideTimerId);
    slideTimerId = undefined;
  }
}

function clearSlideRenderTimer() {
  if (slideRenderTimerId) {
    window.clearTimeout(slideRenderTimerId);
    slideRenderTimerId = undefined;
  }
}

function clearMusicFade() {
  if (musicFadeTimerId) {
    window.clearInterval(musicFadeTimerId);
    musicFadeTimerId = undefined;
  }
}

function getMusicLabel() {
  if (isMusicUnavailable) {
    return 'Музика недоступна';
  }

  if (isMusicOn) {
    return 'Музика увімкнена 🎵';
  }

  return musicAudio ? 'Музика вимкнена' : 'Увімкнути музику 🎵';
}

function getMusicStatusText() {
  return isMusicUnavailable ? 'Музика недоступна, але магія працює ✨' : '';
}

function getMusicControlMarkup() {
  return `
    <div class="music-panel">
      <button
        class="music-toggle"
        type="button"
        aria-label="${getMusicLabel()}"
        aria-pressed="${isMusicOn}"
        ${isMusicUnavailable ? 'disabled' : ''}
      >
        ${getMusicLabel()}
      </button>
      <p class="music-status" aria-live="polite">${getMusicStatusText()}</p>
    </div>
  `;
}

function updateMusicControls() {
  document.querySelectorAll('.music-toggle').forEach((button) => {
    button.textContent = getMusicLabel();
    button.setAttribute('aria-label', getMusicLabel());
    button.setAttribute('aria-pressed', String(isMusicOn));
    button.disabled = isMusicUnavailable;
  });

  document.querySelectorAll('.music-status').forEach((status) => {
    status.textContent = getMusicStatusText();
  });
}

function showMusicUnavailableMessage() {
  isMusicOn = false;
  isMusicUnavailable = true;
  clearMusicFade();

  updateMusicControls();
}

function getMusicAudio() {
  if (musicAudio) {
    return musicAudio;
  }

  musicAudio = new Audio(MUSIC_SRC);
  musicAudio.loop = true;
  musicAudio.preload = 'none';
  musicAudio.volume = 0;
  musicAudio.addEventListener('error', showMusicUnavailableMessage);

  return musicAudio;
}

function fadeMusicVolume(targetVolume, onComplete) {
  const audio = getMusicAudio();
  const step = targetVolume > audio.volume ? 0.025 : -0.025;

  clearMusicFade();
  musicFadeTimerId = window.setInterval(() => {
    const nextVolume = audio.volume + step;
    const reachedTarget = step > 0 ? nextVolume >= targetVolume : nextVolume <= targetVolume;

    audio.volume = reachedTarget ? targetVolume : Math.max(0, Math.min(MUSIC_VOLUME, nextVolume));

    if (reachedTarget) {
      clearMusicFade();
      onComplete?.();
    }
  }, 55);
}

async function turnMusicOn() {
  const audio = getMusicAudio();

  try {
    audio.volume = 0;
    await audio.play();
    isMusicOn = true;
    fadeMusicVolume(MUSIC_VOLUME);
  } catch {
    showMusicUnavailableMessage();
  }

  updateMusicControls();
}

function turnMusicOff() {
  if (!musicAudio) {
    return;
  }

  isMusicOn = false;
  fadeMusicVolume(0, () => {
    musicAudio.pause();
  });
  updateMusicControls();
}

function toggleMusic() {
  if (isMusicUnavailable) {
    showMusicUnavailableMessage();
    return;
  }

  if (isMusicOn) {
    turnMusicOff();
    return;
  }

  turnMusicOn();
}

function attachMusicControl() {
  document.querySelectorAll('.music-toggle').forEach((button) => {
    button.addEventListener('click', toggleMusic);
  });

  updateMusicControls();
}

function launchConfetti() {
  const confettiDefaults = {
    colors: ['#ffe08a', '#ff7ac8', '#b27cff', '#fff8ef'],
    disableForReducedMotion: true,
    origin: { y: 0.62 },
    scalar: 0.92,
    spread: 70,
    ticks: 180,
  };

  confetti({
    ...confettiDefaults,
    angle: 58,
    particleCount: 70,
    origin: { x: 0.08, y: 0.72 },
  });

  confetti({
    ...confettiDefaults,
    angle: 122,
    particleCount: 70,
    origin: { x: 0.92, y: 0.72 },
  });

  window.setTimeout(() => {
    confetti({
      ...confettiDefaults,
      particleCount: 95,
      spread: 92,
      startVelocity: 34,
      origin: { x: 0.5, y: 0.58 },
    });
  }, 650);
}

function showFireworks() {
  const fireworksLayer = document.querySelector('.fireworks-layer');

  if (!fireworksLayer) {
    return;
  }

  fireworksLayer.innerHTML = '';

  for (let index = 0; index < FIREWORK_COUNT; index += 1) {
    const firework = document.createElement('span');
    const x = 12 + Math.random() * 76;
    const y = 10 + Math.random() * 56;
    const size = 72 + Math.random() * 78;
    const delay = Math.random() * 2.6;
    const duration = 1.45 + Math.random() * 0.65;
    const hue = ['#ffe08a', '#ff7ac8', '#b27cff', '#fff8ef'][index % 4];

    firework.className = 'firework';
    firework.style.setProperty('--x', `${x}%`);
    firework.style.setProperty('--y', `${y}%`);
    firework.style.setProperty('--size', `${size}px`);
    firework.style.setProperty('--delay', `${delay}s`);
    firework.style.setProperty('--duration', `${duration}s`);
    firework.style.setProperty('--spark-color', hue);
    fireworksLayer.append(firework);
  }
}

function launchGiftConfetti(index) {
  const originX = gifts.length === 1 ? 0.5 : 0.28 + index * 0.44;

  confetti({
    colors: ['#ffe08a', '#ff7ac8', '#b27cff', '#fff8ef'],
    disableForReducedMotion: true,
    origin: { x: originX, y: 0.72 },
    particleCount: 48,
    scalar: 0.82,
    spread: 58,
    startVelocity: 28,
    ticks: 120,
  });
}

function launchFinalConfetti() {
  confetti({
    colors: ['#ffe08a', '#fff2d2', '#ff9bd5', '#cba7ff'],
    disableForReducedMotion: true,
    origin: { x: 0.5, y: 0.68 },
    particleCount: 72,
    scalar: 0.72,
    spread: 82,
    startVelocity: 24,
    ticks: 160,
  });
}

function showFinalScreen() {
  clearCelebrationTimer();
  clearSlideTimer();
  clearSlideRenderTimer();

  app.innerHTML = `
    <section class="final-screen" aria-labelledby="final-title">
      <article class="final-card">
        <p class="eyebrow">Фінальне привітання</p>
        <h1 id="final-title">З Днем народження, моя Вікулька ❤️</h1>
        <p class="final-message">
          Бажаю тобі більше посмішок, приємних сюрпризів і здійснених бажань.
          Ти заслуговуєш на любов, турботу і спокій. Я хочу, щоб у твоєму житті
          було більше легкості, тепла, краси й моментів, у яких ти відчуваєш
          себе щасливою.
        </p>
        <p class="final-signature">Люблю тебе! Твій Сашко ❤️</p>

        ${getMusicControlMarkup()}

        <div class="replay-area">
          <button class="wish-button replay-button" type="button" aria-label="Передивитися привітання ще раз">Передивитися ще раз</button>
          <div class="replay-choices" hidden>
            <button class="secondary-button replay-photo" type="button" aria-label="Повернутися до фотоісторії">До фото</button>
            <button class="secondary-button replay-start" type="button" aria-label="Повернутися на початок сайту">На початок</button>
          </div>
        </div>
      </article>
    </section>
  `;

  attachMusicControl();
  document.querySelector('.replay-button').addEventListener('click', () => {
    document.querySelector('.replay-choices').hidden = false;
  });
  document.querySelector('.replay-photo').addEventListener('click', goToPhotoStory);
  document.querySelector('.replay-start').addEventListener('click', renderStartScreen);
  launchFinalConfetti();
}

function getGiftMarkup(gift, index) {
  return `
    <button
      class="gift-box"
      type="button"
      data-gift-index="${index}"
      aria-label="${gift.label}"
      style="--gift-wrap-image: url('${GIFT_WRAP_SRC}')"
    >
      <span class="gift-closed">
        <span class="gift-lid"></span>
        <span class="gift-ribbon"></span>
        <span class="gift-body"></span>
        <span class="gift-label">${gift.label}</span>
      </span>

      <span class="gift-opened" aria-live="polite">
        <span class="gift-image-wrap">
          <img src="${gift.image}" alt="Подарунок: ${gift.title}" />
          <span class="gift-image-fallback">${gift.fallback}</span>
        </span>
        <span class="gift-title">${gift.title}</span>
        <span class="gift-text">${gift.text}</span>
      </span>
    </button>
  `;
}

function goToGiftZone() {
  clearCelebrationTimer();
  clearSlideTimer();
  clearSlideRenderTimer();
  openedGiftIndexes = new Set();

  app.innerHTML = `
    <section class="gift-zone-screen" aria-labelledby="gift-zone-title">
      <div class="gift-zone-header">
        <p class="eyebrow">Подарункова зона</p>
        <h1 id="gift-zone-title">А тепер маленькі подарунки 🎁</h1>
        <p>Натисни на коробки, щоб відкрити сюрпризи.</p>
        ${getMusicControlMarkup()}
      </div>

      <div class="gifts-grid">
        ${gifts.map((gift, index) => getGiftMarkup(gift, index)).join('')}
      </div>

      <button class="wish-button final-button" type="button" aria-label="Перейти до фінального привітання" hidden>Фінальне привітання</button>
    </section>
  `;

  attachMusicControl();
  document.querySelectorAll('.gift-box').forEach((box) => {
    box.addEventListener('click', () => {
      openGift(Number(box.dataset.giftIndex));
    });
  });

  document.querySelector('.final-button').addEventListener('click', showFinalScreen);
}

function handleMissingGiftImage(image) {
  const imageWrap = image.closest('.gift-image-wrap');

  if (imageWrap) {
    imageWrap.classList.add('has-missing-image');
  }
}

function updateFinalButtonVisibility() {
  const finalButton = document.querySelector('.final-button');

  if (finalButton && openedGiftIndexes.size === gifts.length) {
    finalButton.hidden = false;
  }
}

function openGift(index) {
  if (openedGiftIndexes.has(index)) {
    return;
  }

  const giftBox = document.querySelector(`[data-gift-index="${index}"]`);

  if (!giftBox) {
    return;
  }

  openedGiftIndexes.add(index);
  giftBox.classList.add('is-open');
  giftBox.disabled = true;
  giftBox.setAttribute('aria-label', `${gifts[index].title}. ${gifts[index].text}`);

  const image = giftBox.querySelector('img');
  image.addEventListener('error', () => handleMissingGiftImage(image), { once: true });

  if (image.complete && image.naturalWidth === 0) {
    handleMissingGiftImage(image);
  }

  launchGiftConfetti(index);
  updateFinalButtonVisibility();
}

function getProgressMarkup() {
  return slides
    .map((slide, index) => {
      const isActive = index === activeSlideIndex ? 'is-active' : '';
      const label = `${index + 1} з ${slides.length}: ${slide.title}`;

      return `
        <button
          class="slide-dot ${isActive}"
          type="button"
          data-slide-index="${index}"
          aria-label="${label}"
        >
          <span></span>
        </button>
      `;
    })
    .join('');
}

function scheduleNextSlide() {
  clearSlideTimer();
  slideTimerId = window.setTimeout(() => {
    if (activeSlideIndex === slides.length - 1) {
      goToGiftZone();
      return;
    }

    showSlide(activeSlideIndex + 1);
  }, SLIDE_DURATION);
}

function renderSlideContent({ slide, slideFrame, progress }) {
  slideFrame.innerHTML = `
    <div class="slide-media">
      <img src="${slide.image}" alt="Фотоісторія: ${slide.title}" />
      <div class="slide-fallback" aria-hidden="true">
        <span>Фото скоро з'явиться</span>
      </div>
    </div>
    <div class="slide-copy">
      <p class="slide-count">${activeSlideIndex + 1} / ${slides.length}</p>
      <h2>${slide.title}</h2>
      <p>${slide.text}</p>
    </div>
  `;

  const slideImage = slideFrame.querySelector('img');
  slideImage.addEventListener('error', () => handleMissingSlideImage(slideImage), { once: true });

  if (slideImage.complete && slideImage.naturalWidth === 0) {
    handleMissingSlideImage(slideImage);
  }

  progress.innerHTML = getProgressMarkup();
  progress.querySelectorAll('.slide-dot').forEach((button) => {
    button.addEventListener('click', () => {
      showSlide(Number(button.dataset.slideIndex));
    });
  });

  window.requestAnimationFrame(() => {
    slideFrame.classList.remove('is-changing');
  });
  scheduleNextSlide();
}

function handleMissingSlideImage(image) {
  const slideMedia = image.closest('.slide-media');

  if (slideMedia) {
    slideMedia.classList.add('has-missing-image');
  }
}

function showSlide(index) {
  clearSlideTimer();
  clearSlideRenderTimer();
  activeSlideIndex = Math.max(0, Math.min(index, slides.length - 1));
  const slide = slides[activeSlideIndex];
  const slideFrame = document.querySelector('.slide-frame');
  const progress = document.querySelector('.slide-progress');

  if (!slideFrame || !progress) {
    return;
  }

  const hasRenderedSlide = slideFrame.children.length > 0;
  slideFrame.classList.toggle('is-changing', hasRenderedSlide);
  slideRenderTimerId = window.setTimeout(
    () => renderSlideContent({ slide, slideFrame, progress }),
    hasRenderedSlide ? 260 : 0,
  );
}

function goToPreviousSlide() {
  showSlide(activeSlideIndex === 0 ? slides.length - 1 : activeSlideIndex - 1);
}

function goToNextSlide() {
  if (activeSlideIndex === slides.length - 1) {
    goToGiftZone();
    return;
  }

  showSlide(activeSlideIndex + 1);
}

function goToPhotoStory() {
  clearCelebrationTimer();
  clearSlideTimer();
  clearSlideRenderTimer();
  activeSlideIndex = 0;

  app.innerHTML = `
    <section class="photo-story-screen" aria-labelledby="photo-story-title">
      <div class="photo-story-header">
        <p class="eyebrow">Фотоісторія</p>
        <h1 id="photo-story-title">Наш маленький відеоряд</h1>
        ${getMusicControlMarkup()}
      </div>

      <div class="slide-frame" aria-live="polite"></div>

      <div class="slide-progress" aria-label="Прогрес фотоісторії"></div>

      <div class="slide-controls">
        <button class="secondary-button previous-slide" type="button" aria-label="Показати попередній слайд">Назад</button>
        <button class="wish-button next-slide" type="button" aria-label="Показати наступний слайд">Далі</button>
        <button class="secondary-button skip-story" type="button" aria-label="Пропустити фотоісторію і перейти до подарунків">Пропустити до подарунків</button>
      </div>
    </section>
  `;

  attachMusicControl();
  document.querySelector('.previous-slide').addEventListener('click', goToPreviousSlide);
  document.querySelector('.next-slide').addEventListener('click', goToNextSlide);
  document.querySelector('.skip-story').addEventListener('click', goToGiftZone);
  showSlide(activeSlideIndex);
}

function startCelebration() {
  clearCelebrationTimer();

  app.innerHTML = `
    <section class="celebration-screen" aria-labelledby="celebration-title">
      <div class="fireworks-layer" aria-hidden="true"></div>
      <div class="celebration-content">
        <p class="eyebrow">Сюрприз відкрито</p>
        <h1 id="celebration-title">Вікторіє, з Днем народження! ✨</h1>
        <p class="celebration-subtitle">
          Сьогодні твій день. І це маленький сюрприз для тебе.
        </p>
        ${getMusicControlMarkup()}
        <button class="wish-button continue-button" type="button" aria-label="Продовжити до фотоісторії">Продовжити</button>
      </div>
    </section>
  `;

  attachMusicControl();
  document.querySelector('.continue-button').addEventListener('click', goToPhotoStory);
  launchConfetti();
  showFireworks();
  celebrationTimerId = window.setTimeout(goToPhotoStory, CELEBRATION_DURATION);
}

function switchToCelebrationScreen(currentScreen) {
  let didSwitch = false;
  const finishSwitch = () => {
    if (didSwitch) {
      return;
    }

    didSwitch = true;
    startCelebration();
  };

  currentScreen.classList.add('is-leaving');

  currentScreen.addEventListener('transitionend', finishSwitch, { once: true });
  window.setTimeout(finishSwitch, 520);
}

function handleAnswerSubmit({ input, message, screen }) {
  if (isCorrectAnswer(input.value)) {
    switchToCelebrationScreen(screen);
    return;
  }

  message.textContent = 'Не зовсім 😊 Спробуй ще раз';
  input.select();
}

function renderStartScreen() {
  app.innerHTML = `
    <section class="birthday-card check-card" aria-labelledby="check-title">
      <p class="eyebrow">Перед сюрпризом</p>
      <h1 id="check-title" class="check-title">Маленька перевірка перед сюрпризом</h1>

      <form class="check-form" novalidate>
        <label class="question-label" for="answer-input">Скільки буде 31 + 1?</label>
        <input
          class="answer-input"
          id="answer-input"
          name="answer"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="Введи відповідь"
          aria-describedby="answer-message"
        />
        <p class="answer-message" id="answer-message" aria-live="polite"></p>
        <button class="wish-button" type="submit" aria-label="Перевірити відповідь і перейти далі">Далі</button>
      </form>
    </section>
  `;

  const checkCard = document.querySelector('.check-card');
  const form = document.querySelector('.check-form');
  const input = document.querySelector('.answer-input');
  const message = document.querySelector('.answer-message');

  input.focus();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleAnswerSubmit({ input, message, screen: checkCard });
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAnswerSubmit({ input, message, screen: checkCard });
    }
  });
}

renderStartScreen();
