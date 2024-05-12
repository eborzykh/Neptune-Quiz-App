var _parameters = PageParameters.getModel().getData();

_parameters.PRACTICE_COUNT = InputQuestions.getValue();
_parameters.PRACTICE_TIMER = InputTime.getValue();
_parameters.PRACTICE_LIMIT = InputLimit.getValue();

PageParameters.getModel().setData(_parameters);
setCachePageParameters();

DialogParameters.close();

_goto_test(_MODE_PRACTICE);

