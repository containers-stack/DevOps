output "fqdn" {
    description = "The FQDN of the Redis Cache instance."
    value       = azurerm_redis_cache.redis.hostname
}

output "port" {
    description = "The port of the Redis Cache instance."
    value       = azurerm_redis_cache.redis.port
}

output "access_key" {
    description = "The access key of the Redis Cache instance."
    value       = azurerm_redis_cache.redis.primary_access_key
}

output "connection_string" {
    description = "The connection string of the Redis Cache instance."
    value       = azurerm_redis_cache.redis.primary_connection_string
}