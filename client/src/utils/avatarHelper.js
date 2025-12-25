export const getSelectedAvatar = (user) => {
  if (!user) return '';
  
  if (user.avatarPreference === 'custom' && user.avatar) {
    return user.avatar;
  }
  
  return user.identicon || '';
};
