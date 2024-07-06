_set_UI_reset();

if (navigator.onLine) {
    setTimeout(function() {
        _ajax_metrics(false);
    }, _SYNC_DELAY);
} else {
    _set_UI_progress();
}

oApp.to(PagePQSelect);
