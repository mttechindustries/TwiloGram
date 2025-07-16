#!/bin/bash

# Function to print colored messages
print_green() {
  echo -e "\033[0;32m$1\033[0m"
}

print_yellow() {
  echo -e "\033[0;33m$1\033[0m"
}

print_red() {
  echo -e "\033[0;31m$1\033[0m"
}

# Check for Node.js and npm
check_prerequisites() {
  print_green "--- Checking for prerequisites ---"
  if ! command -v node &> /dev/null; then
    print_red "Node.js is not installed. Please install Node.js before running the setup."
    exit 1
  fi
  if ! command -v npm &> /dev/null; then
    print_red "npm is not installed. Please install npm before running the setup."
    exit 1
  fi
  print_green "  > Node.js and npm found."
}

# Clone the repository
clone_repository() {
  print_green "--- Cloning the TwiloGram repository ---"
  if [ -d "twilogram" ]; then
    print_yellow "  > TwiloGram directory already exists. Skipping cloning."
  else
    git clone https://github.com/yourusername/twilogram.git
    cd twilogram || exit 1
    print_green "  > Repository cloned successfully."
  fi
}

# Install dependencies
install_dependencies() {
  print_green "--- Installing project dependencies ---"
  npm install
  print_green "  > Dependencies installed successfully."
}

# Create .env file
create_env_file() {
  print_green "--- Setting up environment variables ---"
  env_path=".env"
  if [ -f "$env_path" ]; then
    print_yellow "  > .env file already exists. Skipping creation."
  else
    print_yellow "  > Please provide your API credentials."
    read -p "  Enter your Twilio Account SID: " twilio_account_sid
    read -p "  Enter your Twilio Auth Token: " twilio_auth_token
    read -p "  Enter your Deepgram API Key: " deepgram_api_key
    read -p "  Enter the port for the server (default 8080): " port
    port=${port:-8080}

    if [ -z "$twilio_account_sid" ] || [ -z "$twilio_auth_token" ] || [ -z "$deepgram_api_key" ]; then
      print_red "Missing required values. Please provide all credentials."
      exit 1
    fi

    echo "TWILIO_ACCOUNT_SID=$twilio_account_sid" > "$env_path"
    echo "TWILIO_AUTH_TOKEN=$twilio_auth_token" >> "$env_path"
    echo "DEEPGRAM_API_KEY=$deepgram_api_key" >> "$env_path"
    echo "PORT=$port" >> "$env_path"
    print_green "  > .env file created successfully."
  fi
}

# Provide final instructions
final_instructions() {
  print_green "--- Setup Complete ---"
  print_green "Your project is set up! To run it, follow these steps:"

  print_yellow "1. Start a tunnel to expose your local server to the internet."
  print_yellow "   We recommend ngrok:"
  print_yellow "   ngrok http $port"
  print_yellow "   Copy the HTTPS URL provided by ngrok (e.g., https://1234abcd.ngrok.io)."

  print_yellow "2. Configure your Twilio Phone Number:"
  print_yellow "   - Log in to your Twilio Console."
  print_yellow "   - Go to Phone Numbers > Manage > Active Numbers and select your number."
  print_yellow "   - Scroll to \"Voice & Fax\". For \"A CALL COMES IN\", select \"Webhook\"."
  print_yellow "   - Paste your ngrok URL with the /voice path into the text box."
  print_yellow "     Example: https://1234abcd.ngrok.io/voice"
  print_yellow "   - Ensure the method is set to \"HTTP POST\" and save."

  print_yellow "3. Configure Google Voice:"
  print_yellow "   - In Google Voice, go to Settings > Calls > Call forwarding."
  print_yellow "   - Add your Twilio phone number as a forwarding number."

  print_green "You can now start the server by running:"
  print_yellow "  npm run dev"
}

# Main script execution
check_prerequisites
clone_repository
install_dependencies
create_env_file
final_instructions