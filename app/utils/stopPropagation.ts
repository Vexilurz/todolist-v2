
export let stopPropagation = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    return e;
};