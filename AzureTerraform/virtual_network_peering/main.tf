resource "azurerm_virtual_network_peering" "peering" {
  name                      = "${var.vnet_1_name}-to-${var.vnet_2_name}"
  resource_group_name       = var.vnet_1_rg
  virtual_network_name      = var.vnet_1_name
  remote_virtual_network_id = var.vnet_2_id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
  allow_gateway_transit        = true
}

resource "azurerm_virtual_network_peering" "peering-back" {
  name                      = "${var.vnet_2_name}-to-${var.vnet_1_name}"
  resource_group_name       = var.vnet_2_rg
  virtual_network_name      = var.vnet_2_name
  remote_virtual_network_id = var.vnet_1_id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
  use_remote_gateways          = var.use_remote_gateways
}