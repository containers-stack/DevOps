# GitHub Copilot Content Exclusion Configuration

## Overview

This file is intended for organizations using GitHub Copilot who want to prevent GitHub Copilot from accessing sensitive files that contain information such as connection strings, passwords, certificates, and other confidential data. By configuring content exclusions, you can ensure that GitHub Copilot respects the privacy of your sensitive files.

## Purpose

When you configure content exclusions:

- **Code Completion:** GitHub Copilot will not provide code completion suggestions for the excluded files.
- **Code Suggestions:** Content from the excluded files will not influence code completion suggestions in other files.
- **GitHub Copilot Chat:** The content in the excluded files will not affect responses from GitHub Copilot Chat.

## Configuration

To use this configuration, place this file in your repository and customize it according to your needs. The file lists patterns for files and directories that should be excluded from GitHub Copilot’s access. For example:

```yaml
"*":
  - "**/.env"
  - "**/.env.*"                # e.g., .env.production, .env.local
  - "**/.secrets"
  - "**/.secret"
  - "**/secrets/*"
  - "**/secret/*"
  - "**/.credentials"
  - "**/credentials/*"
  - "**/config/.env"
  - "**/config/.secret"
  - "**/config/secrets/*"
  - "**/config/keys/*"
  - "**/.config"
  - "**/auth.json"
  - "**/.git-credentials"
  - "**/private.key"
  - "**/private.pem"
  
  # Node.js
  - "**/config/keys.js"
  - "**/config/keys.json"
  - "**/config/keys.ts"
  - "**/config/*.key"
  - "**/config/*.pem"
  - "**/.npmrc"                # NPM credentials
  - "**/.yarnrc"               # Yarn credentials

  # Python
  - "**/config.py"
  - "**/secrets.py"
  - "**/.python_secrets"
  - "**/.python_keys"
  - "**/.python_cred"
  - "**/.env.secret"
  - "**/pip.conf"

  # Ruby
  - "**/config/credentials.yml.enc"
  - "**/config/master.key"
  - "**/.gem/credentials"
  - "**/.bundle/config"
  - "**/.rbenv-vars"

  # PHP
  - "**/.env.php"
  - "**/config/keys.php"
  - "**/config/credentials.php"
  - "**/secrets.php"
  - "**/secret.php"
  - "**/.pearrc"

  # Java
  - "**/config/secret.properties"
  - "**/config/secrets.xml"
  - "**/config/application-secret.yml"
  - "**/config/application-secrets.yml"
  - "**/keystore.jks"
  - "**/secret.keystore"
  - "**/web.xml"

  # .NET
  - "**/appsettings.json"
  - "**/appsettings.Development.json"
  - "**/appsettings.*.json"
  - "**/secrets.json"
  - "**/config/secrets.xml"
  - "**/config/keys.xml"
  - "**/*.pfx"
  - "**/*.snk"

  # Go
  - "**/config.yaml"
  - "**/secrets.yaml"
  - "**/config.json"
  - "**/.go-secrets/*"
  - "**/.go-credentials/*"

  # Swift/iOS
  - "**/GoogleService-Info.plist"  # Firebase credentials
  - "**/config/keys.plist"
  - "**/config/secret.plist"
  - "**/Secrets.swift"

  # Android
  - "**/secrets.properties"
  - "**/config/secrets.xml"
  - "**/debug.keystore"
  - "**/release.keystore"
  - "**/google-services.json"      # Firebase credentials
  - "**/app/secret.xml"

  # Kubernetes/Helm
  - "**/secrets.yaml"
  - "**/helm/secrets/*.yaml"
  - "**/k8s/secrets/*.yaml"

  # Terraform
  - "**/*.tfvars"
  - "**/*.tfstate"
  - "**/*.tfstate.backup"
  - "**/.terraform/environment"
  - "**/terraform.tfstate.d/*"
  - "**/terraform.tfvars.json"

  # AWS
  - "**/.aws/credentials"
  - "**/.aws/config"
  - "**/credentials"
  - "**/aws.json"
  - "**/aws-exports.js"

  # Azure
  - "**/.azure/credentials"
  - "**/azure.json"
  - "**/azureauth.json"

  # GCP
  - "**/gcp-credentials.json"
  - "**/gcp-key.json"
  - "**/gcloud.json"

  # Docker
  - "**/.docker/config.json"
  - "**/docker-compose.override.yml"
  - "**/docker-compose.secrets.yml"

  # CI/CD (GitLab, Jenkins, Travis, etc.)
  - "**/.gitlab-ci.yml"
  - "**/.travis.yml"
  - "**/jenkins.yml"
  - "**/.circleci/config.yml"
  - "**/codeship.secrets.yml"
  - "**/codeship.env"

  # Ansible
  - "**/secrets.yml"
  - "**/group_vars/all/vault.yml"
  - "**/host_vars/*/vault.yml"
  - "**/group_vars/*/vault.yml"

  # Vagrant
  - "**/.vagrant/*"
  - "**/Vagrantfile"

  # Packer
  - "**/packer_keys.json"
  - "**/packer-secrets.json"

  # SaltStack
  - "**/salt/pillar/*.sls"
  - "**/salt/pillar/secret.sls"
  - "**/salt/pillar/secrets.sls"
