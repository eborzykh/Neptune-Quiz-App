var _ui_tests = oEvent.oSource.getBindingContext().getObject();

_ui_tests.UI_FAVORITE = !_ui_tests.UI_FAVORITE;

ModelData.UpdateField(ListTestsUI, "UI_TEST_ID", _ui_tests.UI_TEST_ID, "UI_FAVORITE", _ui_tests.UI_FAVORITE);

ModelData.UpdateField(ListTestsLS, "LS_TEST_ID", _ui_tests.UI_TEST_ID, "LS_FAVORITE", _ui_tests.UI_FAVORITE);
setCacheListTestsLS();

_set_UI_order();
