import { Router } from 'itty-router';

const router = Router();
const blynkServer = 'http://blynk-cloud.com';

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return JSON.stringify(await response.json());
  }
  if (contentType.includes('application/text')) {
    const bodyResponse = await response.text();
    return bodyResponse;
  }
  if (contentType.includes('text/html')) {
    const bodyResponse = await response.text();
    return bodyResponse;
  }
  const bodyResponse = await response.text();
  return bodyResponse;
}

/**
 * Handler for Blynk Pin Value
 * @param {pin}
 */
async function apiRequest(query, pin) {
  let endpoint;
  // Call the API
  // Use process.env.AUTH_TOKEN for wherever your API key should be passed in.
  // That might be a header, or part of the URL itself
  if (pin == null) {
    endpoint = `${blynkServer}/${process.env.AUTH_TOKEN}/${query}`;
  } else {
    endpoint = `${blynkServer}/${process.env.AUTH_TOKEN}/${query}/${pin}`;
  }
  const response = await fetch(endpoint);
  const body = await gatherResponse(response);
  return new Response(body, response);
}
// Replace with the appropriate paths and handlers
router.get('/:query/:pin?', ({ params }) => apiRequest(params.query, params.pin));
// 404 for everything else
// return a default message for the root route
router.all('*', () => new Response('Are you lost, little boy? Not Found.', { status: 404 }));

// attach the router "handle" to the event handler
// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => event.respondWith(router.handle(event.request)));
