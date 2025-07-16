const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setup() {
  try {
    console.log('Starting automated setup for TwiloGram project...');

    // Step 1: Install Dependencies
    console.log('Installing dependencies...');
    execSync('npm install express twilio @deepgram/sdk dotenv websocket', { stdio: 'inherit' });

    // Step 2: Setup Environment Variables
    console.log('Setting up environment variables...');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('.env file already exists. Skipping creation.');
    } else {
      const twilioAccountSid = await prompt('Enter your Twilio Account SID: ');
      const twilioAuthToken = await prompt('Enter your Twilio Auth Token: ');
      const deepgramApiKey = await prompt('Enter your Deepgram API Key: ');
      const publicStreamUrl = await prompt('Enter your Public Stream URL (e.g., wss://yourdomain.com/deepgram): ');

      const envContent = `TWILIO_ACCOUNT_SID=${twilioAccountSid}\nTWILIO_AUTH_TOKEN=${twilioAuthToken}\nDEEPGRAM_API_KEY=${deepgramApiKey}\nPUBLIC_STREAM_URL=${publicStreamUrl}`;
      fs.writeFileSync(envPath, envContent);
      console.log('.env file created successfully.');
    }

    // Step 3: Configure Twilio
    console.log('\nConfigure Twilio:');
    console.log('1. Log in to your Twilio Console.');
    console.log('2. Navigate to the phone number you purchased.');
    console.log('3. Set the Voice & Fax > A Call Comes In webhook to point to your server’s /voice endpoint (e.g., http://yourdomain.com:3000/voice).');
    console.log('Press Enter once you have completed this step...');
    await prompt('');

    // Step 4: Configure Google Voice
    console.log('\nConfigure Google Voice:');
    console.log('1. Log in to Google Voice.');
    console.log('2. Go to Settings > Call forwarding.');
    console.log('3. Add a new forwarding number and enter your Twilio phone number.');
    console.log('4. Choose the type of calls you want to forward (all, missed, or voicemail).');
    console.log('5. Save the changes.');
    console.log('Press Enter once you have completed this step...');
    await prompt('');

    // Step 5: Start the Server
    console.log('\nStarting the server...');
    execSync('node server.js', { stdio: 'inherit' });

    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('An error occurred during setup:', error.message);
  } finally {
    rl.close();
  }
}

setup();