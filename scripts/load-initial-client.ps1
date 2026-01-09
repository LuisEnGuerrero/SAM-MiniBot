Write-Host "Cargando configuración inicial de SAM MiniBot..."

Invoke-WebRequest `
  -Uri http://localhost:5001/mini-bot-7a21d/us-central1/loadClientConfigFn `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body (Get-Content .\sam-minibot.initial.json -Raw)

Write-Host "Configuración inicial cargada correctamente."
