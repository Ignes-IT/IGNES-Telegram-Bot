import { Context, Markup } from 'telegraf';
import { getSession } from '../services/sessions';
import { mainMenu } from '../ui/menus';
import { escapeHtml } from '../ui/format';

export const startCommand = async (ctx: Context): Promise<void> => {
  const id = ctx.from?.id;
  if (!id) return;

  const s = getSession(id);

  if (s) {
    await ctx.reply(
      `👋 Welcome back, <b>${escapeHtml(s.email)}</b>!\n\nwhat are we doing?`,
      { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup }
    );
    return;
  }

  await ctx.reply(
    [
      '👋 Welcome to <b>IGNES VPN</b>!',
      '',
      'To get started, log in or register.:',
      '• /login email password',
      '• /register email password',
      '',
      'After logging in, all functions will be available: devices, .conf, status.',
    ].join('\n'),
    { parse_mode: 'HTML' }
  );
};