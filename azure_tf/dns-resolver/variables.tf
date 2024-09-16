variable "resource_group_name" {
  type        = string
  description = "(Required): Name of the resource group where resources should be deployed."
}

variable "location" {
  type        = string
  description = "(Required): Region / Location where Azure DNS Resolver should be deployed"
}

variable "dns_resolver_name" {
  type        = string
  description = "(Required): Name of the Azure DNS Private Resolver"
}

variable "virtual_network_id" {
  type        = string
  description = "(Required): ID of the associated virtual network"
}

variable "dns_resolver_inbound_endpoints" {
  description = "(Optional): Set of Azure Private DNS resolver Inbound Endpoints"
  type = set(object({
    inbound_endpoint_name = string
    inbound_subnet_id     = string
  }))
  default = []
}

variable "dns_resolver_outbound_endpoints" {
  description = "(Optional): Set of Azure Private DNS resolver Outbound Endpoints with one or more Forwarding Rule sets"
  type = set(object({
    outbound_endpoint_name = string
    outbound_subnet_id     = string
    forwarding_rulesets = optional(set(object({
      forwarding_ruleset_name = optional(string)
    })))
  }))
  default = []
}

variable "tags" {
  type        = map(string)
  description = "(Optional): Resource Tags"
  default     = {}
}