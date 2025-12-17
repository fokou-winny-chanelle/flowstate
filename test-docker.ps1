# Script PowerShell pour tester l'application FlowState avec Docker
# Ce script vérifie la configuration et lance les services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FlowState - Test Docker Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est installé
Write-Host "[1/5] Verification de Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: Docker n'est pas installe!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Docker est installe" -ForegroundColor Green

# Vérifier que Docker Compose est installé
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: Docker Compose n'est pas installe!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Docker Compose est installe" -ForegroundColor Green
Write-Host ""

# Vérifier le fichier .env
Write-Host "[2/5] Verification du fichier .env..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "ERREUR: Le fichier .env n'existe pas!" -ForegroundColor Red
    Write-Host "Creez un fichier .env a la racine du projet." -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content .env -Raw
$requiredVars = @("DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET", "GMAIL_USER", "GMAIL_APP_PASSWORD")
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envContent -notmatch "$var=") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "ATTENTION: Variables manquantes dans .env:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "  - $var" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Veuillez ajouter ces variables avant de continuer." -ForegroundColor Yellow
    Write-Host "Consultez ENV_SETUP_GUIDE.md pour plus d'informations." -ForegroundColor Yellow
    exit 1
}

# Vérifier DB_PASSWORD
if ($envContent -notmatch "DB_PASSWORD=") {
    Write-Host "ATTENTION: DB_PASSWORD manquant dans .env" -ForegroundColor Yellow
    Write-Host "Ajoutez: DB_PASSWORD=flowstate123" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Voulez-vous continuer quand meme? (o/n)"
    if ($response -ne "o" -and $response -ne "O") {
        exit 1
    }
}

Write-Host "OK: Fichier .env present avec les variables essentielles" -ForegroundColor Green
Write-Host ""

# Arrêter les services existants
Write-Host "[3/5] Arret des services existants..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "OK: Services arretes" -ForegroundColor Green
Write-Host ""

# Construire et démarrer les services
Write-Host "[4/5] Construction et demarrage des services..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes lors de la premiere execution..." -ForegroundColor Cyan
Write-Host ""

docker-compose up --build

Write-Host ""
Write-Host "[5/5] Services demarres!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Application accessible sur:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost" -ForegroundColor White
Write-Host "  Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host "  Swagger Docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "  Health Check: http://localhost:3000/api/health/live" -ForegroundColor White
Write-Host ""
Write-Host "Pour arreter les services: docker-compose down" -ForegroundColor Yellow
Write-Host "Pour voir les logs: docker-compose logs -f [service]" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

