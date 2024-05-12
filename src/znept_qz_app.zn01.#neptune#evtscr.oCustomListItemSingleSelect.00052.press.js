var _ui_questions = ListQuestionsUI.getModel().getData()[_current_question];

if ((_practice_mode === _MODE_PREPARE || _practice_mode === _MODE_PRACTICE) && _ui_questions.UI_QUESTION_EVALUATED === false) {
    var _ui_variants = oEvent.oSource.getBindingContext().getObject();

    if (_ui_variants.UI_EDITABLE) {
        _ui_variants.UI_SELECTED = !_ui_variants.UI_SELECTED;
        ModelData.Update(ListSingleSelect, 'VARIANT_ID', _ui_variants.VARIANT_ID, _ui_variants);
    }

    _set_answer_given(_is_answer_given(_current_question));
}
