import CryptoJS from 'crypto-js';

export const encryptKey = (key) => {
  const publicKey = process.env.REACT_APP_PUBLIC_KEY;
  return CryptoJS.AES.encrypt(key, publicKey).toString();
}; 