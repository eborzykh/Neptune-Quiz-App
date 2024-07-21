_set_UI_busy(false);

_ajax_error = false;

_ajax_reset_success();

_set_UI_progress();

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show("Reset successful");
