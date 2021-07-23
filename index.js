import { Router } from 'itty-router';
import { parseJwt } from '@cfworker/jwt';

const router = Router({ base: '/api' });
// Blynk server has GEO DNS Issue and you can't use direct IP Address from Workers.
// The workaround is adding A record with Blynk server IP Address to your domain.
const blynkServer = 'http://blynk.ziggystardust.xyz';

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
    return response.text();
  }
  if (contentType.includes('text/html')) {
    return response.text();
  }
  return response.text();
}
/**
 * Gets the cookie with the name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to get
 */
function getCookie(request, name) {
  let result = '';
  const cookieString = request.headers.get('Cookie');
  if (cookieString) {
    const cookies = cookieString.split(';');
    cookies.forEach((cookie) => {
      const cookiePair = cookie.split('=', 2);
      const cookieName = cookiePair[0].trim();
      if (cookieName === name) {
        const cookieVal = cookiePair[1];
        result = cookieVal;
      }
    });
  }
  return result;
}
async function handleRequest(request) {
  const jwt = getCookie(request, 'CF_Authorization');
  const issuer = process.env.CERT_ISSUER; // CF Access issuer.
  const audience = process.env.AUD_TAG; // CF Access AUD tag.
  const result = await parseJwt(jwt, issuer, audience);
  // console.log(new Map(request.headers));
  // console.log(jwt);
  // console.log(issuer);
  // console.log(audience);
  // console.log(result);
  if (!result.valid) {
    // console.debug(result.reason); // Invalid issuer/audience, expired, etc
    return new Response(result.reason);
  }
  // console.debug(result.payload); // { iss, sub, aud, iat, exp, ...claims }
  return router.handle(request);
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
router.all('/*', () => new Response('Are you lost?', { status: 404 }));

// attach the router "handle" to the event handler
// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
