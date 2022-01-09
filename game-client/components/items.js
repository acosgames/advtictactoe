
import fs from 'flatstore';
import { useState } from 'react';


function Item(props) {

    const onSelected = (item) => {
        fs.set('selectedSize', item);
    }

    let item = props.item;
    let classSelected = props.isSelected ? 'selected' : '';

    return (
        <button className={"item " + classSelected} onClick={() => { onSelected(item) }}>{item}</button>
    )
}


function Items(props) {

    let local = fs.get('local');
    let items = local.items || [];
    let itemButtons = [];
    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let isSelected = props.selectedSize == item;
        itemButtons.push(
            <Item key={'item-' + item} item={item} isSelected={isSelected} />
        )
    }

    return (
        <div className={'items ' + 'color-' + (local.type || '')}>
            {itemButtons}
        </div>
    )
}

export default fs.connect(['local-items', 'selectedSize'])(Items);