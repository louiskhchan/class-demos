/*vs8.js*/

/** parse_url_params
 * @return {Object}
 */
function parse_url_params() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}
/** create_url_params 
 * @return {String}
 */
function create_url_params(obj) {
    return Object.entries(obj).map(pair => pair.map(encodeURIComponent).join('=')).join('&');
}


/** padzero
 * @return {string}
 */
function padzero(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

/** get date as a YYYYMMDD string
 * @returns {string} */
function get_date_str() {
    let date = new Date();
    return padzero(date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate(), 8);
}

/** get time as a HHMMSS string
 *  @returns {string} */
function get_time_str() {
    let date = new Date();
    return padzero(date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds(), 6);
}

/** get date time as YYYYMMDD_HHMMSS
 * @returns {string} */
function get_datetime_str() {
    return get_date_str() + "_" + get_time_str();
}

/** suffle an arr inplace
 * @returns {void} */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

/** sort a numeric array correctly (in place)
 * necessary because the default Array.sort is as strings
 * @returns {void}
 */
function sort_numeric(arr) {
    arr.sort(function (a, b) {
        return a - b;
    });
}

/** calculate sum
 * @returns{Number}
 */
function sum(arr) {
    return arr.reduce((acc, val) => acc + val, 0);
}

/** calculate mean
 * @returns{Number}
 */
function mean(arr) {
    return sum(arr) / arr.length;
}
/**
 * linear interpolation
 * @param {Number} positioni 
 * @param {Number} value0i 
 * @param {Number} value1i 
 */
function linear_interpolate(positioni, value0i, value1i) {
    //    return (1 - positioni) * value0i + positioni * value1i;
    return value0i + (positioni) * (value1i - value0i);
}
/**
 * get percentile. ASSUME arr is already SORTED
 * @param {Array<Number>} arr 
 * @param {Number} p 
 */
function get_percentile(arr, p) {
    let rank = p * (arr.length + 1);
    let rankd = Math.trunc(rank);
    let rankf = rank - rankd;
    if (rankd <= 0) return arr[0];
    else if (rankd >= arr.length) return arr[arr.length - 1];
    else return linear_interpolate(rankf, arr[rankd - 1], arr[rankd]);
}

/** make array unique 
 * @returns {Array}
 */
function array_unique(arr) {
    return arr.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
}

/** assign an array of values as the property of an array of objects
 * the length of objarr will be used, therefore valarr.length should be >= objarr.length..
 * @param {Array<Object>} objarr 
 * @param {String} key
 * @param {Array<any>} valarr 
 */
function arr2prop(objarr, key, valarr) {
    for (let i = 0; i < objarr.length; i++) objarr[i][key] = valarr[i];
}
/** extract a property from an array of object to form an array
 * @param {Array<any>} arr
 * @param {String} key
 * @returns {Array<any>}
 */
function prop2arr(arr, key) {
    let out = [];
    for (let val of arr) out.push(val[key]);
    return out;
}
/** mean of a property of an array
 * @param {Array<any>} arr
 * @param {String} key
 */
function prop_mean(arr, key) {
    return arr.reduce((acc, val) => acc + val[key], 0) / arr.length;
}


/** random between two numbers
 * @returns {number} */
function rand_between(lb, ub) {
    return lb + Math.random() * (ub - lb);
}

/** random between two integer
 * 
 * assume lb is integer, ub is exclusive
 * @returns {number} */
function rand_int_between(lb, ub) {
    return lb + Math.floor(Math.random() * (ub - lb));
}

/** random between two integer excluding integer set in array
 * 
 * assume lb is integer, ub is exclusive
 * @param {Array} arr
 * @param {number} lb
 * @param {number} ub
 * @returns {number} */
function rand_int_between_exclarr(arr, lb, ub) {
    let uarr = array_unique(arr);
    sort_numeric(uarr);
    let len = ub - lb - uarr.length;
    let rn = rand_int_between(lb, lb + len);
    for (let i of uarr) {
        if (rn >= i) rn++;
    }
    return rn;
}

/** deep copy by using JSON */
function deepcopy(from) {
    return JSON.parse(JSON.stringify(from));
}

/**
 * deep fill an array with (an object BY VALUE)
 * @param {Array} arr 
 * @param {Number} n
 * @param {Object} obj 
 */
function deepfill(arr, n, obj) {
    for (let i = 0; i < n; i++) arr.push(deepcopy(obj));
}

/**
 * deep fill a NEW array with (an object BY VALUE) and return the array
 * @param {Number} n
 * @param {Object} obj 
 */
function deepfillnew(n, obj) {
    let out = [];
    for (let i = 0; i < n; i++) out.push(deepcopy(obj));
    return out;
}

/**short hand for insertAdjacentHTML beforeend
 * 
 * @param {HTMLElement} parent 
 * @param {string} html 
 */
function addhtml(parent, html) {
    parent.insertAdjacentHTML('beforeend', html);
}

/**short hand for insertAdjacentText beforeend
 * 
 * @param {HTMLElement} parent 
 * @param {string} text 
 */
function addtext(parent, text) {
    parent.insertAdjacentText('beforeend', text);
}


/**make table (each key is a dv, the keys of each entry are headers)
 * @param {HTMLElement} parent
 * @param {Object} obj
 * @returns {HTMLTableElement} */
function addtable(parent, obj) {
    let htmlstr = '';
    //get conds first
    let conds;
    for (let dv in obj) {
        conds = Object.keys(obj[dv]);
        break;
    }
    htmlstr += '<table>';
    htmlstr += '<thead>';
    htmlstr += '<tr>';
    htmlstr += '<th>&nbsp;</th>';
    for (let cond of conds) {
        htmlstr += '<th>' + cond + '</th>';
    }
    htmlstr += '</tr>';
    htmlstr += '</thead>';
    htmlstr += '<tbody>';
    for (let dv in obj) {
        htmlstr += '<tr>';
        htmlstr += '<th>' + dv + '</th>';
        for (let cond of conds) {
            htmlstr += '<td>' + obj[dv][cond] + '</td>';
        }
        htmlstr += '</tr>';
    }
    htmlstr += '</tbody>';
    htmlstr += '</table>';
    addhtml(parent, htmlstr);
    let coll = parent.getElementsByTagName('table');
    return coll[coll.length - 1];
}


/** * add ele, text, or html ele some parent
 * 
 *  param: {ele, tag, text, html, class, style,attr} 
 * @param {{
 * ele:HTMLElement,
 * tag:string,
 * text:string,
 * html:string,
 * class:string, //space separated
 * attr:object //key as name, content str as value
 * tablecontentobj:object //table object as object
 * }} param
 * @returns {HTMLElement} */
function add(param) {
    //set parent
    let ele = document.body;
    if ('ele' in param) ele = param.ele;
    //set child
    /** @type HTMLElement */
    let p;
    if ('tag' in param) {
        p = document.createElement(param.tag);
        if ('class' in param) {
            p.classList.add(...param.class.split(' ').filter((str) => { return str.length > 0 }));
        }
        if ('style' in param) {
            p.style.cssText = param.style;
        }
        if ('text' in param) {
            addtext(p, param.text);
        }
        if ('html' in param) {
            addhtml(p, param.html);
        }
        if ('attr' in param) {
            for (let key in param.attr) {
                p.setAttribute(key, param.attr[key]);
            }
        }
        ele.appendChild(p);
    }
    return p;
}

/** wait for events such as button click
 * 
 * if timeout, the Promise will reject
 * 
 * param: {ele,type,timeout,preventDefault=false,callback(e)} 
 * @returns {Promise<Event,void>} */
function wait_event(param) {
    if (!('ele' in param)) param.ele = document.body;
    let p1 = new Promise((resolve, reject) => {
        /**@param {Event} e */
        let listener = function (e) {
            if ('preventDefault' in param && param.preventDefault) e.preventDefault();
            delete param.timeout_handle;
            if ('callback' in param) param.callback(e);
            resolve(e);
        };
        if ('timeout' in param) {
            param.timeout_handle = setTimeout(function () {
                if ('timeout_handle' in param) param.ele.removeEventListener(param.type, listener);
                reject();
            }, param.timeout);
        }
        param.ele.addEventListener(param.type, listener, { once: true });
    });
    return p1;
}


/** higher-level impl of waiting keyboard and mouse inputs.
 * preventDefault=true and ele=document.body  
 * continue wait until expected keys are pressed
 * @param {Array} keys if value is number, map to MouseEvent.button; if value is string, map to KeyboardEvent.code
 * @param {Number} timeout optional
 * @returns {Promise<{
 * idx:number,
 * timestamp:number
 * }>}
 */
async function wait_keys(keys, timeout = 0) {
    let listenman = new ListenerManager();
    let timeoutman;
    let prom = new Promise(resolve => {
        let keycb = function (e) {
            e.preventDefault();
            let idx = keys.indexOf(e.code);
            if (idx >= 0) resolve({ idx: idx, code: keys[idx], timestamp: e.timeStamp });
        };
        let mousecb = function (e) {
            e.preventDefault();
            let idx = keys.indexOf(e.button);
            if (idx >= 0) resolve({ idx: idx, code: keys[idx], timestamp: e.timeStamp });
        };
        let timeoutcb = function () {
            resolve({ idx: -1, code: 'timeout', timestamp: performance.now() });
        };
        listenman.add(document.body, 'keydown', keycb);
        listenman.add(document.body, 'mousedown', mousecb);
        if (timeout > 0) timeoutman = setTimeout(timeoutcb, timeout);
    });
    let out = await prom;
    listenman.removeall();
    if (timeout > 0) clearTimeout(timeoutman);
    return out;
}

/** wait timeout
 * @returns {Promise} */
function wait_timeout(ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/** wait forever
 * @returns {Promise<void>} */
function wait_forever() {
    return new Promise(() => { });
}


/** wait game frame out
 * 
 * @returns {Promise<DOMHighResTimeStamp>} */
function wait_frame_out() {
    return new Promise((resolve) => {
        window.requestAnimationFrame(function (timestamp) {
            //            let te = new Event(''); //not sure if this is workaround and i keep it just to be safe
            resolve(timestamp);
        });
    });
}

/** wait timeout by looping frames
 * @returns {Promise<void>}
 */
async function wait_frame_timeout(ms, fpms) {
    let times = [];
    let nf = Math.round(ms * fpms);
    for (let i = 0; i < nf; i++) times.push(await wait_frame_out());
    return times;
}
/** parse cookie
 * @return Object
 */
function parse_cookie(cookie_str = document.cookie) {
    let out = {};
    for (let val of cookie_str.split(';')) {
        if (val) {
            let m;
            if (m = val.match(/(.*?)=(.*)/)) out[decodeURIComponent(m[1].trim())] = decodeURIComponent(m[2].trim());
            else out[decodeURIComponent(val.trim())] = '';
        }
    }
    return out;
}

/** print_r -- php-like print_r() for debug
 * @return void
 */
function print_r(obj) {
    addtext(JSON.stringify(obj).replace(/,/g, ', '));
    addhtml('<br>');
}

/** detect mobile
 * @returns {boolean} */
function is_mobile() {
    return navigator.userAgent.match(/mobile/i);
}

/** detect chrome
 * @returns {boolean} */
function is_chrome() {
    return navigator.userAgent.match(/chrome/i);
}

/** detect touch
 * @returns {boolean}  */
function is_touch() {
    return ('ontouchstart' in window);
}

/** estimate frame interval in ms
 * @returns {Promise<number>} */
async function estimate_frame_interval() {
    await wait_frame_out();
    let tss = [];
    let last_ts = await wait_frame_out();
    for (let i = 0; i < 9; i++) {
        let ts = await wait_frame_out();
        tss.push(ts - last_ts);
        last_ts = ts;
    }
    sort_numeric(tss);
    return tss[4];
}
/** estimate fps
 * @returns {Promise<number>} */
async function estimate_fps() {
    return 1000 / (await estimate_frame_interval());
}
/** estimate fps
 * @returns {Promise<number>} */
async function estimate_fpms() {
    return 1 / (await estimate_frame_interval());
}

/** degree to radian */
function deg2rad(deg) {
    return deg / 180 * Math.PI;
}

/** manager for adding and removing event listeners */
class ListenerManager {
    constructor() {
        this.listenerlist = [];
    }
    add(target, type, callback) {
        target.addEventListener(type, callback);
        this.listenerlist.push({ target: target, type: type, callback: callback });
    }
    removeall() {
        for (let listener of this.listenerlist) listener.target.removeEventListener(listener.type, listener.callback);
    }
}

/** shortcut for manager for hiding contextmenu
 * @param {HTMLElement } ele element to hide context menu. default to body 
 * @returns {ListenerManager} use removeall to remove the contextmenu handler 
 */
function hide_contextmenu(ele = document.body) {
    let hider = new ListenerManager();
    hider.add(ele, 'contextmenu', (e) => { e.preventDefault(); });
    return hider;
}


/** gen unique ID */
function unique_id() {
    let array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0].toString(36);
}

/** xhr upload as a promise
 * 
 * //return server response
 * @param {{
 * url:string,
 * body:string,
 * [method]:string,
 * [timeout]:number,
 * }} param
 * @returns {Promise<{
 * response:string,
 * success:boolean
 * }}>}
 */
function upload(param) {
    if (!('method' in param)) param.method = 'POST';
    if (!('timeout' in param)) param.timeout = 5000;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(param.method, param.url);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send(param.body);
        //xhr
        xhr.timeout = param.timeout;
        xhr.onerror = () => { resolve({ success: false }); };
        xhr.onload = () => { resolve({ success: true, response: xhr.response }); };
    });
}

//multiplatform fullscreen
/** @returns {Promise<Number>} View in fullscreen */
async function openFullscreen() {
    let fullscreenok = 1;
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen({ navigationUI: "hide" });
        } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
            await document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
            document.documentElement.msRequestFullscreen();
        }
    } catch (e) {
        fullscreenok = 0;
    }
    await wait_timeout(300);
    return fullscreenok;
}

/** @returns {Promise<Number>} Close fullscreen */
async function closeFullscreen() {
    let fullscreenok = 1;
    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            await document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    } catch (e) {
        fullscreenok = 0;
    }
    await wait_timeout(300);
    return fullscreenok;
}
function escape_regex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/*vs8_expt.js*/

/** make trial permutations
 * @returns {number} */
function calc_nperm(ivs) {
    let nperm = 1;
    for (key in ivs) nperm *= ivs[key].length;
    return nperm;
}

/** make trial permutations
 * @returns {Array} */
function permu_trials(ivs, nt) {
    let nperm = calc_nperm(ivs);
    if (nt % nperm) throw "Number of trials is not permutation of IVs";
    let trials = new Array(nt);
    for (let ti = 0; ti < trials.length; ti++) {
        let carry = ti;
        trials[ti] = {};
        let ivs_entries = Object.entries(ivs);
        ivs_entries.reverse();
        let trialvals = {};
        for (let [key, value] of ivs_entries) {
            let nl = value.length;
            let remainder = carry % nl;
            trialvals[key] = value[remainder];
            carry -= remainder;
            carry /= nl;
        }
        for (key in ivs) trials[ti][key] = trialvals[key];
    }
    return trials;
}

/** produce the permutation of conditions 
 * @returns {Array}
 */
function permu_conds(ivs) {
    let nperm = calc_nperm(ivs);
    return permu_trials(ivs, nperm);
}

/**
 * permutation of array
 * @param {Array<any>} arr 
 */
function permu_arr(arr) {
    let permutation = deepcopy(arr);
    let length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1,
        k, p;

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            result.push(permutation.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }
    return result;
}


/**
 * 
 * @param {Object} cond 
 * @param {Object} trial 
 * @returns {Boolean}
 */
function match_cond(cond, trial) {
    let match = true;
    for (let key in cond) match = match && cond[key] == trial[key];
    return match;
}

/** gen trials, support practice trials and shuffled
 * @returns {Array} */
function gen_trials(ivs, nt, npt = 0) {
    let nperm = calc_nperm(ivs);

    let ptrials = [];
    if (npt > 0) {
        let nptcarry = npt;
        if (nptcarry % nperm);
        nptcarry += nperm - npt % nperm;
        ptrials = permu_trials(ivs, nptcarry);
        shuffle(ptrials);
        ptrials = ptrials.slice(0, npt);
        ptrials.forEach(function (trial, ti) { trial.ti = ti - npt; });
    }
    let trials = permu_trials(ivs, nt);
    shuffle(trials);
    trials.forEach(function (trial, ti) { trial.ti = ti; });
    return ptrials.concat(trials);
}
/** search_ring
 *  
 * holder size, ring radius, cx, cy, options={phase:-pi/2,shuffle:true,ssize:hsize} 

 * return an array of coordinates
 * @returns {Array<Array<number>> }
 */
function search_ring(hsize, cx, cy, radius, options = { phase: -Math.PI / 2, shuffle: true }) {
    let out = [];
    for (let i = 0; i < hsize; i++) {
        let pos_angle = i / hsize * Math.PI * 2 + options.phase;
        out.push([cx + Math.cos(pos_angle) * radius, cy + Math.sin(pos_angle) * radius]);
    }
    if (options.shuffle) shuffle(out);
    if ('ssize' in options) out.splice(options.ssize);
    return out;
}

/** search_table
 *  
 * mw and mh is for calculating the margin, which is calculated from item center. it should be slightly larger than half the item width and height.
 *ncol, nrow, cx, cy, w, h, mw, mh, options={shuffle:true,ssize:(ncol*nrow)}
 * 
 * return an array of coordinates
 * @returns {Array<Array<number>> }
 */
function search_table(ncol, nrow, cx, cy, w, h, mw, mh, options = { shuffle: true }) {
    //check param validity
    if (mw * 2 > w / ncol) throw "mw too wide";
    if (mh * 2 > h / nrow) throw "mh too tall";
    //set table
    let out = [];
    for (let i = 0; i < ncol; i++)
        for (let j = 0; j < nrow; j++) {
            let pos = [
                (cx - w / 2) + i / ncol * w + mw + Math.random() * (w / ncol - mw * 2),
                (cy - h / 2) + j / nrow * h + mh + Math.random() * (h / nrow - mh * 2)
            ];
            out.push(pos);
        }

    if (options.shuffle) shuffle(out);
    if ('ssize' in options) out.splice(options.ssize);
    return out;
}

/** random sample an element from an array */
function sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

//shorthands
/**
 * shorthand for calculating mean rt. assume rt is stored in trial.rt 
 * @param {Array<Object>} trials 
 */
function meanrt(trials) {
    return trials.reduce((acc, trial) => acc + trial.rt, 0) / trials.length;
}
/**
 * shorthand for calculating accuracy, assume accuracy is stored in trial.correct
 * @param {*} trials 
 */
function accuracy(trials) {
    return trials.filter(trial => trial.correct).length / trials.length;
}
/**
 * shorthand for calculating correct rt and accuracy, assume accuracy is stored in trial.correct
 * @param {*} trials 
 * @returns {{corr_rt:number,accuracy:number}}
 */
function calc_rtacc(trials) {
    let correct_trials = trials.filter(trial => trial.correct);
    return {
        corr_rt: meanrt(correct_trials),
        accuracy: correct_trials.length / trials.length
    };
}
/**
 * basic rt filter to check for negative ti, rt<200, and rt>q3+2*iqr. bi is not checked
 * @param {Array<Object>} trials 
 */
function basic_rtfilter(trials) {
    let nonwarm_trials = trials.filter(trial => trial.ti >= 0);
    let rts = prop2arr(nonwarm_trials, 'rt');
    sort_numeric(rts);
    let q3 = get_percentile(rts, .75);
    let q1 = get_percentile(rts, .25);
    let ul = q3 + 2 * (q3 - q1);
    return nonwarm_trials.filter(trial => trial.rt > 200 && trial.rt < ul);
}

/*vs8_expt_draw.js*/

/** @returns {Path2D} */
function path_cross(cx, cy, length) {
    let out = new Path2D();
    out.moveTo(cx - length / 2, cy);
    out.lineTo(cx + length / 2, cy);
    out.moveTo(cx, cy - length / 2);
    out.lineTo(cx, cy + length / 2);
    return out;
}

function path_triangle(cx, cy, base, height) {
    let out = new Path2D();
    out.moveTo(cx, cy - height / 2);
    out.lineTo(cx - base / 2, cy + height / 2);
    out.lineTo(cx + base / 2, cy + height / 2);
    out.closePath();
    return out;
}

/** @returns {Path2D} */
function path_circle(cx, cy, radius) {
    let out = new Path2D();
    out.arc(cx, cy, radius, 0, 2 * Math.PI, false);
    return out;
}

/** @returns {Path2D} */
function path_round_rectangle(cx, cy, w, h, radius) {
    let out = new Path2D();
    out.moveTo(cx - w / 2 + radius, cy - h / 2);
    out.lineTo(cx + w / 2 - radius, cy - h / 2);
    out.arcTo(cx + w / 2, cy - h / 2,
        cx + w / 2, cy - h / 2 + radius,
        radius);
    out.lineTo(cx + w / 2, cy + h / 2 - radius);
    out.arcTo(cx + w / 2, cy + h / 2,
        cx + w / 2 - radius, cy + h / 2,
        radius);
    out.lineTo(cx - w / 2 + radius, cy + h / 2);
    out.arcTo(cx - w / 2, cy + h / 2,
        cx - w / 2, cy + h / 2 - radius,
        radius);
    out.lineTo(cx - w / 2, cy - h / 2 + radius);
    out.arcTo(cx - w / 2, cy - h / 2,
        cx - w / 2 + radius, cy - h / 2,
        radius);
    return out;
}

/** make line path, rotation in deg.
 *  @returns {Path2D} */
function path_line(cx, cy, rotation_in_deg, length) {
    let rotation = deg2rad(rotation_in_deg);
    let out = new Path2D();
    out.moveTo(cx - Math.cos(rotation) * length / 2, cy - Math.sin(rotation) * length / 2);
    out.lineTo(cx + Math.cos(rotation) * length / 2, cy + Math.sin(rotation) * length / 2);
    return out;
}

/** make arrow for use in compound search
 * @returns {Path2D}
 */
function path_arrow(cx, cy, w, h, rotation) {
    let out = new Path2D();
    out.moveTo(cx - w * .5, cy - h * .5) //working
}

/** hit test by radius 
 * @return {Boolean}
 */
function hittest_radius(hx, hy, cx, cy, radius) {
    return (hx - cx) ** 2 + (hy - cy) ** 2 < radius ** 2;
}
/** hit test by rect region 
 * @return {Boolean}
 */
function hittest_rect(hx, hy, x, y, w, h) {
    return (x < hx && hx < (x + w)) && (y < hy && hy < y + h);
}

function clear_context(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

/** set expt canvas and context, and return useful objects
 *  let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {Number} aspectratio
 * 
 * @returns {{
 * v2c: function ,
 * context:CanvasRenderingContext2D
 * }}
 */
function expt_setup_canvas(canvas, aspectratio = null) {
    let out = {};

    //global vars
    out.vw = canvas.clientWidth;
    out.vh = canvas.clientHeight;

    //limit canvas and fit to screen with fixed aspect ratio. if aspect ratio is not set, there is 
    out.vn = Math.min(out.vw, out.vh);
    if (isFinite(aspectratio) && aspectratio > 0) {
        if (out.vw / out.vh > aspectratio) out.vw = Math.floor(out.vh * aspectratio / 2) * 2;
        else if (out.vw / out.vh > aspectratio) out.vh = Math.floor(out.vw / aspectratio / 2) * 2;
    }

    //unit converter
    out.v2c = function (v) {
        if (Array.isArray(v)) v.forEach((v, i, a) => { a[i] = v * window.devicePixelRatio; });
        else v = v * window.devicePixelRatio;
        return v;
    };
    //set context size
    out.cn = out.v2c(out.vn);
    out.cw = canvas.width = out.v2c(out.vw);
    out.ch = canvas.height = out.v2c(out.vh);
    out.cx = out.cw / 2;
    out.cy = out.ch / 2;

    //  vs8 expt scale note
    // iphone11: 6.45 cm wide :41.06cm
    // s10; 6.65 cm wide: 42.3 cm
    // therefore on phones, 1 deg is ~10vp
    // set virtual pixel, in which each represent 1% of the shorter dimension of the screen
    out.cp = out.cn / 100;
    //create context
    out.context = canvas.getContext("2d");
    return out;
}

/** save context
 * @param {CanvasRenderingContext2D} context
 * @returns {ImageData}
 */
function save_context(context) {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
}
/** return a sine wave of time, freq in hz */
function get_time_sine(freq) {
    return Math.sin(performance.now() * freq / 1000 * Math.PI * 2);

}

/** measure text easier to use. 
 * @param {CanvasRenderingContext2D} context
 * @param {String} str
 * @returns 
 * {{left: number,top:Number,width:Number,height:Number}}
*/
function measure_text(context, str) {
    let met = context.measureText(str);
    return {
        left: -met.actualBoundingBoxLeft,
        top: -met.actualBoundingBoxAscent,
        width: met.actualBoundingBoxLeft + met.actualBoundingBoxRight,
        height: met.actualBoundingBoxAscent + met.actualBoundingBoxDescent
    };
}

/*vs8_expt_html.js*/

/**
 * short hand for showing instruction and wait for user input
 * @param {HTMLElement} ele 
 * @param {Object} content 
 * @param {Object} wait 
 */
async function wait_instruction_generic(ele, content, wait) {
    let d2 = add({ ele: ele, tag: 'div', class: 'instructiondiv' });
    if ('html' in content) addhtml(d2, content.html);
    if ('id' in content) d2.appendChild(document.getElementById(content.id).cloneNode(true));
    if (wait.type == 'forever') await wait_forever();
    if (wait.type == 'button') {
        let trybut = add({ ele: d2, tag: 'button', text: wait.text });
        if (wait.default) trybut.focus();
        await wait_event({ ele: trybut, type: 'click' });
    }
    if (wait.type == 'form') {
        let form = document.getElementById(wait.formid);
        await wait_event({ ele: form, type: 'submit', preventDefault: true });
        //provide some convenients
        wait.form = form;
        let values = {};
        for (let formele of form.elements)
            if (formele.tagName == 'INPUT' && 'id' in formele && 'value' in formele) values[formele.id] = formele.value;
        wait.formdata = values;
    }
    d2.remove();
}

/**
 * short hand for showing instruction and wait for user input
 * @param {HTMLElement} ele 
 * @param {String} html 
 * @param {Object} wait 
 */
async function wait_instruction_html(ele, html, wait) {
    await wait_instruction_generic(ele, { html: html }, wait);
}
/**
 * short hand for showing instruction and wait for user input
 * @param {HTMLElement} ele 
 * @param {String} elementid 
 * @param {Object} wait 
 */
async function wait_instruction_id(ele, elementid, wait) {
    await wait_instruction_generic(ele, { id: elementid }, wait);
}

/*vs8_media.js*/

/** play audio: create an audio ele, play the source, and remove the audio ele.
 * @returns {Promise<void>} */
function play_audio(source) {
    return new Promise(
        function (resolve) {
            let audioele = document.createElement('audio');
            audioele.style.display = 'none';
            audioele.appendChild(source);
            document.body.appendChild(audioele);
            audioele.play();
            audioele.onended = () => {
                audioele.remove();
                resolve();
            };
        }
    );
}

/** load audio: load audio and return source ele
 * @returns {Promise<{
 * ele: HTMLAudioElement ,
 * source: HTMLSourceElement }>} */
function load_audio(audiopath, type = 'audio/mp3') {
    return new Promise(
        function (resolve) {
            let audioele = document.createElement('audio');
            audioele.preload = 'auto';
            audioele.style.display = 'none';
            let source = document.createElement('source');
            source.src = audiopath;
            source.type = type;
            audioele.appendChild(source);
            audioele.oncanplaythrough = () => {
                resolve({ ele: audioele, source: source });
            };
            document.body.appendChild(audioele);
        }
    );
}

/** load image: load img and return img obj
 * @returns {Promise<HTMLImageElement>} */
function load_img(imgpath, delay = 0) {
    return new Promise(
        async resolve => {
            if (delay > 0) await new Promise(r => setTimeout(r, delay));
            let img;
            img = new Image();
            img.src = imgpath;
            img.onload = () => {
                resolve(img);
            };
        }
    );
}


module.exports={parse_url_params,create_url_params,padzero,get_date_str,get_time_str,get_datetime_str,shuffle,sort_numeric,sum,mean,linear_interpolate,get_percentile,array_unique,arr2prop,prop2arr,prop_mean,rand_between,rand_int_between,rand_int_between_exclarr,deepcopy,deepfill,deepfillnew,addhtml,addtext,addtable,add,wait_event,wait_keys,wait_timeout,wait_forever,wait_frame_out,wait_frame_timeout,parse_cookie,print_r,is_mobile,is_chrome,is_touch,estimate_frame_interval,estimate_fps,estimate_fpms,deg2rad,ListenerManager,hide_contextmenu,unique_id,upload,openFullscreen,closeFullscreen,escape_regex,calc_nperm,permu_trials,permu_conds,permu_arr,match_cond,gen_trials,search_ring,search_table,sample,meanrt,accuracy,calc_rtacc,basic_rtfilter,path_cross,path_triangle,path_circle,path_round_rectangle,path_line,path_arrow,hittest_radius,hittest_rect,clear_context,expt_setup_canvas,save_context,get_time_sine,measure_text,wait_instruction_generic,wait_instruction_html,wait_instruction_id,play_audio,load_audio,load_img};

