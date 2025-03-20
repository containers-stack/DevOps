# Variables
$resourceGroupName = "YourResourceGroupName"
$webAppName = "YourWebAppName"
$newAllowedIp = "New.IP.Address.Here"

# Login to Azure
Connect-AzAccount

# Get the current configuration
$webApp = Get-AzWebApp -ResourceGroupName $resourceGroupName -Name $webAppName
$currentIpRestrictions = $webApp.SiteConfig.IpSecurityRestrictions

# Add the new IP address to the list
$newIpRestriction = New-Object Microsoft.Azure.Management.WebSites.Models.IpSecurityRestriction
$newIpRestriction.IpAddress = $newAllowedIp
$newIpRestriction.Action = "Allow"
$newIpRestriction.Priority = 100
$newIpRestriction.Name = "AllowNewIP"

$currentIpRestrictions.Add($newIpRestriction)

# Update the web app configuration
Set-AzWebApp -ResourceGroupName $resourceGroupName -Name $webAppName -IpSecurityRestrictions $currentIpRestrictions

Write-Output "IP address $newAllowedIp has been added to the allowed list."