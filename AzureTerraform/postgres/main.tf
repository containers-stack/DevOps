resource "azurerm_postgresql_flexible_server" "postgresql_server" {
  name                          = var.postgresql_server_name
  resource_group_name           = var.resource_group_name
  location                      = var.location
  administrator_login           = var.administrator_login
  administrator_password        = var.administrator_password
  storage_mb                    = var.storage_mb
  backup_retention_days         = var.backup_retention_days
  sku_name                      = var.sku_name
  version                       = var.postgresql_version
  zone                          = var.zone
  tags                          = var.tags
}


resource "azurerm_postgresql_flexible_server_database" "postgresql_db" {
  for_each = { for db in var.databases : db.name => db }
  name      = "postgresql-db-${var.environment}-${each.value.name}"
  server_id = azurerm_postgresql_flexible_server.postgresql_server.id
  collation = var.collation
  charset   = var.charset

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_private_endpoint" "postgresql_private_endpoint" {
  name                = "${var.postgresql_server_name}-private-endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id
  
  private_service_connection {
    name                            = "${var.postgresql_server_name}-private-endpoint-connection"
    private_connection_resource_id  = azurerm_postgresql_flexible_server.postgresql_server.id
    is_manual_connection            = false
    subresource_names               = ["postgresqlServer"]
  } 
   private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = var.private_dns_zone_ids
  }
}
