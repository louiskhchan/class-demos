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
function path_arrow(cx, cy, w, h) {
    let out = new Path2D();
    out.moveTo(cx + w / 2, cy - h / 2);
    out.lineTo(cx - w / 2, cy );
    out.lineTo(cx + w / 2, cy + h / 2);
    return out;
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

/**
 * @callback drawcb
 * @param {number} cx 
 * @param {number} cy 
 * @param {number} cw 
 * @param {number} ch 
 * @param {CanvasRenderingContext2D} context
 */
/**
 * add simple inline canvas
 * @param {HTMLElement} ele - parent element
 * @param {number} w - in css pixels
 * @param {number} h - in css pixels
 * @param {drawcb} drawcb - callback function for drawing on the canvas
 */
function add_simple_canvas(parent, w, h, drawcb) {
    let canvas = add({ ele: parent, tag: 'canvas', style: `width:${w}px;height:${h}px;` });
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    let cw = canvas.clientWidth;
    let ch = canvas.clientHeight;
    let context = canvas.getContext("2d");
    context.scale(window.devicePixelRatio, window.devicePixelRatio)
    drawcb(cw / 2, ch / 2, cw, ch, context);
}
/** set expt canvas and context, and return useful objects
 *  let [cp, cx, cy, cw, ch, context] = [c.cp, c.cx, c.cy, c.cw, c.ch, c.context];
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {Number} aspectratio
 * 
 * @returns {{
 * cx,cy,cw,ch,cp:number,
 * context:CanvasRenderingContext2D
 * }}
 */
function expt_setup_canvas(canvas) {
    let out = {};

    //global vars
    out.vw = canvas.clientWidth;
    out.vh = canvas.clientHeight;
    out.vn = Math.min(out.vw, out.vh);

    //unit converter
    //set context size
    out.cn = out.vn * window.devicePixelRatio;
    out.cw = canvas.width = out.vw * window.devicePixelRatio;
    out.ch = canvas.height = out.vh * window.devicePixelRatio;
    out.cx = out.cw / 2;
    out.cy = out.ch / 2;
    out.cp = out.cn / 100;

    //create context
    out.context = canvas.getContext("2d");
    return out;
}

/** save context
 * @param {CanvasRenderingContext2D} context
 * @returns {ImageData}
 */
function save_context_img(context) {
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

