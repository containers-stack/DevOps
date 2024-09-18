variable "postgresql_server_name" {
  description = "The name of the PostgreSQL Flexible Server."
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
}

variable "location" {
  description = "The location where the PostgreSQL Flexible Server should be created."
  type        = string
}

variable "administrator_login" {
  description = "The administrator login for the PostgreSQL Flexible Server."
  type        = string
}

variable "administrator_password" {
  description = "The password for the administrator login."
  type        = string
  sensitive   = true
}

variable "storage_mb" {
  description = "The storage size in MB for the PostgreSQL Flexible Server."
  type        = number
}

variable "backup_retention_days" {
  description = "The number of days to retain backups."
  type        = number
}

variable "sku_name" {
  description = "The SKU name for the PostgreSQL Flexible Server."
  type        = string
  default     = "Standard_D2s_v3"
}

variable "tags" {
  description = "A map of tags to assign to the PostgreSQL Flexible Server."
  type        = map(string)
  default     = {}
}

variable "collation" {
  description = "The collation of the database."
  type        = string
  default     = "en_US.utf8"
}

variable "charset" {
  description = "The charset of the database."
  type        = string
  default     = "utf8"
}

variable "private_dns_zone_ids" {
  description = "The IDs of the private DNS zones."
  type        = list(string)
}

variable "subnet_id" {
  description = "The ID of the subnet."
  type        = string
}

variable "environment" {
  description = "The environment name."
  type        = string
}

variable "databases" {
  description = "A list of databases to create."
  type        = list(object({
    name          = string
    collation     = string
    charset       = string
  }))
}


variable "zone" {
  description = "The zone for the PostgreSQL Flexible Server."
  type        = string
}

variable "postgresql_version" {
  description = "The version of the PostgreSQL Flexible Server."
  type        = string
  
}