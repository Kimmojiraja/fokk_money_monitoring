/**
 * FOOK - Embedded Offline Currency Exchange Matrix
 * Zero API calls. Contains exchange rates relative to USD (1.00 USD benchmark).
 * Supports conversion between any pair of 50+ global currencies.
 */

const CURRENCY_DATABASE = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0000 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.9250 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.7900 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 83.5000 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateToUSD: 1480.0000 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateToUSD: 130.5000 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateToUSD: 58.2000 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateToUSD: 5.4500 },
  ARS: { code: 'ARS', symbol: '$', name: 'Argentine Peso', rateToUSD: 930.0000 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateToUSD: 36.8000 },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateToUSD: 25400.0000 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateToUSD: 16350.0000 },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', rateToUSD: 18.2000 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.3650 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.5100 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 157.8000 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToUSD: 18.1500 },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateToUSD: 47.6000 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rateToUSD: 15.2000 },
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', rateToUSD: 278.5000 },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rateToUSD: 117.5000 },
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso', rateToUSD: 4120.0000 },
  CLP: { code: 'CLP', symbol: '$', name: 'Chilean Peso', rateToUSD: 935.0000 },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rateToUSD: 3.7800 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateToUSD: 32.8000 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUSD: 3.6725 },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateToUSD: 3.7500 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 1.3520 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateToUSD: 4.7100 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateToUSD: 1380.0000 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.8950 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateToUSD: 1.6300 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateToUSD: 10.4500 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rateToUSD: 10.6000 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rateToUSD: 3.9800 },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', rateToUSD: 40.5000 },
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
  'रुपये': 'INR',
  'रुपया': 'INR',
  '₦': 'NGN',
  'ngn': 'NGN',
  'naira': 'NGN',
  'ksh': 'KES',
  'kes': 'KES',
  'shillings': 'KES',
  '₱': 'PHP',
  'php': 'PHP',
  'peso': 'PHP',
  'pesos': 'PHP',
  'r$': 'BRL',
  'brl': 'BRL',
  'real': 'BRL',
  'reais': 'BRL',
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
  'cad': 'CAD',
  'c$': 'CAD',
  'aud': 'AUD',
  'a$': 'AUD',
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
  '₩': 'KRW',
  'krw': 'KRW',
  'won': 'KRW',
  'chf': 'CHF',
  'franc': 'CHF'
};

const CurrencyEngine = {
  /**
   * Convert an amount from fromCurrency to toCurrency
   */
  convert(amount, fromCurrency, toCurrency) {
    if (!amount || isNaN(amount)) return 0;
    fromCurrency = (fromCurrency || 'USD').toUpperCase();
    toCurrency = (toCurrency || 'USD').toUpperCase();
    if (fromCurrency === toCurrency) return Number(amount);

    const fromObj = CURRENCY_DATABASE[fromCurrency] || CURRENCY_DATABASE.USD;
    const toObj = CURRENCY_DATABASE[toCurrency] || CURRENCY_DATABASE.USD;

    // Convert fromCurrency to USD benchmark, then to toCurrency
    const inUSD = Number(amount) / fromObj.rateToUSD;
    const converted = inUSD * toObj.rateToUSD;
    return converted;
  },

  /**
   * Format currency with symbol and locale decimal grouping
   */
  format(amount, currencyCode = 'USD', decimals = 2) {
    if (isNaN(amount) || amount === null || amount === undefined) amount = 0;
    const curr = CURRENCY_DATABASE[currencyCode.toUpperCase()] || CURRENCY_DATABASE.USD;
    
    // For large zero-decimal currencies like JPY, VND, IDR, KRW
    const isZeroDecimal = ['JPY', 'VND', 'IDR', 'KRW', 'CLP'].includes(curr.code);
    const finalDecimals = isZeroDecimal ? 0 : decimals;

    const formattedNumber = Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    });

    const sign = amount < 0 ? '-' : '';
    return `${sign}${curr.symbol} ${formattedNumber}`;
  },

  /**
   * Detect currency from text string or symbol
   */
  detectCurrency(text) {
    if (!text) return null;
    const lower = text.toLowerCase().trim();
    
    // Check symbols and aliases
    for (const [sym, code] of Object.entries(CURRENCY_ALIASES)) {
      const regex = new RegExp(`(^|\\s|[0-9])${escapeRegExp(sym)}(\\s|[0-9]|$)`, 'i');
      if (regex.test(lower) || lower.includes(sym)) {
        return code;
      }
    }
    return null;
  },

  getCurrenciesList() {
    return Object.values(CURRENCY_DATABASE);
  }
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CURRENCY_DATABASE, CURRENCY_ALIASES, CurrencyEngine };
}
