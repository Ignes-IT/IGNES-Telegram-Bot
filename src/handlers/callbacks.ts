import { Context, Markup } from 'telegraf';
import { getSession, clearSession, setPending } from '../services/sessions';
import { getDevices, getConfig, deleteDevice, deleteUser, getSubscription, mockUpgrade, getMe } from '../services/api';
import { mainMenu, devicesKeyboard, confirmDeleteKeyboard } from '../ui/menus';
import { escapeHtml, truncate } from '../ui/format';
import { getPlanLimit } from '../config/plans';
import { handleApiError } from '../middleware/error';
import { deleteUserCommand } from '../commands/deleteuser';

async function safeEdit(ctx: Context, text: string, extra: any = {}): Promise<void> {
  try {
    await ctx.editMessageText(text, extra);
  } catch (err: any) {
    if (err?.description?.includes('message is not modified')) return;
    await ctx.reply(text, extra);
  }
}

async function showMenu(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);

  if (!s) {
    await safeEdit(ctx, '🔒 Log in first:\n/login email password', {
      parse_mode: 'HTML',
    });
    return;
  }

  await safeEdit(
    ctx,
    `🏠 <b>Main menu</b>\n\n👤 <code>${escapeHtml(s.email)}</code>`,
    { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup }
  );
}

async function showDevices(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await safeEdit(ctx, '🔒 Log in first: /login');
    return;
  }

  try {
    const devices = await getDevices(s.token);
    
    if (devices.length === 0) {
      await safeEdit(ctx, '📭 You dont have any devices yet.', {
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('➕ Create', 'menu:create')],
          [Markup.button.callback('🗑 Delete account', 'user:show_delete')],
          [Markup.button.callback('⬅️ Menu', 'menu:back')],
        ]).reply_markup,
      });
      return;
    }

    const lines = devices.map((d, i) => {
      const ip = d.ipAddress ?? '—';
      return `${i + 1}. <b>${escapeHtml(d.name)}</b>\n   <code>${ip}</code> · <code>${d.id.slice(0, 8)}…</code>`;
    });

    await safeEdit(
      ctx,
      `📱 <b>Your Devices (${devices.length}):</b>\n\n${lines.join('\n\n')}\n\n` +
        `📥 — download .conf, 🗑 — delete.`,
      { parse_mode: 'HTML', reply_markup: devicesKeyboard(devices).reply_markup }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function showStatus(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await safeEdit(ctx, '🔒 Log in first: /login');
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
      lines.push('', '💡 Want more devices? Tap 💳 Subscription in the menu.');
    }

    await safeEdit(ctx, lines.join('\n'), {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('💳 Subscription', 'menu:subscription')],
        [Markup.button.callback('📱 Devices', 'menu:devices')],
        [Markup.button.callback('⬅️ Menu', 'menu:back')],
      ]).reply_markup,
    });
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function showWhoami(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await safeEdit(ctx, '🔒 Log in first: /login');
    return;
  }

  try {
    const me = await getMe(s.token);
    const created = me.createdAt
      ? new Date(me.createdAt).toLocaleDateString('ru-RU')
      : '—';

    await safeEdit(
      ctx,
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
          [Markup.button.callback('🗑 Delete account', 'user:show_delete')],
          [Markup.button.callback('🚪 Logout', 'menu:logout')],
          [Markup.button.callback('⬅️ Menu', 'menu:back')],
        ]).reply_markup,
      }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function showHelp(ctx: Context): Promise<void> {
  await safeEdit(
    ctx,
    [
      '❓ <b>Help</b>',
      '',
      '<b>Commands:</b>',
      '/start — Main Menu',
      '/status — Tariff and limits',
      '/whoami — Profile',
      '/devices — Devices',
      '/newdevice — Create device',
      '/cancel — Cancel current dialog',
      '/login — Login',
      '/register — Register',
      '/logout — Logout',
      '',
      '💡 <b>VPN connection:</b>',
      '1. Create device',
      '2. Download .conf',
      '3. Import into the AmneziaWG client',
      '4. Connect → check: <code>curl ifconfig.me</code>',
    ].join('\n'),
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Menu', 'menu:back')],
      ]).reply_markup,
    }
  );
}

async function showSubscription(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await safeEdit(ctx, '🔒 Log in first: /login');
    return;
  }

  try {
    await mockUpgrade(s.token);
    const sub = await getSubscription(s.token);

    const plan = sub?.plan ?? 'PRO';
    const limit = getPlanLimit(plan);
    const endDate = sub?.endDate
      ? new Date(sub.endDate).toLocaleDateString('ru-RU')
      : 'unlimited';

    await safeEdit(
      ctx,
      [
        '✅ <b>Plan upgraded!</b>',
        '',
        `📋 <b>Plan:</b> ${plan}`,
        `📦 <b>Device limit:</b> ${limit}`,
        `📅 <b>Valid until:</b> ${endDate}`,
        '',
        '<i>Test mode — no payment was charged.</i>',
      ].join('\n'),
      { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function startCreate(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await safeEdit(ctx, '🔒 Log in first: /login');
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
      await safeEdit(
        ctx,
        `⛔ <b>Device limit:</b> ${devices.length}/${limit} (plan ${plan}).\n\n` +
          `Delete device (🗑 in /devices) or upgrade plan.`,
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('💳 Subscription', 'menu:subscription')],
            [Markup.button.callback('⬅️ Menu', 'menu:back')],
          ]).reply_markup,
        }
      );
      return;
    }

    setPending(id, { type: 'deviceName' });
    await safeEdit(
      ctx,
      '➕ <b>Creating a device</b>\n\n' +
        'Submit a name (eg: "iPhone", "Work Laptop").\n' +
        'or /cancel to cancel.',
      { parse_mode: 'HTML' }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function downloadConfig(ctx: Context, deviceId: string): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) return;

  try {
    const devices = await getDevices(s.token);
    const device = devices.find((d) => d.id === deviceId);

    const config = await getConfig(s.token, deviceId);
    const safeName = (device?.name ?? deviceId).replace(/[^\w.-]+/g, '-');
    await ctx.replyWithDocument(
      { source: Buffer.from(config, 'utf-8'), filename: `${safeName}.conf` },
      { caption: `📄 ${device?.name ?? deviceId}\nIP: ${device?.ipAddress ?? '—'}` }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function confirmDelete(ctx: Context, deviceId: string): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) return;

  try {
    const devices = await getDevices(s.token);
    const device = devices.find((d) => d.id === deviceId);
    if (!device) {
      await safeEdit(ctx, '❓ Device not found.', {
        reply_markup: mainMenu().reply_markup,
      });
      return;
    }

    await safeEdit(
      ctx,
      `🗑 <b>Remove Device?</b>\n\n` +
        `<b>${escapeHtml(device.name)}</b>\n` +
        `IP: <code>${escapeHtml(device.ipAddress ?? '—')}</code>\n\n` +
        `⚠️ The tunnel will stop working. The client .conf file will become invalid.`,
      {
        parse_mode: 'HTML',
        reply_markup: confirmDeleteKeyboard(deviceId).reply_markup,
      }
    );
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}

async function performDelete(ctx: Context, deviceId: string): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) return;

  try {
    await deleteDevice(s.token, deviceId);
    await safeEdit(
      ctx,
      '✅ <b>Device removed.</b>',
      { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup }
    );
  } catch (err: any) {
    if (err?.response?.status === 404) {
      await safeEdit(ctx, '❓ Device not found (may have already been deleted).', {
        reply_markup: mainMenu().reply_markup,
      });
      return;
    }
    await handleApiError(ctx, err);
  }
}

async function logoutUser(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  clearSession(id);
  await safeEdit(ctx, '👋 You have been logged out of your account.\n\n/login email password', {
    parse_mode: 'HTML',
  });
}

async function performUserDelete(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await safeEdit(ctx, '🔒 Session expired. /login');
    return;
  }

  await safeEdit(ctx, '⏳ Deleting devices and account…');

  try {
    const devices = await getDevices(s.token);

    for (const device of devices) {
      try {
        await deleteDevice(s.token, device.id);
      } catch (err: any) {
        await safeEdit(
          ctx,
          `❌ Failed to remove device "<b>${escapeHtml(device.name)}</b>".\n\n` +
            `Account <b>NOT</b> deleted. Retry: /deleteuser`,
          { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup },
        );
        return;
      }
    }

    await deleteUser(s.token);
    clearSession(id);

    await safeEdit(
      ctx,
      '✅ <b>Account deleted.</b>\n\nYou can register again: /register',
      { parse_mode: 'HTML' },
    );
  } catch (err: any) {
    if (err?.response?.status === 409) {
      await safeEdit(
        ctx,
        '⚠️ <b>New device appeared while deleting.</b>\n\nRetry: /deleteuser',
        { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup },
      );
      return;
    }
    await handleApiError(ctx, err);
  }
}

async function cancelUserDelete(ctx: Context): Promise<void> {
  await safeEdit(
    ctx,
    '❌ <b>Account deletion cancelled.</b>',
    { parse_mode: 'HTML', reply_markup: mainMenu().reply_markup },
  );
}


export async function callbackHandler(ctx: Context): Promise<void> {
  try {
    const data = (ctx.callbackQuery as any)?.data as string | undefined;
    if (!data) return;

    const [ns, ...rest] = data.split(':');

    if (ns === 'menu') {
      switch (rest[0]) {
        case 'back':
          return await showMenu(ctx);
        case 'devices':
          return await showDevices(ctx);
        case 'create':
          return await startCreate(ctx);
        case 'status':
          return await showStatus(ctx);
        case 'subscription':
          return await showSubscription(ctx);
        case 'whoami':
          return await showWhoami(ctx);
        case 'help':
          return await showHelp(ctx);
        case 'logout':
          return await logoutUser(ctx);
        default:
          return;
      }
    }

    if (ns === 'dev') {
      const [deviceId, action] = rest;
      if (!deviceId || !action) return;
      if (action === 'download') return await downloadConfig(ctx, deviceId);
      if (action === 'confirm_delete') return await confirmDelete(ctx, deviceId);
      if (action === 'delete') return await performDelete(ctx, deviceId);
    }

    if (ns === 'user') {
      if (rest[0] === 'show_delete') return await deleteUserCommand(ctx);
      if (rest[0] === 'confirm_delete') return await performUserDelete(ctx);
      if (rest[0] === 'cancel_delete') return await cancelUserDelete(ctx);
      return;
    }

  } catch (err: any) {
    console.error('callback error:', err);
  } finally {
    try {
      await ctx.answerCbQuery();
    } catch {}
  }
}