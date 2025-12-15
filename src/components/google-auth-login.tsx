import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import supabase from '~core/supabase';

import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import GoogleIcon from './google-icon';

interface GoogleOAuthLoginProps {
  onLoginSuccess?: (user: User) => void;
  onLoginError?: (errorMessage: string) => void;
}

const GoogleAuthLogin: React.FC<GoogleOAuthLoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 构建OAuth2授权URL
  const buildAuthUrl = () => {
    const manifest = chrome.runtime.getManifest();
    const oauth2Config = manifest?.oauth2;
    if (!oauth2Config?.scopes) {
      throw new Error('auth');
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
    // 设置OAuth2参数
    authUrl.searchParams.set('client_id', oauth2Config.client_id);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`);
    authUrl.searchParams.set('scope', oauth2Config.scopes.join(' '));
    
    return authUrl.href;
  };

  const handleLogin = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // 1. 构建认证URL
      const authUrl = buildAuthUrl();
      
      // 2. 使用Chrome Identity API启动Web认证流程
      const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      });

      // 3. 检查Chrome运行时错误
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }

      // 4. 验证重定向URL
      if (!redirectUrl) {
        throw new Error('重定向URL为空');
      }

      // 5. 解析返回的URL，提取id_token
      const url = new URL(redirectUrl);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
      const idToken = hashParams.get('id_token');

      if (!idToken) {
        throw new Error('未获取到ID Token');
      }

      // 6. 使用Supabase进行ID Token认证
      const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken
      });

      if (supabaseError) {
        throw new Error(`登录失败: ${supabaseError.message}`);
      }

      // 7. 登录成功，调用回调函数
      onLoginSuccess?.(data.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'error';
      onLoginError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return <Button 
    onClick={handleLogin}
    size="large"
    color="default"
    style={{ borderRadius: 2 }}
    block
    icon={isLoading ? <LoadingOutlined /> : <GoogleIcon />}
  >
    Login with Google
  </Button>;
};

export default GoogleAuthLogin;