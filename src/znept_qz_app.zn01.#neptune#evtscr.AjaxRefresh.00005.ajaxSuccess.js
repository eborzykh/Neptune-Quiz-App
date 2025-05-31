_set_UI_busy(false);

_ajax_error = false;

_ajax_refresh_success();

setTimeout(function() {
    _ajax_activities(true);
}, _SYNC_DELAY);

_set_UI_PageTestSelect();

oApp.to(PageTestSelect);
