// Import Express.js
const express = require('express');
const os = require('os');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;


// ===== Function to log request info =====
function logRequest(req) {

  const timestamp = new Date().toISOString();

  const logData = {
    timestamp: timestamp,

    request: {
      method: req.method,
      url: req.originalUrl,
      protocol: req.protocol,
      httpVersion: req.httpVersion
    },

    network: {
      ip: req.ip,
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
      forwardedFor: req.headers['x-forwarded-for'],
      realIP: req.headers['x-real-ip'],
      host: req.headers['host']
    },

    headers: req.headers,

    connection: {
      encrypted: req.socket?.encrypted || false,
      servername: req.socket?.servername,
      localAddress: req.socket?.localAddress,
      localPort: req.socket?.localPort
    },

    system: {
      hostname: os.hostname()
    },

    body: req.body
  };

  console.log("\n================ WEBHOOK REQUEST ================\n");
  console.log(JSON.stringify(logData, null, 2));
  console.log("\n=================================================\n");
}



// ===== GET webhook verification =====
app.get('/webhook', (req, res) => {

  logRequest(req);

  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});



// ===== POST webhook events =====
app.post('/webhook', (req, res) => {

  logRequest(req);

  console.log("Webhook body:");
  console.log(JSON.stringify(req.body, null, 2));

  res.status(200).end();
});



// ===== Catch-all route to log unexpected calls =====
app.use((req, res) => {

  logRequest(req);

  res.status(404).json({
    message: "Endpoint not found"
  });
});



// ===== Start the server =====
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
