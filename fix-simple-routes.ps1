$ErrorActionPreference = "Stop"
$root = "C:\EurovisionHost\eurovisionturkiye"
$files = Get-ChildItem -Recurse -Filter "route.ts" -Path "$root\src\app\api\votes" | Where-Object { $_.DirectoryName -like "*simple*" -and $_.FullName -notlike "*202004*" } | Select-Object -ExpandProperty FullName

Write-Host "Processing $($files.Count) files..."

foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
    $o = $c

    # Remove console.log lines (single and multiline)
    $lines = $c -split "`n"
    $out = [System.Collections.ArrayList]::new()
    $skip = $false
    foreach ($l in $lines) {
        if ($l -match '^\s*console\.log\(') {
            if ($l -match '\{[^}]*$') { $skip = $true }
            continue
        }
        if ($skip) {
            if ($l -match '^\s*\}\);') { $skip = $false }
            continue
        }
        [void]$out.Add($l)
    }
    $c = $out -join "`n"

    # Add select to competition.findFirst
    $c = [regex]::Replace($c, 'prisma\.competition\.findFirst\(\{\s*where:\s*\{\s*year:\s*(\d+)\s*\}\s*\}\)', {
        param($m)
        $yr = $m.Groups[1].Value
        return "prisma.competition.findFirst({ where: { year: $yr }, select: { id: true } })"
    })

    # Add select to vote.findFirst
    $c = [regex]::Replace($c, 'prisma\.vote\.findFirst\(\{\s*where:\s*\{\s*userEmail:\s*session\.user\.email,\s*competitionId:\s*competition\.id\s*\}\s*\}\)', "prisma.vote.findFirst({ where: { userEmail: session.user.email, competitionId: competition.id }, select: { votes: true } })")

    # Add select to cumulativeResult.findFirst
    $c = [regex]::Replace($c, 'prisma\.cumulativeResult\.findFirst\(\{\s*where:\s*\{\s*competitionId:\s*competition\.id\s*\}\s*\}\)', "prisma.cumulativeResult.findFirst({ where: { competitionId: competition.id }, select: { results: true, voteCounts: true, totalVotes: true } })")

    if ($c -ne $o) {
        $bom = [byte[]](0xEF,0xBB,0xBF)
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($c)
        [System.IO.File]::WriteAllBytes($f, $bom + $bytes)
        Write-Host "OK: $($f.Replace($root + '\', ''))"
    } else {
        Write-Host "SKIP: $($f.Replace($root + '\', ''))"
    }
}
Write-Host "DONE"
