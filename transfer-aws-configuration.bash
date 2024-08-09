#!/bin/bash

# Function to extract hosts from ~/.ssh/config
# This function uses 'grep' to find all lines starting with 'Host ' in the SSH config file.
# It then uses 'awk' to print the second field (which is the hostname).
extract_hosts() {
    grep -E '^Host ' "$HOME/.ssh/config" | awk '{print $2}'
}

# Function to get host details from ~/.ssh/config
# This function takes a hostname as an argument and retrieves all configuration details
# for that host from the SSH config file.
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

# Check if .aws directory exists locally
# If the local AWS configuration directory does not exist, the script exits with an error message.
if [ ! -d "$AWS_CONFIG_DIR" ]; then
    echo "Error: $AWS_CONFIG_DIR does not exist."
    exit 1
fi

# Create .aws directory on remote server if it doesn't exist
# Uses SSH to connect to the remote server (using the alias 'amplify-development-server')
# and creates the AWS configuration directory if it doesn't already exist.
ssh amplify-development-server "mkdir -p $REMOTE_AWS_DIR"

# Sync .aws directory to remote server
# Uses 'rsync' to synchronize the local AWS configuration directory with the remote one.
# The '-avz' options stand for archive mode, verbose output, and compression during transfer.
# The '--delete' option ensures that any files not present locally are deleted from the remote directory.
# '-e ssh' specifies that SSH should be used for the connection.
rsync -avz --delete -e ssh "$AWS_CONFIG_DIR/" "amplify-development-server:$REMOTE_AWS_DIR"

# Final message to indicate success
# Once the transfer is complete, the script outputs a success message.
echo "AWS configuration files transferred successfully."
