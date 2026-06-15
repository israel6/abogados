# =============================================
# enable-sql-tcp.ps1
# Habilitar TCP/IP en SQL Server y reiniciar
# EJECUTAR COMO ADMINISTRADOR
# =============================================

Write-Host "Habilitando TCP/IP en SQL Server..." -ForegroundColor Cyan

# Habilitar TCP via WMI (SQL Server Configuration Manager API)
try {
    $wmi = New-Object Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer
    $tcp = $wmi.ServerInstances['MSSQLSERVER'].ServerProtocols['Tcp']
    $tcp.IsEnabled = $true
    $tcp.Alter()

    # Fijar puerto 1433 en IPAll
    $ipAll = $tcp.IPAddresses['IPAll']
    $ipAll.IPAddressProperties['TcpPort'].Value = '1433'
    $ipAll.IPAddressProperties['TcpDynamicPorts'].Value = ''
    $tcp.Alter()

    Write-Host "TCP/IP habilitado en puerto 1433." -ForegroundColor Green
} catch {
    # Fallback: editar registro directamente
    Write-Host "Usando fallback via registro..." -ForegroundColor Yellow
    $base = 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp'
    Set-ItemProperty -Path $base -Name 'Enabled' -Value 1
    Set-ItemProperty -Path "$base\IPAll" -Name 'TcpPort' -Value '1433'
    Set-ItemProperty -Path "$base\IPAll" -Name 'TcpDynamicPorts' -Value ''
    Write-Host "Registro actualizado." -ForegroundColor Green
}

# Reiniciar SQL Server
Write-Host "Reiniciando SQL Server..." -ForegroundColor Cyan
Restart-Service -Name 'MSSQLSERVER' -Force
Start-Sleep -Seconds 6

# Verificar
$port = netstat -an | Select-String ':1433'
if ($port) {
    Write-Host "✓ SQL Server escuchando en el puerto 1433." -ForegroundColor Green
} else {
    Write-Host "✗ Puerto 1433 aun no disponible. Verifica en SQL Server Configuration Manager." -ForegroundColor Red
}
