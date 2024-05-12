var _parameters = PageParameters.getModel().getData();

if (_is_part_selected()) {
    InputQuestions.setValue(_parameters.PRACTICE_COUNT);
    InputTime.setValue(_parameters.PRACTICE_TIMER);
    InputLimit.setValue(_parameters.PRACTICE_LIMIT);

    DialogParameters.open();
}
