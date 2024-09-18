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
| [azurerm_container_registry.acr](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/container_registry) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_admin_enabled"></a> [admin\_enabled](#input\_admin\_enabled) | (Optional) Specifies whether the admin user is enabled. Defaults to false. | `string` | `true` | no |
| <a name="input_georeplication_locations"></a> [georeplication\_locations](#input\_georeplication\_locations) | (Optional) A list of Azure locations where the container registry should be geo-replicated. | `list(string)` | `[]` | no |
| <a name="input_location"></a> [location](#input\_location) | (Required) Specifies the supported Azure location where the resource exists. Changing this forces a new resource to be created. | `string` | `"israelcentral"` | no |
| <a name="input_log_analytics_retention_days"></a> [log\_analytics\_retention\_days](#input\_log\_analytics\_retention\_days) | Specifies the number of days of the retention policy | `number` | `7` | no |
| <a name="input_name"></a> [name](#input\_name) | (Required) Specifies the name of the Container Registry. Changing this forces a new resource to be created. | `string` | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | (Required) The name of the resource group in which to create the Container Registry. Changing this forces a new resource to be created. | `string` | n/a | yes |
| <a name="input_sku"></a> [sku](#input\_sku) | (Optional) The SKU name of the container registry. Possible values are Basic, Standard and Premium. Defaults to Basic | `string` | `"Standard"` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | (Optional) A mapping of tags to assign to the resource. | `map(any)` | <pre>{<br>  "app": "demo",<br>  "location": "israelcentral"<br>}</pre> | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_admin_username"></a> [admin\_username](#output\_admin\_username) | Specifies the admin username of the container registry. |
| <a name="output_id"></a> [id](#output\_id) | Specifies the resource id of the container registry. |
| <a name="output_login_server"></a> [login\_server](#output\_login\_server) | Specifies the login server of the container registry. |
| <a name="output_login_server_url"></a> [login\_server\_url](#output\_login\_server\_url) | Specifies the login server url of the container registry. |
| <a name="output_name"></a> [name](#output\_name) | Specifies the name of the container registry. |
| <a name="output_resource_group_name"></a> [resource\_group\_name](#output\_resource\_group\_name) | Specifies the name of the resource group. |
<!-- END_TF_DOCS -->