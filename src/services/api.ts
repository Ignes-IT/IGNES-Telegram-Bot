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

export interface DeviceListItem {
  id: string;
  name: string;
  publicKey: string;
  ipAddress: string | null;
  createdAt: string;
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

export const getDevices = async (token: string): Promise<DeviceListItem[]> => {
  const { data } = await api.get<{ devices: DeviceListItem[] }>('/api/devices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.devices;
};

export const deleteDevice = async (token: string, deviceId: string): Promise<void> => {
  await api.delete(`/api/devices/${deviceId}`, {
    headers: { Authorization: `Bearer ${token}`},
  });
};

export const getConfig = async (token: string, deviceId: string): Promise<string> => {
  const { data } = await api.get<string>(
    `/api/vpn/config/${deviceId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

