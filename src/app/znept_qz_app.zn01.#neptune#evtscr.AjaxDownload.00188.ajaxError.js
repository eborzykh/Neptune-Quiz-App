_set_UI_busy(false);

_ajax_error = true;

oApp.to(PageTestSelect);

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show(TextAjaxFailed.getText());
