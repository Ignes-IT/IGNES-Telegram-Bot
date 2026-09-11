import { Telegraf } from 'telegraf';
import { env } from './config/env';
import { startCommand } from './commands/start';
import { registerCommand } from './commands/register';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { newDeviceCommand } from './commands/newdevice';
import { getConfigCommand } from './commands/getconfig';

const bot = new Telegraf(env.botToken);

bot.start(startCommand);
bot.command('register', registerCommand);
bot.command('login', loginCommand);
bot.command('newdevice', newDeviceCommand);
bot.command('getconfig', getConfigCommand);

bot.launch().then(() => {
    console.log(' Bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));