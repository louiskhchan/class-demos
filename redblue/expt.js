var colorspeed = 100 / 1000;
var ttlab = ['color', 'ori'];
var orifirstlab = ['colorfirst', 'orifirst'];

var d1;

//show welcome screen
async function do_welcome() {
    let d2 = add({ ele: d1, tag: 'div', class: 'instructiondiv' });
    addhtml(d2, '\
    <h1>Red Blue Demo</h1>\
        ');

    let frame_interval = await estimate_frame_interval();
    let frame_hz = 1000 / frame_interval;
    if (frame_hz < 50 || frame_hz > 70) {
        addhtml(d2, '<h2>Sorry, this demo is runnable only on 60Hz display.</h2>');
        await wait_forever();
    }

    //assume 60 hz
    let canvas = add({ ele: d2, tag: 'canvas', style: 'width:700px;height:500px;position:absolute;background-color:white;' });


    //set up canvas and get context
    let c = expt_setup_canvas(canvas, 'none');

    //run experiment
    let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];
    let hzs = [1, 3, 7.5, 15, 30];
    let colwidth = cp * 25;
    let rowheight = cp * 10;
    let fontsize = cp * 5;
    let radius = cp * 8;
    while (true) {
        let now = await wait_frame_out();
        context.clearRect(0, 0, cw, ch);
        context.save();
        for (let hzi = 0; hzi < hzs.length; hzi++) {
            let hz = hzs[hzi];
            let colx = cx + colwidth * (-5 / 2 + hzi + .5);
            context.save();
            //draw label
            context.font = fontsize + 'px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'alphabetic';
            context.fillText(hz + 'Hz', colx, cy - rowheight);

            //draw circle
            context.fillStyle = ((now % (1000 / hz)) / (1000 / hz) > .5) ? 'red' : 'blue';
            context.fill(path_circle(colx, cy + rowheight, radius));
            context.restore();
        }

        context.restore();
    }






    canvas.remove();
    d2.remove();

}


//entry point
async function start_expt() {
    d1 = add({ tag: 'div' });

    await do_welcome();

    d1.remove();
}