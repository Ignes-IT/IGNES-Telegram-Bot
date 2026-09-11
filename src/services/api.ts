import axios from 'axios';
import { env } from '../config/env';

const api = axios.create({
  baseURL: env.coreApiUrl,
  timeout: 10000,
});

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  };
}

export interface DeviceResponse {
  deviceId: string;
  publicKey: string;
}

export const registerUser = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/register', { email, password });
  return data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
  return data;
};

export const createDevice = async (token: string, name: string): Promise<DeviceResponse> => {
  const { data } = await api.post<DeviceResponse>(
    '/api/devices',
    { name },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const getConfig = async (deviceId: string): Promise<string> => {
  const { data } = await api.get<string>(`/api/vpn/config/${deviceId}`);
  return data;
};