/**
 * FOOK v3.2 — Precision Variable Income OS
 * Full application controller:
 *  - User Name personalization & dynamic time-based greetings
 *  - Slide-out Sidebar Navigation Drawer
 *  - 5th Mobile Tab: Money Saving Hacks & Financial Alpha
 *  - Restored Country Flags in Currency Selectors
 *  - Live Exchange Rate Sync with fallback offline matrix
 *  - How It Works guide & Notification settings
 *  - Native App Share modal & clipboard fallback
 *  - On-device Holt-Winters ARIMA forecasting & Safe Spend engine
 */

// ═══════════════════════════════════════════
// REALISTIC FREELANCER BASELINE DATA
// ═══════════════════════════════════════════
const DEFAULT_DEMO = {
  settings: {
    userName: 'Raja',
    homeCurrency: 'USD',
    language: 'en',
    privacyMode: false,
    theme: 'dark',
    safeRatePct: 0.70,
    monthlyFixedCommitments: 850,
    overrideAdjustment: 0,
    overrideReason: '',
    notifSunday: true,
    notifVelocity: true,
    onboardingDismissed: false
  },
  streak: { weeks: [true, true, true, false, true, true, false, true], currentWeekDone: false },
  transactions: [
    { id: 'inc_1', date: '2026-08-02', type: 'income', amount: 1450, currency: 'USD', category: 'Freelance',   notes: 'Frontend Dashboard (Milestone 2)', isRecurring: false, isTaxDeductible: false, client: 'Acme Studio (US)' },
    { id: 'inc_2', date: '2026-08-05', type: 'income', amount: 620,  currency: 'EUR', category: 'Freelance',   notes: 'UI/UX Design Sprint', isRecurring: false, isTaxDeductible: false, client: 'Berlin Labs GmbH' },
    { id: 'inc_3', date: '2026-08-10', type: 'income', amount: 65000,currency: 'KES', category: 'Retainer',    notes: 'Infrastructure Retainer', isRecurring: true, isTaxDeductible: false, client: 'SavannaPay Ltd' },
    { id: 'inc_4', date: '2026-08-14', type: 'income', amount: 45000,currency: 'INR', category: 'Consulting',  notes: 'AI Architecture Advisory', isRecurring: false, isTaxDeductible: false, client: 'NexAI Labs' },
    { id: 'inc_5', date: '2026-08-18', type: 'income', amount: 350,  currency: 'USD', category: 'Royalties',   notes: 'UI Kit Digital Sales', isRecurring: false, isTaxDeductible: false, client: 'Gumroad' },
    { id: 'exp_1', date: '2026-08-01', type: 'expense', amount: 650, currency: 'USD', category: 'Housing & Rent',          notes: 'Workspace & Studio Rent', isRecurring: true, isTaxDeductible: false, client: 'Studio Lease' },
    { id: 'exp_2', date: '2026-08-03', type: 'expense', amount: 20,  currency: 'USD', category: 'Software & Subscriptions', notes: 'OpenAI API & ChatGPT Plus', isRecurring: true, isTaxDeductible: true, client: 'OpenAI' },
    { id: 'exp_3', date: '2026-08-04', type: 'expense', amount: 45,  currency: 'USD', category: 'Food & Dining',            notes: 'Weekly Groceries', isRecurring: false, isTaxDeductible: false, client: 'Market' },
    { id: 'exp_4', date: '2026-08-07', type: 'expense', amount: 15,  currency: 'USD', category: 'Software & Subscriptions', notes: 'Figma Professional', isRecurring: true, isTaxDeductible: true, client: 'Figma' },
    { id: 'exp_5', date: '2026-08-09', type: 'expense', amount: 35,  currency: 'USD', category: 'Transport',                notes: 'Client Meeting Transport', isRecurring: false, isTaxDeductible: true, client: 'Transport' },
    { id: 'exp_6', date: '2026-08-12', type: 'expense', amount: 60,  currency: 'USD', category: 'Utilities',               notes: 'Fiber Broadband', isRecurring: true, isTaxDeductible: true, client: 'ISP Fiber' }
  ],
  historicalIncome: [
    { date: '2025-09-15', amount: 2800, currency: 'USD' },
    { date: '2025-10-15', amount: 3400, currency: 'USD' },
    { date: '2025-11-15', amount: 4100, currency: 'USD' },
    { date: '2025-12-15', amount: 2200, currency: 'USD' },
    { date: '2026-01-15', amount: 2600, currency: 'USD' },
    { date: '2026-02-15', amount: 3100, currency: 'USD' },
    { date: '2026-03-15', amount: 3900, currency: 'USD' },
    { date: '2026-04-15', amount: 3600, currency: 'USD' },
    { date: '2026-05-15', amount: 4400, currency: 'USD' },
    { date: '2026-06-15', amount: 3200, currency: 'USD' },
    { date: '2026-07-15', amount: 3800, currency: 'USD' }
  ],
  overrideHistory: []
};

const CLIENT_COLORS = ['#81c995','#78d9ec','#c58af9','#fdd663','#f28b82','#8ab4f8','#f43f5e','#14b8a6'];

// ═══════════════════════════════════════════
// FOOK APPLICATION CLASS
// ═══════════════════════════════════════════
class FookApp {
  constructor() {
    this.nlp          = null;
    this.speechRec    = null;
    this.isRecording  = false;
    this.activeTab    = 'dashboard';
    this.ledgerFilter = 'all';
    this.ledgerSearch = '';
    this.simulatedDelta = 0;
    this.state        = null;
    this.init();
  }

  // ──────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────
  init() {
    this.loadState();
    this.applyTheme(this.state.settings.theme || 'dark');
    this.nlp = new NaiveBayesNLP();
    this.initCurrencySelectors();
    this.bindStaticEvents();
    this.initSpeech();
    this.updateUserGreeting();
    this.render();
  }

  loadState() {
    try {
      const raw = localStorage.getItem('fook_v2_state');
      this.state = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_DEMO));
    } catch(e) {
      this.state = JSON.parse(JSON.stringify(DEFAULT_DEMO));
    }
    this.state.settings         = Object.assign({}, DEFAULT_DEMO.settings, this.state.settings || {});
    this.state.streak           = Object.assign({}, DEFAULT_DEMO.streak, this.state.streak || {});
    this.state.overrideHistory  = this.state.overrideHistory || [];
    this.state.historicalIncome = this.state.historicalIncome || [];
    I18nEngine.setLocale(this.state.settings.language || 'en');
  }

  save() {
    localStorage.setItem('fook_v2_state', JSON.stringify(this.state));
  }

  // ──────────────────────────────────────────
  // USER PERSONALIZATION & GREETINGS
  // ──────────────────────────────────────────
  updateUserGreeting() {
    const name = this.state.settings.userName || 'Raja';
    const hour = new Date().getHours();
    let timeStr = 'Good evening';
    if (hour < 12) timeStr = 'Good morning';
    else if (hour < 17) timeStr = 'Good afternoon';

    this.setEl('top-user-greeting', `${timeStr}, ${name}`);
    this.setEl('greeting-username', name);
    this.setEl('greeting-time', timeStr);
    
    const avatar = document.getElementById('user-avatar');
    if (avatar) avatar.textContent = (name.trim()[0] || 'R').toUpperCase();

    const userInput = document.getElementById('user-name-input');
    if (userInput) userInput.value = name;

    const setInput = document.getElementById('settings-username-field');
    if (setInput) setInput.value = name;
  }

  saveUserName(newName) {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;
    this.state.settings.userName = trimmed;
    this.save();
    this.updateUserGreeting();
    this.toast(`Name updated to ${trimmed}`, 'green');
  }

  // ──────────────────────────────────────────
  // THEME MANAGEMENT (Google Dark / Light)
  // ──────────────────────────────────────────
  applyTheme(theme) {
    this.state.settings.theme = theme;
    const html = document.documentElement;
    html.classList.remove('dark','light');
    html.classList.add(theme);
    const sunIcon  = document.getElementById('icon-sun');
    const moonIcon = document.getElementById('icon-moon');
    const metaTheme = document.getElementById('meta-theme-color');
    if (theme === 'dark') {
      if (sunIcon)  sunIcon.style.display  = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      if (metaTheme) metaTheme.setAttribute('content', '#131314');
    } else {
      if (sunIcon)  sunIcon.style.display  = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      if (metaTheme) metaTheme.setAttribute('content', '#f8f9fa');
    }
    this.save();
  }

  toggleTheme() {
    this.applyTheme(this.state.settings.theme === 'dark' ? 'light' : 'dark');
    this.toast(`Theme set to ${this.state.settings.theme}`, 'cyan');
  }

  // ──────────────────────────────────────────
  // CURRENCY SELECTORS (WITH FLAGS RESTORED)
  // ──────────────────────────────────────────
  initCurrencySelectors() {
    const currencies = CurrencyEngine.getCurrenciesList();
    const hc = this.state.settings.homeCurrency;
    const hdrOpts = currencies.map(c => `<option value="${c.code}" ${c.code === hc ? 'selected' : ''}>${c.flag} ${c.code}</option>`).join('');
    const fullOpts = currencies.map(c => `<option value="${c.code}" ${c.code === hc ? 'selected' : ''}>${c.flag} ${c.code} – ${c.name}</option>`).join('');

    ['home-currency-select', 'settings-currency-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = id === 'home-currency-select' ? hdrOpts : fullOpts;
    });
    const mod = document.getElementById('modal-currency-select');
    if (mod) mod.innerHTML = fullOpts;
  }

  // ──────────────────────────────────────────
  // SIDEBAR NAVIGATION
  // ──────────────────────────────────────────
  openSidebar() {
    document.getElementById('sidebar-drawer')?.classList.add('active');
    document.getElementById('sidebar-overlay')?.classList.add('active');
  }

  closeSidebar() {
    document.getElementById('sidebar-drawer')?.classList.remove('active');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
  }

  // ──────────────────────────────────────────
  // STATIC EVENT BINDINGS
  // ──────────────────────────────────────────
  bindStaticEvents() {
    // Sidebar Drawer Toggles
    document.getElementById('sidebar-open-btn')?.addEventListener('click', () => this.openSidebar());
    document.getElementById('sidebar-close-btn')?.addEventListener('click', () => this.closeSidebar());
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());

    // User Name Saves
    document.getElementById('save-username-btn')?.addEventListener('click', () => {
      const val = document.getElementById('user-name-input')?.value;
      this.saveUserName(val);
    });
    document.getElementById('settings-save-name-btn')?.addEventListener('click', () => {
      const val = document.getElementById('settings-username-field')?.value;
      this.saveUserName(val);
    });

    // Theme & Privacy
    document.getElementById('theme-btn')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('privacy-btn')?.addEventListener('click', () => this.togglePrivacy());

    // Live Currency Sync Button
    document.getElementById('live-rate-sync-btn')?.addEventListener('click', async () => {
      this.toast('Fetching live exchange rates...', 'cyan');
      const res = await CurrencyEngine.syncLiveRates();
      if (res.success) {
        this.toast(`Synced ${res.count} live currency exchange rates`, 'green');
        this.render();
      } else {
        this.toast(`Using offline matrix (Rate sync: ${res.error})`, 'amber');
      }
    });

    // App Share Modals
    const openShare = () => {
      this.closeSidebar();
      this.openModal('share-modal');
    };
    document.getElementById('open-share-modal-btn')?.addEventListener('click', openShare);
    document.getElementById('sidebar-share-btn')?.addEventListener('click', openShare);

    // PWA Installation Handlers
    this.deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const banner = document.getElementById('native-pwa-banner');
      if (banner) banner.style.display = 'block';
    });

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      const badge = document.getElementById('pWA-installed-badge');
      if (badge) badge.style.display = 'block';
    }

    const openInstallModal = () => {
      this.closeSidebar();
      if (this.deferredPrompt) {
        // Direct browser prompt if available
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') {
            this.toast('fook installed to device successfully!', 'green');
          }
          this.deferredPrompt = null;
        });
      } else {
        // Open platform guide modal
        this.openModal('install-modal');
        // Auto select platform tab
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
        this.switchInstallGuide(platform);
      }
    };

    document.getElementById('pwa-install-btn')?.addEventListener('click', openInstallModal);
    document.getElementById('sidebar-install-btn')?.addEventListener('click', openInstallModal);
    document.getElementById('pwa-ios-help-btn')?.addEventListener('click', () => {
      this.openModal('install-modal');
      this.switchInstallGuide('ios');
    });

    document.getElementById('modal-native-install-btn')?.addEventListener('click', () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') {
            this.toast('fook installed successfully!', 'green');
            this.closeModal('install-modal');
          }
          this.deferredPrompt = null;
        });
      }
    });

    // Install Guide Tabs
    document.querySelectorAll('.install-tab-btn[data-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchInstallGuide(btn.dataset.platform);
      });
    });

    document.getElementById('copy-share-link-btn')?.addEventListener('click', () => {
      const text = `fook — Offline-first variable income budgeting for freelancers.\nhttps://github.com/Kimmojiraja/fokk_money_monitoring`;
      navigator.clipboard.writeText(text).then(() => {
        this.toast('Share text copied to clipboard', 'green');
        this.closeModal('share-modal');
      });
    });

    document.getElementById('native-share-btn')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'fook — Variable Income Budgeting',
          text: 'Offline-first variable income budgeting for freelancers with on-device forecasting.',
          url: window.location.href
        }).catch(() => {});
      } else {
        document.getElementById('copy-share-link-btn')?.click();
      }
    });

    // Onboarding Banner Dismiss
    document.getElementById('dismiss-onboarding-btn')?.addEventListener('click', () => {
      this.state.settings.onboardingDismissed = true;
      this.save();
      const banner = document.getElementById('onboarding-banner');
      if (banner) banner.style.display = 'none';
    });

    // Quick Demo Loaders
    const loadDemo = () => {
      this.state = JSON.parse(JSON.stringify(DEFAULT_DEMO));
      this.save();
      this.initCurrencySelectors();
      this.updateUserGreeting();
      this.render();
      this.toast('Freelancer baseline ledger loaded', 'green');
    };
    document.getElementById('quick-demo-btn')?.addEventListener('click', loadDemo);
    document.getElementById('load-demo-btn')?.addEventListener('click', loadDemo);

    // Clean Slate Reset
    document.getElementById('clean-slate-btn')?.addEventListener('click', () => {
      if (confirm('Clear all local records and restart clean?')) {
        this.state.transactions = [];
        this.state.historicalIncome = [];
        this.state.overrideHistory = [];
        this.save();
        this.render();
        this.toast('Local database cleared', 'amber');
      }
    });

    // Desktop, Mobile, and Sidebar Tab Switching
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.sidebar-nav-item[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
        this.closeSidebar();
      });
    });

    // Quick-Add 1-Tap Chips
    document.querySelectorAll('.quick-chip[data-quick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.quick;
        const input = document.getElementById('nl-input');
        if (input) {
          input.value = text;
          this.submitNL();
        }
      });
    });

    // What-If Simulator Slider
    const simSlider = document.getElementById('simulator-slider');
    if (simSlider) {
      simSlider.addEventListener('input', (e) => {
        this.simulatedDelta = parseInt(e.target.value);
        this.updateSimulatorPreview();
      });
    }

    // Modals: Open & Close
    document.querySelectorAll('[data-modal]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal(el.dataset.modal);
      });
    });
    document.querySelectorAll('.modal-close-btn').forEach(el => {
      el.addEventListener('click', () => this.closeModal(el.dataset.modal));
    });
    document.querySelectorAll('.modal-backdrop').forEach(bk => {
      bk.addEventListener('click', (e) => { if (e.target === bk) this.closeModal(bk.id); });
    });

    // Modal Type Tabs
    document.getElementById('type-income-tab')?.addEventListener('click', () => this.setFormType('income'));
    document.getElementById('type-expense-tab')?.addEventListener('click', () => this.setFormType('expense'));

    // Form Submit & Toggles
    document.getElementById('transaction-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitTransaction(e.target);
    });
    this.bindToggle('toggle-recurring', 'check-recurring');
    this.bindToggle('toggle-tax', 'check-taxded');

    // Natural Language Input
    const nlInput = document.getElementById('nl-input');
    nlInput?.addEventListener('input', (e) => this.handleNLPreview(e.target.value));
    nlInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.submitNL(); } });
    document.getElementById('nl-submit')?.addEventListener('click', () => this.submitNL());

    // Voice Input
    document.getElementById('voice-btn')?.addEventListener('click', () => this.toggleVoice());

    // Currency & Language Selectors
    ['home-currency-select', 'settings-currency-select'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        this.state.settings.homeCurrency = e.target.value;
        ['home-currency-select', 'settings-currency-select'].forEach(sid => {
          const s = document.getElementById(sid); if (s) s.value = e.target.value;
        });
        this.save();
        this.render();
      });
    });

    document.getElementById('language-select')?.addEventListener('change', (e) => {
      this.state.settings.language = e.target.value;
      I18nEngine.setLocale(e.target.value);
      this.save();
      this.render();
    });

    // Safe Spending Rate Slider
    const rateSlider = document.getElementById('safe-rate-slider');
    if (rateSlider) {
      rateSlider.value = Math.round((this.state.settings.safeRatePct || 0.7) * 100);
      const rateLabel = document.getElementById('safe-rate-label');
      rateSlider.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (rateLabel) rateLabel.textContent = `${v}%`;
        this.state.settings.safeRatePct = v / 100;
        this.save();
        this.render();
      });
    }

    // Prediction Override Slider
    const slider = document.getElementById('override-slider');
    if (slider) {
      slider.value = this.state.settings.overrideAdjustment || 0;
      slider.addEventListener('input', (e) => this.handleOverrideSlider(e.target.value));
      this.handleOverrideSlider(slider.value);
    }
    document.getElementById('apply-override')?.addEventListener('click', () => this.applyOverride());

    // Ledger Search & Filter
    document.getElementById('ledger-search')?.addEventListener('input', (e) => {
      this.ledgerSearch = e.target.value.toLowerCase();
      this.renderLedger();
    });
    document.querySelectorAll('.filter-pill[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.ledgerFilter = btn.dataset.filter;
        this.renderLedger();
      });
    });

    // Sunday Habit Streak
    document.getElementById('checkin-btn')?.addEventListener('click', () => this.markWeekDone());

    // Push Notification Permission
    document.getElementById('request-notif-perm-btn')?.addEventListener('click', () => {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.toast('Push notifications enabled for Sunday reviews', 'green');
            new Notification('fook OS', { body: 'Weekly variable income check-in reminders are active.' });
          } else {
            this.toast('Notifications permission was not granted', 'amber');
          }
        });
      } else {
        this.toast('Browser notifications not supported', 'amber');
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'T' || e.key === 't') this.toggleTheme();
      if (e.key === 'P' || e.key === 'p') this.togglePrivacy();
    });
  }

  bindToggle(trackId, checkId) {
    const track = document.getElementById(trackId);
    const check = document.getElementById(checkId);
    if (!track || !check) return;
    track.addEventListener('click', () => {
      check.checked = !check.checked;
      track.classList.toggle('on', check.checked);
    });
  }

  // ──────────────────────────────────────────
  // TAB NAVIGATION
  // ──────────────────────────────────────────
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`)?.classList.add('active');

    // Desktop Tab Nav styling
    document.querySelectorAll('.tab-btn[data-tab]').forEach(b => {
      const isActive = b.dataset.tab === tabId;
      b.classList.toggle('active', isActive);
      b.style.background = isActive ? 'var(--accent-green)' : 'transparent';
      b.style.color = isActive ? (document.documentElement.classList.contains('dark') ? '#131314' : '#ffffff') : 'var(--text-muted)';
    });

    // Mobile Bottom Nav styling
    document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });

    // Sidebar Nav styling
    document.querySelectorAll('.sidebar-nav-item[data-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });

    if (tabId === 'ledger')   this.renderLedger();
    if (tabId === 'forecast') this.renderForecastTab();
    if (tabId === 'tax')      this.renderTaxTab();
  }

  // ──────────────────────────────────────────
  // MODAL MANAGEMENT
  // ──────────────────────────────────────────
  openModal(id, presetType = 'income') {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
    const dateInput = m.querySelector('[name="date"]');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    ['toggle-recurring','toggle-tax'].forEach(t => document.getElementById(t)?.classList.remove('on'));
    ['check-recurring','check-taxded'].forEach(c => { const el = document.getElementById(c); if(el) el.checked = false; });
    this.setFormType(presetType);
  }

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
  }

  setFormType(type) {
    const incTab = document.getElementById('type-income-tab');
    const expTab = document.getElementById('type-expense-tab');
    const hidden = document.getElementById('tx-type-hidden');
    if (incTab) incTab.classList.toggle('active', type === 'income');
    if (expTab) expTab.classList.toggle('active', type === 'expense');
    if (hidden) hidden.value = type;
    const catSel = document.getElementById('modal-category');
    if (catSel) {
      catSel.value = (type === 'income') ? 'Freelance' : 'Food & Dining';
    }
  }

  handlePWAInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') {
          this.toast('fook installed to device successfully!', 'green');
          const badge = document.getElementById('pWA-installed-badge');
          if (badge) badge.style.display = 'block';
        }
        this.deferredPrompt = null;
      });
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
      this.switchSettingsPWAGuide(platform);
      this.toast(
        isIOS ? 'Safari: Tap Share icon ⎋ -> Add to Home Screen' :
        isAndroid ? 'Chrome: Tap 3 dots (⋮) -> Install App' :
        'Desktop: Click the install icon (⊕) in address bar',
        'cyan'
      );
    }
  }

  switchSettingsPWAGuide(platform) {
    document.querySelectorAll('.settings-pwa-tab').forEach(btn => {
      const isActive = btn.dataset.guide === platform;
      btn.classList.toggle('active', isActive);
      btn.style.borderColor = isActive ? 'var(--accent-green)' : 'var(--border)';
      btn.style.background = isActive ? 'rgba(129,201,149,0.1)' : 'transparent';
      btn.style.color = isActive ? 'var(--accent-green)' : 'var(--text-muted)';
    });
    document.querySelectorAll('.settings-guide-content').forEach(box => {
      box.style.display = 'none';
    });
    const target = document.getElementById(`settings-guide-android`);
    const activeBox = document.getElementById(`settings-guide-${platform}`);
    if (activeBox) activeBox.style.display = 'block';
  }

  switchInstallGuide(platform) {
    document.querySelectorAll('.install-tab-btn').forEach(btn => {
      const isActive = btn.dataset.platform === platform;
      btn.classList.toggle('active', isActive);
      btn.style.background = isActive ? 'var(--bg-elevated)' : 'transparent';
      btn.style.color = isActive ? 'var(--accent-green)' : 'var(--text-muted)';
    });
    document.querySelectorAll('.install-guide-box').forEach(box => {
      box.style.display = 'none';
    });
    const targetBox = document.getElementById(`guide-${platform}`);
    if (targetBox) targetBox.style.display = 'block';
  }

  // ──────────────────────────────────────────
  // PRIVACY MODE
  // ──────────────────────────────────────────
  togglePrivacy() {
    this.state.settings.privacyMode = !this.state.settings.privacyMode;
    document.body.classList.toggle('privacy-active', this.state.settings.privacyMode);
    const eo = document.getElementById('eye-open');
    const ec = document.getElementById('eye-closed');
    if (eo) eo.style.display = this.state.settings.privacyMode ? 'none'  : 'block';
    if (ec) ec.style.display = this.state.settings.privacyMode ? 'block' : 'none';
    this.save();
    this.toast(this.state.settings.privacyMode ? 'Privacy blur enabled' : 'Privacy blur disabled', 'cyan');
  }

  // ──────────────────────────────────────────
  // WHAT-IF SIMULATOR
  // ──────────────────────────────────────────
  updateSimulatorPreview() {
    const hc = this.state.settings.homeCurrency;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate());

    const histInHome = (this.state.historicalIncome || []).map(h => ({
      date: h.date,
      amount: CurrencyEngine.convert(h.amount, h.currency || 'USD', hc)
    }));

    const forecast = IncomeForecaster.forecastNext3Months(histInHome, 0);
    const baseExpected = forecast.projections[0]?.expected || 3000;
    const simExpected = Math.max(0, baseExpected + this.simulatedDelta);

    const safeCalc = IncomeForecaster.calculateAdaptiveSafeCeiling(
      simExpected,
      simExpected,
      this.state.settings.monthlyFixedCommitments,
      this.state.settings.safeRatePct
    );

    const deltaLabel = document.getElementById('simulator-delta-label');
    if (deltaLabel) {
      const sign = this.simulatedDelta > 0 ? '+' : '';
      deltaLabel.textContent = `${sign}${CurrencyEngine.format(this.simulatedDelta, hc, 0)}`;
      deltaLabel.style.color = this.simulatedDelta > 0 ? 'var(--accent-green)' : this.simulatedDelta < 0 ? 'var(--accent-rose)' : 'var(--text-primary)';
    }

    const simSpendEl = document.getElementById('sim-safe-spend');
    const simDailyEl = document.getElementById('sim-safe-daily');
    if (simSpendEl) simSpendEl.textContent = CurrencyEngine.format(safeCalc.safeCeiling, hc, 0);
    if (simDailyEl) simDailyEl.textContent = `${CurrencyEngine.format(Math.max(0, safeCalc.safeCeiling / daysLeft), hc, 0)}/day`;
  }

  // ──────────────────────────────────────────
  // NATURAL LANGUAGE PARSING & QUICK LOGGING
  // ──────────────────────────────────────────
  handleNLPreview(text) {
    const preview = document.getElementById('nl-preview');
    if (!text || text.trim().length < 3) { if (preview) preview.style.display = 'none'; return; }
    const parsed = this.nlp.parseInput(text);
    if (!parsed || !parsed.amount) { if (preview) preview.style.display = 'none'; return; }
    const curr = CURRENCY_DATABASE[parsed.currency] || CURRENCY_DATABASE.USD;
    const typeColor = parsed.type === 'income' ? 'var(--accent-green)' : 'var(--accent-rose)';
    if (preview) {
      preview.style.display = 'block';
      preview.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span class="badge" style="background:${typeColor}15; color:${typeColor}; border-color:${typeColor}30;">${parsed.type === 'income' ? '+ Income' : '- Expense'}</span>
          <span class="num" style="font-size:14px; font-weight:800; color:var(--text-primary);">${curr.symbol} ${parsed.amount.toLocaleString()}</span>
          <span class="badge badge-neutral">${parsed.category}</span>
          ${parsed.isTaxDeductible ? '<span class="badge badge-amber">Tax-Ded.</span>' : ''}
          ${parsed.isRecurring ? '<span class="badge badge-cyan">Retainer</span>' : ''}
          <button id="confirm-nl" class="btn btn-primary btn-sm" style="margin-left:auto;">Confirm &amp; Log</button>
        </div>
      `;
      document.getElementById('confirm-nl')?.addEventListener('click', () => this.submitNL());
    }
  }

  submitNL() {
    const input = document.getElementById('nl-input');
    const text = input?.value?.trim();
    if (!text) return;
    const parsed = this.nlp.parseInput(text);
    if (!parsed || !parsed.amount || parsed.amount <= 0) {
      this.toast('Specify an amount — e.g. "1450 USD from Upwork"', 'amber');
      return;
    }
    const tx = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...parsed,
      client: parsed.type === 'income' ? (parsed.notes || 'Direct') : 'General'
    };
    this.state.transactions.unshift(tx);
    this.save();
    if (input) input.value = '';
    const preview = document.getElementById('nl-preview');
    if (preview) preview.style.display = 'none';
    this.toast(`Recorded: ${tx.type === 'income' ? '+' : '-'}${CurrencyEngine.format(tx.amount, tx.currency)} (${tx.category})`, tx.type === 'income' ? 'green' : 'amber');
    this.render();
  }

  submitTransaction(form) {
    const fd = new FormData(form);
    const amount = parseFloat(fd.get('amount'));
    if (!amount || amount <= 0) { this.toast('Enter a valid amount', 'rose'); return; }
    const type = document.getElementById('tx-type-hidden')?.value || 'income';
    const tx = {
      id:              'tx_' + Date.now(),
      date:            fd.get('date') || new Date().toISOString().split('T')[0],
      type,
      amount,
      currency:        fd.get('currency') || this.state.settings.homeCurrency,
      category:        fd.get('category'),
      notes:           fd.get('notes') || '',
      isRecurring:     document.getElementById('check-recurring')?.checked || false,
      isTaxDeductible: document.getElementById('check-taxded')?.checked || false,
      client:          fd.get('notes') || ''
    };
    this.state.transactions.unshift(tx);
    this.save();
    this.closeModal('transaction-modal');
    form.reset();
    this.toast(`Saved: ${tx.type === 'income' ? '+' : '-'}${CurrencyEngine.format(tx.amount, tx.currency)}`, 'green');
    this.render();
  }

  deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this.save();
    this.render();
    if (this.activeTab === 'ledger') this.renderLedger();
    this.toast('Transaction removed', 'rose');
  }

  // ──────────────────────────────────────────
  // PREDICTION OVERRIDE
  // ──────────────────────────────────────────
  handleOverrideSlider(val) {
    const v = parseInt(val);
    const label = document.getElementById('override-pct-label');
    if (label) {
      label.textContent = v > 0 ? `+${v}%` : `${v}%`;
      label.style.color = v > 0 ? 'var(--accent-green)' : v < 0 ? 'var(--accent-rose)' : 'var(--text-primary)';
    }
    const hc = this.state.settings.homeCurrency;
    const histInHome = (this.state.historicalIncome || []).map(h => ({ date: h.date, amount: CurrencyEngine.convert(h.amount, h.currency || 'USD', hc) }));
    const forecast = IncomeForecaster.forecastNext3Months(histInHome, 0);
    const baseExpected = forecast.projections[0]?.expected || 3000;
    const adjusted = Math.round(baseExpected * (1 + v / 100));
    const resultEl = document.getElementById('override-result');
    if (resultEl) resultEl.textContent = CurrencyEngine.format(adjusted, hc);
  }

  applyOverride() {
    const val = parseInt(document.getElementById('override-slider')?.value || '0');
    const reason = document.getElementById('override-reason')?.value || '';
    this.state.settings.overrideAdjustment = val;
    this.state.settings.overrideReason = reason;
    this.state.overrideHistory.unshift({ date: new Date().toISOString().split('T')[0], adjustment: val, reason });
    this.save();
    this.renderForecastTab();
    this.toast(`Forecast override: ${val > 0 ? '+' : ''}${val}%`, 'cyan');
    this.render();
  }

  // ──────────────────────────────────────────
  // SUNDAY HABIT STREAK
  // ──────────────────────────────────────────
  markWeekDone() {
    this.state.streak.currentWeekDone = true;
    const dots = this.state.streak.weeks || [];
    dots.shift();
    dots.push(true);
    this.state.streak.weeks = dots;
    this.save();
    this.renderStreak();
    this.toast('Weekly check-in logged', 'green');
  }

  // ──────────────────────────────────────────
  // SPEECH / VOICE
  // ──────────────────────────────────────────
  initSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    this.speechRec = new SR();
    this.speechRec.continuous = false;
    this.speechRec.interimResults = false;
    this.speechRec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const input = document.getElementById('nl-input');
      if (input) { input.value = t; input.dispatchEvent(new Event('input')); }
      this.stopVoice();
    };
    this.speechRec.onend = () => this.stopVoice();
    this.speechRec.onerror = () => this.stopVoice();
  }

  toggleVoice() {
    if (!this.speechRec) { this.toast('Voice recognition not supported in browser', 'amber'); return; }
    if (this.isRecording) { this.speechRec.stop(); this.stopVoice(); return; }
    this.isRecording = true;
    this.speechRec.start();
    const w = document.getElementById('voice-waves');
    if (w) w.style.display = 'flex';
  }

  stopVoice() {
    this.isRecording = false;
    const w = document.getElementById('voice-waves');
    if (w) w.style.display = 'none';
  }

  // ──────────────────────────────────────────
  // TOAST NOTIFICATIONS (Sharp)
  // ──────────────────────────────────────────
  toast(msg, type = 'green') {
    const colorMap = { green: 'var(--accent-green)', cyan: 'var(--accent-cyan)', amber: 'var(--accent-amber)', rose: 'var(--accent-rose)' };
    const color = colorMap[type] || colorMap.green;
    const root = document.getElementById('toast-root') || document.body;
    const el = document.createElement('div');
    el.style.cssText = `background:var(--bg-elevated); color:var(--text-primary); border:1px solid var(--border);
      border-left:3px solid ${color}; padding:9px 15px; border-radius:var(--radius-xs);
      font-size:12.5px; font-weight:600; box-shadow:var(--shadow-card);
      display:flex; align-items:center; gap:8px; max-width:min(360px,88vw); pointer-events:auto;
      opacity:0; transform:translateY(6px); transition:opacity 0.15s, transform 0.15s; white-space:normal;`;
    el.innerHTML = `<span style="width:6px;height:6px;background:${color};flex-shrink:0;"></span>${msg}`;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 10);
    setTimeout(() => {
      el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 200);
    }, 3000);
  }

  // ──────────────────────────────────────────
  // MAIN REACTIVE RENDER CYCLE
  // ──────────────────────────────────────────
  render() {
    const hc = this.state.settings.homeCurrency;
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay  = now.getDate();
    const daysLeft    = Math.max(1, daysInMonth - currentDay);

    const thisMonth = this.state.transactions.filter(t => t.date.startsWith(monthPrefix));
    let actualIncome = 0, actualSpend = 0, knownRecurring = 0;
    thisMonth.forEach(t => {
      const v = CurrencyEngine.convert(t.amount, t.currency, hc);
      if (t.type === 'income') { actualIncome += v; if (t.isRecurring) knownRecurring += v; }
      else actualSpend += v;
    });

    const histInHome = (this.state.historicalIncome || []).map(h => ({
      date: h.date,
      amount: CurrencyEngine.convert(h.amount, h.currency || 'USD', hc)
    }));

    const forecast = IncomeForecaster.forecastNext3Months(histInHome, knownRecurring);
    const overrideMultiplier = 1 + (this.state.settings.overrideAdjustment || 0) / 100;
    const expectedMonthTotal = Math.max(actualIncome, (forecast.projections[0]?.expected || 3000) * overrideMultiplier);

    const safeCalc = IncomeForecaster.calculateAdaptiveSafeCeiling(
      actualIncome,
      expectedMonthTotal,
      this.state.settings.monthlyFixedCommitments,
      this.state.settings.safeRatePct
    );
    const safeCeiling = safeCalc.safeCeiling;
    const remaining = safeCeiling - actualSpend;
    const burnPerDay = currentDay > 0 ? actualSpend / currentDay : 0;
    const safeDaily  = Math.max(0, remaining / daysLeft);
    const pacingPct  = safeCeiling > 0 ? (actualSpend / safeCeiling) : 0;

    const histAmts = histInHome.map(h => h.amount).filter(v => v > 0);
    const histMean = histAmts.length ? histAmts.reduce((a,b)=>a+b,0)/histAmts.length : 0;
    const histSD   = histAmts.length > 1 ? Math.sqrt(histAmts.reduce((s,v) => s + Math.pow(v - histMean, 2), 0) / histAmts.length) : 0;
    const cv       = histMean > 0 ? Math.round((histSD / histMean) * 100) : 0;

    const runwayDays = burnPerDay > 0 ? Math.floor(remaining / burnPerDay) : 999;
    const safeToInvest = Math.max(0, remaining - (burnPerDay * daysLeft));

    const savingsRate  = actualIncome > 0 ? Math.min(100, Math.round(((actualIncome - actualSpend) / actualIncome) * 100)) : 0;
    const allClients   = [...new Set(this.state.transactions.filter(t => t.type === 'income').map(t => t.client).filter(Boolean))].length;
    const diversifyScore = Math.min(100, allClients * 20);
    const accuracyScore  = forecast.confidenceScore || 70;
    const healthScore    = Math.round((savingsRate * 0.4) + (diversifyScore * 0.3) + (accuracyScore * 0.3));

    // ── HERO KPIS ──
    this.setEl('hero-safe-amount', CurrencyEngine.format(remaining, hc, 0));
    this.setEl('hero-spent', CurrencyEngine.format(actualSpend, hc, 0));
    this.setEl('hero-daily-allowance', `${CurrencyEngine.format(safeDaily, hc, 0)}/day`);
    this.setEl('hero-days', `${daysLeft} days`);
    this.setEl('hero-actual-income', CurrencyEngine.format(actualIncome, hc, 0));

    // Predicted Pill
    const p0 = forecast.projections[0];
    const predPill = document.getElementById('hero-predicted-pill');
    if (predPill && p0) {
      predPill.innerHTML = `<span class="badge badge-cyan" style="font-size:10.5px; font-family:'JetBrains Mono';">Expected: ${CurrencyEngine.format(p0.conservative, hc, 0)} – ${CurrencyEngine.format(p0.optimistic, hc, 0)}</span>`;
    }

    // Radial Gauge Ring
    const gauge = document.getElementById('gauge-ring');
    const gaugePct = document.getElementById('gauge-pct');
    if (gauge && gaugePct) {
      const pct = Math.min(100, Math.round(pacingPct * 100));
      const C = 175.9;
      gauge.style.strokeDashoffset = C - (pct / 100) * C;
      gaugePct.textContent = `${pct}%`;
      const color = pct > 90 ? 'var(--accent-rose)' : pct > 70 ? 'var(--accent-amber)' : 'var(--accent-green)';
      gauge.setAttribute('stroke', color);
      gaugePct.style.color = color;
    }

    // Pacing Badge
    const badge = document.getElementById('hero-pacing-badge');
    const badgeText = document.getElementById('badge-text');
    if (badge && badgeText) {
      if (remaining < 0) { badge.className = 'badge badge-rose'; badgeText.textContent = 'Ceiling Exceeded'; }
      else if (pacingPct > 0.85) { badge.className = 'badge badge-amber'; badgeText.textContent = 'High Velocity'; }
      else { badge.className = 'badge badge-green'; badgeText.textContent = 'Normal Velocity'; }
    }

    // Doom Mode Alert
    const doom = document.getElementById('doom-banner');
    if (doom) {
      if (remaining < 0 || (burnPerDay > 0 && runwayDays < 5)) {
        doom.style.display = 'block';
        this.setEl('doom-message', remaining < 0
          ? `Spending exceeds safe ceiling by ${CurrencyEngine.format(Math.abs(remaining), hc, 0)}.`
          : `Safe buffer runs out in ${runwayDays} days at current daily pace.`
        );
      } else {
        doom.style.display = 'none';
      }
    }

    // Volatility Index
    this.setEl('volatility-cv', `${cv}%`);
    const vBadge = document.getElementById('volatility-badge');
    const vBar   = document.getElementById('volatility-bar');
    if (vBadge) {
      if (cv < 20) { vBadge.className = 'badge badge-green'; vBadge.textContent = 'Stable'; }
      else if (cv < 40) { vBadge.className = 'badge badge-cyan'; vBadge.textContent = 'Moderate'; }
      else if (cv < 60) { vBadge.className = 'badge badge-amber'; vBadge.textContent = 'Volatile'; }
      else { vBadge.className = 'badge badge-rose'; vBadge.textContent = 'High'; }
    }
    if (vBar) vBar.style.width = `${Math.min(100, cv)}%`;

    // Health Score
    this.setEl('health-score-num', `${healthScore}`);
    const hBar = document.getElementById('health-bar');
    if (hBar) hBar.style.width = `${healthScore}%`;

    // Runway
    this.setEl('runway-days', runwayDays >= 999 ? 'Infinite' : `${runwayDays} days`);
    const rBadge = document.getElementById('runway-badge');
    if (rBadge) {
      if (runwayDays >= 999) { rBadge.className = 'badge badge-green'; rBadge.textContent = 'Infinite'; }
      else if (runwayDays > 15) { rBadge.className = 'badge badge-cyan'; rBadge.textContent = 'Safe'; }
      else if (runwayDays > 7) { rBadge.className = 'badge badge-amber'; rBadge.textContent = 'Caution'; }
      else { rBadge.className = 'badge badge-rose'; rBadge.textContent = 'Critical'; }
    }
    this.setEl('safe-invest', CurrencyEngine.format(safeToInvest, hc, 0));

    // Render Subcomponents
    this.updateSimulatorPreview();
    this.renderStreak();
    this.renderPareto(hc);
    this.renderAnomalies(hc);
    this.renderCategoryGrid(thisMonth, safeCeiling, hc);

    // Refresh Active Tab
    if (this.activeTab === 'forecast') this.renderForecastTab();
    if (this.activeTab === 'ledger')   this.renderLedger();
    if (this.activeTab === 'tax')      this.renderTaxTab();
  }

  // ──────────────────────────────────────────
  // STREAK HABIT RENDER
  // ──────────────────────────────────────────
  renderStreak() {
    const weeks = this.state.streak.weeks || Array(8).fill(false);
    const dotsEl = document.getElementById('streak-dots');
    if (dotsEl) {
      dotsEl.innerHTML = weeks.map((done, i) => {
        const isLast = i === weeks.length - 1;
        const cls = done ? 'done' : isLast ? 'today' : '';
        return `<div class="streak-dot ${cls}" title="Week ${i+1}"></div>`;
      }).join('');
    }
    const consecutiveStreak = [...weeks].reverse().indexOf(false);
    const streakCount = consecutiveStreak === -1 ? weeks.length : consecutiveStreak;
    this.setEl('streak-count-badge', `${streakCount} week${streakCount !== 1 ? 's' : ''}`);
    const msgEl = document.getElementById('streak-message');
    if (msgEl) {
      const name = this.state.settings.userName || 'Raja';
      if (streakCount >= 6) msgEl.textContent = `${name}, your ${streakCount}-week streak is active. Excellent discipline!`;
      else if (streakCount >= 3) msgEl.textContent = `${name}, ${streakCount} weeks consistent. Stable reserve tracking.`;
      else if (this.state.streak.currentWeekDone) msgEl.textContent = `Weekly check-in complete. Next review on Sunday.`;
      else msgEl.textContent = `Check your safe spending ceiling this Sunday to maintain habit.`;
    }
  }

  // ──────────────────────────────────────────
  // PARETO REVENUE ANALYSIS
  // ──────────────────────────────────────────
  renderPareto(hc) {
    const container = document.getElementById('pareto-container');
    if (!container) return;
    const incomeByClient = {};
    this.state.transactions.filter(t => t.type === 'income').forEach(t => {
      const key = t.client || t.notes || 'Direct Clients';
      incomeByClient[key] = (incomeByClient[key] || 0) + CurrencyEngine.convert(t.amount, t.currency, hc);
    });
    const sorted = Object.entries(incomeByClient).sort((a,b) => b[1] - a[1]);
    if (!sorted.length) {
      container.innerHTML = '<p style="font-size:11.5px; color:var(--text-muted); padding:6px 0;">No income records logged yet</p>';
      return;
    }
    const total = sorted.reduce((s, [,v]) => s + v, 0);
    container.innerHTML = sorted.slice(0, 5).map(([client, amount], i) => {
      const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
      const color = CLIENT_COLORS[i % CLIENT_COLORS.length];
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px; font-size:11.5px;">
            <span style="font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:62%;">${client}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="num blur-private" style="color:var(--text-secondary); font-size:11.5px;">${CurrencyEngine.format(amount, hc, 0)}</span>
              <span style="font-size:10.5px; font-weight:800; font-family:'JetBrains Mono'; color:${color}; min-width:28px; text-align:right;">${pct}%</span>
            </div>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
        </div>
      `;
    }).join('');
  }

  // ──────────────────────────────────────────
  // ANOMALY DETECTOR
  // ──────────────────────────────────────────
  renderAnomalies(hc) {
    const container = document.getElementById('anomaly-container');
    if (!container) return;
    const alerts = AnomalyDetector.detectAnomalies(this.state.transactions, hc);
    if (!alerts.length) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; padding:8px 10px; background:rgba(129, 201, 149, 0.08); border:1px solid rgba(129, 201, 149, 0.2);">
          <svg width="13" height="13" fill="none" stroke="var(--accent-green)" viewBox="0 0 24 24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style="font-size:11.5px; font-weight:600; color:var(--accent-green);">No statistical spending anomalies detected.</span>
        </div>
      `;
      return;
    }
    container.innerHTML = alerts.map(a => `
      <div style="display:flex; align-items:flex-start; gap:8px; padding:8px 10px; background:rgba(253, 214, 99, 0.08); border:1px solid rgba(253, 214, 99, 0.2); margin-bottom:5px;">
        <svg width="13" height="13" fill="none" stroke="var(--accent-amber)" viewBox="0 0 24 24" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p style="font-size:11.5px; color:var(--accent-amber); line-height:1.3;">${a.message}</p>
      </div>
    `).join('');
  }

  // ──────────────────────────────────────────
  // CATEGORY CEILINGS
  // ──────────────────────────────────────────
  renderCategoryGrid(thisMonthTx, safeCeiling, hc) {
    const container = document.getElementById('category-ceilings');
    if (!container) return;
    const weights = {
      'Housing & Rent': 0.35, 'Food & Dining': 0.20, 'Software & Subscriptions': 0.10,
      'Transport': 0.08, 'Utilities': 0.07, 'Equipment & Tech': 0.10,
      'Taxes & Legal': 0.05, 'Health & Fitness': 0.05
    };
    const catSpend = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      catSpend[t.category] = (catSpend[t.category] || 0) + CurrencyEngine.convert(t.amount, t.currency, hc);
    });
    container.innerHTML = Object.entries(weights).map(([cat, w]) => {
      const cap   = Math.round(safeCeiling * w);
      const spent = Math.round(catSpend[cat] || 0);
      const pct   = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
      const over  = spent > cap;
      const color = over ? 'var(--accent-rose)' : pct > 75 ? 'var(--accent-amber)' : 'var(--accent-green)';
      return `
        <div class="card" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:600; color:var(--text-primary);">${cat}</span>
            ${over ? '<span class="badge badge-rose" style="font-size:8.5px;">Over</span>' : ''}
          </div>
          <div class="progress-track" style="margin-bottom:6px;"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:10.5px;">
            <span style="color:${color}; font-family:'JetBrains Mono'; font-weight:700;" class="blur-private">${CurrencyEngine.format(spent, hc, 0)}</span>
            <span style="color:var(--text-muted);" class="blur-private">/ ${CurrencyEngine.format(cap, hc, 0)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ──────────────────────────────────────────
  // FORECAST TAB
  // ──────────────────────────────────────────
  renderForecastTab() {
    const hc = this.state.settings.homeCurrency;
    const histInHome = (this.state.historicalIncome || []).map(h => ({
      date: h.date,
      amount: CurrencyEngine.convert(h.amount, h.currency || 'USD', hc)
    }));
    const overrideMultiplier = 1 + (this.state.settings.overrideAdjustment || 0) / 100;
    const forecast = IncomeForecaster.forecastNext3Months(histInHome, 0);
    forecast.projections = forecast.projections.map(p => ({
      ...p,
      conservative: Math.round(p.conservative * overrideMultiplier),
      expected:      Math.round(p.expected * overrideMultiplier),
      optimistic:    Math.round(p.optimistic * overrideMultiplier),
      safeSpendTarget: Math.round(p.safeSpendTarget * overrideMultiplier)
    }));

    const confBadge = document.getElementById('forecast-confidence-badge');
    if (confBadge) {
      confBadge.textContent = `${forecast.confidenceScore}% Confidence`;
      confBadge.className = forecast.confidenceScore >= 80 ? 'badge badge-green' : 'badge badge-cyan';
    }

    const colors = ['var(--accent-green)', 'var(--accent-cyan)', 'var(--accent-violet)'];
    const cards = document.getElementById('forecast-cards');
    if (cards) {
      cards.innerHTML = forecast.projections.map((p, i) => `
        <div class="card" style="padding:16px; border-top:3px solid ${colors[i]};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <p style="font-size:13px; font-weight:800; color:var(--text-primary);">${p.monthName}</p>
              <p style="font-size:10.5px; font-weight:600; color:var(--text-muted); margin-top:1px;">${p.notes}</p>
            </div>
            ${this.state.settings.overrideAdjustment !== 0
              ? `<span class="badge badge-violet" style="font-size:8.5px;">Override ${this.state.settings.overrideAdjustment > 0 ? '+' : ''}${this.state.settings.overrideAdjustment}%</span>`
              : ''}
          </div>
          <div class="space-y-2" style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:11.5px; padding:4px 0; border-bottom:1px solid var(--border);">
              <span style="color:var(--text-muted);">Conservative (P20)</span>
              <span class="num blur-private" style="color:var(--text-secondary);">${CurrencyEngine.format(p.conservative, hc, 0)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; padding:4px 0; border-bottom:1px solid var(--border); font-weight:700;">
              <span style="color:${colors[i]};">Expected Target</span>
              <span class="num blur-private" style="color:var(--text-primary); font-size:13px;">${CurrencyEngine.format(p.expected, hc, 0)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; padding:4px 0;">
              <span style="color:var(--text-muted);">Optimistic (P80)</span>
              <span class="num blur-private" style="color:var(--text-secondary);">${CurrencyEngine.format(p.optimistic, hc, 0)}</span>
            </div>
          </div>
          <div style="padding:8px 10px; background:var(--bg-input); border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; font-size:11.5px;">
              <span style="color:var(--text-secondary);">Safe Spend Target</span>
              <span class="num c-green blur-private" style="font-weight:800;">${CurrencyEngine.format(p.safeSpendTarget, hc, 0)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Accuracy Tracker
    const accuracyEl = document.getElementById('accuracy-tracker');
    if (accuracyEl && histInHome.length >= 2) {
      const last3 = histInHome.slice(-3).reverse();
      accuracyEl.innerHTML = last3.map(h => {
        const date = new Date(h.date);
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--bg-input); border:1px solid var(--border);">
            <div>
              <p style="font-size:11.5px; font-weight:700; color:var(--text-primary);">${monthName}</p>
              <p style="font-size:10px; color:var(--text-muted);">Actual logged</p>
            </div>
            <p class="num blur-private" style="font-size:12.5px; font-weight:800; color:var(--accent-green);">${CurrencyEngine.format(h.amount, hc, 0)}</p>
          </div>
        `;
      }).join('');
    }
  }

  // ──────────────────────────────────────────
  // LEDGER TAB
  // ──────────────────────────────────────────
  renderLedger() {
    const tbody = document.getElementById('ledger-tbody');
    const mList = document.getElementById('ledger-mobile-list');
    const hc = this.state.settings.homeCurrency;

    let txs = [...this.state.transactions];
    if (this.ledgerFilter === 'income')    txs = txs.filter(t => t.type === 'income');
    if (this.ledgerFilter === 'expense')   txs = txs.filter(t => t.type === 'expense');
    if (this.ledgerFilter === 'recurring') txs = txs.filter(t => t.isRecurring);
    if (this.ledgerFilter === 'tax')       txs = txs.filter(t => t.isTaxDeductible);
    if (this.ledgerSearch) {
      const q = this.ledgerSearch;
      txs = txs.filter(t =>
        (t.notes||'').toLowerCase().includes(q) ||
        (t.category||'').toLowerCase().includes(q) ||
        (t.client||'').toLowerCase().includes(q) ||
        t.date.includes(q)
      );
    }

    if (!txs.length) {
      const emptyMsg = '<p style="text-align:center; padding:24px; color:var(--text-muted); font-size:12px;">No transactions match criteria.</p>';
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted); font-size:12px;">No transactions found.</td></tr>`;
      if (mList) mList.innerHTML = emptyMsg;
      return;
    }

    // Desktop Table View
    if (tbody) {
      tbody.innerHTML = txs.map(t => {
        const isIncome  = t.type === 'income';
        const homeVal   = CurrencyEngine.convert(t.amount, t.currency, hc);
        const isForeign = t.currency.toUpperCase() !== hc.toUpperCase();
        const typeColor = isIncome ? 'var(--accent-green)' : 'var(--accent-rose)';
        return `
          <tr>
            <td style="color:var(--text-muted); font-family:'JetBrains Mono'; font-size:11.5px; white-space:nowrap;">${t.date}</td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                <span style="font-size:11.5px; font-weight:700; color:${typeColor};">${isIncome?'+':'-'} ${t.category}</span>
                ${t.isRecurring ? '<span class="badge badge-cyan" style="font-size:8.5px;">Retainer</span>' : ''}
                ${t.isTaxDeductible ? '<span class="badge badge-amber" style="font-size:8.5px;">Tax</span>' : ''}
              </div>
            </td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:var(--text-primary);">${t.notes || '-'}</td>
            <td style="text-align:right;"><span class="num blur-private" style="font-size:12.5px; font-weight:800; color:${typeColor};">${isIncome?'+':'-'}${CurrencyEngine.format(t.amount, t.currency)}</span></td>
            <td style="text-align:right;"><span class="num blur-private" style="font-size:11.5px; color:var(--text-secondary);">${isForeign ? CurrencyEngine.format(homeVal, hc) : '-'}</span></td>
            <td style="text-align:right;">
              <button onclick="window.fookApp.deleteTransaction('${t.id}')" class="btn btn-ghost btn-icon" style="color:var(--text-muted); min-width:26px; min-height:26px;" title="Delete">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Mobile Card Stack View
    if (mList) {
      mList.innerHTML = txs.map(t => {
        const isIncome  = t.type === 'income';
        const homeVal   = CurrencyEngine.convert(t.amount, t.currency, hc);
        const isForeign = t.currency.toUpperCase() !== hc.toUpperCase();
        const typeColor = isIncome ? 'var(--accent-green)' : 'var(--accent-rose)';
        return `
          <div class="ledger-row-card">
            <div style="width:6px; height:6px; background:${typeColor}; margin-top:5px; flex-shrink:0;"></div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <div style="min-width:0;">
                  <p style="font-size:12.5px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.notes || t.category}</p>
                  <p style="font-size:11px; color:var(--text-muted); margin-top:1px;">${t.category} · ${t.date}</p>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                  <p class="num blur-private" style="font-size:13.5px; font-weight:800; color:${typeColor};">${isIncome?'+':'-'}${CurrencyEngine.format(t.amount, t.currency)}</p>
                  ${isForeign ? `<p class="num blur-private" style="font-size:10.5px; color:var(--text-muted);">${CurrencyEngine.format(homeVal, hc)}</p>` : ''}
                </div>
              </div>
              <div style="display:flex; gap:4px; margin-top:4px; align-items:center;">
                ${t.isRecurring ? '<span class="badge badge-cyan" style="font-size:8.5px;">Retainer</span>' : ''}
                ${t.isTaxDeductible ? '<span class="badge badge-amber" style="font-size:8.5px;">Tax</span>' : ''}
                <button onclick="window.fookApp.deleteTransaction('${t.id}')" style="margin-left:auto; background:none; border:none; cursor:pointer; color:var(--text-muted); padding:3px;" title="Delete">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ──────────────────────────────────────────
  // TAX TAB
  // ──────────────────────────────────────────
  renderTaxTab() {
    const hc = this.state.settings.homeCurrency;
    let gross = 0, deductible = 0;
    const incomeByCategory = {}, dedByCategory = {};

    this.state.transactions.forEach(t => {
      const v = CurrencyEngine.convert(t.amount, t.currency, hc);
      if (t.type === 'income') {
        gross += v;
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + v;
      } else if (t.isTaxDeductible) {
        deductible += v;
        dedByCategory[t.category] = (dedByCategory[t.category] || 0) + v;
      }
    });

    this.setEl('tax-gross', CurrencyEngine.format(gross, hc));
    this.setEl('tax-deductions', CurrencyEngine.format(deductible, hc));
    this.setEl('tax-net', CurrencyEngine.format(Math.max(0, gross - deductible), hc));

    const dedBreakdown = document.getElementById('tax-deductible-breakdown');
    if (dedBreakdown) {
      const sorted = Object.entries(dedByCategory).sort((a,b) => b[1]-a[1]);
      if (!sorted.length) { dedBreakdown.innerHTML = '<p class="c-muted" style="font-size:11.5px;">No tax deductible expenses recorded.</p>'; }
      else {
        const total = sorted.reduce((s,[,v]) => s+v, 0);
        dedBreakdown.innerHTML = sorted.map(([cat, amt]) => {
          const pct = total > 0 ? Math.round((amt/total)*100) : 0;
          return `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
            <span style="font-size:12px; color:var(--text-primary); font-weight:600;">${cat}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:10.5px; color:var(--text-muted);">${pct}%</span>
              <span class="num c-amber blur-private" style="font-weight:800; font-size:12px;">${CurrencyEngine.format(amt, hc)}</span>
            </div>
          </div>`;
        }).join('');
      }
    }

    const incBreakdown = document.getElementById('tax-income-breakdown');
    if (incBreakdown) {
      const sorted = Object.entries(incomeByCategory).sort((a,b) => b[1]-a[1]);
      if (!sorted.length) { incBreakdown.innerHTML = '<p class="c-muted" style="font-size:11.5px;">No income recorded.</p>'; }
      else {
        const total = sorted.reduce((s,[,v]) => s+v, 0);
        incBreakdown.innerHTML = sorted.map(([cat, amt], i) => {
          const pct = total > 0 ? Math.round((amt/total)*100) : 0;
          const color = CLIENT_COLORS[i % CLIENT_COLORS.length];
          return `<div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:11.5px;">
              <span style="color:var(--text-primary); font-weight:600;">${cat}</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--text-muted); font-size:10.5px;">${pct}%</span>
                <span class="num blur-private" style="font-weight:800; color:${color}; font-size:11.5px;">${CurrencyEngine.format(amt, hc)}</span>
              </div>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
          </div>`;
        }).join('');
      }
    }
  }

  // ──────────────────────────────────────────
  // EXPORTS & BACKUPS
  // ──────────────────────────────────────────
  exportCSV() {
    const hc = this.state.settings.homeCurrency;
    let csv = 'ID,Date,Type,Category,Original Amount,Currency,Home Amount,Home Currency,Notes,Client,Recurring,Tax Deductible\n';
    this.state.transactions.forEach(t => {
      const hv = CurrencyEngine.convert(t.amount, t.currency, hc).toFixed(2);
      csv += `"${t.id}","${t.date}","${t.type}","${t.category}",${t.amount},"${t.currency}",${hv},"${hc}","${(t.notes||'').replace(/"/g,'""')}","${(t.client||'').replace(/"/g,'""')}",${t.isRecurring?'YES':'NO'},${t.isTaxDeductible?'YES':'NO'}\n`;
    });
    this.downloadBlob(csv, `fook_ledger_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    this.toast('CSV ledger exported', 'green');
  }

  exportJSON() {
    this.downloadBlob(JSON.stringify(this.state, null, 2), `fook_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    this.toast('JSON backup downloaded', 'green');
  }

  downloadBlob(content, filename, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 200);
  }

  setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// ═══════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  window.fookApp = new FookApp();
  if (window.fookApp.state.settings.privacyMode) {
    document.body.classList.add('privacy-active');
  }
});
