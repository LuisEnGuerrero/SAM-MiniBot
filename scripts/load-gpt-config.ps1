Write-Host "Activando GPT y contexto PDF para SAM MiniBot..."

Invoke-WebRequest `
  -Uri http://localhost:5001/mini-bot-7a21d/us-central1/loadClientConfigFn `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body (Get-Content .\sam-minibot.gpt.json -Raw)

Write-Host "Configuración GPT aplicada correctamente."
