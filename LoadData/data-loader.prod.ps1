$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath  = Join-Path $ScriptDir "sam-minibot.initial.json"

Write-Host "🚀 Cargando configuración del cliente desde sam-minibot.initial.json..."

if (-not (Test-Path $JsonPath)) {
  Write-Error "❌ No se encuentra el archivo JSON: $JsonPath"
  exit 1
}

# Leer JSON como texto UTF-8 limpio
$jsonRaw = Get-Content $JsonPath -Raw -Encoding UTF8

# Validar que sea JSON válido
try {
  $null = $jsonRaw | ConvertFrom-Json
} catch {
  Write-Error "❌ El archivo JSON no es válido"
  exit 1
}

# Token Firebase
$token = firebase auth:print-access-token

if (-not $token) {
  Write-Error "❌ No se pudo obtener el token de Firebase"
  exit 1
}

try {
  $response = Invoke-RestMethod `
    -Uri "https://us-central1-mini-bot-7a21d.cloudfunctions.net/loadClientConfigFn" `
    -Method POST `
    -Headers @{
      "Authorization" = "Bearer $token"
      "Content-Type"  = "application/json; charset=utf-8"
    } `
    -Body $jsonRaw

  Write-Host "✅ Configuración cargada correctamente:"
  $response | ConvertTo-Json -Depth 5

} catch {
  Write-Error "❌ Error cargando configuración:"
  Write-Error $_.Exception.Message
  exit 1
}
