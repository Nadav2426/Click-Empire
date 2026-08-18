'use strict';

// ---------- Game configuration ----------

const SAVE_KEY = 'clickEmpireSaveV1';
const AUTO_SAVE_INTERVAL = 5000;
const COMBO_WINDOW = 850;
const COMBO_RESET_TIME = 1450;
const CLICK_GUARD = {
  minimumInterval: 26,
  burstWindow: 1000,
  maximumBurst: 22,
  patternSample: 14,
  maximumPatternMean: 125,
  maximumPatternDeviation: 2.25,
  blockDuration: 1600,
};

const upgradeDefinitions = {
  strongerClick: {
    name: 'Stronger Click',
    icon: '▲',
    description: 'Add plates to every press',
    baseCost: 25,
    growth: 1.62,
    effect: '+1 coin per click',
  },
  autoClicker: {
    name: 'Auto Clicker',
    icon: '↻',
    description: 'Your tireless training partner',
    baseCost: 100,
    growth: 1.68,
    effect: '+1 coin per second',
  },
  factory: {
    name: 'Factory',
    icon: '▥',
    description: 'The iron foundry works nonstop',
    baseCost: 500,
    growth: 1.78,
    effect: '+10 coins per second',
  },
  kettlebellSet: {
    name: 'Kettlebell Set',
    icon: '●',
    description: 'Heavy tools for heavier reps',
    baseCost: 1500,
    growth: 1.7,
    effect: '+5 coins per click',
  },
  megaClick: {
    name: 'Mega Click',
    icon: '★',
    description: 'Break your personal record',
    baseCost: 2500,
    growth: 3,
    effect: 'x2 total click power',
  },
  proteinLab: {
    name: 'Protein Lab',
    icon: '▲',
    description: 'Fuel round-the-clock production',
    baseCost: 5000,
    growth: 1.74,
    effect: '+25 coins per second',
  },
  personalTrainer: {
    name: 'Personal Trainer',
    icon: '◎',
    description: 'Double the output of every system',
    baseCost: 25000,
    growth: 2.3,
    effect: 'x2 all coin production',
  },
  gymFranchise: {
    name: 'Gym Franchise',
    icon: '▦',
    description: 'Open training floors everywhere',
    baseCost: 100000,
    growth: 1.85,
    effect: '+250 coins per second',
  },
  championBelt: {
    name: 'Champion Belt',
    icon: '◆',
    description: 'Turn elite reps into fortunes',
    baseCost: 1000000,
    growth: 3.2,
    effect: 'x3 total click power',
  },
};

const worldDefinitions = {
  ironHouse: {
    name: 'Iron House',
    icon: '◆',
    requiredRebirths: 0,
    multiplier: 1,
    description: 'The original underground training floor.',
  },
  titanYard: {
    name: 'Titan Yard',
    icon: '▲',
    requiredRebirths: 1,
    multiplier: 2,
    description: 'An open-air forge built for stronger lifters.',
  },
  muscleBeach: {
    name: 'Muscle Beach',
    icon: '☀',
    requiredRebirths: 5,
    multiplier: 4,
    description: 'Sun, salt, and four-times production sessions.',
  },
  lunarLab: {
    name: 'Lunar Lift Lab',
    icon: '●',
    requiredRebirths: 10,
    multiplier: 10,
    description: 'Low gravity. Heavy output. Serious gains.',
  },
  olympusArena: {
    name: 'Olympus Arena',
    icon: '♛',
    requiredRebirths: 25,
    multiplier: 25,
    description: 'The final proving ground for empire champions.',
  },
};

const achievementDefinitions = {
  firstClick: { name: 'First Click', icon: '☝', target: 1, progress: () => state.stats.totalClicks },
  hundredCoins: { name: '100 Coins', icon: 'C', target: 100, progress: () => state.stats.totalCoinsEarned },
  thousandCoins: { name: '1,000 Coins', icon: '♛', target: 1000, progress: () => state.stats.totalCoinsEarned },
  hundredClicks: { name: '100 Clicks', icon: '↗', target: 100, progress: () => state.stats.totalClicks },
  firstUpgrade: { name: 'First Upgrade', icon: '◆', target: 1, progress: () => getTotalUpgradeLevels() },
  hundredCps: { name: '100 Coins / Sec', icon: '⚡', target: 100, progress: () => getCoinsPerSecond() },
  tenThousandCoins: { name: '10,000 Coins', icon: '▰', target: 10000, progress: () => state.stats.totalCoinsEarned },
  millionCoins: { name: 'Coin Millionaire', icon: 'M', target: 1000000, progress: () => state.stats.totalCoinsEarned },
  thousandClicks: { name: '1,000 Reps', icon: '▲', target: 1000, progress: () => state.stats.totalClicks },
  tenUpgrades: { name: 'Fully Committed', icon: '10', target: 10, progress: () => getTotalUpgradeLevels() },
  tenRepStreak: { name: 'Ten-Rep Set', icon: '10', target: 10, progress: () => comboCount },
  twentyFiveRepStreak: { name: 'Unbroken Set', icon: '25', target: 25, progress: () => comboCount },
  goldenCatch: { name: 'Golden PR', icon: '★', target: 1, progress: () => state.stats.goldenCoinsCollected },
  thousandCps: { name: 'Industrial Strength', icon: '▦', target: 1000, progress: () => getCoinsPerSecond() },
  thousandClickPower: { name: 'Heavy Hitter', icon: '◆', target: 1000, progress: () => getCoinsPerClick() },
  firstRebirth: { name: 'Born Again', icon: '↻', target: 1, progress: () => state.rebirths },
  fiveRebirths: { name: 'World Lifter', icon: '5', target: 5, progress: () => state.rebirths },
  tenRebirths: { name: 'Ascended Athlete', icon: '10', target: 10, progress: () => state.rebirths },
  worldExplorer: { name: 'World Explorer', icon: '◎', target: 3, progress: () => getUnlockedWorldCount() },
};

const milestones = [
  { target: 100, name: 'Warm-Up' },
  { target: 1000, name: 'First Full Set' },
  { target: 10000, name: 'Strength Phase' },
  { target: 100000, name: 'Heavyweight' },
  { target: 1000000, name: 'Elite Lifter' },
  { target: 1000000000, name: 'Empire Champion' },
];

function createDefaultState() {
  return {
    coins: 0,
    upgrades: {
      strongerClick: 0,
      autoClicker: 0,
      factory: 0,
      megaClick: 0,
      kettlebellSet: 0,
      proteinLab: 0,
      personalTrainer: 0,
      gymFranchise: 0,
      championBelt: 0,
    },
    stats: {
      totalClicks: 0,
      totalCoinsEarned: 0,
      goldenCoinsCollected: 0,
    },
    achievements: {},
    rebirths: 0,
    selectedWorld: 'ironHouse',
    settings: {
      soundEnabled: true,
      musicEnabled: true,
    },
    savedAt: null,
  };
}

let state = createDefaultState();
let displayedCoins = 0;
let comboCount = 0;
let comboMultiplier = 1;
let lastClickTime = 0;
let lastTickTime = performance.now();
let lastPassiveRenderTime = 0;
let acceptedClickTimes = [];
let clickPatternTimes = [];
let clickGuardBlockedUntil = 0;
let clickGuardResetTimer = null;
let goldenCoinTimer = null;
let goldenCoinExpiryTimer = null;
let activeGoldenCoin = null;
let modalPreviouslyFocused = null;
let audioContext = null;
let lastAchievementSoundTime = -Infinity;
let musicTimer = null;
let musicStep = 0;
const activeMusicOscillators = new Set();

// ---------- Cached elements ----------

const elements = {
  coinBalance: document.getElementById('coinBalance'),
  incomeRate: document.getElementById('incomeRate'),
  coinsPerClick: document.getElementById('coinsPerClick'),
  coinsPerSecond: document.getElementById('coinsPerSecond'),
  totalCoins: document.getElementById('totalCoins'),
  totalClicks: document.getElementById('totalClicks'),
  rebirthCount: document.getElementById('rebirthCount'),
  mainCoin: document.getElementById('mainCoin'),
  clickReward: document.getElementById('clickReward'),
  comboCard: document.getElementById('comboCard'),
  comboMultiplier: document.getElementById('comboMultiplier'),
  comboFill: document.getElementById('comboFill'),
  comboTrack: document.querySelector('.combo-track'),
  comboHint: document.getElementById('comboHint'),
  inputGuard: document.getElementById('inputGuard'),
  upgradeList: document.getElementById('upgradeList'),
  achievementList: document.getElementById('achievementList'),
  achievementCount: document.getElementById('achievementCount'),
  achievementTotal: document.getElementById('achievementTotal'),
  notificationStack: document.getElementById('notificationStack'),
  goldenCoinLayer: document.getElementById('goldenCoinLayer'),
  milestoneTitle: document.getElementById('milestoneTitle'),
  milestoneProgress: document.getElementById('milestoneProgress'),
  milestoneFill: document.getElementById('milestoneFill'),
  rebirthCardCount: document.getElementById('rebirthCardCount'),
  rebirthMultiplier: document.getElementById('rebirthMultiplier'),
  rebirthCost: document.getElementById('rebirthCost'),
  rebirthProgressFill: document.getElementById('rebirthProgressFill'),
  rebirthProgress: document.querySelector('.rebirth-progress'),
  rebirthButton: document.getElementById('rebirthButton'),
  worldsButton: document.getElementById('worldsButton'),
  currentWorldName: document.getElementById('currentWorldName'),
  worldsModal: document.getElementById('worldsModal'),
  closeWorlds: document.getElementById('closeWorlds'),
  worldList: document.getElementById('worldList'),
  settingsButton: document.getElementById('settingsButton'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettings: document.getElementById('closeSettings'),
  soundToggle: document.getElementById('soundToggle'),
  soundStatus: document.getElementById('soundStatus'),
  soundSwitch: document.getElementById('soundSwitch'),
  musicToggle: document.getElementById('musicToggle'),
  musicStatus: document.getElementById('musicStatus'),
  musicSwitch: document.getElementById('musicSwitch'),
  saveButton: document.getElementById('saveButton'),
  resetButton: document.getElementById('resetButton'),
  saveIndicator: document.getElementById('saveIndicator'),
  saveText: document.getElementById('saveText'),
  saveMeta: document.getElementById('saveMeta'),
};

// ---------- Formatting and calculations ----------

function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';

  const absoluteValue = Math.abs(value);
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];

  const unit = units.find((item) => absoluteValue >= item.value);
  if (!unit) return Math.floor(value).toLocaleString('en-US');

  const shortened = value / unit.value;
  const digits = Math.abs(shortened) >= 100 ? 0 : Math.abs(shortened) >= 10 ? 1 : 2;
  return `${shortened.toFixed(digits).replace(/\.0+$|(?<=\.[0-9])0+$/, '')}${unit.suffix}`;
}

function getUpgradeCost(key) {
  const definition = upgradeDefinitions[key];
  return Math.floor(definition.baseCost * Math.pow(definition.growth, state.upgrades[key]));
}

function getBaseClickPower() {
  return 1 + state.upgrades.strongerClick + state.upgrades.kettlebellSet * 5;
}

function getProductionMultiplier() {
  return Math.pow(2, state.upgrades.personalTrainer);
}

function getRebirthMultiplier() {
  return Math.pow(2, state.rebirths);
}

function getWorldMultiplier() {
  return worldDefinitions[state.selectedWorld]?.multiplier || 1;
}

function getPermanentMultiplier() {
  return getRebirthMultiplier() * getWorldMultiplier();
}

function getRebirthCost() {
  return 1000000 * Math.pow(3, state.rebirths);
}

function getUnlockedWorldCount() {
  return Object.values(worldDefinitions).filter((world) => state.rebirths >= world.requiredRebirths).length;
}

function getCoinsPerClick() {
  return getBaseClickPower()
    * Math.pow(2, state.upgrades.megaClick)
    * Math.pow(3, state.upgrades.championBelt)
    * getProductionMultiplier()
    * getPermanentMultiplier();
}

function getCoinsPerSecond() {
  const baseProduction = state.upgrades.autoClicker
    + state.upgrades.factory * 10
    + state.upgrades.proteinLab * 25
    + state.upgrades.gymFranchise * 250;
  return baseProduction * getProductionMultiplier() * getPermanentMultiplier();
}

function getTotalUpgradeLevels() {
  return Object.values(state.upgrades).reduce((total, level) => total + level, 0);
}

function getComboMultiplier(count = comboCount) {
  return 1 + Math.min(Math.floor(count / 5) * 0.25, 2);
}

// ---------- Sound effects ----------

function getAudioContext() {
  if (!state.settings.soundEnabled && !state.settings.musicEnabled) return null;
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    audioContext = new AudioContextClass();
    return audioContext;
  } catch (error) {
    console.warn('Click Empire could not start sound effects.', error);
    return null;
  }
}

function playTone(frequency, duration = 0.08, type = 'triangle', volume = 0.035, delay = 0, endFrequency = null) {
  if (!state.settings.soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') context.resume().catch(() => {});

  const startTime = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playClickSound() {
  const pitchBoost = Math.min(comboCount, 20) * 3;
  playTone(92 + pitchBoost, 0.045, 'square', 0.018, 0, 72 + pitchBoost);
  playTone(175 + pitchBoost, 0.055, 'triangle', 0.025, 0.006, 130 + pitchBoost);
}

function playPurchaseSound() {
  playTone(165, 0.09, 'triangle', 0.03);
  playTone(247, 0.11, 'triangle', 0.03, 0.065);
  playTone(330, 0.13, 'triangle', 0.025, 0.13);
}

function playAchievementSound() {
  const now = performance.now();
  if (now - lastAchievementSoundTime < 450) return;
  lastAchievementSoundTime = now;
  playTone(392, 0.13, 'sine', 0.035);
  playTone(523, 0.16, 'sine', 0.035, 0.09);
  playTone(659, 0.2, 'sine', 0.03, 0.18);
}

function playGoldenSound() {
  playTone(523, 0.1, 'triangle', 0.035);
  playTone(659, 0.12, 'triangle', 0.035, 0.07);
  playTone(784, 0.14, 'triangle', 0.035, 0.14);
  playTone(1046, 0.2, 'sine', 0.025, 0.23);
}

function playGuardSound() {
  playTone(115, 0.2, 'sawtooth', 0.018, 0, 72);
}

function playSaveSound() {
  playTone(262, 0.07, 'sine', 0.022);
  playTone(392, 0.1, 'sine', 0.02, 0.055);
}

function playRebirthSound() {
  playTone(196, 0.28, 'sine', 0.035, 0, 392);
  playTone(294, 0.32, 'triangle', 0.028, 0.12, 588);
  playTone(523, 0.4, 'sine', 0.025, 0.25, 1046);
}

function playWorldSound() {
  playTone(220, 0.1, 'triangle', 0.025);
  playTone(330, 0.12, 'triangle', 0.025, 0.07);
  playTone(440, 0.16, 'sine', 0.022, 0.14);
}

const chillChordProgression = [
  [130.81, 164.81, 196, 246.94],
  [110, 130.81, 164.81, 196],
  [87.31, 130.81, 164.81, 220],
  [98, 146.83, 196, 246.94],
];

function playMusicVoice(frequency, duration, volume, delay = 0) {
  const context = getAudioContext();
  if (!context || !state.settings.musicEnabled) return;

  const startTime = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.35);
  gain.gain.setValueAtTime(volume, startTime + Math.max(0.36, duration - 0.65));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.onended = () => activeMusicOscillators.delete(oscillator);
  activeMusicOscillators.add(oscillator);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playNextMusicChord() {
  if (!state.settings.musicEnabled || document.hidden) return;
  const chord = chillChordProgression[musicStep % chillChordProgression.length];
  chord.forEach((frequency, index) => playMusicVoice(frequency, 2.65, index === 0 ? 0.005 : 0.0035, index * 0.035));
  playMusicVoice(chord[0] / 2, 2.5, 0.0045, 0.05);
  musicStep += 1;
}

function startBackgroundMusic() {
  if (!state.settings.musicEnabled || musicTimer !== null) return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') context.resume().catch(() => {});
  playNextMusicChord();
  musicTimer = window.setInterval(playNextMusicChord, 2800);
}

function stopBackgroundMusic() {
  window.clearInterval(musicTimer);
  musicTimer = null;
  activeMusicOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      // An oscillator may already have reached its scheduled stop time.
    }
  });
  activeMusicOscillators.clear();
}

function updateSoundControls() {
  const enabled = state.settings.soundEnabled;
  elements.soundToggle.setAttribute('aria-pressed', String(enabled));
  elements.soundToggle.classList.toggle('sound-off', !enabled);
  elements.soundStatus.textContent = enabled
    ? 'On · plates, upgrades, and achievements'
    : 'Off · tap to restore sound effects';
  elements.soundSwitch.textContent = enabled ? 'ON' : 'OFF';
}

function toggleSound() {
  if (state.settings.soundEnabled) {
    playTone(180, 0.07, 'triangle', 0.02, 0, 120);
    state.settings.soundEnabled = false;
  } else {
    state.settings.soundEnabled = true;
    playTone(220, 0.08, 'triangle', 0.025);
    playTone(330, 0.1, 'triangle', 0.02, 0.06);
  }
  updateSoundControls();
  saveGame(false);
}

function updateMusicControls() {
  const enabled = state.settings.musicEnabled;
  elements.musicToggle.setAttribute('aria-pressed', String(enabled));
  elements.musicToggle.classList.toggle('sound-off', !enabled);
  elements.musicStatus.textContent = enabled
    ? 'On · mellow loop plays while you train'
    : 'Off · tap to bring the music back';
  elements.musicSwitch.textContent = enabled ? 'ON' : 'OFF';
}

function toggleMusic() {
  state.settings.musicEnabled = !state.settings.musicEnabled;
  if (state.settings.musicEnabled) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
  updateMusicControls();
  saveGame(false);
}

// ---------- Rendering ----------

function buildUpgradeShop() {
  elements.upgradeList.innerHTML = Object.entries(upgradeDefinitions).map(([key, upgrade]) => `
    <article class="upgrade-card" id="upgrade-${key}">
      <div class="upgrade-top">
        <span class="upgrade-icon" aria-hidden="true">${upgrade.icon}</span>
        <div class="upgrade-title">
          <strong>${upgrade.name}</strong>
          <small>${upgrade.description}</small>
        </div>
        <span class="level-pill">LVL <span data-level="${key}">0</span></span>
      </div>
      <div class="upgrade-effect">
        <span>Next level</span>
        <strong>${upgrade.effect}</strong>
      </div>
      <button class="buy-button" type="button" data-upgrade="${key}" aria-label="Buy ${upgrade.name}">
        BUY <span class="cost-coin" aria-hidden="true">C</span> <span data-cost="${key}">${formatNumber(upgrade.baseCost)}</span>
      </button>
    </article>
  `).join('');
}

function buildAchievements() {
  elements.achievementTotal.textContent = Object.keys(achievementDefinitions).length;
  elements.achievementList.innerHTML = Object.entries(achievementDefinitions).map(([key, achievement]) => `
    <div class="achievement-item" data-achievement="${key}" title="${achievement.name}">
      <span class="achievement-badge" aria-hidden="true">${achievement.icon}</span>
      <span>
        <span class="achievement-name">${achievement.name}</span>
        <small class="achievement-progress" data-achievement-progress="${key}">0 / ${formatNumber(achievement.target)}</small>
      </span>
      <span class="achievement-check" aria-hidden="true">●</span>
    </div>
  `).join('');
}

function buildWorlds() {
  elements.worldList.innerHTML = Object.entries(worldDefinitions).map(([key, world]) => `
    <button class="world-card" type="button" data-world-select="${key}" aria-label="Select ${world.name}">
      <span class="world-icon" aria-hidden="true">${world.icon}</span>
      <span class="world-copy">
        <strong>${world.name}</strong>
        <small>${world.description}</small>
        <span class="world-bonus">x${formatNumber(world.multiplier)} ALL PRODUCTION</span>
      </span>
      <span class="world-state">${world.requiredRebirths === 0 ? 'AVAILABLE' : `${world.requiredRebirths} REBIRTHS`}</span>
    </button>
  `).join('');
}

function renderGame() {
  const clickPower = getCoinsPerClick();
  const coinsPerSecond = getCoinsPerSecond();

  elements.incomeRate.textContent = `+${formatNumber(coinsPerSecond)}`;
  elements.coinsPerClick.textContent = formatNumber(clickPower);
  elements.coinsPerSecond.textContent = formatNumber(coinsPerSecond);
  elements.totalCoins.textContent = formatNumber(state.stats.totalCoinsEarned);
  elements.totalClicks.textContent = formatNumber(state.stats.totalClicks);
  elements.rebirthCount.textContent = formatNumber(state.rebirths);
  elements.clickReward.textContent = formatNumber(clickPower);

  document.querySelectorAll('[data-upgrade]').forEach((button) => {
    const key = button.dataset.upgrade;
    const cost = getUpgradeCost(key);
    const canAfford = state.coins >= cost;
    button.disabled = !canAfford;
    button.setAttribute('aria-disabled', String(!canAfford));
    button.querySelector(`[data-cost="${key}"]`).textContent = formatNumber(cost);
    document.querySelector(`[data-level="${key}"]`).textContent = state.upgrades[key];
  });

  renderAchievements();
  renderMilestone();
  renderRebirth();
  renderWorlds();
}

function renderRebirth() {
  const cost = getRebirthCost();
  const canAfford = state.coins >= cost;
  const progress = Number.isFinite(cost) ? Math.min(100, (state.coins / cost) * 100) : 0;

  elements.rebirthCardCount.textContent = formatNumber(state.rebirths);
  elements.rebirthMultiplier.textContent = `x${formatNumber(getRebirthMultiplier())}`;
  elements.rebirthCost.textContent = formatNumber(cost);
  elements.rebirthProgressFill.style.width = `${progress}%`;
  elements.rebirthProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
  elements.rebirthButton.disabled = !canAfford;
  elements.rebirthButton.setAttribute('aria-disabled', String(!canAfford));
}

function renderWorlds() {
  const activeWorld = worldDefinitions[state.selectedWorld] || worldDefinitions.ironHouse;
  document.body.dataset.world = state.selectedWorld;
  elements.currentWorldName.textContent = activeWorld.name;

  document.querySelectorAll('[data-world-select]').forEach((button) => {
    const key = button.dataset.worldSelect;
    const world = worldDefinitions[key];
    const unlocked = state.rebirths >= world.requiredRebirths;
    const selected = state.selectedWorld === key;
    button.disabled = !unlocked;
    button.classList.toggle('locked', !unlocked);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.world-state').textContent = selected
      ? 'ACTIVE'
      : unlocked
        ? 'ENTER'
        : `LOCKED · ${world.requiredRebirths} REBIRTHS`;
  });
}

function renderAchievements() {
  let unlockedCount = 0;

  Object.entries(achievementDefinitions).forEach(([key, achievement]) => {
    const item = document.querySelector(`[data-achievement="${key}"]`);
    const progress = Math.min(achievement.progress(), achievement.target);
    const unlocked = Boolean(state.achievements[key]);
    item.classList.toggle('unlocked', unlocked);
    item.querySelector('.achievement-check').textContent = unlocked ? '✓' : '●';
    item.querySelector(`[data-achievement-progress="${key}"]`).textContent = unlocked
      ? 'Unlocked'
      : `${formatNumber(progress)} / ${formatNumber(achievement.target)}`;
    if (unlocked) unlockedCount += 1;
  });

  elements.achievementCount.textContent = unlockedCount;
}

function renderMilestone() {
  const total = state.stats.totalCoinsEarned;
  const milestone = milestones.find((item) => total < item.target) || milestones[milestones.length - 1];
  const previousTarget = milestones[milestones.indexOf(milestone) - 1]?.target || 0;
  const progress = milestone === milestones[milestones.length - 1] && total >= milestone.target
    ? 100
    : Math.max(0, Math.min(100, ((total - previousTarget) / (milestone.target - previousTarget)) * 100));

  elements.milestoneTitle.textContent = total >= milestones[milestones.length - 1].target ? 'Empire Champion' : milestone.name;
  elements.milestoneProgress.textContent = `${formatNumber(Math.min(total, milestone.target))} / ${formatNumber(milestone.target)}`;
  elements.milestoneFill.style.width = `${progress}%`;
}

function updateAnimatedBalance() {
  const difference = state.coins - displayedCoins;
  if (Math.abs(difference) < 0.01) {
    displayedCoins = state.coins;
  } else {
    displayedCoins += difference * 0.16;
  }
  elements.coinBalance.textContent = formatNumber(displayedCoins);
  requestAnimationFrame(updateAnimatedBalance);
}

function updateComboDisplay() {
  const progress = Math.min(100, (comboCount / 40) * 100);
  elements.comboMultiplier.textContent = `x${comboMultiplier.toFixed(2)}`;
  elements.comboFill.style.width = `${progress}%`;
  elements.comboTrack.setAttribute('aria-valuenow', String(Math.round(progress)));
  elements.comboCard.classList.toggle('active', comboCount > 1);
  elements.comboHint.textContent = comboCount > 1
    ? `${comboCount} hit streak — keep clicking!`
    : 'Tap rapidly to build your multiplier';
}

// ---------- Core gameplay ----------

function setInputGuardStatus(blocked) {
  window.clearTimeout(clickGuardResetTimer);
  elements.comboCard.classList.toggle('guarded', blocked);
  elements.inputGuard.innerHTML = blocked
    ? '<i aria-hidden="true"></i> Machine-like input paused · resume in a moment'
    : '<i aria-hidden="true"></i> Manual input guard · up to 22 taps/sec';

  if (blocked) {
    clickGuardResetTimer = window.setTimeout(() => setInputGuardStatus(false), CLICK_GUARD.blockDuration);
  }
}

function blockAutomatedClicks(now) {
  clickGuardBlockedUntil = now + CLICK_GUARD.blockDuration;
  acceptedClickTimes = [];
  clickPatternTimes = [];
  comboCount = 0;
  comboMultiplier = 1;
  updateComboDisplay();
  renderAchievements();
  setInputGuardStatus(true);
  playGuardSound();
  showNotification('Manual Reps Only', 'Machine-like clicking was paused. Fast human tapping is still welcome.', 'info');
}

function acceptManualClick(event, now) {
  if (now < clickGuardBlockedUntil) return false;

  // Script-generated events are rejected; genuine keyboard, mouse, and touch clicks remain trusted.
  if (event?.isTrusted === false) {
    blockAutomatedClicks(now);
    return false;
  }

  const recentClicks = acceptedClickTimes.filter((time) => now - time <= CLICK_GUARD.burstWindow);
  const previousClick = recentClicks.at(-1);

  // This only drops physically impossible duplicate events, not rapid human tapping.
  if (previousClick !== undefined && now - previousClick < CLICK_GUARD.minimumInterval) return false;

  recentClicks.push(now);
  if (recentClicks.length > CLICK_GUARD.maximumBurst) {
    blockAutomatedClicks(now);
    return false;
  }

  clickPatternTimes = [...clickPatternTimes, now].slice(-CLICK_GUARD.patternSample);
  if (clickPatternTimes.length >= CLICK_GUARD.patternSample) {
    const sample = clickPatternTimes;
    const intervals = sample.slice(1).map((time, index) => time - sample[index]);
    const mean = intervals.reduce((total, interval) => total + interval, 0) / intervals.length;
    const variance = intervals.reduce((total, interval) => total + Math.pow(interval - mean, 2), 0) / intervals.length;
    const deviation = Math.sqrt(variance);

    if (mean <= CLICK_GUARD.maximumPatternMean && deviation <= CLICK_GUARD.maximumPatternDeviation) {
      blockAutomatedClicks(now);
      return false;
    }
  }

  acceptedClickTimes = recentClicks;
  return true;
}

function addCoins(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.coins += amount;
  state.stats.totalCoinsEarned += amount;
}

function handleCoinClick(event) {
  const now = performance.now();
  if (!acceptManualClick(event, now)) return;
  startBackgroundMusic();

  comboCount = now - lastClickTime <= COMBO_WINDOW ? comboCount + 1 : 1;
  lastClickTime = now;
  comboMultiplier = getComboMultiplier();

  const reward = getCoinsPerClick() * comboMultiplier;
  addCoins(reward);
  state.stats.totalClicks += 1;

  playClickSound();
  animateMainCoin();
  createFloatingReward(event, reward);
  createCoinParticles(event);
  updateComboDisplay();
  checkAchievements();
  renderGame();
}

function purchaseUpgrade(key) {
  const definition = upgradeDefinitions[key];
  if (!definition) return;

  const cost = getUpgradeCost(key);
  if (state.coins < cost) return;

  state.coins -= cost;
  state.upgrades[key] += 1;
  displayedCoins = Math.min(displayedCoins, state.coins);
  playPurchaseSound();

  const card = document.getElementById(`upgrade-${key}`);
  card.classList.remove('just-bought');
  void card.offsetWidth;
  card.classList.add('just-bought');
  window.setTimeout(() => card.classList.remove('just-bought'), 500);

  checkAchievements();
  renderGame();
  saveGame(false);
}

function performRebirth() {
  const cost = getRebirthCost();
  if (state.coins < cost) return;

  const confirmed = window.confirm(
    `Rebirth for a permanent x${formatNumber(getRebirthMultiplier() * 2)} boost? Your coins and upgrade levels will reset, but achievements and lifetime stats stay.`,
  );
  if (!confirmed) return;

  window.clearTimeout(goldenCoinTimer);
  window.clearTimeout(goldenCoinExpiryTimer);
  activeGoldenCoin?.remove();
  activeGoldenCoin = null;

  state.rebirths += 1;
  state.coins = 0;
  Object.keys(state.upgrades).forEach((key) => {
    state.upgrades[key] = 0;
  });

  const unlockedWorld = Object.entries(worldDefinitions).find(([, world]) => world.requiredRebirths === state.rebirths);
  if (unlockedWorld) state.selectedWorld = unlockedWorld[0];

  displayedCoins = 0;
  comboCount = 0;
  comboMultiplier = 1;
  lastClickTime = 0;
  acceptedClickTimes = [];
  clickPatternTimes = [];
  clickGuardBlockedUntil = 0;
  updateComboDisplay();
  setInputGuardStatus(false);

  document.body.classList.remove('is-rebirthing');
  void document.body.offsetWidth;
  document.body.classList.add('is-rebirthing');
  window.setTimeout(() => document.body.classList.remove('is-rebirthing'), 850);

  playRebirthSound();
  lastAchievementSoundTime = performance.now();
  checkAchievements();
  renderGame();
  saveGame(false);
  scheduleGoldenCoin();

  if (unlockedWorld) {
    showNotification(`${unlockedWorld[1].name} Unlocked`, `A new world is active with x${formatNumber(unlockedWorld[1].multiplier)} production.`, 'info');
  } else {
    showNotification('Rebirth Complete', `Permanent production is now x${formatNumber(getRebirthMultiplier())}.`, 'info');
  }
}

function selectWorld(key) {
  const world = worldDefinitions[key];
  if (!world || state.rebirths < world.requiredRebirths || state.selectedWorld === key) return;

  state.selectedWorld = key;
  playWorldSound();
  startBackgroundMusic();
  renderGame();
  saveGame(false);
  showNotification(`Entered ${world.name}`, `World production bonus set to x${formatNumber(world.multiplier)}.`, 'info');
}

function gameTick(now) {
  const deltaSeconds = Math.min((now - lastTickTime) / 1000, 1);
  lastTickTime = now;

  const passiveIncome = getCoinsPerSecond() * deltaSeconds;
  if (passiveIncome > 0) addCoins(passiveIncome);

  if (comboCount > 0 && now - lastClickTime > COMBO_RESET_TIME) {
    comboCount = 0;
    comboMultiplier = 1;
    updateComboDisplay();
    renderAchievements();
  }

  if (passiveIncome > 0 && now - lastPassiveRenderTime >= 100) {
    renderGame();
    lastPassiveRenderTime = now;
  }
  requestAnimationFrame(gameTick);
}

// ---------- Feedback effects ----------

function animateMainCoin() {
  elements.mainCoin.classList.remove('is-clicked');
  void elements.mainCoin.offsetWidth;
  elements.mainCoin.classList.add('is-clicked');
  window.setTimeout(() => elements.mainCoin.classList.remove('is-clicked'), 210);
}

function getPointerPosition(event) {
  const rect = elements.mainCoin.getBoundingClientRect();
  return {
    x: event.clientX || rect.left + rect.width / 2,
    y: event.clientY || rect.top + rect.height / 2,
  };
}

function createFloatingReward(event, amount) {
  const position = getPointerPosition(event);
  const floatingValue = document.createElement('span');
  floatingValue.className = 'floating-value';
  floatingValue.textContent = `+${formatNumber(amount)}`;
  floatingValue.style.left = `${position.x + (Math.random() - 0.5) * 28}px`;
  floatingValue.style.top = `${position.y - 16}px`;
  document.body.appendChild(floatingValue);
  window.setTimeout(() => floatingValue.remove(), 950);
}

function createCoinParticles(event) {
  const position = getPointerPosition(event);
  for (let index = 0; index < 4; index += 1) {
    const particle = document.createElement('span');
    const angle = (Math.PI * 2 * index) / 4 + Math.random() * 0.6;
    const distance = 35 + Math.random() * 35;
    particle.className = 'coin-particle';
    particle.style.left = `${position.x}px`;
    particle.style.top = `${position.y}px`;
    particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 700);
  }
}

function showNotification(title, message, type = 'achievement') {
  const toast = document.createElement('div');
  toast.className = type === 'achievement' ? 'achievement-toast' : 'info-toast';
  toast.innerHTML = `
    <span class="toast-badge" aria-hidden="true">${type === 'achievement' ? '★' : '✓'}</span>
    <span class="toast-copy">
      <span>${type === 'achievement' ? 'ACHIEVEMENT UNLOCKED' : 'CLICK EMPIRE'}</span>
      <strong>${title}</strong>
      <small>${message}</small>
    </span>
  `;
  elements.notificationStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3700);
}

// ---------- Achievements ----------

function checkAchievements(silent = false) {
  Object.entries(achievementDefinitions).forEach(([key, achievement]) => {
    if (!state.achievements[key] && achievement.progress() >= achievement.target) {
      state.achievements[key] = true;
      if (!silent) {
        playAchievementSound();
        showNotification(achievement.name, 'A new PR badge has been added to your board.');
      }
    }
  });
}

// ---------- Golden coin event ----------

function scheduleGoldenCoin() {
  window.clearTimeout(goldenCoinTimer);
  const delay = 25000 + Math.random() * 30000;
  goldenCoinTimer = window.setTimeout(spawnGoldenCoin, delay);
}

function spawnGoldenCoin() {
  if (activeGoldenCoin || !document.hasFocus()) {
    scheduleGoldenCoin();
    return;
  }

  const goldenCoin = document.createElement('button');
  const safeWidth = Math.max(100, window.innerWidth - 100);
  const safeHeight = Math.max(150, window.innerHeight - 180);
  const left = 24 + Math.random() * Math.max(0, safeWidth - 48);
  const top = 105 + Math.random() * Math.max(0, safeHeight - 80);

  goldenCoin.type = 'button';
  goldenCoin.className = 'golden-coin';
  goldenCoin.setAttribute('aria-label', 'Golden Coin bonus — click before it disappears');
  goldenCoin.textContent = 'C';
  goldenCoin.style.left = `${Math.min(left, window.innerWidth - 96)}px`;
  goldenCoin.style.top = `${Math.min(top, window.innerHeight - 96)}px`;
  goldenCoin.addEventListener('click', collectGoldenCoin, { once: true });

  activeGoldenCoin = goldenCoin;
  elements.goldenCoinLayer.appendChild(goldenCoin);
  showNotification('Golden Coin!', 'Catch the glowing coin before it vanishes.', 'info');

  goldenCoinExpiryTimer = window.setTimeout(() => removeGoldenCoin(false), 5500);
}

function collectGoldenCoin(event) {
  const bonus = Math.max(100, Math.ceil(getCoinsPerClick() * 25 + getCoinsPerSecond() * 20));
  addCoins(bonus);
  state.stats.goldenCoinsCollected += 1;
  playGoldenSound();
  lastAchievementSoundTime = performance.now();
  createFloatingReward(event, bonus);
  createCoinParticles(event);
  showNotification('Golden Bonus Collected', `You found ${formatNumber(bonus)} bonus coins!`, 'info');
  checkAchievements();
  renderGame();
  removeGoldenCoin(true);
}

function removeGoldenCoin(collected) {
  window.clearTimeout(goldenCoinExpiryTimer);
  if (activeGoldenCoin) {
    const coin = activeGoldenCoin;
    if (!collected) coin.classList.add('expiring');
    window.setTimeout(() => coin.remove(), collected ? 0 : 300);
    activeGoldenCoin = null;
  }
  scheduleGoldenCoin();
}

// ---------- Saving and settings ----------

function getSafeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : fallback;
}

function loadGame() {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);
    if (!rawSave) return;

    const saved = JSON.parse(rawSave);
    const defaults = createDefaultState();
    const savedRebirths = Math.floor(getSafeNumber(saved.rebirths));
    const savedWorld = worldDefinitions[saved.selectedWorld]
      && savedRebirths >= worldDefinitions[saved.selectedWorld].requiredRebirths
      ? saved.selectedWorld
      : 'ironHouse';
    state = {
      coins: getSafeNumber(saved.coins),
      upgrades: Object.fromEntries(
        Object.keys(defaults.upgrades).map((key) => [key, Math.floor(getSafeNumber(saved.upgrades?.[key]))]),
      ),
      stats: {
        totalClicks: Math.floor(getSafeNumber(saved.stats?.totalClicks)),
        totalCoinsEarned: getSafeNumber(saved.stats?.totalCoinsEarned),
        goldenCoinsCollected: Math.floor(getSafeNumber(saved.stats?.goldenCoinsCollected)),
      },
      achievements: Object.fromEntries(
        Object.keys(achievementDefinitions).map((key) => [key, Boolean(saved.achievements?.[key])]),
      ),
      rebirths: savedRebirths,
      selectedWorld: savedWorld,
      settings: {
        soundEnabled: saved.settings?.soundEnabled !== false,
        musicEnabled: saved.settings?.musicEnabled !== false,
      },
      savedAt: saved.savedAt || null,
    };
    displayedCoins = state.coins;
  } catch (error) {
    console.warn('Click Empire could not read the saved game.', error);
    state = createDefaultState();
  }
}

function saveGame(showFeedback = false) {
  try {
    state.savedAt = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    updateSaveStatus();

    if (showFeedback) {
      playSaveSound();
      showNotification('Game Saved', 'Your empire is safe in this browser.', 'info');
    }
  } catch (error) {
    console.warn('Click Empire could not save progress.', error);
    elements.saveText.textContent = 'Save unavailable';
  }
}

function updateSaveStatus() {
  elements.saveIndicator.classList.add('saving');
  elements.saveText.textContent = 'Saving...';
  elements.saveMeta.textContent = state.savedAt
    ? `Last saved ${new Date(state.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'No manual save yet';

  window.setTimeout(() => {
    elements.saveIndicator.classList.remove('saving');
    elements.saveText.textContent = 'Progress saved';
  }, 600);
}

function openSettings() {
  modalPreviouslyFocused = document.activeElement;
  elements.settingsModal.hidden = false;
  document.body.style.overflow = 'hidden';
  updateSaveStatus();
  elements.closeSettings.focus();
}

function closeSettings() {
  elements.settingsModal.hidden = true;
  document.body.style.overflow = '';
  modalPreviouslyFocused?.focus();
}

function openWorlds() {
  modalPreviouslyFocused = document.activeElement;
  elements.worldsModal.hidden = false;
  document.body.style.overflow = 'hidden';
  renderWorlds();
  elements.closeWorlds.focus();
}

function closeWorlds() {
  elements.worldsModal.hidden = true;
  document.body.style.overflow = '';
  modalPreviouslyFocused?.focus();
}

function resetGame() {
  const confirmed = window.confirm('Reset your entire Click Empire? This permanently deletes all coins, upgrades, stats, and achievements.');
  if (!confirmed) return;

  window.clearTimeout(goldenCoinTimer);
  window.clearTimeout(goldenCoinExpiryTimer);
  activeGoldenCoin?.remove();
  activeGoldenCoin = null;
  acceptedClickTimes = [];
  clickPatternTimes = [];
  clickGuardBlockedUntil = 0;
  setInputGuardStatus(false);
  localStorage.removeItem(SAVE_KEY);
  state = createDefaultState();
  displayedCoins = 0;
  comboCount = 0;
  comboMultiplier = 1;
  lastClickTime = 0;
  updateComboDisplay();
  updateSoundControls();
  updateMusicControls();
  closeSettings();
  checkAchievements(true);
  renderGame();
  startBackgroundMusic();
  showNotification('Empire Reset', 'A fresh fortune awaits.', 'info');
  scheduleGoldenCoin();
}

// ---------- Events and startup ----------

elements.mainCoin.addEventListener('click', handleCoinClick);

elements.upgradeList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-upgrade]');
  if (button) purchaseUpgrade(button.dataset.upgrade);
});

elements.settingsButton.addEventListener('click', openSettings);
elements.closeSettings.addEventListener('click', closeSettings);
elements.soundToggle.addEventListener('click', toggleSound);
elements.musicToggle.addEventListener('click', toggleMusic);
elements.saveButton.addEventListener('click', () => saveGame(true));
elements.resetButton.addEventListener('click', resetGame);
elements.rebirthButton.addEventListener('click', performRebirth);
elements.worldsButton.addEventListener('click', openWorlds);
elements.closeWorlds.addEventListener('click', closeWorlds);

elements.worldList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-world-select]');
  if (button) selectWorld(button.dataset.worldSelect);
});

elements.settingsModal.addEventListener('click', (event) => {
  if (event.target === elements.settingsModal) closeSettings();
});

elements.worldsModal.addEventListener('click', (event) => {
  if (event.target === elements.worldsModal) closeWorlds();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !elements.settingsModal.hidden) closeSettings();
  if (event.key === 'Escape' && !elements.worldsModal.hidden) closeWorlds();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveGame(false);
    stopBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
});

window.addEventListener('beforeunload', () => saveGame(false));
window.setInterval(() => saveGame(false), AUTO_SAVE_INTERVAL);

buildUpgradeShop();
buildAchievements();
buildWorlds();
loadGame();
checkAchievements(true);
renderGame();
updateComboDisplay();
updateSoundControls();
updateMusicControls();
updateSaveStatus();
requestAnimationFrame(updateAnimatedBalance);
requestAnimationFrame(gameTick);
scheduleGoldenCoin();
