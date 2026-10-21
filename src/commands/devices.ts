import { Context, Markup } from 'telegraf';
import { getSession } from '../services/sessions';
import { getDevices } from '../services/api';
import { escapeHtml } from '../ui/format';
import { devicesKeyboard } from '../ui/menus';
import { handleApiError } from '../middleware/error';

export async function devicesCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await ctx.reply('🔒 Log in first: /login email password');
    return;
  }

  try {
    const devices = await getDevices(s.token);

    if (devices.length === 0) {
      await ctx.reply('📭 You dont have any devices yet.', {
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('➕ Create', 'menu:create')],
          [Markup.button.callback('⬅️ Menu', 'menu:back')],
        ]).reply_markup,
      });
      return;
    }

    const lines = devices.map((d, i) => {
      const ip = d.ipAddress ?? '—';
      return `${i + 1}. <b>${escapeHtml(d.name)}</b>\n   <code>${ip}</code> · <code>${d.id.slice(0, 8)}…</code>`;
    });

    await ctx.reply(
      `📱 <b>Your devices (${devices.length}):</b>\n\n${lines.join('\n\n')}\n\n` +
        `📥 — download .conf, 🗑 — remove.`,
      { parse_mode: 'HTML', reply_markup: devicesKeyboard(devices).reply_markup }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}