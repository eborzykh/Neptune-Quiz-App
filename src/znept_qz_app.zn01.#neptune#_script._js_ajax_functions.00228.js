const _SYNC_DELAY = 500;
const _ID_ZERO_QUESTION = '0000'; // domain _ID_QUESTION_DM
const _ID_ZERO_PART = '00'; // domain _ID_PART_DM

const _DEFAULT_COUNT = 20; // default number of questions for Practice
const _DEFAULT_TIMER = 10; // default timer (minutes) for Practice
const _DEFAULT_LIMIT = 80; // default percentage target for Practice and the landing page

const _PROGRESS_UNANSWERED = '0'; // domain _PROGRESS_DM
const _PROGRESS_INCORRECT = '1'; // domain _PROGRESS_DM
const _PROGRESS_IMPROVED1 = '2'; // domain _PROGRESS_DM
const _PROGRESS_IMPROVED2 = '3'; // domain _PROGRESS_DM
const _PROGRESS_IMPROVED3 = '4'; // domain _PROGRESS_DM
const _PROGRESS_CORRECT = '5'; // domain _PROGRESS_DM

const _SYNC_ACTION_INSERT = 'I'; // domain _SY_ACTION_DM
const _SYNC_ACTION_UPDATE = 'U'; // domain _SY_ACTION_DM
const _SYNC_ACTION_DELETE = 'D'; // domain _SY_ACTION_DM

const _BOOKMARK_UNMARKED = ''; // domain _BOOKMARK_DM
const _BOOKMARK_BOOKMARKED = 'X'; // domain _BOOKMARK_DM

const _ABAP_FALSE = '';
const _ABAP_TRUE = 'X';

const _QUESTION_TYPE_INPUT = 0;
const _QUESTION_TYPE_SINGLE = 1;
const _QUESTION_TYPE_MULTIPLE = 2;

const _MODE_PREVIEW = 0;
const _MODE_LEARN = 1;
const _MODE_PREPARE = 2;
const _MODE_PRACTICE = 3;

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

var _kill_timer = true;
var _pause_timer = false;
var _practice_mode = _MODE_PREVIEW;
var _current_question = 0;
var _navigate_after_metrics = false;
var _ajax_error = false;

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

function _first_refresh() {

    if (navigator.onLine) {
        _ajax_refresh();
    } else {
        _set_UI_PageTestSelect();
        oApp.to(PageTestSelect);
    }
}

// Navigation

function _navigate_PagePQSelect() {

    var _ui_tests = PageTestSelect.getModel().getData();

    if (_ui_tests.UI_DOWNLOADED) {
        _set_UI_PagePQSelect();
    } else {
        _ajax_download();
    }
}

// layout properties and content

function _set_UI_busy(_busy) {

    if (_busy) {
        oApp.setBusy(true);
    } else {
        oApp.setBusy(false);
        PullToRefresh.hide();
        setCachePageSY();
    }
}

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

function _set_UI_PagePQSelect() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var i;
    var _ui_pq;

    _navigate_after_metrics = false; // reset navigation after Metrics

    ListPQSelect.getModel().setData([]);

    for (i = 0; i < ListQuestionsLS.getModel().getData().length; i++) {
        var _ls_questions = ListQuestionsLS.getModel().getData()[i];

        if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            _ui_pq = new modelPagePQUI.getData();

            _ui_pq.PART_ID = _ls_questions.PART_ID;
            _ui_pq.QUESTION_ID = _ls_questions.QUESTION_ID;
            _ui_pq.UI_SELECTED = true;
            _ui_pq.UI_VISIBLE_PART = false;
            _ui_pq.UI_VISIBLE_QUESTION = true;
            _ui_pq.UI_VISIBLE_ITEM = true;
            _ui_pq.UI_SRC_ICON = _ICON_PART_COLLAPSED; // icon property must be always provided here
            _ui_pq.DESCRIPTION = _ls_questions.QUESTION;
            _ui_pq.UI_CORRECT_HIGHLIGHT = _get_correct_highlight(_ls_questions.LS_PROGRESS);

            ModelData.Add(ListPQSelect, _ui_pq);
        }
    }

    for (i = 0; i < ListPartsLS.getModel().getData().length; i++) {
        var _ls_parts = ListPartsLS.getModel().getData()[i];

        if (_ls_parts.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            _ui_pq = new modelPagePQUI.getData();

            _ui_pq.PART_ID = _ls_parts.PART_ID;
            _ui_pq.QUESTION_ID = _ID_ZERO_QUESTION;
            _ui_pq.UI_SELECTED = _ls_parts.LS_SELECTED;
            _ui_pq.UI_VISIBLE_PART = true;
            _ui_pq.UI_VISIBLE_QUESTION = false;
            _ui_pq.UI_VISIBLE_ITEM = true;
            _ui_pq.UI_SRC_ICON = _ICON_PART_COLLAPSED;
            _ui_pq.DESCRIPTION = _ls_parts.DESCRIPTION;
            _ui_pq.UI_CORRECT_HIGHLIGHT = 'None';

            ModelData.Add(ListPQSelect, _ui_pq);

            ModelData.UpdateField(ListPQSelect, ["PART_ID", "UI_VISIBLE_QUESTION"], [_ls_parts.PART_ID, true], ["UI_SELECTED", "UI_VISIBLE_ITEM"], [_ls_parts.LS_SELECTED, false]);
        }
    }

    // Put Parts at sub-headers position
    ListPQSelect.getModel().getData().sort(function(a, b) {
        return (a.PART_ID * 1000 + a.QUESTION_ID) - (b.PART_ID * 1000 + b.QUESTION_ID);
    });
    ListPQSelect.getModel().refresh(true); // without refresh it will not correctly define selected item

    _set_UI_reset();
    _set_UI_ActionSheet();

    TextTestNamePQSelect.setText(_ui_tests.DESCRIPTION);

    oApp.to(PagePQSelect);
}

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

function _get_question_index(_question_id) {

    for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
        if (ListQuestionsUI.getModel().getData()[i].QUESTION_ID === _question_id) {
            return i;
        }
    }
}

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

            if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || (_practice_mode === _MODE_PREPARE && _ui_questions.UI_QUESTION_EVALUATED) || (_practice_mode === _MODE_PRACTICE && _kill_timer)) {
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

    oHBoxType.setVisible(_practice_mode === _MODE_PREPARE || _practice_mode === _MODE_PRACTICE);

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

    if (_practice_mode === _MODE_PRACTICE && _kill_timer) {
        _show_answer(_index);
    }

    ButtonSubmit.setVisible(_practice_mode === _MODE_PRACTICE && !_kill_timer);

    // Display progress icon
    _set_UI_IconProgress(_index);

    // Display bookmark
    _set_UI_ButtonBookmark(_index);

    _show_continue(_QUICK_BUTTON_HIDE);
}

function _set_UI_IconProgress(_index) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ui_questions = ListQuestionsUI.getModel().getData()[_index];

    var _button_icon = _ICON_PROGRESS_HIDDEN;
    var _button_type = 'Default';
    var _button_visible = _kill_timer;

    if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || _practice_mode === _MODE_PREPARE) {
        var _progress = ModelData.LookupValue(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ui_tests.UI_TEST_ID, _ui_questions.QUESTION_ID], "LS_PROGRESS");
        switch (_progress) {
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
    if (_practice_mode === _MODE_PREVIEW || _practice_mode === _MODE_LEARN || (_practice_mode === _MODE_PREPARE && _ui_questions.UI_QUESTION_EVALUATED) || (_practice_mode === _MODE_PRACTICE && _kill_timer)) {
        oHBoxExplanation.setVisible(true);
    }
}

function _evaluate_answer(_index) {

    var _ui_tests = PageTestSelect.getModel().getData();
    var i;
    var _ui_variants;
    var _progress;
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

    ModelData.Update(ListQuestionsUI, 'QUESTION_ID', _ui_questions.QUESTION_ID, _ui_questions);

    // Calculate next progress
    if (_is_correct) {
        _progress = ModelData.LookupValue(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ui_tests.UI_TEST_ID, _ui_questions.QUESTION_ID], "LS_PROGRESS");
        switch (_progress) {
            case _PROGRESS_UNANSWERED:
            case _PROGRESS_IMPROVED3:
                _progress = _PROGRESS_CORRECT;
                break;
            case _PROGRESS_INCORRECT:
                _progress = _PROGRESS_IMPROVED1;
                break;
            case _PROGRESS_IMPROVED1:
                _progress = _PROGRESS_IMPROVED2;
                break;
            case _PROGRESS_IMPROVED2:
                _progress = _PROGRESS_IMPROVED3;
                break;
        }
    } else {
        _progress = _PROGRESS_INCORRECT;
    }

    // Update progress in the current UI
    ModelData.UpdateField(ListPQSelect, "QUESTION_ID", _ui_questions.QUESTION_ID, "UI_CORRECT_HIGHLIGHT", _get_correct_highlight(_progress));

    // Cache progress in the local storage
    ModelData.UpdateField(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ui_tests.UI_TEST_ID, _ui_questions.QUESTION_ID], ["LS_PROGRESS", "LS_SYNC_METRICS"], [_progress, true]);
    setCacheListQuestionsLS();

    // Refresh progress icon after evaluation
    _set_UI_IconProgress(_index);

    return _is_correct;
}

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
    ModelData.UpdateField(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ui_tests.UI_TEST_ID, _ui_questions.QUESTION_ID], ["LS_BOOKMARK", "LS_SYNC_METRICS"], [_ui_questions.UI_BOOKMARK, true]);
    setCacheListQuestionsLS();

    // Refresh bookmark button after update
    _set_UI_ButtonBookmark(_current_question);
}

function _goto_next_question(_bookmark) {

    var i;

    if (_bookmark) {
        for (i = _current_question + 1; i < ListQuestionsUI.getModel().getData().length; i++) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
        for (i = 0; i < _current_question - 1; i++) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
    } else {
        _goto_question(_current_question + 1);
    }
}

function _goto_previous_question(_bookmark) {

    var i;

    if (_bookmark) {
        for (i = _current_question - 1; i >= 0; i--) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
        for (i = ListQuestionsUI.getModel().getData().length - 1; i > _current_question + 1; i--) {
            if (ListQuestionsUI.getModel().getData()[i].UI_BOOKMARK === _ABAP_TRUE) {
                _goto_question(i);
                return;
            }
        }
    } else {
        _goto_question(_current_question - 1);
    }
}

function _goto_question(_index) {

    var _ui_questions = ListQuestionsUI.getModel().getData()[_current_question];

    if (_practice_mode === _MODE_PREPARE && _is_answer_given(_current_question) && !_ui_questions.UI_QUESTION_EVALUATED) {
        if (!_evaluate_answer(_current_question)) {
            _show_answer(_current_question);
            _show_continue(_QUICK_BUTTON_CONTINUE);
            // _bookmark_question(true); // if we want to "force bookmark" wrong answer
            return;
        } else {
            _show_answer(_current_question);
            _show_continue(_QUICK_BUTTON_HIDE);
            setTimeout(function() {
                _show_question(_index);
            }, 1500);
            return;
        }
    }
    _show_question(_index);
}

function _shuffle_array(_array) {

    var _current_index = _array.length;
    var _random_index;

    while (_current_index !== 0) {
        _random_index = Math.floor(Math.random() * _current_index);
        _current_index--;
        [_array[_current_index], _array[_random_index]] = [_array[_random_index], _array[_current_index]];
    }
    return _array;
}

function _submit_results() {

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

function _start_timer(_duration_minutes) {

    var _timer = _duration_minutes * 60;
    var _minutes;
    var _seconds;

    _kill_timer = false;
    _pause_timer = false;

    if (_timer > 0) {
        ButtonSubmit.setText("--:--");

        const _interval = setInterval(function() {
            _minutes = parseInt(_timer / 60, 10);
            _seconds = parseInt(_timer % 60, 10);

            _minutes = _minutes < 10 ? "0" + _minutes : _minutes;
            _seconds = _seconds < 10 ? "0" + _seconds : _seconds;

            ButtonSubmit.setText(_minutes + ":" + _seconds);

            if (!_pause_timer) {
                _timer--;
            }

            if (_kill_timer) {
                clearInterval(_interval);
            }

            if (_timer < 0) {
                _kill_timer = true;
                clearInterval(_interval);
                _submit_results();
            }
        }, 1000);
    } else {
        // timer can be disabled and it will wait for the user to Submit
        ButtonSubmit.setText("Submit");
    }
}

function _set_UI_reset() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var i;

    _practice_mode = _MODE_PREVIEW;
    _current_question = 0;

    // Refresh Question list (different Parts selected / reset Practice trim) and clean UI artifacts after last session
    ListQuestionsUI.getModel().setData([]);
    ListVariantsUI.getModel().setData([]);

    for (i = 0; i < ListQuestionsLS.getModel().getData().length; i++) {
        var _ls_questions = ListQuestionsLS.getModel().getData()[i];
        if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            var _ui_questions = new modelPageQuestionsUI.getData();

            _ui_questions.PART_ID = _ls_questions.PART_ID;
            _ui_questions.QUESTION_ID = _ls_questions.QUESTION_ID;
            _ui_questions.QUESTION = _ls_questions.QUESTION;
            _ui_questions.EXPLANATION = _ls_questions.EXPLANATION;

            _ui_questions.UI_PROGRESS = _ls_questions.LS_PROGRESS;
            _ui_questions.UI_BOOKMARK = _ls_questions.LS_BOOKMARK;
            _ui_questions.UI_ANSWER_GIVEN = false;
            _ui_questions.UI_QUESTION_EVALUATED = false;
            _ui_questions.UI_CORRECT_HIGHLIGHT = 'None';

            ModelData.Add(ListQuestionsUI, _ui_questions);
        }
    }

    for (i = 0; i < ListVariantsLS.getModel().getData().length; i++) {
        var _ls_variants = ListVariantsLS.getModel().getData()[i];
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

    var _result_correct;

    // Refresh UI progress based on latest LS
    for (var i = 0; i < ListTestsUI.getModel().getData().length; i++) {
        var _ui_tests = ListTestsUI.getModel().getData()[i];

        _result_correct = 0;
        for (var j = 0; j < ListQuestionsLS.getModel().getData().length; j++) {
            var _ls_questions = ListQuestionsLS.getModel().getData()[j];
            if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
                switch (_ls_questions.LS_PROGRESS) {
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

function _set_UI_published() {

    for (var i = 0; i < ListTestsUI.getModel().getData().length; i++) {
        var _ui_tests = ListTestsUI.getModel().getData()[i];

        _ui_tests.UI_VIS_INFO_LINE_3 = (_ui_tests.UPLOAD_BY !== PageSY.getModel().getData().SAP_USER);
        _ui_tests.UI_VIS_PUBLISHED = (_ui_tests.PUBLISHED === _ABAP_TRUE && _ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER);
        _ui_tests.UI_VIS_PRIVATE = (_ui_tests.PUBLISHED === _ABAP_FALSE && _ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER);

        ModelData.Update(ListTestsUI, 'UI_TEST_ID', _ui_tests.UI_TEST_ID, _ui_tests);
    }
}

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
function _ajax_refresh() {

    if (navigator.onLine) {
        ListTestsSY.getModel().setData([]);

        for (var i = 0; i < ListTestsLS.getModel().getData().length; i++) {
            var _ls_tests = ListTestsLS.getModel().getData()[i];
            var _sy_tests = new modelPageTestsSY.getData();

            _sy_tests.TEST_ID = _ls_tests.TEST_ID;
            _sy_tests.UPLOAD_ON = _ls_tests.UPLOAD_ON;
            _sy_tests.UPLOAD_AT = _ls_tests.UPLOAD_AT;
            _sy_tests.UPLOAD_BY = _ls_tests.UPLOAD_BY;
            _sy_tests.DESCRIPTION = _ls_tests.DESCRIPTION;
            _sy_tests.PUBLISHED = _ls_tests.PUBLISHED;

            ModelData.Add(ListTestsSY, _sy_tests);
        }
        _set_UI_busy(true);
        getOnlineAjaxRefresh();
    } else {
        _set_UI_busy(false);
    }
}

function _ajax_refresh_success() {

    var _ls_test_id;

    // Refresh "Deleted or Private" flag
    for (var i = 0; i < ListTestsLS.getModel().getData().length; i++) {
        ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", ListTestsLS.getModel().getData()[i].LS_TEST_ID, "LS_DELETED", false);
    }

    // Update local storage
    for (i = 0; i < ListTestsSY.getModel().getData().length; i++) {
        var _sy_tests = ListTestsSY.getModel().getData()[i];

        switch (_sy_tests.SY_ACTION) {
            case _SYNC_ACTION_INSERT:
                _ls_test_id = 1;
                for (var j = 0; j < ListTestsLS.getModel().getData().length; j++) {
                    if (ListTestsLS.getModel().getData()[j].LS_TEST_ID === _ls_test_id) {
                        _ls_test_id++;
                        j = 0;
                    }
                }
                break;
            case _SYNC_ACTION_UPDATE:
            case _SYNC_ACTION_DELETE:
                _ls_test_id = ModelData.LookupValue(ListTestsLS, ["TEST_ID", "UPLOAD_ON", "UPLOAD_AT"], [_sy_tests.TEST_ID, _sy_tests.UPLOAD_ON, _sy_tests.UPLOAD_AT], "LS_TEST_ID");
                break;
        }

        switch (_sy_tests.SY_ACTION) {
            case _SYNC_ACTION_INSERT:
                var _ls_tests = new modelPageTestsLS.getData();

                // LS_TEST_ID and UI_TEST_ID are the same (deppends on structure) unique ID representation the content on local device
                // TEST_ID (with combination of UPLOAD_ON and UPLOAD_AT) is the unique ID representation the content in the backend
                _ls_tests.LS_TEST_ID = _ls_test_id;
                _ls_tests.UPLOAD_ON = _sy_tests.UPLOAD_ON;
                _ls_tests.UPLOAD_AT = _sy_tests.UPLOAD_AT;
                _ls_tests.TEST_ID = _sy_tests.TEST_ID;
                _ls_tests.UPLOAD_BY = _sy_tests.UPLOAD_BY;
                _ls_tests.PUBLISHED = _sy_tests.PUBLISHED;
                _ls_tests.DESCRIPTION = _sy_tests.DESCRIPTION;

                _ls_tests.LS_COUNT_PARTS = _sy_tests.SY_COUNT_PARTS;
                _ls_tests.LS_COUNT_QUESTIONS = _sy_tests.SY_COUNT_QUESTIONS;
                _ls_tests.LS_UPLOAD_BY_NAME = _sy_tests.SY_UPLOAD_BY_NAME;

                _ls_tests.LS_DOWNLOADED = false;
                _ls_tests.LS_DELETED = false;

                ModelData.Add(ListTestsLS, _ls_tests);
                break;
            case _SYNC_ACTION_UPDATE:

                ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, ["DESCRIPTION", "PUBLISHED"], [_sy_tests.DESCRIPTION, _sy_tests.PUBLISHED]);
                break;
            case _SYNC_ACTION_DELETE:

                // only your own content will be removed via refresh (assuming you don`t want it on all your devices)
                if (_sy_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER) {
                    ModelData.Delete(ListTestsLS, "LS_TEST_ID", _ls_test_id);
                    ModelData.Delete(ListPartsLS, "LS_TEST_ID", _ls_test_id);
                    ModelData.Delete(ListQuestionsLS, "LS_TEST_ID", _ls_test_id);
                    ModelData.Delete(ListVariantsLS, "LS_TEST_ID", _ls_test_id);
                } else {
                    // for content published by others it will delete only yet not downloaded
                    if (ModelData.LookupValue(ListTestsLS, "LS_TEST_ID", _ls_test_id, "LS_DOWNLOADED")) {
                        ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, "LS_DELETED", true);
                    } else {
                        ModelData.Delete(ListTestsLS, "LS_TEST_ID", _ls_test_id);
                    }
                }
                break;
        }
    }

    // Cache local storage
    setCacheListTestsLS();
    setCacheListPartsLS();
    setCacheListQuestionsLS();
    setCacheListVariantsLS();

    // On Refresh we rebuild the landing page (no local UI update)
}

function _ajax_download() {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();
        var _sy_tests = PageTestsSY.getModel().getData();

        _sy_tests.UPLOAD_ON = _ui_tests.UPLOAD_ON;
        _sy_tests.UPLOAD_AT = _ui_tests.UPLOAD_AT;
        _sy_tests.TEST_ID = _ui_tests.TEST_ID;

        PageTestsSY.getModel().setData(_sy_tests);

        _set_UI_busy(true);
        getOnlineAjaxDownload();
    } else {
        _ajax_toast_offline();
    }
}

function _ajax_download_success() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var i;

    // Update local storage
    for (i = 0; i < ListPartsSY.getModel().getData().length; i++) {
        var _sy_parts = ListPartsSY.getModel().getData()[i];
        var _ls_parts = new modelPagePartsLS.getData();

        _ls_parts.PART_ID = _sy_parts.PART_ID;
        _ls_parts.DESCRIPTION = _sy_parts.DESCRIPTION;

        _ls_parts.LS_TEST_ID = _ui_tests.UI_TEST_ID;
        _ls_parts.LS_SELECTED = true;

        ModelData.Add(ListPartsLS, _ls_parts);
    }
    for (i = 0; i < ListQuestionsSY.getModel().getData().length; i++) {
        var _sy_questions = ListQuestionsSY.getModel().getData()[i];
        var _ls_questions = new modelPageQuestionsLS.getData();

        _ls_questions.PART_ID = _sy_questions.PART_ID;
        _ls_questions.QUESTION_ID = _sy_questions.QUESTION_ID;
        _ls_questions.QUESTION = _sy_questions.QUESTION;
        _ls_questions.EXPLANATION = _sy_questions.EXPLANATION;

        _ls_questions.LS_TEST_ID = _ui_tests.UI_TEST_ID;
        _ls_questions.LS_PROGRESS = _PROGRESS_UNANSWERED;
        _ls_questions.LS_BOOKMARK = _BOOKMARK_UNMARKED;
        _ls_questions.LS_SYNC_METRICS = false;

        ModelData.Add(ListQuestionsLS, _ls_questions);
    }
    for (i = 0; i < ListVariantsSY.getModel().getData().length; i++) {
        var _sy_variants = ListVariantsSY.getModel().getData()[i];
        var _ls_variants = new modelPageVariantsUI.getData();

        _ls_variants.PART_ID = _sy_variants.PART_ID;
        _ls_variants.QUESTION_ID = _sy_variants.QUESTION_ID;
        _ls_variants.VARIANT_ID = _sy_variants.VARIANT_ID;
        _ls_variants.CORRECT = _sy_variants.CORRECT;
        _ls_variants.VARIANT = _sy_variants.VARIANT;

        _ls_variants.LS_TEST_ID = _ui_tests.UI_TEST_ID;

        ModelData.Add(ListVariantsLS, _ls_variants);
    }
    ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, "LS_DOWNLOADED", true);

    // Cache local storage
    setCacheListTestsLS();
    setCacheListPartsLS();
    setCacheListQuestionsLS();
    setCacheListVariantsLS();

    // Update current UI
    ModelData.UpdateField(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID, "UI_DOWNLOADED", true);
}

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

function _ajax_reset() {

    var _ui_tests = PageTestSelect.getModel().getData();

    // Update local storage
    ModelData.UpdateField(ListQuestionsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, ["LS_SYNC_METRICS", "LS_PROGRESS", "LS_BOOKMARK"], [false, _PROGRESS_UNANSWERED, _BOOKMARK_UNMARKED]);

    // Cache local storage
    setCacheListQuestionsLS();

    // Update current UI
    ModelData.UpdateField(ListPQSelect, "UI_VISIBLE_QUESTION", true, "UI_CORRECT_HIGHLIGHT", _get_correct_highlight(_PROGRESS_UNANSWERED));

    if (navigator.onLine) {
        var _sy_tests = PageTestsSY.getModel().getData();

        _sy_tests.UPLOAD_ON = _ui_tests.UPLOAD_ON;
        _sy_tests.UPLOAD_AT = _ui_tests.UPLOAD_AT;
        _sy_tests.TEST_ID = _ui_tests.TEST_ID;

        PageTestsSY.getModel().setData(_sy_tests);

        _set_UI_busy(true);
        getOnlineAjaxReset();
    }
}

function _ajax_reset_success() {
    // we are going to reset on the device before ajax call
    // if the backend returns error the latest statistics will be submited later
}

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

function _ajax_metrics(_sync_all) {

    if (navigator.onLine) {
        var _ui_tests = PageTestSelect.getModel().getData();

        ListSyncSY.getModel().setData([]);
        ListMetricsSY.getModel().setData([]);

        for (var i = 0; i < ListTestsLS.getModel().getData().length; i++) {
            var _ls_tests = ListTestsLS.getModel().getData()[i];
            if (_ls_tests.LS_DOWNLOADED && (_sync_all || _ls_tests.LS_TEST_ID === _ui_tests.UI_TEST_ID)) {
                var _sy_sync = new modelPageSyncSY.getData();

                _sy_sync.TEST_ID = _ls_tests.TEST_ID;
                _sy_sync.UPLOAD_ON = _ls_tests.UPLOAD_ON;
                _sy_sync.UPLOAD_AT = _ls_tests.UPLOAD_AT;
                _sy_sync.SYNC_ON = _ls_tests.LS_SYNC_ON;
                _sy_sync.SYNC_AT = _ls_tests.LS_SYNC_AT;
                _sy_sync.SYNC_ID = _ls_tests.LS_TEST_ID;

                ModelData.Add(ListSyncSY, _sy_sync);

                for (var j = 0; j < ListQuestionsLS.getModel().getData().length; j++) {
                    var _ls_questions = ListQuestionsLS.getModel().getData()[j];
                    if (_ls_questions.LS_TEST_ID === _ls_tests.LS_TEST_ID && _ls_questions.LS_SYNC_METRICS) {
                        var _sy_metrics = new modelPageMetricsSY.getData();

                        _sy_metrics.SYNC_ID = _ls_tests.LS_TEST_ID;
                        _sy_metrics.QUESTION_ID = _ls_questions.QUESTION_ID;
                        _sy_metrics.PROGRESS = _ls_questions.LS_PROGRESS;
                        _sy_metrics.BOOKMARK = _ls_questions.LS_BOOKMARK;

                        ModelData.Add(ListMetricsSY, _sy_metrics);
                    }
                }
            }
        }

        if (ListSyncSY.getModel().getData().length > 0 && (_sync_all || _navigate_after_metrics || ListMetricsSY.getModel().getData().length > 0)) {
            _set_UI_busy(true);
            getOnlineAjaxMetrics();
        }
    }
}

function _ajax_metrics_success() {

    // Update local storage
    for (var i = 0; i < ListSyncSY.getModel().getData().length; i++) {
        var _sy_sync = ListSyncSY.getModel().getData()[i];

        var _ls_test_id = ModelData.LookupValue(ListTestsLS, ["TEST_ID", "UPLOAD_ON", "UPLOAD_AT"], [_sy_sync.TEST_ID, _sy_sync.UPLOAD_ON, _sy_sync.UPLOAD_AT], "LS_TEST_ID");
        ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ls_test_id, ["LS_SYNC_AT", "LS_SYNC_ON"], [_sy_sync.SYNC_AT, _sy_sync.SYNC_ON]);

        ModelData.UpdateField(ListQuestionsLS, "LS_TEST_ID", _ls_test_id, "LS_SYNC_METRICS", false);

        if (ModelData.Find(ListMetricsSY, "SYNC_ID", _sy_sync.SYNC_ID).length > 0) {
            ModelData.UpdateField(ListQuestionsLS, "LS_TEST_ID", _ls_test_id, ["LS_PROGRESS", "LS_BOOKMARK"], [_PROGRESS_UNANSWERED, _BOOKMARK_UNMARKED]);
            for (var j = 0; j < ListMetricsSY.getModel().getData().length; j++) {
                var _sy_metrics = ListMetricsSY.getModel().getData()[j];
                // check for _ID_ZERO_QUESTION dummy record to reset other devices
                if (_sy_metrics.SYNC_ID === _sy_sync.SYNC_ID && _sy_metrics.QUESTION_ID !== _ID_ZERO_QUESTION) {
                    ModelData.UpdateField(ListQuestionsLS, ["LS_TEST_ID", "QUESTION_ID"], [_ls_test_id, _sy_metrics.QUESTION_ID], ["LS_PROGRESS", "LS_BOOKMARK"], [_sy_metrics.PROGRESS, _sy_metrics.BOOKMARK]);
                }
            }
        }
    }

    // Cache local storage
    setCacheListTestsLS();
    setCacheListQuestionsLS();
}

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

function _ajax_toast_offline() {
    jQuery.sap.require("sap.m.MessageToast");
    sap.m.MessageToast.show(TextAjaxOffline.getText());
}
