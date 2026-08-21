/**
 * FOOK - Embedded Offline & Live Currency Exchange Matrix
 * Offline-first by default with optional live exchange sync.
 * Contains exchange rates relative to USD (1.00 USD benchmark).
 */

const CURRENCY_DATABASE = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0000, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.9250, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.7900, flag: '🇬🇧' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 83.5000, flag: '🇮🇳' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateToUSD: 1480.0000, flag: '🇳🇬' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateToUSD: 130.5000, flag: '🇰🇪' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateToUSD: 58.2000, flag: '🇵🇭' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateToUSD: 5.4500, flag: '🇧🇷' },
  ARS: { code: 'ARS', symbol: '$', name: 'Argentine Peso', rateToUSD: 930.0000, flag: '🇦🇷' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateToUSD: 36.8000, flag: '🇹🇭' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateToUSD: 25400.0000, flag: '🇻🇳' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateToUSD: 16350.0000, flag: '🇮🇩' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', rateToUSD: 18.2000, flag: '🇲🇽' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.3650, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.5100, flag: '🇦🇺' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 157.8000, flag: '🇯🇵' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToUSD: 18.1500, flag: '🇿🇦' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateToUSD: 47.6000, flag: '🇪🇬' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rateToUSD: 15.2000, flag: '🇬🇭' },
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', rateToUSD: 278.5000, flag: '🇵🇰' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rateToUSD: 117.5000, flag: '🇧🇩' },
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso', rateToUSD: 4120.0000, flag: '🇨🇴' },
  CLP: { code: 'CLP', symbol: '$', name: 'Chilean Peso', rateToUSD: 935.0000, flag: '🇨🇱' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rateToUSD: 3.7800, flag: '🇵🇪' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateToUSD: 32.8000, flag: '🇹🇷' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUSD: 3.6725, flag: '🇦🇪' },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateToUSD: 3.7500, flag: '🇸🇦' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 1.3520, flag: '🇸🇬' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateToUSD: 4.7100, flag: '🇲🇾' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateToUSD: 1380.0000, flag: '🇰🇷' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.8950, flag: '🇨🇭' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateToUSD: 1.6300, flag: '🇳🇿' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateToUSD: 10.4500, flag: '🇸🇪' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rateToUSD: 10.6000, flag: '🇳🇴' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rateToUSD: 3.9800, flag: '🇵🇱' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', rateToUSD: 40.5000, flag: '🇺🇦' },
};

// Aliases for natural language detection
const CURRENCY_ALIASES = {
  '$': 'USD',
  'usd': 'USD',
  'dollar': 'USD',
  'dollars': 'USD',
  'bucks': 'USD',
  '€': 'EUR',
  'eur': 'EUR',
  'euro': 'EUR',
  'euros': 'EUR',
  '£': 'GBP',
  'gbp': 'GBP',
  'pound': 'GBP',
  'pounds': 'GBP',
  '₹': 'INR',
  'inr': 'INR',
  'rupee': 'INR',
  'rupees': 'INR',
  'rs': 'INR',
  'lakh': 'INR',
  'crore': 'INR',
  '₦': 'NGN',
  'ngn': 'NGN',
  'naira': 'NGN',
  'ksh': 'KES',
  'kes': 'KES',
  'shilling': 'KES',
  'shillings': 'KES',
  '₱': 'PHP',
  'php': 'PHP',
  'peso': 'PHP',
  'pesos': 'PHP',
  'r$': 'BRL',
  'brl': 'BRL',
  'reais': 'BRL',
  'real': 'BRL',
  'ars': 'ARS',
  '฿': 'THB',
  'thb': 'THB',
  'baht': 'THB',
  '₫': 'VND',
  'vnd': 'VND',
  'dong': 'VND',
  'rp': 'IDR',
  'idr': 'IDR',
  'rupiah': 'IDR',
  'mxn': 'MXN',
  'c$': 'CAD',
  'cad': 'CAD',
  'a$': 'AUD',
  'aud': 'AUD',
  '¥': 'JPY',
  'jpy': 'JPY',
  'yen': 'JPY',
  'zar': 'ZAR',
  'rand': 'ZAR',
  'egp': 'EGP',
  'ghs': 'GHS',
  'cedi': 'GHS',
  'pkr': 'PKR',
  'bdt': 'BDT',
  'taka': 'BDT',
  'cop': 'COP',
  'clp': 'CLP',
  'pen': 'PEN',
  'sol': 'PEN',
  'try': 'TRY',
  'lira': 'TRY',
  'aed': 'AED',
  'dirham': 'AED',
  'sar': 'SAR',
  'riyal': 'SAR',
  'sgd': 'SGD',
  'myr': 'MYR',
  'ringgit': 'MYR',
  'krw': 'KRW',
  'won': 'KRW',
  'chf': 'CHF',
  'franc': 'CHF',
  'nzd': 'NZD',
  'sek': 'SEK',
  'nok': 'NOK',
  'pln': 'PLN',
  'zloty': 'PLN',
  'uah': 'UAH',
  'hryvnia': 'UAH'
};

class CurrencyEngine {
  /**
   * Convert amount from source currency to target currency
   */
  static convert(amount, fromCode, toCode) {
    if (!amount || isNaN(amount)) return 0;
    const from = (fromCode || 'USD').toUpperCase();
    const to = (toCode || 'USD').toUpperCase();
    if (from === to) return amount;

    const fromData = CURRENCY_DATABASE[from] || { rateToUSD: 1.0 };
    const toData = CURRENCY_DATABASE[to] || { rateToUSD: 1.0 };

    const amountInUSD = amount / fromData.rateToUSD;
    return amountInUSD * toData.rateToUSD;
  }

  /**
   * Format money nicely with currency symbol or code
   */
  static format(amount, currencyCode = 'USD', decimals = 2) {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    const code = (currencyCode || 'USD').toUpperCase();
    const curr = CURRENCY_DATABASE[code] || { symbol: code, name: code };
    
    const formattedNum = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return `${curr.symbol} ${formattedNum}`;
  }

  /**
   * Detect currency from text string
   */
  static detectCurrency(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    
    const directKeys = Object.keys(CURRENCY_ALIASES).sort((a,b) => b.length - a.length);
    for (const key of directKeys) {
      const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(^|\\s|\\d)${escaped}(\\s|\\d|$)`, 'i');
      if (regex.test(lower) || lower.includes(key)) {
        return CURRENCY_ALIASES[key];
      }
    }
    return 'USD';
  }

  /**
   * Get all currencies list with flag and description
   */
  static getCurrenciesList() {
    return Object.values(CURRENCY_DATABASE);
  }

  /**
   * Optional live exchange rate sync (with local offline cache fallback)
   */
  static async syncLiveRates() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Network error fetching live rates');
      const data = await res.json();
      if (data && data.rates) {
        let updatedCount = 0;
        for (const [code, rate] of Object.entries(data.rates)) {
          if (CURRENCY_DATABASE[code]) {
            CURRENCY_DATABASE[code].rateToUSD = rate;
            updatedCount++;
          }
        }
        localStorage.setItem('fook_live_rates_updated', new Date().toISOString());
        return { success: true, count: updatedCount, time: data.time_last_update_utc || new Date().toISOString() };
      }
    } catch(err) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Unknown error' };
  }
}

// Load cached live rates if available
try {
  const cachedRates = localStorage.getItem('fook_cached_rates');
  if (cachedRates) {
    const parsed = JSON.parse(cachedRates);
    for (const [code, rate] of Object.entries(parsed)) {
      if (CURRENCY_DATABASE[code]) {
        CURRENCY_DATABASE[code].rateToUSD = rate;
      }
    }
  }
} catch(e) {}
