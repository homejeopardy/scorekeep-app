class BaseballGame {
    constructor() {
        this.awayTeam = 'Away';
        this.homeTeam = 'Home';
        this.totalInnings = 7;
        this.currentInning = 1;
        this.currentBatter = 'away'; // 'away' or 'home'
        
        this.awayScore = { runs: 0, hits: 0, errors: 0, outs: 0, inningRuns: {} };
        this.homeScore = { runs: 0, hits: 0, errors: 0, outs: 0, inningRuns: {} };
        
        this.history = [];
        
        this.initializeInnings();
        this.loadGame();
        this.setupEventListeners();
        this.render();
    }

    initializeInnings() {
        for (let i = 1; i <= this.totalInnings; i++) {
            this.awayScore.inningRuns[i] = 0;
            this.homeScore.inningRuns[i] = 0;
        }
    }

    setupEventListeners() {
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('applySettingsBtn').addEventListener('click', () => this.applySettings());
        document.getElementById('resetGameBtn').addEventListener('click', () => this.resetGame());

        document.querySelectorAll('.score-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const team = e.target.dataset.team;
                const stat = e.target.dataset.stat;
                this.recordStat(team, stat);
            });
        });

        document.getElementById('awayEnd').addEventListener('click', () => this.endAtBat('away'));
        document.getElementById('homeEnd').addEventListener('click', () => this.endAtBat('home'));
        document.getElementById('awayUndo').addEventListener('click', () => this.undoLast('away'));
        document.getElementById('homeUndo').addEventListener('click', () => this.undoLast('home'));

        document.getElementById('nextInning').addEventListener('click', () => this.nextInning());
        document.getElementById('prevInning').addEventListener('click', () => this.prevInning());
    }

    openSettings() {
        document.getElementById('awayTeamInput').value = this.awayTeam;
        document.getElementById('homeTeamInput').value = this.homeTeam;
        document.getElementById('totalInningsInput').value = this.totalInnings;
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    applySettings() {
        this.awayTeam = document.getElementById('awayTeamInput').value || 'Away';
        this.homeTeam = document.getElementById('homeTeamInput').value || 'Home';
        const newInnings = parseInt(document.getElementById('totalInningsInput').value);
        
        if (newInnings !== this.totalInnings) {
            this.totalInnings = newInnings;
            this.initializeInnings();
        }
        
        this.saveGame();
        this.closeSettings();
        this.render();
    }

    recordStat(team, stat) {
        const teamScore = team === 'away' ? this.awayScore : this.homeScore;
        
        this.history.push({
            team,
            stat,
            inning: this.currentInning,
            timestamp: Date.now()
        });

        if (stat === 'run') {
            teamScore.runs++;
            teamScore.inningRuns[this.currentInning] = (teamScore.inningRuns[this.currentInning] || 0) + 1;
        } else if (stat === 'hit') {
            teamScore.hits++;
        } else if (stat === 'error') {
            teamScore.errors++;
        } else if (stat === 'out') {
            teamScore.outs++;
            if (teamScore.outs >= 3) {
                this.endAtBat(team);
            }
        }

        this.saveGame();
        this.render();
    }

    undoLast(team) {
        const lastAction = this.history.filter(h => h.team === team).pop();
        if (!lastAction) return;

        const teamScore = team === 'away' ? this.awayScore : this.homeScore;
        const stat = lastAction.stat;

        if (stat === 'run') {
            teamScore.runs--;
            teamScore.inningRuns[lastAction.inning]--;
        } else if (stat === 'hit') {
            teamScore.hits--;
        } else if (stat === 'error') {
            teamScore.errors--;
        } else if (stat === 'out') {
            teamScore.outs--;
        }

        this.history = this.history.filter(h => !(h.team === team && h === lastAction));
        this.saveGame();
        this.render();
    }

    endAtBat(team) {
        // Switch batter
        this.currentBatter = this.currentBatter === 'away' ? 'home' : 'away';
        this.saveGame();
        this.render();
    }

    nextInning() {
        if (this.currentInning < this.totalInnings) {
            this.currentInning++;
            this.currentBatter = 'away';
            this.saveGame();
            this.render();
        }
    }

    prevInning() {
        if (this.currentInning > 1) {
            this.currentInning--;
            this.currentBatter = 'away';
            this.saveGame();
            this.render();
        }
    }

    resetGame() {
        if (confirm('Reset the game? All scores will be cleared.')) {
            this.currentInning = 1;
            this.currentBatter = 'away';
            this.awayScore = { runs: 0, hits: 0, errors: 0, outs: 0, inningRuns: {} };
            this.homeScore = { runs: 0, hits: 0, errors: 0, outs: 0, inningRuns: {} };
            this.history = [];
            this.initializeInnings();
            this.saveGame();
            this.render();
        }
    }

    saveGame() {
        localStorage.setItem('baseball-game', JSON.stringify({
            awayTeam: this.awayTeam,
            homeTeam: this.homeTeam,
            totalInnings: this.totalInnings,
            currentInning: this.currentInning,
            currentBatter: this.currentBatter,
            awayScore: this.awayScore,
            homeScore: this.homeScore,
            history: this.history
        }));
    }

    loadGame() {
        const saved = localStorage.getItem('baseball-game');
        if (saved) {
            const data = JSON.parse(saved);
            this.awayTeam = data.awayTeam;
            this.homeTeam = data.homeTeam;
            this.totalInnings = data.totalInnings;
            this.currentInning = data.currentInning;
            this.currentBatter = data.currentBatter;
            this.awayScore = data.awayScore;
            this.homeScore = data.homeScore;
            this.history = data.history;
        }
    }

    render() {
        // Update headers
        document.getElementById('awayTeamName').textContent = this.awayTeam;
        document.getElementById('homeTeamName').textContent = this.homeTeam;
        document.getElementById('awayControlName').textContent = this.awayTeam;
        document.getElementById('homeControlName').textContent = this.homeTeam;

        // Update inning display
        document.getElementById('inningDisplay').textContent = `Inning ${this.currentInning} of ${this.totalInnings}`;
        document.getElementById('scoreDisplay').textContent = `${this.awayTeam} ${this.awayScore.runs} - ${this.homeScore.runs} ${this.homeTeam}`;

        // Update game status
        const batterTeam = this.currentBatter === 'away' ? this.awayTeam : this.homeTeam;
        document.getElementById('gameStatus').textContent = `${batterTeam} at Bat`;

        // Update stats displays
        document.getElementById('awayRuns').textContent = this.awayScore.runs;
        document.getElementById('awayHits').textContent = this.awayScore.hits;
        document.getElementById('awayErrors').textContent = this.awayScore.errors;
        document.getElementById('awayOuts').textContent = this.awayScore.outs;

        document.getElementById('homeRuns').textContent = this.homeScore.runs;
        document.getElementById('homeHits').textContent = this.homeScore.hits;
        document.getElementById('homeErrors').textContent = this.homeScore.errors;
        document.getElementById('homeOuts').textContent = this.homeScore.outs;

        // Update scoreboard
        this.renderScoreboard();
    }

    renderScoreboard() {
        const tbody = document.getElementById('scoreboardBody');
        tbody.innerHTML = '';

        // Create rows for each team
        const rows = [
            { name: this.awayTeam, score: this.awayScore, isAway: true },
            { name: this.homeTeam, score: this.homeScore, isAway: false }
        ];

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700';
            
            let html = `<td class="px-2 py-2 font-bold text-left">${row.name}</td>`;
            
            for (let i = 1; i <= this.totalInnings; i++) {
                const runs = row.score.inningRuns[i] || 0;
                html += `<td class="px-2 py-2 border-l border-gray-700 ${i === this.currentInning ? 'bg-yellow-900' : ''}">${runs}</td>`;
            }
            
            html += `<td class="px-2 py-2 border-l border-gray-700 text-right font-bold">${row.score.runs}</td>`;
            html += `<td class="px-2 py-2 border-l border-gray-700 text-right font-bold">${row.score.hits}</td>`;
            html += `<td class="px-2 py-2 border-l border-gray-700 text-right font-bold">${row.score.errors}</td>`;
            
            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new BaseballGame();
});
