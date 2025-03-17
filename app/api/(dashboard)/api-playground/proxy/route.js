import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();
  const { method, url, headers, body, queryParams } = data;

  try {
    // Construct the URL with query parameters
    let fullUrl = url;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const urlObj = new URL(url);
      Object.entries(queryParams).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });
      fullUrl = urlObj.toString();
    }

    // Prepare fetch options
    const fetchOptions = {
      method,
      headers: headers || {},
    };

    // Add body for non-GET requests
    if (method !== "GET" && body) {
      if (headers && headers["content-type"] === "application/json") {
        fetchOptions.body =
          typeof body === "string" ? body : JSON.stringify(body);
      } else {
        fetchOptions.body = body;
      }
    }

    // Make the request
    const response = await fetch(fullUrl, fetchOptions);

    // Get response data
    const responseData = await response.text();

    // Try to parse as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch (e) {
      parsedResponse = responseData;
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: parsedResponse,
    });
  } catch (error) {
    console.error("Error proxying request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
