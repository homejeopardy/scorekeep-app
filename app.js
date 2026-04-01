class ScoreKeeper {
    constructor() {
        this.teams = [];
        this.gameType = 'points';
        this.teamCount = 2;
        this.initializeEventListeners();
        this.initializeGame();
    }

    initializeEventListeners() {
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('applySettingsBtn').addEventListener('click', () => this.applySettings());
        document.getElementById('resetGameBtn').addEventListener('click', () => this.resetGame());
    }

    initializeGame() {
        this.loadSettings();
        this.createTeams();
        this.render();
    }

    loadSettings() {
        const saved = localStorage.getItem('scorekeeper-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.teamCount = settings.teamCount || 2;
            this.gameType = settings.gameType || 'points';
        }
    }

    saveSettings() {
        localStorage.setItem('scorekeeper-settings', JSON.stringify({
            teamCount: this.teamCount,
            gameType: this.gameType
        }));
    }

    createTeams() {
        this.teams = [];
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
        
        for (let i = 0; i < this.teamCount; i++) {
            this.teams.push({
                id: i,
                name: `Team ${i + 1}`,
                score: 0,
                roundsWon: 0,
                history: [],
                color: colors[i % colors.length],
                customName: localStorage.getItem(`team-${i}-name`) || `Team ${i + 1}`
            });
        }
    }

    openSettings() {
        document.getElementById('teamCountInput').value = this.teamCount;
        document.getElementById('gameTypeSelect').value = this.gameType;
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    applySettings() {
        const newTeamCount = parseInt(document.getElementById('teamCountInput').value);
        const newGameType = document.getElementById('gameTypeSelect').value;

        if (newTeamCount !== this.teamCount || newGameType !== this.gameType) {
            this.teamCount = newTeamCount;
            this.gameType = newGameType;
            this.saveSettings();
            this.createTeams();
            this.render();
        }

        this.closeSettings();
    }

    resetGame() {
        if (confirm('Are you sure you want to reset the game? This cannot be undone.')) {
            this.teams.forEach(team => {
                team.score = 0;
                team.roundsWon = 0;
                team.history = [];
            });
            this.render();
        }
    }

    updateScore(teamId, points) {
        if (teamId < this.teams.length) {
            this.teams[teamId].score += points;
            this.teams[teamId].history.push({
                points,
                timestamp: new Date().getTime()
            });
            this.render();
        }
    }

    updateTeamName(teamId, name) {
        if (teamId < this.teams.length) {
            this.teams[teamId].customName = name;
            localStorage.setItem(`team-${teamId}-name`, name);
            this.render();
        }
    }

    undoLastScore(teamId) {
        if (teamId < this.teams.length && this.teams[teamId].history.length > 0) {
            const lastScore = this.teams[teamId].history.pop();
            this.teams[teamId].score -= lastScore.points;
            this.render();
        }
    }

    recordRoundWin(teamId) {
        if (teamId < this.teams.length) {
            this.teams[teamId].roundsWon++;
            this.render();
        }
    }

    getLeaderboard() {
        return [...this.teams].sort((a, b) => b.score - a.score);
    }

    render() {
        const container = document.getElementById('teamsContainer');
        container.innerHTML = '';

        this.teams.forEach(team => {
            const teamCard = this.createTeamCard(team);
            container.appendChild(teamCard);
        });
    }

    createTeamCard(team) {
        const card = document.createElement('div');
        card.className = `${team.color} rounded-lg p-4 shadow-lg transform transition hover:scale-105`;
        card.innerHTML = `
            <div class="mb-4">
                <input 
                    type="text" 
                    value="${team.customName}" 
                    class="w-full bg-white bg-opacity-20 rounded px-2 py-1 text-white font-bold text-center mb-2 outline-none focus:bg-opacity-40"
                    placeholder="Team name"
                    data-team-id="${team.id}"
                />
            </div>

            <div class="text-center mb-4">
                <div class="text-5xl font-bold">${team.score}</div>
                <div class="text-sm opacity-80 mt-1">Points</div>
                ${this.gameType === 'rounds' ? `<div class="text-2xl font-semibold mt-2">${team.roundsWon} Rounds</div>` : ''}
            </div>

            <div class="grid grid-cols-3 gap-2 mb-4">
                <button class="bg-white bg-opacity-20 hover:bg-opacity-40 py-2 px-2 rounded font-semibold score-btn" data-team-id="${team.id}" data-points="1">+1</button>
                <button class="bg-white bg-opacity-20 hover:bg-opacity-40 py-2 px-2 rounded font-semibold score-btn" data-team-id="${team.id}" data-points="5">+5</button>
                <button class="bg-white bg-opacity-20 hover:bg-opacity-40 py-2 px-2 rounded font-semibold score-btn" data-team-id="${team.id}" data-points="10">+10</button>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-4">
                <button class="bg-white bg-opacity-20 hover:bg-opacity-40 py-2 px-2 rounded font-semibold score-btn" data-team-id="${team.id}" data-points="-1">-1</button>
                <button class="bg-white bg-opacity-20 hover:bg-opacity-40 py-2 px-2 rounded font-semibold undo-btn" data-team-id="${team.id}">Undo</button>
            </div>

            ${this.gameType === 'rounds' ? `
                <button class="w-full bg-white bg-opacity-20 hover:bg-opacity-40 py-2 px-2 rounded font-semibold round-btn" data-team-id="${team.id}">Record Round Win</button>
            ` : ''}

            <div class="mt-4 text-xs opacity-70">
                <div class="font-semibold mb-2">Recent:</div>
                ${team.history.slice(-5).reverse().map(h => `<div class="text-center">${h.points > 0 ? '+' : ''}${h.points}</div>`).join('') || '<div class="text-center">No history</div>'}
            </div>
        `;

        // Add event listeners
        card.querySelectorAll('.score-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = parseInt(e.target.dataset.teamId);
                const points = parseInt(e.target.dataset.points);
                this.updateScore(teamId, points);
            });
        });

        card.querySelectorAll('.undo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = parseInt(e.target.dataset.teamId);
                this.undoLastScore(teamId);
            });
        });

        card.querySelectorAll('.round-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = parseInt(e.target.dataset.teamId);
                this.recordRoundWin(teamId);
            });
        });

        card.querySelector('input').addEventListener('change', (e) => {
            const teamId = parseInt(e.target.dataset.teamId);
            this.updateTeamName(teamId, e.target.value);
        });

        return card;
    }
}

// Initialize the app
let scoreKeeper;
document.addEventListener('DOMContentLoaded', () => {
    scoreKeeper = new ScoreKeeper();
});
