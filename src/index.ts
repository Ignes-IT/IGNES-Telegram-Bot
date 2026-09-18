import { Telegraf } from 'telegraf';
import { env } from './config/env';
import { startCommand } from './commands/start';
import { registerCommand } from './commands/register';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { newDeviceCommand } from './commands/newdevice';
import { getConfigCommand } from './commands/getconfig';
import { devicesCommand } from './commands/devices';
import { deleteDeviceCommand } from './commands/deletedevice'

const bot = new Telegraf(env.botToken);

bot.start(startCommand);
bot.command('register', registerCommand);
bot.command('login', loginCommand);
bot.command('newdevice', newDeviceCommand);
bot.command('getconfig', getConfigCommand);
bot.command('devices', devicesCommand);
bot.command('logout', logoutCommand);
bot.command('deletedevice', deleteDeviceCommand);

bot.telegram.getMe().then((botInfo) => {
  console.log(`Bot started: @${botInfo.username}`);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));