Write-Output "Before NPM build"
npm run build -prefix ((Get-Item .).FullName+'\client\') | Set-Content -Path .\client\build.log
Write-Output "After NPM build"
if ($LASTEXITCODE -eq 0) {
    Write-Output "LASTEXITCODE is zero!!"
}