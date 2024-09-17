resource "azurerm_public_ip" "vpn_gateway_public_ip" {
  name                = var.public_ip_name
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
}

resource "azurerm_virtual_network_gateway" "vpn_gateway" {
  name                = var.vpn_gateway_name
  location            = var.location
  resource_group_name = var.resource_group_name
  type     = "Vpn"
  vpn_type = "RouteBased"
  active_active = false
  enable_bgp    = false
  sku           = var.vpn_gateway_sku
  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.vpn_gateway_public_ip.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = var.subnet_id
  }
  vpn_client_configuration {
    address_space = ["172.16.201.0/24"]
    vpn_client_protocols = ["OpenVPN"]
    aad_audience         =  "c632b3df-fb67-4d84-bdcf-b95ad541b5c8"
    aad_issuer           =  "https://sts.windows.net/1827cf7a-4a29-4f2a-890d-ebc95b6aae4f/"
    aad_tenant           = "https://login.microsoftonline.com/1827cf7a-4a29-4f2a-890d-ebc95b6aae4f"
  }
  tags = var.tags
}