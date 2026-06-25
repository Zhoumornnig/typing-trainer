import { useState, useRef, useEffect, useCallback } from 'react';
import './MusicPlayer.css';

// 默认背景音乐（public/music/default.mp3）
const DEFAULT_SONG = {
  name: '🎵 默认背景音乐',
  url: import.meta.env.BASE_URL + 'music/default.mp3',
};

// 从 localStorage 读取歌单，首次使用自动加载默认歌曲
function loadPlaylist() {
  try {
    const saved = localStorage.getItem('typing-playlist');
    if (saved) {
      const list = JSON.parse(saved);
      if (list.length > 0) return list;
    }
  } catch {}
  // 首次使用：预置默认歌曲
  return [DEFAULT_SONG];
}

function savePlaylist(list) {
  try {
    localStorage.setItem('typing-playlist', JSON.stringify(list));
  } catch {}
}

function MusicPlayer({ visible, onClose }) {
  const [playlist, setPlaylist] = useState(loadPlaylist);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const audioRef = useRef(null);
  const fileRef = useRef(null);

  const currentSong = playlist[currentIdx];

  // 保存歌单
  useEffect(() => {
    savePlaylist(playlist);
  }, [playlist]);

  // 打开播放器时自动播放第一首歌
  useEffect(() => {
    if (currentIdx === -1 && playlist.length > 0) {
      playIndex(0);
    }
  }, []); // 只在挂载时触发

  // 切歌
  const playIndex = useCallback((idx) => {
    if (idx < 0 || idx >= playlist.length) return;
    setCurrentIdx(idx);
    setIsPlaying(true);
    // 等 audio src 更新后自动播放
    setTimeout(() => {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    }, 100);
  }, [playlist.length]);

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  // 上一首
  const prev = () => {
    if (playlist.length === 0) return;
    const idx = currentIdx <= 0 ? playlist.length - 1 : currentIdx - 1;
    playIndex(idx);
  };

  // 下一首
  const next = () => {
    if (playlist.length === 0) return;
    const idx = currentIdx >= playlist.length - 1 ? 0 : currentIdx + 1;
    playIndex(idx);
  };

  // 歌曲结束自动下一首
  const handleEnded = () => {
    if (playlist.length > 1) next();
    else setIsPlaying(false);
  };

  // 时间更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  // 进度条拖拽
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = pct * duration;
    }
  };

  // 添加 URL 歌曲
  const addUrlSong = () => {
    const url = urlInput.trim();
    const name = nameInput.trim() || url.split('/').pop() || '未命名';
    if (!url) return;
    setPlaylist((prev) => {
      const updated = [...prev, { name, url }];
      if (prev.length === 0) {
        // 第一首歌，自动播放
        setTimeout(() => playIndex(0), 0);
      }
      return updated;
    });
    setUrlInput('');
    setNameInput('');
    setShowAdd(false);
  };

  // 本地上传
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      alert('请选择音频文件');
      return;
    }
    const url = URL.createObjectURL(file);
    setPlaylist((prev) => {
      const updated = [...prev, { name: file.name, url }];
      if (prev.length === 0) {
        setTimeout(() => playIndex(0), 0);
      }
      return updated;
    });
  };

  // 删除歌曲
  const removeSong = (idx) => {
    setPlaylist((prev) => prev.filter((_, i) => i !== idx));
    if (idx === currentIdx) {
      setIsPlaying(false);
      setCurrentIdx(-1);
    } else if (idx < currentIdx) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // 格式化时间
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* 隐藏的 audio 元素 — 始终渲染，保持播放 */}
      <audio
        ref={audioRef}
        src={currentSong?.url || ''}
        autoPlay
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => {
          // 音频就绪后尝试播放
          audioRef.current?.play().catch(() => {});
        }}
      />

      {/* UI 面板 — 只在 visible 时显示 */}
      {visible && (
      <div className="music-player">

        {/* 顶部栏 */}
        <div className="mp-header">
          <span className="mp-title">🎵 音乐</span>
          <div className="mp-header-actions">
            <button className="mp-btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加歌曲">➕</button>
            <button className="mp-btn-icon" onClick={onClose} title="关闭">✕</button>
          </div>
        </div>

      {/* 添加歌曲面板 */}
      {showAdd && (
        <div className="mp-add-panel">
          <input
            className="mp-input"
            placeholder="歌曲名称"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            className="mp-input"
            placeholder="音频文件 URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addUrlSong(); }}
          />
          <div className="mp-add-actions">
            <button className="mp-btn-sm mp-btn-primary" onClick={addUrlSong}>添加</button>
            <input ref={fileRef} type="file" accept="audio/*" className="mp-file-input" onChange={handleFileUpload} />
            <button className="mp-btn-sm mp-btn-outline" onClick={() => fileRef.current?.click()}>📁 本地文件</button>
          </div>
        </div>
      )}

      {/* 当前播放信息 */}
      {currentSong && (
        <>
          <div className="mp-now-playing">
            <div className="mp-song-name">{currentSong.name}</div>
            <div className="mp-time">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mp-progress-bar" onClick={handleSeek}>
            <div className="mp-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* 控制按钮 */}
          <div className="mp-controls">
            <button className="mp-btn-ctrl" onClick={prev} title="上一首">⏮</button>
            <button className="mp-btn-play" onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
              {isPlaying ? '⏸' : '▶️'}
            </button>
            <button className="mp-btn-ctrl" onClick={next} title="下一首">⏭</button>
          </div>

          {/* 音量 */}
          <div className="mp-volume">
            <span>🔊</span>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="mp-volume-slider"
            />
          </div>
        </>
      )}

      {/* 歌单 */}
      <div className="mp-playlist">
        {playlist.length === 0 ? (
          <p className="mp-empty">歌单空空，点击 ➕ 添加歌曲</p>
        ) : (
          playlist.map((song, idx) => (
            <div
              key={idx}
              className={`mp-song-item ${idx === currentIdx ? 'active' : ''}`}
              onClick={() => playIndex(idx)}
            >
              <span className="mp-song-idx">{idx === currentIdx && isPlaying ? '🔊' : idx + 1}</span>
              <span className="mp-song-title">{song.name}</span>
              <button
                className="mp-btn-del"
                onClick={(e) => { e.stopPropagation(); removeSong(idx); }}
                title="删除"
              >🗑</button>
            </div>
          ))
        )}
      </div>
    </div>
    )}
    </>
  );
}

export default MusicPlayer;
