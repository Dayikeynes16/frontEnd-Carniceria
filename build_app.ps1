$env:ELECTRON_BUILDER_CACHE = "C:\eb-cache"
$env:TMP = "C:\temp"
$env:TEMP = "C:\temp"

Write-Host "Updating Release directory..."
Remove-Item -Path "release" -Recurse -ErrorAction SilentlyContinue

Write-Host "Running Packaging..."
npx electron-builder build --win nsis --x64 --publish never
