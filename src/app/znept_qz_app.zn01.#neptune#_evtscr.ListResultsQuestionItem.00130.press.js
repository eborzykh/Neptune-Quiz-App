var _ui_questions = oEvent.oSource.getBindingContext().getObject();

var _question_index = _get_ui_question_index(_ui_questions.QUESTION_ID);

_show_question(_question_index);
_show_answer(_question_index);

oApp.to(PageQuestion);
