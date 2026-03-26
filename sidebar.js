// sidebar.js — Shared sidebar visibility logic for all admin pages
(function () {
    const role = localStorage.getItem("role");
    const companyId = localStorage.getItem("companyId");
    const impersonatorRole = localStorage.getItem("impersonator_role");

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
        'documents.html': 'documents',
        'leaderboard.html': 'leaderboard',
        'ai_prediction.html': 'ai_prediction',
        'manage_feedback.html': 'feedback',
        'manage_notes.html': 'notes',
        'manage_branches.html': 'branches',
        'nav-manage-branches': 'branches',
        'manage_admins.html': 'branches',
        'nav-branch-admins': 'branches'
    };

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

    // Access Control Logic
    async function initAccessControl() {
        if (role !== 'company_admin' || !companyId) return;

        try {
            // We use the same Firebase reference as other pages, assuming it's already initialized or using global ref
            // Since sidebar.js is included AFTER Firebase usually, we'll wait for a bit
            setTimeout(async () => {
                if (typeof firebase === 'undefined' && typeof db === 'undefined') return;
                
                // Fetch company's subscription
                const subRef = ref(db, `subscriptions/${companyId}`);
                const snapshot = await get(subRef);
                
                if (snapshot.exists()) {
                    const subData = snapshot.val();
                    const planId = subData.plan || 'free_trial';
                    
                    // Fetch plan features
                    const planRef = ref(db, `plan_definitions/${planId}`);
                    const planSnap = await get(planRef);
                    
                    if (planSnap.exists()) {
                        const planData = planSnap.val();
                        const allowedFeatures = planData.features || {};
                        applyLocks(allowedFeatures, planData.name);
                    }
                }
            }, 500);
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
            
            if (featureKey && allowedFeatures[featureKey] === false) {
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
                        <button onclick="location='subscriptions.html'" style="background: var(--primary); color: #000; padding: 12px; font-weight: bold;">View Plans & Upgrade</button>
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

    // Role-based visibility
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
