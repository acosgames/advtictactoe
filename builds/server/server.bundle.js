(()=>{"use strict";const e=new class{constructor(){try{this.actions=JSON.parse(JSON.stringify(globals.actions()))}catch(e){return void this.error("Failed to load actions")}try{this.originalGame=JSON.parse(JSON.stringify(globals.game()))}catch(e){return void this.error("Failed to load originalGame")}try{this.nextGame=JSON.parse(JSON.stringify(globals.game()))}catch(e){return void this.error("Failed to load nextGame")}this.currentAction=null,this.isNewGame=!1,this.markedForDelete=!1,this.defaultSeconds=15,this.kickedPlayers=[],this.nextGame&&0!=Object.keys(this.nextGame.rules).length||(this.isNewGame=!0,this.error("Missing Rules")),this.nextGame&&("timer"in this.nextGame||(this.nextGame.timer={}),"state"in this.nextGame||(this.nextGame.state={}),"players"in this.nextGame||(this.nextGame.players={}),this.nextGame.prev={},"next"in this.nextGame||(this.nextGame.next={}),"rules"in this.nextGame||(this.nextGame.rules={}),this.nextGame.events=[])}on(e,t){if("newgame"!=e)for(var i=0;i<this.actions.length;i++)this.actions[i].type==e&&(this.currentAction=this.actions[i],t(this.currentAction));else this.isNewGame&&(this.currentAction=this.actions[0],t(this.actions[0]),this.isNewGame=!1)}setGame(e){for(var t in this.nextGame.players){let i=this.nextGame.players[t];e.players[t]={name:i.name}}this.nextGame=e}submit(){this.kickedPlayers.length>0&&(this.nextGame.kick=this.kickedPlayers),globals.finish(this.nextGame)}killGame(){this.markedForDelete=!0,globals.killGame()}log(e){globals.log(e)}error(e){globals.error(e)}kickPlayer(e){this.kickedPlayers.push(e)}database(){return globals.database()}action(){return this.currentAction}state(e,t){return void 0===e?this.nextGame.state:void 0===t?this.nextGame.state[e]:void(this.nextGame.state[e]=t)}playerList(){return Object.keys(this.nextGame.players)}playerCount(){return Object.keys(this.nextGame.players).length}players(e,t){return void 0===e?this.nextGame.players:void 0===t?this.nextGame.players[e]:void(this.nextGame.players[e]=t)}rules(e,t){return void 0===e?this.nextGame.rules:void 0===t?this.nextGame.rules[e]:void(this.nextGame.rules[e]=t)}prev(e){return"object"==typeof e&&(this.nextGame.prev=e),this.nextGame.prev}next(e){return"object"==typeof e&&(this.nextGame.next=e),this.nextGame.next}setTimelimit(e){e=e||this.defaultSeconds,this.nextGame.timer||(this.nextGame.timer={}),this.nextGame.timer.set=Math.min(60,Math.max(10,e))}reachedTimelimit(e){return void 0!==e.timeleft&&e.timeleft<=0}event(e){this.nextGame.events.push(e)}clearEvents(){this.nextGame.events=[]}events(e){if(void 0===e)return this.nextGame.events;this.nextGame.events.push(e)}};let t={state:{cells:["","","","","","","","",""],startPlayer:""},players:{},rules:{bestOf:5,maxPlayers:2},next:{},events:[]};const i=new class{onNewGame(i){e.setGame(t),this.checkNewRound()}onSkip(t){let i=e.next();i&&i.id&&this.playerLeave(i.id)}onJoin(t){e.log(t),t.user.id&&this.checkNewRound()}checkNewRound(){let t=e.rules("maxPlayers")||2;e.playerCount()>=t&&this.newRound()}onLeave(e){this.playerLeave(e.user.id)}playerLeave(t){let i=e.players(),s=null;if(i[t]&&(s=this.selectNextPlayer(t)),s){let e=i[s];this.setWinner(e.type,"forfeit")}}onPick(t){let i=e.state(),s=e.players(t.user.id),n=t.payload.cell;if(i.cells[n].length>0)return void e.next({id:t.user.id,action:"pick",error:"NOT_EMPTY"});let a=s.type,r=t.user.id;i.cells[n]=a,e.event("picked"),e.prev({cellid:n,id:r}),this.checkWinner()||(e.setTimelimit(20),this.selectNextPlayer(null))}newRound(){let t=e.playerList(),i=e.state();i.startPlayer&&0!=i.startPlayer.length?i.startPlayer=this.selectNextPlayer(i.startPlayer):i.startPlayer=this.selectNextPlayer(t[Math.floor(Math.random()*t.length)]);let s=e.players();for(var n in s)s[n].type="O";s[i.startPlayer].type="X"}selectNextPlayer(t){let i=e.action(),s=e.playerList();t=t||i.user.id;let n=s.filter((e=>e!=t));return e.next({id:n[0],action:"pick"}),n[0]}checkWinner(){return!!(this.check([0,1,2])||this.check([3,4,5])||this.check([6,7,8])||this.check([0,3,6])||this.check([1,4,7])||this.check([2,5,8])||this.check([0,4,8])||this.check([6,4,2])||this.checkNoneEmpty())}checkNoneEmpty(){let t=e.state().cells.filter((e=>""==e));return 0==t.length&&this.setTie(),0==t.length}check(t){let i=e.state().cells,s=i[t[0]];if(""==s)return!1;let n=t.filter((e=>i[e]==s));return 3==n.length&&n.length==t.length&&(this.setWinner(s,t),!0)}findPlayerWithType(t){let i=e.players();for(var s in i)if(i[s].type==t)return s;return null}setTie(){e.clearEvents(),e.event("tie"),e.next({}),e.prev({}),e.killGame()}setWinner(t,i){let s=this.findPlayerWithType(t),n=e.players(s);n||(n.id="unknown player"),e.clearEvents(),e.event("winner"),e.prev({pick:t,strip:i,id:s}),e.next({}),e.killGame()}};e.on("newgame",(e=>i.onNewGame(e))),e.on("skip",(e=>i.onSkip(e))),e.on("join",(e=>i.onJoin(e))),e.on("leave",(e=>i.onLeave(e))),e.on("pick",(e=>i.onPick(e))),e.submit()})();