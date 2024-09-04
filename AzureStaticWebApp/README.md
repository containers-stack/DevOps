
# Deploy Web App to Azure Static Web Apps

This GitHub Action automates the deployment of your web application to Azure Static Web Apps. The workflow is triggered on every push to the `main` branch and on specific pull request events.

## Workflow Overview

### Trigger Events
- **Push**: The workflow is triggered on every push to the `main` branch.
- **Pull Request**: The workflow is triggered when a pull request is opened, synchronized, reopened, or closed on the `main` branch.

### Environment Variables
- **APP_LOCATION**: The path to your web app's source code. (Default: `/AzureStaticWebApp/demo/`)
- **APP_ARTIFACT_LOCATION**: The location of your build artifacts. (Default: `dist/demo/browser`)
- **AZURE_STATIC_WEB_APPS_API_TOKEN**: The API token for Azure Static Web Apps. This should be stored as a secret in your GitHub repository.

### Jobs

#### Build and Deploy Job
This job runs on every push to `main` and on pull request events that are not closed. It:
1. Checks out the repository.
2. Builds and deploys the web app to Azure Static Web Apps using the `Azure/static-web-apps-deploy@v1` action.

#### Close Pull Request Job
This job runs when a pull request to the `main` branch is closed. It:
1. Executes the `close` action using the `Azure/static-web-apps-deploy@v1` action to handle any necessary cleanup on Azure Static Web Apps.

## Permissions
- The `contents: read` permission is used to read the repository contents.
- The `pull-requests: write` permission is used to update the pull request status during deployment.

## Secrets
- **AZURE_STATIC_WEB_APPS_API_TOKEN**: Add this secret to your GitHub repository to authenticate the deployment to Azure Static Web Apps.

## Usage
To use this workflow, copy the YAML file into the `.github/workflows` directory of your repository. Make sure to set the appropriate paths for `APP_LOCATION` and `APP_ARTIFACT_LOCATION` according to your project's structure.
