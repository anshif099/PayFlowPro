// sidebar.js — Shared sidebar visibility logic for all admin pages
(function () {
    const role = localStorage.getItem("role");
    const impersonatorRole = localStorage.getItem("impersonator_role");

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
                        localStorage.setItem('name', 'RAINHOPES');
                    } else if (impersonatorRole === 'company_admin') {
                        localStorage.removeItem('branch');
                    }
                    window.location.href = 'dashboard.html';
                };
                sidebarNav.insertBefore(backBtn, sidebarNav.firstChild);
            }
        }, 100);
    }

    // Super Admin sees everything
    if (role === "super_admin") {
        const el1 = document.getElementById("nav-manage-companies");
        if (el1) el1.style.display = "flex";
        const el3 = document.getElementById("nav-manage-branches");
        if (el3) el3.style.display = "flex";
        const elSub = document.getElementById("nav-subscriptions");
        if (elSub) elSub.style.display = "flex";
    }
    // Company Admin sees manage branches
    else if (role === "company_admin") {
        const el3 = document.getElementById("nav-manage-branches");
        if (el3) el3.style.display = "flex";
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
