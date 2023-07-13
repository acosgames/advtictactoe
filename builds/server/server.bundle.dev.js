/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./game-server/acosg.js":
/*!******************************!*\
  !*** ./game-server/acosg.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const globals = {
    log,
    error,
    finish,
    random,
    game,
    actions,
    killGame,
    database,
    ignore
}

class ACOSG {
    constructor() {
        try {
            this.actions = JSON.parse(JSON.stringify(globals.actions()));
        }
        catch (e) { this.error('Failed to load actions'); return }
        try {
            this.originalGame = JSON.parse(JSON.stringify(globals.game()));
        }
        catch (e) { this.error('Failed to load originalGame'); return }
        try {
            this.nextGame = JSON.parse(JSON.stringify(globals.game()));
        }
        catch (e) { this.error('Failed to load nextGame'); return }


        this.currentAction = null;

        this.isNewGame = false;
        // this.markedForDelete = false;
        this.defaultSeconds = 15;
        // this.nextTimeLimit = -1;
        this.kickedPlayers = [];

        // if (!this.nextGame || !this.nextGame.rules || Object.keys(this.nextGame.rules).length == 0) {
        //     this.isNewGame = true;
        //     this.error('Missing Rules');
        // }

        if (this.nextGame) {
            if (!('timer' in this.nextGame)) {
                this.nextGame.timer = {};
            }
            if (!('state' in this.nextGame)) {
                this.nextGame.state = {};
            }

            if (!('players' in this.nextGame)) {
                this.nextGame.players = {};
            }

            //if (!('prev' in this.nextGame)) {
            this.nextGame.prev = {};
            //}

            if (!('next' in this.nextGame)) {
                this.nextGame.next = {};
            }

            if (!('rules' in this.nextGame)) {
                this.nextGame.rules = {};
            }

            this.nextGame.events = {};
        }



    }

    on(type, cb) {

        // if (type == 'newgame') {
        //     //if (this.isNewGame) {
        //     this.currentAction = this.actions[0];
        //     if (this.currentAction.type == '')
        //         cb(this.actions[0]);
        //     this.isNewGame = false;
        //     //}

        //     return;
        // }

        for (var i = 0; i < this.actions.length; i++) {
            if (this.actions[i].type == type) {
                this.currentAction = this.actions[i];
                let result = cb(this.currentAction);
                if (typeof result == "boolean" && !result) {
                    this.ignore();
                    break;
                }
            }

        }

    }

    ignore() {
        globals.ignore();
    }

    setGame(game) {
        for (var id in this.nextGame.players) {
            let player = this.nextGame.players[id];
            game.players[id] = player;
        }
        this.nextGame = game;
    }

    submit() {
        if (this.kickedPlayers.length > 0)
            this.nextGame.kick = this.kickedPlayers;

        globals.finish(this.nextGame);
    }

    gameover(payload) {
        this.event('gameover', payload);
    }

    log(msg) {
        globals.log(msg);
    }
    error(msg) {
        globals.error(msg);
    }

    kickPlayer(id) {
        this.kickedPlayers.push(id);
    }

    database() {
        return globals.database();
    }

    action() {
        return this.currentAction;
    }

    state(key, value) {

        if (typeof key === 'undefined')
            return this.nextGame.state;
        if (typeof value === 'undefined')
            return this.nextGame.state[key];

        this.nextGame.state[key] = value;
    }

    playerList() {
        return Object.keys(this.nextGame.players);
    }
    playerCount() {
        return Object.keys(this.nextGame.players).length;
    }

    players(userid, value) {
        if (typeof userid === 'undefined')
            return this.nextGame.players;
        if (typeof value === 'undefined')
            return this.nextGame.players[userid];

        this.nextGame.players[userid] = value;
    }

    rules(rule, value) {
        if (typeof rule === 'undefined')
            return this.nextGame.rules;
        if (typeof value === 'undefined')
            return this.nextGame.rules[rule];

        this.nextGame.rules[rule] = value;
    }

    prev(obj) {
        if (typeof obj === 'object') {
            this.nextGame.prev = obj;
        }
        return this.nextGame.prev;
    }

    next(obj) {
        if (typeof obj === 'object') {
            this.nextGame.next = obj;
        }
        return this.nextGame.next;
    }

    setTimelimit(seconds) {
        seconds = seconds || this.defaultSeconds;
        if (!this.nextGame.timer)
            this.nextGame.timer = {};
        this.nextGame.timer.set = seconds;// Math.min(60, Math.max(10, seconds));
    }

    reachedTimelimit(action) {
        if (typeof action.timeleft == 'undefined')
            return false;
        return action.timeleft <= 0;
    }

    event(name, payload) {
        if (!payload)
            return this.nextGame.events[name];

        this.nextGame.events[name] = payload || {};
    }

    clearEvents() {
        this.nextGame.events = {};
    }
    // events(name) {
    //     if (typeof name === 'undefined')
    //         return this.nextGame.events;
    //     this.nextGame.events.push(name);
    // }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new ACOSG());

/***/ }),

/***/ "./game-server/game.js":
/*!*****************************!*\
  !*** ./game-server/game.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _acosg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./acosg */ "./game-server/acosg.js");


let defaultGame = {
    state: {
        cells: {
            0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: ''
        },
        // cells: ['', '', '', '', '', '', '', '', ''],
        //sx: ''
    },
    players: {},
    next: {},
    events: {}
}

class Tictactoe {

    onNewGame(action) {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setGame(defaultGame);
        this.checkNewRound();
    }

    onSkip(action) {
        let next = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next();
        if (!next || !next.id)
            return;
        // let id = action.payload.id;
        // if (!next.id) {
        //     id = next.id;
        // }

        this.playerLeave(next.id);
    }

    onJoin(action) {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log(action);
        if (!action.user.id)
            return;

        let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(action.user.id);
        player.rank = 2;
        player.score = 0;

        let playerCount = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerCount();
        if (playerCount <= 2) {
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].event('join', {
                id: action.user.id
            });
            // this.checkNewRound();
        }
        else {

        }


        // if (cup.players(action.user.id).type)
        //     return;


    }

    checkNewRound() {
        //if player count reached required limit, start the game
        //let maxPlayers = cup.rules('maxPlayers') || 2;
        let playerCount = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerCount();
        if (playerCount >= 2) {
            this.newRound();
        }
    }

    newRound() {
        let playerList = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerList();

        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        //select the starting player
        if (!state.sx || state.sx.length == 0) {
            state.sx = this.selectNextPlayer(playerList[Math.floor(Math.random() * playerList.length)]);
        }
        else {
            state.sx = this.selectNextPlayer(state.sx);
        }

        //set the starting player, and set type for other player
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        for (var id in players) {
            players[id].type = 'R';
            players[id].items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }

        players[state.sx].type = 'B';

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].event('newround', true);
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setTimelimit(25);
    }

    selectNextPlayer(userid) {
        let action = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].action();
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerList();
        userid = userid || action.user.id;
        //only 2 players so just filter the current player
        let remaining = players.filter(x => x != userid);
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({
            id: remaining[0],
            action: 'pick'
        });
        return remaining[0];
    }


    onLeave(action) {
        this.playerLeave(action.user.id);
    }

    playerLeave(id) {
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        let otherPlayerId = null;
        if (players[id]) {
            otherPlayerId = this.selectNextPlayer(id);
            //delete players[id];
        }

        if (otherPlayerId) {
            let otherPlayer = players[otherPlayerId];
            this.setWinner(otherPlayer.type, 'forfeit')
        }
    }

    onPick(action) {
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(action.user.id);

        //get the picked cell
        let cellid = action.payload.cell;
        let size = Number(action.payload.size);
        if (typeof cellid !== 'number' || typeof size !== 'number')
            return false;

        let cell = state.cells[cellid];

        // block picking cells with markings, and send error
        if (cell.length > 0) {

            let owner = cell[0];
            let ownersize = Number(cell[1]);

            if (owner == player.type || size <= ownersize) {
                return false;
            }
        }

        if (!player.items.includes(size)) {
            return false;
        }

        //mark the selected cell
        let type = player.type;
        let id = action.user.id;
        state.cells[cellid] = type + size;

        let newItems = [];
        for (var i = 0; i < player.items.length; i++) {
            let item = player.items[i];
            if (item != size)
                newItems.push(item);
        }

        player.items = newItems;

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].event('picked', {
            cell: cellid, id, type, size
        });
        // cup.prev()

        if (this.checkWinner()) {
            return;
        }

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setTimelimit(20);
        this.selectNextPlayer(null);
    }



    // Check each strip that makes a win
    //      0  |  1  |  2
    //    -----------------
    //      3  |  4  |  5
    //    -----------------
    //      6  |  7  |  8
    checkWinner() {
        if (this.check([0, 1, 2])) return true;
        if (this.check([3, 4, 5])) return true;
        if (this.check([6, 7, 8])) return true;
        if (this.check([0, 3, 6])) return true;
        if (this.check([1, 4, 7])) return true;
        if (this.check([2, 5, 8])) return true;
        if (this.check([0, 4, 8])) return true;
        if (this.check([6, 4, 2])) return true;
        if (this.checkNoneEmpty()) return true;
        return false;
    }

    checkNoneEmpty() {
        let cells = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state().cells;
        let cellslist = [];
        for (var key in cells) {
            cellslist.push(cells[key]);
        }
        let filtered = cellslist.filter(v => v == '');

        if (filtered.length == 0) {
            this.setTie();
        }
        return filtered.length == 0;
    }

    // checks if a strip has matching types
    check(strip) {
        let cells = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state().cells;
        let cellslist = [];
        for (var key in cells) {
            cellslist.push(cells[key]);
        }


        let first = cellslist[strip[0]];
        if (first == '')
            return false;
        let firstOwner = first[0];
        let filtered = strip.filter(id => {
            let cell = cellslist[id];
            let owner = cell[0];
            return (owner == firstOwner)
        });

        if (filtered.length == 3 && filtered.length == strip.length) {
            this.setWinner(firstOwner, strip);
            return true;
        }
        return false;
    }

    findPlayerWithType(type) {
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        for (var id in players) {
            let player = players[id];
            if (player.type == type)
                return id;
        }
        return null;
    }


    setTie() {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].gameover({ type: 'tie' })
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({});
        // cup.prev({})

        // cup.killGame();
    }
    // set the winner event and data
    setWinner(type, strip) {
        //find user who matches the win type
        let userid = this.findPlayerWithType(type);
        let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(userid);
        player.rank = 1;
        player.score = player.score + 100;
        if (!player) {
            player.id = 'unknown player';
        }

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].gameover({
            type: 'winner',
            pick: type,
            strip: strip,
            id: userid
        });
        // cup.prev()
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({});
        // cup.killGame();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new Tictactoe());

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./game-server/index.js ***!
  \******************************/
/* harmony import */ var _acosg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./acosg */ "./game-server/acosg.js");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game */ "./game-server/game.js");




_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('gamestart', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onNewGame(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('skip', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onSkip(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('join', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onJoin(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('leave', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onLeave(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('pick', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onPick(action));

_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].submit();
})();

/******/ })()
;
//# sourceMappingURL=server.bundle.dev.js.map