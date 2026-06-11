/**
 * Aegis Lens — Terraform root module
 *
 * Workspace per env: dev / staging / prod
 *   terraform workspace select prod
 *   terraform apply
 */

terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }

  backend "s3" {
    bucket         = "aegis-lens-tfstate"
    key            = "terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "aegis-lens-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "aegis-lens"
      Environment = terraform.workspace
      ManagedBy   = "terraform"
    }
  }
}

locals {
  env    = terraform.workspace # dev | staging | prod
  prefix = "aegis-${local.env}"
}

# ── Modules ──────────────────────────────────────────────────────────────────

module "network" {
  source = "./modules/network"
  prefix = local.prefix
  env    = local.env
}

module "rds" {
  source             = "./modules/rds"
  prefix             = local.prefix
  env                = local.env
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  multi_az           = local.env == "prod"
  instance_class     = local.env == "prod" ? "db.r7g.xlarge" : "db.t4g.medium"
}

module "eks" {
  source             = "./modules/eks"
  prefix             = local.prefix
  env                = local.env
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
}

module "s3" {
  source = "./modules/s3"
  prefix = local.prefix
  env    = local.env
}

module "kafka" {
  source             = "./modules/kafka"
  prefix             = local.prefix
  env                = local.env
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  # MSK on prod, local Kafka on dev
  use_msk            = local.env == "prod"
}

module "observability" {
  source  = "./modules/observability"
  prefix  = local.prefix
  env     = local.env
}
