# we configure the azurerm provider to use version 3.88.0, which is the latest version at the time of writing.
# also set the version of the provider in scope of the module,
# so that the module can be used with any version of the provider.
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.1.0"
    }
  }
}

locals {
  module_tag = {
    "module" = basename(abspath(path.module))
  }
  tags = merge(var.tags, local.module_tag)
}

resource "azurerm_log_analytics_workspace" "log_analytics_workspace" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.sku
  tags                = local.tags
  retention_in_days   = var.retention_in_days != "" ? var.retention_in_days : null

  lifecycle {
      ignore_changes = [
          tags
      ]
  }
}

resource "azurerm_log_analytics_solution" "la_solution" {
  for_each = var.solution_plan_map

  solution_name         = each.key
  location              = var.location
  resource_group_name   = var.resource_group_name
  workspace_resource_id = azurerm_log_analytics_workspace.log_analytics_workspace.id
  workspace_name        = azurerm_log_analytics_workspace.log_analytics_workspace.name

  plan {
    product   = each.value.product
    publisher = each.value.publisher
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}