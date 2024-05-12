_set_UI_busy(false);

_ajax_rename_success();

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show("Changed successfully");

// Udate UI not mapped elements
var _ui_tests = PageTestSelect.getModel().getData();
TextTestNamePQSelect.setText(_ui_tests.DESCRIPTION);
