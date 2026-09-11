import { Context } from 'telegraf';

export const startCommand = async (ctx: Context) => {
    await ctx.reply(
        'Welcome to IGNES VPN!\n\n' +
        'Available commands:\n' +
        '/register — register\n' +
        '/login — log in to an existing account\n' +
        '/devices — list of devices\n' +
        '/newdevice — create a new device\n' +
        '/logout — log out'
    )
}