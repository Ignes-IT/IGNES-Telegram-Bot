import { Context } from 'telegraf';
import { getSession } from '../services/sessions';
import { getDevices, getSubscription } from '../services/api';
import { getPlanLimit } from '../config/plans';
import { escapeHtml } from '../ui/format';
import { handleApiError } from '../middleware/error';
import { Markup } from 'telegraf';

export async function statusCommand(ctx: Context): Promise<void> {
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
    const endDate = sub?.endDate
      ? new Date(sub.endDate).toLocaleDateString('ru-RU')
      : null;

    const lines = [
      '📊 <b>Account status</b>',
      '',
      `👤 <b>Email:</b> <code>${escapeHtml(s.email)}</code>`,
      `📋 <b>Plan:</b> ${plan}`,
      `📦 <b>Devices:</b> ${devices.length} / ${limit}`,
    ];
    if (endDate) lines.push(`📅 <b>Valid until:</b> ${endDate}`);
    if (plan === 'FREE') {
      lines.push('', '💡 Want more devices? Sign up for a trial in your personal account.');
    }

    await ctx.reply(lines.join('\n'), {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('📱 Devices', 'menu:devices')],
        [Markup.button.callback('⬅️ Menu', 'menu:back')],
      ]).reply_markup,
    });
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}