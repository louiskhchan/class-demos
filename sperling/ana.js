const fs = require('fs');
const path = require('path');
const vs = require('./vs8_compiled.js');

const data_path = 'data';
const output_path = 'outputs';

//conditions
let exptcode = 'sperling';
let btws = [];
let dvs = ['pcorr', 'n'];

//within-subj conds
//for labels
let label_ivs = {
    isi: ['0', '150', '300', '500', '1000']
};
//for matching
let ivs = {
    isi: [0, 150, 300, 500, 1000]
};

// { //workaround for rt issue should go to run_trial function.
//     trial.starttime = starttime;
//     trial.ts = key.timestamp;
//     if (expt.timing_diag.keydown_ts > 86400000) key.timestamp = (key.timestamp - expt.timing_diag.keydown_ts) / 1000000000 + expt.timing_diag.perfnow_ts;
// }

//match conditions
let labels = vs.permu_conds(label_ivs).map(label_cond => Object.values(label_cond).join('_'));
let conds = vs.permu_conds(ivs);

//results
let results = [];

let datadir = fs.readdirSync(data_path);
let idset = new Set();
for (let jf of datadir) if (jf.match(/\.json$/)) {
    let expt = JSON.parse(fs.readFileSync(path.join(data_path, jf)));

    if (idset.has(expt.btw.id)) {
        console.log('repeated: ' + expt.btw.id);
        continue;
    }
    idset.add(expt.btw.id);

    //ana this file
    let result = {
        btw: expt.btw,
        avg: {},
        dvs: {}
    };
    result.btw = expt.btw;
    for (let dv of dvs) result.dvs[dv] = {};

    //do basic filtering
    // let trials = vs.basic_rtfilter(expt.trials);
    let trials = expt.trials;

    for (let i = 0; i < labels.length; i++) {
        let label = labels[i];
        let cond = conds[i];
        cond_trials = trials.filter(trial => vs.match_cond(cond, trial));
        result.dvs.pcorr[label] = vs.prop_mean(cond_trials, 'pcorr');
        result.dvs.n[label] = cond_trials.length;
    }
    for (let dv of dvs) {
        result.avg[dv] = 0;
        for (let label of labels) result.avg[dv] += result.dvs[dv][label] / labels.length;
    }

    //save
    results.push(result);
}

//output to file
if (!fs.existsSync(output_path)) fs.mkdirSync(output_path);

//for each dv
for (let dv of dvs) {
    let output = '';
    output += [...btws, 'avg', ...labels].join(',') + '\n';
    for (let result of results) {
        let rowarr = [];
        //between subjs
        for (let btw of btws) {
            let btwval;
            if (btw in result.btw) btwval = result.btw[btw];
            rowarr.push(btwval);
        }
        //averages for within subjs
        rowarr.push(result.avg[dv]);
        //within subjs
        for (let label of labels) {
            rowarr.push(result.dvs[dv][label]);
        }
        output += rowarr.join(',') + '\n';
    }
    let outfn = path.join(output_path, [exptcode, dv].join('_') + '.csv');
    fs.writeFileSync(outfn, output);

}

