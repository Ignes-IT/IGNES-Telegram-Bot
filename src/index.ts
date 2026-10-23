import { Telegraf } from 'telegraf';
import { env } from './config/env';
import { startCommand } from './commands/start';
import { registerCommand } from './commands/register';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { devicesCommand } from './commands/devices';
import { newDeviceCommand } from './commands/newdevice';
import { getConfigCommand } from './commands/getconfig';
import { deleteDeviceCommand } from './commands/deletedevice';
import { statusCommand } from './commands/status';
import { whoamiCommand } from './commands/whoami';
import { cancelCommand } from './commands/cancel';
import { deleteUserCommand } from './commands/deleteuser';
import { callbackHandler } from './handlers/callbacks';
import { textHandler } from './handlers/text';
import { clearPending } from './services/sessions';
import { setupErrorHandler } from './middleware/error';

const bot = new Telegraf(env.botToken);

setupErrorHandler(bot);

bot.use(async (ctx, next) => {
  if (ctx.message && 'text' in ctx.message) {
    const text = (ctx.message as any).text as string;
    if (text.startsWith('/')) {
      const id = ctx.from?.id;
      if (id) clearPending(id);
    }
  }
  return next();
});

bot.start(startCommand);
bot.command('menu', startCommand);
bot.command('status', statusCommand);
bot.command('whoami', whoamiCommand);
bot.command('devices', devicesCommand);
bot.command('newdevice', newDeviceCommand);
bot.command('getconfig', getConfigCommand);
bot.command('deletedevice', deleteDeviceCommand);
bot.command('deleteuser', deleteUserCommand);
bot.command('cancel', cancelCommand);
bot.command('register', registerCommand);
bot.command('login', loginCommand);
bot.command('logout', logoutCommand);

bot.on('callback_query', callbackHandler);
bot.on('text', textHandler); 

bot.telegram
  .getMe()
  .then((info) => console.log(`Bot started: @${info.username}`))
  .catch((err) => console.error('getMe failed:', err));

bot.launch().catch((err) => {
  console.error('Failed to launch bot:', err);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));