import { Context } from 'telegraf';
import { getSession } from '../services/api';
import { createDevice } from '../services/sessions';

export const newDeviceCommand = async (ctx: Context) => {
    const session = getSession(ctx.from!.id);
    if (!session) {
        await ctx.reply('First, log in with the /login command.');
        return;
    }

    const name = 'Device ' + new Date().toLocaleString();

    try {
        const data = await createDevice(session.token, name);
        await ctx.reply(
            `✅ Device created!\n` +
            `ID: \`${data.deviceId}\`\n` +
            `Public key: \`${data.publicKey}\`\n\n` +
            `Get config: /getconfig ${data.deviceId}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error: any) {
        const msg = error?.response?.data?.message || error.message || 'Unknown Error';
        await ctx.reply(` Error: ${msg}`);
    }
};