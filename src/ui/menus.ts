import { Markup } from 'telegraf';
import { DeviceListItem } from '../services/api';
import { truncate } from './format';

export const mainMenu = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📱 My Devices', 'menu:devices')],
    [
      Markup.button.callback('➕ Create', 'menu:create'),
      Markup.button.callback('📊 Status', 'menu:status'),
    ],
    [
      Markup.button.callback('👤 Profile', 'menu:whoami'),
      Markup.button.callback('❓ Help', 'menu:help'),
    ],
  ]);

export const backToMenu = () =>
  Markup.inlineKeyboard([[Markup.button.callback('⬅️ Menu', 'menu:back')]]);

export const devicesKeyboard = (devices: DeviceListItem[]) => {
  const rows: ReturnType<typeof Markup.button.callback>[][] = devices.map((d, i) => [
    Markup.button.callback(`📥 ${i + 1}. ${truncate(d.name, 16)}`, `dev:${d.id}:download`),
    Markup.button.callback('🗑', `dev:${d.id}:confirm_delete`),
  ]);
  rows.push([Markup.button.callback('➕ Create', 'menu:create')]);
  rows.push([Markup.button.callback('⬅️ Menu', 'menu:back')]);
  return Markup.inlineKeyboard(rows);
};

export const confirmDeleteKeyboard = (deviceId: string) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🗑 Yes, delete', `dev:${deviceId}:delete`)],
    [Markup.button.callback('⬅️ Cancel', 'menu:devices')],
  ]);