<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [azurerm_subnet.subnet](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/subnet) | resource |
| [azurerm_virtual_network.vnet](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/virtual_network) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_address_space"></a> [address\_space](#input\_address\_space) | VNET address space | `list(string)` | n/a | yes |
| <a name="input_location"></a> [location](#input\_location) | Location in which to deploy the network | `string` | `"israelcentral"` | no |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | Resource Group name | `string` | n/a | yes |
| <a name="input_subnets"></a> [subnets](#input\_subnets) | Subnets configuration | <pre>list(object({<br>    name                                           = string<br>    address_prefixes                               = list(string)<br>    enforce_private_link_endpoint_network_policies = bool<br>    enforce_private_link_service_network_policies  = bool<br>  }))</pre> | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | (Optional) Specifies the tags of the storage account | `map` | <pre>{<br>  "app": "harmonya",<br>  "location": "israelcentral"<br>}</pre> | no |
| <a name="input_vnet_name"></a> [vnet\_name](#input\_vnet\_name) | VNET name | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_name"></a> [name](#output\_name) | Specifies the name of the virtual network |
| <a name="output_subnet_ids"></a> [subnet\_ids](#output\_subnet\_ids) | Contains a list of the the resource id of the subnets |
| <a name="output_vnet_id"></a> [vnet\_id](#output\_vnet\_id) | Specifies the resource id of the virtual network |
<!-- END_TF_DOCS -->