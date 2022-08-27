async function do_upload(expt) {
    let d1 = expt.d1;
    let upload_result;
    let d1a = add({ ele: d1, tag: 'div', style: 'padding-top:30vh;width:70%;' });
    //display result summary
    {
        let d1b = add({ ele: d1, tag: 'div', style: 'width:70%;' });
        addhtml(d1b, "<h3>Your results:</h3>");
        let summarytable = deepcopy(expt.data.summary);
        delete summarytable.correctn;
        for (let key in summarytable) {
            delete summarytable[key]['id'];
        }
        let formatnum = function(n) {
            if (typeof(n) == 'number') return n.toFixed(0);
            else return '--';
        };
        for (let key in summarytable.accuracy) summarytable.accuracy[key] = formatnum(summarytable.accuracy[key] * 100) + '%';
        for (let key in summarytable.rt) summarytable.rt[key] = formatnum(summarytable.rt[key]) + 'ms';
        let table = addtable(d1b, summarytable);
    }
    //save debug info
    let debugobj = {
        browser: navigator.userAgent,
        datenow: Date.now(),
        performancenow: performance.now(),
        eventts: (new Event('')).timeStamp,
        framets: (await wait_frame_out())
    };
    expt.data.summary.debug = debugobj;
    //upload data
    for (;;) {
        let d2 = add({ ele: d1a, tag: 'div' });
        addhtml(d2, '<h2>Uploading data...</h2>');
        upload_result = await upload({
            url: 'receive.php',
            body: JSON.stringify(expt.data)
        });
        if (upload_result.success) {
            addhtml(d2, "<h2>Upload success! Thank you.</h2>\
            Your data ID is: " + expt.data.id);
            break;
        } else {
            addhtml(d2, "<h2>Upload failed. </h2>");
            let but = add({ ele: d2, tag: 'button', text: 'Try again?' });
            await wait_event({ ele: but, type: 'click' });
        }
        d2.remove();
    }
}

async function run_trial(c, trial, ivs) {
    let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];
    await wait_timeout(500);
    context.save();
    //draw fixation
    context.lineWidth = 1 * cp;
    context.strokeStyle = 'black';
    context.stroke(path_cross(cx, cy, 8 * cp));
    await wait_timeout(500);
    await wait_frame_out();
    //draw target
    let tarx = trial.pos == 'left' ? (cx - 40 * cp) : (cx + 40 * cp);
    context.fillStyle = trial.color;
    context.fill(path_circle(tarx, cy, 10 * cp));
    let starttime = await wait_frame_out();
    let key;
    let keys = ['KeyZ', 'Slash'];
    do {
        key = await wait_event({ type: 'keydown', preventDefault: true });
    } while (!keys.includes(key.code));
    trial.correct = ivs.color.indexOf(trial.color) == keys.indexOf(key.code) ? 1 : 0;
    trial.rt = key.alignedTimeStamp - starttime;
    trial.resp = key.code;
    context.clearRect(0, 0, cw, ch);
    context.restore();
}

/** @returns {Promise<void>} */
async function do_expt(expt) {
    let d1 = expt.d1;

    //set up canvas
    let canvas = add({ ele: d1, tag: 'canvas', style: 'width:100vw;height:100vh;cursor:none;' });

    //set up canvas and get context
    let c = expt_setup_canvas(canvas, 'none');
    let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];

    //experiment
    let npt = 5;
    let nt = 40;
    //let nt = 8;
    let ivs = {
        color: ['red', 'green'],
        pos: ['left', 'right']
    };
    let trials = gen_trials(ivs, nt, npt);
    for (let trial of trials) {
        await run_trial(c, trial, ivs);
    }

    //save for analysis
    expt.trials = trials;
    expt.ivs = ivs;

    //remove canvas
    canvas.remove();
}

//analyze data
function do_analysis(expt) {
    let trials = expt.trials;
    let ivs = expt.ivs;
    //variable for condition summaries 
    let conds = {};
    conds.red_left = {};
    conds.red_right = {};
    conds.green_left = {};
    conds.green_right = {};
    conds.same = {};
    conds.diff = {};
    for (let key in conds) {
        let cond = conds[key];
        cond.n = 0;
        cond.correct = 0;
        cond.correctrtsum = 0;
    }
    //accumulator to a condition
    let sum_cond = function(conds, cond, trial) {
        conds[cond].n++;
        if (trial.correct) {
            conds[cond].correct++;
            conds[cond].correctrtsum += trial.rt;
        }
    };
    //for valid trial, accumulate to the corresponding condition(s)
    for (let trial of trials) {
        if (trial.ti >= 0 &&
            trial.rt > 200 &&
            trial.rt < 1500) {
            sum_cond(conds, trial.color + "_" + trial.pos, trial);
            sum_cond(conds,
                (ivs.color.indexOf(trial.color) == ivs.pos.indexOf(trial.pos)) ? 'same' : 'diff',
                trial);
        }
    }
    //summary, each key each file. define between subj var first
    let summary = {
        accuracy: { id: expt.data.id },
        rt: { id: expt.data.id },
        correctn: { id: expt.data.id }
    };
    //for each condition, calc subj accumulated data to summary
    for (let key in conds) {
        let cond = conds[key];
        summary.accuracy[key] = cond.correct / cond.n;
        summary.rt[key] = cond.correctrtsum / cond.correct;
        summary.correctn[key] = cond.correct;
    }
    //output
    expt.data.trials = trials;
    expt.data.conds = conds;
    expt.data.summary = summary;
}

/** @returns {Promise<void>} */
async function do_practice(expt) {

    let d1 = expt.d1;
    let d1upper = add({ ele: d1, tag: 'div', style: 'width:55%;font-size:medium;' });
    addhtml(d1upper, "\
    <h2>Experiment instruction</h2>\
    <p->Look at the '+' when it appears.</p->\
    <p->Rest your LEFT and RIGHT index fingers on <key->z</key-> and <key->/</key-> of your keyboard respectively.</p->\
    <p->Press <key->z</key-> if you see a RED circle, and <key->/</key-> if you see a GREEN circle.</p->\
    <p->Please respond as accurately and as quickly as possible.</p->\
    <halfem-></halfem->\
    ");

    //set up canvas
    let canvas = add({ ele: d1, tag: 'canvas', style: 'width:55%;height:55%;border:2px solid darkgrey;border-radius:5px;cursor:none;' });

    let d1lower = add({ ele: d1, tag: 'div', style: 'width:55%;font-size: medium;' });
    let feedback = add({
        ele: d1lower,
        tag: 'p-',
        html: "Now, please try a few times. <br>"
    });

    //set up canvas and get context
    let c = expt_setup_canvas(canvas, 'none');
    let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];

    //experiment loop
    let nt = 8,
        ndone = 0,
        ncorrect = 0;
    while (ncorrect / nt < .8) {
        if (ndone > 0) {
            feedback.innerHTML = "<b>Try to be more careful.</b><Br>";
        }
        ndone = 0;
        ncorrect = 0;

        let ivs = {
            color: ['red', 'green'],
            pos: ['left', 'right']
        };
        let trials = gen_trials(ivs, nt, 0);
        for (let trial of trials) {
            await run_trial(c, trial, ivs);
            if (trial.correct) feedback.innerHTML += 'Correct. ';
            else feedback.innerHTML += 'Incorrect. ';
            ndone++;
            if (trial.correct) ncorrect++;
            context.clearRect(0, 0, cw, ch);
            context.restore();
        }
    }

    //good job
    feedback.innerHTML = '';
    addhtml(feedback, "Good job. Now, let's start the experiment, which may take about 2 mins.<br/>")
    await wait_timeout(1500);
    addhtml(feedback, 'Ready? <br />');
    await wait_timeout(1500);
    addhtml(feedback, 'Experiment starts in ');
    for (let i = 0; i < 3; i++) {
        addhtml(feedback, (3 - i) + "... ");
        await wait_timeout(1500);
    }

    //remove welcome canvas
    feedback.remove();
    d1upper.remove();
    canvas.remove();
    d1lower.remove();
}

//entry point
async function start_expt() {

    let expt = {
        data: {
            expt: 'simon',
            datetimestr: get_datetime_str(),
            id: unique_id()
        }
    };

    let d1 = expt.d1 = add({ tag: 'div', class: 'flex_top' });

    //show welcome screen
    {
        let d2 = add({ ele: d1, tag: 'div', style: 'padding-top:30vh;width:70%;' });
        d2.innerHTML = '<h1>APPY4005 class demo<br />Simon effect</h1>';
        let d3 = add({ ele: d2, tag: 'h3' });
        d3.innerHTML = 'Press spacebar to start';


        let starttime = performance.now();

        let key = '';
        while (key != 'Space') key = (await wait_event({ type: 'keydown' })).code;

        //go full screen
        try {
            d1.classList.add('full');
            await openFullscreen();
        } catch (e) {
            addhtml(d3, "<br><br><span style='color:darkred;'>Sorry. Can't enter fullscreen on your computer.</span>");
            return;
        }
        d2.remove();
    }

    //show practice
    await do_practice(expt);

    //do expt
    await do_expt(expt);

    //leave fullscreen
    await closeFullscreen();
    do_analysis(expt);

    //upload
    await do_upload(expt);

    // d1.remove();
}