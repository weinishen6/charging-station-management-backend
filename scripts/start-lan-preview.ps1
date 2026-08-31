param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PrototypeFile = "YunSuChong_Interactive_Prototype.html"
$PrototypePath = Join-Path $ProjectRoot $PrototypeFile

if (-not (Test-Path $PrototypePath)) {
  throw "未找到原型文件：$PrototypePath"
}

$Network = Get-NetIPConfiguration |
  Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq "Up" } |
  Select-Object -First 1

$LanIp = $Network.IPv4Address.IPAddress
if (-not $LanIp) {
  throw "未识别到可用的局域网 IPv4 地址"
}

$LanUrl = "http://${LanIp}:$Port/$PrototypeFile"
Write-Host ""
Write-Host "局域网访问地址：" -ForegroundColor Cyan
Write-Host $LanUrl -ForegroundColor Green
Write-Host ""
Write-Host "同事需要与当前电脑处于同一局域网；按 Ctrl+C 停止服务。"
Write-Host ""

Set-Location $ProjectRoot
if (Get-Command py -ErrorAction SilentlyContinue) {
  & py -m http.server $Port --bind 0.0.0.0
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  & python -m http.server $Port --bind 0.0.0.0
} else {
  throw "未找到 Python，请先安装 Python 3"
}
