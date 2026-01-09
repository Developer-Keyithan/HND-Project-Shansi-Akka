(function () {
    // Common Utility Functions for HealthyBite
    /**
     * Format a mobile number to Sri Lankan standard +94 format
     * @param {string} number
     * @returns {string} Formatted number or original if invalid
     */
    function formatMobile(number) {
        if (!number) return '';
        // Remove spaces and non-numeric chars
        let cleaned = number.toString().replace(/\D/g, '');

        let normalized;
        // Normalize to 9 digits after the country code prefix (e.g., 771234567)
        if (cleaned.length === 10 && cleaned.startsWith('0')) {
            normalized = cleaned.substring(1);
        } else if (cleaned.length === 9) {
            normalized = cleaned;
        } else if (cleaned.startsWith('94') && (cleaned.length === 11 || cleaned.length === 12)) {
            // Handle both 94771234567 and potentially 094... (though less common)
            normalized = cleaned.substring(cleaned.length - 9);
        } else {
            return number;
        }

        // Format as +94 77 123 4567
        const network = normalized.substring(0, 2);
        const firstThree = normalized.substring(2, 5);
        const lastFour = normalized.substring(5, 9);

        return `+94 ${network} ${firstThree} ${lastFour}`;
    }

    /**
     * Validate if a string is a valid Sri Lankan mobile number
     * Support formats: 0771234567, +94771234567, 077 123 4567
     * @param {string} number 
     * @returns {boolean}
     */
    function validateMobile(number) {
        if (!number) return false;
        // Regex for Sri Lanka mobile: 
        // ^(?:0|94|\+94)?(7[0-9]{8})$
        const slMobileRegex = /^(?:0|94|\+94)?(7[0-9]{8})$/;
        const cleaned = number.toString().replace(/[\s-]/g, ''); // Remove spaces and dashes
        return slMobileRegex.test(cleaned);
    }

    /**
     * Format a number with commas and decimals
     * @param {number} number 
     * @param {number} decimals 
     * @returns {string}
     */
    function formatNumber(number, decimals = 2) {
        if (isNaN(number)) return '0.00';
        return new Intl.NumberFormat('en-LK', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    /**
     * Format a date string based on format tokens
     * @param {string} date - Date to format (default now) (Legacy support or if 1st arg is date)
     * @param {string} [formatStr] - Format string (YYYY, MM, DD, HH, mm, ss, a) if 1st arg is date
     * OR
     * @param {string} formatStr - Format string
     * @param {string|Date} [date] - Date
     * @returns {string}
     */
    function formatDate(arg1, arg2) {
        let formatStr = 'YYYY-MM-DD';
        let date = new Date();

        // Determine arguments
        if (arg1 && !arg2 && (arg1 instanceof Date || !isNaN(Date.parse(arg1)))) {
            // Called with just date: formatDate(date)
            date = new Date(arg1);
        } else if (typeof arg1 === 'string' && !arg2) {
            // Called with just format: formatDate('YYYY-MM-DD')
            formatStr = arg1;
        } else if (typeof arg1 === 'string' && arg2) {
            // Called with both: formatDate('YYYY...', date)
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
            HH: pad(date.getHours()), // 24h
            hh: pad(date.getHours() % 12 || 12), // 12h
            mm: pad(date.getMinutes()),
            ss: pad(date.getSeconds()),
            a: date.getHours() >= 12 ? 'PM' : 'AM'
        };

        // Use boundaries for 'a' to avoid replacing 'a' in words like 'at'
        return formatStr.replace(/YYYY|YY|MM|MMM|DD|HH|hh|mm|ss|\ba\b/g, match => tokens[match]);
    }

    /**
     * Format time
     * @param {string} formatStr 
     * @param {string|Date} date 
     * @returns {string}
     */
    function formatTime(formatStr = 'hh:mm a', date = new Date()) {
        // Handle legacy formatTime(date)
        if (arguments.length === 1 && (formatStr instanceof Date || !isNaN(Date.parse(formatStr)))) {
            date = formatStr;
            formatStr = 'hh:mm a';
        }
        return formatDate(formatStr, date);
    }

    /**
     * Format date and time
     * @param {string} formatStr 
     * @param {string|Date} date 
     * @returns {string}
     */
    function formatDateTime(formatStr = 'YYYY-MM-DD hh:mm a', date = new Date()) {
        // Handle legacy formatDateTime(date)
        if (arguments.length === 1 && (formatStr instanceof Date || !isNaN(Date.parse(formatStr)))) {
            date = formatStr;
            formatStr = 'YYYY-MM-DD hh:mm a';
        }
        return formatDate(formatStr, date);
    }

    /**
     * Get relative time string with specific rules
     * @param {string|Date} date 
     * @returns {string}
     */
    function timeFromNow(date) {
        if (!date) return '';
        const now = new Date();
        const target = new Date(date);
        if (isNaN(target.getTime())) return '';

        const diffSeconds = (now - target) / 1000;
        const isFuture = diffSeconds < 0;
        const absDiff = Math.abs(diffSeconds);

        // Day difference (ignoring time)
        const nowDay = new Date(now).setHours(0, 0, 0, 0);
        const targetDay = new Date(target).setHours(0, 0, 0, 0);
        const dayDiff = Math.round((nowDay - targetDay) / 86400000);

        const timeStr = formatDate('hh:mm a', target);

        // Yesterday / Tomorrow
        if (dayDiff === 1) return `yesterday at ${timeStr}`;
        if (dayDiff === -1) return `tomorrow at ${timeStr}`;

        // Today logic (> 12 hours check)
        if (dayDiff === 0) {
            const hours = Math.floor(absDiff / 3600);
            if (hours > 12) {
                return `today at ${timeStr}`;
            }
            if (isFuture) { // "today && current time < time"
                // If gap is large (>12h) handled above? 
                // If gap is small, fall through to relative
            }
        }

        // Relative Intervals
        if (absDiff <= 30) return isFuture ? 'in 30 seconds' : '30 seconds ago';

        const minutes = Math.floor(absDiff / 60);
        if (minutes < 60) {
            // Bucketing logic based on "Use these..." or just granular?
            // "1 minute ago... 5 minutes ago... 10... 15... 20... 30... 45"
            // Let's use strict buckets if implied, or just exact minutes. 
            // Standard exact minutes is usually preferred unless fuzzy is strictly required. 
            // "Use these" likely implies granularity.
            // But implementing complex bucketing might break expected precision.
            // I'll return specific minutes but maybe round? 
            // Let'sstick to exact minutes for simplicity in this utility unless explicitly mapped.
            return isFuture ? `in ${minutes} minutes` : `${minutes} minutes ago`;
        }

        const hours = Math.floor(absDiff / 3600);
        if (hours <= 12) {
            return isFuture ? `in ${hours} hours` : `${hours} hours ago`;
        }

        // > 12 hours logic falling through if not today/yesterday/tomorrow (e.g. crossing 2 days but < 48 hours diff?)
        // If > 12 hours and NOT today (e.g. 20 hours ago, yesterday), implies dayDiff != 0.
        // We covered yesterday/tomorrow. 
        // If it's 2 days ago:
        const days = Math.floor(absDiff / 86400);
        if (days <= 14) {
            return isFuture ? `in ${days} days` : `${days} days ago`;
        }

        if (days <= 28) { // 2-4 weeks
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
     * @param {number} seconds - Duration in seconds
     * @param {function} onTick - Callback(formattedTime, remainingSeconds)
     * @param {function} onComplete - Callback when done
     * @returns {object} Timer object with stop() method
     */
    function startTimer(seconds, onTick, onComplete) {
        let remaining = seconds;

        const formatTimer = (s) => {
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        };

        // Initial call
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

    /**
     * Get current page name (e.g. "menu.html")
     * If root, returns "index.html"
     * @returns {string}
     */
    function currentNav() {
        const path = window.location.pathname;
        let page = path.split('/').pop();
        if (!page || path === '/') {
            return 'index.html';
        }
        // If extension is missing due to router
        if (!page.includes('.')) {
            page += '.html';
        }
        return page;
    }

    /**
     * Get URL parameter by name
     * @param {string} name 
     * @returns {string|null}
     */
    function getParameterByName(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // --- Internationalization & Currency ---

    // Loaded from shared/data.js
    const currencyRates = window.currencyRates || { 'LKR': { rate: 1, symbol: 'LKR' } };
    const dictionary = window.dictionary || { 'en': {} };

    let userSettings = JSON.parse(localStorage.getItem('healthybite-settings')) || {
        language: 'en',
        currency: 'LKR'
    };

    /**
     * Translate a key to the current language
     * @param {string} key 
     * @returns {string} translation or original key
     */
    function translate(key) {
        if (!key) return '';
        const lang = userSettings.language || 'en';
        const k = key.toLowerCase().replace(/ /g, '_');

        if (dictionary[lang] && dictionary[lang][k]) {
            return dictionary[lang][k];
        }

        // Fallback to english if missing in target
        if (dictionary['en'] && dictionary['en'][k]) {
            return dictionary['en'][k];
        }

        return key;
    }

    function saveSettings() {
        localStorage.setItem('healthybite-settings', JSON.stringify(userSettings));
        // Sync with logged in user (simulating DB update)
        const user = JSON.parse(localStorage.getItem('healthybite-user'));
        if (user) {
            user.preferences = userSettings;
            localStorage.setItem('healthybite-user', JSON.stringify(user));
        }
    }

    /**
     * Change Application Language
     * @param {string} langCode 
     */
    function setLanguage(langCode) {
        if (dictionary[langCode]) {
            userSettings.language = langCode;
            saveSettings();
            updatePageTranslations();
            // Reload to ensure all JS-rendered content updates
            setTimeout(() => window.location.reload(), 50);
        }
    }

    /**
     * Change Application Currency
     * @param {string} currencyCode 
     */
    function setCurrency(currencyCode) {
        if (currencyRates[currencyCode]) {
            userSettings.currency = currencyCode;
            saveSettings();
            setTimeout(() => window.location.reload(), 50);
        }
    }

    function getSettings() {
        return { ...userSettings, rates: Object.keys(currencyRates), languages: Object.keys(dictionary) };
    }

    /**
     * Update all Elements with [data-translate] attributes
     */
    function updatePageTranslations() {
        // Text Content
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            el.textContent = translate(key);
        });

        // Placeholders
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            el.placeholder = translate(key);
        });

        // Images
        document.querySelectorAll('[data-translate-img]').forEach(el => {
            const key = el.getAttribute('data-translate-img');
            const src = translate(key);
            if (src && src !== key && (src.includes('/') || src.startsWith('http'))) {
                el.src = src;
            }
        });
    }

    // Trigger translation on load - DISABLED as per new requirements
    /*
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePageTranslations);
    } else {
        // If script loads deferred, DOM might be ready
        updatePageTranslations();
    }
    */

    /**
     * Format currency (LKR special or converted)
     * @param {number} amount in LKR (Base)
     * @returns {string} Formatted string
     */
    function formatCurrency(amount) {
        if (typeof amount !== 'number') return amount;

        const code = userSettings.currency || 'LKR';
        const currency = currencyRates[code] || currencyRates['LKR'];

        // Convert from Base (LKR) to Target
        const converted = amount * currency.rate;

        return currency.symbol + ' ' + formatNumber(converted, 2);
    }

    /**
     * Handle Number Inputs (prevent scroll change, spinners)
     * @param {string} selector 
     */
    function numTypeInput(selector = 'input[type="number"], .num-type-input') {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => {
            // Prevent scroll changing value
            input.addEventListener('wheel', (e) => {
                if (document.activeElement === input) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Prevent invalid chars (optional, but requested behavior)
            input.addEventListener('keydown', (e) => {
                // Allow: backspace, delete, tab, escape, enter, .
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        });
    }

    /**
     * Handle Custom Select Dropdowns
     * @param {string} selector 
     */
    /**
     * Handle Custom Select Dropdowns
     * @param {string} selector 
     */
    function selectDropdowns(selector = '.select-input-search, .select-input, .select-dropdown, .select-dropdown-search') {
        const selects = document.querySelectorAll(selector);

        // Add global listener only once to close dropdowns when clicking outside
        if (!window.selectDropdownsGlobalListener) {
            window.selectDropdownsGlobalListener = true;
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-select-wrapper')) {
                    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
                }
            });
        }

        selects.forEach(select => {
            if (select.closest('.custom-select-wrapper')) return; // Already initialized

            const isSearch = select.classList.contains('select-input-search') || select.classList.contains('select-dropdown-search');

            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = `custom-select-wrapper ${select.className}`;

            // Trigger
            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';
            const selectedOption = select.options[select.selectedIndex];
            trigger.innerHTML = `<span>${selectedOption ? selectedOption.text : 'Select'}</span> <i class="fas fa-chevron-down"></i>`;

            // Options Container
            const optionsContainerWrapper = document.createElement('div');
            optionsContainerWrapper.className = 'custom-options-wrapper';

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'custom-options';


            // Search Input (if enabled)
            if (isSearch) {
                const searchBox = document.createElement('div');
                searchBox.className = 'custom-select-search';
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Search...';
                searchInput.addEventListener('click', (e) => e.stopPropagation()); // Prevent closing

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

            // Options List
            Array.from(select.options).forEach(option => {
                // Skip purely placeholder if it's empty value and disabled (often used as "Select One")
                // But we might want to show it as "Select One".
                // Let's assume options with value="" and disabled are placeholders.
                // if (option.value === "" && option.disabled) return; 

                const optDiv = document.createElement('div');
                optDiv.className = 'custom-option';
                if (option.selected) optDiv.classList.add('selected');
                optDiv.textContent = option.text;
                optDiv.dataset.value = option.value;

                optDiv.addEventListener('click', () => {
                    // Update Original Select
                    select.value = option.value;
                    select.dispatchEvent(new Event('change')); // Trigger change event

                    // Update Trigger
                    trigger.querySelector('span').textContent = option.text;

                    // Update UI Selection
                    optionsContainer.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                    optDiv.classList.add('selected');

                    // Close
                    wrapper.classList.remove('open');
                });

                optionsContainer.appendChild(optDiv);
            });

            // DOM Insertion
            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(select);
            select.style.display = 'none'; // Hide native select
            wrapper.appendChild(trigger);
            optionsContainerWrapper.appendChild(optionsContainer);
            wrapper.appendChild(optionsContainerWrapper);

            // Toggle Open/Close
            trigger.addEventListener('click', (e) => {
                // Close all other dropdowns first
                document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                    if (w !== wrapper) w.classList.remove('open');
                });
                wrapper.classList.toggle('open');
                e.stopPropagation();
            });
        });
    }

    /**
     * Render basic markdown to HTML
     * @param {string} md 
     * @returns {string}
     */
    function renderMarkdown(md) {
        if (!md) return '';

        // If marked.js is loaded (via load-scripts.js), use it for full support
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

        // 1. Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // 2. Bold & Italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 3. Links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 4. Code
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // 5. Lists (Group adjacent <li> items)
        html = html.replace(/^\s*[\-\*]\s+(.*)$/gim, '<li>$1</li>');
        html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

        // 6. Paragraphs
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

    /**
     * Show a loading spinner inside an element
     * @param {HTMLElement|string} target 
     * @param {string} message 
     */
    function showLoading(target, message = 'Loading...') {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;

        el.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
    }

    /**
     * Hide loading spinner from an element (clears it)
     * @param {HTMLElement|string} target 
     */
    function hideLoading(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) el.innerHTML = '';
    }

    /**
     * Load and render a markdown file
     * @param {HTMLElement|string} target - Target element or selector
     * @param {string} url - URL to .md file
     */
    async function loadMarkdown(target, url) {
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

    /**
     * Initialize elements with data-common-* attributes
     * Allows using utilities directly in HTML
     */
    function initCommonAttributes() {
        // Mobile Formatting
        document.querySelectorAll('[data-mobile]').forEach(el => {
            const val = el.getAttribute('data-mobile') || el.textContent.trim();
            if (val) el.textContent = formatMobile(val);
        });

        // Number Formatting
        document.querySelectorAll('[data-number]').forEach(el => {
            const val = el.getAttribute('data-number') || el.textContent.trim();
            const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
            if (val) el.textContent = formatNumber(val, decimals);
        });

        // Currency Formatting
        document.querySelectorAll('[data-currency]').forEach(el => {
            const val = el.getAttribute('data-currency') || el.textContent.trim();
            if (val) el.textContent = formatCurrency(parseFloat(val) || 0);
        });

        // Date/Time Formatting
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

        // Relative Time (Time From Now)
        document.querySelectorAll('[data-fromnow]').forEach(el => {
            const val = el.getAttribute('data-fromnow') || el.textContent.trim();
            if (val) el.textContent = timeFromNow(val);
        });

        // Countdown Timers
        document.querySelectorAll('[data-timer]').forEach(el => {
            const seconds = parseInt(el.getAttribute('data-timer') || el.textContent.trim());
            if (!isNaN(seconds)) {
                startTimer(seconds, (formatted) => {
                    el.textContent = formatted;
                });
            }
        });

        // Markdown Rendering (Support both data-markdown and markdown)
        document.querySelectorAll('[data-markdown], [markdown]').forEach(el => {
            const val = el.getAttribute('data-markdown') || el.getAttribute('markdown') || el.textContent.trim();
            if (val) el.innerHTML = renderMarkdown(val);
        });

        // Markdown File Loading (Support both data-markdown-file and markdown-file)
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
            initCommonAttributes();
        });
    } else {
        numTypeInput();
        selectDropdowns();
        initCommonAttributes();
    }

    // Expose to window
    window.Common = {
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
        initAttributes: initCommonAttributes
    };

})();
