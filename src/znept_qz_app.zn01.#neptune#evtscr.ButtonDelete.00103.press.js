var message_box_callback = function(_action) {
    if (_action == "Delete") {
        _ajax_delete();
    }
};

function OpenMessageBox() {
    var _ui_tests = PageTestSelect.getModel().getData();

    var _msg;

    if (_ui_tests.UPLOAD_BY === PageSY.getModel().getData().SAP_USER) {
        _msg = "This content will be also deleted from the server including your statistics. For those who already started this test it will remain.";
    } else {
        _msg = "This content will be removed from this device including your statistics. The content will remain on server.";
    }

    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        _msg,
        "WARNING", "Delete?", ["Delete", "Cancel"], function(_action) {
            message_box_callback(_action);
        }, "");
}

OpenMessageBox();
