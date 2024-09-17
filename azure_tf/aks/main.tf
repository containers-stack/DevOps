terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.1.0"
    }
  }
}

resource "azurerm_user_assigned_identity" "aks_identity" {
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags

  name = "${var.name}Identity"

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_kubernetes_cluster" "aks_cluster" {
  name                             = var.name
  location                         = var.location
  resource_group_name              = var.resource_group_name
  kubernetes_version               = var.kubernetes_version
  dns_prefix                       = var.dns_prefix
  private_cluster_enabled          = var.private_cluster_enabled
  automatic_upgrade_channel        = var.automatic_channel_upgrade
  sku_tier                         = var.sku_tier
  workload_identity_enabled        = var.workload_identity_enabled
  oidc_issuer_enabled              = var.oidc_issuer_enabled
  open_service_mesh_enabled        = var.open_service_mesh_enabled
  image_cleaner_enabled            = var.image_cleaner_enabled
  image_cleaner_interval_hours     = var.image_cleaner_interval_hours
  azure_policy_enabled             = var.azure_policy_enabled
  http_application_routing_enabled = var.http_application_routing_enabled
  node_resource_group              = var.node_resource_group

  default_node_pool {
    name                   = var.default_node_pool_name
    vm_size                = var.default_node_pool_vm_size
    vnet_subnet_id         = var.vnet_subnet_id
    pod_subnet_id          = var.pod_subnet_id
    zones                  = var.default_node_pool_availability_zones
    node_labels            = var.default_node_pool_node_labels
    auto_scaling_enabled   = var.default_node_pool_enable_auto_scaling
    host_encryption_enabled= var.default_node_pool_enable_host_encryption
    node_public_ip_enabled = var.default_node_pool_enable_node_public_ip
    max_pods               = var.default_node_pool_max_pods
    max_count              = var.default_node_pool_max_count
    min_count              = var.default_node_pool_min_count
    os_disk_type           = var.default_node_pool_os_disk_type
    
    upgrade_settings {
      max_surge       = "25%"
    }
    tags                   = var.tags
  }

  identity {
    type         = "UserAssigned"
    identity_ids = tolist([azurerm_user_assigned_identity.aks_identity.id])
  }

  network_profile {
    dns_service_ip = var.network_dns_service_ip
    network_plugin = var.network_plugin
    outbound_type  = var.outbound_type
    service_cidr   = var.network_service_cidr
  }


  ingress_application_gateway{
      gateway_name = "aks-appgw-${var.environment}"
      subnet_id   = var.gateway_subnet_id
   }

  azure_active_directory_role_based_access_control {
    tenant_id              = var.tenant_id
    admin_group_object_ids = var.admin_group_object_ids
    azure_rbac_enabled     = var.azure_rbac_enabled
  }


  workload_autoscaler_profile {
    keda_enabled                    = var.keda_enabled
    vertical_pod_autoscaler_enabled = var.vertical_pod_autoscaler_enabled
  }

  lifecycle {
    ignore_changes = [
      kubernetes_version,
      tags
    ]
  }

  key_vault_secrets_provider {
      secret_rotation_enabled = var.secret_rotation_enabled
  }
}

resource "azurerm_kubernetes_cluster_node_pool" "nodepool" {
  for_each   =  {for i, node_pool in var.node_pools : i => node_pool}
  name                  = each.value.name
  vm_size               = each.value.vm_size
  min_count             = each.value.min_count
  max_count             = each.value.max_count 
  auto_scaling_enabled   = each.value.enable_auto_scaling
  node_public_ip_enabled = each.value.enable_node_public_ip
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks_cluster.id
  vnet_subnet_id        = var.vnet_subnet_id
  zones                 = each.value.zones
}

resource "azurerm_role_assignment" "network_contributor" {
  scope                = var.rg_id
  role_definition_name = "Network Contributor"
  principal_type       = "ServicePrincipal"
  principal_id         = azurerm_user_assigned_identity.aks_identity.principal_id 
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = var.shared_acr_id
  role_definition_name = "acrpull"
  principal_type       = "ServicePrincipal"
  principal_id         = azurerm_kubernetes_cluster.aks_cluster.kubelet_identity.0.object_id
}

resource "azurerm_private_dns_zone_virtual_network_link" "core_vnet_link" {
  name                  = "aks-vnet-link-to-shared"
  private_dns_zone_name = regex("^[^.]+\\.(.*)$", azurerm_kubernetes_cluster.aks_cluster.private_fqdn)[0]
  resource_group_name   = var.node_resource_group
  virtual_network_id    = var.core_vnet_id
}

resource "azurerm_role_assignment" "aks_agic_integration" {
  scope                = var.env_vnet_id
  role_definition_name = "Network Contributor"
  principal_id         = azurerm_kubernetes_cluster.aks_cluster.ingress_application_gateway[0].ingress_application_gateway_identity[0].object_id
}

resource "azurerm_monitor_diagnostic_setting" "settings" {
  name                       = "DiagnosticsSettings"
  target_resource_id         = azurerm_kubernetes_cluster.aks_cluster.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "kube-apiserver"

  }

  enabled_log {
    category = "kube-audit"

  }
  enabled_log {
    category = "kube-audit-admin"
  }

  enabled_log {
    category = "kube-controller-manager"
  }

  enabled_log {
    category = "kube-scheduler"
  }

  enabled_log {
    category = "cluster-autoscaler"
  }

  enabled_log {
    category = "guard"
  }

  metric {
    category = "AllMetrics"
  }
}
