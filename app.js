/**
 * FOOK v2 — Global Variable Income OS
 * Full application controller with:
 *  - Dark/Light theme toggle
 *  - Tabbed navigation
 *  - Income Volatility Index (Coefficient of Variation)
 *  - Doom Mode (runway alert)
 *  - Weekly Check-In Streak
 *  - Financial Health Score
 *  - Prediction Override
 *  - Client Pareto Analysis
 *  - Prediction Accuracy Tracker (honest ML)
 *  - Safe-to-Invest Calculator
 *  - Full Ledger with search & filter
 *  - Tax deduction breakdown
 */

// ═══════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════
const DEFAULT_DEMO = {
  settings: {
    homeCurrency: 'USD',
    language: 'en',
    privacyMode: false,
    theme: 'dark',
    safeRatePct: 0.70,
    monthlyFixedCommitments: 850,
    overrideAdjustment: 0,
    overrideReason: ''
  },
  streak: { weeks: [true, true, true, false, true, true, false, true], currentWeekDone: false },
  transactions: [
    { id: 'inc_1', date: '2026-08-02', type: 'income', amount: 1450, currency: 'USD', category: 'Freelance',   notes: 'Next.js Dashboard (Milestone 2)', isRecurring: false, isTaxDeductible: false, client: 'Acme Corp (US)' },
    { id: 'inc_2', date: '2026-08-05', type: 'income', amount: 620,  currency: 'EUR', category: 'Freelance',   notes: 'UI/UX Design Sprint – Fiverr Pro', isRecurring: false, isTaxDeductible: false, client: 'Berlin Studio GmbH' },
    { id: 'inc_3', date: '2026-08-10', type: 'income', amount: 65000,currency: 'KES', category: 'Retainer',    notes: 'DevOps Monthly Retainer', isRecurring: true, isTaxDeductible: false, client: 'SavannaPay Ltd' },
    { id: 'inc_4', date: '2026-08-14', type: 'income', amount: 45000,currency: 'INR', category: 'Consulting',  notes: 'Architecture Review – AI Startup', isRecurring: false, isTaxDeductible: false, client: 'NexAI Labs' },
    { id: 'inc_5', date: '2026-08-18', type: 'income', amount: 350,  currency: 'USD', category: 'Royalties',   notes: 'Gumroad Template Sales', isRecurring: false, isTaxDeductible: false, client: 'Gumroad' },
    { id: 'exp_1', date: '2026-08-01', type: 'expense', amount: 650, currency: 'USD', category: 'Housing & Rent',          notes: 'Monthly Apartment Rent', isRecurring: true, isTaxDeductible: false, client: 'Landlord' },
    { id: 'exp_2', date: '2026-08-03', type: 'expense', amount: 20,  currency: 'USD', category: 'Software & Subscriptions', notes: 'ChatGPT Plus', isRecurring: true, isTaxDeductible: true, client: 'OpenAI' },
    { id: 'exp_3', date: '2026-08-04', type: 'expense', amount: 120, currency: 'EUR', category: 'Food & Dining',            notes: 'Weekly Organic Groceries', isRecurring: false, isTaxDeductible: false, client: 'BioSupermarkt' },
    { id: 'exp_4', date: '2026-08-07', type: 'expense', amount: 210, currency: 'USD', category: 'Equipment & Tech',         notes: 'Logitech MX Master 3S', isRecurring: false, isTaxDeductible: true, client: 'Amazon' },
    { id: 'exp_5', date: '2026-08-09', type: 'expense', amount: 45,  currency: 'USD', category: 'Transport',                notes: 'Uber – co-working & client meet', isRecurring: false, isTaxDeductible: true, client: 'Uber' },
    { id: 'exp_6', date: '2026-08-12', type: 'expense', amount: 15,  currency: 'USD', category: 'Software & Subscriptions', notes: 'Figma Professional Plan', isRecurring: true, isTaxDeductible: true, client: 'Figma' },
    { id: 'exp_7', date: '2026-08-15', type: 'expense', amount: 3500,currency: 'KES', category: 'Food & Dining',            notes: 'Team dinner – tech community', isRecurring: false, isTaxDeductible: false, client: 'Java House' },
    { id: 'exp_8', date: '2026-08-19', type: 'expense', amount: 60,  currency: 'USD', category: 'Utilities',               notes: 'Fiber Internet – high speed', isRecurring: true, isTaxDeductible: true, client: 'ISP Fiber' }
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

// ═══════════════════════════════════════════
// PALETTE for clients/categories
// ═══════════════════════════════════════════
const CLIENT_COLORS = ['#10b981','#06b6d4','#8b5cf6','#f59e0b','#f43f5e','#3b82f6','#ec4899','#14b8a6'];

// ═══════════════════════════════════════════
// MAIN APP CLASS
// ═══════════════════════════════════════════
class FookApp {
  constructor() {
    this.nlp           = null; // set after ML loads
    this.speechRec     = null;
    this.isRecording   = false;
    this.activeTab     = 'dashboard';
    this.ledgerFilter  = 'all';
    this.ledgerSearch  = '';
    this.state         = null;
    this.init();
  }

  // ──────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────
  init() {
    this.loadState();
    this.applyTheme(this.state.settings.theme || 'dark');
    this.nlp = new NaiveBayesNLP();
    this.initCurrencySelectors();
    this.bindStaticEvents();
    this.initSpeech();
    this.render();
  }

  loadState() {
    try {
      const raw = localStorage.getItem('fook_v2_state');
      this.state = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_DEMO));
    } catch(e) {
      this.state = JSON.parse(JSON.stringify(DEFAULT_DEMO));
    }
    // Ensure all keys exist (migration guard)
    this.state.settings    = Object.assign({}, DEFAULT_DEMO.settings, this.state.settings || {});
    this.state.streak      = Object.assign({}, DEFAULT_DEMO.streak, this.state.streak || {});
    this.state.overrideHistory = this.state.overrideHistory || [];
    this.state.historicalIncome = this.state.historicalIncome || [];
    I18nEngine.setLocale(this.state.settings.language || 'en');
  }

  save() {
    localStorage.setItem('fook_v2_state', JSON.stringify(this.state));
  }

  // ──────────────────────────────────────────
  // THEME
  // ──────────────────────────────────────────
  applyTheme(theme) {
    this.state.settings.theme = theme;
    const html = document.documentElement;
    html.classList.remove('dark','light');
    html.classList.add(theme);
    const sunIcon  = document.getElementById('icon-sun');
    const moonIcon = document.getElementById('icon-moon');
    if (theme === 'dark') {
      if (sunIcon)  sunIcon.style.display  = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    } else {
      if (sunIcon)  sunIcon.style.display  = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }
    this.save();
  }

  toggleTheme() {
    this.applyTheme(this.state.settings.theme === 'dark' ? 'light' : 'dark');
  }

  // ──────────────────────────────────────────
  // CURRENCY SELECTORS
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
  // EVENT BINDING
  // ──────────────────────────────────────────
  bindStaticEvents() {
    // Theme
    document.getElementById('theme-btn')?.addEventListener('click', () => this.toggleTheme());

    // Privacy
    document.getElementById('privacy-btn')?.addEventListener('click', () => this.togglePrivacy());

    // Demo / Reset
    document.getElementById('load-demo-btn')?.addEventListener('click', () => { this.state = JSON.parse(JSON.stringify(DEFAULT_DEMO)); this.save(); this.initCurrencySelectors(); this.render(); this.toast('Demo data loaded! 🎉', 'green'); });
    document.getElementById('clean-slate-btn')?.addEventListener('click', () => { if(confirm('Clear ALL data? This cannot be undone.')) { this.state.transactions = []; this.state.historicalIncome = []; this.state.overrideHistory = []; this.save(); this.render(); this.toast('Clean slate!', 'amber'); } });

    // ── Tab nav: desktop header buttons ──
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // ── Bottom nav (mobile) ──
    document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // ── Modals: open ──
    document.querySelectorAll('[data-modal]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const modalId = el.dataset.modal;
        // Quick income/expense buttons
        if (el.id === 'quick-income-btn')  this.openModal(modalId, 'income');
        else if (el.id === 'quick-expense-btn') this.openModal(modalId, 'expense');
        else this.openModal(modalId);
      });
    });

    // ── Modals: close ──
    document.querySelectorAll('.modal-close-btn').forEach(el => {
      el.addEventListener('click', () => this.closeModal(el.dataset.modal));
    });
    document.querySelectorAll('.modal-backdrop').forEach(bk => {
      bk.addEventListener('click', (e) => { if (e.target === bk) this.closeModal(bk.id); });
    });

    // ── Transaction form ──
    document.getElementById('transaction-form')?.addEventListener('submit', (e) => { e.preventDefault(); this.submitTransaction(e.target); });

    // ── Toggle switches ──
    this.bindToggle('toggle-recurring', 'check-recurring');
    this.bindToggle('toggle-tax', 'check-taxded');

    // ── Modal type tabs (new mobile design) ──
    document.getElementById('type-income-tab')?.addEventListener('click', () => this.setFormType('income'));
    document.getElementById('type-expense-tab')?.addEventListener('click', () => this.setFormType('expense'));

    // ── NL Input ──
    const nlInput = document.getElementById('nl-input');
    nlInput?.addEventListener('input', (e) => this.handleNLPreview(e.target.value));
    nlInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.submitNL(); } });
    document.getElementById('nl-submit')?.addEventListener('click', () => this.submitNL());

    // ── Voice ──
    document.getElementById('voice-btn')?.addEventListener('click', () => this.toggleVoice());

    // ── Currency selectors (header + settings) ──
    ['home-currency-select', 'settings-currency-select'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        this.state.settings.homeCurrency = e.target.value;
        // Sync both selects
        ['home-currency-select', 'settings-currency-select'].forEach(sid => {
          const s = document.getElementById(sid); if (s) s.value = e.target.value;
        });
        this.save(); this.render();
      });
    });

    // ── Language ──
    document.getElementById('language-select')?.addEventListener('change', (e) => {
      this.state.settings.language = e.target.value;
      I18nEngine.setLocale(e.target.value);
      this.save(); this.render();
    });

    // ── Safe Rate slider ──
    const rateSlider = document.getElementById('safe-rate-slider');
    if (rateSlider) {
      rateSlider.value = Math.round((this.state.settings.safeRatePct || 0.7) * 100);
      const rateLabel = document.getElementById('safe-rate-label');
      rateSlider.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (rateLabel) rateLabel.textContent = `${v}%`;
        this.state.settings.safeRatePct = v / 100;
        this.save(); this.render();
      });
    }

    // ── Override slider ──
    const slider = document.getElementById('override-slider');
    if (slider) {
      slider.value = this.state.settings.overrideAdjustment || 0;
      slider.addEventListener('input', (e) => this.handleOverrideSlider(e.target.value));
      this.handleOverrideSlider(slider.value);
    }
    document.getElementById('apply-override')?.addEventListener('click', () => this.applyOverride());

    // ── Ledger search & filter ──
    document.getElementById('ledger-search')?.addEventListener('input', (e) => { this.ledgerSearch = e.target.value.toLowerCase(); this.renderLedger(); });
    document.querySelectorAll('.filter-pill[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.ledgerFilter = btn.dataset.filter;
        this.renderLedger();
      });
    });

    // ── Streak check-in ──
    document.getElementById('checkin-btn')?.addEventListener('click', () => this.markWeekDone());

    // ── Keyboard shortcuts ──
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

  setFormType(type) {
    const incTab = document.getElementById('type-income-tab');
    const expTab = document.getElementById('type-expense-tab');
    const hidden = document.getElementById('tx-type-hidden');
    if (incTab) incTab.classList.toggle('active', type === 'income');
    if (expTab) expTab.classList.toggle('active', type === 'expense');
    if (hidden) hidden.value = type;
    // Adjust category default
    const catSel = document.getElementById('modal-category');
    if (catSel) {
      if (type === 'income') catSel.value = 'Freelance';
      else catSel.value = 'Food & Dining';
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    // Panels
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`)?.classList.add('active');
    // Desktop tab buttons
    document.querySelectorAll('.tab-btn[data-tab]').forEach(b => {
      const isActive = b.dataset.tab === tabId;
      b.classList.toggle('active', isActive);
      b.style.background = isActive ? 'var(--accent-green)' : 'transparent';
      b.style.color = isActive ? (document.documentElement.classList.contains('dark') ? '#07090e' : '#fff') : 'var(--text-muted)';
    });
    // Bottom nav buttons
    document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });
    // Tab-specific renders
    if (tabId === 'ledger')   this.renderLedger();
    if (tabId === 'forecast') this.renderForecastTab();
    if (tabId === 'tax')      this.renderTaxTab();
  }

  openModal(id, presetType) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
    const dateInput = m.querySelector('[name="date"]');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    ['toggle-recurring','toggle-tax'].forEach(t => document.getElementById(t)?.classList.remove('on'));
    ['check-recurring','check-taxded'].forEach(c => { const el = document.getElementById(c); if(el) el.checked = false; });
    this.setFormType(presetType || 'income');
  }

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
  }

  // ──────────────────────────────────────────
  // PRIVACY
  // ──────────────────────────────────────────
  togglePrivacy() {
    this.state.settings.privacyMode = !this.state.settings.privacyMode;
    document.body.classList.toggle('privacy-active', this.state.settings.privacyMode);
    const eo = document.getElementById('eye-open');
    const ec = document.getElementById('eye-closed');
    if (eo) eo.style.display  = this.state.settings.privacyMode ? 'none'  : 'block';
    if (ec) ec.style.display  = this.state.settings.privacyMode ? 'block' : 'none';
    this.save();
  }

  // ──────────────────────────────────────────
  // NL INPUT
  // ──────────────────────────────────────────
  handleNLPreview(text) {
    const preview = document.getElementById('nl-preview');
    if (!text || text.trim().length < 3) { preview?.classList.add('hidden'); return; }
    const parsed = this.nlp.parseInput(text);
    if (!parsed || !parsed.amount) { preview?.classList.add('hidden'); return; }
    const curr = CURRENCY_DATABASE[parsed.currency] || CURRENCY_DATABASE.USD;
    const typeColor = parsed.type === 'income' ? 'var(--accent-green)' : 'var(--accent-rose)';
    preview.classList.remove('hidden');
    preview.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span class="badge" style="background:${typeColor}20; color:${typeColor}; border-color:${typeColor}40;">${parsed.type === 'income' ? '+ Income' : '− Expense'}</span>
        <span class="num" style="font-size:15px; font-weight:700; color:var(--text-primary);">${curr.symbol} ${parsed.amount.toLocaleString()}</span>
        <span class="badge badge-neutral">${parsed.category}</span>
        ${parsed.isTaxDeductible ? '<span class="badge badge-amber">★ Tax Ded.</span>' : ''}
        ${parsed.isRecurring ? '<span class="badge badge-cyan">Recurring</span>' : ''}
        <span style="font-size:12px; color:var(--text-secondary); font-style:italic; margin-left:auto;">"${parsed.notes}"</span>
        <button id="confirm-nl" class="btn btn-primary btn-sm">Confirm →</button>
      </div>
    `;
    document.getElementById('confirm-nl')?.addEventListener('click', () => this.submitNL());
  }

  submitNL() {
    const input = document.getElementById('nl-input');
    const text = input?.value?.trim();
    if (!text) return;
    const parsed = this.nlp.parseInput(text);
    if (!parsed || !parsed.amount || parsed.amount <= 0) { this.toast('Include an amount — e.g. "500 USD from client"', 'amber'); return; }
    const tx = { id: 'tx_' + Date.now(), date: new Date().toISOString().split('T')[0], ...parsed, client: parsed.type === 'income' ? (parsed.notes || 'Direct') : 'General' };
    this.state.transactions.unshift(tx);
    this.save();
    if (input) input.value = '';
    document.getElementById('nl-preview')?.classList.add('hidden');
    this.toast(`Logged: ${tx.type === 'income' ? '+' : '−'}${CurrencyEngine.format(tx.amount, tx.currency)} · ${tx.category}`, tx.type === 'income' ? 'green' : 'amber');
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
    this.toast(`Saved! ${tx.type === 'income' ? '+' : '−'}${CurrencyEngine.format(tx.amount, tx.currency)}`, 'green');
    this.render();
  }

  deleteTransaction(id) {
    if (!confirm('Delete this entry?')) return;
    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this.save();
    this.render();
    if (this.activeTab === 'ledger') this.renderLedger();
    this.toast('Deleted', 'rose');
  }

  // ──────────────────────────────────────────
  // OVERRIDE SLIDER
  // ──────────────────────────────────────────
  handleOverrideSlider(val) {
    const v = parseInt(val);
    const label = document.getElementById('override-pct-label');
    if (label) {
      label.textContent = v > 0 ? `+${v}%` : `${v}%`;
      label.style.color = v > 0 ? 'var(--accent-green)' : v < 0 ? 'var(--accent-rose)' : 'var(--text-primary)';
    }
    // Preview adjusted prediction
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
    this.toast(`Prediction override applied: ${val > 0 ? '+' : ''}${val}%`, 'cyan');
    this.render();
  }

  // ──────────────────────────────────────────
  // WEEKLY STREAK
  // ──────────────────────────────────────────
  markWeekDone() {
    this.state.streak.currentWeekDone = true;
    const dots = this.state.streak.weeks || [];
    dots.shift();
    dots.push(true);
    this.state.streak.weeks = dots;
    this.save();
    this.renderStreak();
    this.toast('Weekly check-in logged! 🎉 Keep the streak alive!', 'green');
  }

  // ──────────────────────────────────────────
  // VOICE
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
    if (!this.speechRec) { this.toast('Voice not supported in this browser', 'amber'); return; }
    if (this.isRecording) { this.speechRec.stop(); this.stopVoice(); return; }
    this.isRecording = true;
    this.speechRec.start();
    document.getElementById('voice-waves')?.classList.remove('hidden');
    document.getElementById('voice-waves')?.classList.add('flex');
  }

  stopVoice() {
    this.isRecording = false;
    const w = document.getElementById('voice-waves');
    w?.classList.add('hidden');
    w?.classList.remove('flex');
  }

  // ──────────────────────────────────────────
  // TOAST
  // ──────────────────────────────────────────
  toast(msg, type = 'green') {
    const colorMap = { green: 'var(--accent-green)', cyan: 'var(--accent-cyan)', amber: 'var(--accent-amber)', rose: 'var(--accent-rose)' };
    const color = colorMap[type] || colorMap.green;
    const root = document.getElementById('toast-root') || document.body;
    const el = document.createElement('div');
    el.style.cssText = `background:var(--bg-elevated); color:var(--text-primary); border:1px solid var(--border);
      border-left:3px solid ${color}; padding:10px 16px; border-radius:var(--radius-md);
      font-size:13px; font-weight:500; box-shadow:var(--shadow-card); backdrop-filter:blur(16px);
      display:flex; align-items:center; gap:8px; max-width:min(360px,88vw); pointer-events:auto;
      opacity:0; transform:translateY(8px); transition:opacity 0.2s, transform 0.2s; white-space:normal;`;
    el.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0;"></span>${msg}`;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 10);
    setTimeout(() => {
      el.style.opacity = '0'; el.style.transform = 'translateY(8px)';
      setTimeout(() => el.remove(), 250);
    }, 3000);
  }

  // ──────────────────────────────────────────
  // MAIN RENDER CYCLE
  // ──────────────────────────────────────────
  render() {
    const hc = this.state.settings.homeCurrency;
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay  = now.getDate();
    const daysLeft    = Math.max(1, daysInMonth - currentDay);

    // Split current month
    const thisMonth = this.state.transactions.filter(t => t.date.startsWith(monthPrefix));
    let actualIncome = 0, actualSpend = 0, knownRecurring = 0;
    thisMonth.forEach(t => {
      const v = CurrencyEngine.convert(t.amount, t.currency, hc);
      if (t.type === 'income') { actualIncome += v; if (t.isRecurring) knownRecurring += v; }
      else actualSpend += v;
    });

    // Historical in home currency for ML
    const histInHome = (this.state.historicalIncome || []).map(h => ({
      date: h.date,
      amount: CurrencyEngine.convert(h.amount, h.currency || 'USD', hc)
    }));

    // ML Forecast
    const forecast = IncomeForecaster.forecastNext3Months(histInHome, knownRecurring);
    let overrideMultiplier = 1 + (this.state.settings.overrideAdjustment || 0) / 100;
    const expectedMonthTotal = Math.max(actualIncome, (forecast.projections[0]?.expected || 3000) * overrideMultiplier);

    // Adaptive ceiling
    const safeCalc = IncomeForecaster.calculateAdaptiveSafeCeiling(actualIncome, expectedMonthTotal, this.state.settings.monthlyFixedCommitments, this.state.settings.safeRatePct);
    const safeCeiling = safeCalc.safeCeiling;
    const remaining = safeCeiling - actualSpend;
    const burnPerDay = currentDay > 0 ? actualSpend / currentDay : 0;
    const safeDaily  = Math.max(0, remaining / daysLeft);
    const pacingPct  = safeCeiling > 0 ? (actualSpend / safeCeiling) : 0;

    // Volatility (Coefficient of Variation)
    const histAmts = histInHome.map(h => h.amount).filter(v => v > 0);
    const histMean = histAmts.length ? histAmts.reduce((a,b)=>a+b,0)/histAmts.length : 0;
    const histSD   = histAmts.length > 1 ? Math.sqrt(histAmts.reduce((s,v) => s + Math.pow(v - histMean, 2), 0) / histAmts.length) : 0;
    const cv       = histMean > 0 ? Math.round((histSD / histMean) * 100) : 0;

    // Runway: days until safe budget exhausted at current burn rate
    const runwayDays = burnPerDay > 0 ? Math.floor(remaining / burnPerDay) : 999;

    // Safe-to-invest: remaining after accounting for all expected expenses until month end
    const projExpense = burnPerDay * daysLeft;
    const safeToInvest = Math.max(0, remaining - projExpense);

    // Health Score
    const savingsRate  = actualIncome > 0 ? Math.min(100, Math.round(((actualIncome - actualSpend) / actualIncome) * 100)) : 0;
    const allClients   = [...new Set(this.state.transactions.filter(t => t.type === 'income').map(t => t.client).filter(Boolean))].length;
    const diversifyScore = Math.min(100, allClients * 20);
    const accuracyScore  = forecast.confidenceScore || 70;
    const healthScore    = Math.round((savingsRate * 0.4) + (diversifyScore * 0.3) + (accuracyScore * 0.3));

    // ── RENDER HERO ──
    this.setEl('hero-safe-amount', CurrencyEngine.format(remaining, hc, 0));
    this.setEl('hero-spent',       CurrencyEngine.format(actualSpend, hc, 0));
    this.setEl('hero-daily-allowance', CurrencyEngine.format(safeDaily, hc, 0) + '/day');
    this.setEl('hero-days',        `${daysLeft} days`);
    this.setEl('hero-actual-income', CurrencyEngine.format(actualIncome, hc, 0));

    // Predicted income range pill
    const p0 = forecast.projections[0];
    if (p0) {
      const predLabel = document.getElementById('hero-predicted-income-label');
      if (predLabel) predLabel.textContent = `${CurrencyEngine.format(p0.conservative, hc, 0)} – ${CurrencyEngine.format(p0.optimistic, hc, 0)}`;
    }

    // Gauge ring (circumference = 2π×36 ≈ 226.2)
    const gauge = document.getElementById('gauge-ring');
    const gaugePct = document.getElementById('gauge-pct');
    if (gauge && gaugePct) {
      const pct = Math.min(100, Math.round(pacingPct * 100));
      const C = 226.2;
      gauge.style.strokeDashoffset = C - (pct / 100) * C;
      gaugePct.textContent = `${pct}%`;
      const color = pct > 90 ? 'var(--accent-rose)' : pct > 70 ? 'var(--accent-amber)' : 'var(--accent-green)';
      gauge.setAttribute('stroke', color);
      gaugePct.style.color = color;
    }

    // Pacing badge
    const badge = document.getElementById('hero-pacing-badge');
    const badgeText = document.getElementById('badge-text');
    if (badge && badgeText) {
      if (remaining < 0) { badge.className = 'badge badge-rose'; badgeText.textContent = 'Over Ceiling!'; }
      else if (pacingPct > 0.85) { badge.className = 'badge badge-amber'; badgeText.textContent = 'High Velocity'; }
      else { badge.className = 'badge badge-green'; badgeText.textContent = 'Safe Velocity'; }
    }

    // ── DOOM MODE ──
    const doom = document.getElementById('doom-banner');
    if (doom) {
      if (remaining < 0 || (burnPerDay > 0 && runwayDays < 5)) {
        doom.style.display = 'block';
        doom.classList.remove('hidden');
        this.setEl('doom-message', remaining < 0
          ? `You've exceeded your safe ceiling by ${CurrencyEngine.format(Math.abs(remaining), hc, 0)}. Log income or reduce spend immediately.`
          : `At your burn rate, your safe buffer runs out in ${runwayDays} days. ${daysLeft} days remain in the month.`
        );
      } else {
        doom.style.display = 'none';
      }
    }

    // ── VOLATILITY ──
    this.setEl('volatility-cv', `${cv}%`);
    const vBadge = document.getElementById('volatility-badge');
    const vBar   = document.getElementById('volatility-bar');
    if (vBadge) {
      if (cv < 20) { vBadge.className = 'badge badge-green'; vBadge.textContent = 'Stable'; }
      else if (cv < 40) { vBadge.className = 'badge badge-cyan'; vBadge.textContent = 'Moderate'; }
      else if (cv < 60) { vBadge.className = 'badge badge-amber'; vBadge.textContent = 'Volatile'; }
      else { vBadge.className = 'badge badge-rose'; vBadge.textContent = 'Highly Volatile'; }
    }
    if (vBar) vBar.style.width = `${Math.min(100, cv)}%`;

    // ── STREAK ──
    this.renderStreak();

    // ── HEALTH SCORE ──
    const healthRing = document.getElementById('health-ring');
    if (healthRing) {
      const HC = 175.9;
      healthRing.style.strokeDashoffset = HC - (healthScore / 100) * HC;
      const hColor = healthScore >= 70 ? '#10b981' : healthScore >= 45 ? '#f59e0b' : '#f43f5e';
      healthRing.setAttribute('stroke', hColor);
    }
    this.setEl('health-score-num', `${healthScore}`);
    const hLabel = document.getElementById('health-label-badge');
    if (hLabel) {
      if (healthScore >= 70) { hLabel.className = 'badge badge-green'; hLabel.textContent = 'Healthy'; }
      else if (healthScore >= 45) { hLabel.className = 'badge badge-amber'; hLabel.textContent = 'Fair'; }
      else { hLabel.className = 'badge badge-rose'; hLabel.textContent = 'At Risk'; }
    }
    this.setEl('hc-savings', `${savingsRate}%`);
    this.setEl('hc-diversify', `${diversifyScore}%`);
    this.setEl('hc-accuracy', `${accuracyScore}%`);
    if (document.getElementById('hbar-savings'))   document.getElementById('hbar-savings').style.width   = `${savingsRate}%`;
    if (document.getElementById('hbar-diversify')) document.getElementById('hbar-diversify').style.width = `${diversifyScore}%`;
    if (document.getElementById('hbar-accuracy'))  document.getElementById('hbar-accuracy').style.width  = `${accuracyScore}%`;

    // ── RUNWAY ──
    this.setEl('runway-days', runwayDays >= 999 ? 'Infinite' : `${runwayDays} days`);
    const rBadge = document.getElementById('runway-badge');
    if (rBadge) {
      if (runwayDays >= 999) { rBadge.className = 'badge badge-green'; rBadge.textContent = 'Infinite'; }
      else if (runwayDays > 15) { rBadge.className = 'badge badge-cyan'; rBadge.textContent = 'Safe'; }
      else if (runwayDays > 7) { rBadge.className = 'badge badge-amber'; rBadge.textContent = 'Caution'; }
      else { rBadge.className = 'badge badge-rose'; rBadge.textContent = '🔴 Critical'; }
    }
    this.setEl('safe-invest', CurrencyEngine.format(safeToInvest, hc, 0));

    // ── PARETO (Client Revenue) ──
    this.renderPareto(hc);

    // ── ANOMALIES ──
    this.renderAnomalies(hc);

    // ── CATEGORY CEILINGS ──
    this.renderCategoryGrid(thisMonth, safeCeiling, hc);

    // ── OVERRIDE SLIDER REFRESH ──
    const slider = document.getElementById('override-slider');
    if (slider) this.handleOverrideSlider(slider.value);

    // Apply i18n
    I18nEngine.applyTranslations();

    // Render active tab data
    if (this.activeTab === 'forecast') this.renderForecastTab();
    if (this.activeTab === 'ledger')   this.renderLedger();
    if (this.activeTab === 'tax')      this.renderTaxTab();
  }

  // ──────────────────────────────────────────
  // STREAK
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
      if (streakCount >= 6) msgEl.textContent = `🔥 ${streakCount}-week streak! You're mastering your variable income.`;
      else if (streakCount >= 3) msgEl.textContent = `💪 ${streakCount} weeks strong! Consistency is building real insight.`;
      else if (this.state.streak.currentWeekDone) msgEl.textContent = `✅ This week's check-in done! Come back next Sunday.`;
      else msgEl.textContent = `Check in this week to keep your streak alive.`;
    }
  }

  // ──────────────────────────────────────────
  // PARETO ANALYSIS
  // ──────────────────────────────────────────
  renderPareto(hc) {
    const container = document.getElementById('pareto-container');
    if (!container) return;
    const incomeByClient = {};
    this.state.transactions.filter(t => t.type === 'income').forEach(t => {
      const key = t.client || t.notes || 'Unknown';
      incomeByClient[key] = (incomeByClient[key] || 0) + CurrencyEngine.convert(t.amount, t.currency, hc);
    });
    const sorted = Object.entries(incomeByClient).sort((a,b) => b[1] - a[1]);
    if (!sorted.length) { container.innerHTML = '<p style="font-size:12px; color:var(--text-muted); padding:8px 0;">Log income to see client breakdown</p>'; return; }
    const total = sorted.reduce((s, [,v]) => s + v, 0);
    container.innerHTML = sorted.slice(0, 6).map(([client, amount], i) => {
      const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
      const color = CLIENT_COLORS[i % CLIENT_COLORS.length];
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:12px;">
            <span style="color:var(--text-primary); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%;">${client}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="num" style="font-size:12px; color:var(--text-secondary);" class="blur-private">${CurrencyEngine.format(amount, hc, 0)}</span>
              <span style="font-size:10px; font-weight:700; font-family:'JetBrains Mono'; color:${color}; min-width:30px; text-align:right;">${pct}%</span>
            </div>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
        </div>
      `;
    }).join('');
  }

  // ──────────────────────────────────────────
  // ANOMALIES
  // ──────────────────────────────────────────
  renderAnomalies(hc) {
    const container = document.getElementById('anomaly-container');
    if (!container) return;
    const alerts = AnomalyDetector.detectAnomalies(this.state.transactions, hc);
    if (!alerts.length) {
      container.innerHTML = `<div style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:var(--radius-md); background:var(--accent-green-glow); border:1px solid rgba(16,185,129,0.2);">
        <svg width="14" height="14" fill="none" stroke="var(--accent-green)" viewBox="0 0 24 24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span style="font-size:12px; color:var(--accent-green);">No anomalies detected. Clean spending signature.</span>
      </div>`;
      return;
    }
    container.innerHTML = alerts.map(a => `
      <div style="display:flex; align-items:flex-start; gap:8px; padding:10px 12px; border-radius:var(--radius-md); background:var(--accent-amber-glow); border:1px solid rgba(245,158,11,0.25);">
        <svg width="14" height="14" fill="none" stroke="var(--accent-amber)" viewBox="0 0 24 24" stroke-width="2" style="flex-shrink:0; margin-top:1px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p style="font-size:11px; color:var(--accent-amber);">${a.message}</p>
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
        <div class="card card-lift" style="padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <span style="font-size:12px; font-weight:600; color:var(--text-primary);">${cat}</span>
            ${over ? '<span class="badge badge-rose" style="font-size:9px;">Over!</span>' : ''}
          </div>
          <div class="progress-track" style="margin-bottom:6px;"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:10px;">
            <span style="color:${color}; font-family:'JetBrains Mono'; font-weight:600;" class="blur-private">${CurrencyEngine.format(spent, hc, 0)}</span>
            <span style="color:var(--text-muted);" class="blur-private">/ ${CurrencyEngine.format(cap, hc, 0)} · ${pct}%</span>
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
      confBadge.textContent = `${forecast.confidenceScore}% ML Confidence`;
      confBadge.className = forecast.confidenceScore >= 80 ? 'badge badge-green' : forecast.confidenceScore >= 65 ? 'badge badge-cyan' : 'badge badge-amber';
    }

    const colors = ['var(--accent-green)', 'var(--accent-cyan)', 'var(--accent-violet)'];
    const cards = document.getElementById('forecast-cards');
    if (cards) {
      cards.innerHTML = forecast.projections.map((p, i) => `
        <div class="card" style="padding:20px; border-top:3px solid ${colors[i]};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
            <div>
              <p style="font-size:13px; font-weight:700; color:var(--text-primary);">${p.monthName}</p>
              <p style="font-size:10px; font-weight:600; color:var(--text-muted); margin-top:2px;">${p.notes}</p>
            </div>
            ${this.state.settings.overrideAdjustment !== 0
              ? `<span class="badge badge-violet" style="font-size:9px;">Override ${this.state.settings.overrideAdjustment > 0 ? '+' : ''}${this.state.settings.overrideAdjustment}%</span>`
              : ''}
          </div>
          <div class="space-y-2" style="margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; padding:6px 0; border-bottom:1px solid var(--border);">
              <span style="color:var(--text-muted);">Conservative (P20)</span>
              <span class="num blur-private" style="color:var(--text-secondary);">${CurrencyEngine.format(p.conservative, hc, 0)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; padding:6px 0; border-bottom:1px solid var(--border); font-weight:700;">
              <span style="color:${colors[i]};">Expected Target</span>
              <span class="num blur-private" style="color:var(--text-primary); font-size:14px;">${CurrencyEngine.format(p.expected, hc, 0)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; padding:6px 0;">
              <span style="color:var(--text-muted);">Optimistic (P80)</span>
              <span class="num blur-private" style="color:var(--text-secondary);">${CurrencyEngine.format(p.optimistic, hc, 0)}</span>
            </div>
          </div>
          <div style="padding:10px; border-radius:var(--radius-md); background:var(--accent-green-glow); border:1px solid rgba(16,185,129,0.2);">
            <div style="display:flex; justify-content:space-between; font-size:12px;">
              <span style="color:var(--text-secondary);">Safe Spend Target</span>
              <span class="num c-green blur-private" style="font-weight:700;">${CurrencyEngine.format(p.safeSpendTarget, hc, 0)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Accuracy tracker (honest ML: compare last 3 months historical vs actual)
    const accuracyEl = document.getElementById('accuracy-tracker');
    if (accuracyEl && histInHome.length >= 2) {
      const last3 = histInHome.slice(-3).reverse();
      accuracyEl.innerHTML = last3.map(h => {
        const date = new Date(h.date);
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        const histMean  = histAmtsFrom(histInHome, h.date);
        const diff      = histMean > 0 ? Math.round(((h.amount - histMean) / histMean) * 100) : 0;
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-radius:var(--radius-md); background:var(--bg-hover); border:1px solid var(--border);">
            <div>
              <p style="font-size:12px; font-weight:600; color:var(--text-primary);">${monthName}</p>
              <p style="font-size:11px; color:var(--text-muted);">Actual income logged</p>
            </div>
            <div style="text-align:right;">
              <p class="num blur-private" style="font-size:13px; font-weight:700; color:var(--text-primary);">${CurrencyEngine.format(h.amount, hc, 0)}</p>
              <span class="change-chip ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '+' : ''}${diff}% vs avg</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Override history
    const ohEl = document.getElementById('override-history');
    if (ohEl) {
      if (!this.state.overrideHistory.length) {
        ohEl.innerHTML = '<p class="c-muted" style="font-size:12px;">No manual overrides applied yet.</p>';
      } else {
        ohEl.innerHTML = this.state.overrideHistory.slice(0,5).map(o => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-radius:var(--radius-md); background:var(--bg-hover); border:1px solid var(--border); font-size:12px;">
            <div>
              <span class="badge ${o.adjustment > 0 ? 'badge-green' : 'badge-rose'}">${o.adjustment > 0 ? '+' : ''}${o.adjustment}%</span>
              ${o.reason ? `<span class="c-secondary" style="margin-left:8px; font-style:italic;">"${o.reason}"</span>` : ''}
            </div>
            <span class="c-muted">${o.date}</span>
          </div>
        `).join('');
      }
    }
  }

  // ──────────────────────────────────────────
  // LEDGER TAB
  // ──────────────────────────────────────────
  renderLedger() {
    const tbody  = document.getElementById('ledger-tbody');
    const mList  = document.getElementById('ledger-mobile-list');
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

    const emptyMsg = '<p style="text-align:center; padding:24px; color:var(--text-muted); font-size:13px;">No transactions match your filter.</p>';

    if (!txs.length) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted); font-size:13px;">No transactions match.</td></tr>`;
      if (mList) mList.innerHTML = emptyMsg;
      return;
    }

    txs.forEach(t => {
      const isIncome  = t.type === 'income';
      const homeVal   = CurrencyEngine.convert(t.amount, t.currency, hc);
      const isForeign = t.currency.toUpperCase() !== hc.toUpperCase();
      const typeColor = isIncome ? 'var(--accent-green)' : 'var(--accent-rose)';
      const typeSign  = isIncome ? '+' : '−';

      // Desktop table row
      if (tbody) {
        // handled in batch below
      }
      // Mobile card
      // handled in batch below
    });

    // Desktop table (batch)
    if (tbody) {
      tbody.innerHTML = txs.map(t => {
        const isIncome  = t.type === 'income';
        const homeVal   = CurrencyEngine.convert(t.amount, t.currency, hc);
        const isForeign = t.currency.toUpperCase() !== hc.toUpperCase();
        const typeColor = isIncome ? 'var(--accent-green)' : 'var(--accent-rose)';
        return `
          <tr>
            <td style="color:var(--text-muted); font-family:'JetBrains Mono'; font-size:12px; white-space:nowrap;">${t.date}</td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                <span style="font-size:12px; font-weight:600; color:${typeColor};">${isIncome?'+':'−'} ${t.category}</span>
                ${t.isRecurring ? '<span class="badge badge-cyan" style="font-size:9px;">Retainer</span>' : ''}
                ${t.isTaxDeductible ? '<span class="badge badge-amber" style="font-size:9px;">★ Tax</span>' : ''}
              </div>
            </td>
            <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:var(--text-primary);">${t.notes || '—'}</td>
            <td style="text-align:right;"><span class="num blur-private" style="font-size:13px; font-weight:700; color:${typeColor};">${isIncome?'+':'−'}${CurrencyEngine.format(t.amount, t.currency)}</span></td>
            <td style="text-align:right;"><span class="num blur-private" style="font-size:12px; color:var(--text-secondary);">${isForeign ? CurrencyEngine.format(homeVal, hc) : '—'}</span></td>
            <td style="text-align:right;">
              <button onclick="window.fookApp.deleteTransaction('${t.id}')" class="btn btn-ghost btn-icon" style="color:var(--text-muted); min-width:30px; min-height:30px;">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Mobile card list
    if (mList) {
      mList.innerHTML = txs.map(t => {
        const isIncome  = t.type === 'income';
        const homeVal   = CurrencyEngine.convert(t.amount, t.currency, hc);
        const isForeign = t.currency.toUpperCase() !== hc.toUpperCase();
        const typeColor = isIncome ? 'var(--accent-green)' : 'var(--accent-rose)';
        return `
          <div class="ledger-row-card">
            <div class="type-dot" style="background:${typeColor}; margin-top:5px;"></div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <div style="min-width:0;">
                  <p style="font-size:13px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.notes || t.category}</p>
                  <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">${t.category} · ${t.date}</p>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                  <p class="num blur-private" style="font-size:14px; font-weight:700; color:${typeColor};">${isIncome?'+':'−'}${CurrencyEngine.format(t.amount, t.currency)}</p>
                  ${isForeign ? `<p class="num blur-private" style="font-size:11px; color:var(--text-muted);">${CurrencyEngine.format(homeVal, hc)}</p>` : ''}
                </div>
              </div>
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                ${t.isRecurring ? '<span class="badge badge-cyan" style="font-size:9px;">Recurring</span>' : ''}
                ${t.isTaxDeductible ? '<span class="badge badge-amber" style="font-size:9px;">★ Tax-Ded.</span>' : ''}
                <button onclick="window.fookApp.deleteTransaction('${t.id}')" style="margin-left:auto; background:none; border:none; cursor:pointer; color:var(--text-muted); padding:4px; display:flex; align-items:center; min-width:28px; min-height:28px; justify-content:center;">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
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
      if (!sorted.length) { dedBreakdown.innerHTML = '<p class="c-muted" style="font-size:12px;">Mark expenses as "Tax Deductible" to see breakdown.</p>'; }
      else {
        const total = sorted.reduce((s,[,v]) => s+v, 0);
        dedBreakdown.innerHTML = sorted.map(([cat, amt]) => {
          const pct = total > 0 ? Math.round((amt/total)*100) : 0;
          return `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
            <span style="font-size:13px; color:var(--text-primary);">${cat}</span>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:11px; color:var(--text-muted);">${pct}%</span>
              <span class="num c-amber blur-private" style="font-weight:700;">${CurrencyEngine.format(amt, hc)}</span>
            </div>
          </div>`;
        }).join('');
      }
    }

    const incBreakdown = document.getElementById('tax-income-breakdown');
    if (incBreakdown) {
      const sorted = Object.entries(incomeByCategory).sort((a,b) => b[1]-a[1]);
      if (!sorted.length) { incBreakdown.innerHTML = '<p class="c-muted" style="font-size:12px;">Log income to see source breakdown.</p>'; }
      else {
        const total = sorted.reduce((s,[,v]) => s+v, 0);
        incBreakdown.innerHTML = sorted.map(([cat, amt], i) => {
          const pct = total > 0 ? Math.round((amt/total)*100) : 0;
          const color = CLIENT_COLORS[i % CLIENT_COLORS.length];
          return `<div style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:12px;">
              <span style="color:var(--text-primary); font-weight:600;">${cat}</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="color:var(--text-muted); font-size:11px;">${pct}%</span>
                <span class="num blur-private" style="font-weight:700; color:${color};">${CurrencyEngine.format(amt, hc)}</span>
              </div>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
          </div>`;
        }).join('');
      }
    }
  }

  // ──────────────────────────────────────────
  // EXPORTS
  // ──────────────────────────────────────────
  exportCSV() {
    const hc = this.state.settings.homeCurrency;
    let csv = 'ID,Date,Type,Category,Original Amount,Currency,Home Amount,Home Currency,Notes,Client,Recurring,Tax Deductible\n';
    this.state.transactions.forEach(t => {
      const hv = CurrencyEngine.convert(t.amount, t.currency, hc).toFixed(2);
      csv += `"${t.id}","${t.date}","${t.type}","${t.category}",${t.amount},"${t.currency}",${hv},"${hc}","${(t.notes||'').replace(/"/g,'""')}","${(t.client||'').replace(/"/g,'""')}",${t.isRecurring?'YES':'NO'},${t.isTaxDeductible?'YES':'NO'}\n`;
    });
    this.downloadBlob(csv, `fook_ledger_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  exportJSON() {
    this.downloadBlob(JSON.stringify(this.state, null, 2), `fook_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  }

  downloadBlob(content, filename, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 200);
  }

  // ──────────────────────────────────────────
  // UTILITY
  // ──────────────────────────────────────────
  setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// Helper: estimate historical mean excluding a specific date
function histAmtsFrom(histInHome, excludeDate) {
  const others = histInHome.filter(h => h.date !== excludeDate).map(h => h.amount);
  return others.length ? others.reduce((a,b)=>a+b,0)/others.length : 0;
}

// ═══════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  window.fookApp = new FookApp();
  // Apply privacy on load if enabled
  if (window.fookApp.state.settings.privacyMode) {
    document.body.classList.add('privacy-active');
  }
});
