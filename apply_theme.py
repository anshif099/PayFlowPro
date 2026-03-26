import os
import re

TARGET_DIR = r"Admin"
FILES = [
    "ai_prediction.html",
    "attendance.html",
    "dashboard.html",
    "documents.html",
    "employees.html",
    "manage_companies.html",
    "manage_branches.html",
    "manage_admins.html",
    "intervalmanagement.html",
    "intervals_history.html",
    "leaderboard.html",
    "leave_management.html",
    "monthly_report.html",
    "salary_payments.html",
    "salary_settings.html",
    "salary_report.html",
    "settings.html",
    "subscriptions.html",
    "view_employees.html",
    "employee_details.html",
    "manage_notes.html",
    "manage_feedback.html",
    "tier_management.html"
]

THEME_SCRIPT = '<script src="theme.js"></script>'
LIGHT_MODE_VARS = """
    body.light-mode {
        --bg-dark: #f0f2f5;
        --bg-card: #ffffff;
        --bg-input: #f8f9fa;
        --text: #1a1d21;
        --text-muted: #6c757d;
        --border: #e9ecef;
    }
"""

for fname in FILES:
    filepath = os.path.join(TARGET_DIR, fname)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject theme.js if not present
    if 'src="theme.js"' not in content:
        content = content.replace('<script src="lang.js"></script>', THEME_SCRIPT + '\n    <script src="lang.js"></script>')
        # Fallback if lang.js not found
        if 'src="theme.js"' not in content:
            content = content.replace('</head>', '    ' + THEME_SCRIPT + '\n</head>')

    # 2. Update CSS Variables
    # Ensure body.light-mode exists
    if 'body.light-mode' not in content and ':root' in content:
        content = re.sub(r'(:root\s*{[^}]+})', r'\1\n' + LIGHT_MODE_VARS, content)

    # Replace hardcoded hover/active backgrounds
    content = content.replace('rgba(0, 255, 195, 0.08)', 'var(--primary-hover-bg)')
    content = content.replace('rgba(0, 255, 195, .08)', 'var(--primary-hover-bg)')
    content = content.replace('rgba(0, 255, 195, 0.15)', 'var(--primary-active-bg)')
    content = content.replace('rgba(0, 255, 195, .15)', 'var(--primary-active-bg)')
    
    # 3. Remove legacy toggleTheme buttons
    content = re.sub(r'<button[^>]*onclick="toggleTheme\(\)"[^>]*>.*?</button>', '', content)
    
    # 4. Remove toggleTheme function definition
    content = re.sub(r'window\.toggleTheme\s*=\s*\(\)\s*=>\s*{[^}]+};?', '', content)
    # Also handle non-arrow functions or different styles if any
    content = re.sub(r'function\s+toggleTheme\s*\(\)\s*{[^}]+}', '', content)

    # 5. Fix potential primary color hardcoding in styles if necessary
    # (Optional: can be aggressive, but let's stick to the main ones)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Theme applied successfully to all files.")
