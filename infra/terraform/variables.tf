variable "aws_region" {
  type        = string
  description = "Primary AWS region"
  default     = "eu-central-1"
}

variable "hetzner_region" {
  type        = string
  description = "Hetzner region for batch / cold storage nodes"
  default     = "nbg1"
}

variable "eks_node_min" {
  type        = number
  description = "Minimum EKS node count"
  default     = 2
}

variable "eks_node_max" {
  type        = number
  description = "Maximum EKS node count"
  default     = 20
}

variable "eks_node_desired" {
  type        = number
  description = "Desired EKS node count"
  default     = 3
}

variable "rds_storage_gb" {
  type        = number
  description = "Allocated storage for RDS in GB"
  default     = 100
}

variable "alerts_email" {
  type        = string
  description = "Email for infrastructure alerts"
  sensitive   = true
}
