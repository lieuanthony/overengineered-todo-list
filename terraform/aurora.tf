resource "aws_security_group" "aurora" {
  name        = "${var.project}-aurora-sg"
  description = "Allow Postgres access from EKS nodes"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-aurora-sg" }
}


resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project}-aurora-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "${var.project}-aurora-subnet-group" }
}


resource "aws_rds_cluster" "aurora" {
  cluster_identifier        = "${var.project}-aurora"
  engine                    = "aurora-postgresql"
  engine_mode               = "provisioned"
  engine_version            = "16.4"
  database_name             = "todos"
  master_username           = var.db_username
  master_password           = var.db_password
  db_subnet_group_name      = aws_db_subnet_group.aurora.name
  vpc_security_group_ids    = [aws_security_group.aurora.id]
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project}-aurora-final-snapshot"
  storage_encrypted         = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 4
  }

  tags = { Name = "${var.project}-aurora" }
}

resource "aws_rds_cluster_instance" "aurora" {
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version

  tags = { Name = "${var.project}-aurora-instance" }
}


output "aurora_endpoint" {
  value = aws_rds_cluster.aurora.endpoint
}