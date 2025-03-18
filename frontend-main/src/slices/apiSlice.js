import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config/config.js';
import { logout } from './authSlice.js';

// Update the base URL to your deployed backend
export const baseUrl = 'http://localhost:5000';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.userInfo?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    // Don't set X-Forwarded-Proto header, let the server handle HTTPS
    return headers;
  }
});

// Create a custom base query with error handling and auth checks
const baseQueryWithAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    api.dispatch(logout());
    // Don't redirect here, let the component handle it
    return result;
  }

  // Handle 403 Forbidden responses
  if (result?.error?.status === 403) {
    window.location.href = '/unauthorized';
  }

  // Handle network errors
  if (result?.error?.status === 'FETCH_ERROR') {
    result.error.message = 'Unable to connect to server. Please check your internet connection.';
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Exam', 'Result', 'Upload'],
  endpoints: (builder) => ({
    // Add any common endpoints here
    healthCheck: builder.query({
      query: () => 'health'
    })
  })
});

// Export hooks for common endpoints
export const { useHealthCheckQuery } = apiSlice;