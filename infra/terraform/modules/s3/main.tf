/**
 * S3 module — media storage + tile cache + backups.
 */

variable "prefix" { type = string }
variable "env"    { type = string }

# ── Media bucket (images, videos) ────────────────────────────────────────────

resource "aws_s3_bucket" "media" {
  bucket = "${var.prefix}-media"
  tags   = { Name = "${var.prefix}-media", Purpose = "event-media" }
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}

# Cross-region replication for prod DR
resource "aws_s3_bucket_replication_configuration" "media" {
  count  = var.env == "prod" ? 1 : 0
  bucket = aws_s3_bucket.media.id
  role   = aws_iam_role.replication[0].arn

  rule {
    id     = "replicate-all"
    status = "Enabled"
    destination {
      bucket        = "arn:aws:s3:::${var.prefix}-media-dr"
      storage_class = "STANDARD_IA"
    }
  }
}

# ── Tile cache bucket ─────────────────────────────────────────────────────────

resource "aws_s3_bucket" "tiles" {
  bucket = "${var.prefix}-tiles"
  tags   = { Name = "${var.prefix}-tiles", Purpose = "map-tile-cache" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tiles" {
  bucket = aws_s3_bucket.tiles.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

# ── Terraform state bucket (bootstrap — managed separately) ──────────────────

# Note: aegis-lens-tfstate bucket must be created before running terraform init.
# Use: aws s3 mb s3://aegis-lens-tfstate --region eu-central-1

# ── IAM role for replication ─────────────────────────────────────────────────

resource "aws_iam_role" "replication" {
  count = var.env == "prod" ? 1 : 0
  name  = "${var.prefix}-s3-replication"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "s3.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

output "media_bucket"    { value = aws_s3_bucket.media.id }
output "media_bucket_arn" { value = aws_s3_bucket.media.arn }
output "tiles_bucket"    { value = aws_s3_bucket.tiles.id }
