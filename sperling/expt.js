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

        let summarytable = {
            accuracy: {}
        };

        let isiarr = [0, 150, 300, 500, 1000];
        for (let isi of isiarr)
            summarytable.accuracy[isi] = formatnum(prop_mean(expt.trials.filter(trial => trial.isi == isi), 'pcorr') * 100) + '%';

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
    context.save();

    //iti
    context.clearRect(0, 0, cw, ch);
    await wait_frame_timeout2(500);

    //table
    let cellwidth = 8 * cp;
    let cellheight = 9 * cp;
    let fontsize = 8 * cp;
    let nrow = 3;
    let ncol = 3;

    //table cloth: fixation basically
    let tablecloth = function () {
        context.save();
        context.clearRect(0, 0, cw, ch);
        context.fillStyle = '#eee';
        context.fillRect(cx - ncol * .5 * cellwidth, cy - nrow * .5 * cellheight, cellwidth * ncol, cellheight * nrow);
        context.restore();
    };

    //draw fixation
    tablecloth();
    await wait_frame_timeout2(1000);

    //show letters
    context.save(); //text settings
    let letters = [];
    for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) letters.push(String.fromCharCode(i));
    shuffle(letters);
    context.font = fontsize + 'px Arial lighter';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    for (let r = 0; r < nrow; r++)
        for (let c = 0; c < ncol; c++) {
            context.fillText(letters[r * ncol + c], cx + ((c + .5) - ncol * .5) * cellwidth, cy + ((r + .5) - nrow * .5) * cellheight);
        }
    await wait_frame_timeout2(trial.exposure);

    //isi
    tablecloth();
    await wait_frame_timeout2(trial.isi);

    //indicator
    let row = rand_int_between(0, nrow);
    context.font = fontsize / 2 + 'px Arial'
    context.fillText('►', cx + ((-1 + .5) - ncol * .5) * cellwidth, cy + ((row + .5) - nrow * .5) * cellheight);
    context.restore(); //end text settings
    await wait_frame_out();

    //receive response
    let ans = letters.slice(row * ncol, (row + 1) * ncol);
    await wait_event({ ele: c.form, type: 'submit' });
    let response = c.input.value.toUpperCase().slice(0, ncol);
    c.input.value = '';
    //determine how many correct
    let nhit = 0;
    for (let char of response) {
        if (ans.includes(char)) nhit++;
    }
    trial.nhit = nhit;
    trial.pcorr = nhit / ncol;
    context.clearRect(0, 0, cw, ch);
    context.restore();

}

/** @returns {Promise<void>} */
async function do_expt(expt, bi, blc) {

    { //run block

        //in sperling's expt, we use a special canvas instead of a full screen one.

        //canvas size
        let vn = 300;

        //place holder
        let d2 = add({ ele: d1, tag: 'div', style: 'padding-top:30px;width:' + vn + 'px;' });

        //set up canvas
        let canvas = add({ ele: d1, tag: 'canvas', style: `width:${vn}px;height:${vn}px;` });

        //set up canvas and get context
        let c = expt_setup_canvas(canvas);

        //set up response panel
        let inputdiv = add({ ele: d1, tag: 'div' });
        /**@type {HTMLFormElement} form */
        let form = add({ ele: inputdiv, tag: 'form' });
        form.action = 'javascript:void(0);';
        /**@type {HTMLInputElement} input */
        let input = add({ ele: form, tag: 'input' });
        input.type = 'text';
        input.focus();

        ////phone only
        // await wait_timeout(300); 
        // window.scrollTo(0, 0);
        // await wait_timeout(300);

        c.form = form;
        c.input = input;

        //experiment loop
        let nt = 50;

        let ivs = {
            exposure: [150],
            isi: [0, 150, 300, 500, 1000]
        };
        let trials = gen_trials(ivs, nt, 0);

        //run trials
        for (let trial of trials) await run_trial(c, trial);

        //save data
        expt.trials = expt.trials.concat(trials);

        //clean up
        input.remove();
        form.remove();
        inputdiv.remove();
        canvas.remove();
        d2.remove();

    }



} //end expt


/**  
 * @returns {Promise<void>} */
async function do_practice(expt, parti, blc) {
    for (let ntries = 0, allcorrect = false; !allcorrect; ntries++) {
        { //instruction
            let html = "";
            if (ntries == 0) { }
            else html += "<h2>Please try again. Try to be more accurate. </h2>";
            html += /*html*/`    
        <h2>Experiment instruction</h2>
        <p->In this experiment, 9 letters will be shown.</p->
        <p->After the letters disappear, you need to enter the letter shown <b>in the indicated row</b> in the input box.</p->
        <br>
            `;
            html += "<br>";
            let wait = { type: 'button', text: 'TRY' };
            await wait_instruction_generic(d1, { html: html }, wait);
        }
        { //run block
            //in sperling's expt, we use a special canvas instead of a full screen one.

            //canvas size
            let vn = 300;

            //place holder
            let d2 = add({ ele: d1, tag: 'div', style: 'padding-top:30px;width:' + vn + 'px;' });

            //set up canvas
            let canvas = add({ ele: d1, tag: 'canvas', style: `width:${vn}px;height:${vn}px;` });

            //set up canvas and get context
            let c = expt_setup_canvas(canvas);

            //set up response panel
            let inputdiv = add({ ele: d1, tag: 'div' });
            /**@type {HTMLFormElement} form */
            let form = add({ ele: inputdiv, tag: 'form' });
            form.action = 'javascript:void(0);';
            /**@type {HTMLInputElement} input */
            let input = add({ ele: form, tag: 'input' });
            input.type = 'text';
            input.focus();

            ////phone only
            // await wait_timeout(300); 
            // window.scrollTo(0, 0);
            // await wait_timeout(300);

            c.form = form;
            c.input = input;

            //experiment loop
            let nt = 3;

            let ivs = {
                exposure: [300],
                isi: [0],
            };
            let trials = gen_trials(ivs, nt, 0);

            //run practice trials
            for (let trial of trials) await run_trial(c, trial);
            allcorrect = prop_mean(trials, 'pcorr') > .7;

            //clean up
            input.remove();
            form.remove();
            inputdiv.remove();
            canvas.remove();
            d2.remove();

        }
    }
    { //good job
        let html =/* html */ `<h2>Good Job</h2>
            <p->Now, let's start the experiment, which may take about 3 minute.</p->
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
        <h2>Partial report paradigm class demo</h2>
        <br>
        Press <key->space</key-> to start
        <br>
        <br>
        Your display will enter the fullscreen mode in the next page. Please <b>do not leave</b> this mode until the experiment completes.
    `);

    //press space
    let keys = ['Space'];
    let key = await wait_keys(keys);
    //save timing diagnostics
    expt.timing_diag = {
        keydown_ts: key.timestamp,
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
    // if (expt.timing_diag.keydown_ts > 86400000) await wait_instruction_html(d1, "<h2>Unsupported browser</h2>Sorry, your browser is not supported. Please try another browser or update your current browser.", { type: 'forever' });

}

//entry point
async function start_expt() {
    d1 = add({ tag: 'div' });
    d1.classList.add('flex_top');

    //warn debug
    if (gdebug) add({
        ele: d1,
        tag: 'div',
        style: 'position:fixed;text-align:center;background:red;opacity:0.5;color:white',
        text: 'debug mode on'
    });

    //check if parameter sufficient
    let btw = parse_url_params();
    if (!('id' in btw)) await wait_instruction_html(d1, "<h2>Sorry</h2>Access denied.", { type: 'forever' });

    let expt = {
        exptcode: 'sperling',
        datetimestr: get_datetime_str(),
        id: btw.id,
        btw: btw,
        trials: [],
        //for debug only
        browser: navigator.userAgent
    };

    if (gdebug) gexpt = expt;

    await do_welcome(expt);
    await do_practice(expt);
    await do_expt(expt);

    //leave fullscreen   
    expt.btw.leavefullscreenok = await closeFullscreen();

    //upload
    await do_upload(expt);

    d1.remove();
}