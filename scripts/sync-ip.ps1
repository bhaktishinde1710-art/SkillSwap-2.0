# Script to automatically sync the laptop's Wi-Fi IP address with mobile/.env
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "mobile\.env"

$ipObj = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | 
    Where-Object { ($_.InterfaceAlias -match 'Wi-Fi|Wireless' -or $_.InterfaceAlias -match 'Ethernet') -and $_.IPAddress -notmatch '^169\.' -and $_.IPAddress -ne '127.0.0.1' } | 
    Select-Object -First 1

if (-not $ipObj) {
    Write-Host "[SkillSwap] Could not automatically detect a Wi-Fi IP address." -ForegroundColor Yellow
    exit 1
}

$ip = "$($ipObj.IPAddress)".Trim()
$adapter = "$($ipObj.InterfaceAlias)".Trim()
$apiUrl = "http://${ip}:8000/api/v1"

$lines = @(
    "# SkillSwap 2.0 Mobile Environment Configuration",
    "# Synchronized adapter: $adapter",
    "EXPO_PUBLIC_API_URL=$apiUrl"
)

[System.IO.File]::WriteAllLines($envFile, $lines)

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SkillSwap 2.0 -- Mobile API URL Synchronized" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Network Adapter : $adapter"
Write-Host " Laptop IPv4     : $ip"
Write-Host " Target API URL  : $apiUrl"
Write-Host " Config Saved    : $envFile"
Write-Host ""
Write-Host "Next Step: Start Expo with cache cleared:" -ForegroundColor Cyan
Write-Host "  cd mobile; npx expo start -c" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
