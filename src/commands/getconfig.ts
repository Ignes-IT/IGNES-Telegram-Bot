import { Context } from 'telegraf';
import { getSession, clearSession } from '../services/sessions';
import { getConfig, getDevices } from '../services/api';
import { handleApiError } from '../middleware/error';

export async function getConfigCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await ctx.reply('🔒 Log in first: /login email password');
    return;
  }

  const text = (ctx.message as any)?.text ?? '';
  const deviceId = text.split(/\s+/).slice(1)[0];

  if (!deviceId) {
    await ctx.reply(
      '📥 Its easier to use /devices → click the 📥 next to the device.\n\n' +
      'Direct command (legacy): /getconfig <id>'
    );
    return;
  }

  try {
    let name = deviceId;
    let ip: string | null = null;
    try {
      const devices = await getDevices(s.token);
      const d = devices.find((x) => x.id === deviceId);
      if (d) {
        name = d.name;
        ip = d.ipAddress;
      }
    } catch {}

    const config = await getConfig(s.token, deviceId);
    const safeName = name.replace(/[^\w.-]+/g, '-');
    await ctx.replyWithDocument(
      { source: Buffer.from(config, 'utf-8'), filename: `${safeName}.conf` },
      { caption: `📄 ${name}\nIP: ${ip ?? '—'}` }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}