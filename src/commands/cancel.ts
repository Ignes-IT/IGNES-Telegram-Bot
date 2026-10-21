import { Context } from 'telegraf';
import { clearPending } from '../services/sessions';
import { mainMenu } from '../ui/menus';

export async function cancelCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  clearPending(id);
  await ctx.reply('❌ Canceled.', { reply_markup: mainMenu().reply_markup });
}