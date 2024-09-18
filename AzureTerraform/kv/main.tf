terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.1.0"
    }
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                        = var.name
  location                    = var.location
  resource_group_name         = var.resource_group_name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = var.sku_name
  public_network_access_enabled = var.public_network_access_enabled
  tags                        = var.tags

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
   
    key_permissions = [
      "Create",
      "Get",
      "List",
      "Delete"
    ]

    secret_permissions = [
      "Set",
      "Get",
      "List",
      "Delete",
      "Recover",
      "Purge"
    ]

    storage_permissions = [
      "Set",
      "Get",
      "List",
      "Delete"
    ]
  }
}

resource "azurerm_private_endpoint" "kv_private_endpoint" {
  name                = "${var.name}-private-endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id
  
  private_service_connection {
    name                           = "${var.name}-private-endpoint-connection"
    private_connection_resource_id = azurerm_key_vault.kv.id
    is_manual_connection           = false
    subresource_names              = ["vault"]
  }
  private_dns_zone_group {
    name = "privatelink.vaultcore.azure.net"
    private_dns_zone_ids = var.private_dns_zone_ids

  }
}