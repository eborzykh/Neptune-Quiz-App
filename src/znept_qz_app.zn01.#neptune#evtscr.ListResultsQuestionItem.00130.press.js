var _ui_questions = oEvent.oSource.getBindingContext().getObject();

for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
    if (ListQuestionsUI.getModel().getData()[i].QUESTION_ID === _ui_questions.QUESTION_ID) {
        _show_question(i);
        _show_answer(i);

        oApp.to(PageQuestion);
    }
}
