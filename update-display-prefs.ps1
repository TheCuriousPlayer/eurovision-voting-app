# Script to add display preferences to all Eurovision pages

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
  $originalContent = $content
  
  # 1. Add imports if not already present
  if ($content -notmatch "import DisplayPreferences") {
    $content = $content -replace (
      "import \{ DragDropContext, Droppable, Draggable, DropResult \} from '@hello-pangea/dnd';",
      "import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';`nimport DisplayPreferences from '@/components/DisplayPreferences';`nimport { useDisplayPreferences } from '@/hooks/useDisplayPreferences';"
    )
    Write-Host "  ✓ Added imports" -ForegroundColor Green
  }
  
  # 2. Add hook usage after useSession
  if ($content -notmatch "useDisplayPreferences") {
    $content = $content -replace (
      "const \{ data: session, status \} = useSession\(\);",
      "const { data: session, status } = useSession();`n  const { preferences } = useDisplayPreferences();"
    )
    Write-Host "  ✓ Added hook usage" -ForegroundColor Green
  }
  
  # 3. Add DisplayPreferences component before results section
  if ($content -notmatch "<DisplayPreferences />") {
    $content = $content -replace (
      '(\s+)(<!-- Sonuçlar Section)',
      "`$1<!-- Display Preferences -->`r`n`$1<DisplayPreferences />`r`n`r`n`$1`$2"
    )
    if ($content -ne $originalContent) {
      Write-Host "  ✓ Added DisplayPreferences component" -ForegroundColor Green
      $originalContent = $content
    }
  }
  
  # 4. Wrap weight percentage display (% Σ) with conditional
  # Pattern for authenticated users (with more indentation)
  $weightPattern1 = '(\s+)<div className="text-xs text-gray-400">\r?\n\s+\{\(\(\) => \{\r?\n\s+const denom = \(results\?\.totalVotes \|\| 0\) \* 12;\r?\n\s+if \(!denom\) return ''0% Σ'';\r?\n\s+const pct = \(points / denom\) \* 100;\r?\n\s+return `\$\{pct\.toFixed\(2\)\}% Σ`;\r?\n\s+\}\)\(\)\}\r?\n\s+</div>'
  $weightReplace1 = '$1{preferences.showWeightPercentage && (`r`n$1  <div className="text-xs text-gray-400">`r`n$1    {(() => {`r`n$1      const denom = (results?.totalVotes || 0) * 12;`r`n$1      if (!denom) return ''0% Σ'';`r`n$1      const pct = (points / denom) * 100;`r`n$1      return `${pct.toFixed(2)}% Σ`;`r`n$1    })()}`r`n$1  </div>`r`n$1)}'
  
  if ($content -match $weightPattern1) {
    $content = $content -replace $weightPattern1, $weightReplace1
    Write-Host "  ✓ Wrapped weight percentage with conditional" -ForegroundColor Green
  }
  
  # 5. Add conditional to voter percentage (% 👤)
  $voterPattern = '\{results\?\.countryVoteCounts && results\.countryVoteCounts\[country\] !== undefined && \('
  $voterReplace = '{preferences.showVoterPercentage && results?.countryVoteCounts && results.countryVoteCounts[country] !== undefined && ('
  
  if ($content -match $voterPattern) {
    $content = $content -replace $voterPattern, $voterReplace
    Write-Host "  ✓ Added voter percentage conditional" -ForegroundColor Green
  }
  
  # Save file if changes were made
  if ($content -ne $originalContent) {
    [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  ✓ File saved successfully" -ForegroundColor Green
  } else {
    Write-Host "  - No changes needed" -ForegroundColor Yellow
  }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Green
