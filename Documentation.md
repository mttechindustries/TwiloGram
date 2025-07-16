Certainly! Here is the complete documentation for the TwiloGram project, including detailed instructions, explanations, and troubleshooting tips.

### README.md

```markdown
# TwiloGram 🤖🎙️

TwiloGram is a project that demonstrates how to create a simple, voice-driven AI assistant. It connects a Google Voice number to a Twilio number, which then forwards the call to a Node.js server. The server uses Twilio to manage the call and Deepgram to transcribe the user's speech, enabling a conversational turn-by-turn interaction.

## Features

- **Google Voice Integration**: Forward calls from your free Google Voice number.
- **Twilio Call Handling**: Manages incoming calls using TwiML (Twilio Markup Language).
- **Deepgram Transcription**: Uses Deepgram's AI speech-to-text for fast and accurate transcription of call audio.
- **Automated Setup**: An interactive script to help you install dependencies and configure your environment.
- **Extensible**: A solid foundation for building more complex IVR (Interactive Voice Response) systems or conversational AI agents.

## How It Works

The call flow is a simple, robust, turn-by-turn process:

1. **Incoming Call**: A user calls your Google Voice number.
2. **Call Forwarding**: Google Voice forwards the call to your Twilio phone number.
3. **Twilio Webhook**: Twilio receives the call and makes an HTTP POST request to your application's `/voice` endpoint.
4. **Initial Response**: Your server responds with TwiML, which instructs Twilio to play a greeting and record the user's message.
5. **User Speaks**: The user leaves a message, which Twilio records.
6. **Recording Webhook**: Once the recording is complete, Twilio makes another POST request to your `/handle-recording` endpoint, including a URL to the audio file.
7. **Transcription**: Your server sends the audio URL to Deepgram for transcription.
8. **Final Response**: After receiving the transcript, your server generates a final TwiML response (e.g., confirming the message) and instructs Twilio to hang up the call.

## Prerequisites

- **Node.js**: v16 or later.
- **npm**: Comes bundled with Node.js.
- **Twilio Account**: A free or paid account with a purchased phone number.
- **Deepgram Account**: A free or paid account to get an API key.
- **ngrok**: A tool to expose your local server to the internet so Twilio can communicate with it.

## Installation & Setup

Follow these steps to get your TwiloGram assistant running.

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/twilogram.git
cd twilogram
```

### 2. Run the Automated Setup

This interactive script will install dependencies and help you create your `.env` configuration file.

```sh
npm run setup
```

Follow the on-screen prompts to enter your Twilio and Deepgram credentials.

### 3. Expose Your Server with Ngrok

Twilio needs a public URL to send webhooks to your local server. Open a new terminal window and use ngrok to create a secure tunnel.

```sh
# The port should match the one in your .env file (default is 8080)
ngrok http 8080
```

Ngrok will provide a public HTTPS URL (e.g., https://1234-abcd.ngrok.io). Copy this URL for the next step.

### 4. Configure Your Twilio Number

Log in to your Twilio Console.

Navigate to Phone Numbers > Manage > Active Numbers and click on your number.

Scroll down to the Voice & Fax section.

For "A CALL COMES IN", set the webhook to your ngrok URL, pointing to the `/voice` endpoint.

**Webhook URL:** `https://<your-ngrok-url>/voice`

**Method:** `HTTP POST`

Click Save.

### 5. Configure Google Voice

Log in to Google Voice.

Go to Settings ⚙️ > Calls > Call forwarding.

Add a new linked number and enter your Twilio phone number.

Follow the verification steps.

### Running the Server

Once setup is complete, you can start the application server in your original terminal window.

For development (server restarts automatically on file changes):

```sh
npm run dev
```

For production:

```sh
npm start
```

Your server is now running and ready to accept calls!

## Troubleshooting

### Call hangs up immediately

- **Check the Twilio Debugger for errors.** This is the most common issue.
- **Ensure your ngrok tunnel is running and the URL in the Twilio console is correct (HTTPS, /voice, POST).**
- **Verify your server is running and not crashed. Check the terminal for error logs.**

### No response after I speak

- **Check the server logs.** Did the `/handle-recording` endpoint get called?
- **Verify your Deepgram API key is correct and has credits.**
- **Ensure the `RecordingUrl` is being received from Twilio.**

## License

This project is licensed under the MIT License.
```

### .env.example

```plaintext
# -----------------------------  
# TwiloGram Environment Variables  
# -----------------------------  
# Copy this file to .env and fill in your credentials.  
  
# Your Twilio Account SID and Auth Token, found on your Twilio Console dashboard.  
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  
TWILIO_AUTH_TOKEN=your_twilio_auth_token  
  
# Your Deepgram API Key, found in your Deepgram Console under API Keys.  
DEEPGRAM_API_KEY=your_deepgram_api_key  
  
# The port your local server will run on.  
PORT=8080  
```

### package.json

```json
{
  "name": "twilogram",
  "version": "1.1.0",
  "description": "A project to forward Google Voice calls to a Twilio number and interact with a real-time conversational AI powered by Deepgram.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup": "node setup.js"
  },
  "dependencies": {
    "@deepgram/sdk": "^3.0.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "twilio": "^4.20.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "license": "MIT"
}
```

### server.js

```javascript
require('dotenv').config();
const express = require('express');
const { Deepgram } = require('@deepgram/sdk');
const { twiml } = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

// Initialize Deepgram
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
if (!deepgramApiKey) {
  console.error("DEEPGRAM_API_KEY is not set. Please check your .env file.");
  process.exit(1);
}
const deepgram = new Deepgram(deepgramApiKey);

// Initialize Twilio
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

// Entry point for incoming calls
app.post('/voice', (req, res) => {
  console.log(`[INFO] Incoming call from: ${req.body.From}`);

  const response = new twiml.VoiceResponse();

  // Initial greeting
  response.say({ voice: 'Polly.Joanna-Neural' },
    'Hello, and thank you for calling the TwiloGram assistant. Please leave your message after the tone. Press the pound key when you are finished.'
  );

  // Use <Record> to capture the user's speech.
  response.record({
    action: '/handle-recording',
    method: 'POST',
    maxLength: 60, // Max recording length in seconds
    finishOnKey: '#',
    transcribe: false // We will send it to Deepgram ourselves
  });

  // If the user provides no input, the call flow continues here.
  // We'll just hang up.
  response.hangup();

  res.type('text/xml');
  res.send(response.toString());
});

// Handle the completed recording
app.post('/handle-recording', async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  console.log(`[INFO] Received recording for processing. URL: ${recordingUrl}`);

  if (!recordingUrl) {
      console.error('[ERROR] No RecordingUrl was provided in the request.');
      return res.status(400).send('Bad Request: No RecordingUrl');
  }

  try {
    // Transcribe the audio from the URL using Deepgram's pre-recorded audio API
    const { result, error } = await deepgram.transcription.preRecorded(
      { url: recordingUrl },
      { punctuate: true, model: 'nova-2', smart_format: true }
    );

    if (error) {
      console.error('[ERROR] Deepgram transcription failed:', error);
      throw new Error('Transcription failed.');
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log(`[TRANSCRIPT]: "${transcript}"`);

    // AI Logic Placeholder
    // Here you would process the transcript with an LLM (e.g., GPT, Claude)
    // to generate a contextually aware and intelligent response.
    // For this example, we'll just confirm what we heard.
    let agentReply = 'I am sorry, I did not catch that. Could you please call again?';
    if (transcript) {
        agentReply = `Thank you for your message. We have recorded: "${transcript}". Our team will review it shortly. Goodbye.`;
    }

    // Respond to the user with the generated reply and then hang up
    const response = new twiml.VoiceResponse();
    response.say({ voice: 'Polly.Joanna-Neural' }, agentReply);
    response.hangup();

    res.type('text/xml');
    res.send(response.toString());

  } catch (err) {
    console.error('[ERROR] An error occurred in /handle-recording:', err.message);

    // In case of any error, provide a graceful exit for the caller
    const response = new twiml.VoiceResponse();
    response.say({ voice: 'Polly.Joanna-Neural' }, 'I am sorry, but there was an error processing your request. Please call back later.');
    response.hangup();

    res.type('text/xml');
    res.send(response.toString());
  }
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Start the server
app.listen(PORT, () => {
  console.log(`[INFO] TwiloGram server is listening on port ${PORT}`);
  console.log('[INFO] Remember to use a tool like ngrok to expose this port to the internet for Twilio to access.');
  console.log(`[INFO] Your Twilio webhook URL for voice calls should be: https://<your-ngrok-url>/voice`);
});
```

### setup.js

```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

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

      const envContent =```plaintext
`TWILIO_ACCOUNT_SID=${twilioAccountSid}\nTWILIO_AUTH_TOKEN=${twilioAuthToken}\nDEEPGRAM_API_KEY=${deepgramApiKey}\nPORT=${port}`;
      fs.writeFileSync(envPath, envContent);
      console.log(`${green}  > .env file created successfully.${reset}`);
    }

    // Step 4: Final Instructions
    console.log(`\n${green}[Step 4/4] Configuration Instructions:${reset}`);
    console.log('Your project is set up! To run it, follow these steps:');
    console.log('\n1. Start a tunnel to expose your local server to the internet.');
    console.log('   We recommend ngrok:');
    console.log(`   ${yellow}ngrok http ${process.env.PORT || 8080}${reset}`);
    console.log('   Copy the HTTPS URL provided by ngrok (e.g., https://1234abcd.ngrok.io).');

    console.log('\n2. Configure your Twilio Phone Number:');
    console.log('   - Log in to your Twilio Console.');
    console.log('   - Go to Phone Numbers > Manage > Active Numbers and select your number.');
    console.log('   - Scroll to "Voice & Fax". For "A CALL COMES IN", select "Webhook".');
    console.log(`   - Paste your ngrok URL with the /voice path into the text box.`);
    console.log(`     Example: ${yellow}https://1234abcd.ngrok.io/voice${reset}`);
    console.log('   - Ensure the method is set to "HTTP POST" and save.');

    console.log('\n3. Configure Google Voice:');
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
```

### Summary

This documentation provides a comprehensive guide for setting up and running the TwiloGram project. It covers all necessary steps from cloning the repository to configuring Google Voice and Twilio, and includes troubleshooting tips to help resolve common issues. The project leverages Twilio for call management, Deepgram for transcription, and Google Voice for call forwarding, ensuring a seamless and efficient voice-driven assistant.