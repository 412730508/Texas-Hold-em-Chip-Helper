import { VisualReactionTest } from './visualReaction.js';

const modeSelect = document.getElementById('mode-select');
const gameArea = document.getElementById('game-area');
const resultArea = document.getElementById('result-area');

let currentTest = null;

modeSelect.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const mode = e.target.dataset.mode;
        startMode(mode);
    }
});

function startMode(mode) {
    resultArea.innerHTML = '';
    gameArea.innerHTML = '';
    if (currentTest && currentTest.cleanup) currentTest.cleanup();
    if (mode === 'visual') {
        currentTest = new VisualReactionTest(gameArea, resultArea);
        currentTest.start();
    }
    // 其他模式可日後擴充
}
