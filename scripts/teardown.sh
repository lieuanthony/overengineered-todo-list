#!/bin/bash

set -e

ROLE_NAME="overengineered-todo-list-github-actions-role"
POLICY_NAME="overengineered-todo-list-github-actions-policy"

echo "Tearing down GitHub Actions OIDC bootstrap..."

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

# Delete inline policy
if aws iam get-role-policy --role-name "$ROLE_NAME" --policy-name "$POLICY_NAME" &>/dev/null; then
  aws iam delete-role-policy --role-name "$ROLE_NAME" --policy-name "$POLICY_NAME"
  echo "Deleted role policy"
else
  echo "Role policy not found, skipping..."
fi

# Delete role
if aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
  aws iam delete-role --role-name "$ROLE_NAME"
  echo "Deleted role"
else
  echo "Role not found, skipping..."
fi

# Delete OIDC provider
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" &>/dev/null; then
  aws iam delete-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN"
  echo "Deleted OIDC provider"
else
  echo "OIDC provider not found, skipping..."
fi

echo ""
echo "Done."