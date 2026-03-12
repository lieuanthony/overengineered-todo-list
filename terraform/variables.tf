variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name used for tagging and naming resources"
  type        = string
  default     = "overengineered-todo-list"
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS worker nodes"
  type        = string
  default     = "t3.small"
}

variable "db_username" {
  description = "Aurora master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Aurora master password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token signing secret"
  type        = string
  sensitive   = true
}