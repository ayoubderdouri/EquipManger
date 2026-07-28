$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $root "equipment-management-api"
$uiDir = Join-Path $root "equipement-management-ui"
$apiUrl = "http://localhost:8080/swagger-ui.html"

function Start-NamedProcess {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory
    )

    Write-Host "[$Name] starting in $WorkingDirectory" -ForegroundColor Cyan
    return Start-Process `
        -FilePath $FilePath `
        -ArgumentList $ArgumentList `
        -WorkingDirectory $WorkingDirectory `
        -PassThru `
        -NoNewWindow
}

function Wait-ForApi {
    param([string]$Url, [int]$TimeoutSeconds = 45)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    Write-Host "[spring] waiting for $Url" -ForegroundColor DarkCyan

    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 | Out-Null
            Write-Host "[spring] ready" -ForegroundColor Green
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    Write-Host "[spring] not ready after $TimeoutSeconds seconds, starting React anyway" -ForegroundColor Yellow
}

$spring = Start-NamedProcess `
    -Name "spring" `
    -FilePath (Join-Path $apiDir "mvnw.cmd") `
    -ArgumentList @("spring-boot:run") `
    -WorkingDirectory $apiDir

try {
    Wait-ForApi -Url $apiUrl

    $react = Start-NamedProcess `
        -Name "react" `
        -FilePath "npm.cmd" `
        -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1") `
        -WorkingDirectory $uiDir

    Write-Host ""
    Write-Host "Full stack started:" -ForegroundColor Green
    Write-Host "- API:   http://localhost:8080" -ForegroundColor Green
    Write-Host "- UI:    http://127.0.0.1:3001" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop both processes." -ForegroundColor DarkGray

    while (-not $spring.HasExited -and -not $react.HasExited) {
        Start-Sleep -Seconds 1
    }
} finally {
    foreach ($process in @($spring, $react)) {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
        }
    }
}
