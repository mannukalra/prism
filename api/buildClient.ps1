Write-Output "Before NPM build"
npm run build -prefix ((Get-Item .).FullName+'\api\client\')
Write-Output "After NPM build"
if ($LASTEXITCODE -eq 0) {
    Write-Output "NPM build was successful"
    (Get-Content ((Get-Item .).FullName+'\api\env.json')).replace("build_bkp", "build") | Set-Content ((Get-Item .).FullName+'\api\env.json')
}