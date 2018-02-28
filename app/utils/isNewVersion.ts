export let isNewVersion = (current:string, next:string) => cmpVersions(current, next)<0;



let cmpVersions = (current:string, next:string) => {
    let i, diff;
    let regExStrip0 = /(\.0+)+$/;
    let segmentsA = current.replace(regExStrip0, '').split('.');
    let segmentsB = next.replace(regExStrip0, '').split('.');
    let l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if(diff){ return diff }
    }

    return segmentsA.length - segmentsB.length;
}; 