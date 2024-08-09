#!/bin/bash

# TypeScript Amplifier: AWS Amplify Gen 2 Project Setup Script
# Version: 1.2
# Author: Incremental Capitalist
# Date: Friday, August 9th, 2024
#
# This script automates the setup process for an existing AWS Amplify Gen 2 project with React and TypeScript.
# It handles system updates, installation of necessary tools, and "re-initialization" of a existing Amplify project.
#
# Prerequisites:
# - An AWS account with sufficient permissions to create and manage Amplify projects
# - An existing Amplify app created in the AWS Console (you'll need the App ID)

# Enable strict mode:
# -e: Exit immediately if a command exits with a non-zero status.
# -u: Treat unset variables as an error when substituting.
# -o pipefail: The return value of a pipeline is the status of the last command
#              to exit with a non-zero status, or zero if no command exited with a non-zero status.
set -euo pipefail

# Function to log messages with timestamps
# Parameters:
#   $1: The message to log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to log error messages
# Parameters:
#   $1: The error message to log
log_error() {
    log "ERROR: $1" >&2
}

# Function to check if a command is available
# Parameters:
#   $1: The command to check
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Command '$1' could not be found. Please install it and try again."
        exit 1
    fi
}

# Function to install a package if it's not already installed
# Parameters:
#   $1: The name of the package to install
install_package() {
    if ! dpkg -s "$1" &> /dev/null; then
        log "Installing $1..."
        sudo apt install -y "$1" || { log_error "Failed to install $1"; exit 1; }
    else
        log "$1 is already installed."
    fi
}

# Function to configure AWS CLI
# This function reads AWS credentials from ~/.aws/credentials and prompts for region and profile
configure_aws_cli() {
    log "Configuring AWS CLI..."
    
    # Check if ~/.aws/credentials exists
    if [ ! -f ~/.aws/credentials ]; then
        log_error "AWS credentials file not found at ~/.aws/credentials"
        echo "Please set up your AWS credentials first. You can do this by running 'aws configure'."
        exit 1
    fi
    
    # Read AWS credentials
    AWS_ACCESS_KEY_ID=$(awk -F ' = ' '/aws_access_key_id/ {print $2}' ~/.aws/credentials)
    AWS_SECRET_ACCESS_KEY=$(awk -F ' = ' '/aws_secret_access_key/ {print $2}' ~/.aws/credentials)
    
    # Check if credentials were successfully read
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        log_error "Failed to read AWS credentials from ~/.aws/credentials"
        echo "Please ensure your credentials are properly set in the file."
        exit 1
    fi
    
    # Export environment variables
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
    
    # Prompt for AWS region and profile
    read -p "Enter your AWS region: " AWS_DEFAULT_REGION
    read -p "Enter your AWS profile name: " AWS_PROFILE
    
    export AWS_DEFAULT_REGION
    export AWS_PROFILE
}

# Function to install NVM and Node.js
install_node_and_nvm() {
    if [ ! -d "$HOME/.nvm" ]; then
        log "Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash || { log_error "NVM installation failed"; exit 1; }
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        log "Installing Node.js using NVM..."
        nvm install node || { log_error "Node.js installation failed"; exit 1; }
        nvm use node
    else
        log "NVM is already installed."
        # Ensure NVM is loaded
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        # Check if Node.js is installed, if not install it
        if ! command -v node &> /dev/null; then
            log "Installing Node.js using NVM..."
            nvm install node || { log_error "Node.js installation failed"; exit 1; }
            nvm use node
        else
            log "Node.js is already installed."
        fi
    fi
}

# Function to install Amplify CLI
install_amplify_cli() {
    log "Installing Amplify CLI..."
    npm install -g @aws-amplify/cli || { log_error "Amplify CLI installation failed"; exit 1; }
}

# Function to configure Amplify CLI in headless mode
configure_amplify_cli() {
    log "Configuring Amplify CLI..."
    amplify configure --headless <<EOF
${AWS_ACCESS_KEY_ID}
${AWS_SECRET_ACCESS_KEY}
${AWS_DEFAULT_REGION}
javascript
${AWS_PROFILE}
EOF
    log "Note: You may see a message 'Headless mode is not implemented for @aws-amplify/cli-internal'. This can be ignored if the script continues to run successfully."
}

# Main function that orchestrates the entire setup process
main() {
    log "Starting TypeScript Amplifier setup..."

    # Prompt for project details
    read -p "Enter the AWS Amplify project name: " project_name
    read -p "Enter the AWS Amplify App ID (find this in the AWS Amplify console): " AWS_AMPLIFY_APP_ID
    read -p "Enter the AWS Amplify branch name (e.g., 'main' or 'develop'): " AWS_BRANCH

    # Update and upgrade the system
    log "Updating system..."
    sudo apt update && sudo apt full-upgrade -y || { log_error "System update failed"; exit 1; }

    # Install necessary packages
    install_package unzip
    install_package curl

    # Install AWS CLI if not already installed
    if ! command -v aws &> /dev/null; then
        log "Installing AWS CLI..."
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" || { log_error "AWS CLI download failed"; exit 1; }
        unzip awscliv2.zip || { log_error "AWS CLI unzip failed"; exit 1; }
        sudo ./aws/install || { log_error "AWS CLI installation failed"; exit 1; }
        rm awscliv2.zip
        rm -rf aws
    else
        log "AWS CLI is already installed."
    fi

    # Install NVM and Node.js
    install_node_and_nvm

    # Install Amplify CLI
    install_amplify_cli

    # Verify all required tools are installed
    log "Verifying installations..."
    check_command node
    check_command npm
    check_command aws
    check_command amplify

    # Install project dependencies
    log "Installing project dependencies..."
    npm install || { log_error "Failed to install project dependencies"; exit 1; }

    # Configure AWS CLI
    configure_aws_cli

    # Configure Amplify CLI
    configure_amplify_cli

    log "TypeScript Amplifier setup completed successfully!"
    log "Your AWS Amplify Gen 2 project with React and TypeScript is now ready."
    log "Next steps:"
    log "1. Review the project structure and configurations."
    log "2. Add your custom components and logic to the React app."
    log "3. Use 'amplify add' commands to add new features (e.g., 'amplify add api' for GraphQL API)."
    log "4. Deploy your app using 'amplify push' when ready."
    log "5. Start the development server with 'npm start' to see your app in action."
    log "For more information, visit the Amplify documentation: https://docs.amplify.aws/"
}

# Run the main function
main

# Note: This script sets up an existing Gen 2 AWS Amplify project with React and TypeScript.
# It's designed for users who want to leverage the latest Amplify features in a TypeScript environment.
# Make sure to have an existing Amplify app in the AWS console before running this script.
# For any issues or improvements, please submit an issue or pull request to the typescript-amplifier repository.