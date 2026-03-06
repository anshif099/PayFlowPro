$files = Get-ChildItem -Filter *.html
foreach ($f in $files) {
    if ($f.Name -eq 'salary_payments.html') { continue }
    $c = Get-Content $f.FullName -Raw
    if ($c -match 'salary_payments\.html') { continue }
    $c = $c -replace '(?s)(<a href="salary_settings.html" class="nav-item(?: active)?">\s*<span class="nav-icon">💰</span>\s*<span data-i18n="salary_settings">Salary Settings</span>\s*</a>)', "`$1`r`n            <a href=`"salary_payments.html`" class=`"nav-item`">`r`n                <span class=`"nav-icon`">💳</span>`r`n                <span data-i18n=`"salary_payments`">Salary Payments</span>`r`n            </a>"
    [IO.File]::WriteAllText($f.FullName, $c)
}
Write-Host "Done"
