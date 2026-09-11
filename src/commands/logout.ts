import { Context } from 'telegraf';
import { clearSession } from '../services/sessions';

export const logoutCommand = async (ctx: Context) => {
    clearSession(ctx.from!.id);
    await ctx.reply( ' Account logout successful.')
}