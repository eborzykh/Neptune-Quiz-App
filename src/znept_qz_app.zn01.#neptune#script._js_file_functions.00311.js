function _download_content() {
    var _ui_tests = PageTestSelect.getModel().getData();

    const _EOL = '\r\n';
    const _TAB = '\t';

    var i, j, k;
    var _ls_parts, _ls_questions, _ls_variants;
    var _file_content = '';

    if (_ui_tests.UI_COUNT_PARTS > 0) {
        for (i = 0; i < ListPartsLS.getModel().getData().length; i++) {
            _ls_parts = ListPartsLS.getModel().getData()[i];
            if (_ls_parts.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
                _file_content = _file_content + _EOL + _ls_parts.DESCRIPTION + _EOL;
                for (j = 0; j < ListQuestionsLS.getModel().getData().length; j++) {
                    _ls_questions = ListQuestionsLS.getModel().getData()[j];
                    if (_ls_questions.LS_TEST_ID === _ls_parts.LS_TEST_ID && _ls_questions.PART_ID === _ls_parts.PART_ID) {
                        _file_content = _file_content + _EOL + _ls_questions.QUESTION + _TAB + _ls_questions.EXPLANATION + _EOL;
                        for (k = 0; k < ListVariantsLS.getModel().getData().length; k++) {
                            _ls_variants = ListVariantsLS.getModel().getData()[k];
                            if (_ls_variants.LS_TEST_ID === _ls_questions.LS_TEST_ID && _ls_variants.QUESTION_ID === _ls_questions.QUESTION_ID) {
                                _file_content = _file_content + _ls_variants.VARIANT + _TAB + _ls_variants.CORRECT + _EOL;
                            }
                        }
                    }
                }
            }
        }
    } else {
        for (j = 0; j < ListQuestionsLS.getModel().getData().length; j++) {
            _ls_questions = ListQuestionsLS.getModel().getData()[j];
            if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
                _file_content = _file_content + _EOL + _ls_questions.QUESTION + _TAB + _ls_questions.EXPLANATION + _EOL;
                for (k = 0; k < ListVariantsLS.getModel().getData().length; k++) {
                    _ls_variants = ListVariantsLS.getModel().getData()[k];
                    if (_ls_variants.LS_TEST_ID === _ls_questions.LS_TEST_ID && _ls_variants.QUESTION_ID === _ls_questions.QUESTION_ID) {
                        _file_content = _file_content + _ls_variants.VARIANT + _TAB + _ls_variants.CORRECT + _EOL;
                    }
                }
            }
        }
    }

    if (_file_content.length > 0) {
        _download(_ui_tests.DESCRIPTION, _file_content);
    }
}

function _download(_file_name, _file_content) {
    var _element = document.createElement('a');
    _element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(_file_content));
    _element.setAttribute('download', _file_name);

    _element.style.display = 'none';
    document.body.appendChild(_element);

    _element.click();

    document.body.removeChild(_element);
}
