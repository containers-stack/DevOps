variable "name" {
  description = "The name of the static site."
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
}

variable "location" {
  description = "The location of the static site."
  type        = string
}

variable "sku_tier" {
  description = "The tier of the SKU."
  type        = string
}

variable "sku_size" {
  description = "The size of the SKU."
  type        = string
}

variable "tags" {
  description = "The tags for the static site."
  type        = map(string)
}