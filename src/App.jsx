import { useState, useEffect, useRef, useCallback } from 'react';
import Keyboard from './components/Keyboard';
import Stats from './components/Stats';
import './App.css';

// 练习文本库
const TEXT_LIBRARY = {
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
  medium: [
    "The exploration of artificial intelligence has revolutionized how we interact with technology in our daily lives. From voice assistants to autonomous vehicles, AI continues to push the boundaries of what machines can achieve in the modern world.",
    "Full-stack development requires proficiency in both frontend and backend technologies. A skilled developer must understand databases, server architecture, APIs, and user interface design to build complete and robust applications.",
    "Data structures and algorithms form the foundation of computer science. Understanding time complexity, space complexity, and algorithmic thinking is essential for solving complex computational problems efficiently.",
    "Version control systems like Git enable developers to track changes, collaborate with team members, and maintain a comprehensive history of their codebase throughout the software development lifecycle.",
  ],
  hard: [
    "The juxtaposition of quantum computing and classical cryptography presents an unprecedented challenge for cybersecurity professionals. Post-quantum cryptographic algorithms must be developed expeditiously to safeguard sensitive information against the looming threat of quantum decryption capabilities that could potentially compromise existing encryption standards within the next decade.",
    "Microservices architecture facilitates the decomposition of monolithic applications into independently deployable services, each encapsulating a specific business capability. This paradigm shift necessitates robust inter-service communication protocols, comprehensive monitoring and observability frameworks, and sophisticated container orchestration mechanisms to maintain overall system reliability and performance.",
  ],
  chinese: [
    "人工智能正在改变我们的生活方式，从智能手机到自动驾驶汽车，技术的力量无处不在。作为计算机科学的学生，我们需要不断学习新知识，才能在快速变化的行业中保持竞争力。",
    "广东工业大学位于美丽的广州，是一所以工为主、理工结合的省属重点大学。学校的计算机科学与技术专业培养了大量优秀的IT人才，他们在各行各业发光发热。",
    "前端开发与后端开发是构建现代Web应用的两个重要方面。前端负责用户界面的呈现和交互体验，后端则处理数据存储、业务逻辑和服务器管理等核心功能。全栈开发者需要同时掌握这两个领域的技术。",
    "公务员考试主要包括行政职业能力测验和申论两个科目。行测考察逻辑推理、数量关系、言语理解等能力，而申论则考察分析问题和文字表达的能力。提前做好规划，合理安排时间，是备考成功的关键。",
    "数据结构是计算机科学的基石，它研究数据在计算机中的组织、存储和操作方式。常见的数据结构包括数组、链表、栈、队列、树、图等，每种结构都有其独特的优势和适用场景。",
    "学习编程不仅仅是学习语法，更重要的是培养计算思维和解决问题的能力。通过不断的实践和项目经验的积累，我们能够逐步提升自己的技术水平，成为一名优秀的软件工程师。",
  ],
};

function App() {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [language, setLanguage] = useState('en');
  const [currentKey, setCurrentKey] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const textDisplayRef = useRef(null);

  // 生成新文本
  const generateText = useCallback(() => {
    let pool;
    if (language === 'zh') {
      pool = TEXT_LIBRARY.chinese;
    } else {
      pool = TEXT_LIBRARY[difficulty] || TEXT_LIBRARY.easy;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    setText(pool[randomIndex]);
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setTotalKeystrokes(0);
    setIsFinished(false);
    setCurrentKey('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty, language]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  // 自动聚焦
  useEffect(() => {
    const handleClick = () => {
      if (!isFinished) {
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isFinished]);

  // 自动滚动
  useEffect(() => {
    if (textDisplayRef.current && currentIndex > 0) {
      const chars = textDisplayRef.current.querySelectorAll('.char');
      if (chars[currentIndex]) {
        chars[currentIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  // 核心：处理键盘输入
  const handleKeyDown = useCallback(
    (e) => {
      if (isFinished) return;

      if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Alt' ||
          e.key === 'Meta' || e.key === 'Control' || e.key === 'Shift' ||
          e.key === 'CapsLock' || e.key === 'Fn' || e.key === 'ContextMenu' ||
          e.key.startsWith('Arrow') || e.key === 'Enter') {
        return;
      }

      e.preventDefault();

      if (!startTime) {
        setStartTime(Date.now());
      }

      setCurrentKey(e.key);
      setTimeout(() => setCurrentKey(''), 120);

      const expectedChar = text[currentIndex] || '';

      // Backspace 回退
      if (e.key === 'Backspace') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setUserInput((prev) => prev.slice(0, -1));
        }
        return;
      }

      // 忽略其他功能键
      if (e.key.length > 1 && e.key !== ' ') {
        return;
      }

      setTotalKeystrokes((prev) => prev + 1);

      if (e.key === expectedChar) {
        // 正确
        setUserInput((prev) => prev + e.key);
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        if (newIndex >= text.length) {
          setEndTime(Date.now());
          setIsFinished(true);
        }
      } else {
        // 错误
        setErrors((prev) => prev + 1);
        setUserInput((prev) => prev + e.key);
        setCurrentIndex((prev) => prev + 1);
        if (currentIndex + 1 >= text.length) {
          setEndTime(Date.now());
          setIsFinished(true);
        }
      }
    },
    [isFinished, startTime, text, currentIndex]
  );

  // 全局键盘监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 计算统计数据
  const getStats = () => {
    if (!startTime) return { wpm: 0, accuracy: 100, time: 0 };

    const end = endTime || Date.now();
    const timeInMinutes = (end - startTime) / 60000;
    const words = Math.max(totalKeystrokes, 1) / 5;
    const wpm = timeInMinutes > 0 ? Math.round(words / timeInMinutes) : 0;
    const accuracy =
      totalKeystrokes > 0
        ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100)
        : 100;
    const timeInSeconds = Math.round((end - startTime) / 1000);

    return { wpm, accuracy, time: timeInSeconds };
  };

  // 渲染文本字符
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

  const stats = getStats();

  return (
    <div className="app">
      {/* 顶部 */}
      <header className="header">
        <h1>
          <span className="logo-icon">⌨️</span> 打字训练
        </h1>
        <p className="subtitle">提升打字速度与准确率 · 全栈实战项目</p>
      </header>

      {/* 控制面板 */}
      <div className="controls">
        <div className="control-group">
          <label className="control-label">语言</label>
          <div className="btn-group">
            <button
              className={`btn-ctrl ${language === 'en' ? 'active' : ''}`}
              onClick={() => { setLanguage('en'); setDifficulty('easy'); setTimeout(generateText, 0); }}
            >
              🇬🇧 English
            </button>
            <button
              className={`btn-ctrl ${language === 'zh' ? 'active' : ''}`}
              onClick={() => { setLanguage('zh'); setTimeout(generateText, 0); }}
            >
              🇨🇳 中文
            </button>
          </div>
        </div>

        {language === 'en' && (
          <div className="control-group">
            <label className="control-label">难度</label>
            <div className="btn-group">
              <button
                className={`btn-ctrl ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => { setDifficulty('easy'); setTimeout(generateText, 0); }}
              >
                🟢 简单
              </button>
              <button
                className={`btn-ctrl ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => { setDifficulty('medium'); setTimeout(generateText, 0); }}
              >
                🟡 中等
              </button>
              <button
                className={`btn-ctrl ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => { setDifficulty('hard'); setTimeout(generateText, 0); }}
              >
                🔴 困难
              </button>
            </div>
          </div>
        )}

        <button className="btn-refresh" onClick={generateText}>
          🔄 换一题
        </button>
      </div>

      {/* 统计面板 */}
      <Stats
        wpm={stats.wpm}
        accuracy={stats.accuracy}
        time={stats.time}
        errors={errors}
        progress={text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0}
      />

      {/* 文本显示区 */}
      <div
        className={`text-display ${isFocused ? 'focused' : ''} ${isFinished ? 'finished' : ''}`}
        ref={textDisplayRef}
      >
        {renderText()}
      </div>

      {/* 输入区 */}
      <div className="input-area" onClick={() => { inputRef.current?.focus(); setIsFocused(true); }}>
        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
          readOnly
        />
        {!isFinished && !startTime && (
          <p className="hint">👆 点击任意位置，然后开始打字...</p>
        )}
        {!isFinished && startTime && (
          <p className="hint typing">正在输入中... <span className="cursor-blink">|</span></p>
        )}

        {/* 完成弹窗 */}
        {isFinished && (
          <div className="finished-overlay">
            <div className="finished-card">
              <div className="trophy">🏆</div>
              <h2>练习完成！</h2>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-value">{stats.wpm}</span>
                  <span className="result-label">WPM 速度</span>
                </div>
                <div className="result-item">
                  <span className="result-value highlight">{stats.accuracy}%</span>
                  <span className="result-label">准确率</span>
                </div>
                <div className="result-item">
                  <span className="result-value">{stats.time}s</span>
                  <span className="result-label">用时</span>
                </div>
                <div className="result-item">
                  <span className="result-value">{errors}</span>
                  <span className="result-label">错误数</span>
                </div>
              </div>
              {/* 评级 */}
              <div className="grade">
                {stats.accuracy >= 95 && stats.wpm >= 60 ? '⭐ 优秀！你已经是打字高手了' :
                 stats.accuracy >= 90 && stats.wpm >= 40 ? '👍 良好！继续保持练习' :
                 stats.accuracy >= 80 ? '📚 不错！准确率还可以再提升' :
                 '💪 继续加油！多练习就会进步的'}
              </div>
              <button className="btn-restart" onClick={generateText}>
                🔄 再来一题
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 键盘可视化 */}
      <Keyboard currentKey={currentKey} expectedChar={text[currentIndex] || ''} />

      {/* 页脚提示 */}
      <footer className="footer">
        <p>
          💡 <strong>提示：</strong>点击页面任意位置激活输入，然后直接开始打字。
          <kbd>Backspace</kbd> 可以回退修改。
        </p>
      </footer>
    </div>
  );
}

export default App;
