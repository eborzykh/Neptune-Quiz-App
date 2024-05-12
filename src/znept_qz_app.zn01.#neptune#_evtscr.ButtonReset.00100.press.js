
var message_box_callback = function(_action) {
    if (_action == "Reset") {
        _ajax_reset();
    }
};

function OpenMessageBox() {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        "Your statistics will be deleted from the server and this device.",
        "WARNING", "Reset?", ["Reset", "Cancel"], function(_action) {
            message_box_callback(_action);
        }, "");
}

OpenMessageBox();
