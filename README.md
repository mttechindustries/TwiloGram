
# TwiloGram 🤖🎙️

TwiloGram is a voice-driven AI project that connects Google Voice with Twilio and uses Deepgram for speech-to-text conversion, enabling conversational AI phone interactions.

## Features
- **Google Voice Integration**: Forward calls from free Google Voice numbers
- **Twilio Call Handling**: Process calls using TwiML (Twilio Markup Language)
- **Deepgram Transcription**: AI-powered speech-to-text conversion
- **Automated Setup**: Interactive configuration script
- **Extensible Architecture**: Foundation for IVR systems or custom voice assistants

## How It Works
1. 📞 Call received via Google Voice  
2. 🔀 Forwarded to Twilio number  
3. 🌐 Twilio triggers `/voice` endpoint  
4. 🎙️ System greets user and records response  
5. 📦 Recording sent to `/handle-recording`  
6. 🔍 Audio transcribed via Deepgram  
7. ✅ Final response/hangup based on transcript  

## Prerequisites
- [Node.js v16+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Twilio Account](https://twilio.com) (with phone number)
- [Deepgram API Key](https://deepgram.com)
- [ngrok](https://ngrok.com) (for local tunneling)

## Installation & Setup

### 1. Clone Repository
sh
git clone https://github.com/mttechindustries/TwiloGram.git
cd TwiloGram


### 2. Install Dependencies
sh
npm install


### 3. Configure Environment
Create `.env` file with:
env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
DEEPGRAM_API_KEY=your_deepgram_key
PORT=8080


### 4. Start ngrok Tunnel
sh
ngrok http 8080

Keep ngrok running - note the HTTPS URL (e.g., `https://abcd1234.ngrok.io`)

### 5. Configure Twilio
1. Go to [Twilio Console > Phone Numbers](https://console.twilio.com)
2. Select your active number
3. Under "Voice & Fax":
   - Set "A CALL COMES IN" to **Webhook**
   - Enter your ngrok URL with `/voice` path:  
     `https://<your-ngrok-url>/voice`
   - Set method to **HTTP POST**
4. Save configuration

### 6. Configure Google Voice
1. Go to Google Voice Settings > Calls
2. Under "Call forwarding":
   - Add your Twilio phone number
   - Enable forwarding

### 7. Start Server
sh
node Sever.js


## Usage
1. Call your Google Voice number
2. Speak after the greeting tone
3. System will:
   - Transcribe your speech via Deepgram
   - Process the message
   - Provide confirmation before hanging up

## Customization
Modify `Sever.js` to:
- Add custom voice responses
- Integrate with ChatGPT for AI responses:
  js
  // Example ChatGPT integration
  async function getAIResponse(transcript) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_OPENAI_KEY`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: transcript}]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
- Implement call routing logic

## Troubleshooting
- **No incoming calls**: 
  - Verify ngrok is running
  - Check Twilio webhook URL configuration
  - Ensure Google Voice forwarding is enabled
- **Transcription failures**: 
  - Validate Deepgram API key
  - Check audio format compatibility
- **Server errors**: 
  - Review console logs
  - Verify all dependencies installed

## Repository Structure

TwiloGram/
├── .env               # Environment variables
├── Documentation.md   # Project documentation
├── README.md          # This file
├── Sever.js           # Main server logic (handles webhooks)
├── package.json       # Dependencies
└── setup.js           # Interactive setup script


## License
MIT License
"""

print(readme_content)