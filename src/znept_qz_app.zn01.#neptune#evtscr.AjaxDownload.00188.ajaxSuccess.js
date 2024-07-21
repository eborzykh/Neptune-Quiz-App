_set_UI_busy(false);

_ajax_error = false;

_ajax_download_success();

_navigate_after_metrics = true;

setTimeout(function() {
    _ajax_metrics(false);
}, _SYNC_DELAY);
