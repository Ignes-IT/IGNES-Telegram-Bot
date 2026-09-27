import { Context } from 'telegraf';
import { getConfig } from '../services/api';
import { getSession, clearSession } from '../services/sessions';

export const getConfigCommand = async (ctx: Context) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const session = getSession(telegramId);
  if (!session) {
    await ctx.reply('Log in with /login');
    return;
  }

  const text = (ctx.message as any)?.text as string;
  const parts = text.split(' ').slice(1);

  if (parts.length < 1) {
    await ctx.reply('Usage: /getconfig <device_id>');
    return;
  }

  const deviceId = parts[0];

  try {
    const config = await getConfig(session.token, deviceId);
    await ctx.replyWithDocument(
      { source: Buffer.from(config, 'utf-8'), filename: `wg-${deviceId}.conf` },
      { caption: 'Your WireGuard config' }
    );
  } catch (err: any) {
    const status = err?.response?.status;
    console.error('getconfig command error:', status, err?.message);

    if (status === 401) {
      clearSession(telegramId);
      return ctx.reply('Your session has expired. Please log in again: /login');
    }
    if (status === 404) {
      return ctx.reply('Device not found.');
    }
    return ctx.reply('Failed to get config.');
  }
};