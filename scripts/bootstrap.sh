#!/bin/bash

set -e

echo "Bootstrapping GitHub Actions OIDC role..."

cd terraform

terraform init

terraform apply \
  -target=aws_iam_openid_connect_provider.github \
  -target=aws_iam_role.github_actions \
  -target=aws_iam_role_policy.github_actions \
  -auto-approve

echo ""
echo "Done. Add the following to your GitHub secrets as AWS_IAM_ROLE_ARN:"
terraform output github_actions_role_arn