// Common Utility Functions for HealthyBite
import { dictionary, currencyRates } from "./data.js";

/**
 * Format a mobile number to Sri Lankan standard +94 format
 * @param {string} number
 * @returns {string} Formatted number or original if invalid
 */
export function formatMobile(number) {
    if (!number) return '';
    let cleaned = number.toString().replace(/\D/g, '');

    let normalized;
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
        normalized = cleaned.substring(1);
    } else if (cleaned.length === 9) {
        normalized = cleaned;
    } else if (cleaned.startsWith('94') && (cleaned.length === 11 || cleaned.length === 12)) {
        normalized = cleaned.substring(cleaned.length - 9);
    } else {
        return number;
    }

    const network = normalized.substring(0, 2);
    const firstThree = normalized.substring(2, 5);
    const lastFour = normalized.substring(5, 9);

    return `+94 ${network} ${firstThree} ${lastFour}`;
}

/**
 * Validate if a string is a valid Sri Lankan mobile number
 * @param {string} number 
 * @returns {boolean}
 */
export function validateMobile(number) {
    if (!number) return false;
    const slMobileRegex = /^(?:0|94|\+94)?(7[0-9]{8})$/;
    const cleaned = number.toString().replace(/[\s-]/g, '');
    return slMobileRegex.test(cleaned);
}

/**
 * Format a number with commas and decimals
 * @param {number} number 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatNumber(number, decimals = 2) {
    if (isNaN(number)) return '0.00';
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

/**
 * Format a date string based on format tokens
 */
export function formatDate(arg1, arg2) {
    let formatStr = 'YYYY-MM-DD';
    let date = new Date();

    if (arg1 && !arg2 && (arg1 instanceof Date || !isNaN(Date.parse(arg1)))) {
        date = new Date(arg1);
    } else if (typeof arg1 === 'string' && !arg2) {
        formatStr = arg1;
    } else if (typeof arg1 === 'string' && arg2) {
        formatStr = arg1;
        date = new Date(arg2);
    }

    if (isNaN(date.getTime())) return '';

    const pad = (n) => n.toString().padStart(2, '0');

    const tokens = {
        YYYY: date.getFullYear(),
        YY: date.getFullYear().toString().slice(-2),
        MM: pad(date.getMonth() + 1),
        MMM: date.toLocaleString('default', { month: 'short' }),
        DD: pad(date.getDate()),
        HH: pad(date.getHours()),
        hh: pad(date.getHours() % 12 || 12),
        mm: pad(date.getMinutes()),
        ss: pad(date.getSeconds()),
        a: date.getHours() >= 12 ? 'PM' : 'AM'
    };

    return formatStr.replace(/YYYY|YY|MM|MMM|DD|HH|hh|mm|ss|\ba\b/g, match => tokens[match]);
}

export function formatTime(formatStr = 'hh:mm a', date = new Date()) {
    if (arguments.length === 1 && (formatStr instanceof Date || !isNaN(Date.parse(formatStr)))) {
        date = formatStr;
        formatStr = 'hh:mm a';
    }
    return formatDate(formatStr, date);
}

export function formatDateTime(formatStr = 'YYYY-MM-DD hh:mm a', date = new Date()) {
    if (arguments.length === 1 && (formatStr instanceof Date || !isNaN(Date.parse(formatStr)))) {
        date = formatStr;
        formatStr = 'YYYY-MM-DD hh:mm a';
    }
    return formatDate(formatStr, date);
}

/**
 * Get relative time string
 */
export function timeFromNow(date) {
    if (!date) return '';
    const now = new Date();
    const target = new Date(date);
    if (isNaN(target.getTime())) return '';

    const diffSeconds = (now - target) / 1000;
    const isFuture = diffSeconds < 0;
    const absDiff = Math.abs(diffSeconds);

    const nowDay = new Date(now).setHours(0, 0, 0, 0);
    const targetDay = new Date(target).setHours(0, 0, 0, 0);
    const dayDiff = Math.round((nowDay - targetDay) / 86400000);

    const timeStr = formatDate('hh:mm a', target);

    if (dayDiff === 1) return `yesterday at ${timeStr}`;
    if (dayDiff === -1) return `tomorrow at ${timeStr}`;

    if (dayDiff === 0) {
        const hours = Math.floor(absDiff / 3600);
        if (hours > 12) {
            return `today at ${timeStr}`;
        }
    }

    if (absDiff <= 30) return isFuture ? 'in 30 seconds' : '30 seconds ago';

    const minutes = Math.floor(absDiff / 60);
    if (minutes < 60) {
        return isFuture ? `in ${minutes} minutes` : `${minutes} minutes ago`;
    }

    const hours = Math.floor(absDiff / 3600);
    if (hours <= 12) {
        return isFuture ? `in ${hours} hours` : `${hours} hours ago`;
    }

    const days = Math.floor(absDiff / 86400);
    if (days <= 14) {
        return isFuture ? `in ${days} days` : `${days} days ago`;
    }

    if (days <= 28) {
        const weeks = Math.floor(days / 7);
        return isFuture ? `in ${weeks} weeks` : `${weeks} weeks ago`;
    }

    const months = Math.floor(days / 30);
    if (months <= 24) {
        return isFuture ? `in ${months} months` : `${months} months ago`;
    }

    const years = Math.floor(days / 365);
    return isFuture ? `in ${years} years` : `${years} years ago`;
}

/**
 * Start a countdown timer
 */
export function startTimer(seconds, onTick, onComplete) {
    let remaining = seconds;

    const formatTimer = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    if (onTick) onTick(formatTimer(remaining), remaining);

    const intervalId = setInterval(() => {
        remaining--;
        if (remaining >= 0) {
            if (onTick) onTick(formatTimer(remaining), remaining);
        } else {
            clearInterval(intervalId);
            if (onComplete) onComplete();
        }
    }, 1000);

    return {
        stop: () => clearInterval(intervalId)
    };
}

export function currentNav() {
    const path = window.location.pathname;
    let page = path.split('/').pop();
    if (!page || path === '/') {
        return 'index.html';
    }
    if (!page.includes('.')) {
        page += '.html';
    }
    return page;
}

export function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// --- Internationalization & Currency ---

let userSettings = JSON.parse(localStorage.getItem('healthybite-settings')) || {
    language: 'en',
    currency: 'LKR'
};

export function translate(key) {
    if (!key) return '';
    const lang = userSettings.language || 'en';
    const k = key.toLowerCase().replace(/ /g, '_');

    if (dictionary[lang] && dictionary[lang][k]) {
        return dictionary[lang][k];
    }

    if (dictionary['en'] && dictionary['en'][k]) {
        return dictionary['en'][k];
    }

    return key;
}

function saveSettings() {
    localStorage.setItem('healthybite-settings', JSON.stringify(userSettings));
    // User preferences syncing should handle via API separately if needed
}

export function setLanguage(langCode) {
    if (dictionary[langCode]) {
        userSettings.language = langCode;
        saveSettings();
        updatePageTranslations();
        setTimeout(() => window.location.reload(), 50);
    }
}

export function setCurrency(currencyCode) {
    if (currencyRates[currencyCode]) {
        userSettings.currency = currencyCode;
        saveSettings();
        setTimeout(() => window.location.reload(), 50);
    }
}

export function getSettings() {
    return { ...userSettings, rates: Object.keys(currencyRates), languages: Object.keys(dictionary) };
}

export function updatePageTranslations() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = translate(key);
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        el.placeholder = translate(key);
    });

    document.querySelectorAll('[data-translate-img]').forEach(el => {
        const key = el.getAttribute('data-translate-img');
        const src = translate(key);
        if (src && src !== key && (src.includes('/') || src.startsWith('http'))) {
            el.src = src;
        }
    });
}

export function formatCurrency(amount) {
    if (typeof amount !== 'number') return amount;

    const code = userSettings.currency || 'LKR';
    const currency = currencyRates[code] || currencyRates['LKR'];
    const converted = amount * currency.rate;

    return currency.symbol + ' ' + formatNumber(converted, 2);
}

export function numTypeInput(selector = 'input[type="number"], .num-type-input') {
    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
        input.addEventListener('wheel', (e) => {
            if (document.activeElement === input) {
                e.preventDefault();
            }
        }, { passive: false });

        input.addEventListener('keydown', (e) => {
            if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    });
}

let selectDropdownsGlobalListener = false;

export function selectDropdowns(selector = '.select-input-search, .select-input, .select-dropdown, .select-dropdown-search') {
    const selects = document.querySelectorAll(selector);

    if (!selectDropdownsGlobalListener) {
        selectDropdownsGlobalListener = true;
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-wrapper')) {
                document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            }
        });
    }

    selects.forEach(select => {
        if (select.closest('.custom-select-wrapper')) return;

        const isSearch = select.classList.contains('select-input-search') || select.classList.contains('select-dropdown-search');
        const wrapper = document.createElement('div');
        wrapper.className = `custom-select-wrapper ${select.className}`;

        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        const selectedOption = select.options[select.selectedIndex];
        trigger.innerHTML = `<span>${selectedOption ? selectedOption.text : 'Select'}</span> <i class="fas fa-chevron-down"></i>`;

        const optionsContainerWrapper = document.createElement('div');
        optionsContainerWrapper.className = 'custom-options-wrapper';

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-options';

        if (isSearch) {
            const searchBox = document.createElement('div');
            searchBox.className = 'custom-select-search';
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search...';
            searchInput.addEventListener('click', (e) => e.stopPropagation());

            searchInput.addEventListener('input', (e) => {
                const filter = e.target.value.toLowerCase();
                const options = optionsContainer.querySelectorAll('.custom-option');
                options.forEach(opt => {
                    const text = opt.textContent.toLowerCase();
                    opt.style.display = text.includes(filter) ? 'block' : 'none';
                });
            });

            searchBox.appendChild(searchInput);
            optionsContainer.appendChild(searchBox);
        }

        Array.from(select.options).forEach(option => {
            const optDiv = document.createElement('div');
            optDiv.className = 'custom-option';
            if (option.selected) optDiv.classList.add('selected');
            optDiv.textContent = option.text;
            optDiv.dataset.value = option.value;

            optDiv.addEventListener('click', () => {
                select.value = option.value;
                select.dispatchEvent(new Event('change'));
                trigger.querySelector('span').textContent = option.text;
                optionsContainer.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                optDiv.classList.add('selected');
                wrapper.classList.remove('open');
            });

            optionsContainer.appendChild(optDiv);
        });

        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        select.style.display = 'none';
        wrapper.appendChild(trigger);
        optionsContainerWrapper.appendChild(optionsContainer);
        wrapper.appendChild(optionsContainerWrapper);

        trigger.addEventListener('click', (e) => {
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            wrapper.classList.toggle('open');
            e.stopPropagation();
        });
    });
}

export function renderMarkdown(md) {
    if (!md) return '';

    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(md, {
                gfm: true,
                breaks: true,
                headerIds: false,
                mangle: false
            });
        } catch (e) {
            console.warn('Marked.js parse error:', e);
        }
    }

    let html = md.trim();
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/^\s*[\-\*]\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<pre') || trimmed.startsWith('<li')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
}

export function showLoading(target, message = 'Loading...') {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    el.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        </div>
    `;
}

export function hideLoading(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.innerHTML = '';
}

export async function loadMarkdown(target, url) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    try {
        showLoading(el, 'Loading content...');
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load markdown');
        const md = await response.text();
        el.innerHTML = renderMarkdown(md);
    } catch (error) {
        console.error('Markdown load error:', error);
        el.innerHTML = `<p class="error-text">Error loading content: ${error.message}</p>`;
    }
}

export function initAttributes() {
    document.querySelectorAll('[data-mobile]').forEach(el => {
        const val = el.getAttribute('data-mobile') || el.textContent.trim();
        if (val) el.textContent = formatMobile(val);
    });

    document.querySelectorAll('[data-number]').forEach(el => {
        const val = el.getAttribute('data-number') || el.textContent.trim();
        const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
        if (val) el.textContent = formatNumber(val, decimals);
    });

    document.querySelectorAll('[data-currency]').forEach(el => {
        const val = el.getAttribute('data-currency') || el.textContent.trim();
        if (val) el.textContent = formatCurrency(parseFloat(val) || 0);
    });

    document.querySelectorAll('[data-date], [data-time], [data-datetime]').forEach(el => {
        const val = el.getAttribute('data-date') ||
            el.getAttribute('data-time') ||
            el.getAttribute('data-datetime') ||
            el.textContent.trim();
        const format = el.getAttribute('data-format');

        if (!val) return;

        if (el.hasAttribute('data-date')) {
            el.textContent = formatDate(format || 'YYYY-MM-DD', val);
        } else if (el.hasAttribute('data-time')) {
            el.textContent = formatTime(format || 'hh:mm a', val);
        } else if (el.hasAttribute('data-datetime')) {
            el.textContent = formatDateTime(format || 'YYYY-MM-DD hh:mm a', val);
        }
    });

    document.querySelectorAll('[data-fromnow]').forEach(el => {
        const val = el.getAttribute('data-fromnow') || el.textContent.trim();
        if (val) el.textContent = timeFromNow(val);
    });

    document.querySelectorAll('[data-timer]').forEach(el => {
        const seconds = parseInt(el.getAttribute('data-timer') || el.textContent.trim());
        if (!isNaN(seconds)) {
            startTimer(seconds, (formatted) => {
                el.textContent = formatted;
            });
        }
    });

    document.querySelectorAll('[data-markdown], [markdown]').forEach(el => {
        const val = el.getAttribute('data-markdown') || el.getAttribute('markdown') || el.textContent.trim();
        if (val) el.innerHTML = renderMarkdown(val);
    });

    document.querySelectorAll('[data-markdown-file], [markdown-file]').forEach(el => {
        const url = el.getAttribute('data-markdown-file') || el.getAttribute('markdown-file');
        if (url) loadMarkdown(el, url);
    });
}

// Auto-run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        numTypeInput();
        selectDropdowns();
        initAttributes();
    });
} else {
    numTypeInput();
    selectDropdowns();
    initAttributes();
}

// Combined export object
export const Common = {
    formatMobile,
    validateMobile,
    formatNumber,
    formatDate,
    formatTime,
    formatDateTime,
    timeFromNow,
    currentNav,
    getParameterByName,
    formatCurrency,
    startTimer,
    translate,
    setLanguage,
    setCurrency,
    getSettings,
    numTypeInput,
    selectDropdowns,
    renderMarkdown,
    loadMarkdown,
    showLoading,
    hideLoading,
    initAttributes
};
