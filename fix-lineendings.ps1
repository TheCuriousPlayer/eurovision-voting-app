# Script to fix display preferences formatting

$files = @(
  "src\app\eurovision2020\page.tsx",
  "src\app\eurovision2022\page.tsx",
  "src\app\eurovision2023\page.tsx",
  "src\app\eurovision2024\page.tsx",
  "src\app\eurovision2025\page.tsx",
  "src\app\eurovision2026\page.tsx"
)

foreach ($file in $files) {
  Write-Host "`nProcessing: $file" -ForegroundColor Cyan
  
  $content = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))
  
  # Fix the literal `r`n patterns that were inserted
  $content = $content.Replace('`r`n', "`r`n")
  
  [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "  ✓ Fixed line endings" -ForegroundColor Green
}

Write-Host "`n✅ All files fixed!" -ForegroundColor Green
