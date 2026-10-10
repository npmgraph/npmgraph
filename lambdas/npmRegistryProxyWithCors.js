// Lambda for proxying npm registry requests and adding CORS headers for the
// npmgraph.js.org origin
//
// This is hosted on @broofa's personal AWS account (for now)
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

export async function handler(event) {
  const request = event.requestContext.http;
  const { origin } = event.headers;
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

    const url = `${NPM_REGISTRY_URL}${request.path}`;
    const options = {
      method: request.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        request.httpMethod === 'GET' || request.httpMethod === 'HEAD'
          ? null
          : event.body,
    };

    // Transparent proxy: the upstream status and body, also for 4xx/5xx errors,
    // are passed on unchanged, so there's no status to check
    // react-doctor-disable-next-line react-doctor/no-fetch-response-used-without-status-check
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

  return (
    url.hostname === 'localhost' ||
    url.hostname === 'npmgraph.js.org' ||
    /npmgraph-git-\w+-broofas-projects.vercel.app/.test(url.hostname)
  );
}
