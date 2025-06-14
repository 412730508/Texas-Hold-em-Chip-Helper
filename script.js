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
const themeSelect = document.getElementById('theme-select');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const importJsonBtn = document.getElementById('import-json-btn');
const importJsonInput = document.getElementById('import-json-input');

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
        // 新增顏色選擇
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = ['#ff4fd8','#00ffe7','#aaff00','#ffd700','#e63946','#457b9d','#23694d','#f1c40f','#2e8b57','#1a2d23'][i%10];
        colorInput.className = 'player-color-input';
        colorInput.style.marginLeft = '8px';
        // 新增圖示選擇
        const iconInput = document.createElement('select');
        iconInput.className = 'player-icon-input';
        iconInput.style.marginLeft = '4px';
        ['💰','🃏','🎲','🦄','🐲','👑','🦈','🧊','🍀','🎩'].forEach(icon=>{
            const opt = document.createElement('option');
            opt.value = icon;
            opt.textContent = icon;
            iconInput.appendChild(opt);
        });
        wrapper.appendChild(input);
        wrapper.appendChild(document.createTextNode(' 籌碼: '));
        wrapper.appendChild(chipInput);
        wrapper.appendChild(colorInput);
        wrapper.appendChild(iconInput);
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
        const colorInputs = playerNamesDiv.querySelectorAll('.player-color-input');
        const iconInputs = playerNamesDiv.querySelectorAll('.player-icon-input');
        nameInputs.forEach((input, idx) => {
            let chipValue = parseInt(chipInputs[idx].value);
            if (isNaN(chipValue) || chipValue < 1) chipValue = 1000;
            players.push({
                name: input.value.trim() || `玩家${idx+1}`,
                chips: chipValue,
                lastBet: 0,
                color: colorInputs[idx].value,
                icon: iconInputs[idx].value
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
        // 淘汰標記
        let eliminated = p.chips === 0 ? ' <span style="color:#f55;">[淘汰]</span>' : '';
        div.innerHTML = `<span class="chip" style="color:${p.color||'#fff'};">${p.icon||'💰'}</span>${p.name}${blindTag}${eliminated}<br>${t.chips}：${p.chips}`;
        // 排序按鈕
        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.style.margin = '2px 2px 2px 0';
        upBtn.onclick = () => {
            if (idx > 0) {
                [players[idx-1], players[idx]] = [players[idx], players[idx-1]];
                // 更新盲注位置
                if (smallBlindIdx === idx) smallBlindIdx--;
                else if (smallBlindIdx === idx-1) smallBlindIdx++;
                if (bigBlindIdx === idx) bigBlindIdx--;
                else if (bigBlindIdx === idx-1) bigBlindIdx++;
                renderPlayers();
                renderBetting();
                renderBlindSelect();
                renderReliefSelect();
            }
        };
        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.style.margin = '2px 0 2px 2px';
        downBtn.onclick = () => {
            if (idx < players.length-1) {
                [players[idx+1], players[idx]] = [players[idx], players[idx+1]];
                if (smallBlindIdx === idx) smallBlindIdx++;
                else if (smallBlindIdx === idx+1) smallBlindIdx--;
                if (bigBlindIdx === idx) bigBlindIdx++;
                else if (bigBlindIdx === idx+1) bigBlindIdx--;
                renderPlayers();
                renderBetting();
                renderBlindSelect();
                renderReliefSelect();
            }
        };
        div.appendChild(upBtn);
        div.appendChild(downBtn);
        playersArea.appendChild(div);
    });
}

function handleBet() {
    let totalBet = 0;
    // 計算本輪最大下注
    let maxBet = 0;
    players.forEach((p, idx) => {
        const betInput = document.getElementById(`bet-${idx}`);
        let bet = parseInt(betInput.value) || 0;
        if (bet > maxBet) maxBet = bet;
    });
    // 檢查所有有下注的玩家是否都跟到最大注
    let allCall = true;
    players.forEach((p, idx) => {
        const betInput = document.getElementById(`bet-${idx}`);
        let bet = parseInt(betInput.value) || 0;
        // 只要有下注且不是all-in，必須等於maxBet
        if (p.chips > 0 && bet > 0 && bet !== Math.min(maxBet, p.chips)) {
            allCall = false;
        }
    });
    if (!allCall) {
        alert('所有有下注的玩家必須跟到最大注（call）才能下注！');
        return;
    }

    // 嘲諷判斷
    players.forEach((p, idx) => {
        const betInput = document.getElementById(`bet-${idx}`);
        let bet = parseInt(betInput.value) || 0;
        // 只針對下注且不是all-in的玩家
        if (bet > 0 && bet < p.chips + bet) {
            const original = p.chips + bet;
            if (bet > original * 0.7) {
                showTaunt(p.name, bet);
            }
        }
    });

    // 執行下注
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

// 嘲諷圖顯示函式
function showTaunt(playerName, lostAmount) {
    // 若已存在則先移除
    let old = document.getElementById('taunt-img');
    if (old) old.remove();
    let taunt = document.createElement('div');
    taunt.id = 'taunt-img';
    taunt.innerHTML = `
        <img src="嘲諷.png" alt="taunt">
        <div class="taunt-text">
            ${playerName}竟然輸了${lostAmount}元，好弱喔
        </div>
    `;
    document.body.appendChild(taunt);
    setTimeout(() => {
        taunt.remove();
    }, 2500);
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
    winnerSelect.multiple = true;
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
        // 若原本淘汰則移除淘汰標記（renderPlayers 會自動處理）
        renderPlayers();
        renderBetting();
    };
}

distributeBtn.onclick = () => {
    const selected = Array.from(winnerSelect.selectedOptions).map(opt => parseInt(opt.value));
    if (selected.length === 0) return;
    const share = Math.floor(pot / selected.length);
    selected.forEach(idx => {
        players[idx].chips += share;
    });
    addHistory(selected);
    pot = 0;
    potSpan.textContent = pot;
    renderPlayers(selected.length === 1 ? selected[0] : null);
    renderBetting();
};

function addHistory(winnerIdxArr) {
    const t = i18n[currentLang];
    const li = document.createElement('li');
    const roundInfo = players.map((p, idx) =>
        `${p.name}(${p.chips}${winnerIdxArr.includes(idx)?'🏆':''})`
    ).join('，');
    let winnerNames = winnerIdxArr.map(idx => players[idx].name).join(', ');
    li.textContent = t.roundResult(winnerNames, roundInfo);
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

if (themeSelect) {
    themeSelect.onchange = () => {
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-casino', 'theme-tech', 'theme-rainbow');
        switch (themeSelect.value) {
            case 'dark':
                document.body.classList.add('theme-dark');
                break;
            case 'light':
                document.body.classList.add('theme-light');
                break;
            case 'casino':
                document.body.classList.add('theme-casino');
                break;
            case 'tech':
                document.body.classList.add('theme-tech');
                break;
            case 'rainbow':
                document.body.classList.add('theme-rainbow');
                break;
            default:
                // 預設主題
                break;
        }
    };
}

function autoMobileTemplate() {
    if (window.innerWidth <= 600) {
        document.body.classList.add('mobile-template');
    } else {
        document.body.classList.remove('mobile-template');
    }
}
window.addEventListener('resize', autoMobileTemplate);
window.addEventListener('DOMContentLoaded', autoMobileTemplate);

// 在 game-section 下方加一一个按鈕（HTML 需配合）
const addPlayerBtn = document.createElement('button');
addPlayerBtn.textContent = '新增玩家';
addPlayerBtn.onclick = () => {
    const name = prompt('輸入新玩家名稱');
    if (!name) return;
    players.push({
        name,
        chips: 1000,
        lastBet: 0,
        color: '#fff',
        icon: '💰'
    });
    renderPlayers();
    renderBetting();
    renderWinnerSelect();
    renderBlindSelect();
    renderReliefSelect();
};
gameSection.appendChild(addPlayerBtn);

const glossaryBtn = document.createElement('button');
glossaryBtn.textContent = '德州撲克術語解釋';
glossaryBtn.onclick = () => {
    alert(`常見術語：
All-in：全下，將所有籌碼押上。
Call：跟注，補到與最大下注額相同。
Raise：加注，提高下注額。
Fold：棄牌，放棄本局。
Blind：盲注，強制下注。
Pot：底池，所有下注總和。
...`);
};
gameSection.appendChild(glossaryBtn);

// 匯出CSV
if (exportCsvBtn) {
    exportCsvBtn.onclick = () => {
        let csv = '局數,勝者,分配紀錄\n';
        const items = Array.from(historyList.querySelectorAll('li'));
        items.reverse().forEach((li, idx) => {
            // 嘗試從 li.textContent 解析勝者與分配紀錄
            let txt = li.textContent;
            let winner = '';
            let status = '';
            const m = txt.match(/勝者：(.+?)，分配底池，現況：(.+)/) || txt.match(/Winner: (.+?), Pot distributed, Status: (.+)/);
            if (m) {
                winner = m[1];
                status = m[2];
            } else {
                status = txt;
            }
            csv += `${idx+1},"${winner}","${status}"\n`;
        });
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poker_history.csv';
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 100);
    };
}

// 匯出Excel（xlsx）功能
if (exportCsvBtn) {
    // 新增一個 Excel 匯出按鈕
    let exportExcelBtn = document.getElementById('export-excel-btn');
    if (!exportExcelBtn) {
        exportExcelBtn = document.createElement('button');
        exportExcelBtn.id = 'export-excel-btn';
        exportExcelBtn.textContent = '匯出Excel';
        exportCsvBtn.parentNode.insertBefore(exportExcelBtn, exportCsvBtn.nextSibling);
    }
    exportExcelBtn.onclick = () => {
        // 需要 SheetJS (xlsx) 套件，若未引入可用 CDN
        if (typeof XLSX === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = exportExcelBtn.onclick;
            document.body.appendChild(script);
            return;
        }
        // 產生資料
        let rows = [['局數', '勝者', '分配紀錄']];
        const items = Array.from(historyList.querySelectorAll('li'));
        items.reverse().forEach((li, idx) => {
            let txt = li.textContent;
            let winner = '';
            let status = '';
            const m = txt.match(/勝者：(.+?)，分配底池，現況：(.+)/) || txt.match(/Winner: (.+?), Pot distributed, Status: (.+)/);
            if (m) {
                winner = m[1];
                status = m[2];
            } else {
                status = txt;
            }
            rows.push([idx + 1, winner, status]);
        });
        // 轉為 worksheet
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '歷史紀錄');
        // 下載
        XLSX.writeFile(wb, 'poker_history.xlsx');
    };
}

// 匯出JSON
if (exportJsonBtn) {
    exportJsonBtn.onclick = () => {
        // 匯出玩家、歷史紀錄、底池等狀態
        const data = {
            players,
            pot,
            minBet,
            smallBlindIdx,
            bigBlindIdx,
            history: Array.from(historyList.querySelectorAll('li')).map(li => li.textContent)
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poker_history.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 100);
    };
}

// 匯入JSON
if (importJsonBtn && importJsonInput) {
    importJsonBtn.onclick = () => importJsonInput.click();
    importJsonInput.onchange = (e) => {
        const file = importJsonInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (!Array.isArray(data.players) || !Array.isArray(data.history)) {
                    alert('格式錯誤');
                    return;
                }
                // 還原玩家
                players = data.players;
                pot = data.pot || 0;
                minBet = data.minBet || 10;
                smallBlindIdx = data.smallBlindIdx || 0;
                bigBlindIdx = data.bigBlindIdx || 1;
                // 還原歷史紀錄
                historyList.innerHTML = '';
                data.history.forEach(txt => {
                    const li = document.createElement('li');
                    li.textContent = txt;
                    historyList.appendChild(li);
                });
                potSpan.textContent = pot;
                minBetInput.value = minBet;
                renderPlayers();
                renderBetting();
                renderWinnerSelect();
                renderBlindSelect();
                renderReliefSelect();
                alert('匯入完成');
            } catch(e) {
                alert('匯入失敗：' + e);
            }
        };
        reader.readAsText(file);
    };
}