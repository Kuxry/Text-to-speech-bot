import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import TTSForm from './components/TTSForm';
import 'antd/dist/antd.css';

const { Header, Content } = Layout;

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ color: 'white', fontSize: '20px' }}>
          TTS语音生成系统
        </Header>
        <Content style={{ padding: '50px 20%' }}>
          <TTSForm />
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App; 