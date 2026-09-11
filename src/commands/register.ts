import { Context } from 'telegraf';
import { registerUser } from '../services/api';
import { setSession } from '../services/sessions';

export const registerCommand = async (ctx: Context) => {
    const text = (ctx.message as any)?.text as string;
    const parts = text.split(' ').slice(1);

    if (parts.length < 2) {
        await ctx.reply('Usage: /register email password\nPassword must be at least 8 characters long.')
        return;
    }

    const [email, password] = parts;

    try {
        const data = await registerUser(email, password);
        setSession(ctx.from!.id, { token: data.token, email: data.user.email });
        await ctx.reply(
            `Registration successful!\nEmail: ${data.user.email}\n\n` +
            `Now you can create a device with the /newdevice command`
        )
    }    catch (error: any) {
        const msg   = error?.response?.data?.message || error.message || 'Unknown error'; 
        await ctx.reply(`Register error: ${msg}`)
    }
}
