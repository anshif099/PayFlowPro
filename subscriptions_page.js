import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const role = localStorage.getItem("role") || "";
const isAdmin = localStorage.getItem("admin") === "true";

if (!isAdmin || role === "super_admin") {
    // Super admin keeps the inline company subscription manager.
} else {
    const firebaseConfig = {
        apiKey: "AIzaSyADjMc3Jwsjlg_ajo282ZtM5jvDUuGdoRk",
        authDomain: "payflowpro-6e62d.firebaseapp.com",
        databaseURL: "https://payflowpro-6e62d-default-rtdb.firebaseio.com",
        projectId: "payflowpro-6e62d",
        storageBucket: "payflowpro-6e62d.firebasestorage.app",
        messagingSenderId: "69298740438",
        appId: "1:69298740438:web:18fd85e982e083e1543d77"
    };

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const companyId = (localStorage.getItem("companyId") || "").trim();
    const companyName = (
        localStorage.getItem("companyName") ||
        localStorage.getItem("name") ||
        companyId ||
        "Your Company"
    ).trim();

    const pageTitle = document.getElementById("pageTitle");
    const superCard = document.getElementById("superAdminSubscriptionsCard");
    const myView = document.getElementById("mySubscriptionView");
    const subscriptionModal = document.getElementById("subscriptionModal");
    const codeModal = document.getElementById("codeModal");
    const navSubscription = document.getElementById("nav-subscriptions");

    const state = {
        planDefinitions: {},
        subscription: null,
        pendingCode: "",
        notice: ""
    };

    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return "N/A";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}/${date.getFullYear()}`;
    };

    const remainingTime = (expiryDate) => {
        if (!expiryDate) return "Not Activated Yet";
        const date = new Date(expiryDate);
        if (Number.isNaN(date.getTime())) return "Invalid Expiry Date";

        const diffMs = date.getTime() - Date.now();
        if (diffMs <= 0) return "Expired";

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days} Days Remaining`;

        const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
        return `${hours} Hours Remaining`;
    };

    const planName = (planId) => {
        const definition = state.planDefinitions?.[planId];
        return definition?.name || String(planId || "No Active Subscription").replace(/_/g, " ");
    };

    const durationDays = (subscription) => {
        const definitionDays = Number(state.planDefinitions?.[subscription?.plan]?.validity);
        if (Number.isFinite(definitionDays) && definitionDays > 0) return definitionDays;

        const duration = Number(subscription?.duration);
        if (Number.isFinite(duration) && duration > 0) return duration;

        return 30;
    };

    const subscriptionStatus = (subscription) => {
        if (!subscription) return { text: "Not Assigned", className: "status-muted" };
        if (subscription.activated === true) {
            const expiryDate = new Date(subscription.expiryDate || "");
            if (!Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() > Date.now()) {
                return { text: "Active", className: "status-active" };
            }
            return { text: "Expired", className: "status-expired" };
        }
        return { text: "Pending Activation", className: "status-warning" };
    };

    function setPageMode() {
        document.title = "My Subscription - Teamsive";
        if (pageTitle) pageTitle.textContent = "My Subscription";
        if (superCard) superCard.style.display = "none";
        if (myView) myView.style.display = "block";
        if (subscriptionModal) subscriptionModal.style.display = "none";
        if (codeModal) codeModal.style.display = "none";

        if (navSubscription) {
            const label = navSubscription.querySelector("span[data-i18n], span:not(.nav-icon)");
            if (label) {
                label.removeAttribute("data-i18n");
                label.textContent = "My Subscription";
            }
        }
    }

    function render(message = "") {
        if (!myView) return;

        setPageMode();

        const subscription = state.subscription;
        const features = subscription?.plan && state.planDefinitions?.[subscription.plan]?.features
            ? Object.entries(state.planDefinitions[subscription.plan].features).filter(([, enabled]) => enabled === true)
            : [];
        const status = subscriptionStatus(subscription);
        const cards = [
            {
                label: "Remaining Time",
                value: subscription?.activated ? remainingTime(subscription.expiryDate) : "Not Activated Yet"
            },
            {
                label: "Activation Date",
                value: subscription?.activated ? formatDate(subscription.activationDate) : "Not Activated Yet"
            },
            {
                label: "Expiry Date",
                value: subscription?.activated ? formatDate(subscription.expiryDate) : "N/A"
            },
            {
                label: "Duration",
                value: subscription ? `${durationDays(subscription)} Days` : "Not Assigned"
            }
        ];

        if (subscription?.activationCode) {
            cards.push({
                label: "Assigned Code",
                value: subscription.activationCode
            });
        }

        const helperText = message || state.notice || (
            subscription
                ? "Use the activation code from your Super Admin to activate or renew this plan."
                : "No subscription is assigned yet. Please contact your Super Admin for a subscription code."
        );

        myView.innerHTML = `
            <div class="card subscription-shell">
                <div class="subscription-header">
                    <div>
                        <p class="eyebrow">Subscription Access</p>
                        <h3>My Subscription</h3>
                        <p class="subscription-subtitle">${escapeHtml(companyName || "Your Company")}</p>
                    </div>
                    <span class="status-badge ${status.className}">${escapeHtml(status.text)}</span>
                </div>
                <div class="subscription-plan">${escapeHtml(planName(subscription?.plan)).toUpperCase()}</div>
                <p class="subscription-helper">${escapeHtml(helperText)}</p>
                <div class="summary-grid">
                    ${cards.map((card) => `
                        <div class="summary-item">
                            <span class="summary-label">${escapeHtml(card.label)}</span>
                            <strong>${escapeHtml(card.value)}</strong>
                        </div>
                    `).join("")}
                </div>
                <div class="subscription-actions">
                    <label for="subscriptionCodeInput">Activate / Extend Plan</label>
                    <div class="input-row">
                        <input id="subscriptionCodeInput" class="text-input" type="text" placeholder="Enter Subscription Code" autocomplete="off" />
                        <button onclick="activateMySubscription()">Activate</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>What's Included</h3>
                ${features.length ? `
                    <div class="feature-list">
                        ${features.map(([feature]) => `
                            <div class="feature-item">
                                <span class="feature-check">&#10003;</span>
                                <span>${escapeHtml(String(feature).replace(/_/g, " ").toUpperCase())}</span>
                            </div>
                        `).join("")}
                    </div>
                ` : `
                    <div class="empty-state">No plan features are available to show yet.</div>
                `}
            </div>
        `;

        const input = document.getElementById("subscriptionCodeInput");
        if (input) {
            input.value = state.pendingCode;
            input.addEventListener("input", (event) => {
                state.pendingCode = event.target.value;
            });
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    window.activateMySubscription();
                }
            });
        }
    }

    window.activateMySubscription = async () => {
        const input = document.getElementById("subscriptionCodeInput");
        const code = (input?.value || state.pendingCode || "").trim().toUpperCase();
        state.pendingCode = code;

        if (!code) {
            alert("Please enter a code.");
            return;
        }

        if (!companyId) {
            alert("Company information is missing. Please log in again.");
            return;
        }

        if (!state.subscription || !state.subscription.activationCode) {
            alert("No subscription assigned. Contact Super Admin.");
            return;
        }

        const expectedCode = String(state.subscription.activationCode).trim().toUpperCase();
        if (code !== expectedCode) {
            alert("Invalid activation code!");
            return;
        }

        if (state.subscription.activated === true) {
            const expiryDate = new Date(state.subscription.expiryDate || "");
            if (!Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() > Date.now()) {
                alert("Subscription is already active. Contact Super Admin for a new code to extend.");
                return;
            }
        }

        try {
            const now = new Date();
            const expiryDate = new Date(now.getTime() + durationDays(state.subscription) * 24 * 60 * 60 * 1000);

            await update(ref(db, `subscriptions/${companyId}`), {
                activated: true,
                activationDate: now.toISOString(),
                expiryDate: expiryDate.toISOString()
            });

            state.pendingCode = "";
            alert("Subscription updated successfully!");
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    setPageMode();

    onValue(ref(db, "plan_definitions"), (snapshot) => {
        state.planDefinitions = snapshot.exists() ? snapshot.val() : {};
        render();
    });

    if (!companyId) {
        state.notice = "Company information is missing for this login.";
        render();
    } else {
        onValue(ref(db, `subscriptions/${companyId}`), (snapshot) => {
            state.subscription = snapshot.exists() ? snapshot.val() : null;
            state.notice = "";
            render();
        });
    }
}
