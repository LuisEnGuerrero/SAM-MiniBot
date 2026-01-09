param (
  [string]$JsonFile = "sam-minibot.initial.json"
)

Write-Host "🚀 Cargando configuración del cliente desde $JsonFile..."

# 0️⃣ Resolver rutas absolutas
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $ScriptDir $JsonFile
$CleanJsonPath = Join-Path $ScriptDir "sam-minibot.initial.clean.json"

if (-not (Test-Path $JsonPath)) {
  Write-Error "❌ No se encuentra el archivo JSON: $JsonPath"
  exit 1
}

# 1️⃣ Obtener token Firebase
$token = (firebase auth:print-access-token).Trim()

if (-not $token) {
  Write-Error "❌ No se pudo obtener token Firebase"
  exit 1
}

# 2️⃣ Leer y escribir JSON limpio (UTF-8 sin BOM)
$jsonContent = Get-Content $JsonPath -Raw
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($CleanJsonPath, $jsonContent, $utf8NoBom)

# 3️⃣ Ejecutar request con curl
$responseCode = curl.exe `
  -s `
  -o "$ScriptDir\response.tmp" `
  -w "%{http_code}" `
  -X POST `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  --data-binary "@$CleanJsonPath" `
  https://us-central1-mini-bot-7a21d.cloudfunctions.net/loadClientConfigFn

# 4️⃣ Validar resultado
if ($responseCode -ne "200") {
  Write-Error "❌ Error cargando configuración (HTTP $responseCode)"
  Get-Content "$ScriptDir\response.tmp"
  exit 1
}

Write-Host "✅ Configuración cargada correctamente:"
Get-Content "$ScriptDir\response.tmp"
