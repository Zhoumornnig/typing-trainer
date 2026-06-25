import './Stats.css';

function Stats({ wpm, accuracy, time, errors, progress }) {
  return (
    <div className="stats-panel">
      <div className="stat-item">
        <div className="stat-value">{wpm}</div>
        <div className="stat-label">WPM</div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <div className={`stat-value ${accuracy >= 90 ? 'good' : accuracy >= 70 ? 'warn' : 'bad'}`}>
          {accuracy}%
        </div>
        <div className="stat-label">准确率</div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <div className="stat-value">{time}s</div>
        <div className="stat-label">时间</div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <div className="stat-value">{errors}</div>
        <div className="stat-label">错误</div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <div className="stat-value">{progress}%</div>
        <div className="stat-label">进度</div>
      </div>
    </div>
  );
}

export default Stats;
