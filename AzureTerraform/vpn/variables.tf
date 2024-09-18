variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
}

variable "location" {
  description = "The Azure region where resources will be created."
  type        = string
}

variable "vnet_name" {
  description = "The name of the virtual network."
  type        = string
}

variable "subnet_id" {
  description = "The ID of the subnet for the VPN Gateway."
  type        = string
}

variable "public_ip_name" {
  description = "The name for the public IP address."
  type        = string
}

variable "vpn_gateway_name" {
  description = "The name of the VPN Gateway."
  type        = string
}

variable "vpn_gateway_sku" {
  description = "The SKU of the VPN Gateway."
  default     = "VpnGw1"
  type        = string
}

variable "tags" {
  description = "A mapping of tags to assign to the resources."
  type        = map(string)
  
}