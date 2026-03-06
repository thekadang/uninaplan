$ErrorActionPreference = "Stop"

function Assert-LastExitCode {
    param(
        [string]$Step
    )

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

Write-Host "Building project..."
npm run build
Assert-LastExitCode "Build"

$buildPath = Resolve-Path 'build'
Write-Host "Navigating to build directory..."
Set-Location $buildPath

Write-Host "Configuring safe.directory..."
git config --global --add safe.directory $buildPath.Path
Assert-LastExitCode "Configure safe.directory"

if (-not (Test-Path '.git')) {
    Write-Host "Initializing git..."
    git init
    Assert-LastExitCode "git init"
}

Write-Host "Preparing gh-pages branch..."
git checkout -B gh-pages
Assert-LastExitCode "git checkout"

git add -A
Assert-LastExitCode "git add"

git commit --allow-empty -m "Manual Deploy"
Assert-LastExitCode "git commit"

Write-Host "Pushing to GitHub Pages..."
git push -f https://github.com/thekadang/uninaplan.git gh-pages
Assert-LastExitCode "git push"

Write-Host "Deployment Complete"