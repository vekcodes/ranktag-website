/**
 * Centralised Axios client.
 *
 * - Base URL from env
 * - Auth header injected from localStorage (token mgmt added later)
 * - 401 -> redirect-to-login hook (later)
 * - Request-ID echoed back to console for support
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_VERSION, REQUEST_ID_HEADER } from '@/lib/constants';
import { env } from '@/lib/env';

const apiClient: AxiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api/${API_VERSION}`,
  timeout: 30_000,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Hook for attaching auth token in a later step.
  // const token = getAccessToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    const rid = res.headers[REQUEST_ID_HEADER.toLowerCase()];
    if (rid && env.appEnv !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[api] ${res.config.method?.toUpperCase()} ${res.config.url}  rid=${rid}`);
    }
    return res;
  },
  (err: AxiosError) => {
    // Centralised error shaping happens here in a later step.
    return Promise.reject(err);
  },
);

export default apiClient;
