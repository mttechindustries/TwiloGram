const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec, execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const
  red = "\x1b[31m",
  green = "\x1b[32m",
  yellow = "\x1b[33m",
  reset = "\x1b[0m";

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${yellow}${question}${reset}`, resolve);
  });
}

function validateEnvVariables(envVars) {
  const missing = [];
  for (const [key, value] of Object.entries(envVars)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required values for: ${missing.join(', ')}`);
  }
}

async function setup() {
  try {
    console.log(`${green}--- Starting Automated Setup for TwiloGram ---${reset}`);

    // Step 1: Check for Node.js and npm
    console.log('\n[Step 1/4] Checking for prerequisites...');
    try {
      execSync('node -v');
      execSync('npm -v');
      console.log('  > Node.js and npm found.');
    } catch (e) {
      console.error(`${red}Error: Node.js and npm are required. Please install them before running the setup.${reset}`);
      process.exit(1);
    }

    // Step 2: Install Dependencies
    console.log('\n[Step 2/4] Installing project dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log(`${green}  > Dependencies installed successfully.${reset}`);

    // Step 3: Setup Environment Variables
    console.log('\n[Step 3/4] Setting up environment variables...');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log(`${yellow}  > .env file already exists. Skipping creation.${reset}`);
    } else {
      console.log('  > Please provide your API credentials.');
      const twilioAccountSid = await prompt('  Enter your Twilio Account SID: ');
      const twilioAuthToken = await prompt('  Enter your Twilio Auth Token: ');
      const deepgramApiKey = await prompt('  Enter your Deepgram API Key: ');
      const port = await prompt('  Enter the port for the server (default 8080): ') || '8080';

      const envVars = { twilioAccountSid, twilioAuthToken, deepgramApiKey, port };
      validateEnvVariables(envVars);

      const envContent = `TWILIO_ACCOUNT_SID=${twilioAccountSid}\nTWILIO_AUTH_TOKEN=${twilioAuthToken}\nDEEPGRAM_API_KEY=${deepgramApiKey}\nPORT=${port}`;
      fs.writeFileSync(envPath, envContent);
      console.log(`${green}  > .env file created successfully.${reset}`);
    }

    // Step 4: Final Instructions
    console.log(`\n${green}[Step 4/4] Configuration Instructions:${reset}`);
    console.log('Your project is set up! To run it, follow these steps:');
    console.log('\n1. Start a tunnel to expose your local server to the internet.');
    console.log('   We recommend ngrok:');
    console.log(`   ${yellow}ngrok http \${process.env.PORT || 8080}${reset}`);
    console.log('   Copy the HTTPS URL provided by ngrok (e.g., https://1234abcd.ngrok.io).');

    console.log('\n2. Configure your Twilio Phone Number:');
    console.log('   - Log in to your Twilio Console.');
    console.log('   - Go to Phone Numbers > Manage > Active Numbers and select your number.');
    console.log('   - Scroll to "Voice & Fax". For "A CALL COMES IN", select "Webhook".');
    console.log(`   - Paste your ngrok URL with the /voice path into the text box.`);
    console.log(`     Example: ${yellow}https://1234abcd.ngrok.io/voice${reset}`);
    console.log('   - Ensure the method is set to "HTTP POST" and save.');

    console.log('\n3. Configure Google Voice Forwarding:');
    console.log('   - In Google Voice, go to Settings > Calls > Call forwarding.');
    console.log('   - Add your Twilio phone number as a forwarding number.');

    console.log(`\n${green}--- Setup Complete ---${reset}`);
    console.log('You can now start the server by running:');
    console.log(`  ${yellow}npm run dev${reset}`);

  } catch (error) {
    console.error(`\n${red}An error occurred during setup: ${error.message}${reset}`);
  } finally {
    rl.close();
  }
}

setup();