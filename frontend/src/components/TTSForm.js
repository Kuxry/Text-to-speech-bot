import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Slider, Button, Select, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import ReactPlayer from 'react-player';
import { API_CONFIG } from '../config';
import ApiConfig from './ApiConfig';

export default function TTSForm() {
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voice, setVoice] = useState('en-US-AriaNeural');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);
  const [configVisible, setConfigVisible] = useState(false);

  const voices = [
    { value: 'en-US-AriaNeural', label: 'Aria (English)' },
    { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 (中文)' },
    { value: 'ja-JP-NanamiNeural', label: '七海 (日本語)' },
  ];

  const generateSpeech = async () => {
    if (!text.trim()) {
      message.warning('请输入要转换的文本');
      return;
    }

    setLoading(true);
    try {
      // 取消之前的请求
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();

      const response = await axios.post('/api/generate', {
        text: text.trim(),
        voice,
        speed,
        pitch,
        api_key: localStorage.getItem('azureKey') || '',
        region: localStorage.getItem('azureRegion') || 'eastus'
      }, {
        responseType: 'blob',
        signal: controllerRef.current.signal,
        timeout: API_CONFIG.TIMEOUT
      });
      
      const url = URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
      message.success('生成成功');
    } catch (error) {
      if (error.response) {
        switch(error.response.status) {
          case 400:
            message.error('请求参数错误：' + error.response.data.detail);
            break;
          case 403:
            message.error('API密钥无效或配额不足');
            break;
          case 500:
            message.error('服务器处理失败，请检查控制台');
            break;
          default:
            message.error(`请求失败：${error.message}`);
        }
      } else {
        message.error('网络连接失败，请检查API地址');
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  return (
    <div className="tts-container">
      <Button 
        style={{ position: 'absolute', top: 20, right: 20 }}
        onClick={() => setConfigVisible(true)}
      >
        API 配置
      </Button>

      <ApiConfig 
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
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
            options={voices}
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