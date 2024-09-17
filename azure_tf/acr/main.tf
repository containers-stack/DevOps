terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.1.0"
    }
  }
}

resource "azurerm_container_registry" "acr" {
  name                          = var.name
  resource_group_name           = var.resource_group_name
  location                      = var.location
  sku                           = var.sku  
  admin_enabled                 = var.admin_enabled
  public_network_access_enabled = false
  tags                          = var.tags  
  identity {
    type = "UserAssigned"
    identity_ids = [
      azurerm_user_assigned_identity.acr_identity.id
    ]
  }
}

resource "azurerm_private_endpoint" "acr_private_endpoint" {
  name                = "${var.name}-private-endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id
  
  private_service_connection {
    name                           = "${var.name}-private-endpoint-connection"
    private_connection_resource_id = azurerm_container_registry.acr.id
    is_manual_connection           = false
    subresource_names              = ["registry"]
  }
  private_dns_zone_group {
    name = "acrprivatelink.azurecr.io"
    private_dns_zone_ids = var.private_dns_zone_ids

  }
}

resource "azurerm_user_assigned_identity" "acr_identity" {
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
  name = "${var.name}Identity"
}

resource "azurerm_monitor_diagnostic_setting" "settings" {
  name                       = "DiagnosticsSettings"
  target_resource_id         = azurerm_container_registry.acr.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "ContainerRegistryRepositoryEvents"
  }
    enabled_log {
    category = "ContainerRegistryLoginEvents"
  }
  metric {
    category = "AllMetrics"
    enabled = true
  }
}
