output "name" {
  value       = azurerm_kubernetes_cluster.aks_cluster.name
  description = "Specifies the name of the AKS cluster."
}

output "username" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_admin_config.0.username
  description = "Contains the Kubernetes config to be used by kubectl and other compatible tools."
}

output "password" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_admin_config.0.password
  description = "Contains the Kubernetes config to be used by kubectl and other compatible tools."
}

output "client_certificate" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_admin_config.0.client_certificate
  description = "Contains the Kubernetes config to be used by kubectl and other compatible tools."
}

output "client_key" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_admin_config.0.client_key
  description = "Contains the Kubernetes config to be used by kubectl and other compatible tools."
}

output "cluster_ca_certificate" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_admin_config.0.cluster_ca_certificate
  description = "Contains the Kubernetes config to be used by kubectl and other compatible tools."
}


output "id" {
  value       = azurerm_kubernetes_cluster.aks_cluster.id
  description = "Specifies the resource id of the AKS cluster."
}


output "aks_identity_principal_id" {
  value       = azurerm_user_assigned_identity.aks_identity.principal_id
  description = "Specifies the principal id of the managed identity of the AKS cluster."
}

output "kubelet_identity_object_id" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kubelet_identity.0.object_id
  description = "Specifies the object id of the kubelet identity of the AKS cluster."
}

output "kube_config_raw" {
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_config_raw
  description = "Contains the Kubernetes config to be used by kubectl and other compatible tools."
}

output "private_fqdn" {
  value       = azurerm_kubernetes_cluster.aks_cluster.private_fqdn
  description = "The FQDN for the Kubernetes Cluster when private link has been enabled, which is only resolvable inside the Virtual Network used by the Kubernetes Cluster."
}

output "node_resource_group" {
  value       = azurerm_kubernetes_cluster.aks_cluster.node_resource_group
  description = "Specifies the resource id of the auto-generated Resource Group which contains the resources for this Managed Kubernetes Cluster."
}

output "host" {
  description = "The host URL of the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks_cluster.kube_config.0.host
}

output "user_assigned_identity_principal_id" {
  value = azurerm_user_assigned_identity.aks_identity.principal_id
}