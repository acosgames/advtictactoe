import fs from 'flatstore';

fs.set('state', {});
fs.set('players', {});
fs.set('rules', {});
fs.set('prev', {});
fs.set('next', {});
fs.set('events', {});

export function GameLoader(props) {
    attachMessageEvent()
    let Comp = props.component;
    return (<Comp></Comp>)
}

export async function attachMessageEvent() {
    window.addEventListener('message', (evt) => {
        let message = evt.data;
        let origin = evt.origin;
        let source = evt.source;
        console.log('Game Updated:', message);
        if (!message)
            return;

        if (message.state) {
            fs.set('state', message.state);
        }
        if (message.players) {
            fs.set('players', message.players);
        }
        if (message.rules) {
            fs.set('rules', message.rules);
        }
        if (message.next) {
            fs.set('next', message.next);
        }
        if (message.prev) {
            fs.set('prev', message.prev);
        }
        if (message.events) {
            let eventMap = {}
            message.events.forEach(v => { eventMap[v] = true })
            fs.set('events', eventMap);
        } else {
            fs.set('events', null);
        }
    }, false);
}

export async function send(type, payload) {
    window.parent.postMessage({ type, payload }, '*');
}