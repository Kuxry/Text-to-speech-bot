import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Slider, Button, Select, message } from 'antd';
import { SoundOutlined, StarFilled, SearchOutlined } from '@ant-design/icons';
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
    {
      category: '中文（高级神经语音）',
      pro: true,
      options: [
        { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 - 年轻女性（多情感）' },
        { value: 'zh-CN-YunyangNeural', label: '云扬 - 新闻播报（专业）' },
        { value: 'zh-CN-YunxiNeural', label: '云希 - 青年男性（风格多变）' },
      ]
    },
    {
      category: '中文（标准语音）',
      pro: false,
      options: [
        { value: 'zh-CN-HuihuiRUS', label: '慧慧 - 普通女声' },
        { value: 'zh-CN-Kangkang', label: '康康 - 普通男声' },
        { value: 'zh-CN-Yaoyao', label: '瑶瑶 - 儿童女声' },
      ]
    },
    {
      category: '英语（高级神经语音）',
      pro: true,
      options: [
        { value: 'en-US-JennyNeural', label: 'Jenny - 多情感女声' },
        { value: 'en-US-GuyNeural', label: 'Guy - 新闻男声' },
        { value: 'en-US-AriaNeural', label: 'Aria - 自然对话' },
      ]
    },
    {
      category: '日语（高级神经语音）',
      pro: true,
      options: [
        { value: 'ja-JP-NanamiNeural', label: '七海 - 女性（情感丰富）' },
        { value: 'ja-JP-KeitaNeural', label: '庆太 - 男性（专业）' },
      ]
    }
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
            showSearch
            optionFilterProp="children"
            style={{ width: '100%', maxWidth: 500 }}
            dropdownStyle={{ maxWidth: 600 }}
            dropdownMatchSelectWidth={false}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            options={VOICE_OPTIONS.map(group => ({
              label: (
                <div className="voice-category">
                  <span>{group.category}</span>
                  {group.pro && <span className="pro-badge">PRO</span>}
                </div>
              ),
              options: group.options.map(opt => ({
                ...opt,
                label: (
                  <div className="voice-option">
                    <span>{opt.label}</span>
                    {group.pro && <StarFilled style={{ color: '#ffc53d', marginLeft: 8 }} />}
                  </div>
                )
              }))
            }))}
            value={voice}
            onChange={setVoice}
            dropdownRender={menu => (
              <div>
                <div style={{ padding: '8px 12px', background: '#fafafa' }}>
                  <SearchOutlined /> 支持中/英/日语音搜索
                </div>
                {menu}
              </div>
            )}
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