var message_box_callback = function(_action) {
    if (_action == "Reset") {
        _reset_device();
    }
};

function OpenMessageBox() {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        "Your local content will be deleted. Your rogress will remain on the server.",
        "WARNING", "Reset this device?", ["Reset", "Cancel"], function(_action) {
            message_box_callback(_action);
        }, "");
}

OpenMessageBox();
