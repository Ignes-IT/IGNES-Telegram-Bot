import { Context, Markup } from 'telegraf';
import { getSession } from '../services/sessions';
import { getDevices } from '../services/api';
import { handleApiError } from '../middleware/error';
import { escapeHtml } from '../ui/format';

export async function deleteUserCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await ctx.reply('🔒 Log in first: /login email password');
    return;
  }

  try {
    const devices = await getDevices(s.token);

    const deviceLine =
      devices.length > 0
        ? `📱 <b>Devices to remove:</b> ${devices.length} (<i>${devices
            .map((d) => escapeHtml(d.name))
            .join(', ')}</i>)`
        : '📱 <b>No devices</b>';

    const text = [
      '⚠️ <b>Delete account?</b>',
      '',
      `📧 <code>${escapeHtml(s.email)}</code>`,
      deviceLine,
      '',
      '<b>This cannot be undone.</b> Subscription and all devices will be removed.',
    ].join('\n');

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✅ Yes, delete everything', 'user:confirm_delete')],
      [Markup.button.callback('❌ Cancel', 'user:cancel_delete')],
    ]).reply_markup;

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}
