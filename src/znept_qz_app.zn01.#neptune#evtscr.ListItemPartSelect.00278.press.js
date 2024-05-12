var _ui_pq = oEvent.oSource.getBindingContext().getObject();

if (_ui_pq.UI_VISIBLE_PART) {

    var _icon_part = _ICON_PART_COLLAPSED;

    for (var i = 0; i < ListPQSelect.getModel().getData().length; i++) {
        var _ui_questions = ListPQSelect.getModel().getData()[i];

        if (_ui_questions.PART_ID === _ui_pq.PART_ID && !_ui_questions.UI_VISIBLE_PART) {
            if (_ui_questions.UI_VISIBLE_ITEM) {
                ModelData.UpdateField(ListPQSelect, ["PART_ID", "QUESTION_ID"], [_ui_questions.PART_ID, _ui_questions.QUESTION_ID], "UI_VISIBLE_ITEM", false);
                _icon_part = _ICON_PART_COLLAPSED;
            } else {
                ModelData.UpdateField(ListPQSelect, ["PART_ID", "QUESTION_ID"], [_ui_questions.PART_ID, _ui_questions.QUESTION_ID], "UI_VISIBLE_ITEM", true);
                _icon_part = _ICON_PART_EXPANDED;
            }
        }
    }
    ModelData.UpdateField(ListPQSelect, ["PART_ID", "QUESTION_ID"], [_ui_pq.PART_ID, _ID_ZERO_QUESTION], "UI_SRC_ICON", _icon_part);

} else {

    var _question_index = _get_question_index(_ui_pq.QUESTION_ID);
    _practice_mode = _MODE_PREVIEW;

    _show_question(_question_index);

    oApp.to(PageQuestion);
}
