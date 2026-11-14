# Store a secret without showing it on screen or to anyone else:
#   - writes NAME=value into .env.local (local development),
#   - uploads it as a Cloudflare Worker secret (wrangler secret put).
# Usage: powershell -ExecutionPolicy Bypass -File scripts\set-secret.ps1 -Name RESEND_API_KEY -Worker tremola-preview
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [string]$Worker = "tremola-preview"
)
$ErrorActionPreference = "Stop"
$env:Path = "C:\Users\thanh\AppData\Local\node;" + $env:Path
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Paste $Name (input hidden), then press Enter:" -ForegroundColor Yellow
$secure = Read-Host -AsSecureString
$value = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)).Trim()
if (-not $value) { Write-Host "Empty value, nothing saved." -ForegroundColor Red; exit 1 }

# .env.local: replace the line if present, otherwise append.
$envFile = ".env.local"
$lines = @()
if (Test-Path $envFile) { $lines = Get-Content $envFile -Encoding UTF8 }
$found = $false
$lines = $lines | ForEach-Object {
  if ($_ -match "^$Name=") { $found = $true; "$Name=$value" } else { $_ }
}
if (-not $found) { $lines += "$Name=$value" }
Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host "Saved to .env.local" -ForegroundColor Green

$value | npx -y wrangler@4 secret put $Name --name $Worker
$value = $null
Write-Host "Done. You can close this window." -ForegroundColor Green
