export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000'  // 开发环境
    : '/api',                   // 生产环境
  TIMEOUT: 30000,              // 请求超时时间
  RETRY_COUNT: 2               // 失败重试次数
}; 