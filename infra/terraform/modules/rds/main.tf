/**
 * RDS module — PostgreSQL 16 with PostGIS + TimescaleDB support.
 * Multi-AZ on prod, single AZ on dev/staging.
 */

variable "prefix"             { type = string }
variable "env"                { type = string }
variable "vpc_id"             { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "multi_az"           { type = bool; default = false }
variable "instance_class"     { type = string; default = "db.t4g.medium" }

resource "aws_db_subnet_group" "main" {
  name       = "${var.prefix}-db-subnet"
  subnet_ids = var.private_subnet_ids
  tags       = { Name = "${var.prefix}-db-subnet" }
}

resource "aws_security_group" "rds" {
  name   = "${var.prefix}-rds-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # VPC only
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.prefix}-rds-sg" }
}

resource "aws_db_parameter_group" "postgres16" {
  name   = "${var.prefix}-postgres16"
  family = "postgres16"

  # TimescaleDB
  parameter {
    name  = "shared_preload_libraries"
    value = "timescaledb,pg_stat_statements"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # log queries >1s
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }

  parameter {
    name  = "work_mem"
    value = "65536" # 64MB
  }

  parameter {
    name  = "maintenance_work_mem"
    value = "524288" # 512MB
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.prefix}-postgres"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.instance_class

  allocated_storage     = 100
  max_allocated_storage = 1000 # autoscaling up to 1TB
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "aegis"
  username = "aegis_admin"
  # Password from Secrets Manager
  manage_master_user_password = true

  parameter_group_name   = aws_db_parameter_group.postgres16.name
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = var.multi_az
  publicly_accessible    = false
  deletion_protection    = var.env == "prod"
  backup_retention_period = var.env == "prod" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # TimescaleDB custom parameter group above handles extensions
  # PostGIS + TimescaleDB must be installed after provision via SQL

  tags = { Name = "${var.prefix}-postgres" }
}

# Read replica (prod only)
resource "aws_db_instance" "replica" {
  count = var.env == "prod" ? 1 : 0

  identifier          = "${var.prefix}-postgres-replica"
  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = var.instance_class
  publicly_accessible = false
  storage_encrypted   = true

  tags = { Name = "${var.prefix}-postgres-replica" }
}

output "db_endpoint"      { value = aws_db_instance.main.endpoint }
output "db_name"          { value = aws_db_instance.main.db_name }
output "db_secret_arn"    { value = aws_db_instance.main.master_user_secret[0].secret_arn }
output "replica_endpoint" { value = length(aws_db_instance.replica) > 0 ? aws_db_instance.replica[0].endpoint : null }
