#####################################################################
# Script to create a new app registration in Azure AD
# The script will create a new app registration in the current tenant
# The script will create a new secret for the app registration
#####################################################################

$LogFile = "./script-log.txt"

function Write-Log {
    param (
        [string]$message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp - $message"
    Write-Host $logMessage
    $logMessage | Add-Content -Path $LogFile
}

# Check if the AzureAD module is already installed, if not, install it
if (-not (Get-Module -ListAvailable -Name "Az.Resources")) {
    Write-Log "Installing AzureAD module"
    Install-Module "Az.Resources" -Force -AllowClobber
}

Write-Log "Logging in to Azure"
$Connection = Connect-AzAccount 

$TenantId = $Connection.Context.Tenant.Id

# get approval from user to create a new app registration on this tenant
$Approval = Read-Host "This script will create a new app registration in Tenant $TenantId , please type 'y' to approve or 'n' to deny"

Write-Log "Creating app registration..."

if ($Approval -ne "y") {
    Write-Log "User did not approve the creation of a new app registration"
    # sleep for 10 seconds
    Start-Sleep -Seconds 10
    exit
}

# ask user for the app name
$AppName = "activfile-app-registration"
$App = New-AzADServicePrincipal -DisplayName $AppName

$startDate = Get-Date
$endDate = $startDate.AddYears(1)

Write-Log "Creating a new secret for the app registration"
$Secret = (New-AzADAppCredential -StartDate $startDate -EndDate $endDate -ApplicationId $App.AppId).SecretText

$ObjectId = (Get-AzADApplication -ApplicationId $App.AppId).Id

$permissions = @(
    @{
        "name" = "User.ReadBasic.All"
        "id" = "97235f07-e226-4f63-ace3-39588e11d3a1"
    },
    @{
        "name" = "Mail.ReadBasic"
        "id" = "693c5e45-0940-467d-9b8a-1022fb9d42ef"
    },
    @{
        "name" = "Mail.Read"
        "id" = "810c84a8-4a9e-49e6-bf7d-12d183f40d01"
    },
    @{
        "name" = "Mail.ReadWrite"
        "id" = "e2a3a72e-5f79-4c64-b1b1-878b674786c9"
    }
)
Write-Log "Assigning permissions to the app registration"

for ($i = 0; $i -lt $permissions.Length; $i++) {
    $permission = $permissions[$i]
    Write-Log "Assigning permission $($permission.name)"
    Add-AzADAppPermission -ObjectId $ObjectId -ApiId "00000003-0000-0000-c000-000000000000"  -PermissionId $permission.id -Type "Role"
}

$AppConfig = @{
    TenantId = $TenantId
    AppId = $App.AppId
    Secret = $Secret
    DisplayName = $AppName
    ObjectId = $App.Id
    Permissions = $permissions
}

$AppConfig | ConvertTo-Json | Out-File "./app-config.json"

Write-Log "App registration created successfully, you can find the app configuration in the file ./app-config.json"

# Get access token
$token = (Get-AzAccessToken).Token

$consentData = @{
    clientAppId = $App.AppId
    onBehalfOfAll = $true
    checkOnly = $false
    tags = @()
    constrainToRra = $true
    dynamicPermissions = @(
        @{
            appIdentifier = "00000003-0000-0000-c000-000000000000"
            appRoles = @("User.ReadBasic.All", "Mail.ReadBasic.All", "Mail.Read", "Mail.ReadWrite")
            scopes = @()
        }
    )
}

$consentDataJson = $consentData | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "https://graph.microsoft.com/beta/directory/consentToApp" -Method Post -Body $consentDataJson -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }

Write-Log "Consent response: $($response | ConvertTo-Json -Depth 10)"

Write-Log "App Registration Created !"
