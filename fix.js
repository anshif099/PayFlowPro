const fs = require('fs');
const file = 'c:/Rainhopes_Workes/PayFlow Pro/payflow_pro/Admin/leave_management.html';
let content = fs.readFileSync(file, 'utf8');

const target = `        // Fetch Employees to build whitelist
        onValue(ref(db, "employees"), s => {
            allowedEmpIds.clear();
            if (s.exists()) {
                s.forEach(c => {
                    const e = c.val();
                    let allow = true;
                    if (adminRole === 'branch_admin' && e.branch !== adminBranch) {
                        allow = false;
                    }
                    if (allow) {
                        allowedEmpIds.add(e.empId);
                        if (!e.empId) allowedEmpIds.add(c.key);
                    }
                });
            }
            employeesLoaded = true;
            console.log('[DEBUG employees] Loaded. allowedEmpIds:', [...allowedEmpIds]);
            renderLeaveTables();
        });`;

const rep = `        // Fetch Employees to build whitelist
        onValue(ref(db, "admins"), adminsSnap => {
            const branchAdminBranches = new Set();
            if (adminsSnap.exists()) {
                adminsSnap.forEach(a => {
                    const admin = a.val();
                    if (admin.role === 'branch_admin' && admin.branch) {
                        branchAdminBranches.add(admin.branch);
                    }
                });
            }

            onValue(ref(db, "employees"), s => {
                allowedEmpIds.clear();
                if (s.exists()) {
                    s.forEach(c => {
                        const e = c.val();
                        let allow = true;
                        const companyId = localStorage.getItem("companyId");
                        if (adminRole === 'branch_admin' && e.branch !== adminBranch) {
                            allow = false;
                        } else if (adminRole === 'company_admin' && (e.companyId !== companyId || (e.branch && branchAdminBranches.has(e.branch)))) {
                            allow = false;
                        } else if (adminRole === 'super_admin' && e.branch && branchAdminBranches.has(e.branch)) {
                            allow = false;
                        }
                        if (allow) {
                            allowedEmpIds.add(e.empId);
                            if (!e.empId) allowedEmpIds.add(c.key);
                        }
                    });
                }
                employeesLoaded = true;
                console.log('[DEBUG employees] Loaded. allowedEmpIds:', [...allowedEmpIds]);
                renderLeaveTables();
            });
        });`;

// Normalize line endings to do the replacement
const contentLF = content.replace(/\r\n/g, '\n');
const targetLF = target.replace(/\r\n/g, '\n');

if (contentLF.includes(targetLF)) {
    const newContentLF = contentLF.replace(targetLF, rep.replace(/\r\n/g, '\n'));
    // If original had CRLF, put them back
    const finalContent = content.includes('\r\n') ? newContentLF.replace(/\n/g, '\r\n') : newContentLF;
    fs.writeFileSync(file, finalContent, 'utf8');
    console.log('Successfully patched leave_management.html');
} else {
    console.log('Could not find exact target string in leave_management.html');
}
