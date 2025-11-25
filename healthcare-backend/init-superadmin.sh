#!/bin/bash

# ============================================
# 🔐 Healthcare System - Super Admin Setup
# ============================================
# Initialize super admin account on first run

set -e

echo "========================================="
echo "🔐 Super Admin Initialization"
echo "========================================="

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
    if nc -z mongodb 27017 2>/dev/null; then
        echo "✓ MongoDB is ready"
        break
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

# Create super admin account
echo ""
echo "📝 Creating super admin account..."

SUPER_ADMIN_EMAIL=${SUPER_ADMIN_EMAIL:-admin@healthcare.com}
SUPER_ADMIN_PASSWORD=${SUPER_ADMIN_PASSWORD:-@Admin123}
SUPER_ADMIN_NAME=${SUPER_ADMIN_NAME:-System Administrator}

echo "  Email: $SUPER_ADMIN_EMAIL"
echo "  Name: $SUPER_ADMIN_NAME"

# Use the superAdminCli script to create the account
node ./src/scripts/superAdminCli.js create-super-admin \
    --email "$SUPER_ADMIN_EMAIL" \
    --password "$SUPER_ADMIN_PASSWORD" \
    --name "$SUPER_ADMIN_NAME" \
    2>/dev/null || true

echo ""
echo "✓ Setup complete!"
echo ""
echo "You can now log in with:"
echo "  Email: $SUPER_ADMIN_EMAIL"
echo "  Password: $SUPER_ADMIN_PASSWORD"
echo ""
