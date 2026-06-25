import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Keyboard from './components/Keyboard';
import Stats from './components/Stats';
import Settings from './components/Settings';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

// 练习文本库
const DEFAULT_TEXTS = {
  easy: [
    "the quick brown fox jumps over the lazy dog",
    "a journey of a thousand miles begins with a single step",
    "practice makes perfect so keep on typing every day",
    "the sun shines bright on a beautiful summer morning",
    "coding is not just about writing code it is about solving problems",
    "every expert was once a beginner who never gave up on their dreams",
    "life is what happens when you are busy making other plans",
    "the only way to do great work is to love what you do",
    "success is not final failure is not fatal it is the courage to continue that counts",
    "in the middle of difficulty lies opportunity for those who seek it",
  ],
  highschool: [
    "Education is the most powerful weapon which you can use to change the world. Every student has the potential to achieve greatness through hard work and determination.",
    "The environment plays a crucial role in our daily lives. We should take responsibility for protecting nature and reducing pollution for future generations.",
    "Technology has changed the way we communicate with each other. Social media allows people to stay connected regardless of distance and time zones.",
    "Reading books can broaden our horizons and enrich our knowledge. A good book is like a wise friend who guides us through difficult times.",
    "Health is more important than wealth. Regular exercise and a balanced diet are essential for maintaining both physical and mental well-being.",
    "Traveling to different places helps us understand diverse cultures and traditions. It is an excellent way to learn about the world beyond our textbooks.",
    "Teamwork is essential in almost every aspect of life. When people work together towards a common goal, they can accomplish far more than any individual could alone.",
    "Time management is a valuable skill for students. Learning to prioritize tasks and avoid procrastination can greatly improve academic performance.",
    "Volunteering is a meaningful way to contribute to society. Helping others not only benefits the community but also brings personal satisfaction and growth.",
    "Critical thinking enables us to analyze information objectively and make informed decisions. It is one of the most important skills in the modern world.",
  ],
  cet4: [
    "The government has implemented a series of policies to promote sustainable economic development and improve the overall quality of life for all citizens across the country.",
    "Modern universities are committed to providing students with comprehensive education that combines theoretical knowledge with practical skills for their future careers.",
    "The rapid advancement of artificial intelligence has significantly transformed various industries and created both opportunities and challenges for the global workforce.",
    "Effective communication skills are increasingly valued in the workplace. The ability to express ideas clearly and collaborate with colleagues determines professional success.",
    "Global climate change poses a serious threat to ecosystems worldwide. International cooperation is urgently needed to address environmental challenges and reduce carbon emissions.",
    "The popularity of online learning platforms has made education more accessible than ever before. Students can now acquire new skills from anywhere at their own pace.",
    "Cultural diversity enriches our society in countless ways. Exposure to different perspectives and traditions fosters creativity, innovation, and mutual understanding.",
    "Financial literacy is an essential life skill that helps individuals make informed decisions about budgeting, saving, and investing for their long-term financial security.",
    "The healthcare system continues to evolve with technological innovations. Telemedicine and digital health records have improved the efficiency and accessibility of medical services.",
    "Entrepreneurship requires a combination of creativity, resilience, and strategic thinking. Successful entrepreneurs are willing to take calculated risks and learn from failure.",
  ],
  cet6: [
    "The unprecedented complexity of contemporary geopolitical dynamics necessitates a multifaceted approach to international diplomacy and conflict resolution strategies.",
    "Neuroscientific research has revealed the remarkable plasticity of the human brain, demonstrating its extraordinary capacity to adapt and reorganize throughout an individual's lifespan.",
    "The proliferation of misinformation on digital platforms underscores the critical importance of media literacy and the need for rigorous fact-checking mechanisms in democratic societies.",
    "Sustainable urbanization requires the integration of environmental considerations into infrastructure planning, balancing economic growth with ecological preservation and social equity.",
    "The philosophical discourse on consciousness and artificial intelligence raises profound questions about the nature of self-awareness and the ethical implications of technological advancement.",
    "Interdisciplinary collaboration between scientists, policymakers, and industry leaders is indispensable for addressing the multifaceted challenges posed by climate change and resource depletion.",
    "The juxtaposition of traditional pedagogical methods with innovative educational technologies presents both opportunities and dilemmas for contemporary curriculum development.",
    "Corporate social responsibility has evolved from a peripheral consideration to a fundamental component of organizational strategy, reflecting growing stakeholder expectations regarding ethical business practices.",
    "The intricate relationship between socioeconomic inequality and public health outcomes demonstrates the necessity of holistic policy interventions that address systemic determinants of well-being.",
    "Technological disruption simultaneously creates and destroys economic value, necessitating adaptive regulatory frameworks that foster innovation while protecting vulnerable populations from adverse consequences.",
  ],
};

// 从 localStorage 读取
function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return fallback;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function App() {
  // ---- 背景图片 ----
  const [bgImage, setBgImage] = useState(() => loadFromStorage('typing-bg', ''));

  // ---- 自定义题库 ----
  const [customTexts, setCustomTexts] = useState(() => loadFromStorage('typing-custom-texts', []));

  // 合并题库（useMemo 避免每次渲染重建导致 generateText 跟着变）
  const textLibrary = useMemo(() => {
    const lib = { ...DEFAULT_TEXTS };
    if (customTexts.length > 0) {
      lib.custom = customTexts;
    }
    return lib;
  }, [customTexts]);

  // ---- 打字状态 ----
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [currentKey, setCurrentKey] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const isComposingRef = useRef(false); // 同步 ref，避免 compositionend → input 的闭包延迟
  const [showSettings, setShowSettings] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [theme, setTheme] = useState(() => loadFromStorage('typing-theme', 'dark'));
  const inputRef = useRef(null);
  const textDisplayRef = useRef(null);

  // ---- 生成文本 ----
  const generateText = useCallback(() => {
    const pool = textLibrary[difficulty] || textLibrary.easy;
    const idx = Math.floor(Math.random() * (pool?.length || 1));
    setText(pool?.[idx] || '');
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setTotalKeystrokes(0);
    setIsFinished(false);
    setCurrentKey('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty, textLibrary]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  // ---- 自动聚焦 ----
  useEffect(() => {
    const handleClick = () => {
      if (!isFinished && !showSettings) {
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isFinished, showSettings]);

  // ---- 自动滚动 ----
  useEffect(() => {
    if (textDisplayRef.current && currentIndex > 0) {
      const chars = textDisplayRef.current.querySelectorAll('.char');
      if (chars[currentIndex]) {
        chars[currentIndex].scrollIntoView({
          behavior: 'smooth', block: 'center', inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  // ---- 键盘事件：只处理退格/撤回，其他键放行给 input 事件 ----
  const handleKeyDown = useCallback(
    (e) => {
      if (isFinished || showSettings) return;

      // 退格 / Ctrl+Z 撤回
      if (e.key === 'Backspace' || (e.key === 'z' && e.ctrlKey)) {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setUserInput((prev) => prev.slice(0, -1));
        }
        return;
      }

      // 如果是输入法组合键（拼音字母），阻止写入 input，避免提前触发 input 事件
      if (e.isComposing) {
        e.preventDefault();
        return;
      }

      // Tab / Escape / Enter 等特殊键拦截
      if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        return;
      }

      // 其余英文/符号键：不 preventDefault，
      // 让浏览器把字符写入 <input>，由 handleInput 统一处理
    },
    [isFinished, showSettings, currentIndex]
  );

  // ---- 统一字符输入处理（英文打字 + 中文输入法提交） ----
  const handleInput = useCallback((e) => {
    // 输入法组合中（拼音没打完）：跳过
    if (isComposingRef.current) return;

    const val = e.target.value;
    if (!val || isFinished || showSettings) {
      e.target.value = '';
      return;
    }

    if (!startTime) setStartTime(Date.now());

    // 逐字符匹配
    let localIdx = currentIndex;
    let localInput = userInput;
    let errCount = 0;

    for (let i = 0; i < val.length; i++) {
      const char = val[i];
      const expected = text[localIdx] || '';

      setCurrentKey(char);
      setTimeout(() => setCurrentKey(''), 120);

      localInput += char;
      if (char !== expected) errCount++;
      localIdx++;
      if (localIdx >= text.length) break;
    }

    setTotalKeystrokes((prev) => prev + val.length);
    if (errCount > 0) setErrors((prev) => prev + errCount);
    setUserInput(localInput);
    setCurrentIndex(localIdx);
    if (localIdx >= text.length) {
      setEndTime(Date.now());
      setIsFinished(true);
    }

    e.target.value = '';
  }, [isFinished, showSettings, startTime, text, currentIndex, userInput]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ---- 主题切换 ----
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    saveToStorage('typing-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // ---- 背景图片处理（直接设到 body 上，覆盖整个页面） ----
  useEffect(() => {
    if (bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    }
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    };
  }, [bgImage]);

  const handleBgChange = useCallback((url) => {
    setBgImage(url);
    saveToStorage('typing-bg', url);
  }, []);

  const handleBgRemove = useCallback(() => {
    setBgImage('');
    saveToStorage('typing-bg', '');
  }, []);

  // ---- 自定义题库处理 ----
  const handleAddCustomText = useCallback((newText) => {
    setCustomTexts((prev) => {
      const updated = [...prev, newText];
      saveToStorage('typing-custom-texts', updated);
      return updated;
    });
  }, []);

  const handleDeleteCustomText = useCallback((index) => {
    setCustomTexts((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      saveToStorage('typing-custom-texts', updated);
      return updated;
    });
  }, []);

  // ---- 统计数据 ----
  const getStats = () => {
    if (!startTime) return { wpm: 0, accuracy: 100, time: 0 };
    const end = endTime || Date.now();
    const timeInMinutes = (end - startTime) / 60000;
    const words = Math.max(totalKeystrokes, 1) / 5;
    const wpm = timeInMinutes > 0 ? Math.round(words / timeInMinutes) : 0;
    const accuracy = totalKeystrokes > 0
      ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;
    return { wpm, accuracy, time: Math.round((end - startTime) / 1000) };
  };

  const stats = getStats();

  // ---- 渲染文本 ----
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'char';
      if (index < currentIndex) {
        const typed = userInput[index] || '';
        className += char === typed ? ' correct' : ' incorrect';
      } else if (index === currentIndex) {
        className += ' current';
      } else {
        className += ' pending';
      }
      return (
        <span key={index} className={className}>
          {char === ' ' ? ' ' : char}
        </span>
      );
    });
  };

  const hasCustom = customTexts.length > 0;

  return (
    <div className="app">
      {/* ---- 头部 ---- */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <h1><span className="logo-icon">⌨️</span> 打字训练</h1>
          <button
            className="btn-settings-icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? '切换日间模式' : '切换夜间模式'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="btn-settings-icon"
            onClick={() => setShowMusic(!showMusic)}
            title="音乐"
          >
            🎵
          </button>
          <button
            className="btn-settings-icon"
            onClick={() => setShowSettings(true)}
            title="设置"
          >
            ⚙️
          </button>
        </div>
        <p className="subtitle">提升打字速度与准确率 · 全栈实战项目</p>
      </header>

      {/* ---- 控制面板 ---- */}
      <div className="controls">
        <div className="control-group">
          <label className="control-label">题库</label>
          <div className="btn-group">
            <button className={`btn-ctrl ${difficulty === 'easy' ? 'active' : ''}`} onClick={() => setDifficulty('easy')}>🟢 基础</button>
            <button className={`btn-ctrl ${difficulty === 'highschool' ? 'active' : ''}`} onClick={() => setDifficulty('highschool')}>🏫 高中</button>
            <button className={`btn-ctrl ${difficulty === 'cet4' ? 'active' : ''}`} onClick={() => setDifficulty('cet4')}>🎓 四级</button>
            <button className={`btn-ctrl ${difficulty === 'cet6' ? 'active' : ''}`} onClick={() => setDifficulty('cet6')}>📚 六级</button>
            {hasCustom && (
              <button className={`btn-ctrl ${difficulty === 'custom' ? 'active' : ''}`} onClick={() => setDifficulty('custom')}>⭐ 我的</button>
            )}
          </div>
        </div>

        <button className="btn-refresh" onClick={() => {
          if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setUserInput((prev) => prev.slice(0, -1));
          }
        }} disabled={currentIndex === 0}>
          ↩️ 撤回
        </button>
        <button className="btn-refresh" onClick={generateText}>🔄 换一题</button>
      </div>

      {/* ---- 统计 ---- */}
      <Stats
        wpm={stats.wpm}
        accuracy={stats.accuracy}
        time={stats.time}
        errors={errors}
        progress={text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0}
      />

      {/* ---- 文本显示 ---- */}
      <div className={`text-display ${isFocused ? 'focused' : ''} ${isFinished ? 'finished' : ''}`} ref={textDisplayRef}>
        {renderText()}
      </div>

      {/* ---- 用户输入实时回显 ---- */}
      <div className="user-input-preview">
        <span className="preview-label">你的输入：</span>
        <span className="preview-text">
          {userInput || <span className="preview-placeholder">等待输入...</span>}
        </span>
      </div>

      {/* ---- 输入区 ---- */}
      <div className="input-area" onClick={() => { inputRef.current?.focus(); setIsFocused(true); }}>
        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onCompositionStart={() => { isComposingRef.current = true; setIsComposing(true); }}
          onCompositionEnd={() => { isComposingRef.current = false; setIsComposing(false); }}
          onInput={handleInput}
          autoFocus
        />
        {!isFinished && !startTime && (
          <p className="hint">👆 点击任意位置，然后开始打字...</p>
        )}
        {!isFinished && startTime && (
          <p className="hint typing">正在输入中... <span className="cursor-blink">|</span></p>
        )}

        {/* ---- 完成弹窗 ---- */}
        {isFinished && (
          <div className="finished-overlay">
            <div className="finished-card">
              <div className="trophy">🏆</div>
              <h2>练习完成！</h2>
              <div className="result-grid">
                <div className="result-item"><span className="result-value">{stats.wpm}</span><span className="result-label">WPM 速度</span></div>
                <div className="result-item"><span className="result-value highlight">{stats.accuracy}%</span><span className="result-label">准确率</span></div>
                <div className="result-item"><span className="result-value">{stats.time}s</span><span className="result-label">用时</span></div>
                <div className="result-item"><span className="result-value">{errors}</span><span className="result-label">错误数</span></div>
              </div>
              <div className="grade">
                {stats.accuracy >= 95 && stats.wpm >= 60 ? '⭐ 优秀！你已经是打字高手了' :
                 stats.accuracy >= 90 && stats.wpm >= 40 ? '👍 良好！继续保持练习' :
                 stats.accuracy >= 80 ? '📚 不错！准确率还可以再提升' :
                 '💪 继续加油！多练习就会进步的'}
              </div>
              <button className="btn-restart" onClick={generateText}>🔄 再来一题</button>
            </div>
          </div>
        )}
      </div>

      {/* ---- 键盘 ---- */}
      <Keyboard currentKey={currentKey} expectedChar={text[currentIndex] || ''} />

      {/* ---- 页脚 ---- */}
      <footer className="footer">
        <p>💡 <strong>提示：</strong>点击页面任意位置激活输入，<kbd>Backspace</kbd> 回退修改。</p>
        {bgImage && (
          <p className="bg-info">🖼️ 已设置自定义背景 · <button className="btn-link" onClick={handleBgRemove}>恢复默认</button></p>
        )}
      </footer>

      {/* ---- 音乐播放器（始终挂载，进页面就播） ---- */}
      <MusicPlayer visible={showMusic} onClose={() => setShowMusic(false)} />

      {/* ---- 设置弹窗 ---- */}
      {showSettings && (
        <Settings
          bgImage={bgImage}
          onBgChange={handleBgChange}
          onBgRemove={handleBgRemove}
          customTexts={customTexts}
          onAddCustomText={handleAddCustomText}
          onDeleteCustomText={handleDeleteCustomText}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
