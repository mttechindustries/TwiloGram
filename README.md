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
``