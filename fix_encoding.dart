import 'dart:io';

void main() {
  final dir = Directory('.');
  final files = dir.listSync().whereType<File>().where((f) => f.path.endsWith('.html')).toList();

  for (final file in files) {
    final basename = file.uri.pathSegments.last;
    if (basename == 'index.html' || basename == 'admin.html') continue;

    var content = file.readAsStringSync();

    final navStart = content.indexOf('<nav class="sidebar-nav">');
    final navEnd = content.indexOf('</nav>', navStart);
    if (navStart == -1 || navEnd == -1) {
      print('SKIP: $basename (no nav found)');
      continue;
    }

    final newNav = _buildNav(basename);
    final before = content.substring(0, navStart);
    final after = content.substring(navEnd + '</nav>'.length);
    content = before + newNav + after;

    file.writeAsStringSync(content, flush: true);
    print('FIXED: $basename');
  }

  print('Done.');
}

String _buildNav(String activeFile) {
  final items = [
    _NavItem('dashboard.html', '&#x1F4CA;', 'Dashboard', i18n: 'dashboard'),
    _NavItem('manage_companies.html', '&#x1F3E2;', 'Manage Companies', id: 'nav-manage-companies', hidden: true),
    _NavItem('manage_branches.html', '&#x1F3E2;', 'Manage Branches', id: 'nav-manage-branches', hidden: true),
    _NavItem('employees.html', '&#x1F465;', 'Employees', i18n: 'employees'),
    _NavItem('attendance.html', '&#x2705;', 'Attendance', i18n: 'attendance'),
    _NavItem('leave_management.html', '&#x1F3D6;&#xFE0F;', 'Leave Management', i18n: 'leave_management'),
    _NavItem('manage_admins.html', '&#x1F6E1;&#xFE0F;', 'Branch Admins', i18n: 'branch_admins', id: 'nav-branch-admins', hidden: true),
    _NavItem('intervalmanagement.html', '&#x23F2;&#xFE0F;', 'Interval Management'),
    _NavItem('salary_settings.html', '&#x1F4B0;', 'Salary Settings', i18n: 'salary_settings'),
    _NavItem('salary_payments.html', '&#x1F4B3;', 'Salary Payments', i18n: 'salary_payments'),
    _NavItem('monthly_report.html', '&#x1F4D1;', 'Monthly Report', i18n: 'monthly_report'),
    _NavItem('documents.html', '&#x1F4C4;', 'Documents'),
    _NavItem('leaderboard.html', '&#x1F3C6;', 'Leaderboard'),
    _NavItem('ai_prediction.html', '&#x1F9E0;', 'AI Prediction'),
    _NavItem('settings.html', '&#x2699;&#xFE0F;', 'Settings', i18n: 'settings'),
  ];

  final buf = StringBuffer();
  buf.writeln('<nav class="sidebar-nav">');
  for (final item in items) {
    final active = item.href == activeFile ? ' active' : '';
    final idAttr = item.id != null ? ' id="${item.id}"' : '';
    final styleAttr = item.hidden ? ' style="display:none;"' : '';
    final i18nAttr = item.i18n != null ? ' data-i18n="${item.i18n}"' : '';
    buf.writeln('            <a href="${item.href}" class="nav-item$active"$idAttr$styleAttr>');
    buf.writeln('                <span class="nav-icon">${item.icon}</span>');
    buf.writeln('                <span$i18nAttr>${item.label}</span>');
    buf.writeln('            </a>');
  }
  buf.write('        </nav>');
  return buf.toString();
}

class _NavItem {
  final String href;
  final String icon;
  final String label;
  final String? i18n;
  final String? id;
  final bool hidden;
  _NavItem(this.href, this.icon, this.label, {this.i18n, this.id, this.hidden = false});
}
