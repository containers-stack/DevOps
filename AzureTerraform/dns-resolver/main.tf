terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.1.0"
    }
  }
}

# Defining Local resources to be able to itegrate through multiple inbound and outbound endpoints, as well as multiple outbound forwarding rule sets.
locals {
  inbound_endpoint_map  = { for inboundendpoint in var.dns_resolver_inbound_endpoints : inboundendpoint.inbound_endpoint_name => inboundendpoint }
  outbound_endpoint_map = { for outboundendpoint in var.dns_resolver_outbound_endpoints : outboundendpoint.outbound_endpoint_name => outboundendpoint }

  outbound_endpoint_forwarding_rule_sets = flatten([
    for outbound_endpoint_key, outboundendpoint in var.dns_resolver_outbound_endpoints : [
      for forwarding_rule_set_key, forwardingruleset in outboundendpoint.forwarding_rulesets : {
        outbound_endpoint_name  = outboundendpoint.outbound_endpoint_name
        forwarding_ruleset_name = forwardingruleset.forwarding_ruleset_name
        outbound_endpoint_id    = azurerm_private_dns_resolver_outbound_endpoint.private_dns_resolver_outbound_endpoint[outbound_endpoint_key.outbound_endpoint_name].id
      }
    ]
  ])
}

# Creating the Azure Private DNS Resolver
resource "azurerm_private_dns_resolver" "private_dns_resolver" {
  name                = var.dns_resolver_name
  resource_group_name = var.resource_group_name
  location            = var.location
  virtual_network_id  = var.virtual_network_id
  tags                = var.tags
}

# Creating one or multiple Inbound Endpoints based on input map, note there is currently only support for two inbound endpoints per DNS Resolver, and they cannot share the same subnet.
resource "azurerm_private_dns_resolver_inbound_endpoint" "private_dns_resolver_inbound_endpoint" {
  for_each                = local.inbound_endpoint_map
  name                    = each.value.inbound_endpoint_name
  private_dns_resolver_id = azurerm_private_dns_resolver.private_dns_resolver.id
  location                = var.location
  tags                    = var.tags

  ip_configurations {
    private_ip_allocation_method = "Dynamic" # Dynamic is default and only supported.
    subnet_id                    = each.value.inbound_subnet_id
  }
}

# Creating one or multiple Outbound Endpoints based on input map, note there is currently only support for two outbound endpoints per DNS Resolver, and they cannot share the same subnet.
resource "azurerm_private_dns_resolver_outbound_endpoint" "private_dns_resolver_outbound_endpoint" {
  for_each                = local.outbound_endpoint_map
  name                    = each.value.outbound_endpoint_name
  private_dns_resolver_id = azurerm_private_dns_resolver.private_dns_resolver.id
  location                = var.location
  subnet_id               = each.value.outbound_subnet_id
  tags                    = var.tags
}

# Creating one or multiple DNS Resolver Forwarding rulesets, there is currently only support for two DNS forwarding rulesets per outbound endpoint
resource "azurerm_private_dns_resolver_dns_forwarding_ruleset" "forwarding_ruleset" {
  for_each = {
    for forwarding_rule_set in local.outbound_endpoint_forwarding_rule_sets : "${forwarding_rule_set.outbound_endpoint_name}-${forwarding_rule_set.forwarding_ruleset_name}" => forwarding_rule_set
  }
  name                                       = each.value.forwarding_ruleset_name
  resource_group_name                        = var.resource_group_name
  location                                   = var.location
  private_dns_resolver_outbound_endpoint_ids = [each.value.outbound_endpoint_id]
  tags                                       = var.tags
}