import { Context } from 'telegraf';
import { loginUser } from '../services/api';
import { setSession } from '../services/sessions';

export const loginCommand = async (ctx: Context) => {
    const text = (ctx.message as any)?.text as string;
    const parts = text.split(' ').slice(1);

    if (parts.length < 2) {
        await ctx.reply('Usage: /login email password');
        return;
    }

    const [ email, password ] = parts;

    try {
        const data = await loginUser(email, password);
        setSession(ctx.from!.id, { token: data.token, email: data.user.email });
        await ctx.reply(` Login successful!\nEmail: ${data.user.email}`);
    } catch (error: any) {
        const msg = error?.response?.data?.message || error.message || 'Unknown Error';
        await ctx.reply(` Login Error: ${msg}`);
    }
}