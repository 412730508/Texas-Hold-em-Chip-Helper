const setupBtn = document.getElementById('setup-btn');
const playerCountInput = document.getElementById('player-count');
const playerNamesDiv = document.getElementById('player-names');
const gameSection = document.getElementById('game-section');
const playersArea = document.getElementById('players-area');
const potSpan = document.getElementById('pot');
const bettingArea = document.getElementById('betting-area');
const winnerSelect = document.getElementById('winner-select');
const distributeBtn = document.getElementById('distribute-btn');
const nextRoundBtn = document.getElementById('next-round-btn');
const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('history-list');
const minBetInput = document.getElementById('min-bet');
const smallBlindSelect = document.getElementById('small-blind-select');
const bigBlindSelect = document.getElementById('big-blind-select');
const nextBlindBtn = document.getElementById('next-blind-btn');
const reliefPlayerSelect = document.getElementById('relief-player-select');
const reliefAmountInput = document.getElementById('relief-amount');
const reliefBtn = document.getElementById('relief-btn');
const toggleMobileBtn = document.getElementById('toggle-mobile-btn');
const langSelect = document.getElementById('lang-select');

let players = [];
let pot = 0;
let history = [];
let minBet = 10;
let smallBlindIdx = 0;
let bigBlindIdx = 1;

const i18n = {
    'zh-tw': {
        title: '德州撲克籌碼輔助工具',
        warning: '賭博需謹慎，小賭怡情，大賭郭台銘',
        mobile: '切換手機模板',
        playerCount: '玩家人數（2-10）：',
        minBet: '每回合最低下注：',
        setup: '建立玩家',
        start: '開始遊戲',
        smallBlind: '小盲：',
        bigBlind: '大盲：',
        nextBlind: '下位盲注',
        chips: '籌碼',
        bet: '下注：',
        smallBlindTag: '[小盲]',
        bigBlindTag: '[大盲]',
        pot: '底池：',
        winner: '勝者：',
        distribute: '分配底池',
        nextRound: '新局',
        reset: '重置全部',
        history: '籌碼歷史紀錄',
        relief: '救濟金發放給',
        reliefBtn: '發放救濟金',
        playerName: idx => `玩家${idx+1}名稱`,
        roundResult: (winner, info) => `勝者：${winner}，分配底池，現況：${info}`,
    },
    'en': {
        title: "Texas Hold'em Chip Helper",
        warning: 'Gamble responsibly. For fun, not for fortune!',
        mobile: 'Mobile Template',
        playerCount: 'Players (2-10):',
        minBet: 'Min Bet per Round:',
        setup: 'Setup Players',
        start: 'Start Game',
        smallBlind: 'Small Blind:',
        bigBlind: 'Big Blind:',
        nextBlind: 'Next Blinds',
        chips: 'Chips',
        bet: 'Bet:',
        smallBlindTag: '[SB]',
        bigBlindTag: '[BB]',
        pot: 'Pot:',
        winner: 'Winner:',
        distribute: 'Distribute Pot',
        nextRound: 'Next Round',
        reset: 'Reset All',
        history: 'Chip History',
        relief: 'Relief to',
        reliefBtn: 'Give Relief',
        playerName: idx => `Player ${idx+1} Name`,
        roundResult: (winner, info) => `Winner: ${winner}, Pot distributed, Status: ${info}`,
    }
};

let currentLang = langSelect ? langSelect.value : 'zh-tw';

function updateLangUI() {
    const t = i18n[currentLang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('p').textContent = t.warning;
    document.getElementById('toggle-mobile-btn').textContent = t.mobile;

    // 直接修改 setup-section 裡的 label 文字
    const setupSection = document.getElementById('setup-section');
    const labels = setupSection.querySelectorAll('label');
    if (labels[0]) {
        labels[0].childNodes[0].nodeValue = t.playerCount;
    }
    if (labels[1]) {
        labels[1].childNodes[0].nodeValue = t.minBet;
    }

    document.getElementById('setup-btn').textContent = t.setup;
    // Setup section player names and chips
    const nameInputs = playerNamesDiv.querySelectorAll('.player-name-input');
    nameInputs.forEach((input, idx) => {
        input.placeholder = t.playerName(idx);
    });
    // Setup section chips
    const chipInputs = playerNamesDiv.querySelectorAll('.player-chip-input');
    chipInputs.forEach(input => {
        input.placeholder = t.chips;
    });
    // Game section
    document.querySelector('#blind-area label:nth-child(1)').childNodes[0].textContent = t.smallBlind;
    document.querySelector('#blind-area label:nth-child(2)').childNodes[0].textContent = t.bigBlind;
    document.getElementById('next-blind-btn').textContent = t.nextBlind;
    document.getElementById('pot-area').childNodes[0].textContent = t.pot;
    document.querySelector('#winner-area label').textContent = t.winner;
    document.getElementById('distribute-btn').textContent = t.distribute;
    document.getElementById('next-round-btn').textContent = t.nextRound;
    document.getElementById('reset-btn').textContent = t.reset;
    document.querySelector('#history-area h3').textContent = t.history;
    document.querySelector('#relief-area label').childNodes[0].textContent = t.relief;
    document.getElementById('relief-btn').textContent = t.reliefBtn;
    // Betting area labels
    renderPlayers();
    renderBetting();
    renderWinnerSelect();
    renderBlindSelect();
    renderReliefSelect();
}

setupBtn.onclick = () => {
    const count = Math.max(2, Math.min(10, parseInt(playerCountInput.value)));
    playerNamesDiv.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '6px';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `玩家${i+1}名稱`;
        input.value = `玩家${i+1}`;
        input.className = 'player-name-input';
        input.style.marginRight = '8px';
        const chipInput = document.createElement('input');
        chipInput.type = 'number';
        chipInput.min = 1;
        chipInput.value = 1000;
        chipInput.className = 'player-chip-input';
        chipInput.style.width = '80px';
        chipInput.placeholder = '籌碼數';
        wrapper.appendChild(input);
        wrapper.appendChild(document.createTextNode(' 籌碼: '));
        wrapper.appendChild(chipInput);
        playerNamesDiv.appendChild(wrapper);
    }
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '開始遊戲';
    confirmBtn.onclick = () => {
        players = [];
        pot = 0;
        history = [];
        potSpan.textContent = '0';
        historyList.innerHTML = '';
        minBet = parseInt(minBetInput.value) || 1;
        const nameInputs = playerNamesDiv.querySelectorAll('.player-name-input');
        const chipInputs = playerNamesDiv.querySelectorAll('.player-chip-input');
        nameInputs.forEach((input, idx) => {
            let chipValue = parseInt(chipInputs[idx].value);
            if (isNaN(chipValue) || chipValue < 1) chipValue = 1000;
            players.push({
                name: input.value.trim() || `玩家${idx+1}`,
                chips: chipValue,
                lastBet: 0
            });
        });
        smallBlindIdx = 0;
        bigBlindIdx = 1 % players.length;
        renderPlayers();
        renderBetting();
        renderWinnerSelect();
        renderBlindSelect();
        renderReliefSelect();
        gameSection.style.display = '';
        playerNamesDiv.innerHTML = '';
        setupBtn.style.display = 'none';
        playerCountInput.disabled = true;
        minBetInput.disabled = true;
    };
    playerNamesDiv.appendChild(confirmBtn);
};

function renderBlindSelect() {
    smallBlindSelect.innerHTML = '';
    bigBlindSelect.innerHTML = '';
    players.forEach((p, idx) => {
        const opt1 = document.createElement('option');
        opt1.value = idx;
        opt1.textContent = p.name;
        if (idx === smallBlindIdx) opt1.selected = true;
        smallBlindSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = idx;
        opt2.textContent = p.name;
        if (idx === bigBlindIdx) opt2.selected = true;
        bigBlindSelect.appendChild(opt2);
    });
}

smallBlindSelect.onchange = () => {
    smallBlindIdx = parseInt(smallBlindSelect.value);
    if (smallBlindIdx === bigBlindIdx) {
        bigBlindIdx = (smallBlindIdx + 1) % players.length;
        renderBlindSelect();
    }
    renderBetting();
};
bigBlindSelect.onchange = () => {
    bigBlindIdx = parseInt(bigBlindSelect.value);
    if (bigBlindIdx === smallBlindIdx) {
        smallBlindIdx = (bigBlindIdx + players.length - 1) % players.length;
        renderBlindSelect();
    }
    renderBetting();
};

nextBlindBtn.onclick = () => {
    smallBlindIdx = (smallBlindIdx + 1) % players.length;
    bigBlindIdx = (smallBlindIdx + 1) % players.length;
    renderBlindSelect();
    renderBetting();
};

function renderPlayers(winnerIdx = null) {
    const t = i18n[currentLang];
    playersArea.innerHTML = '';
    players.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = 'player-block';
        if (winnerIdx === idx) div.classList.add('winner');
        let blindTag = '';
        if (idx === smallBlindIdx) blindTag = ` <span style="color:#00e6e6;">(${t.smallBlind.replace(':','')})</span>`;
        if (idx === bigBlindIdx) blindTag = ` <span style="color:#ffd700;">(${t.bigBlind.replace(':','')})</span>`;
        div.innerHTML = `<span class="chip">💰</span>${p.name}${blindTag}<br>${t.chips}：${p.chips}`;
        playersArea.appendChild(div);
    });
}

function handleBet() {
    let totalBet = 0;
    players.forEach((p, idx) => {
        const betInput = document.getElementById(`bet-${idx}`);
        let bet = parseInt(betInput.value) || 0;
        let minThisBet = 0;
        if (idx === smallBlindIdx) minThisBet = Math.min(Math.floor(minBet/2), p.chips);
        else if (idx === bigBlindIdx) minThisBet = Math.min(minBet, p.chips);
        else minThisBet = Math.min(minBet, p.chips);
        // 強制下注不得低於最低下注（除非籌碼不足或為0）
        if (p.chips > 0 && bet < minThisBet) bet = minThisBet;
        bet = Math.max(0, Math.min(bet, p.chips));
        p.chips -= bet;
        p.lastBet = bet;
        totalBet += bet;
    });
    pot += totalBet;
    potSpan.textContent = pot;
    renderPlayers();
    renderBetting();
}

function renderBetting() {
    const t = i18n[currentLang];
    bettingArea.innerHTML = '';
    players.forEach((p, idx) => {
        const label = document.createElement('label');
        let blindLabel = '';
        let defaultBet = 0;
        if (idx === smallBlindIdx) {
            blindLabel = ` <span style="color:#00e6e6;">${t.smallBlindTag}</span>`;
            defaultBet = Math.min(Math.floor(minBet/2), p.chips);
        }
        if (idx === bigBlindIdx) {
            blindLabel = ` <span style="color:#ffd700;">${t.bigBlindTag}</span>`;
            defaultBet = Math.min(minBet, p.chips);
        }
        label.innerHTML = `${p.name}${blindLabel} ${t.bet}`;
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.max = p.chips;
        input.value = defaultBet;
        input.id = `bet-${idx}`;
        label.appendChild(input);
        bettingArea.appendChild(label);
    });
    const betBtn = document.createElement('button');
    betBtn.textContent = t.bet.replace(':','');
    betBtn.onclick = handleBet;
    bettingArea.appendChild(betBtn);
}

function renderWinnerSelect() {
    winnerSelect.innerHTML = '';
    players.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = p.name;
        winnerSelect.appendChild(opt);
    });
}

function renderReliefSelect() {
    reliefPlayerSelect.innerHTML = '';
    players.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = p.name;
        reliefPlayerSelect.appendChild(opt);
    });
}

if (reliefBtn) {
    reliefBtn.onclick = () => {
        const idx = parseInt(reliefPlayerSelect.value);
        let amt = parseInt(reliefAmountInput.value) || 0;
        if (isNaN(idx) || idx < 0 || idx >= players.length || amt <= 0) return;
        players[idx].chips += amt;
        renderPlayers();
        renderBetting();
    };
}

distributeBtn.onclick = () => {
    const winnerIdx = parseInt(winnerSelect.value);
    if (isNaN(winnerIdx)) return;
    players[winnerIdx].chips += pot;
    addHistory(winnerIdx);
    pot = 0;
    potSpan.textContent = pot;
    renderPlayers(winnerIdx);
    renderBetting();
};

function addHistory(winnerIdx) {
    const t = i18n[currentLang];
    const li = document.createElement('li');
    const roundInfo = players.map((p, idx) =>
        `${p.name}(${p.chips}${winnerIdx===idx?'🏆':''})`
    ).join('，');
    li.textContent = t.roundResult(players[winnerIdx].name, roundInfo);
    historyList.insertBefore(li, historyList.firstChild);
}

nextRoundBtn.onclick = () => {
    players.forEach(p => p.lastBet = 0);
    pot = 0;
    potSpan.textContent = pot;
    // 盲注自動輪替
    smallBlindIdx = (smallBlindIdx + 1) % players.length;
    bigBlindIdx = (smallBlindIdx + 1) % players.length;
    renderBlindSelect();
    renderPlayers();
    renderBetting();
    renderReliefSelect();
};

resetBtn.onclick = () => {
    location.reload();
};

if (toggleMobileBtn) {
    toggleMobileBtn.onclick = () => {
        document.body.classList.toggle('mobile-template');
    };
}

if (langSelect) {
    langSelect.onchange = () => {
        currentLang = langSelect.value;
        updateLangUI();
    };
}