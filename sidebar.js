// sidebar.js — Shared sidebar visibility logic for all admin pages
(function () {
    const role = localStorage.getItem("role");
    const companyId = localStorage.getItem("companyId");
    const impersonatorRole = localStorage.getItem("impersonator_role");
    const currentPage = window.location.pathname.split('/').pop() || '';
    const canManageBranches = role === "super_admin" || role === "company_admin";
    let isNormalizingBranchLinks = false;

    // Feature Mapping (Must match TierManagementPage in Flutter/Web)
    const FEATURE_MAPPING = {
        'nav-manage-employees': 'employees',
        'empDropdown': 'employees',
        'nav-view-employees': 'employees',
        'nav-interval-management': 'interval',
        'nav-intervals-history': 'interval',
        'intervalDropdown': 'interval',
        'attendance.html': 'attendance',
        'leave_management.html': 'leaves',
        'salary_settings.html': 'salary',
        'salary_payments.html': 'salary',
        'salaryDropdown': 'salary',
        'monthly_report.html': 'monthly_report',
        'salary_report.html': 'salary_report',
        'statutory_calulation.html': 'statutory_calculation',
        'nav-statutory-calculation': 'statutory_calculation',
        'documents.html': 'documents',
        'leaderboard.html': 'leaderboard',
        'ai_prediction.html': 'ai_prediction',
        'manage_feedback.html': 'feedback',
        'manage_notes.html': 'notes',
        'manage_branches.html': 'branches',
        'nav-manage-branches': 'branches',
        'manage_admins.html': 'branches',
        'nav-branch-admins': 'branches',
        'teamsive_passport.html': 'teamsive_passport',
        'hire_resign.html': 'hire_resign',
        'timetrack.html': 'timetrack',
        'projects.html': 'projects'
    };

    function normalizeBranchLinks() {
        if (isNormalizingBranchLinks) return;
        isNormalizingBranchLinks = true;

        document.querySelectorAll('#nav-branch-admins').forEach(item => {
            item.style.setProperty('display', 'none', 'important');
            item.setAttribute('aria-hidden', 'true');
            item.setAttribute('hidden', 'hidden');
            item.classList.remove('active');
        });

        document.querySelectorAll('#nav-manage-branches').forEach(item => {
            item.setAttribute('href', 'manage_branches.html');
            if (canManageBranches) {
                item.style.setProperty('display', 'flex', 'important');
                item.removeAttribute('aria-hidden');
                item.removeAttribute('hidden');
            } else {
                item.style.setProperty('display', 'none', 'important');
                item.setAttribute('aria-hidden', 'true');
                item.setAttribute('hidden', 'hidden');
            }
            if (currentPage === 'manage_branches.html' || currentPage === 'manage_admins.html') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        isNormalizingBranchLinks = false;
    }

    function scheduleBranchLinkNormalization() {
        normalizeBranchLinks();
        setTimeout(normalizeBranchLinks, 0);
        setTimeout(normalizeBranchLinks, 100);
        setTimeout(normalizeBranchLinks, 500);
        setTimeout(normalizeBranchLinks, 1500);
        window.addEventListener('load', normalizeBranchLinks);
        document.addEventListener('DOMContentLoaded', normalizeBranchLinks);
    }

    function normalizeSubscriptionLinks() {
        const isSuperAdmin = role === "super_admin";
        const isSubscriptionPage = currentPage === 'subscriptions.html';
        const subscriptionItems = document.querySelectorAll('.sidebar-nav a[href="subscriptions.html"], .sidebar-nav a[href="my_subscription.html"]');

        subscriptionItems.forEach(item => {
            item.setAttribute('href', 'subscriptions.html');

            const labelEl = item.querySelector('span[data-i18n]') ||
                Array.from(item.querySelectorAll('span')).find(span => !span.classList.contains('nav-icon'));

            if (labelEl) {
                if (isSuperAdmin) {
                    labelEl.setAttribute('data-i18n', 'subscriptions');
                    labelEl.textContent = typeof t === 'function' ? t('subscriptions') : 'Subscriptions';
                } else {
                    labelEl.removeAttribute('data-i18n');
                    labelEl.textContent = 'My Subscription';
                }
            }

            if (isSubscriptionPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function scheduleSubscriptionLinkNormalization() {
        normalizeSubscriptionLinks();
        setTimeout(normalizeSubscriptionLinks, 0);
        setTimeout(normalizeSubscriptionLinks, 100);
        setTimeout(normalizeSubscriptionLinks, 500);
        window.addEventListener('load', normalizeSubscriptionLinks);
        document.addEventListener('DOMContentLoaded', normalizeSubscriptionLinks);
    }

    function createStatutoryNavItem() {
        const item = document.createElement('a');
        item.href = 'statutory_calulation.html';
        item.className = 'nav-item';
        item.id = 'nav-statutory-calculation';
        item.innerHTML = `
            <span class="nav-icon">&#9878;</span>
            <span>Statutory Calculation</span>
        `;
        return item;
    }

    function normalizeStatutoryLinks() {
        const containers = document.querySelectorAll('.sidebar-nav');
        const isActivePage = currentPage === 'statutory_calulation.html';

        containers.forEach(container => {
            let statutoryLink = container.querySelector('a[href="statutory_calulation.html"]');

            if (!statutoryLink) {
                statutoryLink = createStatutoryNavItem();

                const monthlyReportLink = container.querySelector('a[href="monthly_report.html"]');
                const salaryReportLink = container.querySelector('a[href="salary_report.html"]');
                const documentsLink = container.querySelector('a[href="documents.html"]');

                if (monthlyReportLink) {
                    monthlyReportLink.insertAdjacentElement('afterend', statutoryLink);
                } else if (salaryReportLink) {
                    salaryReportLink.insertAdjacentElement('afterend', statutoryLink);
                } else if (documentsLink) {
                    documentsLink.insertAdjacentElement('beforebegin', statutoryLink);
                } else {
                    container.appendChild(statutoryLink);
                }
            }

            statutoryLink.setAttribute('href', 'statutory_calulation.html');
            statutoryLink.id = statutoryLink.id || 'nav-statutory-calculation';

            if (isActivePage) {
                statutoryLink.classList.add('active');
            } else {
                statutoryLink.classList.remove('active');
            }
        });
    }

    function scheduleStatutoryLinkNormalization() {
        normalizeStatutoryLinks();
        setTimeout(normalizeStatutoryLinks, 0);
        setTimeout(normalizeStatutoryLinks, 100);
        setTimeout(normalizeStatutoryLinks, 500);
        window.addEventListener('load', normalizeStatutoryLinks);
        document.addEventListener('DOMContentLoaded', normalizeStatutoryLinks);
    }

    if (impersonatorRole === 'super_admin' || impersonatorRole === 'company_admin') {
        setTimeout(() => {
            const sidebarNav = document.querySelector('.sidebar-nav');
            if (sidebarNav) {
                const backBtn = document.createElement('a');
                backBtn.href = '#';
                backBtn.className = 'nav-item';
                backBtn.style.backgroundColor = 'rgba(255, 92, 92, 0.15)';
                backBtn.style.color = 'var(--danger)';
                const backText = impersonatorRole === 'super_admin' ? 'Back to Super Admin' : 'Back to Company Admin';
                backBtn.innerHTML = '<span class="nav-icon">🔙</span><span style="font-weight:600;">' + backText + '</span>';
                backBtn.onclick = function(e) {
                    e.preventDefault();
                    localStorage.setItem('role', impersonatorRole);
                    localStorage.removeItem('impersonator_role');
                    
                    if (impersonatorRole === 'super_admin') {
                        localStorage.removeItem('companyId');
                        localStorage.removeItem('companyName');
                        localStorage.removeItem('branch');
                        localStorage.setItem('name', 'Teamsive');
                    } else if (impersonatorRole === 'company_admin') {
                        localStorage.removeItem('branch');
                    }
                    window.location.href = 'dashboard.html';
                };
                sidebarNav.insertBefore(backBtn, sidebarNav.firstChild);
            }
        }, 100);
    }

    // Access Control Logic — uses dynamic import to get its own Firebase instance
    async function initAccessControl() {
        if (role !== 'company_admin' || !companyId) return;

        try {
            const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
            const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js');

            const firebaseConfig = {
                apiKey: "AIzaSyADjMc3Jwsjlg_ajo282ZtM5jvDUuGdoRk",
                authDomain: "payflowpro-6e62d.firebaseapp.com",
                databaseURL: "https://payflowpro-6e62d-default-rtdb.firebaseio.com",
                projectId: "payflowpro-6e62d",
                storageBucket: "payflowpro-6e62d.firebasestorage.app",
                messagingSenderId: "69298740438",
                appId: "1:69298740438:web:18fd85e982e083e1543d77"
            };

            // Reuse existing app if already initialized
            const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
            const db = getDatabase(app);

            // Fetch company's subscription
            const subSnap = await get(ref(db, `subscriptions/${companyId}`));

            if (subSnap.exists()) {
                const subData = subSnap.val();
                const planId = subData.plan || 'free_trial';

                // Fetch plan features
                const planSnap = await get(ref(db, `plan_definitions/${planId}`));
                
                let allowedFeatures = {};
                let planName = planId;

                if (planSnap.exists()) {
                    const planData = planSnap.val();
                    allowedFeatures = planData.features || {};
                    planName = planData.name || planId;
                }
                
                applyLocks(allowedFeatures, planName);
                
                // Page-level eviction
                const currentFeature = FEATURE_MAPPING[currentPage];
                if (currentFeature && allowedFeatures[currentFeature] !== true) {
                    document.body.innerHTML = '<div style="display:flex; height:100vh; width:100%; align-items:center; justify-content:center; background:#0b0f14; color:#fff; flex-direction:column;"><h2>🔒 Premium Feature</h2><p style="color:#8b92a0; margin-top:10px;">This feature is not unlocked in your current plan.</p><button onclick="window.location.href=\\\'dashboard.html\\\'" style="margin-top:20px; padding:10px 20px; background:#00ffc3; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Go Back</button></div>';
                }
            } else {
                // No subscription found at all — lock everything
                applyLocks({}, 'No Plan');
                const currentFeature = FEATURE_MAPPING[currentPage];
                if (currentFeature) {
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (e) { console.error("Access Control Error:", e); }
    }

    function applyLocks(allowedFeatures, planName) {
        const navItems = document.querySelectorAll('.nav-item, .dropdown-toggle');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            const id = item.id;
            const onclick = item.getAttribute('onclick');
            
            let featureKey = null;
            if (id && FEATURE_MAPPING[id]) featureKey = FEATURE_MAPPING[id];
            else if (href && FEATURE_MAPPING[href]) featureKey = FEATURE_MAPPING[href];
            else if (onclick && onclick.includes('toggleDropdown')) {
                const match = onclick.match(/'([^']+)'/);
                if (match && FEATURE_MAPPING[match[1]]) featureKey = FEATURE_MAPPING[match[1]];
            }
            
            if (featureKey && allowedFeatures[featureKey] !== true) {
                // Lock this item
                lockItem(item, planName);
            }
        });
    }

    function lockItem(item, planName) {
        // Add lock icon
        const icon = item.querySelector('.nav-icon');
        if (icon) {
            icon.innerHTML += '<span style="position:absolute; font-size:10px; bottom:-2px; right:-5px;">🔒</span>';
            icon.style.position = 'relative';
        }
        
        // Add premium badge if not exists
        if (!item.querySelector('.premium-badge')) {
            const badge = document.createElement('span');
            badge.className = 'premium-badge';
            badge.innerText = 'PRO';
            badge.style.fontSize = '8px';
            badge.style.background = 'var(--primary)';
            badge.style.color = '#000';
            badge.style.padding = '1px 4px';
            badge.style.borderRadius = '4px';
            badge.style.marginLeft = 'auto';
            item.appendChild(badge);
        }

        // Change click behavior
        item.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showUpgradeModal(planName);
            return false;
        };
        if (item.tagName === 'A') {
            item.removeAttribute('href');
            item.style.cursor = 'pointer';
        }
    }

    function showUpgradeModal(currentPlan) {
        let modal = document.getElementById('upgradeModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'upgradeModal';
            modal.className = 'modal-overlay';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="modal" style="text-align: center; max-width: 400px;">
                    <div style="font-size: 50px; margin-bottom: 20px;">💎</div>
                    <h3 style="color: var(--primary);">Upgrade Required</h3>
                    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px;">
                        This feature is not included in your <b>${currentPlan || 'current'}</b> plan. 
                        Upgrade to a higher tier to unlock this and more premium features.
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button onclick="location='subscriptions.html'" style="background: var(--primary); color: #000; padding: 12px; font-weight: bold;">${role === 'super_admin' ? 'View Plans & Upgrade' : 'Open My Subscription'}</button>
                        <button onclick="document.getElementById('upgradeModal').style.display='none'" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 10px;">Maybe Later</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add styles if not present
            if (!document.getElementById('modal-styles')) {
                const styles = document.createElement('style');
                styles.id = 'modal-styles';
                styles.innerText = `
                    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px); }
                    .modal { background: var(--bg-card); padding: 32px; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 20px 50px rgba(0,0,0,0.5); width: 90%; max-width: 400px; }
                `;
                document.head.appendChild(styles);
            }
        }
        modal.style.display = 'flex';
    }

    // Role-based visibility — robust initialization with retries
    function applyRoleVisibility() {
        if (role === "super_admin") {
            const el1 = document.getElementById("nav-manage-companies");
            if (el1) el1.style.display = "flex";
            const el3 = document.getElementById("nav-manage-branches");
            if (el3) el3.style.display = "flex";
            const elSub = document.getElementById("nav-subscriptions");
            if (elSub) elSub.style.display = "flex";
        }
        else if (role === "company_admin") {
            const el3 = document.getElementById("nav-manage-branches");
            if (el3) el3.style.display = "flex";
            initAccessControl();
        }
    }

    // Schedule role visibility to run at multiple points to handle any load timing
    applyRoleVisibility();
    setTimeout(applyRoleVisibility, 0);
    setTimeout(applyRoleVisibility, 100);
    setTimeout(applyRoleVisibility, 500);
    setTimeout(applyRoleVisibility, 1500);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyRoleVisibility);
    }
    window.addEventListener('load', applyRoleVisibility);

    scheduleBranchLinkNormalization();
    scheduleSubscriptionLinkNormalization();
    scheduleStatutoryLinkNormalization();
})();

window.toggleDropdown = function(id, el) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    dropdown.classList.toggle('show');
    el.classList.toggle('open');
    const chevron = el.querySelector('.chevron');
    if(chevron) {
        chevron.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
        chevron.style.transition = 'transform 0.3s ease';
    }
};
