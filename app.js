/** STEP 1: BASIC HTTP SERVER */
// const http = require('http');
// const url = require('url');

// const port = process.env.PORT || 3000;

// // note that typically the variables here are `req` and `res` but we are using `request` and `response` for clarity
// const server = http.createServer(function(request, response) {
//   response.end("hi");
// });

// server.listen(port, function() {
//   console.log(`Server is listening on port ${port}`);
// });

/**  STEP 2: RETURN JSON RESPONSE **/

// const server = http.createServer(function(request, response) {
//   response.setHeader('Content-Type', 'application/json');
//   response.end(JSON.stringify({ text: 'hi', numbers: [1, 2, 3] }));
// });

/**  STEP 3: ADD ROUTING AND HANDLERS **/

// function respondText(req, res) {
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('hi');
// }

// function respondJson(req, res) {
//   res.setHeader('Content-Type', 'application/json');
//   res.end(JSON.stringify({ text: 'hi', numbers: [1, 2, 3] }));
// }

// function respondNotFound(req, res) {
//   res.writeHead(404, { 'Content-Type': 'text/plain' });
//   res.end('Not Found');
// }

// const server = http.createServer(function(request, response) {
//   const parsedUrl = url.parse(request.url, true);
//   const pathname = parsedUrl.pathname;

//   if (pathname === '/') return respondText(request, response);
//   if (pathname === '/json') return respondJson(request, response);

//   respondNotFound(request, response);
// });

// STEP 4: ADD /echo ENDPOINT (Dynamic Query Handling)

// function respondEcho(req, res) {
//   const urlObj = new URL(req.url, `http://${req.headers.host}`);
//   const input = urlObj.searchParams.get('input') || '';

//   res.setHeader('Content-Type', 'application/json');
//   res.end(JSON.stringify({
//     normal: input,
//     shouty: input.toUpperCase(),
//     charCount: input.length,
//     backwards: input.split('').reverse().join('')
//   }));
// }

// // Update server:
// // if (pathname.match(/^\/echo/)) return respondEcho(request, response);

/**  STEP 5: SWITCH TO EXPRESS (Drop-in Replacement for HTTP Module)  **/


const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Serve static assets from the "public" folder (chat.js etc.)
app.use(express.static(__dirname + '/public'));

// EXPRESS VERSION OF RESPOND FUNCTIONS

function respondText(req, res) {
  res.send('hi');
}


 /* Responds with JSON */

function respondJson(req, res) {
  // Express has a built-in json() helper
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}


 /* Responds to /echo with dynamic transformations */
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}


 /* Serves the chat HTML page */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}


 /* Handles incoming chat messages */
 
function respondChat(req, res) {
  const { message } = req.query;
  console.log('Received message:', message);
  chatEmitter.emit('message', message);
  res.end();
}

 /* Server-Sent Events endpoint for live chat updates */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = (message) => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// EXPRESS ROUTES

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// START EXPRESS SERVER

app.listen(port, () => {
  console.log(`✅ Listening on port ${port}`);
});
