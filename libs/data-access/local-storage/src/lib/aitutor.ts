const AI_TUTOR_KEY = 'aiTutorCurrentChat';

export const saveCurrentChatToLocal = (messages: any[]) => {
  localStorage.setItem(AI_TUTOR_KEY, JSON.stringify(messages));
};

export const getCurrentChatFromLocal = (): any[] | null => {
  const data = localStorage.getItem(AI_TUTOR_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearCurrentChatFromLocal = () => {
  localStorage.removeItem(AI_TUTOR_KEY);
};

