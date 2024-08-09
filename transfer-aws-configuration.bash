#!/bin/bash

# Script: AWS Configuration Synchronization
# Purpose: This script synchronizes AWS configuration files from a local machine to a remote server.
#          It allows users to select a host from their SSH config and transfers AWS credentials securely.

# Function: extract_hosts
# Purpose: Extract host names from the user's SSH config file
# Usage: hosts=($(extract_hosts))
extract_hosts() {
    grep -E '^Host ' "$HOME/.ssh/config" | awk '{print $2}'
}

# Function: get_host_details
# Purpose: Retrieve details for a specific host from the SSH config file
# Parameters: $1 - The host name to look up
# Usage: get_host_details "my-host"
get_host_details() {
    # Assign the first argument (hostname) to a local variable 'host'.
    local host=$1

    # 'details' variable holds the configuration details for the given host.
    # The 'awk' script searches for the "Host" line that matches the given host
    # and then captures all subsequent lines until another "Host" entry or a line
    # starting with a letter is encountered.
    local details
    details=$(awk -v host="$host" '
        $1 == "Host" && $2 == host {flag=1; next} # Set flag when the correct host is found
        flag && $1 ~ /^[A-Za-z]/ {flag=0}         # Reset flag when a new entry starts
        flag {print $0}                           # Print details while flag is set
    ' "$HOME/.ssh/config")

    # Extract the 'HostName' field from the details and assign it to REMOTE_HOST.
    REMOTE_HOST=$(echo "$details" | grep 'HostName' | awk '{print $2}')

    # Extract the 'User' field from the details and assign it to REMOTE_USER.
    REMOTE_USER=$(echo "$details" | grep 'User' | awk '{print $2}')

    # Extract the 'IdentityFile' field from the details and assign it to SSH_KEY_PATH.
    SSH_KEY_PATH=$(echo "$details" | grep 'IdentityFile' | awk '{print $2}')

    # Debug statements to verify the extracted values
    echo "REMOTE_HOST: $REMOTE_HOST"
    echo "REMOTE_USER: $REMOTE_USER"
    echo "SSH_KEY_PATH: $SSH_KEY_PATH"
}

# Ensure SSH config file exists
# This ensures that the .ssh directory exists in the user's home directory.
# 'mkdir -p' creates the directory if it doesn't exist, without errors if it does.
mkdir -p "$HOME/.ssh"

# 'touch' creates the SSH config file if it does not exist, or updates its timestamp if it does.
touch "$HOME/.ssh/config"

# Extract hosts from ~/.ssh/config
# Calls the extract_hosts function to retrieve all hostnames from the SSH config file.
# The results are stored in the 'hosts' array.
hosts=($(extract_hosts))

# Check if there are any hosts
# If the 'hosts' array is empty (i.e., no hosts were found), the script exits with an error message.
if [ ${#hosts[@]} -eq 0 ]; then
    echo "No hosts found in ~/.ssh/config."
    exit 1
fi

# Prompt user to select a host
# The script lists all the hosts found and prompts the user to select one by entering the corresponding number.
echo "Select a host from the list:"
for i in "${!hosts[@]}"; do
    echo "$((i+1))) ${hosts[$i]}"
done

# Read the user's input, subtract 1 (to get zero-based index), and use it to select the host.
read -p "Enter the number of the host: " selected_host_index
selected_host=${hosts[$((selected_host_index-1))]}

# Get host details
# Calls the get_host_details function to retrieve the SSH configuration details for the selected host.
get_host_details "$selected_host"

# Set other variables
# 'AWS_CONFIG_DIR' stores the path to the local AWS configuration directory.
AWS_CONFIG_DIR="$HOME/.aws"

# 'REMOTE_AWS_DIR' stores the path to the AWS configuration directory on the remote server.
REMOTE_AWS_DIR="/home/$REMOTE_USER/.aws"

# Set correct permissions for SSH config
# Changes the permissions of the SSH config file to 600 (read/write for the owner only),
# which is a security best practice for SSH configuration files.
chmod 600 "$HOME/.ssh/config"
echo "SSH config updated successfully."

# Check if .aws directory exists locally
# If the local AWS configuration directory does not exist, the script exits with an error message.
if [ ! -d "$AWS_CONFIG_DIR" ]; then
    echo "Error: $AWS_CONFIG_DIR does not exist."
    exit 1
fi

# Create .aws directory on remote server if it doesn't exist
# Uses SSH to connect to the remote server (using the alias 'amplify-development-server')
# and creates the AWS configuration directory if it doesn't already exist.
ssh "$selected_host" "mkdir -p $REMOTE_AWS_DIR"

# Sync .aws directory to remote server using rsync
echo "Syncing AWS configuration files..."
# Uses 'rsync' to synchronize the local AWS configuration directory with the remote one.
# The '-avz' options stand for archive mode, verbose output, and compression during transfer.
# The '--delete' option ensures that any files not present locally are deleted from the remote directory.
# '-e ssh' specifies that SSH should be used for the connection.
rsync -avz --delete --progress -e ssh "$AWS_CONFIG_DIR/" "$selected_host:$REMOTE_AWS_DIR"

# Final message to indicate success
# Once the transfer is complete, the script outputs a success message.
echo "AWS configuration files transferred successfully."

# Offer to open an SSH session to the remote server
prompt_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

if prompt_yes_no "Would you like to open an SSH session to the remote server?"; then
    ssh "$selected_host"
else
    echo "Script completed. You can connect to the remote server using 'ssh ${selected_host}'"
fi