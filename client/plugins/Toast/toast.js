// Toast configuration with SVG icons
const toastConfig = {
    success: {
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
               </svg>`,
        color: '#4fA746'
    },
    error: {
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
               </svg>`,
        color: '#DC3545'
    },
    info: {
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
               </svg>`,
        color: '#427BFF'
    },
    warning: {
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
               </svg>`,
        color: '#EBBA0F'
    },
    dark: {
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
               </svg>`,
        color: '#343A40'
    },
    light: {
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
               </svg>`,
        color: '#F0F1F2'
    }
};

// Track active toasts by position
const activeToasts = {
    'top-right': [],
    'top-left': [],
    'bottom-right': [],
    'bottom-left': [],
    'top': [],
    'bottom': [],
    'left': [],
    'right': []
};

// Check if device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Check if device is tablet
function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

// Check if device is small mobile
function isSmallMobile() {
    return window.innerWidth <= 480;
}

// Function to get computed font family from body or document
function getComputedFontFamily() {
    if (document.body) {
        const computedStyle = window.getComputedStyle(document.body);
        const fontFamily = computedStyle.fontFamily;
        
        // If font family is not 'initial' and not empty, use it
        if (fontFamily && fontFamily !== 'initial' && !fontFamily.includes('serif') && !fontFamily.includes('sans-serif')) {
            return fontFamily;
        }
    }
    
    // Fallback to Google Sans
    return '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
}

// Function to load Google Sans font if needed
function loadGoogleSansFontIfNeeded() {
    const bodyFont = getComputedFontFamily();
    
    // Check if Google Sans is already loaded or if user has a custom font
    if (bodyFont.includes('Google Sans')) {
        return; // Google Sans is already the font
    }
    
    // Check if we need to load Google Sans (user doesn't have a specific font)
    if (bodyFont.includes('sans-serif') || bodyFont.includes('system-ui') || 
        bodyFont.includes('-apple-system') || bodyFont.includes('Segoe UI')) {
        
        // Load Google Sans font
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        document.head.appendChild(link);
    }
}

// Get appropriate icon for toast
function getIcon(icon) {
    return toastConfig[icon]?.icon || toastConfig.info.icon;
}

// Calculate offset for stacking toasts
function calculateToastOffset(position, toast) {
    const margin = 10; // Space between toasts
    const existingToasts = activeToasts[position];

    if (existingToasts.length === 0) {
        return 0;
    }

    // Calculate offset based on previous toasts
    return existingToasts.reduce((total, current) => {
        return total + current.element.offsetHeight + margin;
    }, 0);
}

// Apply position offset to toast
function applyPositionOffset(toast, position, offset) {
    const isVertical = position.includes('top') || position.includes('bottom');
    const isHorizontal = position.includes('left') || position.includes('right');

    if (isVertical && !position.includes('center')) {
        // For top/bottom positions, adjust top or bottom property
        if (position.includes('top')) {
            toast.style.top = `calc(1rem + ${offset}px)`;
        } else {
            toast.style.bottom = `calc(1rem + ${offset}px)`;
        }
    } else if (isHorizontal) {
        // For left/right positions, adjust top property
        toast.style.top = `calc(50% - ${toast.offsetHeight / 2}px + ${offset}px)`;
    } else if (position === 'top') {
        // For top center
        toast.style.top = `calc(1rem + ${offset}px)`;
    } else if (position === 'bottom') {
        // For bottom center
        toast.style.bottom = `calc(1rem + ${offset}px)`;
    }
}

// Get responsive dimensions
function getResponsiveDimensions() {
    if (isSmallMobile()) {
        return {
            iconSize: '32px',
            iconContainerSize: '32px',
            iconMargin: '0.75rem',
            padding: '0.75rem 1rem',
            minWidth: 'calc(100vw - 2rem)',
            maxWidth: 'calc(100vw - 2rem)',
            minHeight: 'auto',
            titleFontSize: '1rem',
            messageFontSize: '0.875rem',
            closeIconSize: '20px',
            closeButtonSize: '24px',
            borderRadius: '0.5rem',
            margin: '1rem',
            gap: '0.25rem'
        };
    } else if (isMobile()) {
        return {
            iconSize: '40px',
            iconContainerSize: '40px',
            iconMargin: '1rem',
            padding: '0.875rem 1.25rem',
            minWidth: 'calc(100vw - 3rem)',
            maxWidth: 'calc(100vw - 3rem)',
            minHeight: 'auto',
            titleFontSize: '1.125rem',
            messageFontSize: '0.9375rem',
            closeIconSize: '22px',
            closeButtonSize: '28px',
            borderRadius: '0.625rem',
            margin: '1rem',
            gap: '0.375rem'
        };
    } else if (isTablet()) {
        return {
            iconSize: '44px',
            iconContainerSize: '44px',
            iconMargin: '1.25rem',
            padding: '0.9375rem 1.375rem',
            minWidth: '28rem',
            maxWidth: '32rem',
            minHeight: '5.5rem',
            titleFontSize: '1.1875rem',
            messageFontSize: '0.96875rem',
            closeIconSize: '23px',
            closeButtonSize: '30px',
            borderRadius: '0.6875rem',
            margin: '1rem',
            gap: '0.4375rem'
        };
    } else {
        // Desktop
        return {
            iconSize: '48px',
            iconContainerSize: '48px',
            iconMargin: '1.5rem',
            padding: '1rem 1.5rem',
            minWidth: '24rem',
            maxWidth: '40rem',
            minHeight: '6rem',
            titleFontSize: '1.25rem',
            messageFontSize: '1rem',
            closeIconSize: '24px',
            closeButtonSize: '32px',
            borderRadius: '0.75rem',
            margin: '1rem',
            gap: '0.5rem'
        };
    }
}

// Apply base styles to toast element
function applyToastStyles(toast, icon, position) {
    // Get the computed font family
    const fontFamily = getComputedFontFamily();
    const responsive = getResponsiveDimensions();
    
    // Get adjusted position for mobile
    let adjustedPosition = position;
    let isBottomPosition = false;
    
    if (isMobile()) {
        // On mobile, handle bottom positions differently
        if (position === 'bottom' || position === 'bottom-left' || position === 'bottom-right') {
            isBottomPosition = true;
            // Keep bottom positions at bottom on mobile
        } else if (position === 'left' || position === 'right') {
            // Convert left/right positions to top on mobile
            adjustedPosition = 'top';
        } else if (position === 'top' || position === 'top-left' || position === 'top-right') {
            // Keep top positions at top on mobile
            adjustedPosition = 'top';
        }
    }
    
    // Apply base styles
    Object.assign(toast.style, {
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        padding: responsive.padding,
        borderRadius: responsive.borderRadius,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        zIndex: '10000',
        minWidth: responsive.minWidth,
        maxWidth: responsive.maxWidth,
        minHeight: responsive.minHeight,
        backgroundColor: toastConfig[icon]?.color || '#427BFF',
        color: icon === 'light' ? '#0F172A' : '#F9FAFB',
        fontFamily: fontFamily,
        boxSizing: 'border-box',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
    });

    // Apply position-specific styles
    applyPositionSpecificStyles(toast, adjustedPosition, isBottomPosition);
}

// Apply position-specific styles
function applyPositionSpecificStyles(toast, position, isBottomPosition = false) {
    // Reset all position properties
    toast.style.left = '';
    toast.style.right = '';
    toast.style.top = '';
    toast.style.bottom = '';
    toast.style.transform = '';
    toast.style.opacity = '0';

    const responsive = getResponsiveDimensions();
    const margin = responsive.margin;

    // On mobile, handle positions appropriately
    if (isMobile()) {
        if (isBottomPosition) {
            // Bottom positions on mobile - stay at bottom but don't take full height
            switch (position) {
                case 'bottom':
                    toast.style.bottom = margin;
                    toast.style.left = margin;
                    toast.style.right = margin;
                    toast.style.transform = 'translateY(100%)';
                    break;
                case 'bottom-left':
                case 'bottom-right':
                    toast.style.bottom = margin;
                    toast.style.left = margin;
                    toast.style.right = margin;
                    toast.style.transform = 'translateY(100%)';
                    break;
                default:
                    toast.style.bottom = margin;
                    toast.style.left = margin;
                    toast.style.right = margin;
                    toast.style.transform = 'translateY(100%)';
            }
        } else {
            // Top positions on mobile
            toast.style.top = margin;
            toast.style.left = margin;
            toast.style.right = margin;
            toast.style.transform = 'translateY(-100%)';
        }
    } else {
        // Desktop/tablet positions
        switch (position) {
            case 'top-right':
                toast.style.top = margin;
                toast.style.right = margin;
                toast.style.transform = 'translateX(100%)';
                break;
            case 'top-left':
                toast.style.top = margin;
                toast.style.left = margin;
                toast.style.transform = 'translateX(-100%)';
                break;
            case 'bottom-right':
                toast.style.bottom = margin;
                toast.style.right = margin;
                toast.style.transform = 'translateX(100%)';
                break;
            case 'bottom-left':
                toast.style.bottom = margin;
                toast.style.left = margin;
                toast.style.transform = 'translateX(-100%)';
                break;
            case 'top':
                toast.style.left = '50%';
                toast.style.top = margin;
                toast.style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                toast.style.left = '50%';
                toast.style.bottom = margin;
                toast.style.transform = 'translate(-50%, 100%)';
                break;
            case 'left':
                toast.style.top = '50%';
                toast.style.left = margin;
                toast.style.transform = 'translate(-100%, 0)';
                break;
            case 'right':
                toast.style.top = '50%';
                toast.style.right = margin;
                toast.style.transform = 'translate(100%, 0)';
                break;
            default:
                toast.style.top = margin;
                toast.style.right = margin;
                toast.style.transform = 'translateX(100%)';
        }
    }
}

// Apply show animation
function applyShowAnimation(toast, position, isBottomPosition = false) {
    setTimeout(() => {
        toast.style.opacity = '1';
        
        if (isMobile()) {
            // Mobile animations
            if (isBottomPosition) {
                // Bottom positions slide up from bottom
                toast.style.transform = 'translateY(0)';
            } else {
                // Top positions slide down from top
                toast.style.transform = 'translateY(0)';
            }
        } else {
            // Desktop/tablet animations
            switch (position) {
                case 'top':
                    toast.style.transform = 'translate(-50%, 0)';
                    break;
                case 'bottom':
                    toast.style.transform = 'translate(-50%, 0)';
                    break;
                case 'left':
                case 'top-left':
                case 'bottom-left':
                    toast.style.transform = 'translate(0, 0)';
                    break;
                case 'right':
                case 'top-right':
                case 'bottom-right':
                    toast.style.transform = 'translate(0, 0)';
                    break;
            }
        }
    }, 10);
}

// Apply hide animation
function applyHideAnimation(toast, position, isBottomPosition = false) {
    toast.style.opacity = '0';
    
    if (isMobile()) {
        // Mobile animations
        if (isBottomPosition) {
            // Bottom positions slide down to bottom
            toast.style.transform = 'translateY(100%)';
        } else {
            // Top positions slide up to top
            toast.style.transform = 'translateY(-100%)';
        }
    } else {
        // Desktop/tablet animations
        switch (position) {
            case 'top':
                toast.style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                toast.style.transform = 'translate(-50%, 100%)';
                break;
            case 'left':
            case 'top-left':
            case 'bottom-left':
                toast.style.transform = 'translate(-100%, 0)';
                break;
            case 'right':
            case 'top-right':
            case 'bottom-right':
                toast.style.transform = 'translate(100%, 0)';
                break;
        }
    }
}

// Adjust positions of remaining toasts after one is dismissed
function adjustToastPositions(position) {
    const toasts = activeToasts[position];

    toasts.forEach((toastObj, index) => {
        // Calculate new offset for this toast
        let newOffset = 0;
        for (let i = 0; i < index; i++) {
            newOffset += toasts[i].element.offsetHeight + 10; // 10px margin
        }

        // Apply new position
        applyPositionOffset(toastObj.element, position, newOffset);
        toastObj.offset = newOffset;
    });
}

// Show toast function with position-based animations
function toast(icon, title, message, position = 'top-right', toastTime = 5) {
    // Load Google Sans font if needed (only once)
    if (!window._toastFontLoaded) {
        loadGoogleSansFontIfNeeded();
        window._toastFontLoaded = true;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-card toast-${icon} toast-${position}`;

    // Get adjusted position for mobile and determine if it's a bottom position
    let adjustedPosition = position;
    let isBottomPosition = false;
    
    if (isMobile()) {
        // On mobile, handle bottom positions differently
        if (position === 'bottom' || position === 'bottom-left' || position === 'bottom-right') {
            isBottomPosition = true;
            adjustedPosition = 'bottom'; // Use generic bottom for mobile
        } else if (position === 'left' || position === 'right') {
            // Convert left/right positions to top on mobile
            adjustedPosition = 'top';
        } else if (position === 'top' || position === 'top-left' || position === 'top-right') {
            // Keep top positions at top on mobile
            adjustedPosition = 'top';
        }
    }

    // Apply styles
    applyToastStyles(toast, icon, adjustedPosition, isBottomPosition);

    // Get responsive dimensions
    const responsive = getResponsiveDimensions();

    // Create toast content with inline styles
    toast.innerHTML = `
        <div style="margin-right: ${responsive.iconMargin}; width: ${responsive.iconContainerSize}; height: ${responsive.iconContainerSize}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${getIcon(icon).replace('width="48"', `width="${responsive.iconSize}"`).replace('height="48"', `height="${responsive.iconSize}"`)}
        </div>
        <div style="display: flex; flex-direction: column; gap: ${responsive.gap}; flex-grow: 1; min-width: 0;">
            <h1 style="font-weight: bold; font-size: ${responsive.titleFontSize}; margin: 0; font-family: inherit; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2;">${title}</h1>
            <p style="margin: 0; font-size: ${responsive.messageFontSize}; line-height: 1.5; font-family: inherit; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; line-clamp: 3;">${message}</p>
        </div>
        <div style="position: absolute; top: ${isSmallMobile() ? '0.5rem' : '0.75rem'}; right: ${isSmallMobile() ? '0.5rem' : '0.75rem'}; cursor: pointer; opacity: 0.7; transition: opacity 0.2s ease; width: ${responsive.closeButtonSize}; height: ${responsive.closeButtonSize}; display: flex; align-items: center; justify-content: center;" class="toast-close">
            <svg width="${responsive.closeIconSize}" height="${responsive.closeIconSize}" viewBox="0 0 24 24" fill="none" stroke="${icon === 'light' ? '#0F172A' : '#F9FAFB'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>
    `;

    document.body.appendChild(toast);

    const offset = calculateToastOffset(adjustedPosition, toast);
    applyPositionOffset(toast, adjustedPosition, offset);
    activeToasts[adjustedPosition].push({ element: toast, offset: offset });

    // Apply show animation
    applyShowAnimation(toast, adjustedPosition, isBottomPosition);

    let startTime = Date.now();
    let remaining = toastTime * 1000;

    let dismissTimeout = setTimeout(() => dismissToast(toast, adjustedPosition, isBottomPosition), remaining);

    function pauseProgress() {
        clearTimeout(dismissTimeout);
        const elapsed = Date.now() - startTime;
        remaining -= elapsed;
    }

    function resumeProgress() {
        startTime = Date.now();
        dismissTimeout = setTimeout(() => dismissToast(toast, adjustedPosition, isBottomPosition), remaining);
    }

    toast.addEventListener('mouseenter', pauseProgress);
    toast.addEventListener('mouseleave', resumeProgress);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        dismissToast(toast, adjustedPosition, isBottomPosition);
    });

    // Add hover effect for close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.7';
    });

    // Add resize handler to update toast styles
    function handleResize() {
        // Recalculate if it's a bottom position on resize
        let newIsBottomPosition = false;
        let newAdjustedPosition = position;
        
        if (isMobile()) {
            if (position === 'bottom' || position === 'bottom-left' || position === 'bottom-right') {
                newIsBottomPosition = true;
                newAdjustedPosition = 'bottom';
            } else if (position === 'left' || position === 'right') {
                newAdjustedPosition = 'top';
            } else if (position === 'top' || position === 'top-left' || position === 'top-right') {
                newAdjustedPosition = 'top';
            }
        }
        
        applyToastStyles(toast, icon, newAdjustedPosition, newIsBottomPosition);
        applyShowAnimation(toast, newAdjustedPosition, newIsBottomPosition);
    }

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Store resize handler for cleanup
    toast._resizeHandler = handleResize;

    return toast;
}

// Dismiss toast function with position-based animations
function dismissToast(toast, position, isBottomPosition = false) {
    // Remove resize event listener
    if (toast._resizeHandler) {
        window.removeEventListener('resize', toast._resizeHandler);
    }

    // Apply hide animation
    applyHideAnimation(toast, position, isBottomPosition);

    // Remove from active toasts
    const index = activeToasts[position].findIndex(t => t.element === toast);
    if (index !== -1) {
        activeToasts[position].splice(index, 1);
    }

    // Adjust positions of remaining toasts after animation completes
    setTimeout(() => {
        adjustToastPositions(position);
    }, 300);

    // Remove from DOM after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

export const Toast = (options) => {
    // Must be object
    if (!options || typeof options !== 'object') {
        return toast('error', 'Error!', 'Toast expects an object');
    }

    // Unauthorized keys check
    const allowedKeys = ['icon', 'title', 'message', 'position', 'time'];
    const invalidKeys = Object.keys(options).filter(
        key => !allowedKeys.includes(key)
    );

    if (invalidKeys.length) {
        return toast(
            'error',
            'Error!',
            `Unauthorized keys: ${invalidKeys.join(', ')}`
        );
    }

    // icon validation
    if (!options.icon || typeof options.icon !== 'string') {
        return toast('error', 'Error!', 'Icon must be a string');
    }

    // title validation
    if (!options.title || typeof options.title !== 'string') {
        return toast('error', 'Error!', 'Title must be a string');
    }

    // message validation
    if (!options.message || typeof options.message !== 'string') {
        return toast('error', 'Error!', 'Message must be a string');
    }

    // position type validation (optional)
    if (options.position !== undefined && typeof options.position !== 'string') {
        return toast('error', 'Error!', 'Position must be a string');
    }

    // time validation (optional)
    if (
        options.time !== undefined &&
        (typeof options.time !== 'number' || options.time <= 0)
    ) {
        return toast('error', 'Error!', 'Time must be a positive number');
    }

    // Fire toast
    toast(
        options.icon,
        options.title,
        options.message,
        options.position || 'top-right',
        options.time || 5
    );
};