$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$status = git status --porcelain
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo obtener el estado de Git."
}

if ([string]::IsNullOrWhiteSpace(($status | Out-String))) {
  Write-Host "No hay cambios guardados en disco para resguardar."
  exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "WIP antes de cambiar de carpeta $timestamp"

git stash push -u -m $message
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo crear el resguardo."
}

Write-Host ""
Write-Host "Ultimo resguardo creado:"
git stash list --max-count=1
