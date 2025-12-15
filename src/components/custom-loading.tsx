import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

interface CustomFullScreenLoadingProps {
  visible: boolean;
  spinnerColor?: string;
  background?: string;
  message?: string;
  spinnerSize?: number;
}

const CustomFullScreenLoading: React.FC<CustomFullScreenLoadingProps> = ({
  visible,
  spinnerColor = '#1890ff',
  background = 'rgba(0, 0, 0, 0.75)',
  message = '加载中...',
  spinnerSize = 48
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <Spin 
        size="large"
        style={{ color: spinnerColor }}
      />
      <Text 
        style={{ 
          marginTop: 16, 
          color: '#fff',
          fontSize: 16 
        }}
      >
        {message}
      </Text>
    </div>
  );
};

export default CustomFullScreenLoading;