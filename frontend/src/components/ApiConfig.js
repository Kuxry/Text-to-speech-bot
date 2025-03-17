import React, { useState } from 'react';
import { Modal, Input, Button, message, Select, Alert, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const REGION_OPTIONS = [
  { value: 'eastus', label: '美国东部' },
  { value: 'japaneast', label: '日本东部' },
  { value: 'southeastasia', label: '东南亚' },
  { value: 'westeurope', label: '西欧' }
];

export default function ApiConfig({ visible, onClose }) {
  const [azureKey, setAzureKey] = useState(localStorage.getItem('azureKey') || '');
  const [region, setRegion] = useState(localStorage.getItem('azureRegion') || 'eastus');

  const handleSave = () => {
    localStorage.setItem('azureKey', azureKey);
    localStorage.setItem('azureRegion', region);
    message.success('配置已保存');
    onClose();
  };

  return (
    <Modal
      title={
        <div className="config-title">
          <span>API 配置</span>
          <Button 
            type="link" 
            icon={<QuestionCircleOutlined />}
            onClick={() => window.open('https://learn.microsoft.com/azure/cognitive-services/speech-service/')}
          >
            帮助文档
          </Button>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="save" type="primary" onClick={handleSave}>保存</Button>
      ]}
    >
      <div className="config-section">
        <Alert 
          type="info" 
          message="如何获取密钥？"
          description={
            <ol className="help-steps">
              <li>登录 <a href="https://portal.azure.com" target="_blank">Azure门户</a></li>
              <li>创建<strong>认知服务-语音</strong>资源</li>
              <li>在密钥管理页复制密钥</li>
            </ol>
          }
        />
      </div>

      <div className="config-item">
        <label>
          Azure 密钥:
          <Tooltip title="32位字母数字组合，示例：d1f3e5g7h9j1k3m5n7p9r1t3v5x7z9">
            <QuestionCircleOutlined className="input-tip" />
          </Tooltip>
        </label>
        <Input.Password
          value={azureKey}
          onChange={(e) => setAzureKey(e.target.value)}
          placeholder="输入32位Azure密钥"
        />
      </div>

      <div className="config-item">
        <label>服务区域:</label>
        <Select
          options={REGION_OPTIONS}
          value={region}
          onChange={setRegion}
          placeholder="选择最近的地理区域"
        />
      </div>

      <div className="config-item">
        <label>服务商:</label>
        <Select
          defaultValue="azure"
          options={[
            { label: 'Azure', value: 'azure' },
            { label: 'Edge', value: 'edge' }
          ]}
        />
      </div>
    </Modal>
  );
} 