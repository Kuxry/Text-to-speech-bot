import React, { useState } from 'react';
import axios from 'axios';
import { Slider, Button, Select, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import ReactPlayer from 'react-player';

export default function TTSForm() {
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voice, setVoice] = useState('en-US-AriaNeural');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const voices = [
    { value: 'en-US-AriaNeural', label: 'Aria (English)' },
    { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 (中文)' },
    { value: 'ja-JP-NanamiNeural', label: '七海 (日本語)' },
  ];

  const generateSpeech = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/generate', {
        text,
        voice,
        speed: speed.toFixed(1),
        pitch: pitch.toFixed(1)
      }, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
    } catch (error) {
      message.error('生成失败: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="tts-container">
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
        loading={loading}
        disabled={!text.trim()}
      >
        生成语音
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