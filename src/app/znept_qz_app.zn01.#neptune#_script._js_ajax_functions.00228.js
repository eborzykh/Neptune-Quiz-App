const _SYNC_DELAY = 500;
const _DELAY_KEEP_CORRECT = 1500;

const _ID_ZERO_TEST = '0000'; // domain _ID_TEST_DM
const _ID_ZERO_QUESTION = '0000'; // domain _ID_QUESTION_DM
const _ID_ZERO_PART = '00'; // domain _ID_PART_DM

const _INITIAL_DATE = '00000000';
const _INITIAL_TIME = '000000';
const _FINAL_DATE = '99991231';

const _VERSION_DO_NOT_SYNC = -2; // domain _COUNT_VERSION_DM
const _VERSION_FIRST_SYNC = -1; // domain _COUNT_VERSION_DM

const _DEFAULT_COUNT = 20; // default number of questions for Practice
const _DEFAULT_TIMER = 10; // default timer (minutes) for Practice
const _DEFAULT_LIMIT = 80; // default percentage target for Practice and the landing page

const _PROGRESS_UNANSWERED = '0'; // domain _PROGRESS_DM
const _PROGRESS_INCORRECT = '1'; // domain _PROGRESS_DM
const _PROGRESS_IMPROVED1 = '2'; // domain _PROGRESS_DM
const _PROGRESS_IMPROVED2 = '3'; // domain _PROGRESS_DM
const _PROGRESS_IMPROVED3 = '4'; // domain _PROGRESS_DM
const _PROGRESS_CORRECT = '5'; // domain _PROGRESS_DM

const _BOOKMARK_UNMARKED = ''; // domain _BOOKMARK_DM
const _BOOKMARK_BOOKMARKED = 'X'; // domain _BOOKMARK_DM

const _ABAP_FALSE = '';
const _ABAP_TRUE = 'X';

const _QUESTION_TYPE_INPUT = 0; // free choice (typing) answer
const _QUESTION_TYPE_SINGLE = 1; // single choice question
const _QUESTION_TYPE_MULTIPLE = 2; // multiple choice question

const _MODE_PREVIEW = 0;
const _MODE_LEARN = 1;
const _MODE_PREPARE = 2;
const _MODE_PRACTICE = 3;
const _MODE_RESULTS = 4;
const _MODE_PAUSE = 5;

const _QUICK_BUTTON_HIDE = 0;
const _QUICK_BUTTON_CONTINUE = 1;
const _QUICK_BUTTON_CHECK = 2;

const _ICON_PART_COLLAPSED = 'sap-icon://expand-all';
const _ICON_PART_EXPANDED = 'sap-icon://collapse-all';

const _ICON_PROGRESS_HIDDEN = '';
const _ICON_PROGRESS_WRONG = 'sap-icon://message-warning';
const _ICON_PROGRESS_CORRECT = 'sap-icon://message-success';

const _ICON_UNFAVORITE = 'sap-icon://unfavorite';
const _ICON_FAVORITE = 'sap-icon://favorite';

var _practice_mode = _MODE_PREVIEW;
var _current_question = 0;
var _navigate_after_metrics = false;
var _ajax_error = false;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

window.addEventListener('offline', function() {
    jQuery.sap.require("sap.m.MessageToast");
    sap.m.MessageToast.show("You are offline");
});

window.addEventListener('online', function() {
    jQuery.sap.require("sap.m.MessageToast");
    sap.m.MessageToast.show("Back online");
});

setTimeout(function() {
    _first_refresh();
}, _SYNC_DELAY);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _first_refresh() {

    if (navigator.onLine) {
        _ajax_refresh();
    } else {
        _set_UI_PageTestSelect();
        oApp.to(PageTestSelect);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _navigate_PagePQSelect() {

    var _ui_tests = PageTestSelect.getModel().getData();

    if (_ui_tests.UI_DOWNLOADED) {
        _set_UI_PagePQSelect();
    } else {
        _ajax_download();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_busy(_busy) {

    if (_busy) {
        oApp.setBusy(true);
    } else {
        oApp.setBusy(false);
        PullToRefresh.hide();
        setCachePageSY();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_PageTestSelect() {

    ListTestsUI.getModel().setData([]);

    for (var i = 0; i < ListTestsLS.getModel().getData().length; i++) {
        var _ls_tests = ListTestsLS.getModel().getData()[i];
        var _ui_tests = new modelPageTestsUI.getData();

        _ui_tests.UI_TEST_ID = _ls_tests.LS_TEST_ID;
        _ui_tests.TEST_ID = _ls_tests.TEST_ID;
        _ui_tests.UPLOAD_ON = _ls_tests.UPLOAD_ON;
        _ui_tests.UPLOAD_AT = _ls_tests.UPLOAD_AT;
        _ui_tests.UPLOAD_BY = _ls_tests.UPLOAD_BY;
        _ui_tests.DESCRIPTION = _ls_tests.DESCRIPTION;
        _ui_tests.PUBLISHED = _ls_tests.PUBLISHED;

        _ui_tests.UI_DOWNLOADED = _ls_tests.LS_DOWNLOADED;
        _ui_tests.UI_COUNT_PARTS = _ls_tests.LS_COUNT_PARTS;
        _ui_tests.UI_COUNT_QUESTIONS = _ls_tests.LS_COUNT_QUESTIONS;

        _ui_tests.UI_INFO_LINE_1 = _ls_tests.LS_COUNT_QUESTIONS.toString() + ' questions' + ((_ls_tests.LS_COUNT_PARTS > 0) ? ' / ' + _ls_tests.LS_COUNT_PARTS.toString() + ' parts' : '');
        _ui_tests.UI_INFO_LINE_2 = 'Added on ' + _ls_tests.UPLOAD_ON.substr(0, 4) + '.' + _ls_tests.UPLOAD_ON.substr(4, 2) + '.' + _ls_tests.UPLOAD_ON.substr(6, 2)
        _ui_tests.UI_INFO_LINE_3 = 'By ' + _ls_tests.LS_UPLOAD_BY_NAME;

        _ui_tests.UI_FAVORITE = _ls_tests.LS_FAVORITE;
        _ui_tests.UI_DELETED = _ls_tests.LS_DELETED;

        ModelData.Add(ListTestsUI, _ui_tests);
    }

    // Refresh order UI
    _set_UI_order();

    // Refresh published UI
    _set_UI_published();

    // Refresh progress UI
    _set_UI_progress();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_PagePQSelect() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ui_pq;

    _navigate_after_metrics = false; // reset navigation after Metrics

    // Sort Metrics local storage before using _get_progress
    _sort_metrics_ls();

    ListPQSelect.getModel().setData([]);

    for (var i = 0; i < ListPartsLS.getModel().getData().length; i++) {
        var _ls_parts = ListPartsLS.getModel().getData()[i];

        if (_ls_parts.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            _ui_pq = new modelPagePQUI.getData();

            _ui_pq.PART_ID = _ls_parts.PART_ID;
            _ui_pq.QUESTION_ID = _ID_ZERO_QUESTION;
            _ui_pq.UI_SORT_PART = (_ls_parts.SORT === _ID_ZERO_PART ? _ls_parts.PART_ID : _ls_parts.SORT);
            _ui_pq.UI_SORT_QUESTION = _ID_ZERO_QUESTION;
            _ui_pq.UI_SELECTED = _ls_parts.LS_SELECTED;
            _ui_pq.UI_VISIBLE_PART = true;
            _ui_pq.UI_VISIBLE_QUESTION = false;
            _ui_pq.UI_VISIBLE_ITEM = true;
            _ui_pq.UI_SRC_ICON = _ICON_PART_COLLAPSED;
            _ui_pq.DESCRIPTION = _ls_parts.DESCRIPTION;
            _ui_pq.UI_CORRECT_HIGHLIGHT = 'None';

            ModelData.Add(ListPQSelect, _ui_pq);
        }
    }

    for (i = 0; i < ListQuestionsLS.getModel().getData().length; i++) {
        var _ls_questions = ListQuestionsLS.getModel().getData()[i];

        if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            _ui_pq = new modelPagePQUI.getData();

            _ui_pq.PART_ID = _ls_questions.PART_ID;
            _ui_pq.QUESTION_ID = _ls_questions.QUESTION_ID;

            var _ui_sort_part_arr = ModelData.Find(ListPQSelect, ["PART_ID", "UI_VISIBLE_PART"], [_ls_questions.PART_ID, true]);
            _ui_pq.UI_SORT_PART = (_ui_sort_part_arr.length === 1 ? _ui_sort_part_arr[0].UI_SORT_PART : _ID_ZERO_PART);

            _ui_pq.UI_SORT_QUESTION = (_ls_questions.SORT === _ID_ZERO_QUESTION ? _ls_questions.QUESTION_ID : _ls_questions.SORT);
            _ui_pq.UI_SELECTED = (_ui_sort_part_arr.length === 1 ? _ui_sort_part_arr[0].UI_SELECTED : true);
            _ui_pq.UI_VISIBLE_PART = false;
            _ui_pq.UI_VISIBLE_QUESTION = true;
            _ui_pq.UI_VISIBLE_ITEM = (_ui_sort_part_arr.length === 1 ? false : true);
            _ui_pq.UI_SRC_ICON = _ICON_PART_COLLAPSED; // icon property must be always provided here
            _ui_pq.DESCRIPTION = _ls_questions.QUESTION;
            _ui_pq.UI_CORRECT_HIGHLIGHT = _get_correct_highlight(_get_ui_progress(_ls_questions.QUESTION_ID));

            ModelData.Add(ListPQSelect, _ui_pq);
        }
    }

    // Move Parts at sub-headers positions
    ListPQSelect.getModel().getData().sort(function(a, b) {
        return (a.UI_SORT_PART * 1000 + a.UI_SORT_QUESTION) - (b.UI_SORT_PART * 1000 + b.UI_SORT_QUESTION);
    });
    ListPQSelect.getModel().refresh(true); // without refresh it will not correctly define selected item

    _set_UI_reset();
    _set_UI_ActionSheet();

    TextTestNamePQSelect.setText(_ui_tests.DESCRIPTION);

    oApp.to(PagePQSelect);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_correct_highlight(_progress) {

    var _highlight;

    switch (_progress) {
        case _PROGRESS_UNANSWERED: // Unanswered
            _highlight = 'None';
            break;
        case _PROGRESS_INCORRECT: // Incorrect
            _highlight = 'Error';
            break;
        case _PROGRESS_IMPROVED1: // Improved
        case _PROGRESS_IMPROVED2: // Improved
        case _PROGRESS_IMPROVED3: // Improved
            _highlight = 'Success';
            break;
        case _PROGRESS_CORRECT: // Correct
            _highlight = 'Success';
            break;
        default:
            _highlight = 'None';
    }
    return _highlight;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _is_part_selected() {

    var _ui_tests = PageTestSelect.getModel().getData();

    for (var i = 0; i < ListPQSelect.getModel().getData().length; i++) {
        var _ui_pq = ListPQSelect.getModel().getData()[i];
        if (_ui_pq.UI_SELECTED) {
            return true;
        }
    }

    jQuery.sap.require("sap.m.MessageToast");
    sap.m.MessageToast.show("Select at least one section to continue");

    return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _goto_test(_new_practice_mode) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _parameters = PageParameters.getModel().getData();

    _practice_mode = _new_practice_mode;

    // Remove not selected Parts
    for (var i = 0; i < ListPQSelect.getModel().getData().length; i++) {
        var _ui_pq = ListPQSelect.getModel().getData()[i];
        if (!_ui_pq.UI_SELECTED && _ui_pq.UI_VISIBLE_QUESTION) {
            ModelData.Delete(ListQuestionsUI, "QUESTION_ID", _ui_pq.QUESTION_ID);
            ModelData.Delete(ListVariantsUI, "QUESTION_ID", _ui_pq.QUESTION_ID);
        }
    }

    // Shuffle questions
    if (_practice_mode === _MODE_PREPARE || _practice_mode === _MODE_PRACTICE) {
        _shuffle_array(ListQuestionsUI.getModel().getData());
    }

    // Sort questions following by less seen - wrong answers - correct
    if (_practice_mode === _MODE_PREPARE) {
        ListQuestionsUI.getModel().getData().sort(function(a, b) {
            return (a.UI_PROGRESS - b.UI_PROGRESS);
        });
    }

    if (_practice_mode === _MODE_PRACTICE) {
        // Trim question list for practicing mode
        if (_parameters.PRACTICE_COUNT < ListQuestionsUI.getModel().getData().length && _parameters.PRACTICE_COUNT > 0) {
            ListQuestionsUI.getModel().setData(ListQuestionsUI.getModel().getData().slice(0, _parameters.PRACTICE_COUNT));
        }
        // Start the timer
        _start_timer(_parameters.PRACTICE_TIMER);
    }

    _show_question(0);

    oApp.to(PageQuestion);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_ui_question_index(_question_id) {

    for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
        if (ListQuestionsUI.getModel().getData()[i].QUESTION_ID === _question_id) {
            return i;
        }
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_question_type(_question_id) {

    var _answers_count = 0;
    var _correct_answers = 0;

    for (var i = 0; i < ListVariantsUI.getModel().getData().length; i++) {
        var _ui_variants = ListVariantsUI.getModel().getData()[i];
        if (_ui_variants.QUESTION_ID === _question_id) {
            _answers_count++;
            if (_ui_variants.CORRECT === _ABAP_TRUE) {
                _correct_answers++;
            }
        }
    }
    if (_answers_count > 1) {
        if (_correct_answers > 1) {
            return 2;
        } else {
            return 1;
        }
    } else {
        return 0;
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _show_question(_index) {

    var _ui_tests = PageTestSelect.getModel().getData();

    if (_index < 0) {
        _index = ListQuestionsUI.getModel().getData().length - 1;
    }
    if (_index >= ListQuestionsUI.getModel().getData().length) {
        _index = 0;
    }

    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];

    _current_question = _index;

    ListType.getModel().setData([]);
    ListSingleSelect.getModel().setData([]);
    ListMultiSelect.getModel().setData([]);

    for (var i = 0; i < ListVariantsUI.getModel().getData().length; i++) {
        var _ui_variants = ListVariantsUI.getModel().getData()[i];
        if (_ui_variants.QUESTION_ID === _ui_questions.QUESTION_ID) {

            _ui_variants.UI_CORRECT_HIGHLIGHT = 'None';
            _ui_variants.UI_SELECT_HIGHLIGHT = 'None';
            _ui_variants.UI_SHOW_ANSWER = false; // for type-answer question

            if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || (_practice_mode === _MODE_PREPARE && _ui_questions.UI_QUESTION_EVALUATED) || _practice_mode === _MODE_RESULTS) {
                _ui_variants.UI_EDITABLE = false;
            } else {
                _ui_variants.UI_EDITABLE = true;
            }

            switch (_get_question_type(_ui_questions.QUESTION_ID)) {
                case _QUESTION_TYPE_INPUT:
                    ModelData.Add(ListType, _ui_variants);
                    break;
                case _QUESTION_TYPE_SINGLE:
                    ModelData.Add(ListSingleSelect, _ui_variants);
                    break;
                case _QUESTION_TYPE_MULTIPLE:
                    ModelData.Add(ListMultiSelect, _ui_variants);
            }
        }
    }

    PageQuestion.getModel().setData(_ui_questions);

    ListType.setVisible(_get_question_type(_ui_questions.QUESTION_ID) === _QUESTION_TYPE_INPUT);
    ListSingleSelect.setVisible(_get_question_type(_ui_questions.QUESTION_ID) === _QUESTION_TYPE_SINGLE);
    ListMultiSelect.setVisible(_get_question_type(_ui_questions.QUESTION_ID) === _QUESTION_TYPE_MULTIPLE);

    oHBoxType.setVisible(_practice_mode === _MODE_PREPARE || _practice_mode === _MODE_PRACTICE || _practice_mode === _MODE_RESULTS);

    oHBoxExplanation.setVisible(false);

    // Part description visibility
    if (_ui_questions.PART_ID !== _ID_ZERO_PART) {
        TextQuestionTestPart.setText(ModelData.LookupValue(ListPQSelect, ["PART_ID", "UI_VISIBLE_PART"], [_ui_questions.PART_ID, true], 'DESCRIPTION'));
    }
    oHBoxQuestionTestPart.setVisible(_ui_questions.PART_ID !== _ID_ZERO_PART);

    LabelQuestionCounter.setText((_index + 1).toString() + ' / ' + ListQuestionsUI.getModel().getData().length.toString());

    // Correct answer visibility
    if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || (_practice_mode === _MODE_PREPARE && _ui_questions.UI_QUESTION_EVALUATED)) {
        _show_answer(_index);
    }

    if (_practice_mode === _MODE_RESULTS) {
        _show_answer(_index);
    }

    ButtonSubmit.setVisible(_practice_mode === _MODE_PRACTICE);

    // Display progress icon
    _set_UI_IconProgress(_index);

    // Display bookmark
    _set_UI_ButtonBookmark(_index);

    _show_continue(_QUICK_BUTTON_HIDE);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_IconProgress(_index) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];

    var _button_icon = _ICON_PROGRESS_HIDDEN;
    var _button_type = 'Default';
    var _button_visible = (_practice_mode !== _MODE_PRACTICE);

    if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || _practice_mode === _MODE_PREPARE) {
        switch (_ui_questions.UI_PROGRESS) {
            case _PROGRESS_UNANSWERED:
                // use default values
                break;
            case _PROGRESS_INCORRECT:
                _button_icon = _ICON_PROGRESS_WRONG;
                _button_type = 'Reject';
                break;
            case _PROGRESS_IMPROVED1:
            case _PROGRESS_IMPROVED2:
            case _PROGRESS_IMPROVED3:
            case _PROGRESS_CORRECT:
                _button_icon = _ICON_PROGRESS_CORRECT;
                _button_type = 'Accept';
                break;
        }
    }

    IconProgress.setVisible(_button_visible);
    IconProgress.setIcon(_button_icon);
    IconProgress.setType(_button_type);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_ButtonBookmark(_index) {

    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];
    var _button_type;

    var _button_visible = (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || _practice_mode === _MODE_PREPARE);
    var _bookmark_count = 0;

    if (_ui_questions.UI_BOOKMARK === _ABAP_TRUE) {
        _button_type = 'Emphasized';
    } else {
        _button_type = 'Default';
    }
    ButtonMark.setType(_button_type);
    ButtonMark.setVisible(_button_visible);
    ButtonMarkedPrevious.setVisible(_button_visible);
    ButtonMarkedNext.setVisible(_button_visible);

    if (_button_visible) {
        for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
            if (i !== _index && ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _bookmark_count++;
            }
        }
        ButtonMarkedNext.setEnabled(_bookmark_count > 0);
        ButtonMarkedPrevious.setEnabled(_bookmark_count > 0);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _show_continue(_mode_continue) {

    var _show = false;
    var _caption = '';

    switch (_mode_continue) {
        case _QUICK_BUTTON_HIDE:
            break;
        case _QUICK_BUTTON_CONTINUE:
            _show = true;
            _caption = 'Next Question';
            break;
        case _QUICK_BUTTON_CHECK:
            _show = true;
            _caption = 'Check and Continue';
            break;
    }

    oSplitterContinue.setVisible(_show);
    ListContinue.setVisible(_show);
    oActionListContinue.setText(_caption);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _show_answer(_index) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var i;
    var _ui_variants;
    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];

    switch (_get_question_type(_ui_questions.QUESTION_ID)) {
        case _QUESTION_TYPE_INPUT:
            _ui_variants = ListType.getModel().getData()[0];
            _ui_variants.UI_SHOW_ANSWER = true; // for type-answer question only
            ModelData.Update(ListType, 'VARIANT_ID', _ui_variants.VARIANT_ID, _ui_variants);
            break;
        case _QUESTION_TYPE_SINGLE:
            for (i = 0; i < ListSingleSelect.getModel().getData().length; i++) {
                _ui_variants = ListSingleSelect.getModel().getData()[i];
                if (_ui_variants.CORRECT === _ABAP_TRUE) {
                    _ui_variants.UI_CORRECT_HIGHLIGHT = 'Success';
                }
                ModelData.Update(ListSingleSelect, 'VARIANT_ID', _ui_variants.VARIANT_ID, _ui_variants);
            }
            break;
        case _QUESTION_TYPE_MULTIPLE:
            for (i = 0; i < ListMultiSelect.getModel().getData().length; i++) {
                _ui_variants = ListMultiSelect.getModel().getData()[i];
                if (_ui_variants.CORRECT === _ABAP_TRUE) {
                    _ui_variants.UI_CORRECT_HIGHLIGHT = 'Success';
                }
                ModelData.Update(ListMultiSelect, 'VARIANT_ID', _ui_variants.VARIANT_ID, _ui_variants);
            }
    }

    // Explanation section visibility
    if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || (_practice_mode === _MODE_PREPARE && _ui_questions.UI_QUESTION_EVALUATED) || _practice_mode === _MODE_RESULTS) {
        oHBoxExplanation.setVisible(true);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _evaluate_answer(_index) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var i;
    var _ui_variants;
    var _is_correct = true;
    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];
    var _question_type = _get_question_type(_ui_questions.QUESTION_ID);

    if (_question_type === _QUESTION_TYPE_INPUT) {
        for (i = 0; i < ListVariantsUI.getModel().getData().length; i++) {
            _ui_variants = ListVariantsUI.getModel().getData()[i];
            if (_ui_variants.QUESTION_ID === _ui_questions.QUESTION_ID) {
                _ui_variants.UI_EDITABLE = false;
                _ui_variants.UI_SELECT_HIGHLIGHT = 'None';
                if (_ui_variants.UI_TYPE_ANSWER.toUpperCase() === _ui_variants.VARIANT.toUpperCase()) {
                    _ui_variants.UI_CORRECT_HIGHLIGHT = 'Success';
                } else {
                    _ui_variants.UI_CORRECT_HIGHLIGHT = 'Error';
                    _is_correct = false;
                }
                ModelData.Update(ListVariantsUI, ['QUESTION_ID', 'VARIANT_ID'], [_ui_questions.QUESTION_ID, _ui_variants.VARIANT_ID], _ui_variants);
            }
        }
    }

    if (_question_type === _QUESTION_TYPE_SINGLE || _question_type === _QUESTION_TYPE_MULTIPLE) {
        for (i = 0; i < ListVariantsUI.getModel().getData().length; i++) {
            _ui_variants = ListVariantsUI.getModel().getData()[i];
            if (_ui_variants.QUESTION_ID === _ui_questions.QUESTION_ID) {

                _ui_variants.UI_SELECT_HIGHLIGHT = 'None';
                _ui_variants.UI_EDITABLE = false;

                if (_ui_variants.UI_SELECTED && _ui_variants.CORRECT === _ABAP_TRUE) {
                    _ui_variants.UI_SELECT_HIGHLIGHT = 'Success';
                }
                if (_ui_variants.UI_SELECTED && _ui_variants.CORRECT === _ABAP_FALSE) {
                    _ui_variants.UI_SELECT_HIGHLIGHT = 'Error';
                }

                if (_ui_variants.UI_SELECTED && _ui_variants.CORRECT === _ABAP_FALSE || !_ui_variants.UI_SELECTED && _ui_variants.CORRECT === _ABAP_TRUE) {
                    _is_correct = false;
                }

                ModelData.Update(ListVariantsUI, ['QUESTION_ID', 'VARIANT_ID'], [_ui_questions.QUESTION_ID, _ui_variants.VARIANT_ID], _ui_variants);
            }
        }
    }

    if (_is_correct) {
        _ui_questions.UI_CORRECT_HIGHLIGHT = 'Success';
    } else {
        _ui_questions.UI_CORRECT_HIGHLIGHT = 'Error';
    }
    _ui_questions.UI_QUESTION_EVALUATED = true;

    // Calculate next progress
    if (_is_correct) {
        switch (_ui_questions.UI_PROGRESS) {
            case _PROGRESS_UNANSWERED:
            case _PROGRESS_IMPROVED3:
                _ui_questions.UI_PROGRESS = _PROGRESS_CORRECT;
                break;
            case _PROGRESS_INCORRECT:
                _ui_questions.UI_PROGRESS = _PROGRESS_IMPROVED1;
                break;
            case _PROGRESS_IMPROVED1:
                _ui_questions.UI_PROGRESS = _PROGRESS_IMPROVED2;
                break;
            case _PROGRESS_IMPROVED2:
                _ui_questions.UI_PROGRESS = _PROGRESS_IMPROVED3;
                break;
        }
    } else {
        _ui_questions.UI_PROGRESS = _PROGRESS_INCORRECT;
    }

    // Update current UI
    ModelData.Update(ListQuestionsUI, 'QUESTION_ID', _ui_questions.QUESTION_ID, _ui_questions);

    // Update progress in the current UI
    ModelData.UpdateField(ListPQSelect, "QUESTION_ID", _ui_questions.QUESTION_ID, "UI_CORRECT_HIGHLIGHT", _get_correct_highlight(_ui_questions.UI_PROGRESS));

    // Cache progress in the local storage
    _add_metrics(_index, _ui_questions.UI_PROGRESS);

    // Refresh progress icon after evaluation
    _set_UI_IconProgress(_index);

    return _is_correct;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_test_id_format(_test_id) {

    var _test_id_new = _test_id.toString();
    while (_test_id_new.length < _ID_ZERO_TEST.length) _test_id_new = "0" + _test_id_new;
    return _test_id_new;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_sync_id(_test_id, _upload_on, _upload_at) {

    var _ls_sync_id;
    var _ls_sync;

    for (var i = 0; i < ListSyncMetricsLS.getModel().getData().length; i++) {
        _ls_sync = ListSyncMetricsLS.getModel().getData()[i];
        if (_ls_sync.TEST_ID === _test_id && _ls_sync.UPLOAD_ON === _upload_on && _ls_sync.UPLOAD_AT === _upload_at) {
            _ls_sync_id = _ls_sync.LS_SYNC_ID;
        }
    }

    if (typeof _ls_sync_id === 'undefined') {

        var _ls_sync_id_new = 1;
        for (i = 0; i < ListSyncMetricsLS.getModel().getData().length; i++) {
            if (ListSyncMetricsLS.getModel().getData()[i].LS_SYNC_ID === _get_test_id_format(_ls_sync_id_new)) {
                _ls_sync_id_new++;
                i = 0;
            }
        }
        _ls_sync_id = _get_test_id_format(_ls_sync_id_new);

        _ls_sync = new modelPageSyncLS.getData();

        _ls_sync.TEST_ID = _test_id;
        _ls_sync.UPLOAD_ON = _upload_on;
        _ls_sync.UPLOAD_AT = _upload_at;

        _ls_sync.LS_SYNC_ID = _ls_sync_id;

        _ls_sync.LS_SYNC_ON = _INITIAL_DATE;
        _ls_sync.LS_SYNC_AT = _INITIAL_TIME;

        ModelData.Add(ListSyncMetricsLS, _ls_sync);
        setCacheListSyncMetricsLS();
    }
    return _ls_sync_id;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_test_id(_test_id, _upload_on, _upload_at) {

    for (var i = 0; i < ListTestsLS.getModel().getData().length; i++) {
        var _ls_tests = ListTestsLS.getModel().getData()[i];
        if (_ls_tests.TEST_ID === _test_id && _ls_tests.UPLOAD_ON === _upload_on && _ls_tests.UPLOAD_AT === _upload_at) {
            //            if (_ls_tests.LS_DOWNLOADED && !_ls_tests.LS_DELETED) {
            return _ls_tests.LS_TEST_ID;
            //            } else {
            //                return _ID_ZERO_TEST;
            //            }
        }
    }
    return _ID_ZERO_TEST;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_ui_sync_id() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ls_sync_id = _get_sync_id(_ui_tests.TEST_ID, _ui_tests.UPLOAD_ON, _ui_tests.UPLOAD_AT);

    return _ls_sync_id;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _add_metrics(_index, _progress) {

    var _ls_sync_id = _get_ui_sync_id();

    if (typeof _index !== 'undefined') {
        var _ui_questions = ListQuestionsUI.getModel().getData()[_index];

        // Remove Metrics with PROGRESS = _PROGRESS_UNANSWERED (in case of already done/received reset) the next activity will be the last
        ModelData.Delete(ListMetricsLS, ["LS_SYNC_ID", "QUESTION_ID", "PROGRESS"], [_ls_sync_id, _ui_questions.QUESTION_ID, _PROGRESS_UNANSWERED]);

        var _ls_metrics = new modelPageMetricsLS.getData();

        _ls_metrics.LS_SYNC_ID = _ls_sync_id;
        _ls_metrics.QUESTION_ID = _ui_questions.QUESTION_ID;
        _ls_metrics.ACTIVE_ON = _get_date();
        _ls_metrics.ACTIVE_AT = _get_time();
        _ls_metrics.PROGRESS = _progress;

        ModelData.Add(ListMetricsLS, _ls_metrics);
        setCacheListMetricsLS();

    } else {
        for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
            _add_metrics(i, _PROGRESS_UNANSWERED);
        }
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _sort_metrics_ls() {

    ListMetricsLS.getModel().getData().sort(function(_a, _b) {
        if (_a.ACTIVE_ON > _b.ACTIVE_ON || _a.ACTIVE_ON === _b.ACTIVE_ON && _a.ACTIVE_AT > _b.ACTIVE_AT) {
            return -1;
        }
        if (_a.ACTIVE_ON < _b.ACTIVE_ON || _a.ACTIVE_ON === _b.ACTIVE_ON && _a.ACTIVE_AT < _b.ACTIVE_AT) {
            return 1;
        }
        return 0;
    });
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_progress(_ls_sync_id, _question_id) {

    // Metrics local storage must be sorted _sort_metrics_ls before using this function
    for (var i = 0; i < ListMetricsLS.getModel().getData().length; i++) {
        var _ls_metrics = ListMetricsLS.getModel().getData()[i];
        if (_ls_metrics.LS_SYNC_ID === _ls_sync_id && _ls_metrics.QUESTION_ID === _question_id) {
            return _ls_metrics.PROGRESS;
        }
    }
    return _PROGRESS_UNANSWERED;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_ui_progress(_question_id) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ls_sync_id = _get_sync_id(_ui_tests.TEST_ID, _ui_tests.UPLOAD_ON, _ui_tests.UPLOAD_AT);

    return _get_progress(_ls_sync_id, _question_id);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _reset_progress() {

    // Add _PROGRESS_UNANSWERED for all questions
    _add_metrics();

    // Update current UI
    ModelData.UpdateField(ListPQSelect, "UI_VISIBLE_QUESTION", true, "UI_CORRECT_HIGHLIGHT", _get_correct_highlight(_PROGRESS_UNANSWERED));

    _set_UI_reset();

    if (navigator.onLine && !_ajax_error) {
        setTimeout(function() {
            _ajax_activities(false);
        }, _SYNC_DELAY);
    } else {
        _set_UI_progress();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_date(_date) {

    const _now = (typeof _date === 'undefined' ? new Date() : _date);

    const _day = (_now.getDate().toString().length === 1 ? "0" + _now.getDate().toString() : _now.getDate().toString());
    const _month = ((_now.getMonth() + 1).toString().length === 1 ? "0" + (_now.getMonth() + 1).toString() : (_now.getMonth() + 1).toString());
    const _year = _now.getFullYear().toString();

    return (_year + _month + _day).toString();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_time(_time) {

    const _now = (typeof _time === 'undefined' ? new Date() : _time);

    const _hour = (_now.getHours().toString().length === 1 ? "0" + _now.getHours().toString() : _now.getHours().toString());
    const _min = (_now.getMinutes().toString().length === 1 ? "0" + _now.getMinutes().toString() : _now.getMinutes().toString());
    const _sec = (_now.getSeconds().toString().length === 1 ? "0" + _now.getSeconds().toString() : _now.getSeconds().toString());

    return (_hour + _min + _sec).toString();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _is_answer_given(_index) {

    var i;
    var _is_given = false;

    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];

    switch (_get_question_type(_ui_questions.QUESTION_ID)) {
        case _QUESTION_TYPE_INPUT:
            _is_given = (ListType.getModel().getData()[0].UI_TYPE_ANSWER.length > 0);
            break;
        case _QUESTION_TYPE_SINGLE:
            for (i = 0; i < ListSingleSelect.getModel().getData().length; i++) {
                _is_given = (_is_given || ListSingleSelect.getModel().getData()[i].UI_SELECTED);
            }
            break;
        case _QUESTION_TYPE_MULTIPLE:
            // Check if multiple select is answered (more than one item selected)
            // var _selected_count = 0;
            for (i = 0; i < ListMultiSelect.getModel().getData().length; i++) {
                _is_given = (_is_given || ListMultiSelect.getModel().getData()[i].UI_SELECTED); // option if we accept a single answer
                //    if (ListMultiSelect.getModel().getData()[i].UI_SELECTED) {
                //        _selected_count++;
                //    }
            }
            //    _is_given = (_selected_count >= 2);
            break;
    }
    return _is_given;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_answer_given(_answer_given) {

    var _ui_questions = PageQuestion.getModel().getData();

    _ui_questions.UI_ANSWER_GIVEN = _answer_given;

    PageQuestion.getModel().setData(_ui_questions);

    if (_practice_mode === _MODE_PREPARE && _answer_given) {
        _show_continue(_QUICK_BUTTON_CHECK);
    } else {
        _show_continue(_QUICK_BUTTON_HIDE);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _bookmark_question() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ui_questions = PageQuestion.getModel().getData();

    if (_ui_questions.UI_BOOKMARK === _ABAP_TRUE) {
        _ui_questions.UI_BOOKMARK = _ABAP_FALSE;
    } else {
        _ui_questions.UI_BOOKMARK = _ABAP_TRUE;
    }

    // Update current UI
    PageQuestion.getModel().setData(_ui_questions);

    // Cache progress in the local storage
    ModelData.UpdateField(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ui_tests.UI_TEST_ID, _ui_questions.QUESTION_ID], ["LS_BOOKMARK", "LS_ACTIVE_ON", "LS_ACTIVE_AT"], [_ui_questions.UI_BOOKMARK, _get_date(), _get_time()]);
    setCacheListQuestionsLS();

    // Refresh bookmark button after update
    _set_UI_ButtonBookmark(_current_question);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _goto_next_question(_bookmark) {

    var i;

    if (_bookmark) {
        for (i = _current_question + 1; i < ListQuestionsUI.getModel().getData().length; i++) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
        for (i = 0; i < _current_question; i++) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
    } else {
        _goto_question(_current_question + 1);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _goto_previous_question(_bookmark) {

    var i;

    if (_bookmark) {
        for (i = _current_question - 1; i >= 0; i--) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
        for (i = ListQuestionsUI.getModel().getData().length - 1; i > _current_question; i--) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
    } else {
        _goto_question(_current_question - 1);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _goto_question(_index) {

    var _ui_questions = ListQuestionsUI.getModel().getData()[_current_question];

    if (_practice_mode === _MODE_PREPARE && _is_answer_given(_current_question) && !_ui_questions.UI_QUESTION_EVALUATED) {
        if (!_evaluate_answer(_current_question)) {
            _show_answer(_current_question);
            _show_continue(_QUICK_BUTTON_CONTINUE);
            // _bookmark_question(true); // if we want to "force bookmark" for wrong answers
            return;
        } else {
            _show_answer(_current_question);
            _show_continue(_QUICK_BUTTON_HIDE);
            setTimeout(function() {
                _show_question(_index);
            }, _DELAY_KEEP_CORRECT);
            return;
        }
    }
    _show_question(_index);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _shuffle_array(_array) {

    var _current_index = _array.length;

    while (_current_index !== 0) {
        var _random_index = Math.floor(Math.random() * _current_index);
        _current_index--;
        [_array[_current_index], _array[_random_index]] = [_array[_random_index], _array[_current_index]];
    }
    return _array;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _submit_results() {

    _practice_mode = _MODE_RESULTS;

    // Evaluate answers
    var _correct_answers = 0;
    for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
        if (ListQuestionsUI.getModel().getData()[i].UI_ANSWER_GIVEN && _evaluate_answer(i)) {
            _correct_answers++;
        }
    }

    var _percent = parseInt((100 / ListQuestionsUI.getModel().getData().length) * _correct_answers);
    ProgressResults.setPercentValue(_percent);
    ProgressResults.setDisplayValue(_percent + ' %');

    if (_percent >= PageParameters.getModel().getData().PRACTICE_LIMIT) {
        ProgressResults.setState('Success');
        oHBoxResultsSuccess.setVisible(true);
        oHBoxResultsFailed.setVisible(false);
    } else {
        ProgressResults.setState('Error');
        oHBoxResultsSuccess.setVisible(false);
        oHBoxResultsFailed.setVisible(true);
    }

    oApp.to(PageResults);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _start_timer(_duration_minutes) {

    var _timer = _duration_minutes * 60;
    var _minutes;
    var _seconds;

    if (_timer > 0) {
        ButtonSubmit.setText("--:--");

        const _interval = setInterval(function() {

            // paused
            if (_practice_mode === _MODE_PAUSE) {
                return;
            }

            // manual submit
            if (_practice_mode !== _MODE_PRACTICE) {
                clearInterval(_interval);
                return;
            }

            // timer submit
            if (_timer < 0) {
                clearInterval(_interval);
                _submit_results();
                return;
            }

            _minutes = parseInt(_timer / 60, 10);
            _seconds = parseInt(_timer % 60, 10);

            _minutes = _minutes < 10 ? "0" + _minutes : _minutes;
            _seconds = _seconds < 10 ? "0" + _seconds : _seconds;

            ButtonSubmit.setText(_minutes + ":" + _seconds);

            _timer--;
        }, 1000);
    } else {
        // timer can be disabled and it will wait for the user to Submit
        ButtonSubmit.setText("Submit");
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_reset() {

    var _ui_tests = PageTestSelect.getModel().getData();

    _practice_mode = _MODE_PREVIEW;
    _current_question = 0;

    // Sort Metrics local storage before using _get_progress
    _sort_metrics_ls();

    // Refresh Question list (different Parts selected / reset Practice trim) and clean UI artifacts after last session
    ListQuestionsUI.getModel().setData([]);
    ListVariantsUI.getModel().setData([]);

    for (var i = 0; i < ListQuestionsLS.getModel().getData().length; i++) {
        var _ls_questions = ListQuestionsLS.getModel().getData()[i];
        if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            var _ui_questions = new modelPageQuestionsUI.getData();

            _ui_questions.QUESTION_ID = _ls_questions.QUESTION_ID;
            _ui_questions.PART_ID = _ls_questions.PART_ID;
            _ui_questions.QUESTION = _ls_questions.QUESTION;
            _ui_questions.EXPLANATION = _ls_questions.EXPLANATION;

            _ui_questions.UI_PROGRESS = _get_ui_progress(_ls_questions.QUESTION_ID);
            _ui_questions.UI_BOOKMARK = _ls_questions.LS_BOOKMARK;
            _ui_questions.UI_ANSWER_GIVEN = false;
            _ui_questions.UI_QUESTION_EVALUATED = false;
            _ui_questions.UI_CORRECT_HIGHLIGHT = 'None';

            ModelData.Add(ListQuestionsUI, _ui_questions);
        }
    }

    for (var j = 0; j < ListVariantsLS.getModel().getData().length; j++) {
        var _ls_variants = ListVariantsLS.getModel().getData()[j];
        if (_ls_variants.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            var _ui_variants = new modelPageVariantsUI.getData();

            _ui_variants.QUESTION_ID = _ls_variants.QUESTION_ID;
            _ui_variants.VARIANT_ID = _ls_variants.VARIANT_ID;
            _ui_variants.CORRECT = _ls_variants.CORRECT;
            _ui_variants.VARIANT = _ls_variants.VARIANT;

            _ui_variants.UI_SELECTED = false;
            _ui_variants.UI_TYPE_ANSWER = '';

            ModelData.Add(ListVariantsUI, _ui_variants);
        }
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_progress() {

    var _parameters = PageParameters.getModel().getData();

    // Set default parameters
    if (typeof _parameters.PRACTICE_COUNT === 'undefined') {
        _parameters.PRACTICE_COUNT = _DEFAULT_COUNT;
        _parameters.PRACTICE_TIMER = _DEFAULT_TIMER;
        _parameters.PRACTICE_LIMIT = _DEFAULT_LIMIT;

        PageParameters.getModel().setData(_parameters);
        setCachePageParameters();
    }

    // Sort Metrics local storage before using _get_progress
    _sort_metrics_ls();

    // Refresh UI progress based on latest LS
    for (var i = 0; i < ListTestsUI.getModel().getData().length; i++) {
        var _ui_tests = ListTestsUI.getModel().getData()[i];

        var _ls_sync_id = _get_sync_id(_ui_tests.TEST_ID, _ui_tests.UPLOAD_ON, _ui_tests.UPLOAD_AT);

        var _result_correct = 0;
        for (var j = 0; j < ListQuestionsLS.getModel().getData().length; j++) {
            var _ls_questions = ListQuestionsLS.getModel().getData()[j];
            if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
                switch (_get_progress(_ls_sync_id, _ls_questions.QUESTION_ID)) {
                    case _PROGRESS_IMPROVED1:
                    case _PROGRESS_IMPROVED2:
                    case _PROGRESS_IMPROVED3:
                    case _PROGRESS_CORRECT:
                        _result_correct++;
                        break;
                }
            }
        }

        _ui_tests.UI_PERCENTAGE = parseInt((100 / _ui_tests.UI_COUNT_QUESTIONS) * _result_correct);
        if (_ui_tests.UI_PERCENTAGE === 0) {
            _ui_tests.UI_PERCENTAGE_COLOR = 'Neutral'; // sap.m.ValueColor
        } else {
            if (_ui_tests.UI_PERCENTAGE >= _parameters.PRACTICE_LIMIT) {
                _ui_tests.UI_PERCENTAGE_COLOR = 'Good'; // sap.m.ValueColor
            } else {
                _ui_tests.UI_PERCENTAGE_COLOR = 'Error'; // sap.m.ValueColor
            }
        }

        ModelData.Update(ListTestsUI, 'UI_TEST_ID', _ui_tests.UI_TEST_ID, _ui_tests);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_order() {

    for (var i = 0; i < ListTestsUI.getModel().getData().length; i++) {
        var _ui_tests = ListTestsUI.getModel().getData()[i];

        if (_ui_tests.UI_FAVORITE) {
            _ui_tests.UI_FAVORITE_ICON = _ICON_FAVORITE;
        } else {
            _ui_tests.UI_FAVORITE_ICON = _ICON_UNFAVORITE;
        }

        ModelData.Update(ListTestsUI, 'UI_TEST_ID', _ui_tests.UI_TEST_ID, _ui_tests);
    }

    // new to old
    ListTestsUI.getModel().getData().sort(function(a, b) {
        if (a.UPLOAD_ON > b.UPLOAD_ON) {
            return -1;
        }
        if (a.UPLOAD_ON < b.UPLOAD_ON) {
            return 1;
        }
        if (a.UPLOAD_AT > b.UPLOAD_AT) {
            return -1;
        }
        if (a.UPLOAD_AT < b.UPLOAD_AT) {
            return 1;
        }
        return 0;
    });

    // my content first
    ListTestsUI.getModel().getData().sort(function(a, b) {
        if (a.UPLOAD_BY === PageSY.getModel().getData().SAP_USER && b.UPLOAD_BY !== PageSY.getModel().getData().SAP_USER) {
            return -1;
        }
        if (a.UPLOAD_BY !== PageSY.getModel().getData().SAP_USER && b.UPLOAD_BY === PageSY.getModel().getData().SAP_USER) {
            return 1;
        }
        return 0;
    });

    // favorites first
    ListTestsUI.getModel().getData().sort(function(a, b) {
        if (a.UI_FAVORITE && !b.UI_FAVORITE) {
            return -1;
        }
        if (!a.UI_FAVORITE && b.UI_FAVORITE) {
            return 1;
        }
        return 0;
    });

    ListTestsUI.getModel().refresh(true);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_published() {

    for (var i = 0; i < ListTestsUI.getModel().getData().length; i++) {
        var _ui_tests = ListTestsUI.getModel().getData()[i];

        _ui_tests.UI_VIS_INFO_LINE_3 = (_ui_tests.UPLOAD_BY !== PageSY.getModel().getData().SAP_USER);
        _ui_tests.UI_VIS_PUBLISHED = (_ui_tests.PUBLISHED === _ABAP_TRUE && _ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER);
        _ui_tests.UI_VIS_PRIVATE = (_ui_tests.PUBLISHED === _ABAP_FALSE && _ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER);

        ModelData.Update(ListTestsUI, 'UI_TEST_ID', _ui_tests.UI_TEST_ID, _ui_tests);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_ActionSheet() {

    var _ui_tests = PageTestSelect.getModel().getData();

    if (_ui_tests.PUBLISHED === _ABAP_TRUE) {
        ButtonPublish.setText('Unpublish');
    } else {
        ButtonPublish.setText('Publish');
    }

    ButtonPublish.setEnabled(_ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER);
    ButtonRename.setEnabled(_ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _reset_device() {

    // try the backend and save all latest activities
    if (navigator.onLine && !_ajax_error) {
        _ajax_activities(false);
    }

    if (navigator.onLine && !_ajax_error) {

        // Clean local storage
        ListTestsLS.getModel().setData([]);
        ListPartsLS.getModel().setData([]);
        ListQuestionsLS.getModel().setData([]);
        ListVariantsLS.getModel().setData([]);

        ListSyncMetricsLS.getModel().setData([]);
        ListMetricsLS.getModel().setData([]);

        // Cache local storage
        setCacheListTestsLS();
        setCacheListPartsLS();
        setCacheListQuestionsLS();
        setCacheListVariantsLS();

        setCacheListSyncMetricsLS();
        setCacheListMetricsLS();

        setTimeout(function() {
            _first_refresh();
        }, _SYNC_DELAY);

        jQuery.sap.require("sap.m.MessageToast");
        sap.m.MessageToast.show("Reset successful");

    } else {
        _ajax_toast_offline();
    }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_refresh() {

    if (navigator.onLine) {
        ListTestsSY_IN.getModel().setData([]);

        for (var i = 0; i < ListTestsLS.getModel().getData().length; i++) {
            var _ls_tests = ListTestsLS.getModel().getData()[i];

            //TODO LS_DELETED -> LS_LOCAL

            // do not refresh local content
            // content might be temporary private it will also not be refreshed until published again
            if (!_ls_tests.LS_DELETED) {
                var _sy_tests_IN = new modelPageTestsSY_IN.getData();

                _sy_tests_IN.TEST_ID = _ls_tests.TEST_ID;
                _sy_tests_IN.UPLOAD_ON = _ls_tests.UPLOAD_ON;
                _sy_tests_IN.UPLOAD_AT = _ls_tests.UPLOAD_AT;
                _sy_tests_IN.VERSION = _ls_tests.LS_VERSION;

                ModelData.Add(ListTestsSY_IN, _sy_tests_IN);
            }
        }

        _set_UI_busy(true);
        getOnlineAjaxRefresh();
    } else {
        _set_UI_busy(false);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_refresh_success() {

    for (var i = 0; i < ListTestsSY_OUT.getModel().getData().length; i++) {
        var _sy_tests_OUT = ListTestsSY_OUT.getModel().getData()[i];

        var _ls_test_id = _get_test_id(_sy_tests_OUT.TEST_ID, _sy_tests_OUT.UPLOAD_ON, _sy_tests_OUT.UPLOAD_AT);

        if (_ls_test_id === _ID_ZERO_TEST) {

            // inserted

            var _ls_test_id_new = 1;
            for (var k = 0; k < ListTestsLS.getModel().getData().length; k++) {
                if (ListTestsLS.getModel().getData()[k].LS_TEST_ID === _get_test_id_format(_ls_test_id_new)) {
                    _ls_test_id_new++;
                    k = 0;
                }
            }
            _ls_test_id = _get_test_id_format(_ls_test_id_new);

            var _ls_tests_ins = new modelPageTestsLS.getData();

            _ls_tests_ins.LS_TEST_ID = _ls_test_id;
            _ls_tests_ins.TEST_ID = _sy_tests_OUT.TEST_ID;
            _ls_tests_ins.UPLOAD_ON = _sy_tests_OUT.UPLOAD_ON;
            _ls_tests_ins.UPLOAD_AT = _sy_tests_OUT.UPLOAD_AT;
            _ls_tests_ins.UPLOAD_BY = _sy_tests_OUT.UPLOAD_BY;
            _ls_tests_ins.PUBLISHED = _sy_tests_OUT.PUBLISHED;
            _ls_tests_ins.DESCRIPTION = _sy_tests_OUT.DESCRIPTION;

            _ls_tests_ins.LS_VERSION = _VERSION_DO_NOT_SYNC;

            _ls_tests_ins.LS_COUNT_PARTS = _sy_tests_OUT.SY_COUNT_PARTS;
            _ls_tests_ins.LS_COUNT_QUESTIONS = _sy_tests_OUT.SY_COUNT_QUESTIONS;
            _ls_tests_ins.LS_UPLOAD_BY_NAME = _sy_tests_OUT.SY_UPLOAD_BY_NAME;

            _ls_tests_ins.LS_SYNC_ON = _INITIAL_DATE;
            _ls_tests_ins.LS_SYNC_AT = _INITIAL_TIME;

            _ls_tests_ins.LS_DOWNLOADED = false;
            _ls_tests_ins.LS_DELETED = false;
            _ls_tests_ins.LS_FAVORITE = false;

            //TODO rating
            //                _ls_tests_ins.LS_RATING = '';
            //                _ls_tests_ins.LS_ACTIVE_ON = _INITIAL_DATE;
            //                _ls_tests_ins.LS_ACTIVE_AT = _INITIAL_TIME;

            ModelData.Add(ListTestsLS, _ls_tests_ins);
        } else {

            // updated

            // in case it is published again
            ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, "LS_DELETED", false);

            // update header
            ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, ["DESCRIPTION", "PUBLISHED"], [_sy_tests_OUT.DESCRIPTION, _sy_tests_OUT.PUBLISHED]);

            // for not downloaded it cannot be calculated
            ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, ["LS_COUNT_PARTS", "LS_COUNT_QUESTIONS", "LS_UPLOAD_BY_NAME"], [_sy_tests_OUT.SY_COUNT_PARTS, _sy_tests_OUT.SY_COUNT_QUESTIONS, _sy_tests_OUT.SY_UPLOAD_BY_NAME]);

            //TODO rating

            // remove from the device item no longer presenting in the backend
            if (ModelData.Find(ListCheckSY, ["TEST_ID"], [_sy_tests_OUT.TEST_ID]).length > 0) {
                var _part_id;
                var _ls_parts_arr = ModelData.Find(ListPartsLS, "LS_TEST_ID", _ls_test_id);
                for (var j = 0; j < _ls_parts_arr.length; j++) {
                    _part_id = _ls_parts_arr[j].PART_ID;
                    if (ModelData.Find(ListCheckSY, ["TEST_ID", "PART_ID"], [_sy_tests_OUT.TEST_ID, _part_id]).length === 0) {
                        ModelData.Delete(ListPartsLS, ["LS_TEST_ID", "PART_ID"], [_ls_test_id, _part_id]);
                    }
                }

                var _question_id;
                var _ls_questions_arr = ModelData.Find(ListQuestionsLS, "LS_TEST_ID", _ls_test_id);
                for (j = 0; j < _ls_questions_arr.length; j++) {
                    _question_id = _ls_questions_arr[j].QUESTION_ID;
                    if (ModelData.Find(ListCheckSY, ["TEST_ID", "QUESTION_ID"], [_sy_tests_OUT.TEST_ID, _question_id]).length === 0) {
                        ModelData.Delete(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ls_test_id, _question_id]);
                    }
                }

                var _variant_id;
                var _ls_variants_arr = ModelData.Find(ListVariantsLS, "LS_TEST_ID", _ls_test_id);
                for (j = 0; j < _ls_variants_arr.length; j++) {
                    _question_id = _ls_variants_arr[j].QUESTION_ID;
                    _variant_id = _ls_variants_arr[j].VARIANT_ID;
                    if (ModelData.Find(ListCheckSY, ["TEST_ID", "QUESTION_ID", "VARIANT_ID"], [_sy_tests_OUT.TEST_ID, _question_id, _variant_id]).length === 0) {
                        ModelData.Delete(ListVariantsLS, ["LS_TEST_ID", "QUESTION_ID", "VARIANT_ID"], [_ls_test_id, _question_id, _variant_id]);
                    }
                    //                    if (ModelData.Find(ListCheckSY, ["TEST_ID", "QUESTION_ID", "VARIANT_ID_LOW", "VARIANT_ID_HIGH"], [_sy_tests_OUT.TEST_ID, _question_id, _variant_id, _variant_id], ["EQ", "EQ", "GE", "LE"]).length === 0) {
                    //                        ModelData.Delete(ListVariantsLS, ["LS_TEST_ID", "QUESTION_ID", "VARIANT_ID"], [_ls_test_id, _question_id, _variant_id]);
                    //                    }
                }
            }

            // insert new and updated items to the local storage
            _ajax_download_sync(_sy_tests_OUT.TEST_ID, _ls_test_id, _sy_tests_OUT.VERSION);
        }
    }

    // check for deleted content

    for (i = 0; i < ListTestsLS.getModel().getData().length; i++) {
        var _ls_tests = ListTestsLS.getModel().getData()[i];

        if (!_ls_tests.LS_DELETED) {

            if (ModelData.Find(ListTestsSY_OUT, ["TEST_ID", "UPLOAD_ON", "UPLOAD_AT"], [_ls_tests.TEST_ID, _ls_tests.UPLOAD_ON, _ls_tests.UPLOAD_AT]).length === 0) {
                // the content has been deleted or now private
                if (_ls_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER) {
                    // your own content will be removed via refresh (assuming you don`t want it on all your devices)
                    ModelData.Delete(ListTestsLS, "LS_TEST_ID", _ls_tests.LS_TEST_ID);
                    ModelData.Delete(ListPartsLS, "LS_TEST_ID", _ls_tests.LS_TEST_ID);
                    ModelData.Delete(ListQuestionsLS, "LS_TEST_ID", _ls_tests.LS_TEST_ID);
                    ModelData.Delete(ListVariantsLS, "LS_TEST_ID", _ls_tests.LS_TEST_ID);
                } else {
                    // content published by others
                    if (_ls_tests.LS_DOWNLOADED) {
                        // if downloaded then label it deleted / private and remain on this device
                        ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, "LS_DELETED", true);
                    } else {
                        // if not yet downloaded then remove it from the list
                        ModelData.Delete(ListTestsLS, "LS_TEST_ID", _ls_test_id);
                    }
                }
            }
        }
    }

    // Cache local storage
    setCacheListTestsLS();
    setCacheListPartsLS();
    setCacheListQuestionsLS();
    setCacheListVariantsLS();

    // Clean sync holders
    ListCheckSY.getModel().setData([]);
    ListTestsSY_IN.getModel().setData([]);
    ListTestsSY_OUT.getModel().setData([]);
    ListPartsSY.getModel().setData([]);
    ListQuestionsSY.getModel().setData([]);
    ListVariantsSY.getModel().setData([]);

    // On Refresh we rebuild the landing page (no local UI update)
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_download() {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();
        var _sy_tests_IN = new modelPageTestsSY_IN.getData();

        _sy_tests_IN.TEST_ID = _ui_tests.TEST_ID;
        _sy_tests_IN.UPLOAD_ON = _ui_tests.UPLOAD_ON;
        _sy_tests_IN.UPLOAD_AT = _ui_tests.UPLOAD_AT;
        //        _sy_tests_IN.VERSION = _VERSION_FIRST_SYNC; // request full sync

        PageTestsSY_IN.getModel().setData(_sy_tests_IN);

        _set_UI_busy(true);
        getOnlineAjaxDownload();
    } else {
        _ajax_toast_offline();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_download_success() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _sy_tests_OUT = PageTestsSY_OUT.getModel().getData();

    // insert new content to the local storage
    _ajax_download_sync(_ui_tests.TEST_ID, _ui_tests.UI_TEST_ID, _sy_tests_OUT.VERSION);

    // Mark as downloaded
    ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, "LS_DOWNLOADED", true);

    // Cache local storage
    setCacheListTestsLS();
    setCacheListPartsLS();
    setCacheListQuestionsLS();
    setCacheListVariantsLS();

    // Update current UI
    ModelData.UpdateField(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID, "UI_DOWNLOADED", true);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_publish() {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();
        var _sy_tests = PageTestsSY.getModel().getData();

        _sy_tests.UPLOAD_ON = _ui_tests.UPLOAD_ON;
        _sy_tests.UPLOAD_AT = _ui_tests.UPLOAD_AT;
        _sy_tests.TEST_ID = _ui_tests.TEST_ID;

        if (_ui_tests.PUBLISHED === _ABAP_TRUE) {
            _sy_tests.PUBLISHED = _ABAP_FALSE;
        } else {
            _sy_tests.PUBLISHED = _ABAP_TRUE;
        }

        PageTestsSY.getModel().setData(_sy_tests);

        _set_UI_busy(true);
        getOnlineAjaxPublish();
    } else {
        _ajax_toast_offline();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_publish_success() {

    var _ui_tests = PageTestSelect.getModel().getData();

    // Read from the latest SY passed to the backend on ajax
    var _sy_tests = PageTestsSY.getModel().getData();

    _ui_tests.PUBLISHED = _sy_tests.PUBLISHED;
    PageTestSelect.getModel().setData(_ui_tests);

    // Update local storage
    ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, "PUBLISHED", _sy_tests.PUBLISHED);

    // Cache local storage
    setCacheListTestsLS();

    // Update current UI
    ModelData.UpdateField(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID, "PUBLISHED", _sy_tests.PUBLISHED);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_rename() {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();
        var _sy_tests = PageTestsSY.getModel().getData();

        _sy_tests.UPLOAD_ON = _ui_tests.UPLOAD_ON;
        _sy_tests.UPLOAD_AT = _ui_tests.UPLOAD_AT;
        _sy_tests.TEST_ID = _ui_tests.TEST_ID;

        _sy_tests.DESCRIPTION = InputRename.getValue();

        PageTestsSY.getModel().setData(_sy_tests);

        _set_UI_busy(true);
        getOnlineAjaxRename();
    } else {
        _ajax_toast_offline();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_rename_success() {

    var _ui_tests = PageTestSelect.getModel().getData();

    // Read from the latest SY passed to the backend
    var _sy_tests = PageTestsSY.getModel().getData();

    // Update current selection
    _ui_tests.DESCRIPTION = _sy_tests.DESCRIPTION;
    PageTestSelect.getModel().setData(_ui_tests);

    // Update local storage
    ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, "DESCRIPTION", _sy_tests.DESCRIPTION);

    // Cache local storage
    setCacheListTestsLS();

    // Update current UI
    ModelData.UpdateField(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID, "DESCRIPTION", _sy_tests.DESCRIPTION);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_activities(_sync_all) {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();

        ListSyncMetricsSY.getModel().setData([]);
        ListMetricsSY.getModel().setData([]);
        ListSyncBookmarksSY.getModel().setData([]);
        ListBookmarksSY.getModel().setData([]);

        for (var i = 0; i < ListSyncMetricsLS.getModel().getData().length; i++) {
            var _ls_sync = ListSyncMetricsLS.getModel().getData()[i];
            if (_sync_all || _ls_sync.TEST_ID === _ui_tests.TEST_ID && _ls_sync.UPLOAD_ON === _ui_tests.UPLOAD_ON && _ls_sync.UPLOAD_AT === _ui_tests.UPLOAD_AT) {
                var _sy_sync_metrics = new modelPageSyncSY.getData();

                _sy_sync_metrics.TEST_ID = _ls_sync.TEST_ID;
                _sy_sync_metrics.UPLOAD_ON = _ls_sync.UPLOAD_ON;
                _sy_sync_metrics.UPLOAD_AT = _ls_sync.UPLOAD_AT;

                _sy_sync_metrics.SYNC_ON = _ls_sync.LS_SYNC_ON;
                _sy_sync_metrics.SYNC_AT = _ls_sync.LS_SYNC_AT;

                if (_sync_all) {
                    _sy_sync_metrics.SYNC_ID = _ls_sync.LS_SYNC_ID;
                } else {
                    _sy_sync_metrics.SYNC_ID = _ID_ZERO_TEST;
                }

                ModelData.Add(ListSyncMetricsSY, _sy_sync_metrics);

                for (var j = 0; j < ListMetricsLS.getModel().getData().length; j++) {
                    var _ls_metrics = ListMetricsLS.getModel().getData()[j];
                    if (_ls_metrics.LS_SYNC_ID === _ls_sync.LS_SYNC_ID) {
                        if (_sy_sync_metrics.SYNC_ON === '' && _sy_sync_metrics.SYNC_AT === '' ||
                            _ls_metrics.ACTIVE_ON > _sy_sync_metrics.SYNC_ON ||
                            _ls_metrics.ACTIVE_ON === _sy_sync_metrics.SYNC_ON && _ls_metrics.ACTIVE_AT > _sy_sync_metrics.SYNC_AT) {

                            var _sy_metrics = new modelPageMetricsSY.getData();

                            _sy_metrics.SYNC_ID = _sy_sync_metrics.SYNC_ID;
                            _sy_metrics.QUESTION_ID = _ls_metrics.QUESTION_ID;
                            _sy_metrics.ACTIVE_ON = _ls_metrics.ACTIVE_ON;
                            _sy_metrics.ACTIVE_AT = _ls_metrics.ACTIVE_AT;
                            _sy_metrics.PROGRESS = _ls_metrics.PROGRESS;

                            ModelData.Add(ListMetricsSY, _sy_metrics);
                        }
                    }
                }
            }
        }

        for (i = 0; i < ListTestsLS.getModel().getData().length; i++) {
            var _ls_tests = ListTestsLS.getModel().getData()[i];
            if (_ls_tests.LS_DOWNLOADED && !_ls_tests.LS_DELETED) {
                if (_sync_all || _ls_tests.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
                    var _sy_sync_bookmarks = new modelPageSyncSY.getData();

                    _sy_sync_bookmarks.TEST_ID = _ls_tests.TEST_ID;
                    _sy_sync_bookmarks.UPLOAD_ON = _ls_tests.UPLOAD_ON;
                    _sy_sync_bookmarks.UPLOAD_AT = _ls_tests.UPLOAD_AT;

                    _sy_sync_bookmarks.SYNC_ON = _ls_tests.LS_SYNC_ON;
                    _sy_sync_bookmarks.SYNC_AT = _ls_tests.LS_SYNC_AT;

                    if (_sync_all) {
                        _sy_sync_bookmarks.SYNC_ID = _ls_tests.LS_TEST_ID;
                    } else {
                        _sy_sync_bookmarks.SYNC_ID = _ID_ZERO_TEST;
                    }

                    ModelData.Add(ListSyncBookmarksSY, _sy_sync_bookmarks);

                    for (var k = 0; k < ListQuestionsLS.getModel().getData().length; k++) {
                        var _ls_questions = ListQuestionsLS.getModel().getData()[k];

                        if (_ls_questions.LS_TEST_ID === _ls_tests.LS_TEST_ID) {
                            if (_ls_tests.LS_SYNC_ON === '' && _ls_tests.LS_SYNC_AT === '' ||
                                _ls_questions.LS_ACTIVE_ON > _ls_tests.LS_SYNC_ON ||
                                _ls_questions.LS_ACTIVE_ON === _ls_tests.LS_SYNC_ON && _ls_questions.LS_ACTIVE_AT > _ls_tests.LS_SYNC_AT) {

                                var _sy_bookmarks = new modelPageBookmarksSY.getData();

                                _sy_bookmarks.SYNC_ID = _sy_sync_bookmarks.SYNC_ID;
                                _sy_bookmarks.QUESTION_ID = _ls_questions.QUESTION_ID;
                                _sy_bookmarks.BOOKMARK = _ls_questions.LS_BOOKMARK;
                                _sy_bookmarks.ACTIVE_ON = _ls_questions.LS_ACTIVE_ON;
                                _sy_bookmarks.ACTIVE_AT = _ls_questions.LS_ACTIVE_AT;

                                ModelData.Add(ListBookmarksSY, _sy_bookmarks);
                            }
                        }
                    }
                }
            }
        }

        // . all - pull to refresh / app started
        // . single - fetch after downloading new quiz
        // . single - if any data (metrics or bookmarks) is for sync (after using a quiz)

        if (_sync_all || _navigate_after_metrics ||
            ListMetricsSY.getModel().getData().length > 0 || ListBookmarksSY.getModel().getData().length > 0) {

            _set_UI_busy(true);
            getOnlineAjaxActivities();
        }
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_activities_success() {

    // it will only add metrics
    for (var i = 0; i < ListSyncMetricsSY.getModel().getData().length; i++) {
        var _sy_sync_metrics = ListSyncMetricsSY.getModel().getData()[i];

        // it will create new ListSyncMetricsLS if does not exist on this device
        var _ls_sync_id = _get_sync_id(_sy_sync_metrics.TEST_ID, _sy_sync_metrics.UPLOAD_ON, _sy_sync_metrics.UPLOAD_AT);
        ModelData.UpdateField(ListSyncMetricsLS, "LS_SYNC_ID", _ls_sync_id, ["LS_SYNC_ON", "LS_SYNC_AT"], [_sy_sync_metrics.SYNC_ON, _sy_sync_metrics.SYNC_AT]);

        if (ModelData.Find(ListMetricsSY, "SYNC_ID", _sy_sync_metrics.SYNC_ID).length > 0) {
            for (var j = 0; j < ListMetricsSY.getModel().getData().length; j++) {
                var _sy_metrics = ListMetricsSY.getModel().getData()[j];

                if (_sy_metrics.SYNC_ID === _sy_sync_metrics.SYNC_ID) {

                    // Remove Metrics with PROGRESS = _PROGRESS_UNANSWERED if we received any updated
                    var _ls_metrics_unanswered = ModelData.Find(ListMetricsLS, ["LS_SYNC_ID", "QUESTION_ID", "PROGRESS"], [_ls_sync_id, _sy_metrics.QUESTION_ID, _PROGRESS_UNANSWERED]);
                    if (_ls_metrics_unanswered.length > 0) {
                        // we expect _PROGRESS_UNANSWERED to be unique
                        if (_ls_metrics_unanswered[0].ACTIVE_ON < _sy_metrics.ACTIVE_ON ||
                            _ls_metrics_unanswered[0].ACTIVE_ON === _sy_metrics.ACTIVE_ON && _ls_metrics_unanswered[0].ACTIVE_AT < _sy_metrics.ACTIVE_AT) {
                            ModelData.Delete(ListMetricsLS, ["LS_SYNC_ID", "QUESTION_ID", "PROGRESS"], [_ls_sync_id, _sy_metrics.QUESTION_ID, _PROGRESS_UNANSWERED]);
                        }
                    }

                    var _ls_metrics = new modelPageMetricsLS.getData();

                    _ls_metrics.LS_SYNC_ID = _ls_sync_id;
                    _ls_metrics.QUESTION_ID = _sy_metrics.QUESTION_ID;
                    _ls_metrics.ACTIVE_ON = _sy_metrics.ACTIVE_ON;
                    _ls_metrics.ACTIVE_AT = _sy_metrics.ACTIVE_AT;
                    _ls_metrics.PROGRESS = _sy_metrics.PROGRESS;

                    ModelData.Add(ListMetricsLS, _ls_metrics);
                }
            }
        }
    }

    for (i = 0; i < ListSyncBookmarksSY.getModel().getData().length; i++) {
        var _sy_sync_bookmarks = ListSyncBookmarksSY.getModel().getData()[i];

        var _ls_test_id = _get_test_id(_sy_sync_bookmarks.TEST_ID, _sy_sync_bookmarks.UPLOAD_ON, _sy_sync_bookmarks.UPLOAD_AT);
        if (_ls_test_id !== _ID_ZERO_TEST) {
            ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, ["LS_SYNC_ON", "LS_SYNC_AT"], [_sy_sync_bookmarks.SYNC_ON, _sy_sync_bookmarks.SYNC_AT]);

            for (var k = 0; k < ListBookmarksSY.getModel().getData().length; k++) {
                var _sy_bookmarks = ListBookmarksSY.getModel().getData()[k];

                if (_sy_bookmarks.SYNC_ID === _sy_sync_bookmarks.SYNC_ID) {
                    var _ls_questions = ModelData.Find(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ls_test_id, _sy_bookmarks.QUESTION_ID]);
                    if (_ls_questions.length > 0) {
                        if (_sy_bookmarks.ACTIVE_ON > _ls_questions[0].LS_ACTIVE_ON ||
                            _sy_bookmarks.ACTIVE_ON === _ls_questions[0].LS_ACTIVE_ON && _sy_bookmarks.ACTIVE_AT > _ls_questions[0].LS_ACTIVE_AT) {
                            ModelData.UpdateField(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ls_test_id, _sy_bookmarks.QUESTION_ID], ["LS_BOOKMARK", "LS_ACTIVE_ON", "LS_ACTIVE_AT"], [_sy_bookmarks.BOOKMARK,
                                _sy_bookmarks.ACTIVE_ON,
                                _sy_bookmarks.ACTIVE_AT
                            ]);
                        }
                    }
                }
            }
        }
    }

    // Clean processed sync
    ListSyncMetricsSY.getModel().setData([]);
    ListMetricsSY.getModel().setData([]);
    ListSyncBookmarksSY.getModel().setData([]);
    ListBookmarksSY.getModel().setData([]);

    // Cache local storage
    setCacheListSyncMetricsLS();
    setCacheListMetricsLS();
    setCacheListQuestionsLS();
    setCacheListTestsLS();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_delete() {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();
        var _sy_tests = PageTestsSY.getModel().getData();

        _sy_tests.UPLOAD_ON = _ui_tests.UPLOAD_ON;
        _sy_tests.UPLOAD_AT = _ui_tests.UPLOAD_AT;
        _sy_tests.TEST_ID = _ui_tests.TEST_ID;

        PageTestsSY.getModel().setData(_sy_tests);

        _set_UI_busy(true);
        getOnlineAjaxDelete();
    } else {
        _ajax_toast_offline();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_delete_success() {

    // Only your own content will be deleted in the backend
    // Content from others can only be removed from the device
    var _ui_tests = PageTestSelect.getModel().getData();

    // Update local storage
    if (_ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER || _ui_tests.UI_DELETED) {
        ModelData.Delete(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID);
    } else {
        ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, "LS_DOWNLOADED", false);
    }
    ModelData.Delete(ListPartsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID);
    ModelData.Delete(ListQuestionsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID);
    ModelData.Delete(ListVariantsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID);

    // Cache local storage
    setCacheListTestsLS();
    setCacheListPartsLS();
    setCacheListQuestionsLS();
    setCacheListVariantsLS();

    // Update current UI
    if (_ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER || _ui_tests.UI_DELETED) {
        ModelData.Delete(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID);
    } else {
        ModelData.UpdateField(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID, "UI_DOWNLOADED", false);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_download_sync(_test_id, _ls_test_id, _version) {

    var _sy_parts_arr = ModelData.Find(ListPartsSY, "TEST_ID", _test_id);
    for (j = 0; j < _sy_parts_arr.length; j++) {
        var _sy_parts = _sy_parts_arr[j];
        var _ls_parts = new modelPagePartsLS.getData();

        _ls_parts.LS_TEST_ID = _ls_test_id;

        _ls_parts.PART_ID = _sy_parts.PART_ID;
        _ls_parts.DESCRIPTION = _sy_parts.DESCRIPTION;
        _ls_parts.SORT = _sy_parts.SORT;

        _ls_parts.LS_SELECTED = true;

        var _ls_part_arr = ModelData.Find(ListPartsLS, ["LS_TEST_ID", "PART_ID"], [_ls_test_id, _sy_parts.PART_ID]);
        if (_ls_part_arr.length > 0) {
            _ls_parts.LS_SELECTED = _ls_part_arr[0].LS_SELECTED;
        }

        ModelData.Update(ListPartsLS, ["LS_TEST_ID", "PART_ID"], [_ls_test_id, _ls_parts.PART_ID], _ls_parts);
    }

    var _sy_questions_arr = ModelData.Find(ListQuestionsSY, "TEST_ID", _test_id);
    for (j = 0; j < _sy_questions_arr.length; j++) {
        var _sy_questions = _sy_questions_arr[j];
        var _ls_questions = new modelPageQuestionsLS.getData();

        _ls_questions.LS_TEST_ID = _ls_test_id;

        _ls_questions.QUESTION_ID = _sy_questions.QUESTION_ID;
        _ls_questions.PART_ID = _sy_questions.PART_ID;
        _ls_questions.QUESTION = _sy_questions.QUESTION;
        _ls_questions.EXPLANATION = _sy_questions.EXPLANATION;
        _ls_questions.SORT = _sy_questions.SORT;

        _ls_questions.LS_BOOKMARK = _BOOKMARK_UNMARKED;
        _ls_questions.LS_ACTIVE_ON = _INITIAL_DATE;
        _ls_questions.LS_ACTIVE_AT = _INITIAL_TIME;

        var _ls_questions_arr = ModelData.Find(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ls_test_id, _sy_questions.QUESTION]);
        if (_ls_questions_arr.length > 0) {
            _ls_questions.LS_BOOKMARK = _ls_questions_arr[0].LS_BOOKMARK;
            _ls_questions.LS_ACTIVE_ON = _ls_questions_arr[0].LS_ACTIVE_ON;
            _ls_questions.LS_ACTIVE_AT = _ls_questions_arr[0].LS_ACTIVE_AT;
        }

        ModelData.Update(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ls_test_id, _ls_questions.QUESTION_ID], _ls_questions);
    }

    var _sy_variants_arr = ModelData.Find(ListVariantsSY, "TEST_ID", _test_id);
    for (j = 0; j < _sy_variants_arr.length; j++) {
        var _sy_variants = _sy_variants_arr[j];
        var _ls_variants = new modelPageVariantsLS.getData();

        _ls_variants.LS_TEST_ID = _ls_test_id;

        _ls_variants.QUESTION_ID = _sy_variants.QUESTION_ID;
        _ls_variants.VARIANT_ID = _sy_variants.VARIANT_ID;
        _ls_variants.CORRECT = _sy_variants.CORRECT;
        _ls_variants.VARIANT = _sy_variants.VARIANT;
        _ls_variants.SORT = _sy_variants.SORT;

        ModelData.Update(ListVariantsLS, ["LS_TEST_ID", "QUESTION_ID", "VARIANT_ID"], [_ls_test_id, _ls_variants.QUESTION_ID, _ls_variants.VARIANT_ID], _ls_variants);
    }

    ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, "LS_VERSION", _version);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _ajax_toast_offline() {
    jQuery.sap.require("sap.m.MessageToast");
    sap.m.MessageToast.show(TextAjaxOffline.getText());
}
