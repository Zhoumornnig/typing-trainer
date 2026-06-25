import { useMemo } from 'react';
import './Keyboard.css';

// 键盘布局
const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space'],
];

// 特殊键宽度
const KEY_WIDTHS = {
  Backspace: 'wide',
  Tab: 'wide',
  Caps: 'wider',
  Enter: 'wider',
  Shift: 'wider',
  Space: 'space',
};

// 键名映射（显示用）
const KEY_LABELS = {
  Backspace: '⌫',
  Tab: '⇥',
  Caps: 'Caps',
  Enter: '↵',
  Shift: '⇧',
  Space: '',
};

function Keyboard({ currentKey, expectedChar }) {
  // 根据 expectedChar 找到应该按的键
  const targetKey = useMemo(() => {
    if (!expectedChar) return null;
    const char = expectedChar.toLowerCase();
    if (char === ' ') return 'Space';
    if (char === '\n') return 'Enter';
    return char;
  }, [expectedChar]);

  // 判断当前按下的键匹配到哪个物理键
  const activeKey = useMemo(() => {
    if (!currentKey) return null;
    if (currentKey === ' ') return 'Space';
    return currentKey.toLowerCase();
  }, [currentKey]);

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="keyboard-row">
          {row.map((key) => {
            const widthClass = KEY_WIDTHS[key] || '';
            const label = KEY_LABELS[key] || key;

            // 高亮状态
            const isTarget = targetKey === key;
            const isActive = activeKey === key;
            const isSpace = key === 'Space';

            let keyClass = `key ${widthClass}`;
            if (isActive && isTarget) keyClass += ' hit-correct';
            else if (isActive && !isTarget) keyClass += ' hit-wrong';
            else if (isTarget && !isActive) keyClass += ' next-key';

            if (isSpace) keyClass += ' space-key';

            return (
              <div key={key} className={keyClass}>
                {isSpace ? (
                  <span className="space-hint">SPACE</span>
                ) : (
                  <span className="key-label">{label}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
