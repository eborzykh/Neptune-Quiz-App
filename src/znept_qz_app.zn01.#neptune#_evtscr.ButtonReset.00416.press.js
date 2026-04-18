var message_box_callback = function(_action) {
    if (_action == "Reset") {
        _reset_progress();

        // if we are calling reset from the summary report page
        setTimeout(function() {
            _set_UI_ReportTotal();
            _set_UI_ReportRefresh();
        }, _SYNC_DELAY);

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
