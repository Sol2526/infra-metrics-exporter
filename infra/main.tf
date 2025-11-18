terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# The ECS Cluster
resource "aws_ecs_cluster" "this" {
  name = "infra-metrics-exporter-cluster"
}

// This code tells terraform to use aws provider. uses a region.. and creates an ECS cluster 
