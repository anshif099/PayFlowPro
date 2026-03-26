// theme.js - Shared theme and color logic for Admin Web
(function() {
    const defaultPrimary = '#00ffc3';
    const defaultPrimaryHover = '#00e6af';

    // Initialize Theme
    function initTheme() {
        const theme = localStorage.getItem('admin_theme') || 'dark';
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        const primaryColor = localStorage.getItem('admin_primary_color') || defaultPrimary;
        applyPrimaryColor(primaryColor);
    }

    // Apply primary color and its variations to CSS variables
    function applyPrimaryColor(color) {
        document.documentElement.style.setProperty('--primary', color);
        // Generate a slightly darker version for hover (simplified)
        const hoverColor = adjustBrightness(color, -20);
        document.documentElement.style.setProperty('--primary-hover', hoverColor);
        
        // Generate a subtle background for active states
        const transparentColor = hexToRgba(color, 0.15);
        const subtleTransparentColor = hexToRgba(color, 0.08);
        document.documentElement.style.setProperty('--primary-active-bg', transparentColor);
        document.documentElement.style.setProperty('--primary-hover-bg', subtleTransparentColor);
    }

    // Helper: Hex to RGBA
    function hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper: Adjust brightness (percentage)
    function adjustBrightness(hex, percent) {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);

        r = Math.min(255, Math.max(0, r + (r * (percent / 100))));
        g = Math.min(255, Math.max(0, g + (g * (percent / 100))));
        b = Math.min(255, Math.max(0, b + (b * (percent / 100))));

        const rr = Math.round(r).toString(16).padStart(2, '0');
        const gg = Math.round(g).toString(16).padStart(2, '0');
        const bb = Math.round(b).toString(16).padStart(2, '0');

        return `#${rr}${gg}${bb}`;
    }

    // Export functions globally
    window.themeManager = {
        init: initTheme,
        setTheme: function(type) {
            localStorage.setItem('admin_theme', type);
            if (type === 'light') {
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
            }
        },
        setPrimaryColor: function(color) {
            localStorage.setItem('admin_primary_color', color);
            applyPrimaryColor(color);
        }
    };

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
