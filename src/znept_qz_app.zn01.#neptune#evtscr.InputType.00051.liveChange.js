var _ui_questions = ListQuestionsUI.getModel().getData()[_current_question];

if ((_practice_mode === _MODE_PREPARE || _practice_mode === _MODE_PRACTICE) && _ui_questions.UI_QUESTION_EVALUATED === false) {
    _set_answer_given(oEvent.mParameters.newValue.length > 0);
}
