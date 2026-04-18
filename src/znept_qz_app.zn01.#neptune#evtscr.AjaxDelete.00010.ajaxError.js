_set_UI_busy(false);

_ajax_error = true;

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show(TextAjaxFailed.getText());
