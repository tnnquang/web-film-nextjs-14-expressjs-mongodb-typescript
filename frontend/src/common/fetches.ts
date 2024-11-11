// fetchInstance.js

import { BASE_URL_API } from "./constant";

const BASE_URL = BASE_URL_API;
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

function createFetchInstance(
  baseURL = BASE_URL,
  defaultHeaders = DEFAULT_HEADERS
) {
  // Custom fetch wrapper function
  async function customFetch(
    endpoint: string,
    options: { [key: string]: any } = {}
  ) {
    const url = `${baseURL}${endpoint}`;
    const headers = { ...defaultHeaders, ...options.headers };

    // Request Interceptor (example: adding auth token)
    // headers['Authorization'] = 'Bearer YOUR_AUTH_TOKEN';

    try {
      const response = await fetch(url, { ...options, headers });

      // Response Interceptor
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      // Centralized Error Handling
      console.error("Fetch Error:", error);
      throw error;
    }
  }

  return customFetch;
}

const fetchInstance = createFetchInstance();

export default fetchInstance;
