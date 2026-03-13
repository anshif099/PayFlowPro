// sidebar.js — Shared sidebar visibility logic for all admin pages
(function () {
    const role = localStorage.getItem("role");

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
