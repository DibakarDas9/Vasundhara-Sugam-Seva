
interface ParsedItem {
    name?: string;
    quantity?: number;
    unit?: string;
    expiryDate?: string; // ISO date
    category?: string;
    originalTranscript: string;
    detectedLanguage?: 'en' | 'hi' | 'bn' | 'mixed';
}

// Number mappings for Hindi and Bengali
const NUMBER_MAP: Record<string, number> = {
    // Hindi
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5, 'che': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
    'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15, 'solah': 16, 'satra': 17, 'athara': 18, 'unnis': 19, 'bees': 20,
    'aadha': 0.5, 'dhai': 2.5, 'dedh': 1.5,
    // Bengali
    'dui': 2, 'tin': 3, 'choy': 6, 'sat': 7, 'at': 8, 'noy': 9, 'dosh': 10,
    'baro': 12, 'ponero': 15, 'kuri': 20,
    'ad': 0.5, 'adha': 0.5, 'der': 1.5, 'arai': 2.5
};

const UNIT_MAP: Record<string, string> = {
    // Hindi/Bengali variations
    'kilo': 'kg', 'kilogram': 'kg', 'g': 'g', 'gram': 'g', 'grams': 'g',
    'litre': 'l', 'liter': 'l', 'ml': 'ml',
    'darjan': 'dozen', 'dozen': 'dozen',
    'piece': 'pieces', 'pieces': 'pieces', 'pcs': 'pieces',
    'packet': 'pack', 'pack': 'pack',
    'bosta': 'bag', 'tholi': 'bag', 'bag': 'bag',
    'ta': 'pieces', // Bengali '5 ta' -> 5 pieces
    'ti': 'pieces',
    'khana': 'pieces', // Hindi 'ek khana'
};

const EXPIRY_KEYWORDS = ['expiry', 'expire', 'expires', 'meyad', 'khatam', 'kharab', 'validity', 'valid', 'din', 'days', 'day'];

const CATEGORY_KEYWORDS = ['category', 'bibhag', 'type', 'kism', 'group'];

export function parseVoiceInput(transcript: string): ParsedItem {
    let text = transcript.toLowerCase().trim();

    // 1. Normalize Numbers (Word to Digit)
    // We iterate through our map and replace whole words
    Object.entries(NUMBER_MAP).forEach(([word, val]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, val.toString());
    });

    // 2. Extract Quantity and Unit
    // Regex looks for: Number + (optional space) + Unit
    // Examples: "2 kg", "5 pieces", "10 ta", "2.5 litre"
    let quantity: number | undefined;
    let unit: string | undefined;

    // Match number followed by unit
    const qtyUnitRegex = /(\d+(?:\.\d+)?)\s*([a-z]+)/i;
    const qtyMatch = text.match(qtyUnitRegex);

    if (qtyMatch) {
        const num = parseFloat(qtyMatch[1]);
        const potentialUnit = qtyMatch[2];

        // Check if the word following the number is a known unit
        if (UNIT_MAP[potentialUnit] || ['kg', 'g', 'l', 'ml'].includes(potentialUnit)) {
            quantity = num;
            unit = UNIT_MAP[potentialUnit] || potentialUnit;
            // Remove this part from text to help find name later
            text = text.replace(qtyMatch[0], '');
        } else if (potentialUnit === 'ta' || potentialUnit === 'ti') {
            // Specific Bengali case: "5 ta" -> 5 pieces
            quantity = num;
            unit = 'pieces';
            text = text.replace(qtyMatch[0], '');
        }
    }

    // If no unit found but number exists, might be just quantity (e.g. "2 apples")
    if (!quantity) {
        const justNumRegex = /(\d+(?:\.\d+)?)/;
        const numMatch = text.match(justNumRegex);
        if (numMatch) {
            quantity = parseFloat(numMatch[1]);
            // Don't remove yet, might be part of expiry
        }
    }

    // 3. Extract Expiry
    // Look for "expiry X days", "X din baad", "meyad X din"
    let expiryDate: string | undefined;
    let expiryDays: number | undefined;

    // Pattern: (keyword) ... (number) ... (days/din) OR (number) ... (days/din) ... (keyword)
    // Simplified: look for number near 'days', 'din', 'month', 'mahina', 'mash'

    const daysRegex = /(\d+)\s*(days?|din)/i;
    const daysMatch = text.match(daysRegex);

    if (daysMatch) {
        expiryDays = parseInt(daysMatch[1]);
        text = text.replace(daysMatch[0], ''); // Remove expiry part
    } else {
        // Check for "tomorrow" / "kal"
        if (text.includes('tomorrow') || text.includes('kal')) {
            expiryDays = 1;
            text = text.replace(/\b(tomorrow|kal)\b/g, '');
        }
        // Check for "next week" / "agle hafte" / "porer soptaho"
        else if (text.includes('next week') || text.includes('agle hafte') || text.includes('porer soptaho')) {
            expiryDays = 7;
        }
    }

    if (expiryDays !== undefined) {
        const d = new Date();
        d.setDate(d.getDate() + expiryDays);
        expiryDate = d.toISOString().split('T')[0];
    }

    // 4. Extract Category
    let category: string | undefined;
    // Simple check for common categories if explicitly mentioned or known words
    const knownCategories = ['fruit', 'vegetable', 'dairy', 'meat', 'grain', 'snack', 'spice', 'household', 'sobji', 'phal', 'dudh'];
    const catRegex = new RegExp(`\\b(${knownCategories.join('|')})s?\\b`, 'i');
    const catMatch = text.match(catRegex);

    if (catMatch) {
        let cat = catMatch[1];
        // Map native terms to standard categories
        if (cat === 'sobji') cat = 'Vegetables';
        if (cat === 'phal') cat = 'Fruits';
        if (cat === 'dudh') cat = 'Dairy';
        // Capitalize
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        text = text.replace(catMatch[0], '');
    }

    // 5. Extract Name
    // Cleanup remaining text
    let name = text;
    // Remove keywords
    const keywordsToRemove = [...EXPIRY_KEYWORDS, ...CATEGORY_KEYWORDS, 'add', 'koro', 'karo', 'chahiye', 'chai', 'expiry', 'date', 'hai', 'ko', 'ka'];
    keywordsToRemove.forEach(kw => {
        name = name.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
    });

    // Remove numbers if they were used for quantity/expiry (simple heuristic: remove all remaining digits if we found qty/expiry)
    if (quantity || expiryDays) {
        name = name.replace(/\d+/g, '');
    }

    // Clean up punctuation and spaces
    name = name.replace(/[.,\-]/g, ' ').replace(/\s+/g, ' ').trim();

    // Fallback if name is empty
    if (!name) name = "Unknown Item";

    return {
        name,
        quantity,
        unit,
        expiryDate,
        category,
        originalTranscript: transcript,
        detectedLanguage: 'mixed' // Hard to distinguish perfectly, usually mixed
    };
}

/**
 * Parse a spoken date string like "01 12 26" or "1st December 2026"
 * Returns ISO date string (YYYY-MM-DD) or null
 */
export function parseDateString(transcript: string): string | null {
    let text = transcript.toLowerCase().trim();

    // Normalize numbers first (same as parseVoiceInput)
    Object.entries(NUMBER_MAP).forEach(([word, val]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, val.toString());
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 1. Try relative time patterns: "after X days/weeks/months/years" or "in X days/weeks/months/years"
    // Also support Hindi/Bengali: "X din baad", "X din mein"
    // Also support "a month", "a year" -> treat "a" or "an" as 1

    // Pre-process "a" / "an" / "ek" -> "1" for time units
    text = text.replace(/\b(a|an|ek)\s+(day|week|month|year|saal|mahina|hafta|soptaho|din)\b/gi, '1 $2');

    const relativePatterns = [
        // English patterns
        /(?:after|in)\s+(\d+)\s*(day|days|din)/i,
        /(?:after|in)\s+(\d+)\s*(week|weeks|soptaho|hafte)/i,
        /(?:after|in)\s+(\d+)\s*(month|months|mahina|mash)/i,
        /(?:after|in)\s+(\d+)\s*(year|years|saal|bochor)/i,
        // Hindi/Bengali patterns
        /(\d+)\s*(din|day|days)\s+(?:baad|mein|bad)/i,
        /(\d+)\s*(hafte|soptaho|week|weeks)\s+(?:baad|mein|bad)/i,
        /(\d+)\s*(mahina|mash|month|months)\s+(?:baad|mein|bad)/i,
        /(\d+)\s*(saal|bochor|year|years)\s+(?:baad|mein|bad)/i,
    ];

    for (const pattern of relativePatterns) {
        const match = text.match(pattern);
        if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();

            const futureDate = new Date(now);

            if (unit.includes('day') || unit === 'din') {
                futureDate.setDate(futureDate.getDate() + amount);
            } else if (unit.includes('week') || unit === 'hafte' || unit === 'soptaho') {
                futureDate.setDate(futureDate.getDate() + (amount * 7));
            } else if (unit.includes('month') || unit === 'mahina' || unit === 'mash') {
                futureDate.setMonth(futureDate.getMonth() + amount);
            } else if (unit.includes('year') || unit === 'saal' || unit === 'bochor') {
                futureDate.setFullYear(futureDate.getFullYear() + amount);
            }

            return futureDate.toISOString().split('T')[0];
        }
    }

    // 2. Try "DD MM YY" or "DD MM YYYY" pattern (e.g. "01 12 26")
    // Allow spaces, slashes, dashes
    const numericMatch = text.match(/(\d{1,2})[\s\/\-\.]+(\d{1,2})[\s\/\-\.]+(\d{2,4})/);
    if (numericMatch) {
        const d = parseInt(numericMatch[1]);
        const m = parseInt(numericMatch[2]);
        let y = parseInt(numericMatch[3]);

        // Handle 2-digit year
        if (y < 100) {
            y += 2000;
        }

        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
    }

    // 3. Try "DD Month" pattern (e.g. "5th December")
    // Simple month mapping
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/);

    if (monthMatch) {
        const d = parseInt(monthMatch[1]);
        const monthStr = monthMatch[2].substring(0, 3);
        const mIndex = months.indexOf(monthStr);

        if (mIndex > -1 && d >= 1 && d <= 31) {
            // Assume current year, or next year if month is in past
            let y = currentYear;
            if (mIndex < currentMonth) {
                y++;
            }
            // Check for explicit year
            const yearMatch = text.match(/\d{4}/);
            if (yearMatch) {
                y = parseInt(yearMatch[0]);
            }

            return `${y}-${String(mIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
    }

    return null;
}

/**
 * Parse a spoken price string like "50 rupees", "500", "ek sau pachas"
 * Returns object with amount and isPerUnit flag
 */
export function parsePrice(transcript: string): { amount: number, isPerUnit: boolean } | null {
    let text = transcript.toLowerCase().trim();

    // Normalize numbers first
    Object.entries(NUMBER_MAP).forEach(([word, val]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, val.toString());
    });

    // Look for currency keywords
    // "50 rupees", "rs 50", "50 taka", "50"
    const priceRegex = /(?:rs\.?|rupees?|taka|inr)?\s*(\d+(?:\.\d+)?)\s*(?:rs\.?|rupees?|taka|inr)?/i;
    const match = text.match(priceRegex);

    if (match) {
        const amount = parseFloat(match[1]);

        // Check for per-unit keywords
        // "per piece", "per kg", "each", "prati", "per unit"
        const perUnitRegex = /(?:per|each|prati|\/)\s*(?:piece|kg|unit|liter|litre|item|packet|bag|box|dozen|g|ml|l)/i;
        const isPerUnit = perUnitRegex.test(text) || text.includes('each') || text.includes('prati');

        return { amount, isPerUnit };
    }

    return null;
}
