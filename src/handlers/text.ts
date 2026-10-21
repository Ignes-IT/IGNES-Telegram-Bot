import { Context } from 'telegraf';
import { getSession, clearPending } from '../services/sessions';
import { createDevice, getDevices } from '../services/api';
import { escapeHtml } from '../ui/format';
import { handleApiError } from '../middleware/error';
import { Markup } from 'telegraf';

async function handleCreateDevice( ctx: Context, name: string): Promise<void> {
    const id = ctx.from!.id;
    const s = getSession(id);
    if (!s) return;

    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 64) {
        await ctx.reply('Name must be between 1 and 64 characters. Try again or /cancel.');
        return;
    }

    clearPending(id);

    try {
        const created = await createDevice(s.token, trimmed);

        let ip = '-';
        try {
            const devices = await getDevices(s.token);
            const d = devices.find((x) => x.id === created.deviceId);
            if (d?.ipAddress) ip = d.ipAddress;
        } catch {}

        await ctx.reply(
            [
                '✅ <b>Device created!</b>',
                '',
                `<b>Name:</b> ${escapeHtml(trimmed)}`,
                `<b>IP:</b> <code>${escapeHtml(ip)}</code>`,
                `<b>ID:</b> <code>${created.deviceId}</code>`,                
            ].join('\n'),
            {
                parse_mode: 'HTML',
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback('📥 Download .conf', `dev:${created.deviceId}:download`)],
                    [Markup.button.callback('📱 Back to list', 'menu:devices')],
                ]).reply_markup,
            }
        );
    } catch (err: any) {
        await handleApiError(ctx, err);
    }
}

export async function textHandler(ctx: Context): Promise<void> {
    const id = ctx.from?.id;
    if (!id) return;

    const s = getSession(id);
    if (!s?.pending) return;

    const text = (ctx.message as any)?.text as string | undefined;
    if (!text) return;

    if (text.startsWith('/')) return;

    if (s.pending.type === 'deviceName') {
        await handleCreateDevice(ctx, text);
    }
}