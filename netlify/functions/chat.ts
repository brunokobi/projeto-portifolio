import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: "",
      };
    }

    const response = await fetch(
      "http://44.202.156.220:5678/webhook/860456de-05c8-40bf-9ba2-cbca916a026d/chat",     
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: event.body,
      }
    );

    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: text,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Proxy error",
        message: error.message,
      }),
    };
  }
};
