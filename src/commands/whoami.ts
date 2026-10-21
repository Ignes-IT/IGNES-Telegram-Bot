import { Context, Markup } from 'telegraf';
import { getSession } from '../services/sessions';
import { getMe } from '../services/api';
import { escapeHtml } from '../ui/format';
import { handleApiError } from '../middleware/error';

export async function whoamiCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await ctx.reply('🔒 Log in first: /login email password');
    return;
  }

  try {
    const me = await getMe(s.token);
    const created = me.createdAt
  ? new Date(me.createdAt).toLocaleDateString('ru-RU')
  : '—';

    await ctx.reply(
      [
        '👤 <b>Profile</b>',
        '',
        `<b>ID:</b> <code>${me.id}</code>`,
        `<b>Email:</b> <code>${escapeHtml(me.email)}</code>`,
        `<b>Name:</b> ${escapeHtml(me.firstName ?? '—')} ${escapeHtml(me.lastName ?? '')}`.trim(),
        `<b>Role:</b> ${me.role}`,
        `<b>Telegram:</b> ${me.telegramId ? '✅ tied' : '❌ not attached'}`,
        `<b>Created:</b> ${created}`,
      ].join('\n'),
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('🚪 Logout', 'menu:logout')],
          [Markup.button.callback('⬅️ Menu', 'menu:back')],
        ]).reply_markup,
      }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}