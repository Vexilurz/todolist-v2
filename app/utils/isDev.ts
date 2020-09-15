export let isDev = () => { 
    return !(process.env.NODE_ENV === 'production')
};     