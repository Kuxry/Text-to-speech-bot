// 安全存储实现
const secureStorage = {
  set(key, value) {
    const encrypted = encrypt(value, process.env.REACT_APP_SECRET);
    localStorage.setItem(key, encrypted);
  },
  get(key) {
    const encrypted = localStorage.getItem(key);
    return encrypted ? decrypt(encrypted, process.env.REACT_APP_SECRET) : null;
  }
}; 