const _INTERVAL_DAY = 'D';
const _INTERVAL_WEEK = 'W';
const _INTERVAL_MONTH = 'M';
const _INTERVAL_YEAR = 'Y';
const _DEFAULT_INTERVAL = _INTERVAL_WEEK;

const _CHART_COLOR_CORRECT = "#30914c";
const _CHART_COLOR_IMPROVED = "#56c776";
const _CHART_COLOR_INCORRECT = "#f53232";
const _CHART_COLOR_UNANSWERED = "#c2ccd7";

const _CHART_COLOR_AXIS = "#b2bcc7";

var _VizFrameTotalSet = false;
var _VizFrameProgressSet = false;
var _VizFrameActivitySet = false;

var _interval = _DEFAULT_INTERVAL;
var _timeline_start = new Date();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_ReportTotal() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ls_sync_id = _get_sync_id(_ui_tests.TEST_ID, _ui_tests.UPLOAD_ON, _ui_tests.UPLOAD_AT);

    var _total_unanswered = 0;
    var _total_correct = 0;
    var _total_improved = 0;
    var _total_incorrect = 0;

    var _lt_data = [];
    var _ls_data = {};
    var _total_progress;

    // Sort Metrics local storage before using _get_progress
    _sort_metrics_ls();

    for (var i = 0; i < ListQuestionsLS.getModel().getData().length; i++) {
        var _ls_questions = ListQuestionsLS.getModel().getData()[i];

        if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
            switch (_get_progress(_ls_sync_id, _ls_questions.QUESTION_ID)) {
                case _PROGRESS_UNANSWERED:
                    _total_unanswered++;
                    break;
                case _PROGRESS_CORRECT:
                    _total_correct++;
                    break;
                case _PROGRESS_IMPROVED1:
                    _total_improved++;
                    break;
                case _PROGRESS_IMPROVED2:
                    _total_improved++;
                    break;
                case _PROGRESS_IMPROVED3:
                    _total_improved++;
                    break;
                case _PROGRESS_INCORRECT:
                    _total_incorrect++;
                    break;
            }
        }
    }

    _ls_data = {};
    _ls_data.PERCENTAGE = _total_correct;
    _ls_data.PROGRESS = 'Correct';
    _lt_data.push(_ls_data);

    _ls_data = {};
    _ls_data.PERCENTAGE = _total_improved;
    _ls_data.PROGRESS = 'Improved';
    _lt_data.push(_ls_data);

    _ls_data = {};
    _ls_data.PERCENTAGE = _total_incorrect;
    _ls_data.PROGRESS = 'Incorrect';
    _lt_data.push(_ls_data);

    _ls_data = {};
    _ls_data.PERCENTAGE = _total_unanswered;
    _ls_data.PROGRESS = 'Unanswered';
    _lt_data.push(_ls_data);

    var oModel = new sap.ui.model.json.JSONModel(_lt_data);
    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
        dimensions: [{
            name: 'Progress',
            value: "{PROGRESS}"
        }],
        measures: [{
            name: 'Percentage',
            value: '{PERCENTAGE}'
        }],
        data: {
            path: "/"
        }
    });

    VizFrameTotal.setDataset(oDataset);
    VizFrameTotal.setModel(oModel);

    if (_VizFrameTotalSet === false) {
        var feedAxisLabels = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "color",
            'type': "Dimension",
            'values': ["Progress"]
        });
        var feedPrimaryValues = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "size",
            'type': "Measure",
            'values': ["Percentage"]
        });

        VizFrameTotal.addFeed(feedPrimaryValues);
        VizFrameTotal.addFeed(feedAxisLabels);

        VizFrameTotal.setVizProperties({
            plotArea: {
                colorPalette: [_CHART_COLOR_CORRECT, _CHART_COLOR_IMPROVED, _CHART_COLOR_INCORRECT, _CHART_COLOR_UNANSWERED]
            },
            legendGroup: {
                layout: {
                    position: "bottom",
                    alignment: "center"
                }
            },
            title: {
                text: "Summary",
                alignment: "left",
                style: {
                    fontWeight: "normal"
                },
                visible: false
            }
        });

        VizFrameTotal.setWidth("100%");
        VizFrameTotal.rerender();

        _VizFrameTotalSet = true;
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_UI_ReportRefresh() {

    var _ui_tests = PageTestSelect.getModel().getData();
    var _ls_sync_id = _get_sync_id(_ui_tests.TEST_ID, _ui_tests.UPLOAD_ON, _ui_tests.UPLOAD_AT);

    var _lt_data_activity = [];
    var _lt_data_progress = [];
    var _ls_data_activity = {};
    var _ls_data_progress = {};

    var _timeline = _report_get_timeline(_interval);

    // Sort Metrics local storage before using _get_progress
    _sort_metrics_ls();

    for (var i = 0; i < _timeline.length; i++) {

        var _total_correct = 0;
        var _total_incorrect = 0;

        var _count_unanswered = 0;
        var _count_incorrect = 0;
        var _count_improved = 0;
        var _count_correct = 0;

        var _ls_activity_arr = ModelData.Find(ListMetricsLS, ["LS_SYNC_ID", "ACTIVE_ON", "ACTIVE_AT"], [_ls_sync_id, [_timeline[i].BEG_DATE, _timeline[i].END_DATE],
            [_timeline[i].BEG_TIME, _timeline[i].END_TIME]
        ], ["EQ", "BT", "BT"]);
        if (_ls_activity_arr.length > 0) {
            for (var j = 0; j < _ls_activity_arr.length; j++) {
                switch (_ls_activity_arr[j].PROGRESS) {
                    case _PROGRESS_CORRECT:
                    case _PROGRESS_IMPROVED1:
                    case _PROGRESS_IMPROVED2:
                    case _PROGRESS_IMPROVED3:
                        _total_correct++;
                        break;
                    case _PROGRESS_INCORRECT:
                        _total_incorrect++;
                        break;
                    case _PROGRESS_UNANSWERED:
                        break;
                }
            }

            var _ls_progress_arr = ModelData.Find(ListMetricsLS, ["LS_SYNC_ID", "ACTIVE_ON"], [_ls_sync_id, _timeline[i].END_DATE], ["EQ", "LE"]);
            if (_ls_progress_arr.length > 0) {
                for (j = 0; j < ListQuestionsLS.getModel().getData().length; j++) {
                    var _ls_questions = ListQuestionsLS.getModel().getData()[j];

                    if (_ls_questions.LS_TEST_ID === _ui_tests.UI_TEST_ID) {
                        var _progress_found = false;
                        for (var k = 0; k < _ls_progress_arr.length; k++) {
                            if (_ls_progress_arr[k].QUESTION_ID === _ls_questions.QUESTION_ID && _ls_progress_arr[k].ACTIVE_AT < _timeline[i].END_TIME) {
                                switch (_ls_progress_arr[k].PROGRESS) {
                                    case _PROGRESS_CORRECT:
                                        _count_correct++;
                                        break;
                                    case _PROGRESS_IMPROVED1:
                                    case _PROGRESS_IMPROVED2:
                                    case _PROGRESS_IMPROVED3:
                                        _count_improved++;
                                        break;
                                    case _PROGRESS_INCORRECT:
                                        _count_incorrect++;
                                        break;
                                    case _PROGRESS_UNANSWERED:
                                        _count_unanswered++;
                                        break;
                                }
                                _progress_found = true;
                                break;
                            }
                        }
                        if (!_progress_found) {
                            _count_unanswered++;
                        }
                    }
                }
            }
        }

        _ls_data_activity = {};

        _ls_data_activity.LABEL_TIME = i;
        _ls_data_activity.DISPLAY_TIME = _timeline[i].LABEL_TIME;
        _ls_data_activity.COUNT_CORRECT = _total_correct;
        _ls_data_activity.COUNT_INCORRECT = _total_incorrect;
        _lt_data_activity.push(_ls_data_activity);

        _ls_data_progress = {};
        _ls_data_progress.LABEL_TIME = i;
        _ls_data_progress.DISPLAY_TIME = _timeline[i].LABEL_TIME;
        _ls_data_progress.COUNT_UNANSWERED = _count_unanswered;
        _ls_data_progress.COUNT_INCORRECT = _count_incorrect;
        _ls_data_progress.COUNT_IMPROVED = _count_improved;
        _ls_data_progress.COUNT_CORRECT = _count_correct;
        _lt_data_progress.push(_ls_data_progress);
    }

    var oModel_activity = new sap.ui.model.json.JSONModel(_lt_data_activity);
    var oDataset_activity = new sap.viz.ui5.data.FlattenedDataset({
        dimensions: [{
            name: 'Time',
            value: "{LABEL_TIME}",
            displayValue: "{DISPLAY_TIME}"
        }],
        measures: [{
                name: 'Correct',
                value: '{COUNT_CORRECT}'
            }, {
                name: 'Incorrect',
                value: '{COUNT_INCORRECT}'
            }
        ],
        data: {
            path: "/"
        }
    });

    VizFrameActivity.setDataset(oDataset_activity);
    VizFrameActivity.setModel(oModel_activity);

    if (_VizFrameActivitySet === false) {
        var feedLabel_activity = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "categoryAxis",
            'type': "Dimension",
            'values': ["Time"]
        });

        var feedValue_correct_activity = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ["Correct"]
        });

        var feedValue_incorrect_activity = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ["Incorrect"]
        });

        VizFrameActivity.addFeed(feedLabel_activity);
        VizFrameActivity.addFeed(feedValue_incorrect_activity);
        VizFrameActivity.addFeed(feedValue_correct_activity);

        VizFrameActivity.setVizProperties({
            valueAxis: {
                title: {
                    visible: false
                },
                color: _CHART_COLOR_AXIS,
                label: {
                    style: {
                        color: _CHART_COLOR_AXIS,
                    }
                }
            },
            categoryAxis: {
                title: {
                    visible: false
                },
                color: _CHART_COLOR_AXIS,
                label: {
                    style: {
                        color: _CHART_COLOR_AXIS,
                    }
                }
            },
            plotArea: {
                colorPalette: [_CHART_COLOR_INCORRECT, _CHART_COLOR_CORRECT],
                drawingEffect: "glossy",
                gridline: {
                    color: _CHART_COLOR_AXIS,
                    size: 0.5
                }
            },
            legend: {
                visible: false
            },
            legendGroup: {
                layout: {
                    position: "bottom",
                    alignment: "center"
                }
            },
            title: {
                text: "Activity and Progress",
                alignment: "left",
                style: {
                    fontWeight: "normal",
                    fontSize: "0.85rem"
                },
                visible: false
            }
        });

        VizFrameActivity.setWidth("100%");
        VizFrameActivity.rerender();

        _VizFrameActivitySet = true;
    }

    var oModel_progress = new sap.ui.model.json.JSONModel(_lt_data_progress);
    var oDataset_progress = new sap.viz.ui5.data.FlattenedDataset({
        dimensions: [{
            name: 'Time',
            value: "{LABEL_TIME}",
            displayValue: "{DISPLAY_TIME}"
        }],
        measures: [{
            name: 'Unanswered',
            value: '{COUNT_UNANSWERED}'
        }, {
            name: 'Incorrect',
            value: '{COUNT_INCORRECT}'
        }, {
            name: 'Improved',
            value: '{COUNT_IMPROVED}'
        }, {
            name: 'Correct',
            value: '{COUNT_CORRECT}'
        }],
        data: {
            path: "/"
        }
    });

    VizFrameProgress.setDataset(oDataset_progress);
    VizFrameProgress.setModel(oModel_progress);

    if (_VizFrameProgressSet === false) {

        var feedLabel_progress = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "categoryAxis",
            'type': "Dimension",
            'values': ["Time"]
        });

        var feedValue_unanswered_progress = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ["Unanswered"]
        });

        var feedValue_incorrect_progress = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ["Incorrect"]
        });

        var feedValue_improved_progress = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ["Improved"]
        });

        var feedValue_correct_progress = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ["Correct"]
        });

        VizFrameProgress.addFeed(feedLabel_progress);
        VizFrameProgress.addFeed(feedValue_unanswered_progress);
        VizFrameProgress.addFeed(feedValue_incorrect_progress);
        VizFrameProgress.addFeed(feedValue_improved_progress);
        VizFrameProgress.addFeed(feedValue_correct_progress);

        VizFrameProgress.setVizProperties({
            valueAxis: {
                title: {
                    visible: false
                },
                color: _CHART_COLOR_AXIS,
                label: {
                    style: {
                        color: _CHART_COLOR_AXIS,
                    }
                }
            },
            categoryAxis: {
                title: {
                    visible: false
                },
                color: _CHART_COLOR_AXIS,
                label: {
                    style: {
                        color: _CHART_COLOR_AXIS,
                    }
                }
            },
            plotArea: {
                colorPalette: [_CHART_COLOR_UNANSWERED, _CHART_COLOR_INCORRECT, _CHART_COLOR_IMPROVED, _CHART_COLOR_CORRECT],
                drawingEffect: "glossy",
                gridline: {
                    color: _CHART_COLOR_AXIS,
                    size: 0.5
                }
            },
            legend: {
                visible: false
            },
            legendGroup: {
                layout: {
                    position: "bottom",
                    alignment: "center"
                }
            },
            title: {
                text: "Progress and activity",
                alignment: "left",
                style: {
                    fontWeight: "normal",
                    fontSize: "0.85rem"
                },
                visible: true
            }
        });

        VizFrameProgress.setWidth("100%");
        VizFrameProgress.rerender();

        _VizFrameProgressSet = true;
    }

    const _day = (_timeline_start.getDate().toString().length === 1 ? "0" + _timeline_start.getDate().toString() : _timeline_start.getDate().toString());
    const _month = ((_timeline_start.getMonth() + 1).toString().length === 1 ? "0" + (_timeline_start.getMonth() + 1).toString() : (_timeline_start.getMonth() + 1).toString());
    const _year = _timeline_start.getFullYear().toString();

    var _date_label = 'Progress and activity';
    switch (_interval) {
        case _INTERVAL_DAY:
            _date_label = _date_label + ' on ' + (_year + '.' + _month + '.' + _day).toString();
            break;
        case _INTERVAL_WEEK:
            _date_label = _date_label + ' for week from ' + (_year + '.' + _month + '.' + _day).toString();
            break;
        case _INTERVAL_MONTH:
            _date_label = _date_label + ' in ' + _timeline_start.toLocaleString('default', {
                month: 'long'
            }) + ' of ' + _year.toString();
            break;
        case _INTERVAL_YEAR:
            _date_label = _date_label + ' in ' + _year.toString();
            break;
    }

    VizFrameProgress.setVizProperties({
        title: {
            text: _date_label,
        }
    });
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _report_get_timeline(_interval, _start_date) {

    const _week_display = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const _year_display = ["Y", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
//    const _year_display = ["Yan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var i;
    var _last_day;
    var _lt_timeline = [];
    var _ls_timeline = {};

    var _date = new Date(_timeline_start);

    switch (_interval) {
        case _INTERVAL_DAY:

            for (i = 0; i <= 23; i++) {
                _ls_timeline = {};
                _ls_timeline.LABEL_TIME = (i.toString().length === 1 ? "0" + i.toString() : i.toString());
                _ls_timeline.BEG_DATE = _get_date(_date);
                _ls_timeline.BEG_TIME = ((i.toString().length === 1 ? "0" + i.toString() : i.toString()) + '0000').toString();
                _ls_timeline.END_DATE = _get_date(_date);
                _ls_timeline.END_TIME = ((i.toString().length === 1 ? "0" + i.toString() : i.toString()) + '9999').toString();
                _lt_timeline.push(_ls_timeline);
            }

            break;
        case _INTERVAL_WEEK:

            for (i = 0; i < _week_display.length; i++) {
                _ls_timeline = {};
                _ls_timeline.LABEL_TIME = _week_display[i];
                _ls_timeline.BEG_DATE = _get_date(_date);
                _ls_timeline.BEG_TIME = '000000';
                _ls_timeline.END_DATE = _get_date(_date);
                _ls_timeline.END_TIME = '999999';
                _lt_timeline.push(_ls_timeline);
                _date.setDate(_date.getDate() + 1);
            }

            break;
        case _INTERVAL_MONTH:

            _last_day = new Date(_date.getFullYear(), _date.getMonth() + 1, 0).getDate();

            for (i = 1; i <= _last_day; i++) {
                _date.setDate(i);
                _ls_timeline = {};
                _ls_timeline.LABEL_TIME = i.toString();
                _ls_timeline.BEG_DATE = _get_date(_date);
                _ls_timeline.BEG_TIME = '000000';
                _ls_timeline.END_DATE = _get_date(_date);
                _ls_timeline.END_TIME = '999999';
                _lt_timeline.push(_ls_timeline);
            }
            break;
        case _INTERVAL_YEAR:

            for (i = 0; i < _year_display.length; i++) {
                _date.setMonth(i);
                _last_day = new Date(_date.getFullYear(), _date.getMonth() + 1, 0);
                _ls_timeline = {};
                _ls_timeline.LABEL_TIME = _year_display[i];
                _ls_timeline.BEG_DATE = _get_date(_date);
                _ls_timeline.BEG_TIME = '000000';
                _ls_timeline.END_DATE = _get_date(_last_day);
                _ls_timeline.END_TIME = '999999';
                _lt_timeline.push(_ls_timeline);
            }
            break;
    }
    return _lt_timeline;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_timeline_back() {

    switch (_interval) {
        case _INTERVAL_DAY:
            _timeline_start.setDate(_timeline_start.getDate() - 1);
            break;
        case _INTERVAL_WEEK:
            _timeline_start.setDate(_timeline_start.getDate() - 7);
            break;
        case _INTERVAL_MONTH:
            _timeline_start.setMonth(_timeline_start.getMonth() - 1);
            break;
        case _INTERVAL_YEAR:
            _timeline_start.setFullYear(_timeline_start.getFullYear() - 1);
            break;
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_timeline_forward() {

    switch (_interval) {
        case _INTERVAL_DAY:
            _timeline_start.setDate(_timeline_start.getDate() + 1);
            break;
        case _INTERVAL_WEEK:
            _timeline_start.setDate(_timeline_start.getDate() + 7);
            break;
        case _INTERVAL_MONTH:
            _timeline_start.setMonth(_timeline_start.getMonth() + 1);
            break;
        case _INTERVAL_YEAR:
            _timeline_start.setFullYear(_timeline_start.getFullYear() + 1);
            break;
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _set_interval(_new_interval) {

    _interval = _new_interval;
    switch (_interval) {
        case _INTERVAL_DAY:
            _timeline_start = new Date();

            ButtonReportBothFD.setType("Emphasized");
            ButtonReportBothFW.setType("Default");
            ButtonReportBothFM.setType("Default");
            ButtonReportBothFY.setType("Default");
            break;
        case _INTERVAL_WEEK:
            _timeline_start = _get_date_week_start(new Date());

            ButtonReportBothFD.setType("Default");
            ButtonReportBothFW.setType("Emphasized");
            ButtonReportBothFM.setType("Default");
            ButtonReportBothFY.setType("Default");
            break;
        case _INTERVAL_MONTH:
            _timeline_start = new Date();
            _timeline_start.setDate(1);

            ButtonReportBothFD.setType("Default");
            ButtonReportBothFW.setType("Default");
            ButtonReportBothFM.setType("Emphasized");
            ButtonReportBothFY.setType("Default");
            break;
        case _INTERVAL_YEAR:
            _timeline_start = new Date();
            _timeline_start.setMonth(0);
            _timeline_start.setDate(1);

            ButtonReportBothFD.setType("Default");
            ButtonReportBothFW.setType("Default");
            ButtonReportBothFM.setType("Default");
            ButtonReportBothFY.setType("Emphasized");
            break;
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _get_date_week_start(_date) {

    _date = new Date(_date);
    var _day = _date.getDay();
    var _diff = _date.getDate() - _day + (_day === 0 ? -6 : 1); // Monday
    return new Date(_date.setDate(_diff));
}
