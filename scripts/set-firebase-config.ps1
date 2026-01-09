Write-Host "Sincronizando variables de entorno con Firebase..."

# Cargar .env
Get-Content ".env" | ForEach-Object {
  if ($_ -match "^(.*?)=(.*)$") {
    $key = $matches[1]
    $value = $matches[2]

    switch ($key) {
      "MAIL_USER" {
        firebase functions:config:set mail.user="$value"
      }
      "MAIL_PASS" {
        firebase functions:config:set mail.pass="$value"
      }
      "OPENAI_API_KEY" {
        firebase functions:config:set llm.openai_key="$value"
      }
      "DEEPSEEK_API_KEY" {
        firebase functions:config:set llm.deepseek_key="$value"
      }
      "GEMINI_API_KEY" {
        firebase functions:config:set llm.gemini_key="$value"
      }
    }
  }
}

Write-Host "Variables cargadas en Firebase Config"

firebase functions:config:get

Write-Host "Recuerda ejecutar: firebase deploy --only functions"
