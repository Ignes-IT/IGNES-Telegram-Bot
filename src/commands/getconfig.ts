import { Context } from 'telegraf';
import { getSession } from '../services/api'
import { getConfig } from '../services/sessions';

export const getConfigCommand = async (ctx: Context) => {
    const session = getSession(ctx.from!.id);
    if (!session) {
        await ctx.reply('Log in with the /login command.');
        return;
    }

    const text = (ctx.message sa any)?.text as string;
    const parts = text.split(' ').slice(1);

    if (parts.length < 1) {
        await ctx.reply('Usage: /getconfig <device_id>');
        return;
    }

    const deviceId = parts[0];

    try {
        const config = await getConfig(deviceId);
        await ctx.replyWithDocument(
            {source: Buffer.from(config, ' utf-8'), filename: `wg-${deviceId}.conf` },
            {caption: ` Your WireGuard Config`}
        );
    } catch (error: any) {
        const msg  error?.response?.data?.message || error.message || 'Unknown Error';
        await ctx.reply(` Error: ${msg}`);
    }
};
