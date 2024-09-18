variable "name" {
  description = "(Required) Specifies the name of the Key Vault. Changing this forces a new resource to be created."
  type        = string
}

variable "location" {
  description = "(Required) Specifies the supported Azure location where the resource exists. Changing this forces a new resource to be created."
  type        = string
}

variable "resource_group_name" {
  description = "(Required) Specifies the name of the resource group."
  type        = string
}

variable "sku_name" {
  description = "(Required) The Name of the SKU used for this Key Vault. Possible values are standard and premium."
  type        = string
  default     = "standard"
}

variable "tags" {
  description = "(Optional) Specifies the tags of the bastion host"
  type        = map(string)
}
variable "public_network_access_enabled" {
  description = "(Optional) Is public network access allowed for the key vault?"
  type        = bool
  default     = false
  
}

variable "subnet_id" {
  description = "(Required) The ID of the Subnet where the Private Endpoint should be created."
  type        = string
}

variable "private_dns_zone_ids" {
  description = "(Required) The ID of the Private DNS Zone to link to the Private Endpoint."
  type        = list(string)
}