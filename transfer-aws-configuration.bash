#!/bin/bash

# Prompt for remote host
read -p "Enter your EC2 instance public DNS or IP: " REMOTE_HOST

# Prompt for SSH key file
read -p "Enter the path to your private key file (default: ~/.ssh/id_rsa): " SSH_KEY_PATH
SSH_KEY_PATH=${SSH_KEY_PATH:-~/.ssh/id_rsa}

# Set other variables
REMOTE_USER="ubuntu"
AWS_CONFIG_DIR="$HOME/.aws"
REMOTE_AWS_DIR="/home/$REMOTE_USER/.aws"

# Ensure SSH config file exists
mkdir -p "$HOME/.ssh"
touch "$HOME/.ssh/config"

# Add or update SSH config
if ! grep -q "Host amplify-development-server" "$HOME/.ssh/config"; then
    cat << EOF >> "$HOME/.ssh/config"
Host amplify-development-server
    HostName $REMOTE_HOST
    User $REMOTE_USER
    IdentityFile $SSH_KEY_PATH
EOF
fi

# Set correct permissions for SSH config
chmod 600 "$HOME/.ssh/config"

# Check if .aws directory exists locally
if [ ! -d "$AWS_CONFIG_DIR" ]; then
    echo "Error: $AWS_CONFIG_DIR does not exist."
    exit 1
fi

# Create .aws directory on remote server if it doesn't exist
ssh amplify-development-server "mkdir -p $REMOTE_AWS_DIR"

# Sync .aws directory to remote server
rsync -avz --delete -e ssh "$AWS_CONFIG_DIR/" "amplify-development-server:$REMOTE_AWS_DIR"

echo "AWS configuration files transferred successfully."
