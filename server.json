require('dotenv').config();
const express = require('express');
const { Deepgram } = require('@deepgram/sdk');
const twilio = require('twilio');
const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const wssPort = process.env.WSS_PORT || 8080;

// Twilio credentials
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Deepgram credentials
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = new Deepgram(deepgramApiKey);

// Webhook endpoint to answer calls
app.post('/voice', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    // Respond with TwiML to start streaming
    const twiml = new twilio.twiml.VoiceResponse();

    // Start <Stream> to our websocket endpoint for Deepgram
    twiml.start().stream({
      url: process.env.PUBLIC_STREAM_URL // e.g., wss://yourdomain.com/deepgram
    });

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling voice request:', error);
    res.status(500).send('<Response><Say>Sorry there was an error</Say></Response>');
  }
});

// Example Deepgram WebSocket handler
const transcripts = [];

const wss = new WebSocket.Server({ port: wssPort });

wss.on('connection', function connection(ws) {
  ws.on('message', async function incoming(audioData) {
    try {
      // Send audio to Deepgram for transcription
      const response = await deepgram.transcription.live({ model: 'general' }, {
        smartAgent: {
          // Configure your agent here
        }
      });

      // Handle transcription and generate response
      response.addListener('transcriptReceived', (transcription) => {
        const agentReply = transcription.channel.alternatives[0].transcript;
        transcripts.push(agentReply);

        // Send response back to caller using Twilio <Say>
        twilioClient.calls(req.body.CallSid)
          .update({ twiml: `<Response><Say>${agentReply}</Say></Response>` })
          .catch(err => console.error('Error updating call:', err));
      });

      // Pipe audio data to Deepgram
      ws.pipe(response);
    } catch (error) {
      console.error('Error processing audio data:', error);
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    ws.close();
  });
});

// Secure WebSocket server
if (process.env.NODE_ENV === 'production') {
  const server = https.createServer({
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    key: fs.readFileSync(process.env.SSL_KEY_PATH)
  }, app);

  server.listen(port, () => {
    console.log(`TwiloGram server running on port ${port}`);
  });

  wss.listen(wssPort, () => {
    console.log(`WebSocket server running on port ${wssPort}`);
  });
} else {
  app.listen(port, () => {
    console.log(`TwiloGram server running on port ${port}`);
  });

  wss.listen(wssPort, () => {
    console.log(`WebSocket server running on port ${wssPort}`);
  });
}