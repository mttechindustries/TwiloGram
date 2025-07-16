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