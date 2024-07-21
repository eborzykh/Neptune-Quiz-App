_set_UI_busy(false);

_ajax_error = true;

_set_UI_progress(); // update UI (it is still reset on the device)

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show(TextAjaxFailed.getText());

