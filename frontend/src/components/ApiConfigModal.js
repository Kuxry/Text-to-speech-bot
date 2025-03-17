import React, { useState } from 'react';
import { Modal, Input, Button, Form, Select, Alert, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

// 区域选项配置
const REGION_OPTIONS = [
  { value: 'eastus', label: '美国东部 (eastus)' },
  { value: 'eastus2', label: '美国东部2 (eastus2)' },
  { value: 'westus', label: '美国西部 (westus)' },
  { value: 'japaneast', label: '日本东部 (japaneast)' },
  { value: 'southeastasia', label: '东南亚 (southeastasia)' },
  { value: 'westeurope', label: '西欧 (westeurope)' }
];

export default function ApiConfigModal({ visible, onCancel, onSave }) {
  const [form] = Form.useForm();
  
  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSave(values);
      onCancel();
    });
  };

  const [formData, setFormData] = useState({
    azureRegion: "japaneast",
    // ...
  });

  return (
    <Modal
      title={
        <div className="config-title">
          <span>Azure API 配置</span>
          <Button 
            type="link" 
            icon={<QuestionCircleOutlined />}
            onClick={() => window.open('https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices')}
          >
            创建语音资源
          </Button>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>保存</Button>
      ]}
      width={600}
    >
      <Alert
        type="info"
        message="配置指南"
        description={
          <ol style={{ margin: '8px 0 0 20px' }}>
            <li>在Azure门户创建<b>语音服务</b>资源</li>
            <li>在资源密钥页获取84位密钥</li>
            <li>选择与资源创建时相同的区域</li>
          </ol>
        }
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item
          label={
            <span>
              服务密钥
              <Tooltip 
                title={
                  <div style={{ maxWidth: 300 }}>
                    <p>格式要求：</p>
                    <ul>
                      <li>1-120位字母数字组合</li>
                      <li>示例：d1f3e5g7h9j1k3m5n7p9r1t3v5x7z9</li>
                    </ul>
                  </div>
                }
              >
                <QuestionCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </span>
          }
          name="azureKey"
          rules={[
            { required: true, message: '请输入Azure密钥' },
            { pattern: /^[a-zA-Z0-9]{1,120}$/, message: '必须是1-120位字母数字组合' }
          ]}
        >
          <Input.Password 
            placeholder="输入字母数字组合（最长120位）"
            autoComplete="new-password"
          />
        </Form.Item>
        
        <Form.Item
          label="服务区域"
          name="azureRegion"
          rules={[{ required: true, message: '请选择服务区域' }]}
          initialValue="japaneast"
        >
          <Select
            options={REGION_OPTIONS}
            placeholder="选择与资源创建时相同的区域"
            optionFilterProp="label"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

