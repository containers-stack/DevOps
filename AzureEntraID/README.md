Here is a README file in markdown format for the script:

```markdown
# PowerShell Script: User Phone Number Comparison and Email Report

This PowerShell script is designed to retrieve users from Microsoft Graph, compare their mobile phone numbers with their authentication phone numbers, and send a report via email using SendGrid. The script includes the following functionalities:

- Retrieve an access token from Azure AD.
- Fetch all users from Microsoft Graph.
- Compare users' mobile phone numbers with their authentication phone numbers.
- Generate an HTML report of users whose mobile phone numbers do not match their authentication phone numbers.
- Send the report via email using SendGrid.

## Prerequisites

- **Azure AD Application:** You need to register an application in Azure AD and obtain the Tenant ID, Client ID, and Client Secret.
- **SendGrid Account:** You need an API key from SendGrid to send emails.

## Configuration

Before running the script, replace the following placeholders with your actual values:

```powershell
$TENANT_ID = "<REPLACE_WITH_TENANT_ID>"
$CLIENT_ID = "<REPLACE_WITH_CLIENT_ID>"
$CLIENT_SECRET = "<REPLACE_WITH_CLIENT_SECRET>"
$SENDGRID_API_KEY = "<REPLACE_WITH_SENDGRID_API_KEY>"
```

## Functions

### Get-AccessToken

This function retrieves an access token from Azure AD using the provided Tenant ID, Client ID, and Client Secret.

#### Parameters:
- `TenantId` - Azure AD Tenant ID.
- `ClientId` - Azure AD Client ID.
- `ClientSecret` - Azure AD Client Secret.

### Send-SendGridEmail

This function sends an email using SendGrid's API.

#### Parameters:
- `ApiKey` - SendGrid API Key.
- `ToEmail` - Recipient email address.
- `ToName` - Recipient name.
- `FromEmail` - Sender email address.
- `FromName` - Sender name.
- `Subject` - Email subject.
- `HtmlContent` - HTML content of the email.
- `CcEmail` (optional) - CC email address.
- `CcName` (optional) - CC name.
- `AttachmentContent` (optional) - Content of the attachment.
- `AttachmentName` (optional) - Name of the attachment.
- `AttachmentType` (optional) - MIME type of the attachment.

## Running the Script

1. Open a PowerShell terminal.
2. Replace the placeholders in the script with your actual values.
3. Run the script.

The script will:

1. Retrieve an access token.
2. Fetch users from Microsoft Graph.
3. Compare their mobile phone numbers with their authentication phone numbers.
4. Generate an HTML report.
5. Send the report via email.

## Output

- An HTML file named `users-phone-report.html` will be generated, containing the comparison results.
- An email will be sent with the report attached.

## Error Handling

The script includes basic error handling to capture and display any issues encountered during execution.

## Notes

- The script removes the `+972` country code prefix from phone numbers before comparison.
- The script is currently set to compare phone numbers only for users with both a mobile and an authentication phone number. Users without one or both will be reported accordingly.

## License

This script is provided "as is" without any warranties. Use it at your own risk.
```

This README provides a comprehensive overview of the script, its functions, and how to configure and run it.