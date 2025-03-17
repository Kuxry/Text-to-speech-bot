import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';

export default function AudioPreview({ voice }) {
  const previewText = {
    'zh-': '欢迎使用语音合成服务',
    'en-': 'Welcome to text to speech service',
    'ja-': '音声合成サービスへようこそ'
  }[voice.slice(0,3)] || '示例文本';

  return (
    <div className="preview-box">
      <div className="preview-header">
        <PlayCircleOutlined />
        <span>试听效果</span>
      </div>
      <div className="preview-text">{previewText}</div>
    </div>
  );
} 