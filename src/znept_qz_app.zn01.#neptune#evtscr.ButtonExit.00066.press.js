function OpenMessageBox() {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        "Do you want to stop the test? It will not impact your statistics if you stop.",
        "WARNING", "Pause", ["Stop", "Continue"], function(_action) {
            message_box_callback(_action);
        }, "");
}

if (_practice_mode === _MODE_LEARN || _practice_mode === _MODE_PREVIEW) {
    _set_UI_reset();

    // Sync Bookmarks
    if (navigator.onLine && !_ajax_error) {
        setTimeout(function() {
            _ajax_activities(false);
        }, _SYNC_DELAY);
    }
}

if (_practice_mode === _MODE_PREPARE) {
    _set_UI_reset();

    // Sync Metrics and Bookmarks
    if (navigator.onLine && !_ajax_error) {
        setTimeout(function() {
            _ajax_activities(false);
        }, _SYNC_DELAY);
    } else {
        _set_UI_progress();
    }
}

if (_practice_mode === _MODE_PRACTICE) {
    _practice_mode = _MODE_PAUSE;

    var message_box_callback = function(_action) {
        if (_action == "Stop") {
            _practice_mode = _MODE_PREVIEW;

            _set_UI_reset();

            _set_UI_progress(); // progress will not be updated but success percentage might

            oApp.to(PagePQSelect);
        } else {
            _practice_mode = _MODE_PRACTICE;
        }
    };

    OpenMessageBox();
} else {
    oApp.back();
}
