//global expt params and vars
var gexpt; //reference for console debug
var gdebug = false;
var gtrial;
var d1;
var faceimglist;
//var alignment_label = ['align', 'misalign'];

async function do_upload(expt) {
    let upload_result;
    let d1upper = add({ ele: d1, tag: 'div', class: 'instructiondiv' });
    //display result summary
    {
        addhtml(d1upper, "<h2>Your experiment results:</h2>");
        let formatnum = function (n) {
            if (isNaN(n)) return '--';
            else return n.toFixed(0);
        };

        //analysis for display only
        let trials = expt.trials;

        let alignment_label = ['Aligned faces', 'Misaligned faces'];
        let summarytable = {};
        for (let alignment = 0; alignment < 2; alignment++) {
            let alignment_trials = expt.trials.filter(trial => (trial.alignment == alignment));

            //within-subj conds
            let rtacc = calc_rtacc(alignment_trials);
            summarytable[alignment_label[alignment]] = {
                'Response Time': formatnum(rtacc.corr_rt) + 'ms',
                'Accuracy': formatnum(rtacc.accuracy * 100) + '%'
            };
        }

        let table = addtable(d1upper, summarytable);
    }

    //upload data
    while (true) {
        addhtml(d1upper, '<h3>Uploading data...</h3>');
        upload_result = await upload({
            url: 'receive.php',
            body: JSON.stringify(expt)
        });
        if (upload_result.success) {
            addhtml(d1upper, "<h3>Upload complete! Thank you for your participation.</h3>");
            await wait_forever();
        } else {
            addhtml(d1upper, "<h3>Upload failed. Please try again.</h3>");
            let but = add({ ele: d1upper, tag: 'button', text: 'Try again' });
            await wait_event({ ele: but, type: 'click' });
        }
    }
    d1upper.remove();
}

/**@param { {context:CanvasRenderingContext2D}} c */
async function run_trial(c, trial) {
    let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];

    //iti
    context.clearRect(0, 0, cw, ch);
    await wait_frame_timeout2(500);
    context.save();

    //draw fixation
    context.lineWidth = 1 * cp;
    context.strokeStyle = 'white';
    context.stroke(path_cross(cx, cy, 8 * cp));
    await wait_frame_timeout2(500);
    context.clearRect(0, 0, cw, ch);
    await wait_frame_timeout2(500);

    let sfw, sfh;
    let draw_face = async function (th, bh) {
        /**@type {HTMLImageElement} */
        let thface = faceimglist[th];
        let bhface = faceimglist[bh];
        sfw = 16 * cp;
        sfh = sfw / thface.width * thface.height;
        //jittering
        let jx = rand_between(-1.6, 1.6) * cp;
        let jy = rand_between(-1.6, 1.6) * cp;
        //gap
        let half_gap = 0 * cp;
        //draw
        context.drawImage(thface, 0, 0, thface.width, thface.height / 2, cx + jx - sfw / 2 - trial.alignment * sfw / 4, cy + jy - half_gap - sfh / 2, sfw, sfh / 2);
        context.drawImage(bhface, 0, bhface.height / 2, bhface.width, bhface.height / 2, cx + jx - sfw / 2 + trial.alignment * sfw / 4, cy + jy + half_gap, sfw, sfh / 2);
        return await wait_frame_timeout2(trial.exposure);
    };


    //draw first face
    await draw_face(trial.th1, trial.bh1);

    //mask
    context.clearRect(0, 0, cw, ch);
    context.fillStyle = 'rgb(186,186,186)';
    context.fillRect(cx - sfw / 2, cy - sfh / 2, sfw, sfh);
    for (let i = 0; i < 500; i++) {
        let color = Math.floor(rand_between(.2, 1) * 256);
        context.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
        context.fill(path_circle(rand_between(cx - sfw / 2, cx + sfw / 2), rand_between(cy - sfh / 2, cy + sfh / 2), rand_between(.1 * cp, 3 * cp)));
    }
    await wait_frame_timeout2(trial.exposure);


    //receive response
    let keys = ['KeyZ', 'Slash'];
    let wait_keys_prom = wait_keys(keys);

    //draw second face
    context.clearRect(0, 0, cw, ch);
    let starttime = await draw_face(trial.th2, trial.bh2);
    context.clearRect(0, 0, cw, ch);

    //receive key
    let key = await wait_keys_prom;
    trial.correct = trial.answer == key.idx;
    trial.rt = key.timestamp - starttime;
    trial.keycode = key.code;
    context.clearRect(0, 0, cw, ch);
    context.restore();

}

/** @returns {Promise<void>} */
async function do_expt(expt, bi, blc) {

    { //run block
        //set up canvas
        let canvas = add({ ele: d1, tag: 'canvas', style: `width:100vw;height:100vh;position:absolute;${gdebug ? '' : 'cursor:none;'}background-color:#000000;` });

        //set up canvas and get context
        let c = expt_setup_canvas(canvas);
        let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];


        //experiment loop
        let nt = 8; //need to ensure nt/2 and (nt/2)*3/2 are integers

        let ivs = {
            alignment: [blc.alignment],
            exposure: [300],
            mf: [0, 1], //0 is m, 1 is f
            answer: [0, 1] //0 is same, 1 is diff
        };
        let trials = gen_trials(ivs, nt, 0);

        //assign faces for trials
        //use mf 0-7 for misalign expt
        let mfnt = nt / 2; //must be 2
        let mfnf = mfnt * 3 / 2; //must be 3
        let fioff = 0 + blc.alignment * 6;
        let mffioff = [fioff, 20 + fioff];
        let mffis = [];
        for (let mf = 0; mf < 2; mf++) {
            let fis = [];
            for (let fi = mffioff[mf]; fi < mffioff[mf] + mfnf; fi++) fis.push(fi);
            shuffle(fis);
            mffis.push(fis);
        }

        //map faces to trials
        let mffi = [0, 0];
        for (let trial of trials) {
            //assign top half
            let th1 = mffi[trial.mf]++;
            let th2 = th1;
            if (trial.answer) th2 = mffi[trial.mf]++;
            //assign bottom half
            let bh1 = rand_int_between_exclarr([th1], 0, mfnf);
            let bh2 = rand_int_between_exclarr([bh1, th2], 0, mfnf);
            trial.th1 = mffis[trial.mf][th1];
            trial.th2 = mffis[trial.mf][th2];
            trial.bh1 = mffis[trial.mf][bh1];
            trial.bh2 = mffis[trial.mf][bh2];
        }

        //run experiment
        for (let trial of trials) await run_trial(c, trial);
        expt.trials = expt.trials.concat(trials);

        //remove canvas
        canvas.remove();
    }
} //end expt


/**  
 * @returns {Promise<void>} */
async function do_practice(expt, parti, blc) {
    if (!gdebug) for (let ntries = 0, allcorrect = false; !allcorrect; ntries++) {
        { //instruction
            let html = "";
            if (ntries == 0) { }
            else html += "<h2>Please try again. Try to be more accurate. </h2>";
            html += /*html*/`
            <h2>Experiment Part ${parti + 1}</h2>
            <h3>Instruction</h3>
            <p->In this experiment, <b>two faces</b> will be shown <b>one after another</b>.<br>Focus on the <b>top half</b> of the faces only. The bottom half of the faces is <u>irrelevant</u>.</p->
            <p->If the top-half of the two faces are the <b>same</b>, press <key->z</key->. </p->
            <p->If the top-half of the two faces are <b>different</b>, press <key->/</key->. </p->
            <p->Please respond as accurately and as quickly as possible. </p->
            <p->Please remember the instruction, and try the task for a few times.</p->
            `;
            html += "<br>";
            let wait = { type: 'button', text: 'TRY' };
            await wait_instruction_generic(d1, { html: html }, wait);
        }
        { //run block
            //set up canvas
            let canvas = add({ ele: d1, tag: 'canvas', style: 'width:100vw;height:100vh;position:absolute;cursor:none;background-color:#000000;' });

            //set up canvas and get context
            let c = expt_setup_canvas(canvas);
            let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];

            //experiment loop
            let nt = 4; //need to ensure nt/2 and (nt/2)*3/2 are integers

            let ivs = {
                alignment: [blc.alignment],
                exposure: [500],
                mf: [0, 1], //0 is m, 1 is f
                answer: [0, 1] //0 is same, 1 is diff
            };
            let trials = gen_trials(ivs, nt, 0);

            //assign faces for trials
            //use mf 18-20 for misalign practice
            let mfnt = nt / 2; //must be 2
            let mfnf = mfnt * 3 / 2; //must be 3
            let fioff = 12 + blc.alignment * 4;
            let mffioff = [fioff, 20 + fioff];
            let mffis = [];
            for (let mf = 0; mf < 2; mf++) {
                let fis = [];
                for (let fi = mffioff[mf]; fi < mffioff[mf] + mfnf; fi++) fis.push(fi);
                shuffle(fis);
                mffis.push(fis);
            }

            //map faces to trials
            let mffi = [0, 0];
            for (let trial of trials) {
                //assign top half
                let th1 = mffi[trial.mf]++;
                let th2 = th1;
                if (trial.answer) th2 = mffi[trial.mf]++;
                //assign bottom half
                let bh1 = rand_int_between_exclarr([th1], 0, mfnf);
                let bh2 = rand_int_between_exclarr([bh1, th2], 0, mfnf);
                trial.th1 = mffis[trial.mf][th1];
                trial.th2 = mffis[trial.mf][th2];
                trial.bh1 = mffis[trial.mf][bh1];
                trial.bh2 = mffis[trial.mf][bh2];
            }

            //run practice trials
            for (let trial of trials) await run_trial(c, trial);
            allcorrect = trials.filter(trial => trial.correct).length >= nt;

            //remove canvas
            canvas.remove();
        }
    }
    { //good job
        let html =/* html */ `<h2>Good Job</h2>
            <p->Now, let's start the experiment, which may take about 1 minute.</p->
            <br>
        `;
        let wait = { type: 'button', text: 'START' };
        await wait_instruction_html(d1, html, wait);
    }

}

//show welcome screen
async function do_welcome(expt) {
    let d2 = add({ ele: d1, tag: 'div', class: 'instructiondiv' });
    addhtml(d2, `
        <h1>APPY4005 Cognitive Psychology</h1>
        <h2>Composite face effect class demo</h2>
        <br>
    `);

    //load faces
    let d3 = add({ ele: d2, tag: 'div' });
    d3.innerHTML = 'Loading images, please wait...';
    let faceimgpromlist = [];
    let mfarr = ['m', 'f'];
    for (let mf of mfarr)
        for (let num = 1; num <= 20; num++) {
            let numstr = padzero(num, 2);
            faceimgpromlist.push(load_img('images/' + mf + numstr + '_original_u.bmp'));
        }
    faceimglist = await Promise.all(faceimgpromlist);

    //finish load face, allow press space
    d3.innerHTML = `
        Press <key->space</key-> to start
        <br>
        <br>
        Your display will enter the fullscreen mode in the next page. Please <b>do not leave</b> this mode until the experiment completes.
    `;

    //press space
    let space_event;
    while ((space_event = await wait_event({ type: 'keydown' })).code != 'Space');
    //save timing diagnostics
    expt.timing_diag = {
        keydown_ts: space_event.timeStamp,
        perfnow_ts: performance.now(),
        frameout_ts: await wait_frame_out()
    };
    d2.remove();

    //go full screen
    d1.classList.add('full');

    if (!gdebug) if (!await openFullscreen()) {
        addhtml(b1, "<br><br><span style='color:darkred;'>Sorry. Can't enter fullscreen on your computer.</span>");
        await wait_forever();
    }

    //edit to update by using timing_diag
    // if (Math.abs(event2perf) > 5) await wait_instruction_html(d1, "<h2>Unsupported browser</h2>Sorry, your browser is not supported. Please try another browser or update your current browser.", { type: 'forever' });

}

//entry point
async function start_expt() {
    d1 = add({ tag: 'div' });

    //check if parameter sufficient
    let btw = parse_url_params();
    if (!('id' in btw)) await wait_instruction_html(d1, "<h2>Sorry</h2>Access denied.", { type: 'forever' });

    let expt = {
        exptcode: 'composite',
        datetimestr: get_datetime_str(),
        id: btw.id,
        btw: btw,
        trials: [],
        //for debug only
        browser: navigator.userAgent
    };

    if (gdebug) gexpt = expt;

    if (!gdebug) await do_welcome(expt);

    btw.align_first = rand_int_between(0, 2); //0: align first, 1: misalign first

    //generate block conditions
    let alignment_order = [0, 1]; //0: align, 1:misalign
    if (btw.align_first) alignment_order.reverse();

    expt.nb = 4;
    let bi = 0;
    let parti = 0;
    for (let alignment of alignment_order) {
        let blc = { alignment: alignment };
        await do_practice(expt, parti++, blc);
        await do_expt(expt, bi++, blc);
        await do_expt(expt, bi++, blc);
    }

    //leave fullscreen   
    expt.btw.leavefullscreenok = await closeFullscreen();

    //upload
    await do_upload(expt);

    d1.remove();
}