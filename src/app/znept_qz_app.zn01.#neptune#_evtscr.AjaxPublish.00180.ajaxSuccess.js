_set_UI_busy(false);

_ajax_error = false;

_ajax_publish_success();

var _ui_tests = PageTestSelect.getModel().getData();
var _msg_text;

if (_ui_tests.PUBLISHED === _ABAP_TRUE) {
    _msg_text = 'Published successfully';
} else {
    _msg_text = 'Unpublished successfully';
}

jQuery.sap.require("sap.m.MessageToast");
sap.m.MessageToast.show(_msg_text);

_set_UI_published();

_set_UI_ActionSheet();
