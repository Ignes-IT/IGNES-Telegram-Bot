import { Context } from 'telegraf'; 
import { getSession, clearSession } from '../services/sessions';
import { deleteDevice } from '../services/api';

export async function deleteDeviceCommand(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const session = getSession(telegramId);
    if (!session) {
        return ctx.reply('First, log in: /login');
    }

    const text = (ctx.message as any)?.text ?? '';
    const parts = text.split(/\s+/).slice(1);
    const deviceId = parts[0];


    if (!deviceId) {
        return ctx.reply('Usage: /deletedevice <id>\n\nSee IDs: /devices');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(deviceId)) {
        return ctx.reply('Invalid device ID.')
    }

    try {
        await deleteDevice(session.token, deviceId);
        return ctx.reply('Device deleted.\n\nSee list: /devices')
    } catch (err: any) {
        const status = err?.response?.status;
        console.error('deletedevice command error:', status, err?.message);

        if (status === 404) {
            return ctx.reply('Device not found (or not yours).');
        }
        return ctx.reply('Failed to delete device.');
    }
}