_set_UI_busy(false);

_ajax_error = false;

_ajax_delete_success();

oApp.to(PageTestSelect);

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show("Deleted successfully");
