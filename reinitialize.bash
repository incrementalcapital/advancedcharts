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

# Function to initialize or reinitialize Amplify project
initialize_amplify_project() {
    log "Checking for existing Amplify project..."
    if [ -d "amplify" ]; then
        log "Existing Amplify project found. Reinitializing..."
        amplify init --app $AWS_AMPLIFY_APP_ID || { log_error "Amplify reinitialization failed"; exit 1; }
    else
        log "No existing Amplify project found. Initializing new project..."
        amplify init --app $AWS_AMPLIFY_APP_ID || { log_error "Amplify initialization failed"; exit 1; }
    fi
}

# Function to initialize Amplify in the React app
initialize_amplify() {
    log "Initializing Amplify in the React app..."
    
    # Initialize Amplify
    amplify init --appId "$AWS_AMPLIFY_APP_ID" --envName "$AWS_BRANCH" || { log_error "Amplify init failed"; exit 1; }
    
    # Add Amplify configuration to index.tsx
    sed -i '1iimport { Amplify } from '"'"'aws-amplify'"'"';' src/index.tsx
    sed -i '2iimport awsExports from '"'"'./aws-exports'"'"';' src/index.tsx
    sed -i '3iAmplify.configure(awsExports);' src/index.tsx
    
    log "Amplify initialized successfully in the React app."
}

# Function to install and validate project dependencies
install_and_validate_dependencies() {
    log "Cleaning npm cache..."
    npm cache clean --force

    log "Removing existing node_modules and package-lock.json..."
    rm -rf node_modules package-lock.json

    log "Installing project dependencies..."
    npm install || { log_error "Failed to install project dependencies"; exit 1; }

    log "Installing AWS Amplify libraries..."
    npm install aws-amplify @aws-amplify/ui-react || { log_error "Failed to install AWS Amplify libraries"; exit 1; }

    log "Checking for outdated packages..."
    npm outdated

    log "Building the project..."
    npm run build || { log_error "Failed to build the project"; exit 1; }
    
    log "Installing serve globally..."
    npm install -g serve || { log_error "Failed to install serve globally"; exit 1; }
}

# Function to configure Amplify in the main React file
configure_amplify_in_react() {
    local main_file=""
    if [ -f "src/index.ts" ]; then
        main_file="src/index.ts"
    elif [ -f "src/index.tsx" ]; then
        main_file="src/index.tsx"
    elif [ -f "src/App.tsx" ]; then
        main_file="src/App.tsx"
    else
        log_error "Could not find src/index.ts, src/index.tsx, or src/App.tsx"
        return 1
    fi

    log "Configuring Amplify in $main_file..."

    # Check if Amplify is already imported and configured
    if grep -q "import { Amplify } from 'aws-amplify';" "$main_file" && \
       grep -q "import awsconfig from './aws-exports';" "$main_file" && \
       grep -q "Amplify.configure(awsconfig);" "$main_file"; then
        log "Amplify is already configured in $main_file"
        return 0
    fi

    # Add Amplify import and configuration
    awk '
    FNR==1 {print "import { Amplify } from '\''aws-amplify'\'';"; print "import awsconfig from '\''./aws-exports'\'';"; print ""}
    {print}
    END {print "\nAmplify.configure(awsconfig);"}
    ' "$main_file" > "${main_file}.tmp" && mv "${main_file}.tmp" "$main_file"

    log "Amplify configuration added to $main_file"
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

    # Initialize or reinitialize Amplify project
    initialize_amplify_project

    # Install and validate project dependencies
    install_and_validate_dependencies

    # Configure AWS CLI
    configure_aws_cli

    # Configure Amplify CLI
    configure_amplify_cli

    # Configure Amplify in the main React file
    configure_amplify_in_react || { log_error "Failed to configure Amplify in React file"; exit 1; }

    log "Setup completed successfully!"
    log "TypeScript Amplifier setup completed successfully!"    log "Setup completed successfully!"
    log "To ensure all changes take effect, please do one of the following:"
    log "1. Log out and log back in, or"
    log "2. Run the following command: source ~/.bashrc"
    log "After that, you can run 'npm start' to start the development server."
    log "If you encounter any issues, try serving the built version with: npx serve -s build"
    log "Your AWS Amplify Gen 2 project with React and TypeScript is now ready."
    log "Next steps:"
    log "1. Review the project structure and configurations in the 'amplify' directory."
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