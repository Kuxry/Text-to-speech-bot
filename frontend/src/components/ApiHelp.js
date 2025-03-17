function ApiHelp() {
  return (
    <div className="api-help">
      <h3>如何获取Azure密钥？</h3>
      <ol>
        <li>访问 <a href="https://portal.azure.com" target="_blank">Azure门户</a></li>
        <li>创建语音服务资源</li>
        <li>在"密钥和终结点"中获取密钥</li>
      </ol>
      <img src="/azure-key-screenshot.png" alt="Azure密钥位置示意图" />
    </div>
  );
} 