import { Context } from 'telegraf';
import { getSession, clearSession } from '../services/sessions';
import { getDevices } from '../services/api';

export async function devicesCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const session = getSession(telegramId);
  if (!session) {
    return ctx.reply('First, log in: /login');
  }

  try {
    const devices = await getDevices(session.token);

    if (devices.length === 0) {
      return ctx.reply('Device list is empty.\nCreate one: /newdevice');
    }

    const lines = devices.map((d, i) => {
      const created = new Date(d.createdAt).toLocaleDateString('en-US');
      const ip = d.ipAddress ?? '—';
      return [
        `${i + 1}. ${d.name}`,
        `   ID: \`${d.id}\``,
        `   IP: ${ip}`,
        `   Created: ${created}`,
      ].join('\n');
    });

    await ctx.reply(
      `Your devices (${devices.length}):\n\n${lines.join('\n\n')}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err: any) {
    const status = err?.response?.status;
    console.error('devices command error:', status, err?.message);

    if (status === 401) {
      clearSession(telegramId);
      return ctx.reply('Session expired. Please log in again: /login');
    }

    return ctx.reply('Failed to get device list.');
  }
}