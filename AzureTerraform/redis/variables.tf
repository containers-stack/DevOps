variable "resource_group_name" {
  description = "Name of the resource group where the resources will be created."
  type        = string
}

variable "location" {
  description = "Location for the resources."
  type        = string
}

variable "redis_cache_name" {
  description = "Name of the Redis Cache."
  type        = string
}

variable "capacity" {
  description = "The size of the Redis cache to deploy."
  type        = number
}

variable "family" {
  description = "The family of the Redis cache to deploy."
  type        = string
}

variable "sku_name" {
  description = "The SKU name of the Redis cache to deploy."
  type        = string
}

variable "enable_non_ssl_port" {
  description = "Whether to enable the non-SSL port (6379)."
  type        = bool
  default     = false
}

variable "minimum_tls_version" {
  description = "The minimum TLS version."
  type        = string
  default     = "1.2"
}

variable "subnet_id" {
  description = "The ID of the subnet where the private endpoint will be deployed."
  type        = string
}

variable "private_dns_zone_ids" {
  description = "IDs of the private DNS zones."
  type        = list(string)
}
