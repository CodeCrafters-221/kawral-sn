# ============================================================
# Kawral – Appliquer les templates d'emails sur Supabase
# ============================================================
# Prérequis :
#   1. Générez un Personal Access Token (PAT) sur :
#      https://supabase.com/dashboard/account/tokens
#   2. Remplacez YOUR_PAT_HERE ci-dessous par ce token
# ============================================================

$PAT       = "YOUR_PAT_HERE"
$PROJECT   = "osrjeifsmhwvlfsfiggx"
$API_URL   = "https://api.supabase.com/v1/projects/$PROJECT/config/auth"

# Lire les fichiers HTML
$confirmation = (Get-Content -Path "$PSScriptRoot\confirmation.html" -Raw) -replace "`r`n", "`n"
$recovery     = (Get-Content -Path "$PSScriptRoot\recovery.html"     -Raw) -replace "`r`n", "`n"
$magiclink    = (Get-Content -Path "$PSScriptRoot\magic-link.html"   -Raw) -replace "`r`n", "`n"
$invite       = (Get-Content -Path "$PSScriptRoot\invite.html"       -Raw) -replace "`r`n", "`n"
$emailchange  = (Get-Content -Path "$PSScriptRoot\email-change.html" -Raw) -replace "`r`n", "`n"

# Construire le body JSON
$body = @{
    mailer_subjects_confirmation  = "Confirmez votre adresse email – Kawral"
    mailer_templates_confirmation_content = $confirmation

    mailer_subjects_recovery      = "Réinitialisation de mot de passe – Kawral"
    mailer_templates_recovery_content = $recovery

    mailer_subjects_magic_link    = "Votre lien de connexion – Kawral"
    mailer_templates_magic_link_content = $magiclink

    mailer_subjects_invite        = "Vous êtes invité sur Kawral !"
    mailer_templates_invite_content = $invite

    mailer_subjects_email_change  = "Confirmez votre nouvel email – Kawral"
    mailer_templates_email_change_content = $emailchange
} | ConvertTo-Json -Depth 5

# Appel API
$response = Invoke-RestMethod `
    -Uri $API_URL `
    -Method PATCH `
    -Headers @{
        "Authorization" = "Bearer $PAT"
        "Content-Type"  = "application/json"
    } `
    -Body $body

Write-Host "✅ Templates appliqués avec succès !" -ForegroundColor Green
Write-Host ($response | ConvertTo-Json -Depth 5)
