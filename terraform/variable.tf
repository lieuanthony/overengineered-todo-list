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