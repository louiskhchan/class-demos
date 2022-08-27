var btws = {
    // prev_order: [0, 1, 2, 3, 4, 5],
    // interval_order: [0, 1]
};
btw_conds = permu_conds(btws);

let table = add({
    tag: 'table'
});

for (let i = 0; i < 50; i++) {
    let ir = i % btw_conds.length;
    if (i != 0 && ir == 0) add({
        ele: table,
        tag: 'tr'
    });
    let query = {
        id: unique_id(),
        ...btw_conds[ir]
    };

    let urlparam = create_url_params(query);
    let url = window.location.href.match(/(.*)\/.*/)[1] + '/index.htm?' + urlparam;
    let tr = add({
        ele: table,
        tag: 'tr'
    });
    let td1 = add({
        ele: tr,
        tag: 'td',
        text: i + 1
    });
    let td2 = add({
        ele: tr,
        tag: 'td',
        attr:{width:"600"}
    });
    let input = add({
        ele: td2,
        tag: 'input',
        style: 'width:100%',
        attr: {
            type: 'text',
            value: url
        }
    });
    let td3 = add({
        ele: tr,
        tag: 'td'
    });
    let selbut = add({
        ele: td3,
        tag: 'button',
        html: 'Copy&nbsp;link'
    });
    selbut.onclick = function() {
        input.select();
        document.execCommand("copy");
    };
    let td4 = add({
        ele: tr,
        tag: 'td'
    });
    let gobut = add({
        ele: td4,
        tag: 'button',
        text: 'Experiment'
    });
    gobut.onclick = function() {
        window.open(input.value, "_blank");
    };
    // let td5 = add({
    //     ele: tr,
    //     tag: 'td'
    // });
    // let debugbut = add({
    //     ele: td5,
    //     tag: 'button',
    //     text: 'Debug'
    // });
    // debugbut.onclick = function() {
    //     window.open(window.location.href.match(/(.*)\/.*/)[1] + '/index.htm?' + create_url_params({...query, debug: true }), "_blank");
    // };
}