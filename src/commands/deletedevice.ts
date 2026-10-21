import { Context } from 'telegraf';
import { getSession } from '../services/sessions';
import { deleteDevice } from '../services/api';
import { handleApiError } from '../middleware/error';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteDeviceCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;
  const s = getSession(id);
  if (!s) {
    await ctx.reply('🔒 Log in first: /login email password');
    return;
  }

  const text = (ctx.message as any)?.text ?? '';
  const deviceId = text.split(/\s+/).slice(1)[0];

  if (!deviceId) {
    await ctx.reply(
      'To delete a device, open /devices and click the 🗑 next to the desired one.\n\n' + 
      'Direct command (legacy): /deletedevice <id>'
    );
    return;
  }

  if (!UUID_RE.test(deviceId)) {
    await ctx.reply('❌ Invalid ID format (expected UUID)).');
    return;
  }

  try {
    await deleteDevice(s.token, deviceId);
    await ctx.reply('✅ Device removed.\n\nList: /devices');
  } catch (err: any) {
    await handleApiError(ctx, err);
  }
}