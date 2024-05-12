var _parameters = PageParameters.getModel().getData();

_parameters.PRACTICE_COUNT = InputQuestions.getValue();
_parameters.PRACTICE_TIMER = InputTime.getValue();
_parameters.PRACTICE_LIMIT = InputLimit.getValue();

PageParameters.getModel().setData(_parameters);
setCachePageParameters();

_set_UI_progress(); // progress will not be updated but success percentage might

DialogParameters.close();
