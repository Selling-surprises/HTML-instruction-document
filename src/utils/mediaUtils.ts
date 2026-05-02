/**
 * 媒体平台工具函数
 * 用于处理各种视频和音频平台的URL转换
 */

/**
 * 从YouTube URL中提取视频ID
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * 从Bilibili URL中提取视频ID
 */
export function extractBilibiliId(url: string): string | null {
  const patterns = [
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
    /bilibili\.com\/video\/(av\d+)/,
    /b23\.tv\/([a-zA-Z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * 从优酷URL中提取视频ID
 */
export function extractYoukuId(url: string): string | null {
  const pattern = /v\.youku\.com\/v_show\/id_([^.]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * 从腾讯视频URL中提取视频ID
 */
export function extractTencentId(url: string): string | null {
  const patterns = [
    /v\.qq\.com\/x\/cover\/[^/]+\/([^.]+)/,
    /v\.qq\.com\/x\/page\/([^.]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * 从爱奇艺URL中提取视频ID
 */
export function extractIqiyiId(url: string): string | null {
  const pattern = /iqiyi\.com\/v_([^.]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * 从网易云音乐URL中提取歌曲ID
 */
export function extractNeteaseId(url: string): string | null {
  const patterns = [
    /music\.163\.com\/#\/song\?id=(\d+)/,
    /music\.163\.com\/song\?id=(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * 从QQ音乐URL中提取歌曲ID
 */
export function extractQQMusicId(url: string): string | null {
  const patterns = [
    /y\.qq\.com\/n\/yqq\/song\/([^.]+)/,
    /y\.qq\.com\/n\/ryqq\/songDetail\/([^?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * 从Spotify URL中提取曲目ID
 */
export function extractSpotifyId(url: string): string | null {
  const pattern = /spotify\.com\/track\/([^?]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * 生成视频嵌入HTML
 */
export function generateVideoEmbed(url: string, platform: string): string {
  const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  switch (platform) {
    case 'youtube': {
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) return '';
      return `
        <div id="${videoId}" style="margin: 1.5em 0; max-width: 100%; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" contenteditable="false">
          <button class="video-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://www.youtube.com/embed/${youtubeId}?autoplay=0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    
    case 'bilibili': {
      const bilibiliId = extractBilibiliId(url);
      if (!bilibiliId) return '';
      return `
        <div id="${videoId}" style="margin: 1.5em 0; max-width: 100%; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" contenteditable="false">
          <button class="video-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://player.bilibili.com/player.html?bvid=${bilibiliId}&high_quality=1&autoplay=0"
            scrolling="no"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    
    case 'youku': {
      const youkuId = extractYoukuId(url);
      if (!youkuId) return '';
      return `
        <div id="${videoId}" style="margin: 1.5em 0; max-width: 100%; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" contenteditable="false">
          <button class="video-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://player.youku.com/embed/${youkuId}"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    
    case 'tencent': {
      const tencentId = extractTencentId(url);
      if (!tencentId) return '';
      return `
        <div id="${videoId}" style="margin: 1.5em 0; max-width: 100%; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" contenteditable="false">
          <button class="video-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://v.qq.com/txp/iframe/player.html?vid=${tencentId}"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    
    case 'iqiyi': {
      const iqiyiId = extractIqiyiId(url);
      if (!iqiyiId) return '';
      return `
        <div id="${videoId}" style="margin: 1.5em 0; max-width: 100%; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" contenteditable="false">
          <button class="video-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://www.iqiyi.com/common/flashplayer/20150916/player.swf?tvId=${iqiyiId}"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    
    case 'direct':
    default:
      return `
        <div id="${videoId}" style="margin: 1.5em 0; max-width: 100%; position: relative;" contenteditable="false">
          <button class="video-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <video 
            controls 
            style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="${url}"
          >
            您的浏览器不支持视频播放。
          </video>
        </div>
      `;
  }
}

/**
 * 生成音频嵌入HTML
 */
export function generateAudioEmbed(
  url: string, 
  platform: string, 
  metadata?: { title?: string; artist?: string; cover?: string }
): string {
  const audioId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 如果提供了自定义元数据，生成自定义音频播放器
  if (metadata && (metadata.title || metadata.artist || metadata.cover)) {
    const title = metadata.title || '未知歌曲';
    const artist = metadata.artist || '未知艺术家';
    const cover = metadata.cover || '';
    
    return `
      <div id="${audioId}" class="custom-audio-player" style="margin: 1.5em 0; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); position: relative;" contenteditable="false">
        <button class="audio-delete-btn" onclick="event.stopPropagation(); this.closest('.custom-audio-player').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
        <div style="display: flex; gap: 16px; align-items: center;">
          ${cover ? `
            <div style="width: 80px; height: 80px; flex-shrink: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
              <img src="${cover}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : `
            <div style="width: 80px; height: 80px; flex-shrink: 0; border-radius: 8px; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
          `}
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 16px; font-weight: 600; color: white; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</div>
            <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${artist}</div>
            <audio controls style="width: 100%; height: 32px;" src="${url}">
              您的浏览器不支持音频播放。
            </audio>
          </div>
        </div>
      </div>
    `;
  }
  
  // 平台嵌入式播放器
  switch (platform) {
    case 'netease': {
      const songId = extractNeteaseId(url);
      if (!songId) return '';
      return `
        <div id="${audioId}" style="margin: 1.5em 0; max-width: 100%; position: relative;" contenteditable="false">
          <button class="audio-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="width: 100%; max-width: 600px; height: 86px; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=66"
          ></iframe>
        </div>
      `;
    }
    
    case 'qq': {
      const songId = extractQQMusicId(url);
      if (!songId) return '';
      return `
        <div id="${audioId}" style="margin: 1.5em 0; max-width: 100%; position: relative;" contenteditable="false">
          <button class="audio-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="width: 100%; max-width: 600px; height: 86px; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://y.qq.com/n/ryqq/player?songid=${songId}&songtype=0"
          ></iframe>
        </div>
      `;
    }
    
    case 'spotify': {
      const trackId = extractSpotifyId(url);
      if (!trackId) return '';
      return `
        <div id="${audioId}" style="margin: 1.5em 0; max-width: 100%; position: relative;" contenteditable="false">
          <button class="audio-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <iframe 
            style="width: 100%; max-width: 600px; height: 152px; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="https://open.spotify.com/embed/track/${trackId}"
            allow="encrypted-media"
          ></iframe>
        </div>
      `;
    }
    
    case 'direct':
    default:
      return `
        <div id="${audioId}" style="margin: 1.5em 0; max-width: 100%; position: relative;" contenteditable="false">
          <button class="audio-delete-btn" onclick="event.stopPropagation(); this.closest('div').remove();" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; z-index: 10; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(220, 38, 38, 1)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">删除</button>
          <audio 
            controls 
            style="width: 100%; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            src="${url}"
          >
            您的浏览器不支持音频播放。
          </audio>
        </div>
      `;
  }
}
