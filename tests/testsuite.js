(function(){
    

    /*
     * Markup handling
     */

    var target = document.getElementById('target');
    var originalHTML = target.innerHTML;

    function restoreOriginalMarkup()
    {
        target.innerHTML = originalHTML;
    }


    /*
     * UI
     */

    var controlBlock = document.getElementById('controls');

    var controls = {
        selSplit: document.getElementById('sel_split'),
        txtTag:   document.getElementById('txt_tag'),
        txtClass: document.getElementById('txt_class'),
        txtSkip:  document.getElementById('txt_skip'),
        txtSpace: document.getElementById('txt_space'),
        cbDeep:   document.getElementById('cb_deep'),
        cbSpaces: document.getElementById('cb_spaces'),
        btnApply: document.getElementById('btn_apply')
    };

    controls.btnApply.addEventListener('click', clickApply);

    function clickApply(e)
    {
        restoreOriginalMarkup();

        params = {
            split:       controls.selSplit.value,
            tagName:     controls.txtTag.value,
            className:   controls.txtClass.value,
            skipClass:   controls.txtSkip.value,
            spaceChar:   controls.txtSpace.value,
            deep:        controls.cbDeep.checked,
            wrapSpaces:  controls.cbSpaces.checked

        };

        WrapChars.wrap(target, params);

        
    }

    controls.btnApply.dispatchEvent(new MouseEvent('click'));



})();