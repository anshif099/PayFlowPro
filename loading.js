// One loader for page startup and overlapping data requests.
(() => {
    let pending = 0;
    let hideTimer;
    let overlay;
    function mount() {
        if (overlay || !document.body) return;
        const style = document.createElement('style');
        style.textContent = `
            #admin-data-loading { position:fixed; inset:0; z-index:10000; display:none;
                align-items:center; justify-content:center; background:rgba(8,22,23,.82); }
            #admin-data-loading img { width:80px; height:80px; border-radius:50%;
                object-fit:contain; animation:admin-logo-spin 1.2s linear infinite; }
            @keyframes admin-logo-spin { to { transform:rotate(360deg); } }
            @media (prefers-reduced-motion:reduce) {
                #admin-data-loading img { animation:none; }
            }
        `;
        document.head.appendChild(style);
        overlay = document.createElement('div');
        overlay.id = 'admin-data-loading';
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-label', 'Loading data');
        const logo = document.createElement('img');
        logo.src = new URL('app-logo.png', document.currentScript?.src || location.href).href;
        logo.alt = 'Teamsive';
        overlay.appendChild(logo);
        document.body.appendChild(overlay);
        overlay.style.display = pending ? 'flex' : 'none';
    }
    function begin() {
        pending++;
        clearTimeout(hideTimer);
        mount();
        if (overlay) overlay.style.display = 'flex';
        let done = false;
        return () => {
            if (done) return;
            done = true;
            pending--;
            if (!pending) hideTimer = setTimeout(() => {
                if (!pending && overlay) overlay.style.display = 'none';
            }, 0);
        };
    }
    function track(promise) {
        const finish = begin();
        return Promise.resolve(promise).finally(finish);
    }
    function listen(onValue, query, callback, ...options) {
        const finish = begin();
        const cancel = typeof options[0] === 'function' ? options.shift() : null;
        try {
            const stop = onValue(query, (...args) => {
                try { return callback(...args); } finally { finish(); }
            }, error => { finish(); if (cancel) cancel(error); else console.error(error); }, ...options);
            return () => { finish(); stop(); };
        } catch (error) { finish(); throw error; }
    }
    window.AdminLoading = { begin, track, listen };
    const ready = begin();
    document.addEventListener('DOMContentLoaded', mount, { once:true });
    window.addEventListener('load', ready, { once:true });
    window.addEventListener('error', ready, { once:true });
})();
