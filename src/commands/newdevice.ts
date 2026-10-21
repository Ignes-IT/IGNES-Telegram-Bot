import { Context } from 'telegraf';
import { getSession, setPending } from '../services/sessions';
import { getDevices, getSubscription } from '../services/api';
import { getPlanLimit } from '../config/plans';
import { handleApiError } from '../middleware/error';

export async function newDeviceCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await ctx.reply('🔒 Log in first: /login email password');
    return;
  }

  try {
    const [devices, sub] = await Promise.all([
      getDevices(s.token),
      getSubscription(s.token).catch(() => null),
    ]);
    const plan = sub?.plan ?? 'FREE';
    const limit = getPlanLimit(plan);

    if (devices.length >= limit) {
      await ctx.reply(
        `⛔ <b>Device limit:</b> ${devices.length}/${limit} (plan ${plan}).\n\n` +
          `Remove device (/devices) or upgrade plan.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    setPending(id, { type: 'deviceName' });
    await ctx.reply(
      '➕ <b>Create Device</b>\n\n' +
        'Submit a name (eg: "iPhone", "Work Laptop").\n' +
        'or /cancel for cancel.',
      { parse_mode: 'HTML' }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}