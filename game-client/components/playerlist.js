
import React, { Component } from 'react';

import fs from 'flatstore';

class PlayerList extends Component {
    constructor(props) {
        super(props);
    }

    renderPlayers() {
        //not initialized yet
        if (!this.props.players) {
            return (<React.Fragment></React.Fragment>)
        }

        //don't draw if no player exists
        let playerids = Object.keys(this.props.players);
        if (playerids.length == 0) {
            return (<React.Fragment></React.Fragment>)
        }

        //draw local player name
        let local = fs.get('local');
        let players = [];
        let nextUserId = fs.get('next-userid');

        let nextTag = nextUserId == local.userid ? " > " : "";
        let type = local.type || '';
        players.push(<li>
            <h2><span className="nextTag">{nextTag}</span>You are <span className="ttt-type">{type.toUpperCase()}</span></h2>
        </li>)

        //draw other players
        for (var id in this.props.players) {
            if( local.userid == id )
                continue;
            let player = this.props.players[id];
            nextTag = nextUserId == id ? " > " : "";
            type = player.type || '';
            players.push(
                <li>
                    <h3><span className="nextTag">{nextTag}</span>{player.name} is <span className="ttt-type">{type.toUpperCase()}</span></h3>
                </li>
            )
        }
        return players;
    }

    render() {
        return (
            <ul className="playerlist">
                {this.renderPlayers()}
            </ul>

        )
    }

}

export default fs.connect(['players', 'next-userid'])(PlayerList);;