Write-Host "Activando GPT y contexto PDF para SAM MiniBot..."

Invoke-WebRequest `
  -Uri https://us-central1-mini-bot-7a21d.cloudfunctions.net/loadClientConfigFn `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body (Get-Content .\sam-minibot.gpt.json -Raw)

Write-Host "Configuración GPT aplicada correctamente."
