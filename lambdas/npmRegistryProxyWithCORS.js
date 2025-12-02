// Lambda for proxying npm registry requests and adding CORS headers for the
// npmgraph.js.org origin
//
// This is hosted on @broofa's AWS account
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const ALLOWED_ORIGINS = ['https://npmgraph.js.org', 'http://localhost:1234'];

export async function handler(event) {
  const req = event.requestContext.http;
  const origin = event.headers.origin;
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return {
        statusCode: 403,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
      };
    }

    const url = `${NPM_REGISTRY_URL}${req.path}`;
    const options = {
      method: req.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        req.httpMethod === 'GET' || req.httpMethod === 'HEAD'
          ? null
          : event.body,
    };

    const response = await fetch(url, options);
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        ...CORS_HEADERS,
      },
      body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
}
