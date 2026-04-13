$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$stashList = git stash list --max-count=1
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo consultar la lista de resguardos."
}

if ([string]::IsNullOrWhiteSpace(($stashList | Out-String))) {
  Write-Host "No hay resguardos para restaurar."
  exit 0
}

git stash apply 'stash@{0}'
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo restaurar el ultimo resguardo."
}

Write-Host ""
Write-Host "Se restauro el ultimo resguardo y se dejo una copia en la lista de stash."
