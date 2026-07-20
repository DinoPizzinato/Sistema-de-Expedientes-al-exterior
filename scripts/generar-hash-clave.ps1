param(
  [Parameter(Mandatory = $true)]
  [string]$Password
)

$sha = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
$hash = ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") }) -join ""

Write-Output "Password: $Password"
Write-Output "SHA256:   $hash"
Write-Output ""
Write-Output "Pegue el valor SHA256 en JavaScript\\seguridad.js dentro de ACCESS_PASSWORD_HASH."
