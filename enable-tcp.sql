EXEC xp_cmdshell 'powershell -NonInteractive -Command "$smo = [System.Reflection.Assembly]::LoadWithPartialName(''Microsoft.SqlServer.SqlWmiManagement''); $wmi = New-Object Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer; $tcp = $wmi.ServerInstances[''MSSQLSERVER''].ServerProtocols[''Tcp'']; $tcp.IsEnabled = $true; $tcp.Alter(); Write-Host TCP_ENABLED_OK"'
GO
