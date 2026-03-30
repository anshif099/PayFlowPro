// theme.js - Shared theme, color and logo logic for Admin Web
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

        // Apply secondary/sidebar color if set
        const secondaryColor = localStorage.getItem('admin_secondary_color');
        if (secondaryColor) {
            applySecondaryColor(secondaryColor);
        }

        // Apply logo if set
        const logoUrl = localStorage.getItem('admin_logo_url');
        if (logoUrl) {
            applyLogoToSidebar(logoUrl);
        }
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

        // Auto-set button text color based on primary luminance
        const lum = getLuminance(color);
        document.documentElement.style.setProperty('--primary-text', lum > 0.5 ? '#000000' : '#ffffff');
    }

    // Apply secondary color for sidebar/accent areas
    function applySecondaryColor(color) {
        document.documentElement.style.setProperty('--secondary', color);
        document.documentElement.style.setProperty('--sidebar-bg', color);

        // Auto-detect text color for sidebar based on luminance
        const lum = getLuminance(color);
        const sidebarText = lum > 0.45 ? '#1a1d21' : '#ffffff';
        const sidebarTextMuted = lum > 0.45 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)';
        document.documentElement.style.setProperty('--sidebar-text', sidebarText);
        document.documentElement.style.setProperty('--sidebar-text-muted', sidebarTextMuted);

        // Apply to sidebar elements
        applySidebarColors();
    }

    // Apply sidebar color CSS to sidebar elements after DOM ready
    function applySidebarColors() {
        const applyFn = () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.backgroundColor = 'var(--sidebar-bg)';
                sidebar.style.borderRightColor = 'var(--sidebar-bg)';
            }
            // Sidebar header text
            const sidebarHeader = document.querySelector('.sidebar-header h2');
            if (sidebarHeader) {
                sidebarHeader.style.color = 'var(--sidebar-text)';
            }
            // Nav items
            document.querySelectorAll('.sidebar .nav-item').forEach(item => {
                if (!item.classList.contains('active')) {
                    item.style.color = 'var(--sidebar-text-muted)';
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyFn);
        } else {
            setTimeout(applyFn, 50);
        }
    }

    // Apply company logo to sidebar header
    function applyLogoToSidebar(url) {
        const applyFn = () => {
            const sidebarHeader = document.querySelector('.sidebar-header');
            if (!sidebarHeader) return;

            // Check if logo already inserted
            let logoEl = sidebarHeader.querySelector('.sidebar-logo');
            if (!logoEl) {
                logoEl = document.createElement('img');
                logoEl.className = 'sidebar-logo';
                logoEl.style.cssText = 'width:40px;height:40px;border-radius:50%;object-fit:cover;margin-right:8px;border:2px solid var(--primary);';
                const h2 = sidebarHeader.querySelector('h2');
                if (h2) {
                    h2.insertBefore(logoEl, h2.firstChild);
                }
            }
            logoEl.src = url;
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyFn);
        } else {
            setTimeout(applyFn, 50);
        }
    }

    // Luminance calculation (relative luminance per WCAG)
    function getLuminance(hex) {
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
        // sRGB to linear
        const rsRGB = r / 255, gsRGB = g / 255, bsRGB = b / 255;
        const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
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

    // Helper: RGB to Hex (since browser returns rgb)
    function rgbToHex(rgb) {
        if (!rgb) return '';
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return rgb;
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    // ---- Color Extraction from Image ----
    // Extract dominant colors from an image (via canvas pixel sampling)
    function extractColorsFromImage(imgElement, numColors) {
        numColors = numColors || 2;
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxSize = 100; // Downscale for performance

            let w = imgElement.naturalWidth || imgElement.width;
            let h = imgElement.naturalHeight || imgElement.height;

            if (w > maxSize || h > maxSize) {
                const scale = maxSize / Math.max(w, h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
            }

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(imgElement, 0, 0, w, h);

            const imageData = ctx.getImageData(0, 0, w, h).data;
            const pixels = [];

            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];

                // Skip transparent pixels
                if (a < 128) continue;

                // Skip near-white and near-black (backgrounds)
                const brightness = (r + g + b) / 3;
                if (brightness > 240 || brightness < 15) continue;

                pixels.push([r, g, b]);
            }

            if (pixels.length === 0) {
                resolve(['#00ffc3', '#1e2530']);
                return;
            }

            // Simple K-means clustering for dominant colors
            const clusters = kMeansColors(pixels, numColors, 10);
            
            // Sort by cluster size (most dominant first)
            clusters.sort((a, b) => b.count - a.count);

            const colors = clusters.map(c => {
                const rr = Math.round(c.center[0]).toString(16).padStart(2, '0');
                const gg = Math.round(c.center[1]).toString(16).padStart(2, '0');
                const bb = Math.round(c.center[2]).toString(16).padStart(2, '0');
                return `#${rr}${gg}${bb}`;
            });

            resolve(colors.slice(0, numColors));
        });
    }

    // K-Means clustering for colors
    function kMeansColors(pixels, k, iterations) {
        // Initialize centers with spread-out samples
        const step = Math.max(1, Math.floor(pixels.length / k));
        let centers = [];
        for (let i = 0; i < k; i++) {
            centers.push([...pixels[Math.min(i * step, pixels.length - 1)]]);
        }

        let clusters = [];

        for (let iter = 0; iter < iterations; iter++) {
            clusters = centers.map(() => ({ pixels: [], center: [0, 0, 0], count: 0 }));

            // Assign pixels to nearest center
            for (const pixel of pixels) {
                let minDist = Infinity;
                let bestIdx = 0;
                for (let c = 0; c < centers.length; c++) {
                    const dist = colorDistance(pixel, centers[c]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestIdx = c;
                    }
                }
                clusters[bestIdx].pixels.push(pixel);
                clusters[bestIdx].count++;
            }

            // Recalculate centers
            for (let c = 0; c < clusters.length; c++) {
                if (clusters[c].count === 0) continue;
                const sum = [0, 0, 0];
                for (const p of clusters[c].pixels) {
                    sum[0] += p[0];
                    sum[1] += p[1];
                    sum[2] += p[2];
                }
                centers[c] = [sum[0] / clusters[c].count, sum[1] / clusters[c].count, sum[2] / clusters[c].count];
                clusters[c].center = centers[c];
            }
        }

        return clusters.filter(c => c.count > 0);
    }

    function colorDistance(a, b) {
        return Math.sqrt(
            Math.pow(a[0] - b[0], 2) +
            Math.pow(a[1] - b[1], 2) +
            Math.pow(a[2] - b[2], 2)
        );
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
        },
        setSecondaryColor: function(color) {
            localStorage.setItem('admin_secondary_color', color);
            applySecondaryColor(color);
        },
        clearSecondaryColor: function() {
            localStorage.removeItem('admin_secondary_color');
            // Reset sidebar to default card background
            document.documentElement.style.removeProperty('--secondary');
            document.documentElement.style.removeProperty('--sidebar-bg');
            document.documentElement.style.removeProperty('--sidebar-text');
            document.documentElement.style.removeProperty('--sidebar-text-muted');
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.backgroundColor = '';
                sidebar.style.borderRightColor = '';
            }
        },
        setLogoUrl: function(url) {
            localStorage.setItem('admin_logo_url', url);
            applyLogoToSidebar(url);
        },
        clearLogo: function() {
            localStorage.removeItem('admin_logo_url');
            const logoEl = document.querySelector('.sidebar-logo');
            if (logoEl) logoEl.remove();
        },
        extractColors: extractColorsFromImage,
        getLuminance: getLuminance,
        rgbToHex: rgbToHex
    };

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
