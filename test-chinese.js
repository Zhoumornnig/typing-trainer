/**
 * 中文输入法模拟测试
 * 模拟键盘事件顺序，验证字符匹配逻辑
 */

// ---- 模拟核心逻辑 ----
function simulateTyping(text) {
  let currentIndex = 0;
  let userInput = '';
  let errors = 0;
  let totalKeystrokes = 0;
  let isComposing = false;

  const results = [];

  function processInput(val) {
    if (isComposing) {
      results.push(`[跳过] 组合中: "${val}"`);
      return;
    }
    if (!val) return;

    for (let i = 0; i < val.length; i++) {
      const char = val[i];
      const expected = text[currentIndex] || '';
      totalKeystrokes++;

      if (char === expected) {
        userInput += char;
        currentIndex++;
        results.push(`[正确] '${char}' == '${expected}' | 进度: ${currentIndex}/${text.length} | 输入: ${userInput}`);
      } else {
        errors++;
        userInput += char;
        currentIndex++;
        results.push(`[错误] '${char}' != '${expected}' | 进度: ${currentIndex}/${text.length} | 输入: ${userInput}`);
      }

      if (currentIndex >= text.length) {
        results.push(`🏆 完成! 错误数: ${errors}/${totalKeystrokes}`);
      }
    }
  }

  return { processInput, results, startCompose: () => { isComposing = true; }, endCompose: () => { isComposing = false; } };
}

// ==================== 测试1: 英文打字 ====================
console.log('=== 测试1: 英文打字 "the" ===');
const en = simulateTyping('the quick');
en.processInput('t');
en.processInput('h');
en.processInput('e');
en.processInput(' ');
en.results.forEach(r => console.log('  ' + r));
console.log();

// ==================== 测试2: 中文逐字输入 "人工智能" ====================
console.log('=== 测试2: 中文逐字输入 "人工智能" ===');
const zh = simulateTyping('人工智能');

// 用户打 "人"
zh.startCompose();  // compositionstart
zh.processInput('ren');  // 拼音组合中 → 应跳过
zh.endCompose();    // compositionend
zh.processInput('人');  // 提交汉字 → 应处理

// 用户打 "工"
zh.startCompose();
zh.processInput('gong');
zh.endCompose();
zh.processInput('工');

// 用户打 "智"
zh.startCompose();
zh.processInput('zhi');
zh.endCompose();
zh.processInput('智');

// 用户打 "能"
zh.startCompose();
zh.processInput('neng');
zh.endCompose();
zh.processInput('能');

zh.results.forEach(r => console.log('  ' + r));
console.log();

// ==================== 测试3: 中文一次提交多个字 ====================
console.log('=== 测试3: 中文一次提交多个字 "人工智能" ===');
const zh2 = simulateTyping('人工智能');

zh2.startCompose();
zh2.processInput('rengongzhineng');  // 拼音 → 跳过
zh2.endCompose();
zh2.processInput('人工智能');  // 一次提交4个字

zh2.results.forEach(r => console.log('  ' + r));
console.log();

// ==================== 测试4: 包含错误 ====================
console.log('=== 测试4: 打错字 "人工智能" 打成 "人工只能" ===');
const zh3 = simulateTyping('人工智能');

zh3.startCompose(); zh3.processInput('ren'); zh3.endCompose();
zh3.processInput('人');

zh3.startCompose(); zh3.processInput('gong'); zh3.endCompose();
zh3.processInput('工');

zh3.startCompose(); zh3.processInput('zhi'); zh3.endCompose();
zh3.processInput('只');  // 错误！应该是"智"

zh3.startCompose(); zh3.processInput('neng'); zh3.endCompose();
zh3.processInput('能');

zh3.results.forEach(r => console.log('  ' + r));
console.log();

// ==================== 总结 ====================
console.log('=== 测试结果 ===');
console.log('测试1: 英文打字 - 应全部正确');
console.log('测试2: 中文逐字 - 应全部正确，拼音跳过');
console.log('测试3: 中文连打 - 应全部正确，拼音跳过，4字一次处理');
console.log('测试4: 含错误 - "只"应标红，"智"位应标错');
