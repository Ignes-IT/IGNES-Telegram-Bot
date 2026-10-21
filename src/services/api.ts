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
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getConfig = async (token: string, deviceId: string): Promise<string> => {
  const { data } = await api.get<string>(
    `/api/vpn/config/${deviceId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export interface MeResponse {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  telegramId?: string | null;
}

export interface SubscriptionResponse {
  id?: string;
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string | null;
  autoRenew?: boolean;
}

export const getMe = async (token: string): Promise<MeResponse> => {
  const { data } = await api.get<any>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (data.user || data) as MeResponse;
};

export const getSubscription = async (token: string): Promise<SubscriptionResponse | null> => {
  try {
    const { data } = await api.get<any>('/api/subscriptions/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return (data.subscription || data) as SubscriptionResponse;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export const mockUpgrade = async (token: string) => {
  const { data } = await api.post(
    '/api/subscriptions/mock-upgrade',
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};