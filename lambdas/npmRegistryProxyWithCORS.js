// Lambda for proxying npm registry requests and adding CORS headers for the
// npmgraph.js.org origin
//
// This is hosted on @broofa's personal AWS account (for now)
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

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
    if (!isOriginAllowed(origin)) {
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

function isOriginAllowed(origin) {
  const url = new URL(origin);

  if (url.hostname === 'localhost') {
    return true;
  }

  if (url.hostname === 'npmgraph.js.org') {
    return true;
  }

  if (/npmgraph-git-\w+-broofas-projects.vercel.app/.test(url.hostname)) {
    return true;
  }

  return false;
}
