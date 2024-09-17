variable "resource_group_name" {
  description = "Resource Group name"
  type        = string
}

variable "location" {
  description = "Location in which to deploy the network"
  type        = string
  default     = "West Europe"
}

variable "vnet_name" {
  description = "VNET name"
  type        = string
}

variable "address_space" {
  description = "VNET address space"
  type        = list(string)
}

variable "subnets" {
  description = "Subnets configuration"
  type = list(object({
    name                                           = string
    address_prefixes                               = list(string)
    delegations                                    = list(object({
      name = string
      service_delegation = object({
        name = string
        actions = list(string)
      })
    }))
  }))
}

variable "tags" {
  description = "(Optional) Specifies the tags of the storage account"
  type        = map(string)
}
