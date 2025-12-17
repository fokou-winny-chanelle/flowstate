# Script PowerShell pour lancer l'application FlowState localement
# Backend et Frontend avec Node.js (sans Docker pour l'app)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FlowState - Lancement Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "nx.json")) {
    Write-Host "ERREUR: Ce script doit être exécuté depuis la racine du projet flowstate" -ForegroundColor Red
    exit 1
}

# Vérifier le fichier .env
Write-Host "[1/6] Verification du fichier .env..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "ERREUR: Le fichier .env n'existe pas!" -ForegroundColor Red
    Write-Host "Creez un fichier .env avec les variables necessaires." -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Fichier .env present" -ForegroundColor Green
Write-Host ""

# Vérifier que PostgreSQL et Redis sont disponibles
Write-Host "[2/6] Verification de PostgreSQL et Redis..." -ForegroundColor Yellow
Write-Host "Option 1: Lancer PostgreSQL et Redis avec Docker (recommandé)" -ForegroundColor Cyan
Write-Host "  Dans un autre terminal: docker-compose up postgres redis -d" -ForegroundColor White
Write-Host ""
$response = Read-Host "PostgreSQL et Redis sont-ils deja demarres? (o/n)"
if ($response -ne "o" -and $response -ne "O") {
    Write-Host ""
    Write-Host "Lancez PostgreSQL et Redis d'abord:" -ForegroundColor Yellow
    Write-Host "  docker-compose up postgres redis -d" -ForegroundColor White
    Write-Host ""
    Write-Host "Puis relancez ce script." -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: PostgreSQL et Redis supposes demarres" -ForegroundColor Green
Write-Host ""

# Vérifier les dépendances npm
Write-Host "[3/6] Verification des dependances npm..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Echec de l'installation des dependances" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK: node_modules present" -ForegroundColor Green
}
Write-Host ""

# Générer Prisma Client
Write-Host "[4/6] Generation du Prisma Client..." -ForegroundColor Yellow
npx prisma generate --schema=./backend/prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Echec de la generation du Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Prisma Client genere" -ForegroundColor Green
Write-Host ""

# Exécuter les migrations
Write-Host "[5/6] Execution des migrations de base de donnees..." -ForegroundColor Yellow
npx prisma migrate deploy --schema=./backend/prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "ATTENTION: Les migrations ont peut-etre echoue, mais on continue..." -ForegroundColor Yellow
}
Write-Host "OK: Migrations executees" -ForegroundColor Green
Write-Host ""

# Lancer les services
Write-Host "[6/6] Lancement des services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lancement en cours..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:3000" -ForegroundColor White
Write-Host "  - API: http://localhost:3000/api" -ForegroundColor Gray
Write-Host "  - Swagger: http://localhost:3000/api/docs" -ForegroundColor Gray
Write-Host "  - Health: http://localhost:3000/api/health/live" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend: http://localhost:4200" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter les services" -ForegroundColor Yellow
Write-Host ""

# Lancer backend et frontend en parallèle
# Note: PowerShell peut lancer plusieurs processus en arrière-plan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx nx serve backend
}

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx nx serve frontend
}

# Attendre et afficher les logs
try {
    Write-Host "Services demarres. Affichage des logs..." -ForegroundColor Green
    Write-Host ""
    
    # Afficher les logs des deux jobs
    while ($true) {
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Cyan
        }
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host ""
    Write-Host "Arret des services..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "Services arretes." -ForegroundColor Green
}
