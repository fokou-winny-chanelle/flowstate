# Script de test local pour FlowState
# Executez ce script dans PowerShell: .\test-local.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FlowState - Test Local avec Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier Docker
Write-Host "[1/5] Vérification de Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "  ✓ Docker est installé" -ForegroundColor Green
    docker --version
} else {
    Write-Host "  ✗ Docker n'est pas installé!" -ForegroundColor Red
    exit 1
}

if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host "  ✓ Docker Compose est installé" -ForegroundColor Green
    docker-compose --version
} else {
    Write-Host "  ✗ Docker Compose n'est pas installé!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 2: Vérifier le fichier .env
Write-Host "[2/5] Vérification du fichier .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "  ✓ Fichier .env trouvé" -ForegroundColor Green
    
    # Vérifier les variables essentielles
    $envContent = Get-Content .env -Raw
    
    $requiredVars = @("DB_PASSWORD", "JWT_SECRET", "JWT_REFRESH_SECRET", "GMAIL_USER", "GMAIL_APP_PASSWORD")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=") {
            Write-Host "  ✓ $var est défini" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $var est manquant" -ForegroundColor Red
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host ""
        Write-Host "  Variables manquantes: $($missingVars -join ', ')" -ForegroundColor Red
        Write-Host "  Veuillez les ajouter au fichier .env" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Exemple à ajouter:" -ForegroundColor Yellow
        Write-Host "  DB_PASSWORD=flowstate123" -ForegroundColor White
        Write-Host "  API_URL=http://localhost:3000/api" -ForegroundColor White
        Write-Host "  FRONTEND_PORT=80" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "  ✗ Fichier .env non trouvé!" -ForegroundColor Red
    Write-Host "  Créez un fichier .env à la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Étape 3: Arrêter les services existants
Write-Host "[3/5] Arrêt des services existants..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "  ✓ Services arrêtés" -ForegroundColor Green
Write-Host ""

# Étape 4: Construire les images
Write-Host "[4/5] Construction des images Docker..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre plusieurs minutes lors de la première exécution..." -ForegroundColor Gray
docker-compose build --no-cache
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Images construites avec succès" -ForegroundColor Green
} else {
    Write-Host "  ✗ Erreur lors de la construction" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Étape 5: Démarrer les services
Write-Host "[5/5] Démarrage des services..." -ForegroundColor Yellow
Write-Host "  Les services vont démarrer en arrière-plan..." -ForegroundColor Gray
docker-compose up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Services démarrés!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vérification du statut des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  URLs de l'application:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:3000/api" -ForegroundColor Green
Write-Host "  Swagger:   http://localhost:3000/api/docs" -ForegroundColor Green
Write-Host "  Health:    http://localhost:3000/api/health/live" -ForegroundColor Green
Write-Host ""
Write-Host "Pour voir les logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "Pour arrêter les services:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
