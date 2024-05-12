function OpenMessageBox() {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.show(
        "You have not answered all questions and still have time left. If you select Submit, only answered questions will affect your statistics.",
        "WARNING", "Submit?", ["Submit", "Resume"], function(_action) {
            message_box_callback(_action);
        }, "");
}

var _answers_given = 0;

for (var i = 0; i < ListQuestionsUI.getModel().getData().length; i++) {
    if (ListQuestionsUI.getModel().getData()[i].UI_ANSWER_GIVEN) {
        _answers_given++;
    }
}

if (_answers_given < ListQuestionsUI.getModel().getData().length) {

    _pause_timer = true;

    var message_box_callback = function(_action) {
        if (_action == "Submit") {
            _kill_timer = true;
            _submit_results();
        } else {
            _pause_timer = false;
        }
    };
    OpenMessageBox();

} else {

    _kill_timer = true;
    _submit_results();

}
