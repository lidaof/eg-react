/**
 * implementing UCSC like binning schema in JS
 * check http://genomewiki.ucsc.edu/index.php/Bin_indexing_system
 * modified from tabix C code
 * @author: Daofeng Li
 */

function* xrange(start, stop, step){
    if(stop === undefined){
        stop = start;
        start = 0;
    }

    if(step === undefined){
        step = 1;
    }
    
    for(let i=start; start < stop ? i < stop : i > stop; i += step){
        yield i;
    }
}

 
 /**
  *convert region to bin
  *
  * @export
  * @param {*} beg
  * @param {*} end
  * @returns
  */
 export function reg2bin(beg, end){
    end -= 1;
    if (beg>>14 === end>>14){ return 4681 + (beg>>14);}
    if (beg>>17 === end>>17){ return  585 + (beg>>17);}
    if (beg>>20 === end>>20){ return   73 + (beg>>20);}
    if (beg>>23 === end>>23){ return    9 + (beg>>23);}
    if (beg>>26 === end>>26){ return    1 + (beg>>26);}
    return 0;
 }

 
 /**
  *convert region to bins
  *
  * @export
  * @param {*} beg
  * @param {*} end
  * @returns
  */
 export function reg2bins(beg, end){
    let lst = [];
    lst.push(0);
    if (beg >= end){ return lst;}
    if (end >= 1<<29){ end = 1<<29;}
    end -= 1;
    for (let k of xrange(1 + (beg>>26), 1 + (end>>26) + 1)){
        lst.push(k)
    }
    for (let k of xrange(9 + (beg>>23), 9 + (end>>23) + 1)){
        lst.push(k)
    }
    for (let k of xrange(73 + (beg>>20), 73 + (end>>20) + 1)){  
        lst.push(k)
    }
    for (let k of xrange(585 + (beg>>17), 585 + (end>>17) + 1)){
        lst.push(k)
    }
    for (let k of xrange(4681 + (beg>>14), 4681 + (end>>14) + 1)){
        lst.push(k)
    }
    return lst
 }