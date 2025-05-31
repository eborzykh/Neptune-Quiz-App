var message_box_callback = function(_action) {
    if (_action == "Reset") {
        // _reset_device();
    }
};

function OpenMessageBox() {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        "This device will be reset. Your content and activity will remain on the server and other devices.",
        "WARNING", "Reset this device?", ["Reset", "Cancel"], function(_action) {
            message_box_callback(_action);
        }, "");
}

OpenMessageBox();
