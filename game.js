(function(){
  // ---------- PWA MANIFEST (standalone app install) ----------
  try {
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="36" fill="#090c14"/><circle cx="96" cy="120" r="34" fill="#5ee9d6"/><rect x="30" y="34" width="60" height="22" rx="6" fill="#ff5d73"/><rect x="104" y="60" width="50" height="20" rx="6" fill="#ff9f45"/></svg>`;
    const iconUrl = 'data:image/svg+xml;base64,' + btoa(iconSvg);
    const manifest = {
      name: 'Scraper',
      short_name: 'Scraper',
      start_url: '.',
      display: 'standalone',
      background_color: '#090c14',
      theme_color: '#090c14',
      orientation: 'portrait',
      icons: [
        { src: iconUrl, sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    };
    const manifestUrl = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(manifest));
    const manifestLink = document.getElementById('pwaManifest');
    if (manifestLink) manifestLink.setAttribute('href', manifestUrl);
    let appleIcon = document.getElementById('pwaAppleIcon');
    if (!appleIcon){
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.id = 'pwaAppleIcon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', iconUrl);
  } catch(e){ /* manifest is a progressive enhancement, ignore failures */ }

  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const stageEl = document.getElementById('stage');
  const hitFlash = document.getElementById('hitFlash');
  const hud = document.getElementById('hud');
  const hudLeft = document.getElementById('hudLeft');
  const hudRight = document.getElementById('hudRight');
  const soundBtn = document.getElementById('soundBtn');
  const hint = document.getElementById('hint');
  const legend = document.getElementById('legend');
  const abilityHud = document.getElementById('abilityHud');

  const mainMenu = document.getElementById('mainMenu');
  const singleSelect = document.getElementById('singleSelect');
  const settingsScreen = document.getElementById('settingsScreen');
  const btnResetGameEl = document.getElementById('btnResetGame');
  const multiSelect = document.getElementById('multiSelect');
  const levelSelect = document.getElementById('levelSelect');
  const exitScreen = document.getElementById('exitScreen');
  const shopScreen = document.getElementById('shopScreen');
  const achievementsScreen = document.getElementById('achievementsScreen');
  const profileScreen = document.getElementById('profileScreen');
  const btnProfileEl = document.getElementById('btnProfile');
  const mmAvatarNameEl = document.getElementById('mmAvatarName');
  const profileAvatarBigEl = document.getElementById('profileAvatarBig');
  const profileNameLineEl = document.getElementById('profileNameLine');
  const profileLevelLineEl = document.getElementById('profileLevelLine');
  const profileIconGridEl = document.getElementById('profileIconGrid');
  const profileStatsListEl = document.getElementById('profileStatsList');
  const missionsScreen = document.getElementById('missionsScreen');
  const missionsListEl = document.getElementById('missionsList');
  const cratesScreen = document.getElementById('cratesScreen');
  const crateShopRowEl = document.getElementById('crateShopRow');
  const crateOpenOverlayEl = document.getElementById('crateOpenOverlay');
  const crateOpenIconEl = document.getElementById('crateOpenIcon');
  const crateOpenTitleEl = document.getElementById('crateOpenTitle');
  const crateOpenCoinsEl = document.getElementById('crateOpenCoins');
  const crateOpenItemsEl = document.getElementById('crateOpenItems');
  const crateOpenBtnsEl = document.getElementById('crateOpenBtns');
  const boosterScreen = document.getElementById('boosterScreen');
  const boosterListEl = document.getElementById('boosterList');
  const btnStartNoBoosterEl = document.getElementById('btnStartNoBooster');
  const mmDailyListEl = document.getElementById('mmDailyList');
  const mmChallengeModsEl = document.getElementById('mmChallengeMods');
  const mmChallengeListEl = document.getElementById('mmChallengeList');
  const mmChallengeRewardEl = document.getElementById('mmChallengeReward');
  const btnChallengeEl = document.getElementById('btnChallenge');
  const shopCoinsEl = document.getElementById('shopCoins');
  const levelGrid = document.getElementById('levelGrid');
  const pageLabel = document.getElementById('pageLabel');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const overlay = document.getElementById('overlay');
  const overTitle = document.getElementById('overTitle');
  const overText = document.getElementById('overText');
  const overBtns = document.getElementById('overBtns');
  const overCoinsEl = document.getElementById('overCoins');
  const overExpEl = document.getElementById('overExp');
  const mmCoinsEl = document.getElementById('mmCoins');
  const mmDiamondsEl = document.getElementById('mmDiamonds');
  const mmLevelLabelEl = document.getElementById('mmLevelLabel');
  const mmLevelExpEl = document.getElementById('mmLevelExp');
  const mmLevelBarFillEl = document.getElementById('mmLevelBarFill');
  const mmModeLabelEl = document.getElementById('mmModeLabel');
  const mmModePrevBtn = document.getElementById('mmModePrev');
  const mmModeNextBtn = document.getElementById('mmModeNext');
  const btnPlay = document.getElementById('btnPlay');
  const unlocksListEl = document.getElementById('unlocksList');
  const tutorialModalEl = document.getElementById('tutorialModal');
  const tutorialModalTitleEl = document.getElementById('tutorialModalTitle');
  const tutorialModalTextEl = document.getElementById('tutorialModalText');
  const tutorialModalProgressEl = document.getElementById('tutorialModalProgress');
  const btnTutorialOkEl = document.getElementById('btnTutorialOk');
  const btnTutorialSkipEl = document.getElementById('btnTutorialSkip');
  const nameModalEl = document.getElementById('nameModal');
  const nameModalTitleEl = document.getElementById('nameModalTitle');
  const nameModalInputEl = document.getElementById('nameModalInput');
  const btnNameSaveEl = document.getElementById('btnNameSave');
  const exitConfirmModalEl = document.getElementById('exitConfirmModal');
  const exitConfirmTitleEl = document.getElementById('exitConfirmTitle');
  const btnExitNoEl = document.getElementById('btnExitNo');
  const btnExitYesEl = document.getElementById('btnExitYes');
  const sideDrawerEl = document.getElementById('sideDrawer');
  const btnMenuToggleEl = document.getElementById('btnMenuToggle');
  const btnDrawerCloseEl = document.getElementById('btnDrawerClose');
  const btnSettingsLabelEl = document.getElementById('btnSettingsLabel');
  const devConsoleEl = document.getElementById('devConsole');
  const devConsoleInputEl = document.getElementById('devConsoleInput');
  const freeplayRecordEl = document.getElementById('freeplayRecord');
  const volumeSlider = document.getElementById('volumeSlider');
  const langSelect = document.getElementById('langSelect');
  const pauseBtn = document.getElementById('pauseBtn');
  const pauseScreen = document.getElementById('pauseScreen');
  const pauseVolumeSlider = document.getElementById('pauseVolumeSlider');
  const pauseLangSelect = document.getElementById('pauseLangSelect');
  const btnResume = document.getElementById('btnResume');
  const btnPauseMenu = document.getElementById('btnPauseMenu');

  const screens = [mainMenu, singleSelect, settingsScreen, multiSelect, levelSelect, exitScreen, shopScreen, achievementsScreen, profileScreen, missionsScreen, cratesScreen, boosterScreen];

  function showScreen(el){
    closeDrawer();
    screens.forEach(s => s.classList.toggle('show', s === el));
    canvas.style.visibility = (!el || el === mainMenu) ? 'visible' : 'hidden';
    // .stage has its own opaque background (see 55.x background-enlargement
    // notes) so the animated page-level nebula never bleeds through the
    // canvas's transparent edges while on the main menu — but that same
    // opaque rect shows through as a faint 560x640 "box" behind any other,
    // now-transparent full-screen overlay (achievementsScreen etc.). Hide it
    // in exactly that case; keep it opaque for mainMenu and actual gameplay.
    stageEl.classList.toggle('board-hidden', !!el && el !== mainMenu);
    if (el){
      stopMusic();
      startMenuMusic();
    } else {
      stopMenuMusic();
    }
    if (shopPreviewRaf){ cancelAnimationFrame(shopPreviewRaf); shopPreviewRaf = null; }
    if (el === shopScreen){
      shopPreviewRaf = requestAnimationFrame(shopPreviewLoop);
    }
    if (menuIdleRaf){ cancelAnimationFrame(menuIdleRaf); menuIdleRaf = null; }
    if (el === mainMenu){
      menuIdleRaf = requestAnimationFrame(menuIdleLoop);
      // Re-check the tutorial every time the player lands back on the main
      // menu (there are 15+ call sites that end up here) — renderTutorial()
      // itself only actually pops the modal open while mainMenu is visible
      // (see the mainMenu.classList.contains('show') guard in there), so a
      // step that finished while the player was on another screen (Shop,
      // Achievements, mid-run) surfaces its next instruction here instead of
      // firing its typewriter sound over a screen the player can't see.
      renderTutorial();
    }
  }
  function showGameUI(show){
    hud.classList.toggle('hidden', !show);
    hint.classList.toggle('hidden', !show);
    legend.classList.toggle('hidden', !show);
    if (abilityHud) abilityHud.classList.toggle('hidden', !show);
    if (pauseBtn) pauseBtn.style.display = (show && (mode === 'single' || mode === 'freeplay')) ? 'flex' : 'none';
  }
  function triggerFlash(){
    hitFlash.classList.remove('show');
    void hitFlash.offsetWidth;
    hitFlash.classList.add('show');
  }

  function openPause(){
    if (!running) return;
    running = false;
    stopMusic();
    startMenuMusic();
    pauseScreen.classList.add('show');
  }
  function closePause(){
    pauseScreen.classList.remove('show');
    stopMenuMusic();
    if (musicOn) startMusic();
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }
  pauseBtn.addEventListener('click', openPause);
  btnResume.addEventListener('click', closePause);
  btnPauseMenu.addEventListener('click', () => {
    pauseScreen.classList.remove('show');
    stopMenuMusic();
    running = false;
    showGameUI(false);
    showScreen(mainMenu);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mode === 'single' || mode === 'freeplay'){
      if (pauseScreen.classList.contains('show')) closePause();
      else if (running) openPause();
      return;
    }
    if (exitConfirmOpen) hideExitConfirm();
    else if (mainMenu.classList.contains('show')) showExitConfirm();
  });

  // ---------- I18N ----------
  // LANGS and I18N themselves live in i18n.js (loaded before this file).
  function loadLang(){
    try {
      const raw = localStorage.getItem('scraper_lang_v1');
      if (raw && I18N[raw]) return raw;
    } catch(e){}
    return 'pl';
  }
  function saveLang(l){
    try { localStorage.setItem('scraper_lang_v1', l); } catch(e){}
  }
  let currentLang = loadLang();

  function t(key, vars){
    let str = (I18N[currentLang] && I18N[currentLang][key]) || (I18N.pl[key]) || key;
    if (vars){
      Object.keys(vars).forEach(k => { str = str.split('{'+k+'}').join(vars[k]); });
    }
    return str;
  }

  function populateLangSelect(sel){
    LANGS.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.name;
      sel.appendChild(opt);
    });
    sel.value = currentLang;
  }
  populateLangSelect(langSelect);
  populateLangSelect(pauseLangSelect);

  function setLanguage(code){
    if (!I18N[code]) return;
    currentLang = code;
    saveLang(currentLang);
    langSelect.value = currentLang;
    pauseLangSelect.value = currentLang;
    applyStaticTranslations();
  }
  langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  pauseLangSelect.addEventListener('change', (e) => setLanguage(e.target.value));

  function applyStaticTranslations(){
    document.getElementById('btnShop').textContent = t('btn_shop');
    document.getElementById('btnAchievements').title = t('btn_achievements');
    if (btnMenuToggleEl) btnMenuToggleEl.title = t('btn_menu');
    if (btnSettingsLabelEl) btnSettingsLabelEl.textContent = t('btn_settings');
    if (btnProfileEl) btnProfileEl.title = t('btn_profile');
    document.getElementById('btnMissions').textContent = t('btn_missions');
    document.getElementById('btnCrates').textContent = t('btn_crates');
    document.getElementById('btnPlay').textContent = t('btn_play');
    if (exitConfirmTitleEl) exitConfirmTitleEl.textContent = t('exit_confirm_title');
    if (btnExitNoEl) btnExitNoEl.textContent = t('btn_exit_no');
    if (btnExitYesEl) btnExitYesEl.textContent = t('btn_exit_yes');
    renderMenuMode();
    updateCoinsHud();
    document.getElementById('mmDailyTitle').textContent = t('daily_missions_title');
    renderDailyWidget();
    document.getElementById('mmChallengeTitle').textContent = t('challenge_title');
    if (btnChallengeEl) btnChallengeEl.textContent = t('btn_challenge');
    renderChallengeWidget();

    if (btnTutorialOkEl) btnTutorialOkEl.textContent = t('tutorial_ok');
    if (btnTutorialSkipEl) btnTutorialSkipEl.textContent = t('tutorial_skip');
    if (nameModalTitleEl) nameModalTitleEl.textContent = t('name_modal_title');
    if (nameModalInputEl) nameModalInputEl.placeholder = t('name_modal_placeholder');
    if (btnNameSaveEl) btnNameSaveEl.textContent = t('name_modal_save');

    document.getElementById('missionsTitle').textContent = t('missions_title');
    document.getElementById('missionsSubtitle').textContent = t('missions_subtitle');
    document.getElementById('btnBackFromMissions').textContent = t('btn_back_menu');
    renderMissions();

    document.getElementById('shopTitle').textContent = t('shop_title');
    document.getElementById('shopSubtitle').textContent = t('shop_subtitle');
    document.getElementById('btnBackFromShop').textContent = t('btn_back_menu');
    SHOP_TABS.forEach(tabDef => {
      const btn = document.getElementById(tabDef.btnId);
      if (btn) btn.textContent = t(tabDef.labelKey);
    });
    if (shopTabHintEl) shopTabHintEl.textContent = t('shop_tab_hint');
    renderShop();

    document.getElementById('cratesTitle').textContent = t('crates_title');
    document.getElementById('cratesSubtitle').textContent = t('crates_subtitle');
    document.getElementById('btnBackFromCrates').textContent = t('btn_back_menu');
    renderCrateShop();

    document.getElementById('boosterTitle').textContent = t('booster_title');
    document.getElementById('boosterSubtitle').textContent = t('booster_subtitle');
    if (btnStartNoBoosterEl) btnStartNoBoosterEl.textContent = t('btn_start_no_booster');
    renderBoosterPicker();

    document.getElementById('achievementsTitle').textContent = t('achievements_title');
    document.getElementById('achievementsSubtitle').textContent = t('achievements_subtitle');
    document.getElementById('btnBackFromAchievements').title = t('btn_back_menu');
    renderAchievements();

    document.getElementById('profileTitle').textContent = t('profile_title');
    document.getElementById('profileSubtitle').textContent = t('profile_subtitle');
    document.getElementById('btnBackFromProfile').textContent = t('btn_back_menu');
    renderProfile();

    document.getElementById('singleTitle').textContent = t('single_title');
    document.getElementById('singleSubtitle').textContent = t('single_subtitle');
    document.getElementById('btnLevels').textContent = t('btn_levels');
    document.getElementById('btnFreeplay').textContent = t('btn_freeplay');
    document.getElementById('btnBackFromSingle').textContent = t('btn_back_menu');
    renderSingleSelect();

    document.getElementById('settingsTitle').textContent = t('settings_title');
    document.getElementById('volumeLabel').textContent = t('settings_volume');
    document.getElementById('languageLabel').textContent = t('settings_language');
    document.getElementById('unlocksTitle').textContent = t('settings_unlocks_title');
    if (btnResetGameEl) btnResetGameEl.textContent = t('btn_reset_game');
    document.getElementById('btnBackFromSettings').textContent = t('btn_back_menu');

    document.getElementById('multiTitle').textContent = t('multi_title');
    document.getElementById('multiSubtitle').textContent = t('multi_subtitle');
    document.getElementById('btnCoop').textContent = t('btn_coop');
    document.getElementById('coopDesc').textContent = t('coop_desc');
    document.getElementById('btnVersus').textContent = t('btn_versus');
    document.getElementById('versusDesc').textContent = t('versus_desc');
    document.getElementById('btnBackFromMulti').textContent = t('btn_back_menu');

    document.getElementById('levelTitle').textContent = t('level_title');
    document.getElementById('levelSub').textContent = t('level_subtitle');
    document.getElementById('btnBackFromLevels').textContent = t('btn_back_menu');
    renderLevelGrid();

    document.getElementById('exitTitle').textContent = t('exit_title');
    document.getElementById('exitSubtitle').textContent = t('exit_subtitle');
    document.getElementById('btnBackFromExit').textContent = t('btn_back_menu');

    document.getElementById('pauseTitle').textContent = t('pause_title');
    document.getElementById('pauseVolumeLabel').textContent = t('settings_volume');
    document.getElementById('pauseLanguageLabel').textContent = t('settings_language');
    document.getElementById('btnResume').textContent = t('btn_resume');
    document.getElementById('btnPauseMenu').textContent = t('overlay_main_menu');

    document.getElementById('hint').textContent = t('hint_text');
    document.getElementById('legendBlock').textContent = t('legend_block');
    document.getElementById('legendZigzag').textContent = t('legend_zigzag');
    document.getElementById('legendOrb').textContent = t('legend_orb');
    document.getElementById('legendSlider').textContent = t('legend_slider');
    document.getElementById('legendSpinner').textContent = t('legend_spinner');
    document.getElementById('legendPulsar').textContent = t('legend_pulsar');
    document.getElementById('legendGate').textContent = t('legend_gate');
    document.getElementById('legendHoming').textContent = t('legend_homing');
    document.getElementById('legendMine').textContent = t('legend_mine');
    document.getElementById('legendSwarm').textContent = t('legend_swarm');

    // Must run last — several lines above (btnMissions/btnCrates/btnChallenge
    // textContent) unconditionally set the plain unlocked label, which this
    // overwrites with the locked variant when the player's level is too low.
    updateFeatureLocks();
  }

  // ---------- PROGRESS ----------
  const LEVEL_COUNT = 100;
  function loadProgress(){
    try {
      const raw = localStorage.getItem('scraper_progress_v1');
      if (raw){
        const arr = JSON.parse(raw);
        // Pad rather than discard when LEVEL_COUNT grows (e.g. the 50->100
        // level expansion) — a shorter saved array still holds real progress
        // that shouldn't be wiped just because the game added more levels.
        if (Array.isArray(arr) && arr.length <= LEVEL_COUNT){
          const padded = arr.slice(0, LEVEL_COUNT);
          while (padded.length < LEVEL_COUNT) padded.push(false);
          return padded;
        }
      }
    } catch(e){}
    return new Array(LEVEL_COUNT).fill(false);
  }
  function saveProgress(){
    try { localStorage.setItem('scraper_progress_v1', JSON.stringify(progress)); } catch(e){}
  }
  let progress = loadProgress();

  function loadVolume(){
    try {
      const raw = localStorage.getItem('scraper_volume_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, Math.min(100, v)); }
    } catch(e){}
    return 60;
  }
  function saveVolume(v){
    try { localStorage.setItem('scraper_volume_v1', String(v)); } catch(e){}
  }
  let volumePercent = loadVolume();
  if (volumeSlider) volumeSlider.value = volumePercent;

  function loadBestFree(){
    try {
      const raw = localStorage.getItem('scraper_bestdist_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return v; }
    } catch(e){}
    return 0;
  }
  function saveBestFree(v){
    try { localStorage.setItem('scraper_bestdist_v1', String(v)); } catch(e){}
  }
  let bestFree = loadBestFree();

  // Diamonds: first real source is the Daily Challenge reward (see CHALLENGE
  // section). Only sink so far is the 'legendary' crate (10 diamonds, see
  // CRATES in the SHOP/SKINS section).
  function loadDiamonds(){
    try {
      const raw = localStorage.getItem('scraper_diamonds_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, v); }
    } catch(e){}
    return 0;
  }
  function saveDiamonds(){
    try { localStorage.setItem('scraper_diamonds_v1', String(diamonds)); } catch(e){}
  }
  let diamonds = loadDiamonds();
  function addDiamonds(n){
    if (n <= 0) return;
    diamonds += n;
    saveDiamonds();
    totalDiamondsEarned += n;
    saveRunCounter('scraper_totaldiamonds_v1', totalDiamondsEarned);
    updateCoinsHud();
    checkAchievements();
    checkMissions();
  }

  // ---------- BOOSTERS ----------
  // Per-run consumables, picked from a small screen shown right after
  // pressing Play for Free mode / Co-op / Versus (not Levels, not the Daily
  // Challenge — see anyBoosterOwned()/launchMode() near the mode selector
  // below). Currently the only source is crates (see rollCrateItem()) — a
  // "buy directly" and/or "earn from missions" path may come later.
  const BOOSTERS = {
    coins2x: { id: 'coins2x', icon: '🪙', nameKey: 'booster_coins2x_name', descKey: 'booster_coins2x_desc' },
    slowmo:  { id: 'slowmo',  icon: '🐢', nameKey: 'booster_slowmo_name',  descKey: 'booster_slowmo_desc'  },
    small:   { id: 'small',   icon: '🔍', nameKey: 'booster_small_name',   descKey: 'booster_small_desc'   },
    heart:   { id: 'heart',   icon: '❤️', nameKey: 'booster_heart_name',   descKey: 'booster_heart_desc'   }
  };
  const BOOSTER_IDS = Object.keys(BOOSTERS);
  function loadBoosterInventory(){
    try {
      const raw = localStorage.getItem('scraper_boosters_v1');
      if (raw){
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object'){
          const out = {};
          BOOSTER_IDS.forEach(id => { out[id] = Math.max(0, parseInt(obj[id], 10) || 0); });
          return out;
        }
      }
    } catch(e){}
    const zero = {}; BOOSTER_IDS.forEach(id => { zero[id] = 0; }); return zero;
  }
  function saveBoosterInventory(){
    try { localStorage.setItem('scraper_boosters_v1', JSON.stringify(boosterInventory)); } catch(e){}
  }
  let boosterInventory = loadBoosterInventory();
  // Set by launchMode() right before a boosted run starts; cleared by the
  // "play again" buttons in finishRun() and reset defensively at the start
  // of startLevel()/startChallenge(), so a leftover booster can never
  // silently carry into a run it wasn't picked for.
  let activeBooster = null;
  // Whether the 'heart' booster has already revived the player THIS run
  // (0/1 flag, not a counter — only one revive per run is allowed), reset to
  // 0 in resetRun(). See tryHeartRevive().
  let heartRevivesUsed = 0;

  // ---------- ABILITIES ----------
  // Unlike boosters (picked once, before the run starts), abilities are
  // carried into EVERY run automatically and triggered live with the 1/2/3
  // keys whenever the player wants — no mode restriction (works in Levels,
  // the Daily Challenge, everywhere). Same crate-only acquisition as
  // boosters for now (see rollCrateItem()).
  const ABILITIES = {
    shield: { id: 'shield', key: '1', icon: '🛡️', nameKey: 'ability_shield_name', descKey: 'ability_shield_desc' },
    invis:  { id: 'invis',  key: '2', icon: '👻', nameKey: 'ability_invis_name',  descKey: 'ability_invis_desc'  },
    pulse:  { id: 'pulse',  key: '3', icon: '💥', nameKey: 'ability_pulse_name',  descKey: 'ability_pulse_desc'  }
  };
  const ABILITY_IDS = Object.keys(ABILITIES);
  function loadAbilityInventory(){
    try {
      const raw = localStorage.getItem('scraper_abilities_v1');
      if (raw){
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object'){
          const out = {};
          ABILITY_IDS.forEach(id => { out[id] = Math.max(0, parseInt(obj[id], 10) || 0); });
          return out;
        }
      }
    } catch(e){}
    const zero = {}; ABILITY_IDS.forEach(id => { zero[id] = 0; }); return zero;
  }
  function saveAbilityInventory(){
    try { localStorage.setItem('scraper_abilities_v1', JSON.stringify(abilityInventory)); } catch(e){}
  }
  let abilityInventory = loadAbilityInventory();

  // ---------- CURRENCY ----------
  const COIN_METERS_PER_COIN = 20;
  function loadCoins(){
    try {
      const raw = localStorage.getItem('scraper_coins_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, v); }
    } catch(e){}
    return 0;
  }
  function saveCoins(v){
    try { localStorage.setItem('scraper_coins_v1', String(v)); } catch(e){}
  }
  let coins = loadCoins();
  function coinsForDistance(d){
    return Math.floor(Math.max(0, d) / COIN_METERS_PER_COIN);
  }
  // EXP-per-run (single/freeplay only, mirrors where coins-from-distance
  // already apply) — on top of crates, which remain the bigger EXP source.
  const EXP_METERS_PER_EXP = 30;
  function expForDistance(d){
    return Math.floor(Math.max(0, d) / EXP_METERS_PER_EXP);
  }
  function addCoins(n){
    if (n <= 0) return;
    coins += n;
    saveCoins(coins);
    totalCoinsEarned += n;
    saveTotalCoinsEarned(totalCoinsEarned);
    updateCoinsHud();
    checkAchievements();
    checkMissions();
  }
  function updateCoinsHud(){
    if (mmCoinsEl) mmCoinsEl.textContent = t('mainMenu_coins', { n: coins });
    if (mmDiamondsEl) mmDiamondsEl.textContent = t('mainMenu_diamonds', { n: diamonds });
    if (shopCoinsEl) shopCoinsEl.textContent = t('mainMenu_coins', { n: coins });
    updateLevelHud();
  }

  // ---------- LEVEL / EXP ----------
  // Meta-progression separate from coins/diamonds. First (and so far only)
  // source of EXP is crates (see rollCrateItem() in the CRATES section).
  function loadLevel(){
    try {
      const raw = localStorage.getItem('scraper_level_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v) && v >= 1) return v; }
    } catch(e){}
    return 1;
  }
  function saveLevel(v){
    try { localStorage.setItem('scraper_level_v1', String(v)); } catch(e){}
  }
  function loadExp(){
    try {
      const raw = localStorage.getItem('scraper_exp_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, v); }
    } catch(e){}
    return 0;
  }
  function saveExp(v){
    try { localStorage.setItem('scraper_exp_v1', String(v)); } catch(e){}
  }
  let level = loadLevel();
  let exp = loadExp();
  // EXP needed to advance FROM level l to l+1: 100 for level 1, +25 per level after.
  function expForLevel(l){
    return 100 + (l - 1) * 25;
  }
  function updateLevelHud(){
    if (mmLevelLabelEl) mmLevelLabelEl.textContent = t('mainMenu_level', { n: level });
    const need = expForLevel(level);
    if (mmLevelExpEl) mmLevelExpEl.textContent = t('mainMenu_level_exp', { cur: exp, need: need });
    if (mmLevelBarFillEl){
      mmLevelBarFillEl.style.width = Math.max(0, Math.min(100, (exp / need) * 100)) + '%';
    }
    updateFeatureLocks();
    if (tutorialStep === 0 && level >= 2) advanceTutorial(0);
    renderTutorial();
  }
  function addExp(n){
    if (n <= 0) return;
    exp += n;
    while (exp >= expForLevel(level)){
      exp -= expForLevel(level);
      level++;
    }
    saveLevel(level);
    saveExp(exp);
    updateLevelHud();
    checkAchievements();
    checkMissions();
  }

  // ---------- FEATURE UNLOCKS (gated by player level) ----------
  // Poziomy/Misje dzienne stay available from level 1 — everything below is
  // what the user explicitly asked to gate, levels chosen by them, not
  // derived from any formula.
  const FEATURE_UNLOCK_LEVELS = { shop: 2, missions: 5, crates: 10, freeplay: 10, multiplayer: 15, challenge: 15 };
  // Full reference list rendered in Settings (see renderUnlocksList) — the
  // two level:1 entries are always-available features shown for completeness,
  // not real gates.
  const FEATURE_INFO = [
    { nameKey: 'btn_levels', level: 1 },
    { nameKey: 'daily_missions_title', level: 1 },
    { nameKey: 'btn_shop', level: FEATURE_UNLOCK_LEVELS.shop },
    { nameKey: 'btn_missions', level: FEATURE_UNLOCK_LEVELS.missions },
    { nameKey: 'btn_crates', level: FEATURE_UNLOCK_LEVELS.crates },
    { nameKey: 'btn_freeplay', level: FEATURE_UNLOCK_LEVELS.freeplay },
    { nameKey: 'btn_multiplayer', level: FEATURE_UNLOCK_LEVELS.multiplayer },
    { nameKey: 'btn_challenge', level: FEATURE_UNLOCK_LEVELS.challenge }
  ];
  function lockButtonLabel(btn, unlocked, labelKey, levelReq){
    if (!btn) return;
    btn.disabled = !unlocked;
    btn.textContent = (unlocked ? '' : '🔒 ') + t(labelKey);
    btn.title = unlocked ? '' : t('mainMenu_locked_level', { n: levelReq });
  }
  function renderUnlocksList(){
    if (!unlocksListEl) return;
    unlocksListEl.innerHTML = '';
    FEATURE_INFO.forEach(f => {
      const unlocked = level >= f.level;
      const row = document.createElement('div');
      row.className = 'quest-row' + (unlocked ? ' unlocked' : '');
      const icon = document.createElement('div');
      icon.className = 'quest-icon';
      icon.textContent = unlocked ? '✅' : '🔒';
      const body = document.createElement('div');
      body.className = 'quest-body';
      const topLine = document.createElement('div');
      topLine.className = 'quest-top-line';
      const name = document.createElement('div');
      name.className = 'quest-name';
      name.textContent = t(f.nameKey);
      topLine.appendChild(name);
      const desc = document.createElement('div');
      desc.className = 'quest-desc';
      desc.textContent = unlocked ? t('unlocks_status_unlocked') : t('mainMenu_locked_level', { n: f.level });
      body.appendChild(topLine); body.appendChild(desc);
      row.appendChild(icon); row.appendChild(body);
      unlocksListEl.appendChild(row);
    });
  }
  function updateFeatureLocks(){
    lockButtonLabel(document.getElementById('btnShop'), level >= FEATURE_UNLOCK_LEVELS.shop, 'btn_shop', FEATURE_UNLOCK_LEVELS.shop);
    lockButtonLabel(document.getElementById('btnMissions'), level >= FEATURE_UNLOCK_LEVELS.missions, 'btn_missions', FEATURE_UNLOCK_LEVELS.missions);
    lockButtonLabel(document.getElementById('btnCrates'), level >= FEATURE_UNLOCK_LEVELS.crates, 'btn_crates', FEATURE_UNLOCK_LEVELS.crates);
    lockButtonLabel(btnChallengeEl, level >= FEATURE_UNLOCK_LEVELS.challenge, 'btn_challenge', FEATURE_UNLOCK_LEVELS.challenge);
    renderMenuMode();
    renderUnlocksList();
  }

  // ---------- TUTORIAL ----------
  // Five sequential onboarding steps (see the step map by TUTORIAL_DONE_STEP
  // below), shown as a blocking modal nested inside #mainMenu (so it inherits
  // its fixed full-viewport coordinates — see .tutorial-modal in style.css)
  // with a dimmed background the player must dismiss with OK before the menu
  // becomes interactive again. The daily-mission step is always solvable via
  // Levels alone — only 2 of the 6 DAILY_TEMPLATES need a still-locked mode
  // (Freeplay/Multiplayer), and 3 distinct templates are picked per day, so
  // at least one of the three is always reachable.
  function loadTutorialStep(){
    try {
      const raw = localStorage.getItem('scraper_tutorial_v1');
      if (raw !== null){ const v = parseInt(raw, 10); if (!isNaN(v) && v >= 0) return v; }
    } catch(e){}
    return 0;
  }
  function saveTutorialStep(v){
    try { localStorage.setItem('scraper_tutorial_v1', String(v)); } catch(e){}
  }
  // Separate from tutorialStep: which step number the player has already
  // clicked OK for. Whenever advanceTutorial() moves to a new step this goes
  // stale (no longer equal to tutorialStep), so the modal pops back up with
  // the new instruction — without needing to re-show it on every unrelated
  // re-render while a step is still in progress.
  function loadTutorialAck(){
    try {
      const raw = localStorage.getItem('scraper_tutorial_ack_v1');
      if (raw !== null){ const v = parseInt(raw, 10); if (!isNaN(v)) return v; }
    } catch(e){}
    return -1;
  }
  function saveTutorialAck(v){
    try { localStorage.setItem('scraper_tutorial_ack_v1', String(v)); } catch(e){}
  }
  let tutorialStep = loadTutorialStep(); // 0-4 = active step, 5 = finished
  let tutorialAckedStep = loadTutorialAck();
  let tutorialModalOpen = false;
  let typewriterTimer = null;
  function typewriterReveal(el, fullText){
    if (typewriterTimer) clearInterval(typewriterTimer);
    el.textContent = '';
    // Array.from splits by Unicode code point, not UTF-16 code unit — plain
    // fullText[i] would tear a surrogate pair (e.g. the 🏆 in tutorial_step3)
    // in two and briefly render half of it.
    const chars = Array.from(fullText);
    let i = 0;
    typewriterTimer = setInterval(() => {
      if (i >= chars.length){
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        return;
      }
      el.textContent += chars[i];
      playTypeTick();
      i++;
    }, 26);
  }
  function hideTutorialModal(){
    tutorialModalOpen = false;
    if (typewriterTimer){ clearInterval(typewriterTimer); typewriterTimer = null; }
    if (tutorialModalEl) tutorialModalEl.classList.remove('show');
  }
  // Step map: 0 reach level 2 -> 1 Shop+buy+equip -> 2 click Achievements ->
  // 3 clear a daily mission -> 4 closing "more unlocks later" message (no
  // target, OK just finishes) -> 5 done.
  const TUTORIAL_DONE_STEP = 5;
  const TUTORIAL_LAST_STEP = 4;
  function showTutorialModal(){
    if (tutorialModalOpen || !tutorialModalEl) return;
    tutorialModalOpen = true;
    if (tutorialModalTitleEl) tutorialModalTitleEl.textContent = t('tutorial_title');
    let stepText = '', progressText = '';
    if (tutorialStep === 0){
      stepText = t('tutorial_step1');
      progressText = t('tutorial_step1_progress', { cur: Math.min(level, 2), need: 2 });
    } else if (tutorialStep === 1){
      stepText = t('tutorial_step2');
    } else if (tutorialStep === 2){
      stepText = t('tutorial_step3');
    } else if (tutorialStep === 3){
      stepText = t('tutorial_step4');
    } else {
      stepText = t('tutorial_step5');
    }
    if (tutorialModalProgressEl) tutorialModalProgressEl.textContent = progressText;
    tutorialModalEl.classList.add('show');
    if (tutorialModalTextEl) typewriterReveal(tutorialModalTextEl, stepText);
  }
  // Guided-click phase for steps 1 (Shop), 2 (Achievements) and 3 (Levels, to
  // go earn a daily mission — the daily-missions panel itself has no click
  // target, so it just gets a highlight, see updateDailyPanelSpotlight):
  // every other main-menu button gets force-disabled and only the target
  // stays clickable (pulsing highlight, .tutorial-spotlight in style.css) —
  // the user's "a w resztę się nie da wtedy kliknąć" requirement. Steps 0
  // and 4 have no clickable target, so no button gets spotlighted.
  const MAIN_MENU_INTERACTIVE_IDS = ['btnShop','btnMissions','btnCrates','btnLevels','btnPlay','mmModePrev','mmModeNext','btnChallenge','btnAchievements','btnProfile','btnMenuToggle'];
  function tutorialSpotlightForStep(step){
    if (step === 1) return 'btnShop';
    if (step === 2) return 'btnAchievements';
    if (step === 3) return 'btnLevels';
    return null;
  }
  function updateDailyPanelSpotlight(){
    const el = document.getElementById('mmDaily');
    if (el) el.classList.toggle('tutorial-spotlight', tutorialStep === 3);
  }
  function applyTutorialSpotlight(targetId){
    MAIN_MENU_INTERACTIVE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === targetId){
        el.classList.add('tutorial-spotlight');
        el.disabled = false;
      } else {
        el.classList.remove('tutorial-spotlight');
        el.disabled = true;
      }
    });
    updateDailyPanelSpotlight();
  }
  // Re-enables everything then lets updateFeatureLocks() re-apply whichever
  // buttons should still be level-locked — spotlight force-disable and
  // feature-level-lock disable are otherwise indistinguishable on the DOM.
  function clearTutorialSpotlight(){
    MAIN_MENU_INTERACTIVE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('tutorial-spotlight');
      el.disabled = false;
    });
    updateFeatureLocks();
    updateDailyPanelSpotlight();
  }
  function syncTutorialSpotlight(){
    const target = tutorialSpotlightForStep(tutorialStep);
    if (target) applyTutorialSpotlight(target);
    else clearTutorialSpotlight();
  }
  // Called on every level-change re-render (see updateLevelHud) — pops the
  // modal back up whenever the current step hasn't been OK'd yet, no-ops
  // (via tutorialModalOpen) if it's already showing. Also keeps the spotlight
  // in sync so it's re-applied correctly after a page reload mid-tutorial.
  function renderTutorial(){
    // If all of today's daily missions were already completed before this
    // step was ever reached (e.g. cleared earlier while grinding to level 2),
    // checkDailyMissions() has nothing left to newly complete and would
    // never fire advanceTutorial(3) — that stranded players on step 3 with
    // Settings/reset spotlight-blocked. Detect "already done" directly.
    if (tutorialStep === 3){
      ensureDailyFresh();
      if (dailyMeta.completed.length > 0){
        advanceTutorial(3);
        return;
      }
    }
    if (tutorialStep >= TUTORIAL_DONE_STEP){
      hideTutorialModal();
      clearTutorialSpotlight();
      checkNamePrompt();
      return;
    }
    // Only actually pop the modal (and its typewriter sound) while the main
    // menu is the visible screen — reaching level 2 or equipping a skin can
    // both happen while another screen is showing (mid-run, inside Shop),
    // and the modal lives nested inside #mainMenu (see .tutorial-modal in
    // style.css), invisible whenever that screen isn't active. The spotlight
    // state still gets synced regardless, so it's already correct for
    // whichever button matters once the player does land back on the menu.
    if (tutorialAckedStep !== tutorialStep && mainMenu.classList.contains('show')) showTutorialModal();
    syncTutorialSpotlight();
  }
  function advanceTutorial(fromStep){
    if (tutorialStep !== fromStep) return;
    tutorialStep++;
    saveTutorialStep(tutorialStep);
    hideTutorialModal();
    if (tutorialStep >= TUTORIAL_DONE_STEP) showRewardToast('🎓', t('tutorial_complete_toast'), t('tutorial_complete_toast_sub'));
    renderTutorial();
  }
  if (btnTutorialOkEl) btnTutorialOkEl.addEventListener('click', () => {
    // The closing step has no click-target to wait for — OK finishes it.
    if (tutorialStep === TUTORIAL_LAST_STEP){
      advanceTutorial(TUTORIAL_LAST_STEP);
      return;
    }
    tutorialAckedStep = tutorialStep;
    saveTutorialAck(tutorialAckedStep);
    hideTutorialModal();
    syncTutorialSpotlight();
  });
  if (btnTutorialSkipEl) btnTutorialSkipEl.addEventListener('click', () => {
    if (!confirm(t('tutorial_skip_confirm'))) return;
    tutorialStep = TUTORIAL_DONE_STEP;
    saveTutorialStep(tutorialStep);
    tutorialAckedStep = TUTORIAL_DONE_STEP;
    saveTutorialAck(tutorialAckedStep);
    hideTutorialModal();
    clearTutorialSpotlight();
    checkNamePrompt();
  });
  if (btnNameSaveEl) btnNameSaveEl.addEventListener('click', submitPlayerName);
  if (nameModalInputEl) nameModalInputEl.addEventListener('keydown', (e) => {
    // Stop digits/WASD typed into the name from leaking to the global
    // movement/ability keydown listener further down this file (see
    // runDevCommand's console input for the same guard, same reason).
    e.stopPropagation();
    if (e.key === 'Enter') submitPlayerName();
  });

  // ---------- DEV CONSOLE ----------
  // Debug-only cheat console for the developer, not a player-facing feature:
  // press "/" anywhere outside a text field to open a small command bar,
  // type e.g. "set money 5000" / "set diamonds 200" / "set level 40", Enter
  // to apply. Not gated behind anything — this is a local single-player save
  // file, same trust level as editing localStorage by hand in DevTools.
  let devConsoleOpen = false;
  function isTypingInField(el){
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }
  function openDevConsole(){
    if (devConsoleOpen || !devConsoleEl) return;
    devConsoleOpen = true;
    devConsoleEl.classList.add('show');
    if (devConsoleInputEl){ devConsoleInputEl.value = ''; devConsoleInputEl.focus(); }
  }
  function closeDevConsole(){
    devConsoleOpen = false;
    if (devConsoleEl) devConsoleEl.classList.remove('show');
    if (devConsoleInputEl) devConsoleInputEl.blur();
  }
  function runDevCommand(raw){
    const parts = raw.trim().toLowerCase().split(/\s+/);
    if (parts[0] !== 'set' || parts.length < 3) return;
    const n = parseInt(parts[2], 10);
    if (isNaN(n) || n < 0) return;
    const subject = parts[1];
    if (subject === 'money' || subject === 'coins'){
      coins = n; saveCoins(coins);
    } else if (subject === 'diamonds'){
      diamonds = n; saveDiamonds();
    } else if (subject === 'level'){
      level = Math.max(1, n); saveLevel(level); exp = 0; saveExp(exp);
    } else {
      return;
    }
    updateCoinsHud();
  }
  document.addEventListener('keydown', (e) => {
    if (!devConsoleOpen && e.key === '/' && !isTypingInField(document.activeElement)){
      e.preventDefault();
      openDevConsole();
    }
  });
  if (devConsoleInputEl) devConsoleInputEl.addEventListener('keydown', (e) => {
    // Same leak guard as the name-modal input above.
    e.stopPropagation();
    if (e.key === 'Enter'){
      runDevCommand(devConsoleInputEl.value);
      closeDevConsole();
    } else if (e.key === 'Escape'){
      closeDevConsole();
    }
  });

  // ---------- RESET ----------
  // Wipes ALL saved progress (record, coins/diamonds, level/EXP, skins,
  // achievements, missions, daily missions/challenge, boosters/abilities,
  // every lifetime counter — every key this file ever writes, all sharing
  // the 'scraper_' prefix, see pkt 7 in DOCUMENTATION.md). Rather than
  // hardcoding all ~26 key names (which would silently go stale the next
  // time a feature adds one), it removes any localStorage key it finds with
  // that prefix, then reloads the page so every load*() function re-runs
  // from empty storage and produces its own correct default — the same
  // "fresh install" state a first-time player would see.
  function resetGame(){
    try {
      // Today's 3 daily missions stay the same after a reset — only their
      // progress resets (to 0/undone), same as everything else — instead of
      // being re-rolled, so missions already cleared before the reset become
      // doable again on the fresh account. User-requested exception to the
      // "wipe everything scraper_*" rule below.
      let keepDaily = null;
      try {
        const raw = localStorage.getItem('scraper_dailymeta_v1');
        if (raw){
          const parsed = JSON.parse(raw);
          if (parsed && parsed.date && Array.isArray(parsed.pickedIds)){
            keepDaily = { date: parsed.date, pickedIds: parsed.pickedIds, completed: [], stats: freshDailyStats() };
          }
        }
      } catch(e){}
      const keys = [];
      for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (k && k.indexOf('scraper_') === 0) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
      if (keepDaily) localStorage.setItem('scraper_dailymeta_v1', JSON.stringify(keepDaily));
    } catch(e){}
    location.reload();
  }

  // ---------- PLAYER NAME PROMPT ----------
  // Fires once, right after the 5-step tutorial finishes (see renderTutorial
  // below) — a required "Nazwa Gracza" text prompt, not skippable like the
  // tutorial itself, so the Profile screen has a name to show instead of a
  // blank line. Reuses .tutorial-modal/.tutorial-modal-box (nested inside
  // #mainMenu, same fixed full-viewport coordinates) since it's the same
  // kind of blocking prompt — only the input field itself is new markup.
  function loadPlayerName(){
    try {
      const raw = localStorage.getItem('scraper_playername_v1');
      if (raw && raw.trim()) return raw.trim();
    } catch(e){}
    return '';
  }
  function savePlayerName(v){
    try { localStorage.setItem('scraper_playername_v1', v); } catch(e){}
  }
  let playerName = loadPlayerName();
  function updateAvatarNameLabel(){
    if (mmAvatarNameEl) mmAvatarNameEl.textContent = playerName;
  }
  let nameModalOpen = false;
  function showNameModal(){
    if (nameModalOpen || !nameModalEl) return;
    nameModalOpen = true;
    nameModalEl.classList.add('show');
    if (nameModalInputEl){
      nameModalInputEl.value = '';
      setTimeout(() => nameModalInputEl.focus(), 50);
    }
  }
  function hideNameModal(){
    nameModalOpen = false;
    if (nameModalEl) nameModalEl.classList.remove('show');
  }
  // Replaces the old always-visible "Exit" button on the main menu — Esc now
  // opens this confirm prompt instead (see the keydown listener near the top
  // of the file), only while the main menu itself is showing (not mid-run,
  // where Esc already means "open pause").
  let exitConfirmOpen = false;
  function showExitConfirm(){
    if (exitConfirmOpen || !exitConfirmModalEl) return;
    exitConfirmOpen = true;
    exitConfirmModalEl.classList.add('show');
  }
  function hideExitConfirm(){
    exitConfirmOpen = false;
    if (exitConfirmModalEl) exitConfirmModalEl.classList.remove('show');
  }
  function confirmExit(){
    hideExitConfirm();
    try { window.close(); } catch(e){}
    showScreen(exitScreen);
  }
  if (btnExitNoEl) btnExitNoEl.addEventListener('click', hideExitConfirm);
  if (btnExitYesEl) btnExitYesEl.addEventListener('click', confirmExit);

  // ---------- SIDE DRAWER ----------
  // Hamburger-triggered menu panel (replaces the old lone gear icon) — right
  // now it only holds Settings, but it's built to grow more items later
  // without needing another icon slot on the top bar.
  function openDrawer(){ if (sideDrawerEl) sideDrawerEl.classList.add('show'); }
  function closeDrawer(){ if (sideDrawerEl) sideDrawerEl.classList.remove('show'); }
  function toggleDrawer(){
    if (!sideDrawerEl) return;
    sideDrawerEl.classList.contains('show') ? closeDrawer() : openDrawer();
  }
  if (btnMenuToggleEl) btnMenuToggleEl.addEventListener('click', toggleDrawer);
  if (btnDrawerCloseEl) btnDrawerCloseEl.addEventListener('click', closeDrawer);
  // Only pops up once the player is actually back on the main menu (see the
  // same reasoning in renderTutorial's showTutorialModal guard) — reaching
  // TUTORIAL_DONE_STEP can happen while another screen is showing.
  function checkNamePrompt(){
    if (!playerName && mainMenu.classList.contains('show')) showNameModal();
  }
  function submitPlayerName(){
    if (!nameModalInputEl) return;
    const v = nameModalInputEl.value.trim();
    if (!v) { nameModalInputEl.focus(); return; }
    playerName = v;
    savePlayerName(v);
    hideNameModal();
    updateAvatarNameLabel();
    renderProfile();
  }

  // ---------- SHOP / SKINS ----------
  // 8 coin skins (bought with the currency from section CURRENCY) + 5 boss skins
  // (auto-unlocked by beating the boss of the matching level, see syncBossSkinUnlocks).
  // 'type' selects the shape renderer in drawBallShape(); 'color'/'glow' are always
  // set too (used for the shadow blur + speed trail even on patterned skins). Every
  // type gets a shared glossy finish + a small per-type animated effect, see
  // addBallFinish()/addSkinEffect() right below the draw*Ball functions.
  const SKINS = [
    { id: 'default', nameKey: 'skin_default', kind: 'coin', price: 0,   type: 'solid', color: '#5ee9d6', glow: 'rgba(94,233,214,0.55)' },
    { id: 'coral',   nameKey: 'skin_coral',   kind: 'coin', price: 60,  type: 'solid', color: '#ff6b6b', glow: 'rgba(255,107,107,0.55)' },
    { id: 'violet',  nameKey: 'skin_violet',  kind: 'coin', price: 140, type: 'solid', color: '#b672ff', glow: 'rgba(182,114,255,0.55)' },
    { id: 'amber',   nameKey: 'skin_amber',   kind: 'coin', price: 260, type: 'solid', color: '#f6c453', glow: 'rgba(246,196,83,0.55)' },
    { id: 'emerald', nameKey: 'skin_emerald', kind: 'coin', price: 420, type: 'solid', color: '#3ddc84', glow: 'rgba(61,220,132,0.55)' },
    { id: 'chrome',  nameKey: 'skin_chrome',  kind: 'coin', price: 560, type: 'chrome', color: '#c8d2dc', glow: 'rgba(200,210,220,0.55)' },
    { id: 'prism',   nameKey: 'skin_prism',   kind: 'coin', price: 780, type: 'prism',  color: '#c9a6ff', glow: 'rgba(201,166,255,0.6)' },
    { id: 'neon',    nameKey: 'skin_neon',    kind: 'coin', price: 980, type: 'neon',   color: '#39f0ff', glow: 'rgba(57,240,255,0.7)' },
    // 22 more coin skins added on top of the original 8 above (2026-07-12,
    // part 3) — same "reuse the parametric renderers" trick as the crate/boss/
    // mission batches (pkt 33/36/37), continuing the price ladder past 980.
    { id: 'crimson',     nameKey: 'skin_crimson',     kind: 'coin', price: 1150, type: 'solid',  color: '#e6194b', glow: 'rgba(230,25,75,0.55)' },
    { id: 'lime',        nameKey: 'skin_lime',        kind: 'coin', price: 1300, type: 'solid',  color: '#9acd32', glow: 'rgba(154,205,50,0.55)' },
    { id: 'sky',         nameKey: 'skin_sky',         kind: 'coin', price: 1450, type: 'solid',  color: '#3ea6ff', glow: 'rgba(62,166,255,0.55)' },
    { id: 'ivory',       nameKey: 'skin_ivory',       kind: 'coin', price: 1600, type: 'solid',  color: '#f2ead3', glow: 'rgba(242,234,211,0.5)' },
    { id: 'topaz',       nameKey: 'skin_topaz',       kind: 'coin', price: 1800, type: 'gem',    color: '#ffb020', glow: 'rgba(255,176,32,0.6)' },
    { id: 'peridot',     nameKey: 'skin_peridot',     kind: 'coin', price: 1950, type: 'gem',    color: '#7fe817', glow: 'rgba(127,232,23,0.55)' },
    { id: 'nebula_rose', nameKey: 'skin_nebula_rose', kind: 'coin', price: 2100, type: 'nebula', color: '#2a0a1a', color2: '#ff5fa2', glow: 'rgba(255,95,162,0.55)' },
    { id: 'nebula_ice',  nameKey: 'skin_nebula_ice',  kind: 'coin', price: 2250, type: 'nebula', color: '#08202a', color2: '#7fe0ff', glow: 'rgba(127,224,255,0.55)' },
    { id: 'zebra',       nameKey: 'skin_zebra',       kind: 'coin', price: 2400, type: 'stripe', color: '#181818', color2: '#f4f4f4', glow: 'rgba(244,244,244,0.5)' },
    { id: 'wasp',        nameKey: 'skin_wasp',        kind: 'coin', price: 2550, type: 'stripe', color: '#f4c400', color2: '#181818', glow: 'rgba(244,196,0,0.55)' },
    { id: 'giraffe',     nameKey: 'skin_giraffe',     kind: 'coin', price: 2700, type: 'dot',    color: '#e8a94b', color2: '#5a3a15', glow: 'rgba(232,169,75,0.5)' },
    { id: 'cheetah',     nameKey: 'skin_cheetah',     kind: 'coin', price: 2850, type: 'dot',    color: '#f2d9a8', color2: '#3a2410', glow: 'rgba(242,217,168,0.5)' },
    { id: 'aurora_wave', nameKey: 'skin_aurora_wave', kind: 'coin', price: 3000, type: 'wave',   color: '#0a1a2a', color2: '#5cffb0', glow: 'rgba(92,255,176,0.5)' },
    { id: 'sunset_wave', nameKey: 'skin_sunset_wave', kind: 'coin', price: 3150, type: 'wave',   color: '#2a0f1a', color2: '#ff8f5c', glow: 'rgba(255,143,92,0.55)' },
    { id: 'quartz',      nameKey: 'skin_quartz',      kind: 'coin', price: 3350, type: 'holo',   color: '#e0d8f0', glow: 'rgba(224,216,240,0.6)' },
    { id: 'onyx',        nameKey: 'skin_onyx',        kind: 'coin', price: 3500, type: 'holo',   color: '#1a1420', glow: 'rgba(150,100,255,0.5)' },
    { id: 'platinum',    nameKey: 'skin_platinum',    kind: 'coin', price: 3750, type: 'metal',  color: '#dfe6ec', glow: 'rgba(223,230,236,0.5)' },
    { id: 'gunmetal',    nameKey: 'skin_gunmetal',    kind: 'coin', price: 3900, type: 'metal',  color: '#3f4650', glow: 'rgba(140,160,190,0.5)' },
    { id: 'copper',      nameKey: 'skin_copper',      kind: 'coin', price: 4100, type: 'metal',  color: '#b3703a', glow: 'rgba(179,112,58,0.55)' },
    { id: 'inferno',     nameKey: 'skin_inferno',     kind: 'coin', price: 4350, type: 'spark',  color: '#ff5b1f', glow: 'rgba(255,91,31,0.6)' },
    { id: 'glacier',     nameKey: 'skin_glacier',     kind: 'coin', price: 4500, type: 'spark',  color: '#b0f0ff', glow: 'rgba(176,240,255,0.6)' },
    { id: 'venom',       nameKey: 'skin_venom',       kind: 'coin', price: 4700, type: 'spark',  color: '#7bff3a', glow: 'rgba(123,255,58,0.6)' },
    { id: 'soccer',   nameKey: 'skin_soccer',   kind: 'boss', bossLevel: 10, type: 'soccer',   color: '#f4f4f4', glow: 'rgba(255,255,255,0.5)' },
    { id: 'disco',    nameKey: 'skin_disco',    kind: 'boss', bossLevel: 20, type: 'disco',    color: '#cfd8ea', glow: 'rgba(200,220,255,0.6)' },
    { id: 'fire',     nameKey: 'skin_fire',     kind: 'boss', bossLevel: 30, type: 'fire',     color: '#ff7a1a', glow: 'rgba(255,122,26,0.6)' },
    { id: 'galaxy',   nameKey: 'skin_galaxy',   kind: 'boss', bossLevel: 40, type: 'galaxy',   color: '#7a5cff', glow: 'rgba(122,92,255,0.6)' },
    { id: 'champion', nameKey: 'skin_champion', kind: 'boss', bossLevel: 50, type: 'champion', color: '#ffd75e', glow: 'rgba(255,215,94,0.7)' },
    // 5 more boss skins for the 100-level expansion's remaining bosses (pkt 29
    // in DOCUMENTATION.md added bosses up to level 100, but only the original
    // 5 boss skins existed) — reuse the 8 parametric renderers from the crate
    // skins below instead of one-off draw functions, same effort trade-off as
    // pkt 33. syncBossSkinUnlocks() already works generically off bossLevel,
    // no logic changes needed.
    { id: 'titan',     nameKey: 'skin_titan',     kind: 'boss', bossLevel: 60,  type: 'metal',  color: '#8b96a8', glow: 'rgba(139,150,168,0.55)' },
    { id: 'supernova', nameKey: 'skin_supernova', kind: 'boss', bossLevel: 70,  type: 'nebula', color: '#3a0805', color2: '#ffb347', glow: 'rgba(255,140,60,0.6)' },
    { id: 'charge',    nameKey: 'skin_charge',    kind: 'boss', bossLevel: 80,  type: 'spark',  color: '#39ff8a', glow: 'rgba(57,255,138,0.6)' },
    { id: 'zenith',    nameKey: 'skin_zenith',    kind: 'boss', bossLevel: 90,  type: 'holo',   color: '#3d1a66', glow: 'rgba(150,80,220,0.55)' },
    { id: 'eternity',  nameKey: 'skin_eternity',  kind: 'boss', bossLevel: 100, type: 'gem',    color: '#ffe9a8', glow: 'rgba(255,233,168,0.7)' },
    // 5 mission-exclusive skins (see MISSIONS section) — reuse the 'solid' renderer
    // (gets the shared glossy finish + diagonal-flash effect for free, see
    // addBallFinish()/addSkinEffect()), only the palette is new. Unlocked via
    // checkMissions(), never purchasable — missionNameKey drives the shop's
    // locked-state copy (t('skin_locked_mission')).
    { id: 'titanium', nameKey: 'skin_titanium', kind: 'mission', missionId: 'm_level_25',      type: 'solid', color: '#9fb4c9', glow: 'rgba(159,180,201,0.55)' },
    { id: 'aurora',   nameKey: 'skin_aurora',   kind: 'mission', missionId: 'm_freeplay_6000', type: 'solid', color: '#c8ff6b', glow: 'rgba(200,255,107,0.55)' },
    { id: 'void',     nameKey: 'skin_void',     kind: 'mission', missionId: 'm_shop_all',      type: 'solid', color: '#6c2bd9', glow: 'rgba(108,43,217,0.6)' },
    { id: 'solaris',  nameKey: 'skin_solaris',  kind: 'mission', missionId: 'm_all_levels',    type: 'solid', color: '#ff6a00', glow: 'rgba(255,106,0,0.6)' },
    { id: 'frost',    nameKey: 'skin_frost',    kind: 'mission', missionId: 'm_coins_5000',    type: 'solid', color: '#bfe9ff', glow: 'rgba(191,233,255,0.6)' },
    // 5 more mission-exclusive skins added with the 40-mission expansion (see
    // MISSIONS below) — unlike the 5 above, these reuse the 8 parametric
    // renderers (same trick as the crate/boss skins) instead of 'solid', since
    // they're meant to feel like a step up in prestige from the first batch.
    { id: 'obsidian', nameKey: 'skin_obsidian', kind: 'mission', missionId: 'm_crates_20',     type: 'metal',  color: '#22212b', glow: 'rgba(150,120,255,0.45)' },
    { id: 'phoenix',  nameKey: 'skin_phoenix',  kind: 'mission', missionId: 'm_abilities_50',  type: 'spark',  color: '#ff3b3b', glow: 'rgba(255,59,59,0.6)' },
    { id: 'celestia', nameKey: 'skin_celestia', kind: 'mission', missionId: 'm_diamonds_1000', type: 'holo',   color: '#0a1a3d', glow: 'rgba(120,180,255,0.55)' },
    { id: 'infinity', nameKey: 'skin_infinity', kind: 'mission', missionId: 'm_challenges_15', type: 'nebula', color: '#05050a', color2: '#f5f5ff', glow: 'rgba(245,245,255,0.5)' },
    { id: 'genesis',  nameKey: 'skin_genesis',  kind: 'mission', missionId: 'm_crateskins_15', type: 'gem',    color: '#ffd54a', glow: 'rgba(255,213,74,0.65)' },
    // 30 crate-exclusive skins (see pkt 33 in DOCUMENTATION.md) — never bought
    // or missioned, purely a random crate drop (see rollCrateItem()'s 'skin'
    // branch, kind 'coin' || 'crate'). Built from the 8 parametric renderers
    // above instead of one-off functions, same "one function, many palettes"
    // trick as the 8 'solid' coin skins — colors chosen so even skins sharing
    // a renderer look clearly distinct from each other.
    { id: 'ruby',        nameKey: 'skin_ruby',        kind: 'crate', type: 'gem', color: '#e0294b', glow: 'rgba(224,41,75,0.6)' },
    { id: 'sapphire',    nameKey: 'skin_sapphire',    kind: 'crate', type: 'gem', color: '#2a6df5', glow: 'rgba(42,109,245,0.6)' },
    { id: 'jade',        nameKey: 'skin_jade',        kind: 'crate', type: 'gem', color: '#1fae6e', glow: 'rgba(31,174,110,0.6)' },
    { id: 'amethyst',    nameKey: 'skin_amethyst',    kind: 'crate', type: 'gem', color: '#8b3fd9', glow: 'rgba(139,63,217,0.6)' },
    { id: 'nebula_ember', nameKey: 'skin_nebula_ember', kind: 'crate', type: 'nebula', color: '#2a0f08', color2: '#ff7a3c', glow: 'rgba(255,122,60,0.55)' },
    { id: 'nebula_azure', nameKey: 'skin_nebula_azure', kind: 'crate', type: 'nebula', color: '#0a1f38', color2: '#4fd8ff', glow: 'rgba(79,216,255,0.55)' },
    { id: 'nebula_venom', nameKey: 'skin_nebula_venom', kind: 'crate', type: 'nebula', color: '#0f2410', color2: '#8dff5c', glow: 'rgba(141,255,92,0.55)' },
    { id: 'nebula_aurum', nameKey: 'skin_nebula_aurum', kind: 'crate', type: 'nebula', color: '#2a1f08', color2: '#ffcf4d', glow: 'rgba(255,207,77,0.55)' },
    { id: 'candy',       nameKey: 'skin_candy',       kind: 'crate', type: 'stripe', color: '#ff3b5c', color2: '#ffffff', glow: 'rgba(255,59,92,0.5)' },
    { id: 'hazard',      nameKey: 'skin_hazard',      kind: 'crate', type: 'stripe', color: '#1a1a1a', color2: '#ffcc00', glow: 'rgba(255,204,0,0.5)' },
    { id: 'blizzard',    nameKey: 'skin_blizzard',    kind: 'crate', type: 'stripe', color: '#2a6df5', color2: '#ffffff', glow: 'rgba(42,109,245,0.5)' },
    { id: 'bubblegum',   nameKey: 'skin_bubblegum',   kind: 'crate', type: 'stripe', color: '#ff8fd8', color2: '#ffffff', glow: 'rgba(255,143,216,0.5)' },
    { id: 'ladybug',     nameKey: 'skin_ladybug',     kind: 'crate', type: 'dot', color: '#d9203a', color2: '#1a1a1a', glow: 'rgba(217,32,58,0.5)' },
    { id: 'panda',       nameKey: 'skin_panda',       kind: 'crate', type: 'dot', color: '#f4f4f4', color2: '#1a1a1a', glow: 'rgba(244,244,244,0.5)' },
    { id: 'leopard',     nameKey: 'skin_leopard',     kind: 'crate', type: 'dot', color: '#ff9a3c', color2: '#3a1f0a', glow: 'rgba(255,154,60,0.5)' },
    { id: 'orchid',      nameKey: 'skin_orchid',      kind: 'crate', type: 'dot', color: '#f4e9ff', color2: '#8b3fd9', glow: 'rgba(139,63,217,0.5)' },
    { id: 'tide',        nameKey: 'skin_tide',        kind: 'crate', type: 'wave', color: '#0c3d5c', color2: '#2ad9c4', glow: 'rgba(42,217,196,0.5)' },
    { id: 'lavawave',    nameKey: 'skin_lavawave',    kind: 'crate', type: 'wave', color: '#2a0805', color2: '#ff6a1f', glow: 'rgba(255,106,31,0.55)' },
    { id: 'toxicwave',   nameKey: 'skin_toxicwave',   kind: 'crate', type: 'wave', color: '#0c2408', color2: '#b6ff2e', glow: 'rgba(182,255,46,0.5)' },
    { id: 'arctic',      nameKey: 'skin_arctic',      kind: 'crate', type: 'wave', color: '#16405c', color2: '#ffffff', glow: 'rgba(191,233,255,0.5)' },
    { id: 'mirage',      nameKey: 'skin_mirage',      kind: 'crate', type: 'holo', color: '#cfd8e0', glow: 'rgba(207,216,224,0.6)' },
    { id: 'eclipse',     nameKey: 'skin_eclipse',     kind: 'crate', type: 'holo', color: '#14141c', glow: 'rgba(120,80,255,0.5)' },
    { id: 'opal',        nameKey: 'skin_opal',        kind: 'crate', type: 'holo', color: '#f7e9f0', glow: 'rgba(255,220,240,0.6)' },
    { id: 'midas',       nameKey: 'skin_midas',       kind: 'crate', type: 'metal', color: '#f6c453', glow: 'rgba(246,196,83,0.55)' },
    { id: 'bronze',      nameKey: 'skin_bronze',      kind: 'crate', type: 'metal', color: '#cd7f32', glow: 'rgba(205,127,50,0.55)' },
    { id: 'steel',       nameKey: 'skin_steel',       kind: 'crate', type: 'metal', color: '#5a6472', glow: 'rgba(90,100,114,0.5)' },
    { id: 'rosegold',    nameKey: 'skin_rosegold',    kind: 'crate', type: 'metal', color: '#ffb7c5', glow: 'rgba(255,183,197,0.5)' },
    { id: 'voltage',     nameKey: 'skin_voltage',     kind: 'crate', type: 'spark', color: '#3ec6ff', glow: 'rgba(62,198,255,0.6)' },
    { id: 'plasma',      nameKey: 'skin_plasma',      kind: 'crate', type: 'spark', color: '#b96bff', glow: 'rgba(185,107,255,0.6)' },
    { id: 'thunder',     nameKey: 'skin_thunder',     kind: 'crate', type: 'spark', color: '#ff8a3c', glow: 'rgba(255,138,60,0.6)' }
  ];
  function loadOwnedSkins(){
    try {
      const raw = localStorage.getItem('scraper_skins_v1');
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch(e){}
    return new Set(['default']);
  }
  function saveOwnedSkins(){
    try { localStorage.setItem('scraper_skins_v1', JSON.stringify(Array.from(ownedSkins))); } catch(e){}
  }
  let ownedSkins = loadOwnedSkins();
  syncBossSkinUnlocks();

  function loadEquippedSkin(){
    try {
      const raw = localStorage.getItem('scraper_equippedskin_v1');
      if (raw && SKINS.some(s => s.id === raw)) return raw;
    } catch(e){}
    return 'default';
  }
  function saveEquippedSkin(id){
    try { localStorage.setItem('scraper_equippedskin_v1', id); } catch(e){}
  }
  let equippedSkinId = loadEquippedSkin();

  function getEquippedSkin(){
    return SKINS.find(s => s.id === equippedSkinId) || SKINS[0];
  }

  // Boss skins aren't bought — they unlock automatically once the matching boss
  // level is completed. Called on load and right after a level win.
  function syncBossSkinUnlocks(){
    let changed = false;
    SKINS.forEach(skin => {
      if (skin.kind === 'boss' && progress[skin.bossLevel - 1] && !ownedSkins.has(skin.id)){
        ownedSkins.add(skin.id);
        changed = true;
      }
    });
    if (changed) saveOwnedSkins();
  }

  function buySkin(id){
    const skin = SKINS.find(s => s.id === id);
    if (!skin || skin.kind !== 'coin' || ownedSkins.has(id) || coins < skin.price) return;
    coins -= skin.price;
    saveCoins(coins);
    ownedSkins.add(id);
    saveOwnedSkins();
    updateCoinsHud();
    playPurchase();
    checkAchievements();
    checkMissions();
  }
  function equipSkin(id){
    if (!ownedSkins.has(id)) return;
    equippedSkinId = id;
    saveEquippedSkin(id);
    if (tutorialStep === 1 && id !== 'default') advanceTutorial(1);
  }

  // Shop browsing is split into 4 tabs by skin.kind instead of one flat,
  // 48-skin carousel — each tab's prev/next arrows only walk that kind's
  // subset. shopTab === null is the "just opened, nothing picked yet" state,
  // where the tab row shows but the preview/name/state/buy area stays
  // hidden (see shopTabHintEl) until a tab is clicked.
  const SHOP_TABS = [
    { kind: 'coin',    btnId: 'shopTabCoin',    labelKey: 'shop_tab_coin' },
    { kind: 'crate',   btnId: 'shopTabCrate',   labelKey: 'shop_tab_crate' },
    { kind: 'mission', btnId: 'shopTabMission', labelKey: 'shop_tab_mission' },
    { kind: 'boss',    btnId: 'shopTabBoss',    labelKey: 'shop_tab_boss' }
  ];
  let shopTab = null;
  let shopIndex = 0;
  let shopPreviewRaf = null;
  const skinPreviewCanvas = document.getElementById('skinPreviewCanvas');
  const skinPreviewCtx = skinPreviewCanvas ? skinPreviewCanvas.getContext('2d') : null;
  const shopPrevBtn = document.getElementById('shopPrevBtn');
  const shopNextBtn = document.getElementById('shopNextBtn');
  const shopActionBtn = document.getElementById('shopActionBtn');
  const shopSkinNameEl = document.getElementById('shopSkinName');
  const shopSkinStateEl = document.getElementById('shopSkinState');
  const shopBrowseAreaEl = document.getElementById('shopBrowseArea');
  const shopTabHintEl = document.getElementById('shopTabHint');

  function shopSkinsForTab(){
    return shopTab ? SKINS.filter(s => s.kind === shopTab) : [];
  }
  function selectShopTab(kind){
    shopTab = kind;
    shopIndex = 0;
    renderShop();
  }
  SHOP_TABS.forEach(tabDef => {
    const btn = document.getElementById(tabDef.btnId);
    if (btn) btn.addEventListener('click', () => selectShopTab(tabDef.kind));
  });

  function drawShopPreview(now){
    if (!skinPreviewCtx) return;
    const skin = shopSkinsForTab()[shopIndex];
    if (!skin) return;
    const w = skinPreviewCanvas.width, h = skinPreviewCanvas.height;
    skinPreviewCtx.clearRect(0, 0, w, h);
    if (skin.kind === 'boss' && !ownedSkins.has(skin.id)){
      skinPreviewCtx.save();
      skinPreviewCtx.fillStyle = 'rgba(255,255,255,0.06)';
      skinPreviewCtx.beginPath();
      skinPreviewCtx.arc(w / 2, h / 2, w * 0.32, 0, Math.PI * 2);
      skinPreviewCtx.fill();
      skinPreviewCtx.strokeStyle = '#2c3a5c';
      skinPreviewCtx.lineWidth = 2;
      skinPreviewCtx.stroke();
      skinPreviewCtx.fillStyle = '#7686ab';
      skinPreviewCtx.font = 'bold 42px sans-serif';
      skinPreviewCtx.textAlign = 'center';
      skinPreviewCtx.textBaseline = 'middle';
      skinPreviewCtx.fillText('❔', w / 2, h / 2);
      skinPreviewCtx.restore();
      return;
    }
    skinPreviewCtx.save();
    skinPreviewCtx.shadowColor = skin.glow;
    skinPreviewCtx.shadowBlur = 22 + 8 * Math.sin(now * 0.004);
    drawBallShape(skinPreviewCtx, w / 2, h / 2, w * 0.32, skin, now);
    skinPreviewCtx.restore();
  }
  function shopPreviewLoop(now){
    drawShopPreview(now);
    shopPreviewRaf = requestAnimationFrame(shopPreviewLoop);
  }

  function renderShop(){
    updateCoinsHud();
    SHOP_TABS.forEach(tabDef => {
      const btn = document.getElementById(tabDef.btnId);
      if (btn) btn.classList.toggle('active', shopTab === tabDef.kind);
    });

    const list = shopSkinsForTab();
    const skin = list[shopIndex];
    if (shopBrowseAreaEl) shopBrowseAreaEl.classList.toggle('hidden', !skin);
    if (shopTabHintEl) shopTabHintEl.classList.toggle('hidden', !!skin);
    if (!skin) return;

    const isEquipped = equippedSkinId === skin.id;
    const isOwned = ownedSkins.has(skin.id);
    // Boss skins stay a mystery (name + preview) until actually earned —
    // same "???" placeholder idea as the hidden diamond achievements, but
    // the unlock condition (skin_locked_boss) still shows so the player
    // knows which boss to beat; only the reward's identity is a secret.
    const isHiddenBoss = skin.kind === 'boss' && !isOwned;
    if (shopSkinNameEl) shopSkinNameEl.textContent = isHiddenBoss ? t('achievement_hidden_name') : t(skin.nameKey);

    if (shopSkinStateEl){
      shopSkinStateEl.textContent = isEquipped ? t('skin_equipped')
        : isOwned ? t('skin_owned')
        : skin.kind === 'boss' ? t('skin_locked_boss', { level: skin.bossLevel })
        : skin.kind === 'mission' ? t('skin_locked_mission')
        : skin.kind === 'crate' ? t('skin_locked_crate')
        : '';
    }
    if (shopActionBtn){
      shopActionBtn.onclick = null;
      shopActionBtn.classList.remove('ghost');
      if (isEquipped){
        shopActionBtn.textContent = t('btn_equipped');
        shopActionBtn.disabled = true;
        shopActionBtn.classList.add('ghost');
      } else if (isOwned){
        shopActionBtn.textContent = t('btn_equip');
        shopActionBtn.disabled = false;
        shopActionBtn.onclick = () => { equipSkin(skin.id); renderShop(); };
      } else if (skin.kind === 'boss'){
        shopActionBtn.textContent = t('skin_locked_boss', { level: skin.bossLevel });
        shopActionBtn.disabled = true;
        shopActionBtn.classList.add('ghost');
      } else if (skin.kind === 'crate'){
        shopActionBtn.textContent = t('skin_locked_crate');
        shopActionBtn.disabled = true;
        shopActionBtn.classList.add('ghost');
      } else if (skin.kind === 'mission'){
        shopActionBtn.textContent = t('skin_locked_mission');
        shopActionBtn.disabled = true;
        shopActionBtn.classList.add('ghost');
      } else {
        shopActionBtn.textContent = t('btn_buy_price', { price: skin.price });
        shopActionBtn.disabled = coins < skin.price;
        shopActionBtn.onclick = () => { buySkin(skin.id); renderShop(); };
      }
    }
    if (shopPrevBtn) shopPrevBtn.disabled = shopIndex === 0;
    if (shopNextBtn) shopNextBtn.disabled = shopIndex === list.length - 1;
  }
  if (shopPrevBtn) shopPrevBtn.addEventListener('click', () => { if (shopIndex > 0){ shopIndex--; renderShop(); } });
  if (shopNextBtn) shopNextBtn.addEventListener('click', () => { const list = shopSkinsForTab(); if (shopIndex < list.length - 1){ shopIndex++; renderShop(); } });

  // ---------- CRATES ----------
  // Buying a crate opens it immediately (no owned-but-unopened inventory
  // step) — pay coins/diamonds, then straight into the animation + sound
  // (see AUDIO section's playCrateOpen()) that reveals a coin payout
  // followed by N small "extra item" slots. Each slot is rolled independently
  // by rollCrateItem() below: mostly diamonds, a small chance at one of the
  // coin-priced shop skins (only ones not already owned), and a moderate
  // chance at a booster charge — extraCount already scales with rarity, so
  // pricier crates naturally get more rolls/better odds without needing
  // separate per-rarity probabilities.
  const CRATES = [
    { id: 'common',    nameKey: 'crate_common',    icon: '📦', currency: 'coins',    price: 500,  coinsRange: [100, 180],  extraCount: 2,  itemRange: [1, 3] },
    { id: 'epic',      nameKey: 'crate_epic',      icon: '🎁', currency: 'coins',    price: 2000, coinsRange: [400, 700],  extraCount: 5,  itemRange: [1, 3] },
    { id: 'legendary', nameKey: 'crate_legendary', icon: '👑', currency: 'diamonds', price: 10,   coinsRange: [900, 1500], extraCount: 10, itemRange: [1, 3] }
  ];
  function randRange(min, max){ return Math.floor(min + Math.random() * (max - min + 1)); }
  const CRATE_EXP_RANGE = [50, 200];

  // Odds per independent "extra" slot roll (same across all 3 crate rarities
  // — only extraCount/coinsRange/itemRange scale with rarity): 20% booster
  // charge, 20% ability charge, 25% EXP (50-200), 25% diamonds (itemRange,
  // same 1-3 for every crate), 10% a not-yet-owned crate-exclusive skin (only
  // the 30 'crate'-kind skins — coin-shop skins never drop here). If every
  // crate skin is already owned, that 10% falls back to diamonds instead.
  function rollCrateItem(itemRange){
    const r = Math.random();
    if (r < 0.20){
      return { type: 'booster', boosterId: pickOne(BOOSTER_IDS) };
    }
    if (r < 0.40){
      return { type: 'ability', abilityId: pickOne(ABILITY_IDS) };
    }
    if (r < 0.65){
      return { type: 'exp', amount: randRange(CRATE_EXP_RANGE[0], CRATE_EXP_RANGE[1]) };
    }
    if (r < 0.90){
      return { type: 'diamonds', amount: randRange(itemRange[0], itemRange[1]) };
    }
    const candidates = SKINS.filter(s => s.kind === 'crate' && !ownedSkins.has(s.id));
    if (candidates.length) return { type: 'skin', skinId: pickOne(candidates).id };
    return { type: 'diamonds', amount: randRange(itemRange[0], itemRange[1]) };
  }

  function renderCrateShop(){
    if (!crateShopRowEl) return;
    crateShopRowEl.innerHTML = '';
    CRATES.forEach(crate => {
      const card = document.createElement('div');
      card.className = 'crate-card rarity-' + crate.id;
      const name = document.createElement('div');
      name.className = 'crate-card-name';
      name.textContent = t(crate.nameKey);
      const icon = document.createElement('div');
      icon.className = 'crate-card-icon';
      icon.textContent = crate.icon;
      const price = document.createElement('div');
      price.className = 'crate-card-price';
      price.textContent = crate.currency === 'coins'
        ? t('crate_price_coins', { price: crate.price })
        : t('crate_price_diamonds', { price: crate.price });
      const buyBtn = document.createElement('button');
      buyBtn.className = 'crate-buy-btn';
      buyBtn.textContent = t('btn_buy');
      buyBtn.disabled = crate.currency === 'coins' ? coins < crate.price : diamonds < crate.price;
      buyBtn.addEventListener('click', () => buyAndOpenCrate(crate.id));
      card.appendChild(name); card.appendChild(icon); card.appendChild(price); card.appendChild(buyBtn);
      crateShopRowEl.appendChild(card);
    });
  }

  // Pays the price, rolls the rewards, applies them immediately (so the
  // HUD/localStorage are correct even if the player closes the tab mid-
  // animation), then plays the shake → burst → staggered item reveal in
  // showCrateOpenOverlay() — that part is purely visual, driven by its own
  // setTimeout sequence, decoupled from the data mutation above it.
  function buyAndOpenCrate(id){
    const crate = CRATES.find(c => c.id === id);
    if (!crate) return;
    if (crate.currency === 'coins'){
      if (coins < crate.price) return;
      coins -= crate.price;
      saveCoins(coins);
    } else {
      if (diamonds < crate.price) return;
      diamonds -= crate.price;
      saveDiamonds();
    }
    totalCratesOpened++;
    saveRunCounter('scraper_cratesopened_v1', totalCratesOpened);
    updateCoinsHud();
    ensureAudio();

    const coinsWon = randRange(crate.coinsRange[0], crate.coinsRange[1]);
    const items = [];
    for (let i = 0; i < crate.extraCount; i++){
      items.push(rollCrateItem(crate.itemRange));
    }
    let totalDiamonds = 0, totalExp = 0;
    let gotSkin = false, gotBooster = false, gotAbility = false;
    items.forEach(it => {
      if (it.type === 'diamonds'){
        totalDiamonds += it.amount;
      } else if (it.type === 'exp'){
        totalExp += it.amount;
      } else if (it.type === 'skin'){
        ownedSkins.add(it.skinId);
        gotSkin = true;
      } else if (it.type === 'booster'){
        boosterInventory[it.boosterId] = (boosterInventory[it.boosterId] || 0) + 1;
        gotBooster = true;
      } else if (it.type === 'ability'){
        abilityInventory[it.abilityId] = (abilityInventory[it.abilityId] || 0) + 1;
        gotAbility = true;
      }
    });
    addCoins(coinsWon);
    if (totalDiamonds > 0) addDiamonds(totalDiamonds);
    if (totalExp > 0) addExp(totalExp);
    if (gotSkin){ saveOwnedSkins(); checkAchievements(); checkMissions(); }
    if (gotBooster) saveBoosterInventory();
    if (gotAbility){ saveAbilityInventory(); updateAbilityHud(); }
    playCrateOpen(id);
    showCrateOpenOverlay(crate, coinsWon, items);
  }

  function showCrateOpenOverlay(crate, coinsWon, items){
    if (!crateOpenOverlayEl) return;
    crateOpenIconEl.textContent = crate.icon;
    crateOpenIconEl.className = 'crate-open-icon rarity-' + crate.id + ' shaking';
    crateOpenTitleEl.textContent = t('crate_opening_title', { crate: t(crate.nameKey) });
    crateOpenCoinsEl.textContent = '';
    crateOpenItemsEl.innerHTML = '';
    crateOpenBtnsEl.innerHTML = '';
    crateOpenOverlayEl.classList.add('show');

    setTimeout(() => {
      crateOpenIconEl.className = 'crate-open-icon rarity-' + crate.id + ' burst';
      crateOpenCoinsEl.textContent = t('mission_reward_coins', { n: coinsWon });
      items.forEach((it, i) => {
        setTimeout(() => {
          const el = document.createElement('div');
          el.className = 'crate-item-pop';
          if (it.type === 'skin'){
            el.textContent = '🎨 ' + t(SKINS.find(s => s.id === it.skinId).nameKey);
          } else if (it.type === 'booster'){
            el.textContent = BOOSTERS[it.boosterId].icon + ' ' + t(BOOSTERS[it.boosterId].nameKey);
          } else if (it.type === 'ability'){
            el.textContent = ABILITIES[it.abilityId].icon + ' ' + t(ABILITIES[it.abilityId].nameKey);
          } else if (it.type === 'exp'){
            el.textContent = t('mission_reward_exp', { n: it.amount });
          } else {
            el.textContent = t('mission_reward_diamonds', { n: it.amount });
          }
          crateOpenItemsEl.appendChild(el);
          if (i === items.length - 1){
            setTimeout(() => {
              const btn = document.createElement('button');
              btn.className = 'btn';
              btn.textContent = t('btn_crate_continue');
              btn.addEventListener('click', () => {
                crateOpenOverlayEl.classList.remove('show');
                renderCrateShop();
              });
              crateOpenBtnsEl.appendChild(btn);
            }, 300);
          }
        }, i * 170);
      });
    }, 650);
  }

  // ---------- ACHIEVEMENTS ----------
  // Lifetime coin counter, separate from the spendable `coins` balance — only
  // ever goes up, so "earn N coins total" achievements stay meaningful even
  // after the player has spent coins in the shop.
  function loadTotalCoinsEarned(){
    try {
      const raw = localStorage.getItem('scraper_totalcoins_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, v); }
    } catch(e){}
    return 0;
  }
  function saveTotalCoinsEarned(v){
    try { localStorage.setItem('scraper_totalcoins_v1', String(v)); } catch(e){}
  }
  let totalCoinsEarned = loadTotalCoinsEarned();

  // tier drives the trophy-case badge color in renderAchievements() — bronze
  // for the easy ones, silver for medium, gold for the hard/late-game ones
  // (matches the difficulty grouping this list was designed around).
  const ACHIEVEMENTS = [
    { id: 'first_level', icon: '🎯', nameKey: 'ach_first_level_name', descKey: 'ach_first_level_desc', tier: 'bronze' },
    { id: 'coop_finish',  icon: '🤝', nameKey: 'ach_coop_finish_name',  descKey: 'ach_coop_finish_desc', tier: 'bronze' },
    { id: 'coins_200',    icon: '🪙', nameKey: 'ach_coins_200_name',    descKey: 'ach_coins_200_desc', tier: 'bronze' },
    { id: 'versus_dist',  icon: '⚔️', nameKey: 'ach_versus_dist_name',  descKey: 'ach_versus_dist_desc', tier: 'silver' },
    { id: 'marathon',     icon: '🏃', nameKey: 'ach_marathon_name',     descKey: 'ach_marathon_desc', tier: 'silver' },
    { id: 'skins_5',      icon: '🎨', nameKey: 'ach_skins_5_name',      descKey: 'ach_skins_5_desc', tier: 'silver' },
    { id: 'all_bosses',   icon: '👑', nameKey: 'ach_all_bosses_name',   descKey: 'ach_all_bosses_desc', tier: 'gold' },
    { id: 'coins_3000',   icon: '💰', nameKey: 'ach_coins_3000_name',   descKey: 'ach_coins_3000_desc', tier: 'gold' },
    // Promoted from gold to the new 'diamond' tier + hidden:true (2026-07-12,
    // part 4) — these two were already the two hardest achievements in the
    // game (100% skins / 100% levels), so they became the first two of the
    // three planned secret diamond achievements. hidden:true means
    // renderAchievements() shows a generic "???" placeholder (name/icon/desc)
    // instead of the real ones until unlockedAchievements has the id — the
    // underlying condition/tracking is completely unchanged, only tier+hidden
    // were added. A third diamond/hidden achievement is planned but not part
    // of this batch (user asked for 19 now, the 20th comes later).
    { id: 'skins_all',    icon: '🌈', nameKey: 'ach_skins_all_name',    descKey: 'ach_skins_all_desc', tier: 'diamond', hidden: true },
    { id: 'all_levels',   icon: '🏆', nameKey: 'ach_all_levels_name',   descKey: 'ach_all_levels_desc', tier: 'diamond', hidden: true },
    // Third and final planned diamond/hidden achievement (2026-07-13) — tied
    // to the player Level/EXP meta-progression from pkt 41/42, not the game's
    // 100 Levels stage-select (that's the existing 'all_levels' above). 100
    // player levels is a huge EXP sink (crates are still the only EXP
    // source), fitting alongside "100% skins"/"100% stages" as the hardest
    // tier in the game.
    { id: 'player_level_100', icon: '🌟', nameKey: 'ach_player_level_100_name', descKey: 'ach_player_level_100_desc', tier: 'diamond', hidden: true },

    // 19 new achievements (2026-07-12, part 4) — bronze: easy "first time"
    // milestones for mechanics that didn't have one yet (crates, diamonds,
    // missions, abilities, Daily Challenge, Versus); silver: round-number
    // totals past the originals; gold: harder totals, the new bar below the
    // diamond tier above.
    { id: 'versus_finish',   icon: '🥊', nameKey: 'ach_versus_finish_name',   descKey: 'ach_versus_finish_desc',   tier: 'bronze' },
    { id: 'first_boss',      icon: '💥', nameKey: 'ach_first_boss_name',      descKey: 'ach_first_boss_desc',      tier: 'bronze' },
    { id: 'first_crate',     icon: '📦', nameKey: 'ach_first_crate_name',     descKey: 'ach_first_crate_desc',     tier: 'bronze' },
    { id: 'first_diamond',   icon: '💎', nameKey: 'ach_first_diamond_name',   descKey: 'ach_first_diamond_desc',   tier: 'bronze' },
    { id: 'first_mission',   icon: '📜', nameKey: 'ach_first_mission_name',   descKey: 'ach_first_mission_desc',   tier: 'bronze' },
    { id: 'first_ability',   icon: '✨', nameKey: 'ach_first_ability_name',   descKey: 'ach_first_ability_desc',   tier: 'bronze' },
    { id: 'first_challenge', icon: '🗓️', nameKey: 'ach_first_challenge_name', descKey: 'ach_first_challenge_desc', tier: 'bronze' },
    { id: 'levels_50',       icon: '🧗', nameKey: 'ach_levels_50_name',       descKey: 'ach_levels_50_desc',       tier: 'silver' },
    { id: 'crates_10',       icon: '🎁', nameKey: 'ach_crates_10_name',       descKey: 'ach_crates_10_desc',       tier: 'silver' },
    { id: 'diamonds_50',     icon: '🔷', nameKey: 'ach_diamonds_50_name',     descKey: 'ach_diamonds_50_desc',     tier: 'silver' },
    { id: 'missions_10',     icon: '📋', nameKey: 'ach_missions_10_name',     descKey: 'ach_missions_10_desc',     tier: 'silver' },
    { id: 'abilities_25',    icon: '⚡', nameKey: 'ach_abilities_25_name',    descKey: 'ach_abilities_25_desc',    tier: 'silver' },
    { id: 'challenges_10',   icon: '📅', nameKey: 'ach_challenges_10_name',   descKey: 'ach_challenges_10_desc',   tier: 'silver' },
    { id: 'pickups_10',      icon: '🧲', nameKey: 'ach_pickups_10_name',      descKey: 'ach_pickups_10_desc',      tier: 'silver' },
    { id: 'coins_10000',     icon: '🦈', nameKey: 'ach_coins_10000_name',     descKey: 'ach_coins_10000_desc',     tier: 'gold' },
    { id: 'diamonds_500',    icon: '💠', nameKey: 'ach_diamonds_500_name',    descKey: 'ach_diamonds_500_desc',    tier: 'gold' },
    { id: 'crates_50',       icon: '🗃️', nameKey: 'ach_crates_50_name',       descKey: 'ach_crates_50_desc',       tier: 'gold' },
    { id: 'missions_30',     icon: '🎖️', nameKey: 'ach_missions_30_name',     descKey: 'ach_missions_30_desc',     tier: 'gold' },
    { id: 'boosterruns_50',  icon: '🧪', nameKey: 'ach_boosterruns_50_name',  descKey: 'ach_boosterruns_50_desc',  tier: 'gold' }
  ];

  function loadAchievements(){
    try {
      const raw = localStorage.getItem('scraper_achievements_v1');
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch(e){}
    return new Set();
  }
  function saveAchievements(){
    try { localStorage.setItem('scraper_achievements_v1', JSON.stringify(Array.from(unlockedAchievements))); } catch(e){}
  }
  let unlockedAchievements = loadAchievements();

  // Shared by achievement/mission/daily-mission unlocks — only the icon and
  // the two text lines differ per caller, see wrappers right below.
  function showRewardToast(icon, line1Text, line2Text){
    const toast = document.createElement('div');
    toast.className = 'achv-toast';
    const iconEl = document.createElement('span');
    iconEl.className = 'achv-toast-icon';
    iconEl.textContent = icon;
    const text = document.createElement('span');
    text.className = 'achv-toast-text';
    const line1 = document.createElement('div');
    line1.textContent = line1Text;
    const line2 = document.createElement('b');
    line2.textContent = line2Text;
    text.appendChild(line1); text.appendChild(line2);
    toast.appendChild(iconEl); toast.appendChild(text);
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
  function showAchievementToast(a){
    showRewardToast(a.icon, t('achievement_unlocked_toast'), t(a.nameKey));
  }

  // Re-evaluated after any state change that could satisfy a condition (coins
  // earned, level/boss completed, skin bought/unlocked, multiplayer run
  // finished) — cheap to call redundantly since already-unlocked ids are
  // skipped, so callers don't need to know which achievement(s) they affect.
  function checkAchievements(){
    const checks = {
      first_level: () => progress[0],
      all_bosses: () => [9,19,29,39,49,59,69,79,89,99].every(i => progress[i]),
      all_levels: () => progress.every(p => p),
      player_level_100: () => level >= 100,
      coins_200: () => totalCoinsEarned >= 200,
      coins_3000: () => totalCoinsEarned >= 3000,
      skins_5: () => ownedSkins.size >= 5,
      skins_all: () => ownedSkins.size >= SKINS.length,
      marathon: () => mode === 'freeplay' && distance >= 3000,
      coop_finish: () => mode === 'coop',
      versus_dist: () => mode === 'versus' && distance >= 2000,

      versus_finish:   () => mode === 'versus',
      first_boss:      () => progress[9],
      first_crate:     () => totalCratesOpened >= 1,
      first_diamond:   () => totalDiamondsEarned >= 1,
      first_mission:   () => completedMissions.size >= 1,
      first_ability:   () => totalAbilityUses >= 1 || totalPickupsCollected >= 1,
      first_challenge: () => totalChallengesDone >= 1,
      levels_50:       () => progress.filter(Boolean).length >= 50,
      crates_10:       () => totalCratesOpened >= 10,
      diamonds_50:     () => totalDiamondsEarned >= 50,
      missions_10:     () => completedMissions.size >= 10,
      abilities_25:    () => totalAbilityUses >= 25,
      challenges_10:   () => totalChallengesDone >= 10,
      pickups_10:      () => totalPickupsCollected >= 10,
      coins_10000:     () => totalCoinsEarned >= 10000,
      diamonds_500:    () => totalDiamondsEarned >= 500,
      crates_50:       () => totalCratesOpened >= 50,
      missions_30:     () => completedMissions.size >= 30,
      boosterruns_50:  () => totalBoosterRuns >= 50
    };
    let changed = false;
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements.has(a.id) && checks[a.id] && checks[a.id]()){
        unlockedAchievements.add(a.id);
        changed = true;
        showAchievementToast(a);
      }
    });
    if (changed) saveAchievements();
  }

  const achvListEl = document.getElementById('achvList');

  // Display-order group for the trophy grid — same "sort a copy, don't touch
  // the source array" approach as MISSION_REWARD_ORDER/renderMissions().
  // Bronze/silver/gold in ascending rarity, diamond (the hidden, secret tier)
  // always last regardless of how many diamond entries exist.
  const ACHIEVEMENT_TIER_ORDER = { bronze: 0, silver: 1, gold: 2, diamond: 3 };

  // Trophy-case grid: unlocked badges get a tiered bronze/silver/gold glow
  // (see ACHIEVEMENTS.tier) instead of the flat gold used by every unlocked
  // row previously — makes this list read as "rare milestones", visually
  // distinct from the quest-log style of renderMissions() below.
  function renderAchievements(){
    if (!achvListEl) return;
    achvListEl.innerHTML = '';
    const sortedAchievements = ACHIEVEMENTS.slice().sort((a, b) => ACHIEVEMENT_TIER_ORDER[a.tier] - ACHIEVEMENT_TIER_ORDER[b.tier]);
    sortedAchievements.forEach(a => {
      const unlocked = unlockedAchievements.has(a.id);
      // Secret achievements (tier 'diamond' + hidden:true) show a generic
      // "???" placeholder instead of the real icon/name/desc until unlocked —
      // same underlying condition/tracking as any other achievement, only the
      // display is withheld. Once unlocked they render exactly like the rest.
      const isSecret = a.hidden && !unlocked;
      const item = document.createElement('div');
      item.className = 'trophy-item tier-' + a.tier + (unlocked ? ' unlocked' : '') + (isSecret ? ' secret' : '');
      const badge = document.createElement('div');
      badge.className = 'trophy-badge';
      const icon = document.createElement('div');
      icon.className = 'trophy-icon';
      icon.textContent = isSecret ? '❔' : a.icon;
      const name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = isSecret ? t('achievement_hidden_name') : t(a.nameKey);
      const desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = isSecret ? t('achievement_hidden_desc') : t(a.descKey);
      item.appendChild(badge); item.appendChild(icon); item.appendChild(name); item.appendChild(desc);
      achvListEl.appendChild(item);
    });
  }

  // ---------- PROFILE ----------
  // Lightweight player identity, not a multi-account system: a chosen
  // avatar icon (Brawl-Stars-style) plus a read-only rollup of lifetime
  // counters that were already tracked for achievements/missions but never
  // surfaced to the player directly.
  const PROFILE_ICONS = ['🧑‍🚀','👽','🤖','🛸','🚀','🪐','⭐','☄️','🌌','👾'];
  function loadProfileIcon(){
    try {
      const raw = localStorage.getItem('scraper_profileicon_v1');
      if (raw && PROFILE_ICONS.indexOf(raw) !== -1) return raw;
    } catch(e){}
    return PROFILE_ICONS[0];
  }
  function saveProfileIcon(v){
    try { localStorage.setItem('scraper_profileicon_v1', v); } catch(e){}
  }
  let profileIcon = loadProfileIcon();
  function updateProfileIconButton(){
    if (btnProfileEl) btnProfileEl.textContent = profileIcon;
  }
  function renderProfileIcons(){
    if (!profileIconGridEl) return;
    profileIconGridEl.innerHTML = '';
    PROFILE_ICONS.forEach(ic => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'profile-icon-btn' + (ic === profileIcon ? ' active' : '');
      b.textContent = ic;
      b.addEventListener('click', () => {
        profileIcon = ic;
        saveProfileIcon(ic);
        updateProfileIconButton();
        if (profileAvatarBigEl) profileAvatarBigEl.textContent = ic;
        renderProfileIcons();
      });
      profileIconGridEl.appendChild(b);
    });
  }
  function renderProfileStats(){
    if (!profileStatsListEl) return;
    profileStatsListEl.innerHTML = '';
    const stats = [
      { icon:'🎯', key:'profile_stat_record', value: bestFree + ' m' },
      { icon:'📏', key:'profile_stat_distance', value: totalDistanceEver + ' m' },
      { icon:'🪙', key:'profile_stat_coins', value: String(totalCoinsEarned) },
      { icon:'💎', key:'profile_stat_diamonds', value: String(totalDiamondsEarned) },
      { icon:'📦', key:'profile_stat_crates', value: String(totalCratesOpened) },
      { icon:'🏆', key:'profile_stat_achievements', value: unlockedAchievements.size + ' / ' + ACHIEVEMENTS.length },
      { icon:'📜', key:'profile_stat_missions', value: completedMissions.size + ' / ' + MISSIONS.length },
      { icon:'🤝', key:'profile_stat_coop', value: String(totalCoopRuns) },
      { icon:'⚔️', key:'profile_stat_versus', value: String(totalVersusRuns) },
      { icon:'✨', key:'profile_stat_abilities', value: String(totalAbilityUses) },
      { icon:'🔥', key:'profile_stat_challenges', value: String(totalChallengesDone) }
    ];
    stats.forEach(s => {
      const row = document.createElement('div');
      row.className = 'quest-row';
      const icon = document.createElement('div');
      icon.className = 'quest-icon';
      icon.textContent = s.icon;
      const body = document.createElement('div');
      body.className = 'quest-body';
      const topLine = document.createElement('div');
      topLine.className = 'quest-top-line';
      const name = document.createElement('div');
      name.className = 'quest-name';
      name.textContent = t(s.key);
      const val = document.createElement('div');
      val.className = 'quest-reward';
      val.textContent = s.value;
      topLine.appendChild(name); topLine.appendChild(val);
      body.appendChild(topLine);
      row.appendChild(icon); row.appendChild(body);
      profileStatsListEl.appendChild(row);
    });
  }
  function renderProfile(){
    if (profileAvatarBigEl) profileAvatarBigEl.textContent = profileIcon;
    if (profileNameLineEl) profileNameLineEl.textContent = playerName;
    if (profileLevelLineEl) profileLevelLineEl.textContent = t('mainMenu_level', { n: level });
    renderProfileIcons();
    renderProfileStats();
  }

  // ---------- MISSIONS (fixed, one-time) ----------
  // Lifetime counters not tracked elsewhere, needed by the mission conditions
  // below. Same load/save/try-catch pattern as totalCoinsEarned above.
  function loadTotalDistanceEver(){
    try {
      const raw = localStorage.getItem('scraper_totaldistance_v1');
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, v); }
    } catch(e){}
    return 0;
  }
  function saveTotalDistanceEver(v){
    try { localStorage.setItem('scraper_totaldistance_v1', String(v)); } catch(e){}
  }
  let totalDistanceEver = loadTotalDistanceEver();

  function loadRunCounter(key){
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null){ const v = parseInt(raw,10); if (!isNaN(v)) return Math.max(0, v); }
    } catch(e){}
    return 0;
  }
  function saveRunCounter(key, v){
    try { localStorage.setItem(key, String(v)); } catch(e){}
  }
  let totalCoopRuns = loadRunCounter('scraper_coopruns_v1');
  let totalVersusRuns = loadRunCounter('scraper_versusruns_v1');
  // Lifetime counters added for the 40-mission expansion (see MISSIONS below):
  // diamonds ever earned, crates ever opened, ability activations (keys 1/2/3),
  // free map pickups collected, runs started with a booster active, and daily
  // Challenges fully claimed. Same load/save-on-every-change contract as the
  // two counters above, reusing loadRunCounter/saveRunCounter as-is.
  let totalDiamondsEarned = loadRunCounter('scraper_totaldiamonds_v1');
  let totalCratesOpened = loadRunCounter('scraper_cratesopened_v1');
  let totalAbilityUses = loadRunCounter('scraper_abilityuses_v1');
  let totalPickupsCollected = loadRunCounter('scraper_pickupscollected_v1');
  let totalBoosterRuns = loadRunCounter('scraper_boosterruns_v1');
  let totalChallengesDone = loadRunCounter('scraper_challengesdone_v1');

  // 5 pay-in-coins + 5 unlock-a-skin missions. Skin rewards point at the
  // matching entry in SKINS (kind:'mission') by id.
  const MISSIONS = [
    { id: 'm_levels_5',      icon: '🎯', nameKey: 'm_levels_5_name',      descKey: 'm_levels_5_desc',      reward: { type: 'coins', amount: 150 } },
    { id: 'm_levels_15',     icon: '🎯', nameKey: 'm_levels_15_name',     descKey: 'm_levels_15_desc',     reward: { type: 'coins', amount: 400 } },
    { id: 'm_distance_10k',  icon: '🛣️', nameKey: 'm_distance_10k_name',  descKey: 'm_distance_10k_desc',  reward: { type: 'coins', amount: 300 } },
    { id: 'm_coop_5',        icon: '🤝', nameKey: 'm_coop_5_name',        descKey: 'm_coop_5_desc',        reward: { type: 'coins', amount: 250 } },
    { id: 'm_versus_5',      icon: '⚔️', nameKey: 'm_versus_5_name',      descKey: 'm_versus_5_desc',      reward: { type: 'coins', amount: 250 } },
    { id: 'm_level_25',      icon: '🧊', nameKey: 'm_level_25_name',      descKey: 'm_level_25_desc',      reward: { type: 'skin', skinId: 'titanium' } },
    { id: 'm_freeplay_6000', icon: '🌌', nameKey: 'm_freeplay_6000_name', descKey: 'm_freeplay_6000_desc', reward: { type: 'skin', skinId: 'aurora' } },
    { id: 'm_shop_all',      icon: '💫', nameKey: 'm_shop_all_name',      descKey: 'm_shop_all_desc',      reward: { type: 'skin', skinId: 'void' } },
    { id: 'm_all_levels',    icon: '🌟', nameKey: 'm_all_levels_name',    descKey: 'm_all_levels_desc',    reward: { type: 'skin', skinId: 'solaris' } },
    { id: 'm_coins_5000',    icon: '❄️', nameKey: 'm_coins_5000_name',    descKey: 'm_coins_5000_desc',    reward: { type: 'skin', skinId: 'frost' } },

    // 40-mission expansion (2026-07-12) — 5 more skin, 15 coin, 10 diamond and
    // 10 booster/ability missions, all tied to mechanics added after the
    // original 10 above (crates, abilities, boosters, diamonds, Daily
    // Challenge). See DOCUMENTATION.md for the reward-type breakdown.
    { id: 'm_crates_20',      icon: '📦', nameKey: 'm_crates_20_name',      descKey: 'm_crates_20_desc',      reward: { type: 'skin', skinId: 'obsidian' } },
    { id: 'm_abilities_50',   icon: '⚡', nameKey: 'm_abilities_50_name',   descKey: 'm_abilities_50_desc',   reward: { type: 'skin', skinId: 'phoenix' } },
    { id: 'm_diamonds_1000',  icon: '💎', nameKey: 'm_diamonds_1000_name',  descKey: 'm_diamonds_1000_desc',  reward: { type: 'skin', skinId: 'celestia' } },
    { id: 'm_challenges_15',  icon: '🗓️', nameKey: 'm_challenges_15_name',  descKey: 'm_challenges_15_desc',  reward: { type: 'skin', skinId: 'infinity' } },
    { id: 'm_crateskins_15',  icon: '🎰', nameKey: 'm_crateskins_15_name',  descKey: 'm_crateskins_15_desc',  reward: { type: 'skin', skinId: 'genesis' } },

    { id: 'm_levels_30',      icon: '🎯', nameKey: 'm_levels_30_name',      descKey: 'm_levels_30_desc',      reward: { type: 'coins', amount: 500 } },
    { id: 'm_levels_50',      icon: '🎯', nameKey: 'm_levels_50_name',      descKey: 'm_levels_50_desc',      reward: { type: 'coins', amount: 700 } },
    { id: 'm_levels_75',      icon: '🎯', nameKey: 'm_levels_75_name',      descKey: 'm_levels_75_desc',      reward: { type: 'coins', amount: 900 } },
    { id: 'm_distance_25k',   icon: '🛣️', nameKey: 'm_distance_25k_name',   descKey: 'm_distance_25k_desc',   reward: { type: 'coins', amount: 450 } },
    { id: 'm_distance_50k',   icon: '🛣️', nameKey: 'm_distance_50k_name',   descKey: 'm_distance_50k_desc',   reward: { type: 'coins', amount: 650 } },
    { id: 'm_freeplay_12000', icon: '🌌', nameKey: 'm_freeplay_12000_name', descKey: 'm_freeplay_12000_desc', reward: { type: 'coins', amount: 550 } },
    { id: 'm_coop_15',        icon: '🤝', nameKey: 'm_coop_15_name',        descKey: 'm_coop_15_desc',        reward: { type: 'coins', amount: 350 } },
    { id: 'm_versus_15',      icon: '⚔️', nameKey: 'm_versus_15_name',      descKey: 'm_versus_15_desc',      reward: { type: 'coins', amount: 350 } },
    { id: 'm_coop_30',        icon: '🤝', nameKey: 'm_coop_30_name',        descKey: 'm_coop_30_desc',        reward: { type: 'coins', amount: 600 } },
    { id: 'm_pickups_25',     icon: '📥', nameKey: 'm_pickups_25_name',     descKey: 'm_pickups_25_desc',     reward: { type: 'coins', amount: 300 } },
    { id: 'm_boosterruns_10', icon: '🧪', nameKey: 'm_boosterruns_10_name', descKey: 'm_boosterruns_10_desc', reward: { type: 'coins', amount: 300 } },
    { id: 'm_crates_5',       icon: '📦', nameKey: 'm_crates_5_name',       descKey: 'm_crates_5_desc',       reward: { type: 'coins', amount: 200 } },
    { id: 'm_achievements_5', icon: '🏅', nameKey: 'm_achievements_5_name', descKey: 'm_achievements_5_desc', reward: { type: 'coins', amount: 400 } },
    { id: 'm_achievements_10',icon: '🏅', nameKey: 'm_achievements_10_name',descKey: 'm_achievements_10_desc',reward: { type: 'coins', amount: 800 } },
    { id: 'm_diamonds_100',   icon: '💎', nameKey: 'm_diamonds_100_name',   descKey: 'm_diamonds_100_desc',   reward: { type: 'coins', amount: 250 } },

    { id: 'm_levels_40',      icon: '🎯', nameKey: 'm_levels_40_name',      descKey: 'm_levels_40_desc',      reward: { type: 'diamonds', amount: 8 } },
    { id: 'm_levels_60',      icon: '🎯', nameKey: 'm_levels_60_name',      descKey: 'm_levels_60_desc',      reward: { type: 'diamonds', amount: 10 } },
    { id: 'm_levels_90',      icon: '🎯', nameKey: 'm_levels_90_name',      descKey: 'm_levels_90_desc',      reward: { type: 'diamonds', amount: 15 } },
    { id: 'm_distance_75k',   icon: '🛣️', nameKey: 'm_distance_75k_name',   descKey: 'm_distance_75k_desc',   reward: { type: 'diamonds', amount: 10 } },
    { id: 'm_versus_25',      icon: '⚔️', nameKey: 'm_versus_25_name',      descKey: 'm_versus_25_desc',      reward: { type: 'diamonds', amount: 8 } },
    { id: 'm_coop_25',        icon: '🤝', nameKey: 'm_coop_25_name',        descKey: 'm_coop_25_desc',        reward: { type: 'diamonds', amount: 8 } },
    { id: 'm_crates_10',      icon: '📦', nameKey: 'm_crates_10_name',      descKey: 'm_crates_10_desc',      reward: { type: 'diamonds', amount: 6 } },
    { id: 'm_abilities_100',  icon: '⚡', nameKey: 'm_abilities_100_name',  descKey: 'm_abilities_100_desc',  reward: { type: 'diamonds', amount: 10 } },
    { id: 'm_challenges_5',   icon: '🗓️', nameKey: 'm_challenges_5_name',   descKey: 'm_challenges_5_desc',   reward: { type: 'diamonds', amount: 6 } },
    { id: 'm_coins_15000',    icon: '🪙', nameKey: 'm_coins_15000_name',    descKey: 'm_coins_15000_desc',    reward: { type: 'diamonds', amount: 12 } },

    { id: 'm_levels_20',      icon: '🎯', nameKey: 'm_levels_20_name',      descKey: 'm_levels_20_desc',      reward: { type: 'ability', abilityId: 'shield', amount: 3 } },
    { id: 'm_levels_70',      icon: '🎯', nameKey: 'm_levels_70_name',      descKey: 'm_levels_70_desc',      reward: { type: 'ability', abilityId: 'invis', amount: 3 } },
    { id: 'm_levels_95',      icon: '🎯', nameKey: 'm_levels_95_name',      descKey: 'm_levels_95_desc',      reward: { type: 'ability', abilityId: 'pulse', amount: 3 } },
    { id: 'm_distance_100k',  icon: '🛣️', nameKey: 'm_distance_100k_name',  descKey: 'm_distance_100k_desc',  reward: { type: 'booster', boosterId: 'heart', amount: 3 } },
    { id: 'm_distance_150k',  icon: '🛣️', nameKey: 'm_distance_150k_name',  descKey: 'm_distance_150k_desc',  reward: { type: 'booster', boosterId: 'coins2x', amount: 3 } },
    { id: 'm_coop_50',        icon: '🤝', nameKey: 'm_coop_50_name',        descKey: 'm_coop_50_desc',        reward: { type: 'booster', boosterId: 'heart', amount: 3 } },
    { id: 'm_versus_50',      icon: '⚔️', nameKey: 'm_versus_50_name',      descKey: 'm_versus_50_desc',      reward: { type: 'booster', boosterId: 'slowmo', amount: 3 } },
    { id: 'm_pickups_50',     icon: '📥', nameKey: 'm_pickups_50_name',     descKey: 'm_pickups_50_desc',     reward: { type: 'ability', abilityId: 'shield', amount: 3 } },
    { id: 'm_boosterruns_25', icon: '🧪', nameKey: 'm_boosterruns_25_name', descKey: 'm_boosterruns_25_desc', reward: { type: 'booster', boosterId: 'small', amount: 3 } },
    { id: 'm_crates_35',      icon: '📦', nameKey: 'm_crates_35_name',      descKey: 'm_crates_35_desc',      reward: { type: 'ability', abilityId: 'pulse', amount: 3 } }
  ];

  function loadCompletedMissions(){
    try {
      const raw = localStorage.getItem('scraper_missions_v1');
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch(e){}
    return new Set();
  }
  function saveCompletedMissions(){
    try { localStorage.setItem('scraper_missions_v1', JSON.stringify(Array.from(completedMissions))); } catch(e){}
  }
  let completedMissions = loadCompletedMissions();

  function showMissionToast(m){
    showRewardToast(m.icon, t('mission_unlocked_toast'), t(m.nameKey));
  }

  // Re-evaluated after any state change that could satisfy a condition — same
  // "cheap to call redundantly" contract as checkAchievements(), including the
  // recursive call from addCoins() (safe: the id is added to the set before
  // the reward is granted, so a coin reward can't re-trigger itself).
  function checkMissions(){
    const checks = {
      m_levels_5:      () => progress.filter(Boolean).length >= 5,
      m_levels_15:     () => progress.filter(Boolean).length >= 15,
      m_distance_10k:  () => totalDistanceEver >= 10000,
      m_coop_5:        () => totalCoopRuns >= 5,
      m_versus_5:      () => totalVersusRuns >= 5,
      m_level_25:      () => progress[24],
      m_freeplay_6000: () => bestFree >= 6000,
      m_shop_all:      () => ownedSkins.size >= SKINS.length,
      m_all_levels:    () => progress.every(p => p),
      m_coins_5000:    () => totalCoinsEarned >= 5000,

      m_crates_20:      () => totalCratesOpened >= 20,
      m_abilities_50:   () => totalAbilityUses >= 50,
      m_diamonds_1000:  () => totalDiamondsEarned >= 1000,
      m_challenges_15:  () => totalChallengesDone >= 15,
      m_crateskins_15:  () => SKINS.filter(s => s.kind === 'crate' && ownedSkins.has(s.id)).length >= 15,

      m_levels_30:      () => progress.filter(Boolean).length >= 30,
      m_levels_50:      () => progress.filter(Boolean).length >= 50,
      m_levels_75:      () => progress.filter(Boolean).length >= 75,
      m_distance_25k:   () => totalDistanceEver >= 25000,
      m_distance_50k:   () => totalDistanceEver >= 50000,
      m_freeplay_12000: () => bestFree >= 12000,
      m_coop_15:        () => totalCoopRuns >= 15,
      m_versus_15:      () => totalVersusRuns >= 15,
      m_coop_30:        () => totalCoopRuns >= 30,
      m_pickups_25:     () => totalPickupsCollected >= 25,
      m_boosterruns_10: () => totalBoosterRuns >= 10,
      m_crates_5:       () => totalCratesOpened >= 5,
      m_achievements_5: () => unlockedAchievements.size >= 5,
      m_achievements_10:() => unlockedAchievements.size >= ACHIEVEMENTS.length,
      m_diamonds_100:   () => totalDiamondsEarned >= 100,

      m_levels_40:      () => progress.filter(Boolean).length >= 40,
      m_levels_60:      () => progress.filter(Boolean).length >= 60,
      m_levels_90:      () => progress.filter(Boolean).length >= 90,
      m_distance_75k:   () => totalDistanceEver >= 75000,
      m_versus_25:      () => totalVersusRuns >= 25,
      m_coop_25:        () => totalCoopRuns >= 25,
      m_crates_10:      () => totalCratesOpened >= 10,
      m_abilities_100:  () => totalAbilityUses >= 100,
      m_challenges_5:   () => totalChallengesDone >= 5,
      m_coins_15000:    () => totalCoinsEarned >= 15000,

      m_levels_20:      () => progress.filter(Boolean).length >= 20,
      m_levels_70:      () => progress.filter(Boolean).length >= 70,
      m_levels_95:      () => progress.filter(Boolean).length >= 95,
      m_distance_100k:  () => totalDistanceEver >= 100000,
      m_distance_150k:  () => totalDistanceEver >= 150000,
      m_coop_50:        () => totalCoopRuns >= 50,
      m_versus_50:      () => totalVersusRuns >= 50,
      m_pickups_50:     () => totalPickupsCollected >= 50,
      m_boosterruns_25: () => totalBoosterRuns >= 25,
      m_crates_35:      () => totalCratesOpened >= 35
    };
    let changed = false;
    MISSIONS.forEach(m => {
      if (!completedMissions.has(m.id) && checks[m.id] && checks[m.id]()){
        completedMissions.add(m.id);
        changed = true;
        if (m.reward.type === 'coins'){
          addCoins(m.reward.amount);
        } else if (m.reward.type === 'diamonds'){
          addDiamonds(m.reward.amount);
        } else if (m.reward.type === 'skin'){
          ownedSkins.add(m.reward.skinId);
          saveOwnedSkins();
        } else if (m.reward.type === 'booster'){
          boosterInventory[m.reward.boosterId] = (boosterInventory[m.reward.boosterId] || 0) + m.reward.amount;
          saveBoosterInventory();
        } else if (m.reward.type === 'ability'){
          abilityInventory[m.reward.abilityId] = (abilityInventory[m.reward.abilityId] || 0) + m.reward.amount;
          saveAbilityInventory();
          updateAbilityHud();
        }
        showMissionToast(m);
      }
    });
    if (changed){ saveCompletedMissions(); checkAchievements(); }
  }

  // Display-only progress readout for the quest-log bar in renderMissions()
  // below — mirrors the boolean conditions in checkMissions() as a
  // current/target pair instead of a yes/no, doesn't affect when a mission
  // actually completes (that's still decided by checkMissions()).
  function missionProgress(m){
    switch (m.id){
      case 'm_levels_5':      return { current: Math.min(5, progress.filter(Boolean).length), target: 5 };
      case 'm_levels_15':     return { current: Math.min(15, progress.filter(Boolean).length), target: 15 };
      case 'm_distance_10k':  return { current: Math.min(10000, totalDistanceEver), target: 10000 };
      case 'm_coop_5':        return { current: Math.min(5, totalCoopRuns), target: 5 };
      case 'm_versus_5':      return { current: Math.min(5, totalVersusRuns), target: 5 };
      case 'm_level_25':      return { current: progress[24] ? 1 : 0, target: 1 };
      case 'm_freeplay_6000': return { current: Math.min(6000, bestFree), target: 6000 };
      case 'm_shop_all': return { current: Math.min(SKINS.length, ownedSkins.size), target: SKINS.length };
      case 'm_all_levels':    return { current: progress.filter(Boolean).length, target: progress.length };
      case 'm_coins_5000':    return { current: Math.min(5000, totalCoinsEarned), target: 5000 };

      case 'm_crates_20':     return { current: Math.min(20, totalCratesOpened), target: 20 };
      case 'm_abilities_50':  return { current: Math.min(50, totalAbilityUses), target: 50 };
      case 'm_diamonds_1000': return { current: Math.min(1000, totalDiamondsEarned), target: 1000 };
      case 'm_challenges_15': return { current: Math.min(15, totalChallengesDone), target: 15 };
      case 'm_crateskins_15': {
        const req = SKINS.filter(s => s.kind === 'crate');
        return { current: Math.min(15, req.filter(s => ownedSkins.has(s.id)).length), target: 15 };
      }

      case 'm_levels_30':      return { current: Math.min(30, progress.filter(Boolean).length), target: 30 };
      case 'm_levels_50':      return { current: Math.min(50, progress.filter(Boolean).length), target: 50 };
      case 'm_levels_75':      return { current: Math.min(75, progress.filter(Boolean).length), target: 75 };
      case 'm_distance_25k':   return { current: Math.min(25000, totalDistanceEver), target: 25000 };
      case 'm_distance_50k':   return { current: Math.min(50000, totalDistanceEver), target: 50000 };
      case 'm_freeplay_12000': return { current: Math.min(12000, bestFree), target: 12000 };
      case 'm_coop_15':        return { current: Math.min(15, totalCoopRuns), target: 15 };
      case 'm_versus_15':      return { current: Math.min(15, totalVersusRuns), target: 15 };
      case 'm_coop_30':        return { current: Math.min(30, totalCoopRuns), target: 30 };
      case 'm_pickups_25':     return { current: Math.min(25, totalPickupsCollected), target: 25 };
      case 'm_boosterruns_10': return { current: Math.min(10, totalBoosterRuns), target: 10 };
      case 'm_crates_5':       return { current: Math.min(5, totalCratesOpened), target: 5 };
      case 'm_achievements_5': return { current: Math.min(5, unlockedAchievements.size), target: 5 };
      case 'm_achievements_10':return { current: Math.min(ACHIEVEMENTS.length, unlockedAchievements.size), target: ACHIEVEMENTS.length };
      case 'm_diamonds_100':   return { current: Math.min(100, totalDiamondsEarned), target: 100 };

      case 'm_levels_40':      return { current: Math.min(40, progress.filter(Boolean).length), target: 40 };
      case 'm_levels_60':      return { current: Math.min(60, progress.filter(Boolean).length), target: 60 };
      case 'm_levels_90':      return { current: Math.min(90, progress.filter(Boolean).length), target: 90 };
      case 'm_distance_75k':   return { current: Math.min(75000, totalDistanceEver), target: 75000 };
      case 'm_versus_25':      return { current: Math.min(25, totalVersusRuns), target: 25 };
      case 'm_coop_25':        return { current: Math.min(25, totalCoopRuns), target: 25 };
      case 'm_crates_10':      return { current: Math.min(10, totalCratesOpened), target: 10 };
      case 'm_abilities_100':  return { current: Math.min(100, totalAbilityUses), target: 100 };
      case 'm_challenges_5':   return { current: Math.min(5, totalChallengesDone), target: 5 };
      case 'm_coins_15000':    return { current: Math.min(15000, totalCoinsEarned), target: 15000 };

      case 'm_levels_20':      return { current: Math.min(20, progress.filter(Boolean).length), target: 20 };
      case 'm_levels_70':      return { current: Math.min(70, progress.filter(Boolean).length), target: 70 };
      case 'm_levels_95':      return { current: Math.min(95, progress.filter(Boolean).length), target: 95 };
      case 'm_distance_100k':  return { current: Math.min(100000, totalDistanceEver), target: 100000 };
      case 'm_distance_150k':  return { current: Math.min(150000, totalDistanceEver), target: 150000 };
      case 'm_coop_50':        return { current: Math.min(50, totalCoopRuns), target: 50 };
      case 'm_versus_50':      return { current: Math.min(50, totalVersusRuns), target: 50 };
      case 'm_pickups_50':     return { current: Math.min(50, totalPickupsCollected), target: 50 };
      case 'm_boosterruns_25': return { current: Math.min(25, totalBoosterRuns), target: 25 };
      case 'm_crates_35':      return { current: Math.min(35, totalCratesOpened), target: 35 };
      default:                return { current: 0, target: 1 };
    }
  }

  // Display-order group for the quest log — coins first, then diamonds, then
  // booster/ability rewards (grouped together, same priority), skins last.
  // Purely a rendering concern: MISSIONS itself stays in its original
  // (checkMissions/missionProgress don't care about order), only the sorted
  // copy built in renderMissions() below is affected.
  const MISSION_REWARD_ORDER = { coins: 0, diamonds: 1, booster: 2, ability: 2, skin: 3 };

  // Quest-log list: reward up front next to the name, progress bar per row
  // instead of a flat locked/unlocked badge — visually distinct from the
  // trophy-case grid in renderAchievements() above.
  function renderMissions(){
    if (!missionsListEl) return;
    missionsListEl.innerHTML = '';
    const sortedMissions = MISSIONS.slice().sort((a, b) => MISSION_REWARD_ORDER[a.reward.type] - MISSION_REWARD_ORDER[b.reward.type]);
    sortedMissions.forEach(m => {
      const unlocked = completedMissions.has(m.id);
      const row = document.createElement('div');
      row.className = 'quest-row' + (unlocked ? ' unlocked' : '');
      const icon = document.createElement('div');
      icon.className = 'quest-icon';
      icon.textContent = m.icon;
      const body = document.createElement('div');
      body.className = 'quest-body';
      const topLine = document.createElement('div');
      topLine.className = 'quest-top-line';
      const name = document.createElement('div');
      name.className = 'quest-name';
      name.textContent = t(m.nameKey);
      const reward = document.createElement('div');
      reward.className = 'quest-reward';
      reward.textContent = m.reward.type === 'coins'
        ? t('mission_reward_coins', { n: m.reward.amount })
        : m.reward.type === 'diamonds'
        ? t('mission_reward_diamonds', { n: m.reward.amount })
        : m.reward.type === 'booster'
        ? t('mission_reward_item', { n: m.reward.amount, item: BOOSTERS[m.reward.boosterId].icon + ' ' + t(BOOSTERS[m.reward.boosterId].nameKey) })
        : m.reward.type === 'ability'
        ? t('mission_reward_item', { n: m.reward.amount, item: ABILITIES[m.reward.abilityId].icon + ' ' + t(ABILITIES[m.reward.abilityId].nameKey) })
        : t('mission_reward_skin', { skin: t(SKINS.find(s => s.id === m.reward.skinId).nameKey) });
      topLine.appendChild(name); topLine.appendChild(reward);
      const desc = document.createElement('div');
      desc.className = 'quest-desc';
      desc.textContent = t(m.descKey);
      const barRow = document.createElement('div');
      barRow.className = 'quest-bar-row';
      const track = document.createElement('div');
      track.className = 'quest-bar-track';
      const fill = document.createElement('div');
      fill.className = 'quest-bar-fill';
      const { current, target } = missionProgress(m);
      fill.style.width = (unlocked ? 100 : Math.min(100, (current / target) * 100)) + '%';
      track.appendChild(fill);
      const label = document.createElement('div');
      label.className = 'quest-bar-label';
      label.textContent = unlocked ? '✓' : (current + '/' + target);
      barRow.appendChild(track); barRow.appendChild(label);
      body.appendChild(topLine); body.appendChild(desc); body.appendChild(barRow);
      row.appendChild(icon); row.appendChild(body);
      missionsListEl.appendChild(row);
    });
  }

  // ---------- DAILY MISSIONS ----------
  // 6 templates x 5 difficulty variants = a 30-entry pool; 3 are picked at
  // random each calendar day (see ensureDailyFresh). Reward is no longer a
  // fixed per-variant amount — it's rolled at completion time by
  // rollDailyReward() (80% 200-400 coins, 20% 1-3 diamonds) and the rolled
  // result is cached per mission id in dailyMeta.rewards so it survives a
  // page reload without re-rolling.
  const DAILY_TEMPLATES = [
    { key: 'daily_levels',         icon: '🎯', statKey: 'levels',           variants: [{n:1},{n:2},{n:3},{n:4},{n:5}] },
    { key: 'daily_freerun',        icon: '🏁', statKey: 'bestFreeRun',      variants: [{n:150},{n:300},{n:450},{n:600},{n:750}] },
    { key: 'daily_multiplayer',    icon: '🤝', statKey: 'multiplayerRuns',  variants: [{n:1},{n:2},{n:3},{n:4},{n:5}] },
    { key: 'daily_distance_total', icon: '🛣️', statKey: 'distanceTotal',    variants: [{n:300},{n:600},{n:900},{n:1200},{n:1500}] },
    { key: 'daily_runs_played',    icon: '🎮', statKey: 'runsPlayed',       variants: [{n:1},{n:2},{n:3},{n:4},{n:5}] },
    { key: 'daily_coins',          icon: '🪙', statKey: 'coinsEarnedToday', variants: [{n:20},{n:40},{n:60},{n:80},{n:100}] }
  ];
  const DAILY_POOL = [];
  DAILY_TEMPLATES.forEach(tpl => {
    tpl.variants.forEach((v, vi) => {
      DAILY_POOL.push({ id: tpl.key + '_' + vi, key: tpl.key, icon: tpl.icon, statKey: tpl.statKey, n: v.n });
    });
  });
  // 80% of the time a coin payout (200-400, rounded to steps of 20 so it
  // always reads as a "clean" number like 260 or 380), otherwise 1-3 diamonds.
  function rollDailyReward(){
    if (Math.random() < 0.8) return { type: 'coins', amount: 200 + Math.floor(Math.random() * 11) * 20 };
    return { type: 'diamonds', amount: 1 + Math.floor(Math.random() * 3) };
  }
  function dailyRewardText(reward){
    return reward.type === 'coins' ? t('mission_reward_coins', { n: reward.amount }) : t('mission_reward_diamonds', { n: reward.amount });
  }

  function todayStr(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  // Picks 3 different templates first (shuffle the 6 templates, take 3), then
  // one random variant per template — guarantees the day's 3 missions never
  // share a template (e.g. never both "Sprint 300 m" and "Sprint 750 m").
  function pickDailyIds(){
    const templates = DAILY_TEMPLATES.slice();
    for (let i = templates.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = templates[i]; templates[i] = templates[j]; templates[j] = tmp;
    }
    return templates.slice(0, 3).map(tpl => {
      const vi = Math.floor(Math.random() * tpl.variants.length);
      return tpl.key + '_' + vi;
    });
  }
  function freshDailyStats(){
    return { levels: 0, bestFreeRun: 0, multiplayerRuns: 0, distanceTotal: 0, runsPlayed: 0, coinsEarnedToday: 0 };
  }
  function loadDailyMeta(){
    try {
      const raw = localStorage.getItem('scraper_dailymeta_v1');
      if (raw) return JSON.parse(raw);
    } catch(e){}
    return null;
  }
  function saveDailyMeta(){
    try { localStorage.setItem('scraper_dailymeta_v1', JSON.stringify(dailyMeta)); } catch(e){}
  }
  let dailyMeta = loadDailyMeta();
  // Regenerates the day's 3 missions whenever the stored date doesn't match
  // today — first load ever, first load of a new day, or a session left open
  // across midnight (also re-checked in registerDailyRun/renderDailyWidget).
  function ensureDailyFresh(){
    const today = todayStr();
    if (!dailyMeta || dailyMeta.date !== today){
      // Reward is rolled right away for all 3 of today's missions — it's
      // decided the moment they're picked, not when the player finishes one.
      const pickedIds = pickDailyIds();
      const rewards = {};
      pickedIds.forEach(id => { rewards[id] = rollDailyReward(); });
      dailyMeta = { date: today, pickedIds, completed: [], stats: freshDailyStats(), rewards };
      saveDailyMeta();
    } else {
      // Backfill, per mission id (not just "does .rewards exist at all") —
      // a save from the previous version of this feature can already have a
      // .rewards object that's missing entries for still-incomplete
      // missions, which would otherwise crash dailyRewardText() on undefined.
      if (!dailyMeta.rewards) dailyMeta.rewards = {};
      let backfilled = false;
      dailyMeta.pickedIds.forEach(id => {
        if (!dailyMeta.rewards[id]){ dailyMeta.rewards[id] = rollDailyReward(); backfilled = true; }
      });
      if (backfilled) saveDailyMeta();
    }
  }
  ensureDailyFresh();

  function getDailyMissions(){
    return dailyMeta.pickedIds.map(id => DAILY_POOL.find(p => p.id === id)).filter(Boolean);
  }

  function showDailyToast(dm, reward){
    showRewardToast(dm.icon, t(dm.key + '_name', { n: dm.n }), dailyRewardText(reward));
  }

  function checkDailyMissions(){
    ensureDailyFresh();
    let changed = false;
    getDailyMissions().forEach(dm => {
      if (dailyMeta.completed.indexOf(dm.id) === -1 && (dailyMeta.stats[dm.statKey] || 0) >= dm.n){
        // Already rolled back when the mission was picked (see
        // ensureDailyFresh) — this fallback only matters for a save that
        // somehow reached here without one (shouldn't happen post-backfill).
        const reward = dailyMeta.rewards[dm.id] || (dailyMeta.rewards[dm.id] = rollDailyReward());
        dailyMeta.completed.push(dm.id);
        changed = true;
        if (reward.type === 'coins') addCoins(reward.amount); else addDiamonds(reward.amount);
        showDailyToast(dm, reward);
      }
    });
    if (changed){
      saveDailyMeta();
      advanceTutorial(3);
    }
    renderDailyWidget();
  }

  // Called once per finished run (from finishRun/winLevel) with that run's own
  // numbers — not hooked through addCoins, so mission-reward coins never get
  // double-counted into today's coin tally.
  function registerDailyRun(info){
    ensureDailyFresh();
    const s = dailyMeta.stats;
    s.runsPlayed += 1;
    s.distanceTotal += Math.round(info.distance);
    if (info.mode === 'freeplay') s.bestFreeRun = Math.max(s.bestFreeRun, Math.round(info.distance));
    if (info.mode === 'coop' || info.mode === 'versus') s.multiplayerRuns += 1;
    if (info.levelCompleted) s.levels += 1;
    if (info.coinsEarned) s.coinsEarnedToday += info.coinsEarned;
    saveDailyMeta();
    checkDailyMissions();
  }

  function renderDailyWidget(){
    if (!mmDailyListEl) return;
    ensureDailyFresh();
    mmDailyListEl.innerHTML = '';
    getDailyMissions().forEach(dm => {
      const done = dailyMeta.completed.indexOf(dm.id) !== -1;
      const row = document.createElement('div');
      row.className = 'mm-daily-row' + (done ? ' done' : '');
      const icon = document.createElement('span');
      icon.className = 'mm-daily-icon';
      icon.textContent = done ? '✅' : dm.icon;
      const info = document.createElement('div');
      info.className = 'mm-daily-info';
      const name = document.createElement('div');
      name.className = 'mm-daily-name';
      name.textContent = t(dm.key + '_name', { n: dm.n });
      const desc = document.createElement('div');
      desc.className = 'quest-desc';
      desc.textContent = t(dm.key + '_desc', { n: dm.n });
      const prog = document.createElement('div');
      prog.className = 'mm-daily-progress';
      const cur = Math.min(dm.n, dailyMeta.stats[dm.statKey] || 0);
      // Already rolled the moment the mission was picked (see
      // ensureDailyFresh) — shown plainly right away, not just after completion.
      const rewardText = dailyRewardText(dailyMeta.rewards[dm.id]);
      prog.textContent = done ? rewardText : (cur + '/' + dm.n + ' • ' + rewardText);
      info.appendChild(name); info.appendChild(desc); info.appendChild(prog);
      row.appendChild(icon); row.appendChild(info);
      mmDailyListEl.appendChild(row);
    });
  }

  // ---------- DAILY CHALLENGE ----------
  // A single dedicated run (mode 'challenge', see startChallenge()) with three
  // objectives — distance, survival time, dodging N obstacles of one random
  // type — evaluated as "best value reached in a single attempt today", so
  // players can retry as many times as they like and each objective locks in
  // independently once its threshold is beaten in any one run. The run itself
  // is deliberately harder than Freeplay: daily-random multipliers on obstacle
  // speed/size/spawn-rate (rollChallengeModifiers). No coins are earned from
  // distance here (see the mode==='challenge' guard in finishRun()) — the only
  // payout is the one fixed daily reward, granted once all 3 objectives are
  // done. Deliberately kept out of totalDistanceEver/registerDailyRun/
  // checkMissions/checkAchievements — a fully separate system, so the
  // modifier-inflated distance here can't be used to cheese the Freeplay-based
  // "Maratończyk" achievement or the "10 000 m total" mission.
  function pickOne(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  const CHALLENGE_DODGE_TYPES = ['block', 'zigzag', 'orb', 'slider', 'spinner', 'pulsar', 'gate', 'homing', 'mine', 'swarm'];

  function rollChallengeObjectives(){
    return [
      { type: 'distance', target: pickOne([650, 800, 950]) },
      { type: 'survive',  target: pickOne([30, 40, 50]) },
      { type: 'dodge',    target: pickOne([10, 13, 16]), obstacleType: pickOne(CHALLENGE_DODGE_TYPES) }
    ];
  }
  function rollChallengeModifiers(){
    return {
      speedMult:  pickOne([1.5, 1.75, 2]),
      sizeMult:   pickOne([1.3, 1.5, 1.75]),
      spawnMult:  pickOne([1.3, 1.6, 2])
    };
  }
  function rollChallengeReward(){
    return pickOne([
      { type: 'coins', amount: 500 }, { type: 'coins', amount: 650 }, { type: 'coins', amount: 800 },
      { type: 'diamonds', amount: 6 }, { type: 'diamonds', amount: 9 }, { type: 'diamonds', amount: 12 }
    ]);
  }
  function freshChallengeBest(){
    return { distance: 0, survive: 0, dodge: 0 };
  }
  function loadChallengeMeta(){
    try {
      const raw = localStorage.getItem('scraper_challengemeta_v1');
      if (raw) return JSON.parse(raw);
    } catch(e){}
    return null;
  }
  function saveChallengeMeta(){
    try { localStorage.setItem('scraper_challengemeta_v1', JSON.stringify(challengeMeta)); } catch(e){}
  }
  let challengeMeta = loadChallengeMeta();
  // Same "regenerate if the stored date isn't today" pattern as
  // ensureDailyFresh() — re-checked defensively in every entry point below.
  function ensureChallengeFresh(){
    const today = todayStr();
    if (!challengeMeta || challengeMeta.date !== today){
      challengeMeta = {
        date: today,
        objectives: rollChallengeObjectives(),
        modifiers: rollChallengeModifiers(),
        reward: rollChallengeReward(),
        best: freshChallengeBest(),
        completed: [],
        claimed: false
      };
      saveChallengeMeta();
    }
  }
  ensureChallengeFresh();

  function challengeRewardText(reward){
    return reward.type === 'coins'
      ? t('mission_reward_coins', { n: reward.amount })
      : t('mission_reward_diamonds', { n: reward.amount });
  }
  function showChallengeToast(){
    showRewardToast(challengeMeta.reward.type === 'coins' ? '🪙' : '💎', t('challenge_complete_toast'), challengeRewardText(challengeMeta.reward));
  }
  function objectiveBest(o){
    return challengeMeta.best[o.type] || 0;
  }
  // Called once per finished Challenge run (from finishRun()), after that
  // run's best.* values have already been folded in — marks any objective
  // that just crossed its target, and grants the single daily reward the
  // moment all 3 are done (guarded by `claimed` so it can't be paid twice).
  function checkChallengeObjectives(){
    ensureChallengeFresh();
    let changed = false;
    challengeMeta.objectives.forEach(o => {
      if (challengeMeta.completed.indexOf(o.type) === -1 && objectiveBest(o) >= o.target){
        challengeMeta.completed.push(o.type);
        changed = true;
      }
    });
    let justClaimed = false;
    if (!challengeMeta.claimed && challengeMeta.completed.length >= challengeMeta.objectives.length){
      challengeMeta.claimed = true;
      justClaimed = true;
      totalChallengesDone++;
      saveRunCounter('scraper_challengesdone_v1', totalChallengesDone);
      if (challengeMeta.reward.type === 'coins') addCoins(challengeMeta.reward.amount);
      else addDiamonds(challengeMeta.reward.amount);
      checkAchievements();
      checkMissions();
      showChallengeToast();
    }
    if (changed || justClaimed) saveChallengeMeta();
    renderChallengeWidget();
    return justClaimed;
  }

  function challengeObjectiveLabel(o){
    if (o.type === 'distance') return t('chal_obj_distance', { n: o.target });
    if (o.type === 'survive') return t('chal_obj_survive', { n: o.target });
    return t('chal_obj_dodge', { n: o.target, type: t('legend_' + o.obstacleType) });
  }
  const CHALLENGE_OBJ_ICONS = { distance: '🛣️', survive: '⏱️', dodge: '🌀' };

  function renderChallengeWidget(){
    if (!mmChallengeListEl) return;
    ensureChallengeFresh();

    if (mmChallengeModsEl){
      mmChallengeModsEl.innerHTML = '';
      const mods = challengeMeta.modifiers;
      [
        { icon: '⚡', v: mods.speedMult, titleKey: 'challenge_mod_speed' },
        { icon: '📏', v: mods.sizeMult, titleKey: 'challenge_mod_size' },
        { icon: '🌀', v: mods.spawnMult, titleKey: 'challenge_mod_spawn' }
      ].forEach(m => {
        const chip = document.createElement('span');
        chip.className = 'mm-challenge-mod-chip';
        chip.title = t(m.titleKey);
        chip.textContent = m.icon + ' ×' + m.v;
        mmChallengeModsEl.appendChild(chip);
      });
    }

    mmChallengeListEl.innerHTML = '';
    challengeMeta.objectives.forEach(o => {
      const done = challengeMeta.completed.indexOf(o.type) !== -1;
      const row = document.createElement('div');
      row.className = 'mm-challenge-row' + (done ? ' done' : '');
      const icon = document.createElement('span');
      icon.className = 'mm-challenge-icon';
      icon.textContent = done ? '✅' : CHALLENGE_OBJ_ICONS[o.type];
      const info = document.createElement('div');
      info.className = 'mm-challenge-info';
      const name = document.createElement('div');
      name.className = 'mm-challenge-name';
      name.textContent = challengeObjectiveLabel(o);
      const barRow = document.createElement('div');
      barRow.className = 'quest-bar-row';
      const track = document.createElement('div');
      track.className = 'quest-bar-track';
      const fill = document.createElement('div');
      fill.className = 'quest-bar-fill';
      const cur = objectiveBest(o);
      fill.style.width = (done ? 100 : Math.min(100, (cur / o.target) * 100)) + '%';
      track.appendChild(fill);
      const label = document.createElement('div');
      label.className = 'quest-bar-label';
      label.textContent = done ? '✓' : (cur + '/' + o.target);
      barRow.appendChild(track); barRow.appendChild(label);
      info.appendChild(name); info.appendChild(barRow);
      row.appendChild(icon); row.appendChild(info);
      mmChallengeListEl.appendChild(row);
    });

    if (mmChallengeRewardEl){
      const rewardText = challengeRewardText(challengeMeta.reward);
      mmChallengeRewardEl.textContent = challengeMeta.claimed
        ? t('challenge_reward_claimed', { reward: rewardText })
        : t('challenge_reward_pending', { reward: rewardText });
      mmChallengeRewardEl.classList.toggle('claimed', challengeMeta.claimed);
    }
  }

  // ---------- AUDIO ----------
  let audioCtx = null;
  let masterGain = null;
  let musicOn = true;
  let musicTimer = null;
  let menuMusicTimer = null;
  let noiseBuffer = null;

  function ensureAudio(){
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = (volumePercent/100) * 0.3;
    masterGain.connect(audioCtx.destination);
    const bufSize = audioCtx.sampleRate * 0.5;
    noiseBuffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random()*2 - 1;
  }
  function setVolume(v){
    volumePercent = Math.max(0, Math.min(100, v));
    saveVolume(volumePercent);
    if (masterGain) masterGain.gain.value = (volumePercent/100) * 0.3;
    if (volumeSlider) volumeSlider.value = volumePercent;
    if (pauseVolumeSlider) pauseVolumeSlider.value = volumePercent;
  }
  if (volumeSlider){
    volumeSlider.addEventListener('input', (e) => setVolume(parseInt(e.target.value, 10)));
  }
  if (pauseVolumeSlider){
    pauseVolumeSlider.value = volumePercent;
    pauseVolumeSlider.addEventListener('input', (e) => setVolume(parseInt(e.target.value, 10)));
  }

  // ---- Procedural soundtrack engine ----
  // No audio files (project stays offline/dependency-free) — instead a small
  // chord-progression sequencer: a sustained pad + a bassline + an arpeggiated
  // lead, optionally with light percussion. Three distinct arrangements share
  // this same engine (different progression/tempo/instrumentation/drums), so
  // menu, normal gameplay and boss fights each get their own recognizable feel.
  function playNote(freq, time, dur, type, vol){
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(masterGain);
    o.start(time); o.stop(time + dur + 0.05);
  }
  function playPad(freqs, time, dur, vol){
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - (freqs.length-1)/2) * 4;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(vol, time + dur*0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      o.connect(g); g.connect(masterGain);
      o.start(time); o.stop(time + dur + 0.1);
    });
  }
  function playBass(freq, time, dur, vol){
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(masterGain);
    o.start(time); o.stop(time + dur + 0.05);
  }
  function playHat(time, vol){
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 6000;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(time); src.stop(time + 0.06);
  }
  function playKick(time, vol){
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, time);
    o.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    o.connect(g); g.connect(masterGain);
    o.start(time); o.stop(time + 0.2);
  }

  // ---- Main-menu-only extra layers ----
  // The menu track gets its own, richer instrument set instead of reusing
  // playPad/playNote — kept fully separate from the shared functions above
  // so gameplay/boss music (fast tempo, needs to stay tight) is untouched.
  // Echo bus: a feedback delay that the menu's lead + sparkle layers route
  // through, for the "sound trailing off into space" effect ambient/space
  // soundtracks lean on. Lazily created once, reused for the track's whole
  // lifetime (menu music starts/stops far more often than the delay itself
  // needs rebuilding).
  let menuDelay = null, menuDelayWet = null;
  function ensureMenuDelay(){
    if (menuDelay) return;
    menuDelay = audioCtx.createDelay(2.0);
    menuDelay.delayTime.value = 0.44;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.4;
    menuDelayWet = audioCtx.createGain();
    menuDelayWet.gain.value = 0.55;
    menuDelay.connect(feedback);
    feedback.connect(menuDelay);
    menuDelay.connect(menuDelayWet);
    menuDelayWet.connect(masterGain);
  }
  // Same warm triangle pad as playPad, but routed through a lowpass filter
  // whose cutoff slowly sweeps up and back down across the bar — a cheap,
  // classic ambient-pad trick that keeps a held chord feeling alive instead
  // of static for the ~2s it rings out.
  function playMenuPad(freqs, time, dur, vol, filterLo, filterHi){
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.Q.value = 0.6;
    filt.frequency.setValueAtTime(filterLo, time);
    filt.frequency.linearRampToValueAtTime(filterHi, time + dur*0.5);
    filt.frequency.linearRampToValueAtTime(filterLo, time + dur);
    filt.connect(masterGain);
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - (freqs.length-1)/2) * 5;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(vol, time + dur*0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      o.connect(g); g.connect(filt);
      o.start(time); o.stop(time + dur + 0.1);
    });
  }
  // Lead arp note, sent to the echo bus (in addition to the normal dry
  // signal) so single plucked notes trail off instead of cutting cleanly —
  // this is most of what makes the menu loop read as "spacious" rather
  // than "a bare arpeggio".
  function playMenuLead(freq, time, dur, vol, wave){
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = wave || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(masterGain); g.connect(menuDelay);
    o.start(time); o.stop(time + dur + 0.05);
  }
  // Occasional high "twinkling star" bell — two near-unison sines (one
  // detuned an octave-ish up) with a long exponential decay, fired
  // sparingly (see stepMenuProgression) rather than every bar so it reads
  // as a rare sparkle, not a busy layer.
  function playSparkle(freq, time, vol){
    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o1.type = 'sine'; o1.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 2.005;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);
    o1.connect(g); o2.connect(g); g.connect(masterGain); g.connect(menuDelay);
    o1.start(time); o1.stop(time + 1.7);
    o2.start(time); o2.stop(time + 1.7);
  }
  // Very quiet, continuously-running sub-bass drone (two slightly detuned
  // low sawtooths through a lowpass) — the "engine hum" bed felt more than
  // heard underneath the chords, running for the menu music's whole
  // lifetime rather than being re-triggered per bar like the other layers.
  let menuDrone = null;
  function startMenuDrone(freq){
    if (menuDrone) return;
    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    o1.type = 'sawtooth'; o1.frequency.value = freq;
    o2.type = 'sawtooth'; o2.frequency.value = freq * 1.0055;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 200;
    filt.Q.value = 0.4;
    const g = audioCtx.createGain();
    g.gain.value = 0.022;
    o1.connect(filt); o2.connect(filt); filt.connect(g); g.connect(masterGain);
    o1.start(); o2.start();
    menuDrone = { o1, o2 };
  }
  function stopMenuDrone(){
    if (!menuDrone) return;
    try { menuDrone.o1.stop(); menuDrone.o2.stop(); } catch(e){}
    menuDrone = null;
  }
  // Glides the already-running drone oscillators to a new section's pitch
  // over a few seconds instead of restarting them — an audible but smooth
  // "the ground shifts under you" cue right as the section changes.
  function glideMenuDrone(freq, overSeconds){
    if (!menuDrone || !audioCtx) return;
    const now = audioCtx.currentTime;
    menuDrone.o1.frequency.linearRampToValueAtTime(freq, now + overSeconds);
    menuDrone.o2.frequency.linearRampToValueAtTime(freq * 1.0055, now + overSeconds);
  }

  // Each chord: bass note, 3-note pad, and a 4-note arpeggio (chord tones, one
  // step each) — a chord always lasts exactly 4 steps, see stepProgression().
  // 8 chords per track (was 4) — combined with the long, non-repeating-adjacent
  // play order from buildChordSequence() below, this is what turns a few
  // seconds of loop into several minutes before the exact same bar comes
  // back around.
  const MENU_PROGRESSION = [ // Am - F - C - G - F - Am - Dm - G, slow and warm
    { bass: 110.00, pad: [220.00, 261.63, 329.63], arp: [329.63, 440.00, 523.25, 440.00] }, // Am
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], arp: [261.63, 349.23, 440.00, 349.23] }, // F
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }, // C
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], arp: [293.66, 392.00, 493.88, 392.00] }, // G
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], arp: [261.63, 349.23, 440.00, 349.23] }, // F
    { bass: 110.00, pad: [220.00, 261.63, 329.63], arp: [329.63, 440.00, 523.25, 440.00] }, // Am
    { bass: 73.42,  pad: [146.83, 174.61, 220.00], arp: [220.00, 293.66, 349.23, 293.66] }, // Dm
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], arp: [293.66, 392.00, 493.88, 392.00] }  // G
  ];
  const GAME_PROGRESSION = [ // Em - C - G - D - Am - Em - C - D, brighter and driving
    { bass: 82.41,  pad: [164.81, 196.00, 246.94], arp: [246.94, 329.63, 392.00, 329.63] }, // Em
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }, // C
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], arp: [293.66, 392.00, 493.88, 392.00] }, // G
    { bass: 146.83, pad: [293.66, 369.99, 440.00], arp: [440.00, 587.33, 739.99, 587.33] }, // D
    { bass: 110.00, pad: [220.00, 261.63, 329.63], arp: [329.63, 440.00, 523.25, 440.00] }, // Am
    { bass: 82.41,  pad: [164.81, 196.00, 246.94], arp: [246.94, 329.63, 392.00, 329.63] }, // Em
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }, // C
    { bass: 146.83, pad: [293.66, 369.99, 440.00], arp: [440.00, 587.33, 739.99, 587.33] }  // D
  ];
  const BOSS_PROGRESSION = [ // Dm - Bb - F - C - Gm - Dm - Bb - C, darker and tense
    { bass: 73.42,  pad: [146.83, 174.61, 220.00], arp: [220.00, 293.66, 349.23, 293.66] }, // Dm
    { bass: 58.27,  pad: [116.54, 146.83, 174.61], arp: [174.61, 233.08, 293.66, 233.08] }, // Bb
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], arp: [261.63, 349.23, 440.00, 349.23] }, // F
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }, // C
    { bass: 98.00,  pad: [196.00, 233.08, 293.66], arp: [293.66, 392.00, 466.16, 392.00] }, // Gm
    { bass: 73.42,  pad: [146.83, 174.61, 220.00], arp: [220.00, 293.66, 349.23, 293.66] }, // Dm
    { bass: 58.27,  pad: [116.54, 146.83, 174.61], arp: [174.61, 233.08, 293.66, 233.08] }, // Bb
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }  // C
  ];
  // A handful of fixed orderings for the 4 arp notes within a chord — cycled
  // one-per-bar (see stepProgression) purely by bar index, no extra state to
  // track, so even bars that reuse the same chord don't play an identical
  // arpeggio every time.
  const ARP_PATTERNS = [ [0,1,2,3], [3,2,1,0], [0,2,1,3], [2,0,3,1] ];

  // Deterministic pseudo-shuffle (small LCG, fixed seed per track) that walks
  // the chord pool for `length` bars, never repeating the same chord twice in
  // a row. Deterministic on purpose — reproducible/debuggable, and avoids
  // pulling in Math.random() calls whose count would depend on playback timing.
  function buildChordSequence(poolSize, length, seed){
    let s = seed >>> 0;
    // Math.imul keeps the multiply inside 32-bit integer math — a plain `*`
    // here would silently lose precision once s gets into the billions,
    // since the product exceeds Number.MAX_SAFE_INTEGER before the >>> 0.
    const rand = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296; };
    const seq = [];
    let prev = -1;
    for (let i = 0; i < length; i++){
      let idx;
      do { idx = Math.floor(rand() * poolSize); } while (idx === prev && poolSize > 1);
      seq.push(idx);
      prev = idx;
    }
    return seq;
  }
  // Bar counts chosen so a full cycle (before the sequence itself repeats)
  // runs several minutes at each track's tempo, not a handful of seconds:
  // menu ≈ 128 bars * 1.92s/bar ≈ 4min, game ≈ 256 bars * 0.94s/bar ≈ 4min,
  // boss ≈ 240 bars * 0.76s/bar ≈ 3min.
  const MENU_SEQUENCE = buildChordSequence(MENU_PROGRESSION.length, 128, 17);
  const GAME_SEQUENCE = buildChordSequence(GAME_PROGRESSION.length, 256, 41);
  const BOSS_SEQUENCE = buildChordSequence(BOSS_PROGRESSION.length, 240, 73);

  // Two more menu progressions, each with its own instrumentation, so the
  // menu track moves through distinct sections instead of endlessly
  // reshuffling one 8-chord pool — see MENU_SECTIONS / stepMenuProgression.
  const MENU_PROGRESSION_BRIGHT = [ // C - G - Am - Em - F - C - G - Am, major and hopeful
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }, // C
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], arp: [293.66, 392.00, 493.88, 392.00] }, // G
    { bass: 110.00, pad: [220.00, 261.63, 329.63], arp: [329.63, 440.00, 523.25, 440.00] }, // Am
    { bass: 82.41,  pad: [164.81, 196.00, 246.94], arp: [246.94, 329.63, 392.00, 329.63] }, // Em
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], arp: [261.63, 349.23, 440.00, 349.23] }, // F
    { bass: 130.81, pad: [261.63, 329.63, 392.00], arp: [392.00, 523.25, 659.25, 523.25] }, // C
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], arp: [293.66, 392.00, 493.88, 392.00] }, // G
    { bass: 110.00, pad: [220.00, 261.63, 329.63], arp: [329.63, 440.00, 523.25, 440.00] }  // Am
  ];
  const MENU_PROGRESSION_DEEP = [ // Dm - Bb - Gm - F - Dm - Am - Bb - F, dark and sparse
    { bass: 73.42,  pad: [146.83, 174.61, 220.00], arp: [220.00, 293.66, 349.23, 293.66] }, // Dm
    { bass: 58.27,  pad: [116.54, 146.83, 174.61], arp: [174.61, 233.08, 293.66, 233.08] }, // Bb
    { bass: 98.00,  pad: [196.00, 233.08, 293.66], arp: [293.66, 392.00, 466.16, 392.00] }, // Gm
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], arp: [261.63, 349.23, 440.00, 349.23] }, // F
    { bass: 73.42,  pad: [146.83, 174.61, 220.00], arp: [220.00, 293.66, 349.23, 293.66] }, // Dm
    { bass: 110.00, pad: [220.00, 261.63, 329.63], arp: [329.63, 440.00, 523.25, 440.00] }, // Am
    { bass: 58.27,  pad: [116.54, 146.83, 174.61], arp: [174.61, 233.08, 293.66, 233.08] }, // Bb
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], arp: [261.63, 349.23, 440.00, 349.23] }  // F
  ];
  // Long, per-section chord orders (96 bars each) — the outer section loop
  // (MENU_BARS_PER_SECTION bars per visit, see stepMenuProgression) only
  // advances a little way into each on any single visit, so revisiting a
  // section later picks up further along its own sequence instead of
  // replaying the same handful of bars every time it comes back around.
  const MENU_SEQUENCE_BRIGHT = buildChordSequence(MENU_PROGRESSION_BRIGHT.length, 96, 29);
  const MENU_SEQUENCE_DEEP = buildChordSequence(MENU_PROGRESSION_DEEP.length, 96, 53);
  const MENU_BARS_PER_SECTION = 24;
  // Three full "movements" for the menu track, each a genuinely different
  // piece rather than just a chord reshuffle — different progression,
  // tempo, volumes, filter sweep range, lead timbre, sparkle frequency and
  // drone pitch. menuSectionAt() picks one by absolute bar index, so the
  // track cycles warm -> bright -> deep -> warm -> ... for as long as the
  // menu stays open.
  const MENU_SECTIONS = [
    { name: 'warm',   progression: MENU_PROGRESSION,        sequence: MENU_SEQUENCE,        stepDur: 480, padVol: 0.075, bassVol: 0.09, leadVol: 0.06,  leadWave: 'sine',     filterLo: 500, filterHi: 1600, sparkleChance: 0.33, droneFreq: 55.00 },
    { name: 'bright', progression: MENU_PROGRESSION_BRIGHT, sequence: MENU_SEQUENCE_BRIGHT, stepDur: 400, padVol: 0.07,  bassVol: 0.10, leadVol: 0.075, leadWave: 'triangle', filterLo: 700, filterHi: 2200, sparkleChance: 0.5,  droneFreq: 65.41 },
    { name: 'deep',   progression: MENU_PROGRESSION_DEEP,   sequence: MENU_SEQUENCE_DEEP,   stepDur: 560, padVol: 0.065, bassVol: 0.11, leadVol: 0.045, leadWave: 'sine',     filterLo: 260, filterHi: 800,  sparkleChance: 0.15, droneFreq: 41.20 }
  ];
  function menuSectionAt(barIdx){
    return MENU_SECTIONS[Math.floor(barIdx / MENU_BARS_PER_SECTION) % MENU_SECTIONS.length];
  }

  function stepProgression(progression, sequence, stepIdx, opts){
    const now = audioCtx.currentTime;
    const posInChord = stepIdx % 4;
    const barIdx = Math.floor(stepIdx / 4);
    const chord = progression[sequence[barIdx % sequence.length]];
    const arpOrder = ARP_PATTERNS[barIdx % ARP_PATTERNS.length];
    const barDur = (opts.stepDur * 4) / 1000;
    if (posInChord === 0){
      playPad(chord.pad, now, barDur*1.05, opts.padVol);
      playBass(chord.bass, now, barDur*0.9, opts.bassVol);
      if (opts.drums) playKick(now, opts.kickVol);
    }
    playNote(chord.arp[arpOrder[posInChord]], now, (opts.stepDur/1000)*0.85, opts.leadWave, opts.leadVol);
    if (opts.drums) playHat(now, opts.hatVol);
  }

  // Menu-only equivalent of stepProgression() above, using the richer
  // playMenuPad/playMenuLead/playSparkle layers instead of playPad/playNote,
  // and — unlike the shared one — a different chord pool, tempo and timbre
  // depending which of MENU_SECTIONS the absolute bar index currently falls
  // in. Returns the active section so the caller (the setTimeout loop below)
  // knows how long to wait before the next step, since tempo now varies.
  let lastMenuSectionName = null;
  function stepMenuProgression(stepIdx){
    ensureMenuDelay();
    const now = audioCtx.currentTime;
    const posInChord = stepIdx % 4;
    const barIdx = Math.floor(stepIdx / 4);
    const section = menuSectionAt(barIdx);
    if (section.name !== lastMenuSectionName){
      // New section just started — glide the drone to its pitch instead of
      // snapping, so the transition feels like one continuous piece moving
      // somewhere new rather than a hard cut to a different track.
      lastMenuSectionName = section.name;
      glideMenuDrone(section.droneFreq, 3.5);
    }
    const chord = section.progression[section.sequence[barIdx % section.sequence.length]];
    const arpOrder = ARP_PATTERNS[barIdx % ARP_PATTERNS.length];
    const stepDur = section.stepDur / 1000;
    const barDur = stepDur * 4;
    if (posInChord === 0){
      playMenuPad(chord.pad, now, barDur*1.2, section.padVol, section.filterLo, section.filterHi);
      playBass(chord.bass, now, barDur*0.95, section.bassVol);
      // Sparkle chance varies per section (frequent/sparkly in "bright",
      // rare in "deep") — fired at a random point within the bar so it
      // never reads as a metronomic layer.
      if (Math.random() < section.sparkleChance){
        const sparkleFreq = chord.arp[Math.floor(Math.random()*chord.arp.length)] * 2;
        playSparkle(sparkleFreq, now + stepDur*(0.5 + Math.random()*3), 0.045);
      }
    }
    playMenuLead(chord.arp[arpOrder[posInChord]], now, stepDur*0.9, section.leadVol, section.leadWave);
    return section;
  }

  let gameStep = 0;
  let menuStep = 0;
  function startMusic(){
    ensureAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (musicTimer) clearInterval(musicTimer);
    const isBoss = mode === 'single' && LEVELS[currentLevelIndex] && LEVELS[currentLevelIndex].isBoss;
    const progression = isBoss ? BOSS_PROGRESSION : GAME_PROGRESSION;
    const sequence = isBoss ? BOSS_SEQUENCE : GAME_SEQUENCE;
    const opts = isBoss
      ? { stepDur: 190, padVol: 0.10, bassVol: 0.22, leadWave: 'sawtooth', leadVol: 0.12, drums: true, hatVol: 0.05, kickVol: 0.30 }
      : { stepDur: 235, padVol: 0.09, bassVol: 0.16, leadWave: 'triangle', leadVol: 0.11, drums: true, hatVol: 0.035, kickVol: 0.20 };
    gameStep = 0;
    musicTimer = setInterval(() => {
      if (!musicOn || !audioCtx) return;
      stepProgression(progression, sequence, gameStep, opts);
      gameStep++;
    }, opts.stepDur);
  }
  function stopMusic(){
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }
  // Self-rescheduling setTimeout instead of a fixed-period setInterval —
  // MENU_SECTIONS gives each section its own stepDur (tempo), so the delay
  // before the *next* step has to be read back from whichever section the
  // step that just played belonged to.
  function scheduleMenuStep(){
    if (!musicOn || !audioCtx) { menuMusicTimer = null; return; }
    const section = stepMenuProgression(menuStep);
    menuStep++;
    menuMusicTimer = setTimeout(scheduleMenuStep, section.stepDur);
  }
  function startMenuMusic(){
    if (!musicOn) return;
    ensureAudio();
    ensureMenuDelay();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (menuMusicTimer) clearTimeout(menuMusicTimer);
    lastMenuSectionName = null;
    startMenuDrone(MENU_SECTIONS[0].droneFreq);
    menuStep = 0;
    scheduleMenuStep();
  }
  function stopMenuMusic(){
    if (menuMusicTimer) clearTimeout(menuMusicTimer);
    menuMusicTimer = null;
    stopMenuDrone();
  }
  function playHit(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, now);
    o.frequency.exponentialRampToValueAtTime(40, now + 0.35);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.4);
  }
  function playWinFanfare(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f,i) => playNote(f, now + i*0.11, 0.3, 'triangle', 0.14));
  }
  // Low "unlock" thud + an ascending chime cascade — more/higher notes for
  // rarer crates, so common/epic/legendary sound noticeably different too.
  function playCrateOpen(rarity){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(90, now);
    o.frequency.exponentialRampToValueAtTime(50, now + 0.18);
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.25);
    const notesByRarity = {
      common: [659.25, 987.77],
      epic: [523.25, 659.25, 783.99, 1046.5],
      legendary: [392, 523.25, 659.25, 783.99, 1046.5, 1318.5]
    };
    (notesByRarity[rarity] || notesByRarity.common).forEach((f,i) => playNote(f, now + 0.15 + i*0.09, 0.35, 'triangle', 0.16));
  }
  // Short, generic UI acknowledgment for any button press — quiet and brief
  // on purpose so it layers under the more specific action sounds (purchase,
  // crate open, win fanfare, hit) instead of competing with them. Calls
  // ensureAudio() itself (unlike the other effects here) because this is the
  // very first sound many players trigger — a click on the main menu before
  // any run has started ensureAudio() elsewhere — and a click is exactly the
  // kind of user gesture browsers require before audio can start.
  function playClick(){
    if (!musicOn) return;
    ensureAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(640, now + 0.05);
    g.gain.setValueAtTime(0.10, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.07);
  }
  // One very short, quiet, randomly-pitched tick per revealed letter in the
  // tutorial modal's typewriter effect (see typewriterReveal) — deliberately
  // much shorter/quieter than playClick() so rapid repeats don't overlap.
  function playTypeTick(){
    if (!musicOn) return;
    ensureAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1400 + Math.random() * 500, now);
    g.gain.setValueAtTime(0.045, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.03);
  }
  // Bright ascending two-note chime for a successful shop purchase — shorter
  // and simpler than playCrateOpen()'s thud+cascade, since crates are their
  // own bigger "opening" moment and shouldn't sound the same as buying a skin.
  function playPurchase(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    [783.99, 1174.66].forEach((f,i) => playNote(f, now + i*0.09, 0.22, 'triangle', 0.18));
  }
  // Shield up: bright, protective three-note rising sparkle.
  function playShieldOn(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    [740, 987.77, 1318.5].forEach((f,i) => playNote(f, now + i*0.05, 0.18, 'sine', 0.15));
  }
  // Shield breaking: a glassy noise burst (reuses the hi-hat noise source)
  // plus a couple of descending "tinkle" notes — deliberately distinct from
  // playHit() so a blocked hit doesn't sound like a normal, fatal collision.
  function playShieldBreak(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    playHat(now, 0.22);
    playHat(now + 0.03, 0.16);
    [1567.98, 1174.66, 880].forEach((f,i) => playNote(f, now + 0.02 + i*0.05, 0.2, 'triangle', 0.13));
  }
  // Invisibility: an ethereal descending filtered whoosh.
  function playInvisOn(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(700, now);
    o.frequency.exponentialRampToValueAtTime(180, now + 0.45);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.55);
  }
  // Shockwave: a deep sub-bass impact thud, a burst of noise, and a
  // descending cascade suggesting energy dissipating outward.
  function playPulseActivate(){
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, now);
    o.frequency.exponentialRampToValueAtTime(35, now + 0.3);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.35);
    playHat(now, 0.25);
    [523.25, 440, 349.23].forEach((f,i) => playNote(f, now + 0.05 + i*0.06, 0.25, 'sawtooth', 0.10));
  }
  soundBtn.addEventListener('click', () => {
    musicOn = !musicOn;
    soundBtn.textContent = musicOn ? '🔊' : '🔇';
    if (musicOn){
      if (running) startMusic(); else startMenuMusic();
    } else {
      stopMusic();
      stopMenuMusic();
    }
  });
  // Delegated rather than added to each of the ~35 individual button
  // listeners across the menu screens — bubble phase fires after a button's
  // own handler, so a buy button's purchase chime (buySkin()) or a crate's
  // open cascade (buyAndOpenCrate()) still fire first and this just layers a
  // soft tick underneath.
  document.addEventListener('click', (e) => {
    if (e.target.closest('button')) playClick();
  });

  // ---------- LEVELS ----------
  function levelConfig(levelNumber){
    const i = levelNumber - 1;
    let baseSpeed = 2.0 + i * 0.12;
    let spawnInterval = Math.max(260, 1000 - i * 14);
    let targetDistance = 900 + i * 130;
    const isBoss = levelNumber % 10 === 0;
    if (isBoss){
      targetDistance = Math.round(targetDistance * 1.7);
      baseSpeed *= 1.15;
      spawnInterval = Math.max(200, spawnInterval * 0.72);
    }
    return { level: levelNumber, baseSpeed, spawnInterval, target: targetDistance, isBoss };
  }
  const LEVELS = Array.from({length: LEVEL_COUNT}, (_, idx) => levelConfig(idx+1));

  let currentPage = 0;
  const PAGE_COUNT = LEVEL_COUNT / 10;

  function firstIncompletePage(){
    const idx = progress.findIndex(p => !p);
    if (idx === -1) return PAGE_COUNT - 1;
    return Math.floor(idx / 10);
  }

  function renderLevelGrid(){
    levelGrid.innerHTML = '';
    const startIdx = currentPage * 10;
    for (let k = 0; k < 10; k++){
      const i = startIdx + k;
      const levelNumber = i + 1;
      const cfg = LEVELS[i];
      const tile = document.createElement('button');
      tile.className = 'level-tile';
      if (cfg.isBoss) tile.classList.add('boss');
      const unlocked = i === 0 || progress[i-1];
      const done = progress[i];
      tile.textContent = levelNumber;
      if (done) tile.classList.add('done');
      if (!unlocked){
        tile.classList.add('locked');
        tile.textContent = '🔒';
      } else {
        tile.addEventListener('click', () => startLevel(i));
      }
      if (done){
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = '✓';
        tile.appendChild(badge);
      }
      if (cfg.isBoss){
        const crown = document.createElement('span');
        crown.className = 'crown';
        crown.textContent = '👑';
        tile.appendChild(crown);
      }
      levelGrid.appendChild(tile);
    }
    pageLabel.textContent = t('page_label', { p: currentPage+1, total: PAGE_COUNT, a: startIdx+1, b: startIdx+10 });
    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage === PAGE_COUNT - 1;
  }
  prevPageBtn.addEventListener('click', () => { if (currentPage > 0){ currentPage--; renderLevelGrid(); } });
  nextPageBtn.addEventListener('click', () => { if (currentPage < PAGE_COUNT-1){ currentPage++; renderLevelGrid(); } });

  // ---------- GAME STATE ----------
  let mode = 'menu'; // 'single' | 'coop' | 'versus' | 'freeplay' | 'challenge'
  let currentLevelIndex = 0;
  let target = 0;
  let players = [];
  let obstacles = [];
  let running = false;
  let elapsed = 0;
  let spawnTimer = 0;
  // Per-run counter for the Daily Challenge's "dodge N obstacles of type X"
  // objective (see CHALLENGE section) — reset in resetRun(), incremented in
  // loop() when a matching obstacle is removed off-screen without a hit.
  let challengeRunDodge = 0;
  let spawnInterval = 900;
  let baseSpeed = 2.4;
  let coopLives = 3;
  let stars = [];
  let distance = 0;
  let currentSpeed = 2.4;
  let currentInterval = 900;
  const SPEED_RAMP_K = 0.0007;
  const INTERVAL_RAMP_K = 0.05;
  const MIN_INTERVAL = 170;
  let introActive = false;
  let introStart = 0;
  const INTRO_DURATION = 700;

  const keysArrows = { left:false, right:false, up:false, down:false };
  const keysWasd = { left:false, right:false, up:false, down:false };

  const TYPE_COLORS = {
    block:   { c: '#ff5d73', g: 'rgba(255,93,115,0.45)' },
    zigzag:  { c: '#ff9f45', g: 'rgba(255,159,69,0.45)' },
    orb:     { c: '#b672ff', g: 'rgba(182,114,255,0.45)' },
    slider:  { c: '#ffe45e', g: 'rgba(255,228,94,0.45)' },
    spinner: { c: '#4fc3f7', g: 'rgba(79,195,247,0.45)' },
    pulsar:  { c: '#ff3ea5', g: 'rgba(255,62,165,0.5)' },
    gate:    { c: '#4ade80', g: 'rgba(74,222,128,0.45)' },
    homing:  { c: '#7c83ff', g: 'rgba(124,131,255,0.5)' },
    mine:    { c: '#ffb703', g: 'rgba(255,183,3,0.5)' },
    swarm:   { c: '#2dd4bf', g: 'rgba(45,212,191,0.45)' },
    beam:    { c: '#ff2244', g: 'rgba(255,34,68,0.6)' }
  };

  // Faza 0 (motyw "kosmos") — jedno miejsce prawdy dla kolorów tła
  // (mgławice/asteroidy/planety/komety), używane przez
  // drawSpaceBackground() i drawMenuIdlePreview(). Trzymane osobno od
  // TYPE_COLORS — dekoracje tła muszą zostać stonowane, żeby przeszkody
  // dalej jednoznacznie czytały się jako zagrożenie na pierwszym planie.
  const SPACE_COLORS = {
    nebulaA: 'rgba(120,60,200,0.10)',
    nebulaB: 'rgba(255,60,160,0.08)',
    nebulaC: 'rgba(40,180,220,0.08)',
    asteroid: '#4a4658',
    asteroidRim: '#8a84a8',
    planetTypes: [
      { base: '#8a4a2e', shade: '#3a1f14', ring: 'rgba(230,180,120,0.35)' },
      { base: '#3d6a8a', shade: '#152838', ring: 'rgba(180,220,255,0.3)' },
      { base: '#7a3d9e', shade: '#2c1442', ring: 'rgba(220,160,255,0.3)' },
      { base: '#a1503f', shade: '#3e1a12', ring: 'rgba(255,170,140,0.3)' },
      { base: '#2f8f7a', shade: '#0f342c', ring: 'rgba(140,255,220,0.3)' }
    ],
    cometCore: '#eaf6ff',
    cometTail: 'rgba(120,200,255,0.5)',
    satelliteBody: '#c7cede',
    satelliteShade: '#5a6178',
    satellitePanel: 'rgba(90,160,220,0.55)',
    rocketModels: [
      { shape: 'rocket', bodyLight: '#e8ecf5', bodyDark: '#8f97ab', finColor: '#d3444f', flame: 'rgba(255,170,60,0.9)', window: '#4fc3f7' },
      { shape: 'rocket', bodyLight: '#6b7280', bodyDark: '#2b2f3a', finColor: '#28e0ff', flame: 'rgba(120,200,255,0.9)', window: '#eaf6ff' },
      { shape: 'shuttle', bodyLight: '#d9a66c', bodyDark: '#6b4423', finColor: '#d9a66c', flame: 'rgba(255,140,60,0.9)', window: '#ffe45e' }
    ]
  };

  // Level-mode obstacle progression: level 1 spawns only 'block', and each
  // threshold below adds one more type to the pool on top of what's already
  // unlocked (see unlockedTypesForLevel()) — matches the user's spec of
  // block@1, zigzag@11, orb@21, slider@31, spinner@41, pulsar@51, then the
  // four new hazards at 61/71/81/91. Freeplay/coop/versus/challenge have no
  // "level", so they always draw from the full OBSTACLE_WEIGHTS pool.
  const OBSTACLE_UNLOCKS = [
    { level: 1,  type: 'block'   },
    { level: 11, type: 'zigzag'  },
    { level: 21, type: 'orb'     },
    { level: 31, type: 'slider'  },
    { level: 41, type: 'spinner' },
    { level: 51, type: 'pulsar'  },
    { level: 61, type: 'gate'    },
    { level: 71, type: 'homing'  },
    { level: 81, type: 'mine'    },
    { level: 91, type: 'swarm'   }
  ];
  function unlockedTypesForLevel(levelNumber){
    return OBSTACLE_UNLOCKS.filter(u => u.level <= levelNumber).map(u => u.type);
  }

  // Pulsar lifecycle (ms): dim+growing warning ring -> brief lethal full-size flash -> shrink back.
  const PULSAR_CHARGE = 900, PULSAR_PULSE = 260, PULSAR_COOLDOWN = 650;
  // Mine: unarmed (harmless, dim) for this long after spawning, then arms
  // permanently for the rest of its fall — unlike pulsar it never shrinks
  // back, so once armed it stays lethal until it leaves the screen.
  const MINE_ARM_TIME = 550;
  // Boss-only beam lifecycle (ms): translucent warning band at the player's spawn-time
  // x -> brief full-height lethal flash -> fade. Spawned on its own timer, not through
  // the normal weighted-random obstacle pool (see BEAM_INTERVAL / beamTimer below).
  const BEAM_TELEGRAPH = 700, BEAM_STRIKE = 220, BEAM_FADE = 180;
  const BEAM_INTERVAL = 3200;
  let beamTimer = 0;

  // Free, instant-activate versions of the 1/2/3 abilities that fall through
  // the play field like a friendly obstacle — touching one fires the effect
  // immediately (collectAbilityPickup(), near ACTIVATE(SHIELD/INVIS/PULSE)
  // below) without touching abilityInventory or requiring a keypress. Spawns
  // in every mode, same as the keys themselves (see pkt 32.1's "always
  // available, no mode restriction").
  let pickups = [];
  let pickupTimer = 0;
  const PICKUP_MIN_INTERVAL = 9000, PICKUP_MAX_INTERVAL = 15000;
  let nextPickupIn = PICKUP_MIN_INTERVAL + Math.random()*(PICKUP_MAX_INTERVAL - PICKUP_MIN_INTERVAL);

  function initStars(){
    stars = [];
    for (let i = 0; i < 50; i++){
      stars.push({ x: Math.random()*W, y: Math.random()*H, r: 0.5+Math.random()*1.2, speed: 0.25+Math.random()*0.6, alpha: 0.12+Math.random()*0.3 });
    }
    for (let i = 0; i < 22; i++){
      stars.push({ x: Math.random()*W, y: Math.random()*H, r: 1.4+Math.random()*1.8, speed: 1.1+Math.random()*1.4, alpha: 0.25+Math.random()*0.35 });
    }
  }
  initStars();

  // Faza 1 (motyw "kosmos") — dekoracyjne warstwy tła: mgławice,
  // asteroidy, rzadkie planety i komety. Rysowane przez
  // drawSpaceBackground() pod wszystkim innym (patrz wywołania w draw() i
  // drawMenuIdlePreview()). Celowo stonowane/bez blasku (poza jądrem
  // komety) — to tylko dekoracja, nigdy nie może wyglądać jak przeszkoda.
  let nebulae = [];
  let asteroids = [];
  let planets = [];
  let planetTimer = 0;
  const PLANET_MAX_ON_SCREEN = 2;
  const PLANET_MIN_INTERVAL = 6000, PLANET_MAX_INTERVAL = 11000;
  let nextPlanetIn = PLANET_MIN_INTERVAL + Math.random()*(PLANET_MAX_INTERVAL - PLANET_MIN_INTERVAL);
  let satellites = [];
  let satelliteTimer = 0;
  const SATELLITE_MIN_INTERVAL = 9000, SATELLITE_MAX_INTERVAL = 16000;
  let nextSatelliteIn = SATELLITE_MIN_INTERVAL + Math.random()*(SATELLITE_MAX_INTERVAL - SATELLITE_MIN_INTERVAL);
  let comets = [];
  let cometTimer = 0;
  const COMET_MIN_INTERVAL = 5000, COMET_MAX_INTERVAL = 9000;
  let nextCometIn = COMET_MIN_INTERVAL + Math.random()*(COMET_MAX_INTERVAL - COMET_MIN_INTERVAL);
  let rockets = [];
  let rocketTimer = 0;
  const ROCKET_MIN_INTERVAL = 10000, ROCKET_MAX_INTERVAL = 18000;
  let nextRocketIn = ROCKET_MIN_INTERVAL + Math.random()*(ROCKET_MAX_INTERVAL - ROCKET_MIN_INTERVAL);
  let lastSpaceTime = performance.now();

  function initSpace(){
    nebulae = [];
    const nebulaColors = [SPACE_COLORS.nebulaA, SPACE_COLORS.nebulaB, SPACE_COLORS.nebulaC];
    for (let i = 0; i < 3; i++){
      nebulae.push({
        x: Math.random()*W, y: Math.random()*H, r: 150 + Math.random()*90,
        color: nebulaColors[i % nebulaColors.length],
        speed: 0.08 + Math.random()*0.08, phase: Math.random()*Math.PI*2
      });
    }
    asteroids = [];
    for (let i = 0; i < 18; i++){
      asteroids.push({
        x: Math.random()*W, y: Math.random()*H, size: 3 + Math.random()*7,
        speed: 0.3 + Math.random()*0.7, angle: Math.random()*Math.PI*2, spin: (Math.random()-0.5)*0.02
      });
    }
  }
  initSpace();

  function drawRingHalf(p, back){
    ctx.save();
    ctx.strokeStyle = p.type.ring;
    ctx.lineWidth = p.r*0.12;
    ctx.beginPath();
    // Kąty w lokalnej, nieobróconej przestrzeni elipsy: [0,π] to bliższa
    // (dolna) połowa pierścienia — rysowana NA planecie, [π,2π] to dalsza
    // (górna) połowa — rysowana PRZED planetą, żeby chowała się za nią.
    if (back) ctx.ellipse(p.x, p.y, p.r*1.6, p.r*0.4, -0.3, Math.PI, Math.PI*2);
    else ctx.ellipse(p.x, p.y, p.r*1.6, p.r*0.4, -0.3, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlanet(p){
    if (p.hasRing) drawRingHalf(p, true);

    const grad = ctx.createRadialGradient(p.x-p.r*0.3, p.y-p.r*0.3, p.r*0.1, p.x, p.y, p.r);
    grad.addColorStop(0, p.type.base);
    grad.addColorStop(1, p.type.shade);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();

    if (p.surface === 'craters' || p.surface === 'stripes'){
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.clip();
      if (p.surface === 'stripes'){
        ctx.fillStyle = p.type.shade;
        ctx.globalAlpha = 0.45;
        p.stripeOffsets.forEach(off => {
          ctx.fillRect(p.x - p.r, p.y + off*p.r - p.r*0.15, p.r*2, p.r*0.28);
        });
        ctx.globalAlpha = 1;
      } else {
        p.craters.forEach(c => {
          ctx.fillStyle = 'rgba(0,0,0,0.32)';
          ctx.beginPath();
          ctx.arc(p.x + c.dx*p.r, p.y + c.dy*p.r, c.cr*p.r, 0, Math.PI*2);
          ctx.fill();
        });
      }
      ctx.restore();
    }

    if (p.hasRing) drawRingHalf(p, false);
  }

  function drawComet(c){
    const tailK = c.big ? 5 : 3;
    const tx = c.x - c.vx*tailK, ty = c.y - c.vy*tailK;
    const grad = ctx.createLinearGradient(c.x, c.y, tx, ty);
    grad.addColorStop(0, SPACE_COLORS.cometTail);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = c.big ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.save();
    const headR = c.big ? 9.5 : 3.2;
    if (c.big){
      const bodyGrad = ctx.createRadialGradient(c.x - headR*0.3, c.y - headR*0.3, 0.5, c.x, c.y, headR);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.5, SPACE_COLORS.cometCore);
      bodyGrad.addColorStop(1, SPACE_COLORS.asteroid);
      ctx.fillStyle = bodyGrad;
    } else {
      ctx.fillStyle = SPACE_COLORS.cometCore;
    }
    ctx.shadowColor = SPACE_COLORS.cometCore;
    ctx.shadowBlur = c.big ? 16 : 10;
    ctx.beginPath();
    ctx.arc(c.x, c.y, headR, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawSatellite(s){
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = SPACE_COLORS.satellitePanel;
    ctx.fillRect(-s.size*1.8, -s.size*0.35, s.size*1.1, s.size*0.7);
    ctx.fillRect(s.size*0.7, -s.size*0.35, s.size*1.1, s.size*0.7);
    if (s.panels === 4){
      ctx.fillRect(-s.size*0.35, -s.size*1.8, s.size*0.7, s.size*1.1);
      ctx.fillRect(-s.size*0.35, s.size*0.7, s.size*0.7, s.size*1.1);
    }
    const grad = ctx.createLinearGradient(-s.size*0.5, -s.size*0.5, s.size*0.5, s.size*0.5);
    grad.addColorStop(0, SPACE_COLORS.satelliteBody);
    grad.addColorStop(1, SPACE_COLORS.satelliteShade);
    ctx.fillStyle = grad;
    ctx.fillRect(-s.size*0.6, -s.size*0.45, s.size*1.2, s.size*0.9);
    const blink = Math.sin(s.blinkPhase) > 0.4;
    if (blink){
      ctx.fillStyle = '#ff4d5e';
      ctx.beginPath();
      ctx.arc(s.size*0.6, 0, 1.4, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawRocket(r){
    const m = SPACE_COLORS.rocketModels[r.model];
    const s = r.size;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle);

    const flameLen = s * 0.8 * (0.7 + 0.3*Math.sin(r.flamePhase));
    const flameGrad = ctx.createLinearGradient(-s*0.85, 0, -s*0.85 - flameLen, 0);
    flameGrad.addColorStop(0, m.flame);
    flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-s*0.85, -s*0.2);
    ctx.lineTo(-s*0.85 - flameLen, 0);
    ctx.lineTo(-s*0.85, s*0.2);
    ctx.closePath();
    ctx.fill();

    const bodyGrad = ctx.createLinearGradient(0, -s*0.35, 0, s*0.35);
    bodyGrad.addColorStop(0, m.bodyLight);
    bodyGrad.addColorStop(1, m.bodyDark);

    if (m.shape === 'shuttle'){
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(-s*0.2, -s*0.7);
      ctx.lineTo(-s*0.6, -s*0.15);
      ctx.lineTo(-s*0.6, s*0.15);
      ctx.lineTo(-s*0.2, s*0.7);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = m.finColor;
      ctx.beginPath();
      ctx.moveTo(-s*0.6, -s*0.22); ctx.lineTo(-s*1.0, -s*0.55); ctx.lineTo(-s*0.35, -s*0.22);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s*0.6, s*0.22); ctx.lineTo(-s*1.0, s*0.55); ctx.lineTo(-s*0.35, s*0.22);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(s*0.55, -s*0.3);
      ctx.lineTo(-s*0.7, -s*0.3);
      ctx.lineTo(-s*0.7, s*0.3);
      ctx.lineTo(s*0.55, s*0.3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = m.window;
    ctx.beginPath();
    ctx.arc(s*0.15, 0, s*0.14, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }

  function drawSpaceBackground(now){
    const dt = Math.min(now - lastSpaceTime, 50) || 16.67;
    lastSpaceTime = now;
    const step = dt / 16.6667;

    nebulae.forEach(n => {
      n.y += n.speed * step;
      if (n.y - n.r > H) n.y = -n.r;
      const pulse = 1 + 0.06 * Math.sin(now*0.0006 + n.phase);
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r*pulse);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r*pulse, 0, Math.PI*2);
      ctx.fill();
    });

    asteroids.forEach(a => {
      a.y += a.speed * step;
      a.angle += a.spin * step;
      if (a.y - a.size > H){ a.y = -a.size; a.x = Math.random()*W; }
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle);
      const grad = ctx.createRadialGradient(-a.size*0.3, -a.size*0.3, 0.5, 0, 0, a.size);
      grad.addColorStop(0, SPACE_COLORS.asteroidRim);
      grad.addColorStop(1, SPACE_COLORS.asteroid);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, a.size, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    planets = planets.filter(p => p.y - p.r <= H);
    planets.forEach(p => { p.y += p.speed * step; drawPlanet(p); });
    planetTimer += dt;
    if (planetTimer >= nextPlanetIn && planets.length < PLANET_MAX_ON_SCREEN){
      planetTimer = 0;
      nextPlanetIn = PLANET_MIN_INTERVAL + Math.random()*(PLANET_MAX_INTERVAL - PLANET_MIN_INTERVAL);
      const type = SPACE_COLORS.planetTypes[Math.floor(Math.random()*SPACE_COLORS.planetTypes.length)];
      const onLeft = Math.random() < 0.5;
      const r = 40 + Math.random()*35;
      // Planeta wystaje zza krawędzi canvasu (tylko część widoczna) — kratery
      // muszą być losowane w kącie skierowanym w stronę widocznej strony
      // (visibleAngle), inaczej większość ląduje na niewidocznym kawałku.
      const visibleAngle = onLeft ? 0 : Math.PI;
      const surfaceRoll = Math.random();
      const surface = surfaceRoll < 0.35 ? 'craters' : (surfaceRoll < 0.7 ? 'stripes' : 'plain');
      // Losowanie z odrzuceniem kolizji (rejection sampling) — próbujemy
      // kilka razy znaleźć miejsce, które nie nachodzi na już przyjęte
      // kratery/pasy; jeśli się nie uda w rozsądnej liczbie prób, po prostu
      // pomijamy ten element zamiast dopuszczać nakładanie.
      const craters = [];
      if (surface === 'craters'){
        const count = 4 + Math.floor(Math.random()*4);
        for (let i = 0; i < count; i++){
          for (let attempt = 0; attempt < 20; attempt++){
            const a = visibleAngle + (Math.random()-0.5)*Math.PI*0.9, d = Math.random()*0.45;
            const cr = 0.14 + Math.random()*0.18;
            const dx = Math.cos(a)*d, dy = Math.sin(a)*d;
            const overlaps = craters.some(c => {
              const dist = Math.hypot(dx - c.dx, dy - c.dy);
              return dist < (cr + c.cr) * 1.05;
            });
            if (!overlaps){ craters.push({ dx, dy, cr }); break; }
          }
        }
      }
      const stripeOffsets = [];
      if (surface === 'stripes'){
        const count = 2 + Math.floor(Math.random()*2);
        const minGap = 0.34;
        for (let i = 0; i < count; i++){
          for (let attempt = 0; attempt < 20; attempt++){
            const off = (Math.random()-0.5)*1.3;
            if (stripeOffsets.every(o => Math.abs(off - o) >= minGap)){ stripeOffsets.push(off); break; }
          }
        }
      }
      planets.push({
        x: onLeft ? -r*0.12 : W + r*0.12, y: -r, r, speed: 0.15 + Math.random()*0.12, type,
        hasRing: Math.random() < 0.5, surface, craters, stripeOffsets
      });
    }

    satellites = satellites.filter(s => s.y - s.size*2 <= H);
    satellites.forEach(s => { s.y += s.speed * step; s.blinkPhase += 0.05 * step; drawSatellite(s); });
    satelliteTimer += dt;
    if (satelliteTimer >= nextSatelliteIn){
      satelliteTimer = 0;
      nextSatelliteIn = SATELLITE_MIN_INTERVAL + Math.random()*(SATELLITE_MAX_INTERVAL - SATELLITE_MIN_INTERVAL);
      const sizeTiers = [ { min: 9, max: 13 }, { min: 14, max: 19 }, { min: 20, max: 27 } ];
      const tier = sizeTiers[Math.floor(Math.random()*sizeTiers.length)];
      satellites.push({
        x: 30 + Math.random()*(W-60), y: -40, size: tier.min + Math.random()*(tier.max - tier.min),
        panels: Math.random() < 0.4 ? 4 : 2,
        speed: 0.4 + Math.random()*0.3, angle: Math.random()*Math.PI*2, blinkPhase: Math.random()*Math.PI*2
      });
    }

    comets = comets.filter(c => c.x > -40 && c.x < W + 40 && c.y < H + 40);
    comets.forEach(c => {
      c.x += c.vx * step; c.y += c.vy * step;
      drawComet(c);
    });
    cometTimer += dt;
    if (cometTimer >= nextCometIn){
      cometTimer = 0;
      nextCometIn = COMET_MIN_INTERVAL + Math.random()*(COMET_MAX_INTERVAL - COMET_MIN_INTERVAL);
      const fromLeft = Math.random() < 0.5;
      const isShower = Math.random() < 0.35;
      const count = isShower ? 3 + Math.floor(Math.random()*3) : 1;
      const baseY = Math.random()*H*0.5;
      for (let i = 0; i < count; i++){
        const big = Math.random() < (isShower ? 0.25 : 0.3);
        const vx = (fromLeft ? 1 : -1) * (big ? 2.5 + Math.random()*1.4 : 3.5 + Math.random()*2.2);
        const vy = big ? 1.6 + Math.random()*1.1 : 2.2 + Math.random()*1.6;
        comets.push({
          x: (fromLeft ? -20 : W + 20) - vx * i * 6,
          y: baseY + i * (isShower ? 16 + Math.random()*10 : 0),
          vx, vy,
          big
        });
      }
    }

    rockets = rockets.filter(r => r.x > -60 && r.x < W + 60 && r.y > -60 && r.y < H + 60);
    rockets.forEach(r => {
      r.x += r.vx * step; r.y += r.vy * step; r.flamePhase += 0.12 * step;
      drawRocket(r);
    });
    rocketTimer += dt;
    if (rocketTimer >= nextRocketIn){
      rocketTimer = 0;
      nextRocketIn = ROCKET_MIN_INTERVAL + Math.random()*(ROCKET_MAX_INTERVAL - ROCKET_MIN_INTERVAL);
      const sizeTiers = [ { min: 14, max: 20 }, { min: 21, max: 30 }, { min: 31, max: 42 } ];
      const tier = sizeTiers[Math.floor(Math.random()*sizeTiers.length)];
      const size = tier.min + Math.random()*(tier.max - tier.min);
      const fromLeft = Math.random() < 0.5;
      const vx = (fromLeft ? 1 : -1) * (0.8 + Math.random()*0.6);
      const vy = 0.4 + Math.random()*0.6;
      rockets.push({
        x: fromLeft ? -size : W + size,
        y: Math.random()*H*0.7,
        vx, vy, size,
        angle: Math.atan2(vy, vx),
        model: Math.floor(Math.random()*SPACE_COLORS.rocketModels.length),
        flamePhase: Math.random()*Math.PI*2
      });
    }
  }

  // Idle canvas preview behind the fullscreen main menu — drifting
  // starfield + the same space background as gameplay, no
  // obstacles/players/HUD, so the board reads as "not started yet" until
  // Play is pressed.
  let menuIdleRaf = null;
  function drawMenuIdlePreview(){
    ctx.clearRect(0, 0, W, H);
    drawSpaceBackground(performance.now());
    stars.forEach(s => {
      s.y += s.speed * 0.35;
      if (s.y > H){ s.y = 0; s.x = Math.random()*W; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
  }
  function menuIdleLoop(){
    drawMenuIdlePreview();
    menuIdleRaf = requestAnimationFrame(menuIdleLoop);
  }

  function makePlayer(skin, control){
    return {
      x: control === 'wasd' ? W*0.35 : (control === 'arrows' ? W*0.65 : W/2),
      y: H-60, r:12, skin, trail: [], control, invulnerableUntil: 0,
      shieldActive: false, invisibleUntil: 0
    };
  }

  function updateHudBossTag(isBoss){
    let tag = document.getElementById('bossTag');
    if (isBoss){
      if (!tag){
        tag = document.createElement('span');
        tag.id = 'bossTag';
        tag.className = 'boss-tag';
        hudLeft.appendChild(tag);
      }
      tag.textContent = ' ' + t('hud_boss_tag');
    }
    stageEl.classList.toggle('boss-mode', !!isBoss);
  }

  // Small HUD indicator for the currently active booster (if any) — same
  // append-once/update-in-place pattern as updateHudBossTag() above, and
  // relies on the same fact: each start*() call resets hudLeft.innerHTML
  // first, so a stale tag from a previous run never lingers. Called again
  // after every successful heart revive so the shown count stays accurate.
  function updateHudBoosterTag(){
    if (!activeBooster) return;
    let tag = document.getElementById('boosterTag');
    if (!tag){
      tag = document.createElement('span');
      tag.id = 'boosterTag';
      tag.className = 'booster-tag';
      hudLeft.appendChild(tag);
    }
    const b = BOOSTERS[activeBooster];
    tag.textContent = ' ' + b.icon + (activeBooster === 'heart' ? ' ×' + boosterInventory.heart : '');
  }

  // Ability charge counters shown below the main HUD — always all 3 slots
  // (dimmed via .empty when a player owns none), so the 1/2/3 keybinding is
  // discoverable even before the player has ever found a charge. Called
  // once per run start (see resetRun()) and again after every
  // activation/consumption so the counts stay live.
  function updateAbilityHud(){
    ABILITY_IDS.forEach(id => {
      const el = document.getElementById('abilitySlot-' + id);
      if (!el) return;
      const owned = abilityInventory[id] || 0;
      el.textContent = ABILITIES[id].key + ': ' + ABILITIES[id].icon + ' ×' + owned;
      el.classList.toggle('empty', owned <= 0);
    });
  }

  function startLevel(index){
    ensureAudio();
    activeBooster = null; // boosters only apply to Free mode / Co-op / Versus
    currentLevelIndex = index;
    mode = 'single';
    const cfg = LEVELS[index];
    target = cfg.target;
    baseSpeed = cfg.baseSpeed;
    spawnInterval = cfg.spawnInterval;
    players = [ makePlayer(getEquippedSkin(), 'both') ];
    players[0].x = W/2;
    hudLeft.innerHTML = t('hud_level') + ' <b>' + (index+1) + '</b>';
    hudRight.innerHTML = t('hud_distance') + ' <b id="distanceDisplay">0</b> / <b>' + Math.round(target) + '</b> m';
    updateHudBossTag(cfg.isBoss);
    bindScoreRefs();
    showScreen(null);
    showGameUI(true);
    resetRun();
  }

  function startFreeplay(){
    ensureAudio();
    mode = 'freeplay';
    target = Infinity;
    baseSpeed = 2.2;
    spawnInterval = 900;
    if (activeBooster === 'slowmo'){ baseSpeed *= 0.5; spawnInterval *= 2; }
    players = [ makePlayer(getEquippedSkin(), 'both') ];
    players[0].x = W/2;
    hudLeft.innerHTML = t('hud_freeplay');
    hudRight.innerHTML = t('hud_distance') + ' <b id="distanceDisplay">0</b> m • ' + t('hud_record') + ' <b id="bestFreeTag">' + bestFree + '</b> m';
    updateHudBossTag(false);
    updateHudBoosterTag();
    bindScoreRefs();
    showScreen(null);
    showGameUI(true);
    resetRun();
  }

  function renderSingleSelect(){
    if (freeplayRecordEl) freeplayRecordEl.textContent = t('freeplay_record', { n: bestFree });
  }

  // Freeplay's rules plus the day's modifiers (speed via baseSpeed, size via
  // spawnObstacle()'s sizeMult, spawn rate via a shorter spawnInterval) — see
  // the DAILY CHALLENGE section above for where these come from.
  function startChallenge(){
    ensureAudio();
    activeBooster = null; // boosters only apply to Free mode / Co-op / Versus
    ensureChallengeFresh();
    mode = 'challenge';
    target = Infinity;
    baseSpeed = 2.2 * challengeMeta.modifiers.speedMult;
    spawnInterval = 900 / challengeMeta.modifiers.spawnMult;
    players = [ makePlayer(getEquippedSkin(), 'both') ];
    players[0].x = W/2;
    hudLeft.innerHTML = t('hud_challenge');
    hudRight.innerHTML = t('hud_distance') + ' <b id="distanceDisplay">0</b> m';
    updateHudBossTag(false);
    bindScoreRefs();
    showScreen(null);
    showGameUI(true);
    resetRun();
  }

  function startMultiplayer(kind){
    ensureAudio();
    mode = kind; // 'coop' | 'versus'
    target = Infinity;
    baseSpeed = 2.8;
    spawnInterval = 780;
    if (activeBooster === 'slowmo'){ baseSpeed *= 0.5; spawnInterval *= 2; }
    coopLives = 3;
    players = [
      makePlayer({ type:'solid', color:'#5ee9d6', glow:'rgba(94,233,214,0.55)' }, 'arrows'),
      makePlayer({ type:'solid', color:'#ff9f45', glow:'rgba(255,159,69,0.5)' }, 'wasd')
    ];
    if (kind === 'coop'){
      hudLeft.innerHTML = '<span id="livesDisplay">❤❤❤</span>';
      hudRight.innerHTML = t('hud_shared_score') + ' <b id="distanceDisplay">0</b> m';
    } else {
      hudLeft.innerHTML = '🟢 vs 🟠';
      hudRight.innerHTML = t('hud_distance') + ' <b id="distanceDisplay">0</b> m';
    }
    updateHudBossTag(false);
    updateHudBoosterTag();
    bindScoreRefs();
    showScreen(null);
    showGameUI(true);
    resetRun();
  }

  function updateLivesHud(){
    const el = document.getElementById('livesDisplay');
    if (el) el.textContent = '❤'.repeat(Math.max(0,coopLives)) + '🖤'.repeat(Math.max(0,3-coopLives));
  }

  let distanceRef;
  function bindScoreRefs(){
    distanceRef = document.getElementById('distanceDisplay');
  }

  function resetRun(){
    obstacles = [];
    running = true;
    elapsed = 0;
    spawnTimer = 0;
    beamTimer = 0;
    pickups = [];
    pickupTimer = 0;
    nextPickupIn = PICKUP_MIN_INTERVAL + Math.random()*(PICKUP_MAX_INTERVAL - PICKUP_MIN_INTERVAL);
    distance = 0;
    challengeRunDodge = 0;
    heartRevivesUsed = 0;
    currentSpeed = baseSpeed;
    currentInterval = spawnInterval;
    if (distanceRef) distanceRef.textContent = '0';
    if (mode === 'coop') updateLivesHud();
    updateAbilityHud();
    overlay.classList.remove('show');

    introActive = true;
    introStart = performance.now();
    players.forEach(p => {
      p.introToY = p.y;
      p.y = H + 40;
      p.trail = [];
    });

    if (musicOn) startMusic();
    last = performance.now();
    requestAnimationFrame(loop);
  }

  // Relative spawn weights across the full 10-type pool (used as-is by
  // freeplay/coop/versus/challenge; Levels mode restricts the pool first via
  // unlockedTypesForLevel(), then weighs only among what's unlocked).
  const OBSTACLE_WEIGHTS = {
    block: 20, zigzag: 14, orb: 11, slider: 10, spinner: 12, pulsar: 9,
    gate: 8, homing: 7, mine: 5, swarm: 4
  };
  function randType(){
    let pool = Object.keys(OBSTACLE_WEIGHTS);
    if (mode === 'single' && LEVELS[currentLevelIndex]){
      pool = unlockedTypesForLevel(currentLevelIndex + 1);
    }
    let total = 0;
    for (const tp of pool) total += OBSTACLE_WEIGHTS[tp];
    let r = Math.random() * total;
    for (const tp of pool){
      r -= OBSTACLE_WEIGHTS[tp];
      if (r < 0) return tp;
    }
    return pool[pool.length - 1];
  }

  function spawnObstacle(){
    const type = randType();
    // Daily Challenge's "size" modifier and the 'small' booster (2x smaller
    // obstacles, Free mode/Co-op/Versus only) both feed the same sizeMult —
    // everywhere else this is 1 (no-op).
    let sizeMult = 1;
    if (mode === 'challenge') sizeMult = challengeMeta.modifiers.sizeMult;
    else if (activeBooster === 'small') sizeMult = 0.5;
    if (type === 'block'){
      const w = (40 + Math.random()*70) * sizeMult;
      obstacles.push({ type, x: Math.random()*(W-w), y:-30, w, h:22*sizeMult, speed: currentSpeed + Math.random()*1.2 });
    } else if (type === 'zigzag'){
      const w = 26*sizeMult, h = 26*sizeMult;
      obstacles.push({ type, x: Math.random()*(W-w), y:-30, w, h, speed: currentSpeed*0.9 + Math.random()*1.0, phase: Math.random()*Math.PI*2 });
    } else if (type === 'orb'){
      const r = (10 + Math.random()*4) * sizeMult;
      obstacles.push({ type, x: Math.random()*(W-2*r)+r, y:-20, r, speed: currentSpeed*1.7 + Math.random()*1.5 });
    } else if (type === 'slider'){
      const w = 60*sizeMult, h = 18*sizeMult;
      const fromLeft = Math.random() < 0.5;
      const y = 80 + Math.random()*(H-260);
      obstacles.push({ type, x: fromLeft ? -w : W, y, w, h, vx: fromLeft ? (2.2+Math.random()*1.6) : -(2.2+Math.random()*1.6) });
    } else if (type === 'spinner'){
      // Rotating pair of hazard tips connected through a falling pivot — dodge
      // through the gap as the blades sweep around.
      const bladeReach = (28 + Math.random()*9) * sizeMult, tipR = 10*sizeMult;
      const span = bladeReach + tipR;
      obstacles.push({ type, x: span + Math.random()*(W-2*span), y: -span, bladeReach, tipR,
        speed: currentSpeed*0.75 + Math.random()*0.6, angle: Math.random()*Math.PI*2,
        spin: (Math.random() < 0.5 ? 1 : -1) * (0.0035 + Math.random()*0.002) });
    } else if (type === 'pulsar'){
      // Mostly-harmless drifting orb that telegraphs (growing warning ring), then
      // briefly expands to a large lethal radius, then shrinks back — a timing
      // dodge rather than a positioning dodge.
      const baseR = 8*sizeMult, pulseR = (38 + Math.random()*7) * sizeMult;
      obstacles.push({ type, x: pulseR + Math.random()*(W-2*pulseR), y: -pulseR, baseR, pulseR,
        curR: baseR, lethal: false, chargeT: 0, phaseTimer: Math.random()*2500,
        speed: currentSpeed*0.85 + Math.random()*0.7 });
    } else if (type === 'gate'){
      // Full-width falling barrier with a single narrow gap — dodging is
      // purely about lining up with the gap's x before it reaches the player.
      // sizeMult shrinks the gap (not grows a rect) since "bigger hazard"
      // here means "less room to slip through".
      const h = 22*sizeMult;
      const gapW = Math.max(50, 130 - Math.random()*40) / sizeMult;
      const gapX = Math.random() * Math.max(1, W - gapW);
      obstacles.push({ type, y: -h, h, gapX, gapW, speed: currentSpeed*0.8 + Math.random()*0.7 });
    } else if (type === 'homing'){
      // Slow orb that gently steers its x toward the player's as it falls —
      // a weak, escapable homing pull rather than a hard aim-lock.
      const r = (9 + Math.random()*3) * sizeMult;
      obstacles.push({ type, x: Math.random()*(W-2*r)+r, y:-20, r,
        speed: currentSpeed*0.6 + Math.random()*0.5, turnSpeed: 0.018 + Math.random()*0.014 });
    } else if (type === 'mine'){
      // Small and harmless for MINE_ARM_TIME, then arms permanently (unlike
      // pulsar, no shrink-back) — rewards committing to a lane early.
      // Armed radius enlarged (was 17-21) — too easy to sidestep at the old size.
      const baseR = 9*sizeMult, armedR = (23 + Math.random()*6) * sizeMult;
      obstacles.push({ type, x: Math.random()*(W-2*armedR)+armedR, y:-20, baseR, armedR,
        curR: baseR, armed: false, armTimer: 0, speed: currentSpeed*0.55 + Math.random()*0.4 });
    } else if (type === 'swarm'){
      // Three hazard tips spread 120° apart around a falling pivot — the
      // spinner concept extended from 2 blades to 3, so the safe gap is
      // narrower and sweeps past faster.
      // Blade reach/tip size enlarged (was 24-32/9) — too easy to slip through.
      const bladeReach = (31 + Math.random()*10) * sizeMult, tipR = 11*sizeMult;
      const span = bladeReach + tipR;
      obstacles.push({ type, x: span + Math.random()*(W-2*span), y: -span, bladeReach, tipR,
        speed: currentSpeed*0.7 + Math.random()*0.5, angle: Math.random()*Math.PI*2,
        spin: (Math.random() < 0.5 ? 1 : -1) * (0.003 + Math.random()*0.0018) });
    }
  }

  function spawnBeam(){
    const px = players[0] ? players[0].x : W/2;
    obstacles.push({ type: 'beam', x: px, w: 54, age: 0, lethal: false, stage: 'telegraph', phaseT: 0 });
  }

  function circleRectHit(cx,cy,cr,rx,ry,rw,rh){
    const nx = Math.max(rx, Math.min(cx, rx+rw));
    const ny = Math.max(ry, Math.min(cy, ry+rh));
    const dx = cx-nx, dy = cy-ny;
    return (dx*dx+dy*dy) < cr*cr;
  }
  function circleCircleHit(x1,y1,r1,x2,y2,r2){
    const dx=x1-x2, dy=y1-y2;
    return (dx*dx+dy*dy) < (r1+r2)*(r1+r2);
  }

  function obstacleHitsPlayer(o, p){
    const pr = p.r - 2;
    if (o.type === 'orb'){
      return circleCircleHit(p.x, p.y, pr, o.x, o.y, o.r);
    } else if (o.type === 'spinner'){
      const a1 = o.angle, a2 = o.angle + Math.PI;
      const t1x = o.x + Math.cos(a1)*o.bladeReach, t1y = o.y + Math.sin(a1)*o.bladeReach;
      const t2x = o.x + Math.cos(a2)*o.bladeReach, t2y = o.y + Math.sin(a2)*o.bladeReach;
      return circleCircleHit(p.x, p.y, pr, t1x, t1y, o.tipR) || circleCircleHit(p.x, p.y, pr, t2x, t2y, o.tipR);
    } else if (o.type === 'pulsar'){
      return o.lethal && circleCircleHit(p.x, p.y, pr, o.x, o.y, o.curR);
    } else if (o.type === 'beam'){
      return o.lethal && circleRectHit(p.x, p.y, pr, o.x - o.w/2, 0, o.w, H);
    } else if (o.type === 'gate'){
      const rightX = o.gapX + o.gapW;
      return circleRectHit(p.x, p.y, pr, 0, o.y, o.gapX, o.h) ||
             circleRectHit(p.x, p.y, pr, rightX, o.y, W - rightX, o.h);
    } else if (o.type === 'homing'){
      return circleCircleHit(p.x, p.y, pr, o.x, o.y, o.r);
    } else if (o.type === 'mine'){
      return o.armed && circleCircleHit(p.x, p.y, pr, o.x, o.y, o.curR);
    } else if (o.type === 'swarm'){
      for (let k = 0; k < 3; k++){
        const a = o.angle + k * (Math.PI*2/3);
        const tx = o.x + Math.cos(a)*o.bladeReach, ty = o.y + Math.sin(a)*o.bladeReach;
        if (circleCircleHit(p.x, p.y, pr, tx, ty, o.tipR)) return true;
      }
      return false;
    } else {
      return circleRectHit(p.x, p.y, pr, o.x, o.y, o.w, o.h);
    }
  }

  function respawnPlayer(p){
    p.x = p.control === 'wasd' ? W*0.35 : W*0.65;
    p.y = H-60;
    p.trail = [];
    p.invulnerableUntil = performance.now() + 1500;
  }

  // ---------- ABILITIES: EFFECTS + ACTIVATION (keys 1/2/3) ----------
  const SHIELD_COLOR = '#7dd3fc';
  const INVIS_COLOR = '#b672ff';
  const PULSE_COLOR = '#bfe9ff';
  const SHIELD_BREAK_MS = 450;
  const ACTIVATION_FX_MS = 380;
  const PULSE_FX_MS = 550;
  const PULSE_MAX_RADIUS = Math.hypot(W, H);
  const INVIS_DURATION_MS = 4000;
  const INVIS_BLINK_WINDOW_MS = 1200;

  let shieldBreakFx = [];
  let activationFx = [];
  let pulseFx = [];
  function triggerShieldBreak(p){ shieldBreakFx.push({ x: p.x, y: p.y, start: performance.now() }); }
  function triggerActivationFx(p, color){ activationFx.push({ x: p.x, y: p.y, start: performance.now(), color }); }
  function triggerPulseFx(x, y){ pulseFx.push({ x, y, start: performance.now() }); }

  // Absorbs exactly one hit, no matter the source (block/orb/beam/...) — the
  // check runs before coop life loss / heart revive / finishRun, so a shield
  // fully cancels the collision before any of those systems even see it.
  function tryShieldBlock(p){
    if (!p.shieldActive) return false;
    p.shieldActive = false;
    p.invulnerableUntil = performance.now() + 400;
    triggerShieldBreak(p);
    playShieldBreak();
    updateAbilityHud();
    return true;
  }

  // Applied to every player in `players` at once from a single charge/keypress
  // — simplest model for shared local Multiplayer (same pattern as the
  // 'heart' booster's shared pool), and a no-op difference in solo modes
  // since players.length === 1 there anyway.
  function activateShield(){
    if (!running || introActive) return;
    if ((abilityInventory.shield || 0) <= 0) return;
    if (players.some(p => p.shieldActive)) return;
    abilityInventory.shield--;
    saveAbilityInventory();
    players.forEach(p => { p.shieldActive = true; triggerActivationFx(p, SHIELD_COLOR); });
    playShieldOn();
    updateAbilityHud();
    totalAbilityUses++;
    saveRunCounter('scraper_abilityuses_v1', totalAbilityUses);
    checkAchievements();
    checkMissions();
  }

  // invisibleUntil drives the "mostly-transparent, blinking near the end"
  // rendering in draw(); invulnerableUntil (already used by every hazard's
  // collision check) is pushed out to the same deadline so invisibility is
  // also real collision immunity, not just a visual — no changes needed to
  // obstacleHitsPlayer()/the collision loop itself.
  function activateInvis(){
    if (!running || introActive) return;
    if ((abilityInventory.invis || 0) <= 0) return;
    const now = performance.now();
    if (players.some(p => now < p.invisibleUntil)) return;
    abilityInventory.invis--;
    saveAbilityInventory();
    players.forEach(p => {
      p.invisibleUntil = now + INVIS_DURATION_MS;
      p.invulnerableUntil = Math.max(p.invulnerableUntil, now + INVIS_DURATION_MS);
      triggerActivationFx(p, INVIS_COLOR);
    });
    playInvisOn();
    updateAbilityHud();
    totalAbilityUses++;
    saveRunCounter('scraper_abilityuses_v1', totalAbilityUses);
    checkAchievements();
    checkMissions();
  }

  // Instantly clears every obstacle on screen (including a boss's beam) —
  // originates from the average position of all players so it reads as one
  // shared blast in Multiplayer instead of two separate ones.
  function activatePulse(){
    if (!running || introActive) return;
    if ((abilityInventory.pulse || 0) <= 0) return;
    abilityInventory.pulse--;
    saveAbilityInventory();
    const now = performance.now();
    const cx = players.reduce((s,p) => s+p.x, 0) / players.length;
    const cy = players.reduce((s,p) => s+p.y, 0) / players.length;
    obstacles.length = 0;
    players.forEach(p => { p.invulnerableUntil = Math.max(p.invulnerableUntil, now + 300); });
    triggerPulseFx(cx, cy);
    playPulseActivate();
    updateAbilityHud();
    totalAbilityUses++;
    saveRunCounter('scraper_abilityuses_v1', totalAbilityUses);
    checkAchievements();
    checkMissions();
  }

  function spawnAbilityPickup(){
    const id = ABILITY_IDS[Math.floor(Math.random() * ABILITY_IDS.length)];
    const r = 15;
    pickups.push({ id, x: r + Math.random()*(W - 2*r), y: -r, r, speed: 2.2 });
  }

  // Same "apply to every player at once" shared-pool model as the
  // keyboard-triggered activate*() functions above (the user asked for map
  // crates to hit the same shared pool the 1/2/3 keys already do in
  // Multiplayer) — but skips abilityInventory entirely: these are free,
  // map-only procs, not added to the player's owned stock, and the effect
  // fires the instant the ball touches the crate instead of waiting for a
  // keypress.
  function collectAbilityPickup(id){
    const now = performance.now();
    if (id === 'shield'){
      if (players.some(p => p.shieldActive)) return;
      players.forEach(p => { p.shieldActive = true; triggerActivationFx(p, SHIELD_COLOR); });
      playShieldOn();
    } else if (id === 'invis'){
      if (players.some(p => now < p.invisibleUntil)) return;
      players.forEach(p => {
        p.invisibleUntil = now + INVIS_DURATION_MS;
        p.invulnerableUntil = Math.max(p.invulnerableUntil, now + INVIS_DURATION_MS);
        triggerActivationFx(p, INVIS_COLOR);
      });
      playInvisOn();
    } else if (id === 'pulse'){
      const cx = players.reduce((s,p) => s+p.x, 0) / players.length;
      const cy = players.reduce((s,p) => s+p.y, 0) / players.length;
      obstacles.length = 0;
      players.forEach(p => { p.invulnerableUntil = Math.max(p.invulnerableUntil, now + 300); });
      triggerPulseFx(cx, cy);
      playPulseActivate();
    }
    totalPickupsCollected++;
    saveRunCounter('scraper_pickupscollected_v1', totalPickupsCollected);
    checkAchievements();
    checkMissions();
  }

  // 'heart' booster: at most ONE revive per run (not a repeatable/escalating
  // cost) — costs a flat 1 heart from the account-wide boosterInventory.
  // heartRevivesUsed acts as a used/not-used flag here rather than a counter.
  function tryHeartRevive(){
    if (activeBooster !== 'heart') return false;
    if (heartRevivesUsed >= 1) return false;
    if ((boosterInventory.heart || 0) < 1) return false;
    boosterInventory.heart -= 1;
    saveBoosterInventory();
    heartRevivesUsed = 1;
    updateHudBoosterTag();
    return true;
  }

  function registerCoopHit(p){
    coopLives--;
    updateLivesHud();
    triggerFlash();
    playHit();
    if (coopLives <= 0){
      if (tryHeartRevive()){
        coopLives = 1;
        updateLivesHud();
        respawnPlayer(p);
      } else {
        finishRun(p, 'coop-out');
      }
    } else {
      respawnPlayer(p);
    }
  }

  function finishRun(hitPlayer, reason){
    running = false;
    stopMusic();
    if (reason !== 'coop-out') { triggerFlash(); playHit(); }
    checkAchievements();
    overBtns.innerHTML = '';
    overExpEl.textContent = '';
    let earnedThisRun = 0;

    if (mode === 'single'){
      const earned = coinsForDistance(distance);
      earnedThisRun = earned;
      addCoins(earned);
      const expEarned = expForDistance(distance);
      if (expEarned > 0) addExp(expEarned);
      overTitle.className = 'fail';
      overTitle.textContent = t('overlay_level_fail_title');
      overText.textContent = t('overlay_level_fail_text', { distance: Math.round(distance), target: Math.round(target) });
      overCoinsEl.textContent = t('overlay_coins_earned', { coins: earned, total: coins });
      overExpEl.textContent = expEarned > 0 ? t('overlay_exp_earned', { exp: expEarned }) : '';
      addOverBtn(t('overlay_retry'), () => startLevel(currentLevelIndex));
      addOverBtn(t('overlay_level_select'), () => { overlay.classList.remove('show'); showGameUI(false); currentPage = firstIncompletePage(); renderLevelGrid(); showScreen(levelSelect); }, true);
    } else if (mode === 'freeplay'){
      const roundedDistance = Math.round(distance);
      const isNewRecord = roundedDistance > bestFree;
      if (isNewRecord){ bestFree = roundedDistance; saveBestFree(bestFree); }
      const earned = coinsForDistance(distance) * (activeBooster === 'coins2x' ? 2 : 1);
      earnedThisRun = earned;
      addCoins(earned);
      const expEarned = expForDistance(distance);
      if (expEarned > 0) addExp(expEarned);
      overTitle.className = isNewRecord ? 'win' : 'fail';
      overTitle.textContent = isNewRecord ? t('overlay_freeplay_record_title') : t('overlay_freeplay_normal_title');
      overText.textContent = t('overlay_freeplay_text', { distance: roundedDistance, best: bestFree });
      overCoinsEl.textContent = t('overlay_coins_earned', { coins: earned, total: coins });
      overExpEl.textContent = expEarned > 0 ? t('overlay_exp_earned', { exp: expEarned }) : '';
      // "Play again" always starts a fresh, un-boosted run — boosters are
      // only offered through the picker right after Play on the main menu
      // (see launchMode()), not silently reused on a replay.
      addOverBtn(t('overlay_play_again'), () => { activeBooster = null; startFreeplay(); });
      addOverBtn(t('overlay_back'), () => { overlay.classList.remove('show'); showGameUI(false); showScreen(mainMenu); }, true);
    } else if (mode === 'coop'){
      overTitle.className = 'fail';
      overTitle.textContent = t('overlay_coop_fail_title');
      overText.textContent = t('overlay_coop_fail_text', { distance: Math.round(distance) });
      overCoinsEl.textContent = '';
      addOverBtn(t('overlay_play_again'), () => { activeBooster = null; startMultiplayer('coop'); });
      addOverBtn(t('overlay_main_menu'), () => { overlay.classList.remove('show'); showGameUI(false); showScreen(mainMenu); }, true);
    } else if (mode === 'challenge'){
      ensureChallengeFresh();
      const roundedDistance = Math.round(distance);
      const survivedSec = Math.floor(elapsed / 1000);
      challengeMeta.best.distance = Math.max(challengeMeta.best.distance, roundedDistance);
      challengeMeta.best.survive  = Math.max(challengeMeta.best.survive, survivedSec);
      challengeMeta.best.dodge    = Math.max(challengeMeta.best.dodge, challengeRunDodge);
      saveChallengeMeta();
      checkChallengeObjectives();
      overTitle.className = 'fail';
      overTitle.textContent = t('overlay_challenge_title');
      overText.textContent = t('overlay_challenge_text', { distance: roundedDistance, seconds: survivedSec });
      overCoinsEl.textContent = challengeMeta.claimed
        ? t('challenge_reward_claimed', { reward: challengeRewardText(challengeMeta.reward) })
        : t('challenge_reward_pending', { reward: challengeRewardText(challengeMeta.reward) });
      addOverBtn(t('overlay_play_again'), () => startChallenge());
      addOverBtn(t('overlay_back'), () => { overlay.classList.remove('show'); showGameUI(false); showScreen(mainMenu); }, true);
    } else {
      overTitle.className = 'fail';
      const who = hitPlayer && hitPlayer.control === 'arrows' ? t('player_arrows') : t('player_wasd');
      const winner = hitPlayer && hitPlayer.control === 'arrows' ? t('winner_wasd') : t('winner_arrows');
      overTitle.textContent = t('overlay_versus_title');
      overText.textContent = t('overlay_versus_text', { who, winner, distance: Math.round(distance) });
      overCoinsEl.textContent = '';
      addOverBtn(t('overlay_play_again'), () => { activeBooster = null; startMultiplayer('versus'); });
      addOverBtn(t('overlay_main_menu'), () => { overlay.classList.remove('show'); showGameUI(false); showScreen(mainMenu); }, true);
    }

    // Challenge runs are a self-contained system (own reward, no coins from
    // distance) — deliberately excluded from the shared lifetime/daily
    // counters below, see the DAILY CHALLENGE section header comment.
    if (mode !== 'challenge'){
      totalDistanceEver += distance;
      saveTotalDistanceEver(totalDistanceEver);
      if (mode === 'coop'){ totalCoopRuns++; saveRunCounter('scraper_coopruns_v1', totalCoopRuns); }
      if (mode === 'versus'){ totalVersusRuns++; saveRunCounter('scraper_versusruns_v1', totalVersusRuns); }
      registerDailyRun({ mode, distance, levelCompleted: false, coinsEarned: earnedThisRun });
      checkMissions();
    }

    overlay.classList.add('show');
  }

  function winLevel(){
    running = false;
    stopMusic();
    playWinFanfare();
    // Replaying an already-completed level pays no coins — only the first
    // clear of a given level does, so grinding a finished level for currency
    // isn't a thing. Must read progress[] before overwriting it below.
    const alreadyCompleted = progress[currentLevelIndex];
    progress[currentLevelIndex] = true;
    saveProgress();
    syncBossSkinUnlocks();
    checkAchievements();
    overBtns.innerHTML = '';
    overTitle.className = 'win';
    const cfg = LEVELS[currentLevelIndex];
    overTitle.textContent = cfg.isBoss ? t('overlay_boss_win_title') : t('overlay_win_title');
    overText.textContent = t('overlay_win_text', { level: (currentLevelIndex+1), distance: Math.round(distance) });
    const earned = alreadyCompleted ? 0 : coinsForDistance(distance);
    if (earned > 0) addCoins(earned);
    overCoinsEl.textContent = earned > 0 ? t('overlay_coins_earned', { coins: earned, total: coins }) : '';
    // Same no-repeat-farming rule as coins right above — otherwise replaying
    // a finished level would be a trivial, unlimited EXP grind.
    const expEarned = alreadyCompleted ? 0 : expForDistance(distance);
    if (expEarned > 0) addExp(expEarned);
    overExpEl.textContent = expEarned > 0 ? t('overlay_exp_earned', { exp: expEarned }) : '';
    if (currentLevelIndex < LEVEL_COUNT-1){
      addOverBtn(t('overlay_next_level'), () => startLevel(currentLevelIndex+1));
    }
    addOverBtn(t('overlay_level_select'), () => { overlay.classList.remove('show'); showGameUI(false); currentPage = firstIncompletePage(); renderLevelGrid(); showScreen(levelSelect); }, true);

    totalDistanceEver += distance;
    saveTotalDistanceEver(totalDistanceEver);
    registerDailyRun({ mode: 'single', distance, levelCompleted: true, coinsEarned: earned });
    checkMissions();

    overlay.classList.add('show');
  }

  function addOverBtn(label, fn, ghost){
    const b = document.createElement('button');
    b.className = 'btn' + (ghost ? ' ghost' : '');
    b.textContent = label;
    b.addEventListener('click', fn);
    overBtns.appendChild(b);
  }

  let last = performance.now();
  function loop(now){
    if (!running) return;
    const dt = Math.min(now - last, 40);
    last = now;

    if (introActive){
      const introT = Math.min(1, (now - introStart) / INTRO_DURATION);
      const eased = 1 - Math.pow(1 - introT, 3);
      players.forEach(p => {
        p.y = (H + 40) + (p.introToY - (H + 40)) * eased;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 10) p.trail.shift();
      });
      stars.forEach(s => {
        s.y += s.speed * 0.4;
        if (s.y > H){ s.y = 0; s.x = Math.random()*W; }
      });
      draw(now);
      if (introT >= 1){
        introActive = false;
        players.forEach(p => { p.y = p.introToY; });
      }
      requestAnimationFrame(loop);
      return;
    }

    elapsed += dt;

    currentSpeed = baseSpeed + distance * SPEED_RAMP_K;
    currentInterval = Math.max(MIN_INTERVAL, spawnInterval - distance * INTERVAL_RAMP_K);
    distance += currentSpeed * (dt / 16.6667);

    const starBoost = 0.4 + currentSpeed * 0.12;
    stars.forEach(s => {
      s.y += s.speed * starBoost;
      if (s.y > H){ s.y = 0; s.x = Math.random()*W; }
    });

    players.forEach(p => {
      const speed = 4.6;
      if (p.control === 'both'){
        if (keysArrows.left || keysWasd.left) p.x -= speed;
        if (keysArrows.right || keysWasd.right) p.x += speed;
        if (keysArrows.up || keysWasd.up) p.y -= speed;
        if (keysArrows.down || keysWasd.down) p.y += speed;
      } else if (p.control === 'arrows'){
        if (keysArrows.left) p.x -= speed;
        if (keysArrows.right) p.x += speed;
        if (keysArrows.up) p.y -= speed;
        if (keysArrows.down) p.y += speed;
      } else if (p.control === 'wasd'){
        if (keysWasd.left) p.x -= speed;
        if (keysWasd.right) p.x += speed;
        if (keysWasd.up) p.y -= speed;
        if (keysWasd.down) p.y += speed;
      }
      p.x = Math.max(p.r, Math.min(W - p.r, p.x));
      p.y = Math.max(p.r, Math.min(H - p.r, p.y));
      p.trail.push({x:p.x, y:p.y});
      if (p.trail.length > 10) p.trail.shift();
    });

    if (mode === 'single'){
      if (distanceRef) distanceRef.textContent = Math.min(Math.round(distance), Math.round(target));
      if (distance >= target){
        winLevel();
        return;
      }
    } else if (distanceRef){
      distanceRef.textContent = Math.round(distance);
    }

    spawnTimer += dt;
    if (spawnTimer > currentInterval){
      spawnTimer = 0;
      spawnObstacle();
    }

    pickupTimer += dt;
    if (pickupTimer > nextPickupIn){
      pickupTimer = 0;
      nextPickupIn = PICKUP_MIN_INTERVAL + Math.random()*(PICKUP_MAX_INTERVAL - PICKUP_MIN_INTERVAL);
      spawnAbilityPickup();
    }

    if (mode === 'single' && LEVELS[currentLevelIndex] && LEVELS[currentLevelIndex].isBoss){
      beamTimer += dt;
      if (beamTimer > BEAM_INTERVAL){
        beamTimer = 0;
        spawnBeam();
      }
    }

    let ended = false;
    for (let i = obstacles.length - 1; i >= 0; i--){
      const o = obstacles[i];
      let offscreen = false;

      if (o.type === 'block'){
        o.y += o.speed;
        offscreen = o.y > H;
      } else if (o.type === 'zigzag'){
        o.y += o.speed;
        o.x += Math.sin((o.y*0.03) + o.phase) * 2.4;
        o.x = Math.max(0, Math.min(W - o.w, o.x));
        offscreen = o.y > H;
      } else if (o.type === 'orb'){
        o.y += o.speed;
        offscreen = o.y - o.r > H;
      } else if (o.type === 'slider'){
        o.x += o.vx;
        offscreen = (o.vx > 0 && o.x > W) || (o.vx < 0 && o.x + o.w < 0);
      } else if (o.type === 'spinner'){
        o.y += o.speed;
        o.angle += o.spin * dt;
        offscreen = o.y - (o.bladeReach + o.tipR) > H;
      } else if (o.type === 'pulsar'){
        o.y += o.speed;
        o.phaseTimer += dt;
        const cycle = PULSAR_CHARGE + PULSAR_PULSE + PULSAR_COOLDOWN;
        const t = o.phaseTimer % cycle;
        if (t < PULSAR_CHARGE){
          o.curR = o.baseR;
          o.lethal = false;
          o.chargeT = t / PULSAR_CHARGE;
        } else if (t < PULSAR_CHARGE + PULSAR_PULSE){
          o.curR = o.pulseR;
          o.lethal = true;
          o.chargeT = 1;
        } else {
          const tt = (t - PULSAR_CHARGE - PULSAR_PULSE) / PULSAR_COOLDOWN;
          o.curR = o.pulseR - (o.pulseR - o.baseR) * tt;
          o.lethal = false;
          o.chargeT = 1 - tt;
        }
        offscreen = o.y - o.pulseR > H;
      } else if (o.type === 'beam'){
        o.age += dt;
        if (o.age < BEAM_TELEGRAPH){
          o.lethal = false; o.stage = 'telegraph'; o.phaseT = o.age / BEAM_TELEGRAPH;
        } else if (o.age < BEAM_TELEGRAPH + BEAM_STRIKE){
          o.lethal = true; o.stage = 'strike'; o.phaseT = (o.age - BEAM_TELEGRAPH) / BEAM_STRIKE;
        } else {
          o.lethal = false; o.stage = 'fade'; o.phaseT = (o.age - BEAM_TELEGRAPH - BEAM_STRIKE) / BEAM_FADE;
        }
        offscreen = o.age > (BEAM_TELEGRAPH + BEAM_STRIKE + BEAM_FADE);
      } else if (o.type === 'gate'){
        o.y += o.speed;
        offscreen = o.y > H;
      } else if (o.type === 'homing'){
        o.y += o.speed;
        const px = players[0] ? players[0].x : o.x;
        o.x += (px - o.x) * o.turnSpeed;
        o.x = Math.max(o.r, Math.min(W - o.r, o.x));
        offscreen = o.y - o.r > H;
      } else if (o.type === 'mine'){
        o.y += o.speed;
        if (!o.armed){
          o.armTimer += dt;
          if (o.armTimer > MINE_ARM_TIME){ o.armed = true; o.curR = o.armedR; }
        }
        offscreen = o.y - o.armedR > H;
      } else if (o.type === 'swarm'){
        o.y += o.speed;
        o.angle += o.spin * dt;
        offscreen = o.y - (o.bladeReach + o.tipR) > H;
      }

      for (const p of players){
        if (now < p.invulnerableUntil) continue;
        if (obstacleHitsPlayer(o, p)){
          if (tryShieldBlock(p)){
            // absorbed — no life lost, run continues
          } else if (mode === 'coop'){
            registerCoopHit(p);
            if (!running) ended = true;
          } else if (tryHeartRevive()){
            triggerFlash();
            playHit();
            respawnPlayer(p);
          } else {
            finishRun(p, 'normal');
            ended = true;
          }
          break;
        }
      }
      if (ended) break;

      if (offscreen){
        if (mode === 'challenge'){
          const dodgeObjective = challengeMeta.objectives.find(x => x.type === 'dodge');
          if (dodgeObjective && o.type === dodgeObjective.obstacleType) challengeRunDodge++;
        }
        obstacles.splice(i,1);
      }
    }
    if (ended) return;

    for (let i = pickups.length - 1; i >= 0; i--){
      const pk = pickups[i];
      pk.y += pk.speed;
      let collected = false;
      for (const p of players){
        if (circleCircleHit(p.x, p.y, p.r - 2, pk.x, pk.y, pk.r)){
          collectAbilityPickup(pk.id);
          collected = true;
          break;
        }
      }
      if (collected || pk.y - pk.r > H) pickups.splice(i, 1);
    }

    draw(now);
    if (running) requestAnimationFrame(loop);
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  // ---------- OBSTACLE RENDERING ----------
  function drawSpinnerObstacle(ctx, o, colors){
    const a1 = o.angle, a2 = o.angle + Math.PI;
    const t1x = o.x + Math.cos(a1)*o.bladeReach, t1y = o.y + Math.sin(a1)*o.bladeReach;
    const t2x = o.x + Math.cos(a2)*o.bladeReach, t2y = o.y + Math.sin(a2)*o.bladeReach;
    ctx.strokeStyle = colors.c;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(t1x, t1y); ctx.lineTo(t2x, t2y); ctx.stroke();
    [[t1x,t1y],[t2x,t2y]].forEach(([tx,ty]) => {
      const grad = ctx.createRadialGradient(tx-o.tipR*0.3, ty-o.tipR*0.3, 1, tx, ty, o.tipR);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.3, colors.c); grad.addColorStop(1, colors.c);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(tx, ty, o.tipR, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = colors.c;
    ctx.beginPath(); ctx.arc(o.x, o.y, 4, 0, Math.PI*2); ctx.fill();
  }

  function drawPulsarObstacle(ctx, o, colors){
    ctx.globalAlpha = o.lethal ? 1 : 0.35 + o.chargeT*0.35;
    const grad = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, Math.max(o.curR, o.baseR));
    grad.addColorStop(0, o.lethal ? '#ffffff' : '#fff4fb');
    grad.addColorStop(0.4, colors.c);
    grad.addColorStop(1, colors.c);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(o.x, o.y, Math.max(o.curR, o.baseR), 0, Math.PI*2); ctx.fill();
    if (!o.lethal){
      ctx.strokeStyle = colors.c;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.25 + o.chargeT*0.5;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.pulseR, 0, Math.PI*2); ctx.stroke();
    }
  }

  function drawBeamObstacle(ctx, o, colors){
    const left = o.x - o.w/2;
    if (o.stage === 'telegraph'){
      ctx.globalAlpha = 0.15 + o.phaseT*0.35;
      ctx.fillStyle = colors.c;
      ctx.fillRect(left, 0, o.w, H);
      ctx.strokeStyle = colors.c;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + o.phaseT*0.5;
      ctx.strokeRect(left, 0, o.w, H);
    } else if (o.stage === 'strike'){
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.c;
      ctx.fillRect(left, 0, o.w, H);
      const grad = ctx.createLinearGradient(left, 0, left+o.w, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(left, 0, o.w, H);
    } else {
      ctx.globalAlpha = Math.max(0, 1 - o.phaseT) * 0.5;
      ctx.fillStyle = colors.c;
      ctx.fillRect(left, 0, o.w, H);
    }
  }

  function drawGateObstacle(ctx, o, colors){
    const rightX = o.gapX + o.gapW;
    [[0, o.gapX], [rightX, W - rightX]].forEach(([x, w]) => {
      if (w <= 0) return;
      const grad = ctx.createLinearGradient(x, o.y, x, o.y + o.h);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.25, colors.c); grad.addColorStop(1, colors.c);
      ctx.fillStyle = grad;
      roundRect(ctx, x, o.y, w, o.h, 4); ctx.fill();
    });
  }

  function drawHomingObstacle(ctx, o, colors){
    const grad = ctx.createRadialGradient(o.x-o.r*0.3, o.y-o.r*0.3, 1, o.x, o.y, o.r);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.3, colors.c); grad.addColorStop(1, colors.c);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI*2); ctx.fill();
    // Thin tracking ring, distinguishing it from a plain orb at a glance.
    ctx.strokeStyle = colors.c;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r + 4, 0, Math.PI*2); ctx.stroke();
  }

  function drawMineObstacle(ctx, o, colors){
    const r = Math.max(o.curR, o.baseR);
    ctx.globalAlpha = o.armed ? 1 : 0.4 + (o.armTimer / MINE_ARM_TIME) * 0.35;
    const grad = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, r);
    grad.addColorStop(0, o.armed ? '#ffffff' : '#fff2d9');
    grad.addColorStop(0.4, colors.c);
    grad.addColorStop(1, colors.c);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI*2); ctx.fill();
    if (o.armed){
      // Radiating spikes once armed, like a naval mine — a clear "this is now lethal" tell.
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.c;
      ctx.lineWidth = 2;
      for (let k = 0; k < 6; k++){
        const a = k * (Math.PI/3);
        ctx.beginPath();
        ctx.moveTo(o.x + Math.cos(a)*r, o.y + Math.sin(a)*r);
        ctx.lineTo(o.x + Math.cos(a)*(r+6), o.y + Math.sin(a)*(r+6));
        ctx.stroke();
      }
    }
  }

  function drawSwarmObstacle(ctx, o, colors){
    const tips = [0,1,2].map(k => {
      const a = o.angle + k * (Math.PI*2/3);
      return { x: o.x + Math.cos(a)*o.bladeReach, y: o.y + Math.sin(a)*o.bladeReach };
    });
    ctx.strokeStyle = colors.c;
    ctx.lineWidth = 3;
    tips.forEach(tp => {
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(tp.x, tp.y); ctx.stroke();
    });
    tips.forEach(tp => {
      const grad = ctx.createRadialGradient(tp.x-o.tipR*0.3, tp.y-o.tipR*0.3, 1, tp.x, tp.y, o.tipR);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.3, colors.c); grad.addColorStop(1, colors.c);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(tp.x, tp.y, o.tipR, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = colors.c;
    ctx.beginPath(); ctx.arc(o.x, o.y, 4, 0, Math.PI*2); ctx.fill();
  }

  function drawObstacle(ctx, o){
    const colors = TYPE_COLORS[o.type];
    ctx.save();
    ctx.shadowColor = colors.g;
    ctx.shadowBlur = 16;
    if (o.type === 'orb'){
      const grad = ctx.createRadialGradient(o.x-o.r*0.3, o.y-o.r*0.3, 1, o.x, o.y, o.r);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.25, colors.c); grad.addColorStop(1, colors.c);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI*2); ctx.fill();
    } else if (o.type === 'spinner'){
      drawSpinnerObstacle(ctx, o, colors);
    } else if (o.type === 'pulsar'){
      drawPulsarObstacle(ctx, o, colors);
    } else if (o.type === 'beam'){
      drawBeamObstacle(ctx, o, colors);
    } else if (o.type === 'gate'){
      drawGateObstacle(ctx, o, colors);
    } else if (o.type === 'homing'){
      drawHomingObstacle(ctx, o, colors);
    } else if (o.type === 'mine'){
      drawMineObstacle(ctx, o, colors);
    } else if (o.type === 'swarm'){
      drawSwarmObstacle(ctx, o, colors);
    } else {
      const grad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + (o.h||0));
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.25, colors.c); grad.addColorStop(1, colors.c);
      ctx.fillStyle = grad;
      roundRect(ctx, o.x, o.y, o.w, o.h, 6); ctx.fill();
    }
    ctx.restore();
  }

  function hexToRgba(hex, a){
    const v = hex.replace('#','');
    const num = parseInt(v,16);
    const r = (num>>16)&255, g=(num>>8)&255, b=num&255;
    return `rgba(${r},${g},${b},${a})`;
  }

  // ---------- BALL SKIN RENDERING ----------
  function shadeColor(hex, percent){
    const v = hex.replace('#','');
    const num = parseInt(v,16);
    let r = (num>>16)&255, g = (num>>8)&255, b = num&255;
    const mix = (ch) => percent < 0 ? ch * (1 + percent) : ch + (255 - ch) * percent;
    r = Math.max(0, Math.min(255, Math.round(mix(r))));
    g = Math.max(0, Math.min(255, Math.round(mix(g))));
    b = Math.max(0, Math.min(255, Math.round(mix(b))));
    return `rgb(${r},${g},${b})`;
  }

  function drawPolygon(ctx, cx, cy, rad, sides, rot){
    ctx.beginPath();
    for (let i = 0; i < sides; i++){
      const a = rot + i * (Math.PI * 2 / sides);
      const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawSolidBall(ctx, x, y, r, color){
    const grad = ctx.createRadialGradient(x - r*0.2, y - r*0.2, r*0.1, x, y, r);
    grad.addColorStop(0, shadeColor(color, 0.25));
    grad.addColorStop(0.55, color);
    grad.addColorStop(1, shadeColor(color, -0.4));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }

  function drawChromeBall(ctx, x, y, r, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createLinearGradient(x-r, y-r, x+r, y+r);
    grad.addColorStop(0, '#eef2f6');
    grad.addColorStop(0.25, '#8f9aa8');
    grad.addColorStop(0.5, '#f4f7fa');
    grad.addColorStop(0.75, '#6b7684');
    grad.addColorStop(1, '#c7ced6');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    const sweep = (now*0.0003) % 1;
    const bandY = (y-r) + sweep*2*r;
    const bandGrad = ctx.createLinearGradient(x-r, bandY-r*0.18, x-r, bandY+r*0.18);
    bandGrad.addColorStop(0, 'rgba(255,255,255,0)');
    bandGrad.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    bandGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(x-r, bandY-r*0.18, 2*r, r*0.36);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = Math.max(1, r*0.04);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  }

  function drawPrismBall(ctx, x, y, r, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x-r*0.2, y-r*0.2, r*0.05, x, y, r);
    grad.addColorStop(0, '#f4ecff');
    grad.addColorStop(0.5, '#c9a6ff');
    grad.addColorStop(1, '#6a3fb8');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(0.5, r*0.035);
    for (let i = 0; i < 6; i++){
      const a = i * (Math.PI*2/6);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a)*r, y + Math.sin(a)*r);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++){
      const a = i*(Math.PI*2/4) + now*0.0006;
      const hue = (now*0.06 + i*90) % 360;
      const gx = x + Math.cos(a)*r*0.55, gy = y + Math.sin(a)*r*0.55;
      ctx.fillStyle = `hsla(${hue},90%,75%,0.55)`;
      ctx.beginPath(); ctx.arc(gx, gy, r*0.12, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  // Brighter cyan base (was near-black, blended into the dark game background)
  // + a proper closed lightning-bolt shape (was disconnected line segments that
  // read as random scribbles) with its own glow ring, in the same spirit as
  // drawSparkBall()'s radiating bolts below.
  function drawNeonBall(ctx, x, y, r, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x, y, r*0.1, x, y, r);
    grad.addColorStop(0, '#1c5866');
    grad.addColorStop(1, '#0a2530');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);

    const pulse = 0.5 + 0.5*Math.sin(now*0.006);

    ctx.strokeStyle = `rgba(120,250,255,${0.55+0.35*pulse})`;
    ctx.lineWidth = Math.max(1, r*0.05);
    ctx.shadowColor = '#7dfbff';
    ctx.shadowBlur = 8 + 8*pulse;
    ctx.beginPath();
    ctx.arc(x, y, r*0.78, 0, Math.PI*2);
    ctx.stroke();

    const pts = [[0.15,-0.6],[-0.35,0.05],[-0.05,0.05],[-0.25,0.6],[0.35,-0.05],[0.05,-0.05]];
    ctx.beginPath();
    pts.forEach(([px,py], i) => {
      const gx = x + px*r*0.9, gy = y + py*r*0.9;
      if (i === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
    });
    ctx.closePath();
    const boltGrad = ctx.createLinearGradient(x, y-r*0.6, x, y+r*0.6);
    boltGrad.addColorStop(0, '#ffffff');
    boltGrad.addColorStop(0.5, '#aefcff');
    boltGrad.addColorStop(1, '#39f0ff');
    ctx.fillStyle = boltGrad;
    ctx.shadowColor = '#7dfbff';
    ctx.shadowBlur = 14 + 10*pulse;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.6+0.3*pulse})`;
    ctx.lineWidth = Math.max(0.5, r*0.025);
    ctx.stroke();

    ctx.restore();
  }

  function drawSoccerBall(ctx, x, y, r){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, '#d6d6d6');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.fillStyle = '#1a1a1a';
    drawPolygon(ctx, x, y, r*0.42, 5, -Math.PI/2);
    for (let i = 0; i < 5; i++){
      const a = i * (Math.PI*2/5) - Math.PI/2;
      drawPolygon(ctx, x + Math.cos(a)*r*0.62, y + Math.sin(a)*r*0.62, r*0.26, 5, a);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = Math.max(1, r*0.05);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  }

  function drawDiscoBall(ctx, x, y, r, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
    grad.addColorStop(0, '#f2f5fb'); grad.addColorStop(0.6, '#aab4c8'); grad.addColorStop(1, '#5b6478');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.strokeStyle = 'rgba(30,30,40,0.35)';
    ctx.lineWidth = Math.max(0.5, r*0.04);
    const step = r*0.36;
    for (let gx = -r; gx <= r; gx += step){
      ctx.beginPath(); ctx.moveTo(x+gx, y-r); ctx.lineTo(x+gx, y+r); ctx.stroke();
    }
    for (let gy = -r; gy <= r; gy += step){
      ctx.beginPath(); ctx.moveTo(x-r, y+gy); ctx.lineTo(x+r, y+gy); ctx.stroke();
    }
    for (let i = 0; i < 6; i++){
      const sa = now*0.002 + i*1.6;
      const sx = x + Math.cos(sa)*r*0.5;
      const sy = y + Math.sin(sa*1.3)*r*0.5;
      const tw = 0.4 + 0.6*Math.abs(Math.sin(now*0.006 + i));
      ctx.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${tw})` : `hsla(${(now*0.08 + i*60) % 360},85%,75%,${tw*0.8})`;
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(1, r*0.09), 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawFireBall(ctx, x, y, r, now){
    const flick = 0.9 + 0.1*Math.sin(now*0.02);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x, y+r*0.15, r*0.05, x, y, r*flick);
    grad.addColorStop(0, '#fff3b0');
    grad.addColorStop(0.35, '#ffb020');
    grad.addColorStop(0.7, '#ff5518');
    grad.addColorStop(1, '#9c1d0e');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffb020';
    const flameH = r*(1.15 + 0.15*Math.sin(now*0.015));
    ctx.beginPath();
    ctx.moveTo(x - r*0.25, y - r*0.7);
    ctx.quadraticCurveTo(x, y - flameH, x + r*0.25, y - r*0.7);
    ctx.quadraticCurveTo(x, y - r*0.85, x - r*0.25, y - r*0.7);
    ctx.fill();
    ctx.restore();
  }

  function drawGalaxyBall(ctx, x, y, r, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.2, y - r*0.2, r*0.05, x, y, r);
    grad.addColorStop(0, '#3a2a6d');
    grad.addColorStop(0.5, '#1c1046');
    grad.addColorStop(1, '#07051c');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    for (let i = 0; i < 7; i++){
      const sa = i*2.4;
      const sx = x + Math.cos(sa)*r*(0.2 + 0.6*((i%3)/3));
      const sy = y + Math.sin(sa*1.7)*r*(0.2 + 0.6*((i%4)/4));
      const tw = 0.3 + 0.7*Math.abs(Math.sin(now*0.004 + i*1.3));
      ctx.fillStyle = `rgba(255,255,255,${tw})`;
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.6, r*0.06), 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawChampionBall(ctx, x, y, r, now){
    const shine = 0.5 + 0.5*Math.sin(now*0.004);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.05, x, y, r);
    grad.addColorStop(0, '#fff6d8');
    grad.addColorStop(0.4, '#ffd75e');
    grad.addColorStop(1, '#b8790a');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.globalAlpha = 0.5*shine;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(x - r*0.3, y - r*0.35, r*0.35, r*0.18, -0.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = Math.max(1, r*0.06);
    ctx.beginPath(); ctx.arc(x, y, r*0.97, 0, Math.PI*2); ctx.stroke();
  }

  // ---------- 8 PARAMETRIC RENDERERS FOR THE 30 CRATE-EXCLUSIVE SKINS ----------
  // Each takes 1-2 colors from the skin object (see SKINS below) instead of
  // being hardcoded to one look — the same "one function, many skins" trick
  // already used by drawSolidBall() for the 8 coin-shop colors, just applied
  // to 8 richer looks instead of a flat fill. Gets addBallFinish()'s shared
  // gloss/rim-shading and (for chrome/prism/neon/disco) any addSkinEffect()
  // flourish for free via drawBallShape() below — these 8 already animate
  // internally, so none of them need an addSkinEffect() case.

  // Faceted gemstone: radial gradient body + 6 crystal facet lines + a bright core ring.
  function drawGemBall(ctx, x, y, r, color){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.35, r*0.05, x, y, r*1.05);
    grad.addColorStop(0, shadeColor(color, 0.55));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, shadeColor(color, -0.5));
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = Math.max(0.6, r*0.035);
    for (let i = 0; i < 6; i++){
      const a = i*(Math.PI*2/6) + Math.PI/6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a)*r, y + Math.sin(a)*r);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, r*0.4, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  // Dark nebula base + soft drifting gas-cloud blobs + twinkling stars (color2 = gas/star tint).
  function drawNebulaBall(ctx, x, y, r, color, color2, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.2, y - r*0.2, r*0.05, x, y, r);
    grad.addColorStop(0, shadeColor(color, 0.3));
    grad.addColorStop(0.6, color);
    grad.addColorStop(1, shadeColor(color, -0.4));
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    for (let i = 0; i < 3; i++){
      const a = i*2.1 + now*0.0003;
      const bx = x + Math.cos(a)*r*0.35, by = y + Math.sin(a*1.3)*r*0.35;
      const bgrad = ctx.createRadialGradient(bx, by, 0, bx, by, r*0.6);
      bgrad.addColorStop(0, hexToRgba(color2, 0.45));
      bgrad.addColorStop(1, hexToRgba(color2, 0));
      ctx.fillStyle = bgrad;
      ctx.beginPath(); ctx.arc(bx, by, r*0.6, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 6; i++){
      const sa = i*2.4;
      const sx = x + Math.cos(sa)*r*(0.2 + 0.6*((i%3)/3));
      const sy = y + Math.sin(sa*1.7)*r*(0.2 + 0.6*((i%4)/4));
      const tw = 0.3 + 0.7*Math.abs(Math.sin(now*0.004 + i*1.3));
      ctx.fillStyle = `rgba(255,255,255,${tw})`;
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.6, r*0.05), 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  // Beach-ball style pinwheel of 8 alternating wedge stripes.
  function drawStripeBall(ctx, x, y, r, color, color2){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const segs = 8;
    for (let i = 0; i < segs; i++){
      ctx.fillStyle = i % 2 === 0 ? color : color2;
      const a0 = i*(Math.PI*2/segs), a1 = a0 + (Math.PI*2/segs);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r*1.05, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Base color + a fixed spotted pattern (ladybug/leopard/panda-style depending on palette).
  function drawDotBall(ctx, x, y, r, color, color2){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.2, y - r*0.2, r*0.05, x, y, r);
    grad.addColorStop(0, shadeColor(color, 0.25));
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.fillStyle = color2;
    const dots = [
      [-0.35,-0.3,0.22],[0.3,-0.35,0.18],[0,0.05,0.24],
      [-0.4,0.3,0.16],[0.4,0.25,0.2],[-0.05,-0.55,0.14],[0.15,0.5,0.15]
    ];
    dots.forEach(([dx,dy,dr]) => {
      if ((dx*dx+dy*dy) < 0.85){
        ctx.beginPath(); ctx.arc(x+dx*r, y+dy*r, dr*r, 0, Math.PI*2); ctx.fill();
      }
    });
    ctx.restore();
  }

  // Animated horizontal wave bands (lava-lamp style), color2 = band color.
  function drawWaveBall(ctx, x, y, r, color, color2, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.fillStyle = color2;
    const bands = 4;
    for (let i = 0; i < bands; i++){
      const baseY = y - r + (i+0.5)*(2*r/bands);
      const wobble = Math.sin(now*0.0025 + i*1.4) * r*0.12;
      ctx.beginPath();
      ctx.moveTo(x-r, baseY - r*0.14 + wobble);
      for (let sx = -r; sx <= r; sx += r*0.25){
        const sy = baseY + Math.sin((sx/r)*3 + now*0.002 + i) * r*0.1 + wobble;
        ctx.lineTo(x+sx, sy);
      }
      ctx.lineTo(x+r, baseY + r*0.14);
      ctx.lineTo(x-r, baseY + r*0.14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Holographic sheen: tinted base + a diagonal rainbow band that sweeps and hue-shifts over time.
  function drawHoloBall(ctx, x, y, r, color, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x - r*0.25, y - r*0.25, r*0.05, x, y, r);
    grad.addColorStop(0, shadeColor(color, 0.4));
    grad.addColorStop(0.6, color);
    grad.addColorStop(1, shadeColor(color, -0.35));
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(0.6);
    const sweep = ((now*0.0004) % 1) * 2 - 0.5;
    const hue = (now*0.1) % 360;
    const bandGrad = ctx.createLinearGradient(sweep*r - r*0.3, -r, sweep*r + r*0.3, r);
    bandGrad.addColorStop(0, 'rgba(255,255,255,0)');
    bandGrad.addColorStop(0.5, `hsla(${hue},90%,70%,0.55)`);
    bandGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(sweep*r - r*0.3, -r, r*0.6, 2*r);
    ctx.restore();
    ctx.restore();
  }

  // Generalized brushed metal (same sliding-highlight trick as drawChromeBall, tinted by color).
  function drawMetalBall(ctx, x, y, r, color, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createLinearGradient(x-r, y-r, x+r, y+r);
    grad.addColorStop(0, shadeColor(color, 0.55));
    grad.addColorStop(0.25, shadeColor(color, -0.25));
    grad.addColorStop(0.5, shadeColor(color, 0.6));
    grad.addColorStop(0.75, shadeColor(color, -0.4));
    grad.addColorStop(1, shadeColor(color, 0.15));
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    const sweep = (now*0.00025) % 1;
    const bandY = (y-r) + sweep*2*r;
    const bandGrad = ctx.createLinearGradient(x-r, bandY-r*0.18, x-r, bandY+r*0.18);
    bandGrad.addColorStop(0, 'rgba(255,255,255,0)');
    bandGrad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    bandGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(x-r, bandY-r*0.18, 2*r, r*0.36);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = Math.max(1, r*0.04);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  }

  // Dark core + 3 pulsing, glowing jagged lightning lines radiating outward (generalized neon).
  function drawSparkBall(ctx, x, y, r, color, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const grad = ctx.createRadialGradient(x, y, r*0.1, x, y, r);
    grad.addColorStop(0, shadeColor(color, -0.55));
    grad.addColorStop(1, '#050507');
    ctx.fillStyle = grad;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    const pulse = 0.5 + 0.5*Math.sin(now*0.007);
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 + 6*pulse;
    ctx.lineWidth = Math.max(1, r*0.05);
    for (let i = 0; i < 3; i++){
      const a = i*(Math.PI*2/3) + now*0.0015;
      const midx = x + Math.cos(a-0.3)*r*0.5, midy = y + Math.sin(a-0.3)*r*0.5;
      const endx = x + Math.cos(a)*r*0.92, endy = y + Math.sin(a)*r*0.92;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(midx, midy);
      ctx.lineTo(endx, endy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Shared "professional finish" layered on top of every skin: a soft specular
  // highlight (upper-left) + a darkened rim (edge shading) for a rounder, glossier
  // look. Applied uniformly so upgrading this one function upgrades all skins.
  function addBallFinish(ctx, x, y, r){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    const hi = ctx.createRadialGradient(x - r*0.38, y - r*0.42, 0, x - r*0.38, y - r*0.42, r*0.65);
    hi.addColorStop(0, 'rgba(255,255,255,0.55)');
    hi.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    hi.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hi;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    const rim = ctx.createRadialGradient(x, y, r*0.82, x, y, r);
    rim.addColorStop(0, 'rgba(0,0,0,0)');
    rim.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = rim;
    ctx.fillRect(x-r, y-r, 2*r, 2*r);
    ctx.restore();
  }

  // Small per-type animated flourish, purely a function of (x,y,r,now) — no extra
  // state to track per player. Chrome/prism/neon/disco already carry their own
  // time-based sparkle inline in their draw*Ball function, so they're no-ops here.
  function addSkinEffect(ctx, x, y, r, skin, now){
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    switch (skin.type){
      case 'solid': {
        const cyc = (now*0.00035) % 1;
        if (cyc < 0.4){
          const t2 = cyc/0.4;
          const off = (t2*2.6 - 0.8) * r;
          ctx.save();
          ctx.translate(x, y); ctx.rotate(-0.6);
          const g = ctx.createLinearGradient(off-r*0.18, -r, off+r*0.18, r);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(off-r*0.18, -r, r*0.36, 2*r);
          ctx.restore();
        }
        break;
      }
      case 'soccer': {
        const a = now*0.0012;
        const gx = x + Math.cos(a)*r*0.5, gy = y + Math.sin(a)*r*0.5 - r*0.2;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.arc(gx, gy, r*0.1, 0, Math.PI*2); ctx.fill();
        break;
      }
      case 'champion': {
        for (let i = 0; i < 3; i++){
          const a = now*0.0015 + i*(Math.PI*2/3);
          const gx = x + Math.cos(a)*r*0.85, gy = y + Math.sin(a)*r*0.85;
          const tw = 0.4 + 0.6*Math.abs(Math.sin(now*0.006 + i));
          ctx.fillStyle = `rgba(255,255,255,${tw})`;
          ctx.beginPath(); ctx.arc(gx, gy, r*0.07, 0, Math.PI*2); ctx.fill();
        }
        break;
      }
      case 'fire': {
        for (let i = 0; i < 4; i++){
          const cyc = ((now*0.0009) + i*0.27) % 1;
          const ex = x + (((i*37) % 7) - 3) * r*0.09;
          const ey = y + r*0.6 - cyc*r*1.6;
          const alpha = (1-cyc) * 0.8;
          ctx.fillStyle = `rgba(255,180,60,${alpha})`;
          ctx.beginPath(); ctx.arc(ex, ey, r*0.06*(1-cyc*0.5), 0, Math.PI*2); ctx.fill();
        }
        break;
      }
      case 'galaxy': {
        const cyc = (now*0.0004) % 1;
        if (cyc < 0.15){
          const t2 = cyc/0.15;
          const sx = x - r + t2*2*r, sy = y - r*0.6 + t2*1.2*r;
          ctx.strokeStyle = `rgba(255,255,255,${(1-t2)*0.8})`;
          ctx.lineWidth = Math.max(0.6, r*0.04);
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx-r*0.3, sy-r*0.18); ctx.stroke();
        }
        break;
      }
      default: break;
    }
    ctx.restore();
  }

  function drawBallShape(ctx, x, y, r, skin, now){
    switch (skin.type){
      case 'soccer': drawSoccerBall(ctx, x, y, r); break;
      case 'disco': drawDiscoBall(ctx, x, y, r, now); break;
      case 'fire': drawFireBall(ctx, x, y, r, now); break;
      case 'galaxy': drawGalaxyBall(ctx, x, y, r, now); break;
      case 'champion': drawChampionBall(ctx, x, y, r, now); break;
      case 'chrome': drawChromeBall(ctx, x, y, r, now); break;
      case 'prism': drawPrismBall(ctx, x, y, r, now); break;
      case 'neon': drawNeonBall(ctx, x, y, r, now); break;
      case 'gem': drawGemBall(ctx, x, y, r, skin.color); break;
      case 'nebula': drawNebulaBall(ctx, x, y, r, skin.color, skin.color2, now); break;
      case 'stripe': drawStripeBall(ctx, x, y, r, skin.color, skin.color2); break;
      case 'dot': drawDotBall(ctx, x, y, r, skin.color, skin.color2); break;
      case 'wave': drawWaveBall(ctx, x, y, r, skin.color, skin.color2, now); break;
      case 'holo': drawHoloBall(ctx, x, y, r, skin.color, now); break;
      case 'metal': drawMetalBall(ctx, x, y, r, skin.color, now); break;
      case 'spark': drawSparkBall(ctx, x, y, r, skin.color, now); break;
      default: drawSolidBall(ctx, x, y, r, skin.color); break;
    }
    addBallFinish(ctx, x, y, r);
    addSkinEffect(ctx, x, y, r, skin, now);
  }

  function draw(now){
    ctx.clearRect(0,0,W,H);
    drawSpaceBackground(now);

    const isBoss = mode === 'single' && LEVELS[currentLevelIndex] && LEVELS[currentLevelIndex].isBoss;

    if (isBoss){
      const grad = ctx.createRadialGradient(W/2,H*0.3,20,W/2,H*0.3,H*0.9);
      grad.addColorStop(0, 'rgba(255,59,92,0.10)');
      grad.addColorStop(1, 'rgba(255,59,92,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
    }

    const speedRatio = Math.max(0, Math.min(1, (currentSpeed - 2) / 9));
    if (speedRatio > 0){
      const vg = ctx.createRadialGradient(W/2,H/2, H*0.35, W/2,H/2, H*0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, `rgba(94,233,214,${(speedRatio*0.16).toFixed(3)})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0,0,W,H);
    }

    stars.forEach(s => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });

    players.forEach(p => {
      for (let i = 0; i < p.trail.length; i++){
        const t2 = p.trail[i];
        const a = (i+1)/p.trail.length;
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(p.skin.color, a*0.18);
        ctx.arc(t2.x, t2.y, p.r*a, 0, Math.PI*2);
        ctx.fill();
      }
    });

    for (const o of obstacles){
      drawObstacle(ctx, o);
    }

    for (const pk of pickups){
      drawAbilityPickup(ctx, pk, now);
    }

    if (pulseFx.length) drawPulseFx(ctx, now);

    players.forEach(p => {
      if (p.shieldActive) drawShieldRing(ctx, p, now);
    });

    players.forEach(p => {
      let alpha = 1;
      if (now < p.invisibleUntil){
        // Mostly-transparent for most of the duration, then switches to the
        // same blink pattern as the respawn-invulnerability alpha below for
        // the last INVIS_BLINK_WINDOW_MS as a "wearing off" warning.
        const remaining = p.invisibleUntil - now;
        alpha = remaining < INVIS_BLINK_WINDOW_MS ? (0.3 + 0.35*Math.sin(now*0.03)) : 0.14;
      } else if (now < p.invulnerableUntil){
        alpha = 0.35 + 0.35*Math.sin(now*0.02);
      }
      const pulse = 18 + 8*Math.sin(now*0.005);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.skin.glow;
      ctx.shadowBlur = pulse;
      drawBallShape(ctx, p.x, p.y, p.r, p.skin, now);
      ctx.restore();
    });

    if (shieldBreakFx.length) drawShieldBreakFx(ctx, now);
    if (activationFx.length) drawActivationFx(ctx, now);
  }

  // Small floating crate showing the same emoji as the matching HUD slot
  // (see ABILITIES[id].icon / #abilityHud) — bobs and gently rocks as it
  // falls so it reads as a pickup rather than a hazard.
  function drawAbilityPickup(ctx, pk, now){
    const bob = Math.sin(now*0.006 + pk.x) * 3;
    const y = pk.y + bob;
    const color = pk.id === 'shield' ? SHIELD_COLOR : pk.id === 'invis' ? INVIS_COLOR : PULSE_COLOR;
    ctx.save();
    ctx.translate(pk.x, y);
    ctx.rotate(Math.sin(now*0.0012 + pk.x) * 0.15);
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 + 6*Math.sin(now*0.005);
    ctx.fillStyle = 'rgba(10,16,26,0.85)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    roundRect(ctx, -pk.r, -pk.r, pk.r*2, pk.r*2, 6);
    ctx.fill();
    ctx.stroke();
    ctx.font = Math.round(pk.r*1.3) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ABILITIES[pk.id].icon, 0, 1);
    ctx.restore();
  }

  // ---------- ABILITY EFFECT RENDERING ----------
  function drawShieldRing(ctx, p, now){
    const r = p.r + 9 + Math.sin(now*0.006)*1.6;
    const rot = now*0.0016;
    ctx.save();
    ctx.shadowColor = SHIELD_COLOR;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = SHIELD_COLOR;
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++){
      const a = rot + i*(Math.PI/3);
      const x = p.x + Math.cos(a)*r, y = p.y + Math.sin(a)*r;
      if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = SHIELD_COLOR;
    ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r*0.72, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  function drawShieldBreakFx(ctx, now){
    shieldBreakFx = shieldBreakFx.filter(fx => now - fx.start < SHIELD_BREAK_MS);
    shieldBreakFx.forEach(fx => {
      const t = (now - fx.start) / SHIELD_BREAK_MS;
      ctx.save();
      ctx.strokeStyle = SHIELD_COLOR;
      ctx.shadowColor = SHIELD_COLOR;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1 - t;
      const shardCount = 10;
      for (let i = 0; i < shardCount; i++){
        const a = i*(Math.PI*2/shardCount) + (i % 2 ? 0.25 : -0.25);
        const dist = 6 + t*30;
        const x1 = fx.x + Math.cos(a)*dist, y1 = fx.y + Math.sin(a)*dist;
        const x2 = fx.x + Math.cos(a)*(dist+9), y2 = fx.y + Math.sin(a)*(dist+9);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawActivationFx(ctx, now){
    activationFx = activationFx.filter(fx => now - fx.start < ACTIVATION_FX_MS);
    activationFx.forEach(fx => {
      const t = (now - fx.start) / ACTIVATION_FX_MS;
      const r = 6 + t*34;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = fx.color;
      ctx.shadowColor = fx.color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3*(1 - t) + 1;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, r, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawPulseFx(ctx, now){
    pulseFx = pulseFx.filter(fx => now - fx.start < PULSE_FX_MS);
    pulseFx.forEach(fx => {
      // Clamped to 0: fx.start is a performance.now() snapshot taken mid-frame
      // (inside activatePulse()/collectAbilityPickup()), which can land a
      // fraction of a millisecond AFTER this frame's rAF timestamp (now) was
      // captured at frame start — without the clamp, t goes briefly negative
      // and ctx.arc() throws "IndexSizeError: radius ... is negative", which
      // silently kills the whole game loop.
      const t = Math.max(0, (now - fx.start) / PULSE_FX_MS);
      const r = t * PULSE_MAX_RADIUS;
      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.strokeStyle = PULSE_COLOR;
      ctx.shadowColor = SHIELD_COLOR;
      ctx.shadowBlur = 26;
      ctx.lineWidth = 8*(1 - t) + 2;
      ctx.beginPath(); ctx.arc(fx.x, fx.y, r, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = (1 - t) * 0.35;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(fx.x, fx.y, r*0.66, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    });
  }

  // ---------- INPUT ----------
  window.addEventListener('keydown', (e) => {
    ensureAudio();
    if (e.key === 'ArrowLeft') keysArrows.left = true;
    if (e.key === 'ArrowRight') keysArrows.right = true;
    if (e.key === 'ArrowUp') keysArrows.up = true;
    if (e.key === 'ArrowDown') keysArrows.down = true;
    if (e.key === 'a' || e.key === 'A') keysWasd.left = true;
    if (e.key === 'd' || e.key === 'D') keysWasd.right = true;
    if (e.key === 'w' || e.key === 'W') keysWasd.up = true;
    if (e.key === 's' || e.key === 'S') keysWasd.down = true;
    if (e.key === '1') activateShield();
    if (e.key === '2') activateInvis();
    if (e.key === '3') activatePulse();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keysArrows.left = false;
    if (e.key === 'ArrowRight') keysArrows.right = false;
    if (e.key === 'ArrowUp') keysArrows.up = false;
    if (e.key === 'ArrowDown') keysArrows.down = false;
    if (e.key === 'a' || e.key === 'A') keysWasd.left = false;
    if (e.key === 'd' || e.key === 'D') keysWasd.right = false;
    if (e.key === 'w' || e.key === 'W') keysWasd.up = false;
    if (e.key === 's' || e.key === 'S') keysWasd.down = false;
  });

  // ---------- MAIN MENU: MODE SELECTOR + PLAY ----------
  // Flat mode picker replacing the old Singleplayer/Multiplayer submenus.
  // "Poziomy" used to live here as a destination option, but now has its own
  // dedicated button in .mm-side-buttons (see index.html) — the carousel is
  // left with only the three modes that actually start a run immediately.
  const MENU_MODE_OPTIONS = [
    { id: 'freeplay', labelKey: 'btn_freeplay', unlockLevel: FEATURE_UNLOCK_LEVELS.freeplay },
    { id: 'coop',     labelKey: 'btn_coop',     unlockLevel: FEATURE_UNLOCK_LEVELS.multiplayer },
    { id: 'versus',   labelKey: 'btn_versus',   unlockLevel: FEATURE_UNLOCK_LEVELS.multiplayer }
  ];
  let menuModeIndex = 0;
  function renderMenuMode(){
    const opt = MENU_MODE_OPTIONS[menuModeIndex];
    const unlocked = level >= opt.unlockLevel;
    if (mmModeLabelEl){
      mmModeLabelEl.textContent = (unlocked ? '' : '🔒 ') + t(opt.labelKey);
      mmModeLabelEl.title = unlocked ? '' : t('mainMenu_locked_level', { n: opt.unlockLevel });
    }
    if (btnPlay) btnPlay.disabled = !unlocked;
  }
  if (mmModePrevBtn) mmModePrevBtn.addEventListener('click', () => {
    menuModeIndex = (menuModeIndex - 1 + MENU_MODE_OPTIONS.length) % MENU_MODE_OPTIONS.length;
    renderMenuMode();
  });
  if (mmModeNextBtn) mmModeNextBtn.addEventListener('click', () => {
    menuModeIndex = (menuModeIndex + 1) % MENU_MODE_OPTIONS.length;
    renderMenuMode();
  });
  // ---------- BOOSTERS: PICKER + LAUNCH ----------
  // Shown right after Play, only for Free mode / Co-op / Versus (Levels has
  // its own dedicated button and skips this entirely, the Daily Challenge
  // has its own separate reward system from pkt 25) — and only if the
  // player actually owns at least one charge, so nobody without boosters
  // ever sees an extra screen between menu and gameplay.
  function anyBoosterOwned(){
    return BOOSTER_IDS.some(id => (boosterInventory[id] || 0) > 0);
  }
  function renderBoosterPicker(){
    if (!boosterListEl) return;
    boosterListEl.innerHTML = '';
    BOOSTER_IDS.forEach(id => {
      const owned = boosterInventory[id] || 0;
      const b = BOOSTERS[id];
      const row = document.createElement('div');
      row.className = 'quest-row';
      const icon = document.createElement('div');
      icon.className = 'quest-icon';
      icon.textContent = b.icon;
      const body = document.createElement('div');
      body.className = 'quest-body';
      const topLine = document.createElement('div');
      topLine.className = 'quest-top-line';
      const name = document.createElement('div');
      name.className = 'quest-name';
      name.textContent = t(b.nameKey) + ' ×' + owned;
      topLine.appendChild(name);
      const desc = document.createElement('div');
      desc.className = 'quest-desc';
      desc.textContent = t(b.descKey);
      body.appendChild(topLine); body.appendChild(desc);
      const btn = document.createElement('button');
      btn.className = 'booster-activate-btn';
      btn.textContent = t('btn_activate');
      btn.disabled = owned <= 0;
      btn.addEventListener('click', () => launchMode(pendingPlayMode, id));
      row.appendChild(icon); row.appendChild(body); row.appendChild(btn);
      boosterListEl.appendChild(row);
    });
  }
  let pendingPlayMode = null;
  // Non-heart boosters are a flat one-charge-per-run spend, deducted the
  // moment the run launches. 'heart' is different — it isn't spent here at
  // all, only marked active; actual hearts are spent progressively on death,
  // see tryHeartRevive().
  function launchMode(modeId, boosterId){
    if (boosterId && boosterId !== 'heart'){
      boosterInventory[boosterId] = Math.max(0, (boosterInventory[boosterId] || 0) - 1);
      saveBoosterInventory();
    }
    activeBooster = boosterId || null;
    if (activeBooster){
      totalBoosterRuns++;
      saveRunCounter('scraper_boosterruns_v1', totalBoosterRuns);
      checkAchievements();
      checkMissions();
    }
    showScreen(null);
    if (modeId === 'freeplay') startFreeplay();
    else startMultiplayer(modeId); // 'coop' | 'versus'
  }
  if (btnStartNoBoosterEl) btnStartNoBoosterEl.addEventListener('click', () => launchMode(pendingPlayMode, null));

  if (btnPlay) btnPlay.addEventListener('click', () => {
    const picked = MENU_MODE_OPTIONS[menuModeIndex].id;
    if (anyBoosterOwned()){
      pendingPlayMode = picked;
      renderBoosterPicker();
      showScreen(boosterScreen);
    } else {
      launchMode(picked, null);
    }
  });

  // ---------- MENU NAVIGATION ----------
  document.getElementById('btnLevels').addEventListener('click', () => {
    currentPage = firstIncompletePage();
    renderLevelGrid();
    showScreen(levelSelect);
  });
  document.getElementById('btnFreeplay').addEventListener('click', () => {
    showScreen(null);
    startFreeplay();
  });
  document.getElementById('btnBackFromSingle').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnShop').addEventListener('click', () => {
    shopTab = 'coin'; // always re-open on the Coins tab, not wherever it was left
    shopIndex = 0;
    renderShop();
    showScreen(shopScreen);
  });
  document.getElementById('btnBackFromShop').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnAchievements').addEventListener('click', () => {
    if (tutorialStep === 2) advanceTutorial(2);
    renderAchievements();
    showScreen(achievementsScreen);
  });
  document.getElementById('btnBackFromAchievements').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnProfile').addEventListener('click', () => {
    renderProfile();
    showScreen(profileScreen);
  });
  document.getElementById('btnBackFromProfile').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnMissions').addEventListener('click', () => {
    renderMissions();
    showScreen(missionsScreen);
  });
  document.getElementById('btnBackFromMissions').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnCrates').addEventListener('click', () => {
    renderCrateShop();
    showScreen(cratesScreen);
  });
  document.getElementById('btnBackFromCrates').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  if (btnChallengeEl) btnChallengeEl.addEventListener('click', () => {
    showScreen(null);
    startChallenge();
  });
  document.getElementById('btnCoop').addEventListener('click', () => {
    showScreen(null);
    startMultiplayer('coop');
  });
  document.getElementById('btnVersus').addEventListener('click', () => {
    showScreen(null);
    startMultiplayer('versus');
  });
  document.getElementById('btnBackFromMulti').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnSettings').addEventListener('click', () => {
    closeDrawer();
    showScreen(settingsScreen);
  });
  document.getElementById('btnBackFromSettings').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  if (btnResetGameEl) btnResetGameEl.addEventListener('click', () => {
    if (confirm(t('reset_confirm'))) resetGame();
  });
  document.getElementById('btnBackFromLevels').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  document.getElementById('btnBackFromExit').addEventListener('click', () => {
    showScreen(mainMenu);
  });

  updateProfileIconButton();
  updateAvatarNameLabel();
  applyStaticTranslations();
  showScreen(mainMenu);
  showGameUI(false);
  checkAchievements();
  checkMissions();
})();
