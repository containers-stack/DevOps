
resource "azurerm_redis_cache" "redis" {
  name                      = var.redis_cache_name
  location                  = var.location
  resource_group_name       = var.resource_group_name
  capacity                  = var.capacity
  family                    = var.family
  sku_name                  = var.sku_name
  non_ssl_port_enabled       = var.enable_non_ssl_port
  minimum_tls_version       = var.minimum_tls_version
  public_network_access_enabled = false
}

resource "azurerm_private_endpoint" "redis_private_endpoint" {
  name                = "${var.redis_cache_name}-private-endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id
  
  private_service_connection {
    name                            = "${var.redis_cache_name}-private-endpoint-connection"
    private_connection_resource_id = azurerm_redis_cache.redis.id
    is_manual_connection           = false
    subresource_names = ["redisCache"]
  }
  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = var.private_dns_zone_ids
  }
}
