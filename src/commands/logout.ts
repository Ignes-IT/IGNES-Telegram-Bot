import { Context } from 'telegraf';
import { clearSession } from '../services/sessions';

export const logoutCommand = async (ctx: Context): Promise<void> => {
  const id = ctx.from?.id;
  if (!id) return;
  clearSession(id);
  await ctx.reply('👋 You have been logged out of your account.\n\n/login email password');
};