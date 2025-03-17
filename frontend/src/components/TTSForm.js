import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Slider, Button, Select, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import ReactPlayer from 'react-player';
import { API_CONFIG } from '../config';
import ApiConfig from './ApiConfig';
import ApiConfigModal from './ApiConfigModal';

export default function TTSForm() {
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voice, setVoice] = useState('en-US-JennyNeural');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);
  const [configVisible, setConfigVisible] = useState(false);
  const [apiConfig, setApiConfig] = useState(
    JSON.parse(localStorage.getItem('azureConfig') || '{}')
  );
  const [error, setError] = useState(null);

  const VOICE_OPTIONS = [
    { value: 'en-US-JennyNeural', label: 'Jenny (English US)' },
    { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 (中文普通话)' },
    { value: 'ja-JP-NanamiNeural', label: '七海 (日本語)' },
  ];

  const generateSpeech = async () => {
    setError(null);
    if (!text.trim()) {
      message.warning('请输入要转换的文本');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/generate', {
        text: text,
        voice: voice,
        azure_key: apiConfig.azureKey,
        azure_region: apiConfig.azureRegion || 'japaneast'
      }, {
        responseType: 'arraybuffer',  // 确保二进制数据接收
        headers: {
          'Content-Type': 'application/json'  // 明确指定请求头
        }
      });
      
      // 创建Blob时明确指定MIME类型
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      message.success('生成成功');
    } catch (error) {
      console.error('API请求错误:', error);
      setError('生成失败，请检查配置');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (values) => {
    localStorage.setItem('azureConfig', JSON.stringify(values));
    setApiConfig(values);
  };

  return (
    <div className="tts-container">
      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={() => setError(null)}>关闭</button>
        </div>
      )}

      <Button 
        style={{ position: 'absolute', top: 20, right: 20 }}
        onClick={() => setConfigVisible(true)}
      >
        API 配置
      </Button>

      <ApiConfigModal
        visible={configVisible}
        onCancel={() => setConfigVisible(false)}
        onSave={handleSaveConfig}
      />

      <h1>文本转语音系统</h1>
      
      <div className="input-section">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要转换的文本（最多1000字符）"
          maxLength={1000}
        />
      </div>

      <div className="controls">
        <div className="param-control">
          <label>语速:</label>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={speed}
            onChange={setSpeed}
            tipFormatter={v => v.toFixed(1)}
          />
        </div>

        <div className="param-control">
          <label>音调:</label>
          <Slider
            min={0.5}
            max={1.5}
            step={0.1}
            value={pitch}
            onChange={setPitch}
            tipFormatter={v => v.toFixed(1)}
          />
        </div>

        <div className="param-control">
          <label>发音人:</label>
          <Select
            options={VOICE_OPTIONS}
            value={voice}
            onChange={setVoice}
            style={{ width: 200 }}
          />
        </div>
      </div>

      <Button 
        type="primary" 
        onClick={generateSpeech}
        disabled={loading || !text.trim()}
      >
        {loading ? '生成中...' : '开始生成'}
      </Button>

      {audioUrl && (
        <div className="audio-player">
          <ReactPlayer
            url={audioUrl}
            controls
            width="100%"
            height="50px"
          />
        </div>
      )}
    </div>
  );
} 