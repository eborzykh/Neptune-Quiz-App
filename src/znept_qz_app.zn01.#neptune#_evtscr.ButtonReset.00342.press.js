var message_box_callback = function(_action) {
    if (_action == "Reset") {
        _reset_progress();

        // it will always reset this device and then sync
        jQuery.sap.require("sap.m.MessageToast");
        sap.m.MessageToast.show("Reset successful");
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
