$files = @(
  "src\app\eurovision2022\page.tsx",
  "src\app\eurovision2024\page.tsx",
  "src\app\eurovision2025\page.tsx",
  "src\app\eurovision2026\page.tsx"
)

foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))
  
  # Add hook usage after useSession
  $content = $content -replace '(const \{ data: session, status \} = useSession\(\);)', '$1' + "`r`n  const { preferences } = useDisplayPreferences();"
  
  [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Updated: $file" -ForegroundColor Green
}

Write-Host "`n✅ All files updated with hook usage" -ForegroundColor Green
