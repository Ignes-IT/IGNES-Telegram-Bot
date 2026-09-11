interface Session {
  token: string;
  email: string;
}

const sessions = new Map<number, Session>();

export const setSession = (telegramId: number, session: Session) => {
  sessions.set(telegramId, session);
};

export const getSession = (telegramId: number): Session | undefined => {
  return sessions.get(telegramId);
};

export const clearSession = (telegramId: number) => {
  sessions.delete(telegramId);
};