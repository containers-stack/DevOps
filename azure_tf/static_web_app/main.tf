resource "azurerm_static_web_app" "static_web_app" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location

  sku_tier = var.sku_tier
  sku_size = var.sku_size
  tags     = var.tags
}