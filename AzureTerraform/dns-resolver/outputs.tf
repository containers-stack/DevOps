output "dns_resolver" {
  value = {
    dns_resolver_id = azurerm_private_dns_resolver.private_dns_resolver.id
    dns_inbound_endpoints = tomap({
      for k, inbound_endpoint in azurerm_private_dns_resolver_inbound_endpoint.private_dns_resolver_inbound_endpoint : k =>
      {
        inbound_endpoint_id : inbound_endpoint.id,
        inbound_endpoint_name : inbound_endpoint.name,
        inbound_endpoint_private_ip_address : inbound_endpoint.ip_configurations[0].private_ip_address
      }
    })
    dns_outbound_endpoints = tomap({
      for k, endpoint in azurerm_private_dns_resolver_outbound_endpoint.private_dns_resolver_outbound_endpoint : k =>
      {
        outbound_endpoint_name : endpoint.name,
        outbound_endpoint_id : endpoint.id
        dns_forwarding_rulesets : tomap({
          for k, forwarding_ruleset in azurerm_private_dns_resolver_dns_forwarding_ruleset.forwarding_ruleset : k =>
          {
            ruleset_name : forwarding_ruleset.name,
            ruleset_id : forwarding_ruleset.id
          }
        })
      }
      }
    )
  }
}