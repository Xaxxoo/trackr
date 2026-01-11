// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

class ApiClient {
  private client: AxiosInstance;
  private serverClient: AxiosInstance;

  constructor() {
    // Client-side instance (for browser)
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Server-side instance (for SSR)
    this.serverClient = axios.create({
      baseURL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Client-side request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Client-side response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // For client-side use
  getClient(): AxiosInstance {
    return this.client;
  }

  // For server-side use
  async getServerClient(token?: string): Promise<AxiosInstance> {
    if (token) {
      this.serverClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return this.serverClient;
  }
}

export const apiClient = new ApiClient();