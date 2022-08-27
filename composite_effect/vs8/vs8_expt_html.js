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
    if ('cb' in content) content.cb(d2);
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

