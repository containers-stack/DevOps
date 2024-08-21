


$TENANT_ID = "<REPLACE_WITH_TENANT_ID>"
$CLIENT_ID = "<REPLACE_WITH_CLIENT_ID"
$CLIENT_SECRET = "<REPLACE_WITH_CLIENT_SECRET>"
$SENDGRID_API_KEY = "<REPLACE_WITH_SENDGRID_API_KEY>"

# Get the access token
function Get-AccessToken {
    param (
        [Parameter(Mandatory = $true)]
        [string]$TenantId,
        [Parameter(Mandatory = $true)]
        [string]$ClientId,
        [Parameter(Mandatory = $true)]
        [string]$ClientSecret
    )

    $headers = @{}
    $headers.Add("Accept", "*/*")
    $headers.Add("User-Agent", "Thunder Client (https://www.thunderclient.com)")
    $contentType = 'multipart/form-data; boundary=kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A'
    $reqUrl = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"
    $body = "--kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A
Content-Disposition: form-data; name=`"client_id`"

$ClientId
--kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A
Content-Disposition: form-data; name=`"client_secret`"

$ClientSecret
--kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A
Content-Disposition: form-data; name=`"grant_type`"

client_credentials
--kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A
Content-Disposition: form-data; name=`"scope`"

https://graph.microsoft.com/.default
--kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A--"

    $response = Invoke-RestMethod -Uri $reqUrl -Method Get -Headers $headers -ContentType $contentType -Body $body
    return $response
}

# Send email with SendGrid
function Send-SendGridEmail {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ApiKey,
        [Parameter(Mandatory = $true)]
        [string]$ToEmail,
        [Parameter(Mandatory = $true)]
        [string]$ToName,
        [Parameter(Mandatory = $true)]
        [string]$FromEmail,
        [Parameter(Mandatory = $true)]
        [string]$FromName,
        [Parameter(Mandatory = $true)]
        [string]$Subject,
        [Parameter(Mandatory = $true)]
        [string]$HtmlContent,
        [Parameter(Mandatory = $false)]
        [string]$CcEmail,
        [Parameter(Mandatory = $false)]
        [string]$CcName,
        [Parameter(Mandatory = $false)]
        [string]$AttachmentContent,
        [Parameter(Mandatory = $false)]
        [string]$AttachmentName,
        [Parameter(Mandatory = $false)]
        [string]$AttachmentType
    )

    $SENDGRID_API_KEY = "<REPLACE WITH_SENDGRID_API_KEY >"

    $headers = @{
        Authorization  = "Bearer $SENDGRID_API_KEY"
        "Content-Type" = "application/json"
    }
    $body = @{
        personalizations = @(
            @{
                to = @(
                    @{
                        email = $ToEmail
                        name  = $ToName
                    }
                )
            }
        )
        from             = @{
            email = $FromEmail
            name  = $FromName
        }
        subject          = $Subject
        content          = @(
            @{
                type  = "text/html"
                value = $HtmlContent
            }
        )
        # attachments = @(
        #     @{
        #         content = $AttachmentContent
        #         filename = $AttachmentName
        #         type = $AttachmentType
        #         disposition = "attachment"
        #     }
        # )
    }

    Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/mail/send" -Method Post -Headers $headers -Body ($body | ConvertTo-Json -Depth 10)
}

# Get the access token
$accessToken = Get-AccessToken -TenantId $TENANT_ID -ClientId $CLIENT_ID -ClientSecret $CLIENT_SECRET

# Get all users
$users = @()

$usersUrl = 'https://graph.microsoft.com/v1.0/users?$top=999'
$headers = @{}
$headers.Add("Accept", "*/*")
$headers.Add("Authorization", "Bearer $($accessToken.access_token)")
$contentType = 'application/json'
$response = Invoke-RestMethod -Uri $usersUrl -Method Get -Headers $headers -ContentType $contentType
$users += $response.value

do {
    write-host "Get next users... "
    $headers = @{}
    $headers.Add("Accept", "*/*")
    $headers.Add("Authorization", "Bearer $($accessToken.access_token)")
    $contentType = 'application/json'
    $response = Invoke-RestMethod -Uri $response.'@odata.nextLink' -Method Get -Headers $headers -ContentType $contentType
    $users += $response.value
}
until(
    !$response.'@odata.nextLink'
)

# Compare the mobile phone with the authentication phone number
$usersPhone = @()

try {

    foreach ($user in $users) { 

        # initialize the variables
        $mobilePhone = $user.mobilePhone
        $authe_phoneNumber = $response.value.phoneNumber

        $accessToken = Get-AccessToken
        $phoneMethodUrl = "https://graph.microsoft.com/v1.0/users/$($user.id)/authentication/phoneMethods"
        $headers = @{}
        $headers.Add("Accept", "*/*")
        $headers.Add("Authorization", "Bearer $($accessToken.access_token)")
        $contentType = 'application/json'
    
        $response = Invoke-RestMethod -Uri $phoneMethodUrl -Method Get -Headers $headers -ContentType $contentType

        if ($null -ne $response.value.phoneNumber -and $null -ne $user.mobilePhone) {
            Write-Host "Check $($user.displayName) mobile phone and authentication phone number equality"

            # remove the +972 prefix
            $mobilePhone = $user.mobilePhone.Replace("+972", "")
            $authe_phoneNumber = $response.value.phoneNumber.Replace("+972", "")

            # remove spaces and dashes
            $mobilePhone = $mobilePhone.Replace(" ", "")
            $mobilePhone = $mobilePhone.Replace("-", "")
            $authe_phoneNumber = $authe_phoneNumber.Replace(" ", "")
            $authe_phoneNumber = $authe_phoneNumber.Replace("-", "")

            # if mobilePhone starts with 0, remove it
            if ($mobilePhone.StartsWith("0")) {
                $mobilePhone = $mobilePhone.Substring(1)
            }

            # if authe_phoneNumber starts with 0, remove it
            if ($authe_phoneNumber.StartsWith("0")) {
                $authe_phoneNumber = $authe_phoneNumber.Substring(1)
            }

            # Compare the modified number 1 with number 2
            if ($mobilePhone -ne $authe_phoneNumber) {
                Write-Host "$($user.displayName) mobile phone is not equal to authentication phone number"
                $userPhone = [PSCustomObject]@{
                    Name        = $user.displayName
                    MobilePhone = $mobilePhone
                    AuthPhoneNumber = $response.value.phoneNumber
                    Mail        = $user.mail
                }
                $usersPhone += $userPhone
            }
            else {
                Write-Host "$($user.displayName) mobile phone is equal to authentication phone number ($($user.mobilePhone)) == ($($response.value.phoneNumber)))"
            }
        }
        else {
        
            write-host "$($user.displayName) does not have a mobile phone or authentication phone number"
            $userPhone = [PSCustomObject]@{
                Name        = $user.displayName
                MobilePhone = $mobilePhone
                AuthPhoneNumber = $response.value.phoneNumber
                Mail        = $user.mail
            }
            $usersPhone += $userPhone
        }
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}

$table = '<table style="border-collapse: collapse; width: 100%;"><tr style="background-color: #f2f2f2;"><th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Name</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">MobilePhone</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">MFA</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Mail</th></tr>'

foreach ($userPhone in $usersPhone) {
    $table += "<tr><td>$($userPhone.Name)</td><td>$($userPhone.MobilePhone)</td><td>$($userPhone.AuthPhoneNumber)</td><td>$($userPhone.Mail)</td></tr>"
}
$table += "</table>"
$html = $table 

$html >> "./users-phone-report.html"

write-host "Send email with the report"
Send-SendGridEmail -ApiKey $SENDGRID_API_KEY `
    -ToEmail "moti@u-btech.com" `
    -ToName "Moti Malka" `
    -FromEmail "moti@u-btech.com" `
    -FromName "Moti Malka" `
    -Subject "Users with different mobile phone and authentication phone number" `
    -HtmlContent $html
