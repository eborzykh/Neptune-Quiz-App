var _ui_pq = oEvent.oSource.getBindingContext().getObject();
var _ui_tests = PageTestSelect.getModel().getData();

ModelData.UpdateField(ListPQSelect, "PART_ID", _ui_pq.PART_ID, "UI_SELECTED", _ui_pq.UI_SELECTED);

ModelData.UpdateField(ListPartsLS, ["LS_TEST_ID", "PART_ID"], [_ui_tests.UI_TEST_ID, _ui_pq.PART_ID], "LS_SELECTED", _ui_pq.UI_SELECTED);
setCacheListPartsLS();
