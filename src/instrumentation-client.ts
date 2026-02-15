// This file is normally used for setting up analytics and other
// services that require one-time initialization on the client.

import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { init } from './core/init';
import { mockEnv } from './mockEnv';

// Проверяем если мы на админской странице - не инициализируем Telegram SDK
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
  console.log('Admin route detected - skipping Telegram SDK initialization');
} else {
  mockEnv().then(() => {
    let platform = 'android';
    let debug = process.env.NODE_ENV === 'development';

    try {
      const launchParams = retrieveLaunchParams();
      platform = launchParams.tgWebAppPlatform || 'android';
      debug = debug || (launchParams.tgWebAppStartParam || '').includes('debug');
    } catch (e) {
      console.log('Launch params not available:', e);
    }

    // Configure all application dependencies.
    init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });
  });
}
