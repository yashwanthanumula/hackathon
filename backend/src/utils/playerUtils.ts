import crypto from 'crypto';

export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateGuestName = (): string => {
  const adjectives = [
    'Happy', 'Clever', 'Brave', 'Gentle', 'Wise', 'Swift', 'Bright', 'Cool',
    'Daring', 'Eager', 'Fancy', 'Grand', 'Jolly', 'Kind', 'Lucky', 'Mighty',
    'Noble', 'Proud', 'Quick', 'Sharp', 'Witty', 'Zesty'
  ];
  
  const nouns = [
    'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Bear', 'Lion',
    'Hawk', 'Shark', 'Dragon', 'Phoenix', 'Wizard', 'Knight', 'Ninja', 'Pirate',
    'Ranger', 'Sage', 'Hero', 'Champion', 'Master', 'Player'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${adjective}${noun}${number}`;
};