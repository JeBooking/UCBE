/**
 * 生成和管理设备唯一标识
 */

// 生成浏览器指纹
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // 简单hash函数
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

// 获取或创建设备ID
export async function getDeviceId(): Promise<string> {
  try {
    // 先尝试从Chrome storage获取
    const result = await chrome.storage.local.get(['deviceId']);
    if (result.deviceId) {
      return result.deviceId;
    }
    
    // 如果没有，则生成新的设备ID
    const newDeviceId = generateFingerprint();
    await chrome.storage.local.set({ deviceId: newDeviceId });
    return newDeviceId;
  } catch (error) {
    // 如果Chrome storage不可用，使用localStorage作为备选
    const storageKey = 'universal_comments_device_id';
    let deviceId = localStorage.getItem(storageKey);
    
    if (!deviceId) {
      deviceId = generateFingerprint();
      localStorage.setItem(storageKey, deviceId);
    }
    
    return deviceId;
  }
}

// 获取当前用户名
export async function getCurrentUsername(): Promise<string> {
  try {
    const result = await chrome.storage.local.get(['currentUsername']);
    return result.currentUsername || '';
  } catch (error) {
    return localStorage.getItem('universal_comments_username') || '';
  }
}

// 保存当前用户名
export async function saveCurrentUsername(username: string): Promise<void> {
  try {
    await chrome.storage.local.set({ currentUsername: username });
  } catch (error) {
    localStorage.setItem('universal_comments_username', username);
  }
}
