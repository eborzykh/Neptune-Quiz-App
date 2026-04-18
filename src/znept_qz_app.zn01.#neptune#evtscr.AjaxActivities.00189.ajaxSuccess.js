_set_UI_busy(false);

_ajax_error = false;

_ajax_activities_success();

_set_UI_progress();

if (_navigate_after_metrics) {
    _navigate_PagePQSelect();
}
