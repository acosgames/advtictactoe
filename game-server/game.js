import cup from './acosg';

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
        cup.setGame(defaultGame);
        this.checkNewRound();
    }

    onSkip(action) {
        let next = cup.next();
        if (!next || !next.id)
            return;
        // let id = action.payload.id;
        // if (!next.id) {
        //     id = next.id;
        // }

        this.playerLeave(next.id);
    }

    onJoin(action) {
        cup.log(action);
        if (!action.user.id)
            return;

        let player = cup.players(action.user.id);
        player.rank = 2;
        player.score = 0;

        let playerCount = cup.playerCount();
        if (playerCount <= 2) {
            cup.event('join', {
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
        let playerCount = cup.playerCount();
        if (playerCount >= 2) {
            this.newRound();
        }
    }

    newRound() {
        let playerList = cup.playerList();

        let state = cup.state();
        //select the starting player
        if (!state.sx || state.sx.length == 0) {
            state.sx = this.selectNextPlayer(playerList[Math.floor(Math.random() * playerList.length)]);
        }
        else {
            state.sx = this.selectNextPlayer(state.sx);
        }

        //set the starting player, and set type for other player
        let players = cup.players();
        for (var id in players) {
            players[id].type = 'R';
            players[id].items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }

        players[state.sx].type = 'B';

        cup.event('newround', true);
        cup.setTimelimit(25);
    }

    selectNextPlayer(userid) {
        let action = cup.action();
        let players = cup.playerList();
        userid = userid || action.user.id;
        //only 2 players so just filter the current player
        let remaining = players.filter(x => x != userid);
        cup.next({
            id: remaining[0],
            action: 'pick'
        });
        return remaining[0];
    }


    onLeave(action) {
        this.playerLeave(action.user.id);
    }

    playerLeave(id) {
        let players = cup.players();
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
        let state = cup.state();
        let player = cup.players(action.user.id);

        //get the picked cell
        let cellid = action.payload.cell;
        let size = action.payload.size;
        if (typeof cellid !== 'number' || typeof size !== 'number')
            return false;

        let cell = state.cells[cellid];

        // block picking cells with markings, and send error
        if (cell.length > 0) {

            let owner = cell[0];
            let ownersize = Number(cell[1]);

            if (owner == player.type || size < ownersize) {
                cup.next({
                    id: action.user.id,
                    action: 'pick',
                    error: 'INVALID_PLAY'
                })
                return false;
            }
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

        cup.event('picked', {
            cell: cellid, id, type, size
        });
        // cup.prev()

        if (this.checkWinner()) {
            return;
        }

        cup.setTimelimit(20);
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
        let cells = cup.state().cells;
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
        let cells = cup.state().cells;
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
        let players = cup.players();
        for (var id in players) {
            let player = players[id];
            if (player.type == type)
                return id;
        }
        return null;
    }


    setTie() {
        cup.gameover({ type: 'tie' })
        cup.next({});
        // cup.prev({})

        // cup.killGame();
    }
    // set the winner event and data
    setWinner(type, strip) {
        //find user who matches the win type
        let userid = this.findPlayerWithType(type);
        let player = cup.players(userid);
        player.rank = 1;
        player.score = player.score + 100;
        if (!player) {
            player.id = 'unknown player';
        }

        cup.gameover({
            type: 'winner',
            pick: type,
            strip: strip,
            id: userid
        });
        // cup.prev()
        cup.next({});
        // cup.killGame();
    }
}

export default new Tictactoe();