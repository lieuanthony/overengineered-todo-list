#!/bin/bash

set -e

ROLE_NAME="overengineered-todo-list-github-actions-role"
POLICY_NAME="overengineered-todo-list-github-actions-policy"
GITHUB_ORG="${1:?Usage: ./bootstrap.sh <github-org> <github-repo>}"
GITHUB_REPO="${2:?Usage: ./bootstrap.sh <github-org> <github-repo>}"

echo "Bootstrapping GitHub Actions OIDC..."

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

# Create GitHub OIDC provider if it doesn't already exist
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" &>/dev/null; then
  echo "OIDC provider already exists, skipping..."
else
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
  echo "Created OIDC provider"
fi

echo "OIDC ARN: $OIDC_ARN"

ASSUME_ROLE_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "$OIDC_ARN" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:$GITHUB_ORG/$GITHUB_REPO:*"
        }
      }
    }
  ]
}
EOF
)

ROLE_ARN=$(aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document "$ASSUME_ROLE_POLICY" \
  --query Role.Arn \
  --output text)

echo "Created role: $ROLE_ARN"

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document file://scripts/iam-policy.json

echo ""
echo "Done. Add the following to your GitHub secrets as AWS_IAM_ROLE_ARN:"
echo "$ROLE_ARN"