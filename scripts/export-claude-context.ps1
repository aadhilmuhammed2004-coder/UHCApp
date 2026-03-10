param(
  [string]$ProjectRoot = ".",
  [string]$OutputBaseName = "CLAUDE_CONTEXT",
  [int]$MaxCharsPerPart = 180000,
  [switch]$IncludeLockfiles
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-IsTextFile {
  param([string]$Path)

  try {
    $fs = [System.IO.File]::OpenRead($Path)
    try {
      $len = [Math]::Min($fs.Length, 8192)
      if ($len -le 0) { return $true }
      $buffer = New-Object byte[] $len
      [void]$fs.Read($buffer, 0, $len)
      foreach ($b in $buffer) {
        if ($b -eq 0) { return $false }
      }
      return $true
    } finally {
      $fs.Dispose()
    }
  } catch {
    return $false
  }
}

function Get-RepoFiles {
  param([string]$Root)

  $gitOk = $false
  try {
    $null = git -C $Root rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -eq 0) { $gitOk = $true }
  } catch {
    $gitOk = $false
  }

  if ($gitOk) {
    $raw = git -C $Root ls-files --cached --others --exclude-standard
    return $raw | Where-Object { $_ -and $_.Trim().Length -gt 0 }
  }

  $excludeDirs = @(".git", "node_modules", ".expo", "dist", "build", ".next")
  $all = Get-ChildItem -Path $Root -Recurse -File
  foreach ($d in $excludeDirs) {
    $all = $all | Where-Object { $_.FullName -notmatch ("[\\/]" + [Regex]::Escape($d) + "[\\/]") }
  }
  return $all | ForEach-Object {
    $_.FullName.Substring((Resolve-Path $Root).Path.Length).TrimStart('\', '/')
  }
}

$resolvedRoot = (Resolve-Path $ProjectRoot).Path
$outputBase = Join-Path $resolvedRoot $OutputBaseName
$allRelFiles = Get-RepoFiles -Root $resolvedRoot | Sort-Object -Unique
$allRelFiles = $allRelFiles | Where-Object { $_ -ne "$OutputBaseName.md" -and $_ -notmatch ("^" + [Regex]::Escape($OutputBaseName) + "_part\d+\.md$") }

if (-not $IncludeLockfiles) {
  $lockfileRegex = '(^|[\\/])(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$'
  $allRelFiles = $allRelFiles | Where-Object { $_ -notmatch $lockfileRegex }
}

$textFiles = New-Object System.Collections.Generic.List[string]
foreach ($rel in $allRelFiles) {
  $full = Join-Path $resolvedRoot $rel
  if (-not (Test-Path $full)) { continue }
  if (Test-IsTextFile -Path $full) {
    $textFiles.Add($rel)
  }
}

$headerLines = @(
  "# Claude Project Context",
  "",
  "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
  "Project root: $resolvedRoot",
  "",
  "This document includes full contents of text files from the repository.",
  "Binary files are skipped automatically.",
  "",
  "## File Index"
)

$fileIndex = $textFiles | ForEach-Object { "- $_" }

$parts = New-Object System.Collections.Generic.List[string]
$current = ($headerLines + $fileIndex + @("", "## Files")) -join "`r`n"

foreach ($rel in $textFiles) {
  $full = Join-Path $resolvedRoot $rel
  $content = Get-Content -Path $full -Raw
  $ext = [System.IO.Path]::GetExtension($rel).TrimStart('.')
  if (-not $ext) { $ext = "txt" }

  $section = @(
    "",
    "---",
    "",
    "### File: $rel",
    ('```' + $ext),
    $content,
    '```'
  ) -join "`r`n"

  if (($current.Length + $section.Length) -gt $MaxCharsPerPart -and $current.Length -gt 0) {
    $parts.Add($current)
    $current = @(
      "# Claude Project Context (continued)",
      "",
      "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
      "Project root: $resolvedRoot",
      "",
      "## Files"
    ) -join "`r`n"
  }

  $current += $section
}

if ($current.Length -gt 0) {
  $parts.Add($current)
}

for ($i = 0; $i -lt $parts.Count; $i++) {
  if ($parts.Count -eq 1) {
    $outPath = "$outputBase.md"
  } else {
    $outPath = "{0}_part{1:D2}.md" -f $outputBase, ($i + 1)
  }
  Set-Content -Path $outPath -Value $parts[$i] -Encoding UTF8
  Write-Host "Wrote $outPath"
}

Write-Host ""
Write-Host "Done. Paste the generated .md file(s) into Claude in order."
