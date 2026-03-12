resource "aws_secretsmanager_secret" "db" {
  name                    = "${var.project}/db-credentials-v2"
  recovery_window_in_days = 0

  tags = { Name = "${var.project}-db-credentials" }
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id

  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = aws_rds_cluster.aurora.endpoint
    port     = 5432
    dbname   = "todos"
    url      = "postgresql://${var.db_username}:${var.db_password}@${aws_rds_cluster.aurora.endpoint}:5432/todos"
  })
}


resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project}/jwt-secrets-v2"
  recovery_window_in_days = 0

  tags = { Name = "${var.project}-jwt-secrets" }
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id

  secret_string = jsonencode({
    JWT_SECRET         = var.jwt_secret
    JWT_REFRESH_SECRET = var.jwt_refresh_secret
  })
}


resource "aws_iam_policy" "secrets_read" {
  name        = "${var.project}-secrets-read"
  description = "Allow reading app secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db.arn,
          aws_secretsmanager_secret.jwt.arn,
        ]
      }
    ]
  })
}


data "aws_iam_policy_document" "backend_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:default:backend"]
    }
  }
}

resource "aws_iam_role" "backend_sa" {
  name               = "${var.project}-backend-sa-role"
  assume_role_policy = data.aws_iam_policy_document.backend_assume.json
}

resource "aws_iam_role_policy_attachment" "backend_secrets" {
  role       = aws_iam_role.backend_sa.name
  policy_arn = aws_iam_policy.secrets_read.arn
}

output "backend_sa_role_arn" {
  value = aws_iam_role.backend_sa.arn
}