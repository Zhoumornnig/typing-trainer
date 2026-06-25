import { useState, useRef } from 'react';
import './Settings.css';

function Settings({ bgImage, onBgChange, onBgRemove, customTexts, onAddCustomText, onDeleteCustomText, onClose }) {
  const [bgUrl, setBgUrl] = useState(bgImage);
  const [newText, setNewText] = useState('');
  const [tab, setTab] = useState('bg'); // 'bg' | 'texts'
  const fileRef = useRef(null);

  // 处理图片 URL 确认
  const handleBgUrlApply = () => {
    if (bgUrl.trim()) {
      onBgChange(bgUrl.trim());
    }
  };

  // 处理本地上传
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setBgUrl(dataUrl);
      onBgChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // 处理添加题目
  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    if (trimmed.length < 10) {
      alert('题目太短了，至少10个字符');
      return;
    }
    onAddCustomText(trimmed);
    setNewText('');
  };

  // 阻止点击穿透
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // 阻止弹窗内键盘事件冒泡
  const handleKeyStop = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-panel" onKeyDown={handleKeyStop}>
        {/* 头部 */}
        <div className="settings-header">
          <h2>⚙️ 设置</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* 标签切换 */}
        <div className="settings-tabs">
          <button className={`tab-btn ${tab === 'bg' ? 'active' : ''}`} onClick={() => setTab('bg')}>
            🖼️ 背景图片
          </button>
          <button className={`tab-btn ${tab === 'texts' ? 'active' : ''}`} onClick={() => setTab('texts')}>
            📝 我的题库
          </button>
        </div>

        <div className="settings-body">
          {/* ---- 背景图片设置 ---- */}
          {tab === 'bg' && (
            <div className="settings-section">
              <div className="setting-row">
                <label className="setting-label">图片 URL</label>
                <div className="url-input-row">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="https://example.com/bg.jpg"
                    value={bgUrl}
                    onChange={(e) => setBgUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleBgUrlApply(); }}
                  />
                  <button className="btn-sm btn-primary" onClick={handleBgUrlApply}>应用</button>
                </div>
              </div>

              <div className="setting-divider">
                <span>或者</span>
              </div>

              <div className="setting-row">
                <label className="setting-label">本地上传</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="file-input-hidden"
                  onChange={handleFileUpload}
                />
                <button className="btn-sm btn-outline" onClick={() => fileRef.current?.click()}>
                  📁 选择图片文件
                </button>
              </div>

              {bgImage && (
                <div className="setting-row">
                  <div className="bg-preview">
                    <img src={bgImage} alt="背景预览" />
                  </div>
                  <button className="btn-sm btn-danger" onClick={onBgRemove}>🗑️ 移除背景</button>
                </div>
              )}

              <div className="setting-tip">
                💡 支持网络图片链接或本地文件。背景会自动保存，下次打开还在。
              </div>
            </div>
          )}

          {/* ---- 自定义题库 ---- */}
          {tab === 'texts' && (
            <div className="settings-section">
              <div className="setting-row">
                <label className="setting-label">添加新题目</label>
                <textarea
                  className="text-area"
                  placeholder="在这里输入你的练习文本...&#10;&#10;至少 10 个字符，支持中文和英文。"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  rows={4}
                />
                <button className="btn-sm btn-primary" onClick={handleAdd} style={{ marginTop: 8 }}>
                  ➕ 添加到题库
                </button>
              </div>

              <div className="setting-row">
                <label className="setting-label">
                  我的题目（{customTexts.length} 条）
                </label>
                {customTexts.length === 0 ? (
                  <p className="empty-hint">还没有自定义题目，快添加一条吧～</p>
                ) : (
                  <ul className="custom-list">
                    {customTexts.map((t, i) => (
                      <li key={i} className="custom-item">
                        <span className="custom-text-preview">
                          {t.length > 60 ? t.slice(0, 60) + '...' : t}
                        </span>
                        <button
                          className="btn-delete-text"
                          onClick={() => onDeleteCustomText(i)}
                          title="删除"
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="setting-tip">
                💡 添加后，英文模式会出现「⭐ 我的」难度选项，自定义题目随机出题。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
