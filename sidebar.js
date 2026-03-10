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
