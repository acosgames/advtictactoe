

import React, { Component } from 'react';

import fs from 'flatstore';
import { send } from '../acosg';

fs.set('state-cells', {
    0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: ''
})

class Cell extends Component {
    constructor(props) {
        super(props);
        this.ref = null;
    }

    clicked(id, item) {
        let selectedSize = this.props.selectedSize || 0;
        console.log('clicked cellid: ', id);
        send('pick', { cell: id, size: selectedSize });
    }

    //set up defaults on page mount
    componentDidMount() {
        //add dimensions listener for window resizing
        window.addEventListener('resize', this.updatePosition.bind(this));
    }

    //remove listener on page exit
    componentWillUnmount() {
        window.removeEventListener('resize', this.updatePosition.bind(this));
    }

    updatePosition() {
        if (!this.ref)
            return;

        let rect = JSON.stringify(this.ref.getBoundingClientRect());
        rect = JSON.parse(rect);
        rect.offsetWidth = this.ref.offsetWidth;
        rect.offsetHeight = this.ref.offsetHeight;

        fs.set('cell' + this.props.id, rect);
    }
    render() {
        let id = this.props.id;
        let cellType = this.props.celltype || '';
        let cellSize = this.props.cellsize || 0;

        let color = "color-" + cellType;

        let selectedSize = this.props.selectedSize || 0;
        let isAllowed = selectedSize > cellSize;
        let inactive = (!isAllowed || (cellType == 'R' || cellType == 'B')) ? '' : ' inactive ';
        let classIsAllowed = isAllowed ? 'allowed' : '';
        return (
            <div
                className={"cell ttt-" + id + ' ' + color + inactive + ' ' + classIsAllowed}
                onClick={() => this.clicked(id)}
                onTouchEnd={() => this.clicked(id)}

                ref={el => {
                    if (!el) return;
                    this.ref = el;
                    this.updatePosition();
                    // setTimeout(this.updatePosition.bind(this), 100);
                }}>

                <span className={color + ' foreground'}>{cellSize > 0 ? cellSize : ''}</span>
                <span className={color + ' background'}>{cellSize > 0 ? cellSize : ''}</span>

            </div>
        )
    }
}



let onCustomWatched = ownProps => {
    return ['state-cells-' + ownProps.id, 'selectedSize'];
};
let onCustomProps = (key, value, store, ownProps) => {

    if (key == 'selectedSize') {
        return {
            selectedSize: value
        }
    }

    return {
        celltype: value?.length ? value[0] : '',
        cellsize: value?.length ? value[1] : ''
    };
};
export default fs.connect([], onCustomWatched, onCustomProps)(Cell);