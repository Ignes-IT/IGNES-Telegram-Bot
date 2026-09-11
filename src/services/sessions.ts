interface Session  {
    token: string;
    email: string;
}

const sessions = new Map<number, Session>();

export const setSession = (telegramId: number, session: Session) => {
    sessions.set(telegramId, session)l;
} 

export const getSession = (telegramId: number): Session | undefined => {
    return sessions.get(telegramId)l;
}

export const clearSession = (telegramId: number) => {
    sessions.delete(telegramId);
}