# HintaTutka MV3 — 1-Click Unpacked Extension Updater (Windows PowerShell)
$ErrorActionPreference = 'Stop'
$targetDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$zipUrl = 'https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka-MV3-Extension.zip'
$tempZip = Join-Path ([System.IO.Path]::GetTempPath()) "HintaTutka-MV3-Update-$([Guid]::NewGuid().ToString('N')).zip"
$tempExtract = Join-Path ([System.IO.Path]::GetTempPath()) "HintaTutka-MV3-Extract-$([Guid]::NewGuid().ToString('N'))"

Write-Host "Downloading latest HintaTutka MV3 release from GitHub..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing

New-Item -ItemType Directory -Path $tempExtract -Force | Out-Null
Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
Copy-Item -Path (Join-Path $tempExtract '*') -Destination $targetDir -Recurse -Force

Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue
Remove-Item -Path $tempExtract -Recurse -Force -ErrorAction SilentlyContinue

$manifest = Get-Content (Join-Path $targetDir 'manifest.json') -Raw | ConvertFrom-Json
Write-Host "Updated HintaTutka MV3 Extension to v$($manifest.version)!" -ForegroundColor Green
Write-Host "Next step: Open chrome://extensions and click the Reload icon on HintaTutka." -ForegroundColor Yellow
