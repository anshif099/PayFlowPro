const fs = require('fs');
const path = require('path');
const dir = "c:\\WORKS\\Rainhopes_Workes\\PayFlow Pro\\payflow_pro\\Admin";

const addition = `
            <a href="salary_payments.html" class="nav-item">
                <span class="nav-icon">💳</span>
                <span data-i18n="salary_payments">Salary Payments</span>
            </a>`;

const regex = /(<a href="salary_settings\.html"[^>]*>[\s\S]*?<\/a>)/;

let count = 0;
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html') && file !== 'salary_payments.html') {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes('salary_payments.html')) {
            if (regex.test(content)) {
                content = content.replace(regex, `$1${addition}`);
                fs.writeFileSync(filePath, content, 'utf8');
                count++;
            }
        }
    }
});
console.log(`Patched ${count} files.`);
