
function OpenMessageBox() {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        "Do you want to stop the test? It will not impact your statistics if you stop.",
        "WARNING", "Pause", ["Stop", "Continue"], function(_action) {
            message_box_callback(_action);
        }, "");
}

if (_practice_mode === _MODE_PREPARE) {
    _set_UI_reset();

    if (navigator.onLine && !_ajax_error) {
        setTimeout(function() {
            _ajax_metrics(false);
        }, _SYNC_DELAY);
    } else {
        _set_UI_progress();
    }
}

if (_practice_mode === _MODE_PRACTICE && !_kill_timer) {
    _pause_timer = true;

    var message_box_callback = function(_action) {
        if (_action == "Stop") {
            _kill_timer = true;

            _set_UI_progress(); // progress will not be updated but success percentage might

            oApp.to(PagePQSelect);
        } else {
            _pause_timer = false;
        }
    };

    OpenMessageBox();
} else {
    oApp.back();
}
