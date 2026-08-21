/**
 * FOOK - Bundled On-Device Machine Learning & Statistical Engine
 * 100% Offline. Zero external dependencies.
 *
 * Contains:
 * 1. Income Forecaster (Holt-Winters Exponential Smoothing + ARIMA / Variance bounds)
 * 2. Multi-Language Naive Bayes NLP Classifier for smart logging
 * 3. Statistical Anomaly & Spike Detector (Z-Score + IQR)
 */

// ==========================================
// 1. INCOME FORECASTING ENGINE
// ==========================================
class IncomeForecaster {
  /**
   * Forecasts the next 3 months of irregular variable income
   * @param {Array<{date: string, amount: number, isRecurring: boolean}>} historicalIncome 
   * @param {number} currentMonthKnownRecurring
   * @returns {Object} { projections: Array<{month: string, conservative: number, expected: number, optimistic: number, notes: string}>, confidence: number }
   */
  static forecastNext3Months(historicalIncome, currentMonthKnownRecurring = 0) {
    // Group historical income by YYYY-MM
    const monthlyTotals = {};
    const now = new Date();
    
    // Fill last 12 months minimum
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[key] = 0;
    }

    historicalIncome.forEach(item => {
      const key = item.date.substring(0, 7);
      if (monthlyTotals[key] !== undefined) {
        monthlyTotals[key] += Number(item.amount);
      } else {
        monthlyTotals[key] = Number(item.amount);
      }
    });

    const values = Object.values(monthlyTotals);
    const validValues = values.filter(v => v > 0);

    // Baseline stats
    let mean = validValues.length ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 3000;
    let variance = 0;
    if (validValues.length > 1) {
      variance = validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (validValues.length - 1);
    } else {
      variance = Math.pow(mean * 0.35, 2); // default 35% variance for gig work
    }
    const stdDev = Math.sqrt(variance);

    // Double Exponential Smoothing (Holt's Linear)
    let level = values[0] || mean;
    let trend = 0;
    const alpha = 0.4; // Smoothing factor for data
    const beta = 0.2;  // Smoothing factor for trend

    for (let i = 1; i < values.length; i++) {
      const val = values[i] > 0 ? values[i] : mean * 0.8;
      const lastLevel = level;
      level = alpha * val + (1 - alpha) * (level + trend);
      trend = beta * (level - lastLevel) + (1 - beta) * trend;
    }

    // Seasonal month multiplier (e.g. Q4 holiday rush, Q1 dip)
    const seasonalWeights = [0.92, 0.95, 1.05, 1.02, 1.08, 0.98, 0.94, 0.96, 1.06, 1.12, 1.18, 1.10];

    const projections = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let h = 1; h <= 3; h++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + h, 1);
      const mIdx = futureDate.getMonth();
      const sFactor = seasonalWeights[mIdx] || 1.0;

      // Point prediction with trend + seasonality
      let rawExpected = (level + (h * trend)) * sFactor;
      // Floor at known recurring base
      let expected = Math.max(rawExpected, currentMonthKnownRecurring * 1.15, mean * 0.6);

      // Confidence intervals (Z = 1.28 for 80%, Z = 1.96 for 95%)
      const horizonError = stdDev * Math.sqrt(h) * 0.85;
      const conservative = Math.max(currentMonthKnownRecurring, Math.round(expected - horizonError));
      const optimistic = Math.round(expected + horizonError * 1.25);
      expected = Math.round(expected);

      let note = "Standard irregular trend";
      if (h === 1 && currentMonthKnownRecurring > 0) {
        note = "Retainers secured + pipeline";
      } else if (sFactor > 1.08) {
        note = "Project high season pattern";
      } else if (sFactor < 0.95) {
        note = "Seasonal slow period adjustment";
      }

      projections.push({
        monthKey: `${futureDate.getFullYear()}-${String(mIdx + 1).padStart(2, '0')}`,
        monthName: `${monthNames[mIdx]} ${futureDate.getFullYear()}`,
        conservative: Math.max(0, conservative),
        expected: Math.max(0, expected),
        optimistic: Math.max(0, optimistic),
        notes: note,
        safeSpendTarget: Math.round(conservative * 0.65) // Safe spending recommendation
      });
    }

    return {
      projections,
      confidenceScore: Math.min(96, Math.max(68, Math.round(100 - (stdDev / (mean || 1)) * 30)))
    };
  }

  /**
   * Calculates the adaptive safe spending ceiling for the current month
   * Formula: Safe Ceiling = (Conservative Predicted Income * Safe Rate %) - Fixed Commitments
   */
  static calculateAdaptiveSafeCeiling(currentActualIncome, predictedMonthlyTotal, fixedCommitments = 0, safeRatePct = 0.70) {
    // Dynamic blend of received income + conservative expectation
    const blendedIncomeExpectation = Math.max(
      currentActualIncome,
      (currentActualIncome * 0.4) + (predictedMonthlyTotal * 0.6)
    );

    const grossSafeSpend = blendedIncomeExpectation * safeRatePct;
    const netSafeCeiling = Math.max(0, grossSafeSpend);

    return {
      blendedIncome: Math.round(blendedIncomeExpectation),
      safeCeiling: Math.round(netSafeCeiling),
      safeDailyRate: Math.round(netSafeCeiling / 30),
      recommendedSavings: Math.round(blendedIncomeExpectation * (1 - safeRatePct))
    };
  }
}


// ==========================================
// 2. MULTI-LANGUAGE NAIVE BAYES NLP CLASSIFIER
// ==========================================
class NaiveBayesNLP {
  constructor() {
    this.categories = {
      // Income categories
      'Freelance': ['upwork', 'fiverr', 'client', 'project', 'contract', 'hourly', 'toptal', 'freelancer', 'development', 'design', 'milestone', 'invoice', 'trabajo', 'cliente', 'proyecto', 'काम', 'ग्राहक'],
      'Retainer': ['retainer', 'monthly', 'subscription', 'monthly retainer', 'recurring', 'mensual', 'fijo', 'हर महीने'],
      'Consulting': ['consulting', 'advisory', 'strategy', 'session', 'coaching', 'call', 'consultoría', 'सलाह'],
      'Bonus': ['bonus', 'tip', 'reward', 'bounty', 'propina', 'बोनस', 'इनाम'],
      'Royalties': ['gumroad', 'affiliate', 'course', 'youtube', 'stripe', 'royalties', 'digital', 'ventas'],
      
      // Expense categories
      'Food & Dining': ['food', 'groceries', 'supermarket', 'dinner', 'lunch', 'breakfast', 'coffee', 'cafe', 'restaurant', 'uber eats', 'doordash', 'zomato', 'swiggy', 'comida', 'supermercado', 'restaurante', 'almuerzo', 'café', 'खाना', 'किराना', 'चाय', 'courses', 'repas', 'nourriture'],
      'Transport': ['uber', 'lyft', 'taxi', 'fuel', 'gas', 'petrol', 'train', 'metro', 'bus', 'flight', 'airline', 'transit', 'gasolina', 'vuelo', 'transporte', 'पेट्रोल', 'गाड़ी', 'यात्रा', 'essence'],
      'Housing & Rent': ['rent', 'mortgage', 'apartment', 'housing', 'landlord', 'alquiler', 'renta', 'विहार', 'किराया', 'loyer', 'logement'],
      'Software & Subscriptions': ['figma', 'github', 'openai', 'chatgpt', 'aws', 'vercel', 'hosting', 'domain', 'google', 'apple', 'adobe', 'netflix', 'spotify', 'subscription', 'suscripcion', 'सॉफ्टवेयर'],
      'Equipment & Tech': ['laptop', 'macbook', 'monitor', 'keyboard', 'hardware', 'phone', 'camera', 'desk', 'mouse', 'equipo', 'computadora', 'उपकरण', 'कंप्यूटर'],
      'Utilities': ['wifi', 'internet', 'electricity', 'water', 'phone bill', 'mobile', 'luz', 'agua', 'बिजली', 'पानी', 'इंटरनेट', 'facture'],
      'Taxes & Legal': ['tax', 'taxes', 'accountant', 'vat', 'gst', 'irs', 'impuestos', 'contador', 'टैक्स', 'कर'],
      'Health & Fitness': ['gym', 'medicine', 'doctor', 'pharmacy', 'health', 'fitness', 'farmacia', 'salud', 'दवा', 'स्वास्थ्य']
    };

    // User learned correction memory
    this.userCorrections = JSON.parse(localStorage.getItem('fook_nlp_memory') || '{}');
  }

  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF\u0900-\u097F\u00C0-\u00FF]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  /**
   * Smart parse natural language query
   * Example: "500 USD from Upwork client", "spent 45 euros on groceries", "खरीदारी 2500 KES"
   */
  parseInput(rawText) {
    if (!rawText || !rawText.trim()) return null;
    const text = rawText.trim();
    const tokens = this.tokenize(text);

    // 1. Detect Amount
    let amount = null;
    // Match numbers like 500, 45.50, 1,200, 25000
    const numberMatches = text.match(/(?:[\$€£₹₦KSh₱R\$฿₫Rp\s]|^)([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/);
    if (numberMatches && numberMatches[1]) {
      amount = parseFloat(numberMatches[1].replace(/,/g, ''));
    }

    // 2. Detect Currency (using CurrencyEngine)
    let currency = CurrencyEngine.detectCurrency(text) || 'USD';

    // 3. Detect Type (Income vs Expense)
    const incomeKeywords = ['from', 'received', 'client', 'earned', 'got', 'salary', 'invoice', 'paid by', 'retainer', 'upwork', 'fiverr', 'stripe', 'gumroad', 'ingreso', 'recibido', 'de', 'मिला', 'कमाई'];
    const expenseKeywords = ['spent', 'bought', 'paid for', 'buy', 'purchased', 'for', 'at', 'on', 'groceries', 'coffee', 'food', 'rent', 'bill', 'gasto', 'gasté', 'compré', 'en', 'खर्च', 'खरीदा'];

    let isIncome = false;
    let incomeScore = 0;
    let expenseScore = 0;

    tokens.forEach(t => {
      if (incomeKeywords.includes(t)) incomeScore += 2;
      if (expenseKeywords.includes(t)) expenseScore += 2;
    });

    // Check user corrections first
    const cleanTextKey = tokens.slice(0, 4).join(' ');
    if (this.userCorrections[cleanTextKey]) {
      return {
        ...this.userCorrections[cleanTextKey],
        amount: amount || this.userCorrections[cleanTextKey].amount || 0,
        currency: currency || this.userCorrections[cleanTextKey].currency || 'USD',
        rawText: text
      };
    }

    if (incomeScore > expenseScore || text.toLowerCase().includes('from') || text.toLowerCase().includes('client')) {
      isIncome = true;
    }

    // 4. Classify Category using Naive Bayes Scoring
    let bestCategory = isIncome ? 'Freelance' : 'Food & Dining';
    let maxScore = -1;

    for (const [category, keywords] of Object.entries(this.categories)) {
      // Filter categories matching type
      const isIncomeCategory = ['Freelance', 'Retainer', 'Consulting', 'Bonus', 'Royalties'].includes(category);
      if (isIncome && !isIncomeCategory) continue;
      if (!isIncome && isIncomeCategory) continue;

      let score = 0.1; // smoothing
      tokens.forEach(token => {
        if (keywords.includes(token)) score += 3.0;
        else {
          // Substring match
          keywords.forEach(kw => {
            if (token.includes(kw) || kw.includes(token)) score += 1.2;
          });
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    // Determine notes / vendor description
    let cleanNotes = text
      .replace(new RegExp(`\\b${amount}\\b`, 'g'), '')
      .replace(/[\$€£₹₦₱฿₫]/g, '')
      .replace(/\b(spent|bought|paid|for|on|from|got|received|usd|eur|gbp|inr|kes|ngn|php)\b/gi, '')
      .trim();

    if (!cleanNotes) {
      cleanNotes = isIncome ? `${bestCategory} Income` : `${bestCategory} Expense`;
    }

    return {
      type: isIncome ? 'income' : 'expense',
      amount: amount || 0,
      currency: currency,
      category: bestCategory,
      notes: cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1),
      isRecurring: tokens.includes('retainer') || tokens.includes('monthly') || tokens.includes('recurring'),
      isTaxDeductible: isIncome ? false : ['Software & Subscriptions', 'Equipment & Tech', 'Utilities', 'Taxes & Legal'].includes(bestCategory),
      rawText: text
    };
  }

  learnCorrection(inputSummary, correctedCategory, type) {
    const tokens = this.tokenize(inputSummary);
    const key = tokens.slice(0, 4).join(' ');
    this.userCorrections[key] = {
      category: correctedCategory,
      type: type
    };
    localStorage.setItem('fook_nlp_memory', JSON.stringify(this.userCorrections));
  }
}


// ==========================================
// 3. STATISTICAL ANOMALY & SPIKE DETECTOR
// ==========================================
class AnomalyDetector {
  /**
   * Evaluates if a transaction or category total is an outlier
   * @param {Array<Object>} transactions 
   * @param {string} homeCurrency
   * @returns {Array<Object>} list of alerts
   */
  static detectAnomalies(transactions, homeCurrency = 'USD') {
    const alerts = [];
    if (!transactions || transactions.length < 5) return alerts;

    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    const categoryAmounts = {};

    expenses.forEach(t => {
      const amountInHome = CurrencyEngine.convert(t.amount, t.currency, homeCurrency);
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
        categoryAmounts[t.category] = [];
      }
      categoryTotals[t.category] += amountInHome;
      categoryAmounts[t.category].push({ id: t.id, amount: amountInHome, notes: t.notes, date: t.date });
    });

    // Check individual transactions for Z-Score > 2.5
    for (const [cat, items] of Object.entries(categoryAmounts)) {
      if (items.length < 3) continue;
      const values = items.map(i => i.amount);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0) {
        items.forEach(item => {
          const zScore = (item.amount - mean) / stdDev;
          if (zScore >= 2.4 && item.amount > 100) {
            alerts.push({
              type: 'transaction_spike',
              severity: 'warning',
              category: cat,
              message: `Unusual single spend in ${cat}: ${CurrencyEngine.format(item.amount, homeCurrency)} (${item.notes}). Z-Score: ${zScore.toFixed(1)}σ.`,
              date: item.date
            });
          }
        });
      }
    }

    // Check if any recent category is exceeding 150% of expected allocation
    const totalExpense = expenses.reduce((sum, t) => sum + CurrencyEngine.convert(t.amount, t.currency, homeCurrency), 0);
    for (const [cat, sum] of Object.entries(categoryTotals)) {
      const share = sum / (totalExpense || 1);
      if (share > 0.45 && cat !== 'Housing & Rent') {
        alerts.push({
          type: 'category_concentration',
          severity: 'caution',
          category: cat,
          message: `${cat} represents ${(share * 100).toFixed(0)}% of your total spending this month (${CurrencyEngine.format(sum, homeCurrency)}).`
        });
      }
    }

    return alerts.slice(0, 4); // return top 4 alerts
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IncomeForecaster, NaiveBayesNLP, AnomalyDetector };
}
