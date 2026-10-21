import { Context, Telegraf } from 'telegraf';
import { clearSession, getSession } from '../services/sessions';

export async function handleApiError(ctx: Context, err: any): Promise<void> {
  const status = err?.response?.status;
  const id = ctx.from?.id;

  if (status === 401) {
    if (id) clearSession(id);
    await ctx.reply('🔒 Session has expired. Login again:\n/login email password');
    return;
  }
  if (status === 403) {
    await ctx.reply(
      '⛔ Device limit or access denied.\nCheck plan: /status');
    return;
  }
  if (status === 404) {
    await ctx.reply('❓ Not found. The device may have already been removed.');
    return;
  }
  if (status === 503) {
    await ctx.reply('⚠️ The VPN server is temporarily unavailable. Please try again in a minute.');
    return;
  }
  console.error('API error:', status, err?.message);
  await ctx.reply('❌ Something went wrong. Try again later.');
}

export function setupErrorHandler(bot: Telegraf): void {
  bot.catch(async (err, ctx) => {
    console.error('Bot error:', ctx.updateType, err);
    try {
      await ctx.reply('❌ Internal error. Try /start');
    } catch {}
  });
}