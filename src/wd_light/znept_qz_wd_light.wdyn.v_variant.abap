METHOD handlein.

  REFRESH: wd_this->gt_db_parts, wd_this->gt_db_questions, wd_this->gt_db_variants, wd_this->gt_db_progress.
  CLEAR: wd_this->gv_question_index, wd_this->gv_total_questions, wd_this->gv_test_id, wd_this->gv_description.

*  DATA: ls_db_tests_key TYPE znept_qz_db_tests_key_s.
*
*  ls_db_tests_key-test_id = iv_testid.
*
*  CALL METHOD zcl_nept_qz_data_provider=>get
*    EXPORTING
*      is_db_tests_key = ls_db_tests_key
*      iv_version      = -1
*    IMPORTING
*      et_db_parts     = wd_this->gt_db_parts
*      et_db_questions = wd_this->gt_db_questions
*      et_db_variants  = wd_this->gt_db_variants.

  DATA: lt_api_question TYPE znept_qz_api_question_t.
  DATA: lt_api_variant TYPE znept_qz_api_variant_t.

  CALL FUNCTION 'ZNEPT_QZ_API_GET_QUIZ'
    EXPORTING
      iv_test_id      = iv_testid
    IMPORTING
      et_api_question = lt_api_question
      et_api_variant  = lt_api_variant.

  LOOP AT lt_api_question ASSIGNING FIELD-SYMBOL(<fs_api_question>).
    APPEND INITIAL LINE TO wd_this->gt_db_questions ASSIGNING FIELD-SYMBOL(<fs_db_questions>).
    MOVE-CORRESPONDING <fs_api_question> TO <fs_db_questions>.

    IF NOT <fs_api_question>-part_id IS INITIAL.
      READ TABLE wd_this->gt_db_parts WITH KEY part_id = <fs_api_question>-part_id TRANSPORTING NO FIELDS.
      IF sy-subrc <> 0.
        APPEND INITIAL LINE TO wd_this->gt_db_parts ASSIGNING FIELD-SYMBOL(<fs_db_parts>).
        <fs_db_parts>-part_id = <fs_api_question>-part_id.
        <fs_db_parts>-description = <fs_api_question>-part_description.
        <fs_db_parts>-sort = <fs_api_question>-sort_part.
      ENDIF.
    ENDIF.
  ENDLOOP.

  MOVE-CORRESPONDING lt_api_variant TO wd_this->gt_db_variants.

  wd_this->gv_total_questions = lines( wd_this->gt_db_questions ).
  wd_this->gv_description = iv_description.
  wd_this->gv_test_id = iv_testid.

ENDMETHOD.

METHOD onactionback.

  wd_this->fire_out_quiz_plg( it_api_progress = wd_this->gt_db_progress iv_test_id = wd_this->gv_test_id ).

ENDMETHOD.

METHOD onactioncheck.

  DATA: lv_input_made TYPE abap_bool,
        lv_message    TYPE string,
        lv_is_correct TYPE abap_bool.

  DATA: lo_nd_ui_buttons TYPE REF TO if_wd_context_node,
        lo_el_ui_buttons TYPE REF TO if_wd_context_element,
        ls_ui_buttons    TYPE wd_this->element_ui_buttons.

  DATA: lo_nd_variants TYPE REF TO if_wd_context_node,
        lt_variants    TYPE wd_this->elements_variants.

  DATA: lo_nd_questions TYPE REF TO if_wd_context_node,
        lo_el_questions TYPE REF TO if_wd_context_element,
        ls_questions    TYPE wd_this->element_questions.

  DATA: lo_api_controller  TYPE REF TO if_wd_controller,
        lo_message_manager TYPE REF TO if_wd_message_manager.

  lo_nd_questions = wd_context->get_child_node( name = wd_this->wdctx_questions ).
  lo_el_questions = lo_nd_questions->get_element( ).
  lo_el_questions->get_static_attributes( IMPORTING static_attributes = ls_questions ).

  lo_nd_variants = wd_context->get_child_node( name = wd_this->wdctx_variants ).
  lo_nd_variants->get_static_attributes_table( IMPORTING table = lt_variants ).

  lo_nd_ui_buttons = wd_context->get_child_node( name = wd_this->wdctx_ui_buttons ).
  lo_el_ui_buttons = lo_nd_ui_buttons->get_element( ).

  lo_api_controller ?= wd_this->wd_get_api( ).
  lo_message_manager = lo_api_controller->get_message_manager( ).

  IF ls_questions-ui_select_vis = if_wdl_core=>visibility_visible.

    IF ls_questions-ui_check_vis = if_wdl_core=>visibility_visible.

      lv_is_correct = abap_true.
      LOOP AT lt_variants ASSIGNING FIELD-SYMBOL(<fs_variants>).
        IF NOT <fs_variants>-selected IS INITIAL.
          lv_input_made = abap_true.
        ENDIF.
        IF <fs_variants>-selected <> <fs_variants>-correct.
          lv_is_correct = abap_false.
        ENDIF.
      ENDLOOP.

    ELSE.
      IF NOT ls_questions-radio_button IS INITIAL.
        lv_input_made = abap_true.
      ENDIF.

      READ TABLE lt_variants WITH KEY variant_id = ls_questions-radio_button correct = 'X' TRANSPORTING NO FIELDS.
      IF sy-subrc = 0.
        lv_is_correct = abap_true.
      ENDIF.
    ENDIF.

  ELSE.

    READ TABLE lt_variants INDEX 1 ASSIGNING <fs_variants>.
    IF sy-subrc = 0.
      CONDENSE <fs_variants>-input NO-GAPS.

      IF NOT <fs_variants>-input IS INITIAL.
        lv_input_made = abap_true.

        IF <fs_variants>-input = <fs_variants>-variant.
          lv_is_correct = abap_true.
        ENDIF.
      ENDIF.
    ENDIF.

  ENDIF.

  IF lv_input_made IS INITIAL.
    lv_message = 'Please give your answer.'.
    IF lines( wd_this->gt_db_questions ) > 1.
      CONCATENATE lv_message 'Or skip this question.' INTO lv_message SEPARATED BY space.
    ENDIF.
    lo_message_manager->report_message( message_text = lv_message ).
    RETURN.
  ENDIF.

  ls_ui_buttons-check_vis    = if_wdl_core=>visibility_none.
  ls_ui_buttons-continue_vis = if_wdl_core=>visibility_visible.
  ls_ui_buttons-done_vis     = if_wdl_core=>visibility_none.
  ls_ui_buttons-input_ro     = abap_true.
  ls_ui_buttons-skip_enb     = abap_false.

  READ TABLE wd_this->gt_db_progress WITH KEY question_id = wd_this->gt_db_questions[ wd_this->gv_question_index ]-question_id
    ASSIGNING FIELD-SYMBOL(<fs_db_progress>).
  IF sy-subrc <> 0.
    APPEND INITIAL LINE TO wd_this->gt_db_progress ASSIGNING <fs_db_progress>.
    <fs_db_progress>-question_id = wd_this->gt_db_questions[ wd_this->gv_question_index ]-question_id.
    <fs_db_progress>-active_on = sy-datum.
    <fs_db_progress>-active_at = sy-timlo.
  ENDIF.
  <fs_db_progress>-correct = lv_is_correct.

  IF lv_is_correct = abap_true.

    DELETE wd_this->gt_db_questions INDEX wd_this->gv_question_index.

    lv_message = 'Correct.'.

    IF lines( wd_this->gt_db_questions ) = 0.
      CONCATENATE lv_message 'You have covered all questions.' INTO lv_message SEPARATED BY space.

      ls_ui_buttons-check_vis    = if_wdl_core=>visibility_none.
      ls_ui_buttons-continue_vis = if_wdl_core=>visibility_none.
      ls_ui_buttons-done_vis     = if_wdl_core=>visibility_visible.
    ENDIF.

    lo_message_manager->report_success( message_text = lv_message ).
  ELSE.
    wd_this->gv_question_index = wd_this->gv_question_index + 1.

    CONCATENATE 'Wrong.' ls_questions-explanation INTO lv_message SEPARATED BY space.
    lo_message_manager->report_message( message_text = lv_message ).
  ENDIF.

  IF lines( wd_this->gt_db_questions ) < wd_this->gv_question_index.
    wd_this->gv_question_index = 1.
  ENDIF.

  lo_el_ui_buttons->set_static_attributes( static_attributes = ls_ui_buttons ).

  wd_this->show_progress( ).

ENDMETHOD.

METHOD onactioncontinue.

  wd_this->show_question( ).

ENDMETHOD.

METHOD onactiondone.

  wd_this->fire_out_quiz_plg( it_api_progress = wd_this->gt_db_progress iv_test_id = wd_this->gv_test_id ).

ENDMETHOD.

METHOD onactionnext.

  IF wd_this->gv_question_index < lines( wd_this->gt_db_questions ).
    wd_this->gv_question_index = wd_this->gv_question_index + 1.
  ELSE.
    wd_this->gv_question_index = 1.
  ENDIF.

  wd_this->show_question( ).

ENDMETHOD.

METHOD onactionprevious.

  IF wd_this->gv_question_index > 1.
    wd_this->gv_question_index = wd_this->gv_question_index - 1.
  ELSE.
    wd_this->gv_question_index = lines( wd_this->gt_db_questions ).
  ENDIF.

  wd_this->show_question( ).

ENDMETHOD.

METHOD show_progress.

  DATA: lo_nd_ui_progress      TYPE REF TO if_wd_context_node,
        lo_el_ui_progress      TYPE REF TO if_wd_context_element,
        ls_ui_progress         TYPE wd_this->element_ui_progress,
        lv_str_progress        TYPE string,
        lv_str_total_questions TYPE string.

  lo_nd_ui_progress = wd_context->get_child_node( name = wd_this->wdctx_ui_progress ).
  lo_el_ui_progress = lo_nd_ui_progress->get_element( ).

  lv_str_progress = wd_this->gv_total_questions - lines( wd_this->gt_db_questions ).
  lv_str_total_questions = wd_this->gv_total_questions.

  CONCATENATE lv_str_progress '/' lv_str_total_questions INTO ls_ui_progress-display_value SEPARATED BY space.

  ls_ui_progress-percent_value = 100 / wd_this->gv_total_questions * ( wd_this->gv_total_questions - lines( wd_this->gt_db_questions ) ).

  ls_ui_progress-bar_color = COND #( WHEN ls_ui_progress-percent_value < 50 THEN cl_wd_progress_indicator=>e_bar_color-neutral
                                     WHEN ls_ui_progress-percent_value >= 50 AND ls_ui_progress-percent_value < 80 THEN cl_wd_progress_indicator=>e_bar_color-critical
                                     ELSE cl_wd_progress_indicator=>e_bar_color-positive ).

  lo_el_ui_progress->set_static_attributes( static_attributes = ls_ui_progress ).

ENDMETHOD.

METHOD show_question.

  DATA: lo_nd_variants   TYPE REF TO if_wd_context_node,
        lt_variants      TYPE wd_this->elements_variants,
        lo_nd_questions  TYPE REF TO if_wd_context_node,
        lo_el_questions  TYPE REF TO if_wd_context_element,
        ls_questions     TYPE wd_this->element_questions,
        lo_nd_ui_buttons TYPE REF TO if_wd_context_node,
        lo_el_ui_buttons TYPE REF TO if_wd_context_element,
        ls_ui_buttons    TYPE wd_this->element_ui_buttons,
        lv_correct       TYPE i.

  lo_nd_ui_buttons = wd_context->get_child_node( name = wd_this->wdctx_ui_buttons ).
  lo_el_ui_buttons = lo_nd_ui_buttons->get_element( ).

  lo_nd_questions = wd_context->get_child_node( name = wd_this->wdctx_questions ).
  lo_el_questions = lo_nd_questions->get_element( ).

  lo_nd_variants = wd_context->get_child_node( name = wd_this->wdctx_variants ).

  READ TABLE wd_this->gt_db_questions INDEX wd_this->gv_question_index ASSIGNING FIELD-SYMBOL(<fs_db_questions>).
  IF sy-subrc = 0.

    ls_questions-question = <fs_db_questions>-question.
    ls_questions-explanation = <fs_db_questions>-explanation.

    LOOP AT wd_this->gt_db_variants ASSIGNING FIELD-SYMBOL(<fs_db_variants>) WHERE question_id = <fs_db_questions>-question_id.
      APPEND INITIAL LINE TO lt_variants ASSIGNING FIELD-SYMBOL(<fs_variants>).
      MOVE-CORRESPONDING <fs_db_variants> TO <fs_variants>.

      IF NOT <fs_db_variants>-correct IS INITIAL.
        lv_correct = lv_correct + 1.
      ENDIF.
    ENDLOOP.

    ls_questions-ui_type_vis = ls_questions-ui_select_vis = ls_questions-ui_check_vis = ls_questions-ui_radio_vis = if_wdl_core=>visibility_none.

    IF lines( lt_variants ) = 1.
      ls_questions-ui_type_vis = if_wdl_core=>visibility_visible.
    ELSE.
      ls_questions-ui_select_vis = if_wdl_core=>visibility_visible.
      IF lv_correct = 1.
        ls_questions-ui_radio_vis = if_wdl_core=>visibility_visible.
      ELSE.
        ls_questions-ui_check_vis = if_wdl_core=>visibility_visible.
      ENDIF.
    ENDIF.

    READ TABLE wd_this->gt_db_parts ASSIGNING FIELD-SYMBOL(<fs_db_parts>) WITH KEY part_id = <fs_db_questions>-part_id.
    IF sy-subrc = 0.
      ls_questions-ui_part_vis = if_wdl_core=>visibility_visible.
      ls_questions-part = <fs_db_parts>-description.
    ELSE.
      ls_questions-ui_part_vis = if_wdl_core=>visibility_none.
      CLEAR ls_questions-part.
    ENDIF.
  ENDIF.

  ls_questions-title = wd_this->gv_description.

  lo_el_questions->set_static_attributes( static_attributes = ls_questions ).
  lo_nd_variants->bind_table( new_items = lt_variants set_initial_elements = abap_true ).

  ls_ui_buttons-check_vis    = if_wdl_core=>visibility_visible.
  ls_ui_buttons-continue_vis = if_wdl_core=>visibility_none.
  ls_ui_buttons-done_vis     = if_wdl_core=>visibility_none.
  ls_ui_buttons-input_ro     = abap_false.

  IF lines( wd_this->gt_db_questions ) > 1.
    ls_ui_buttons-skip_enb = abap_true.
  ELSE.
    ls_ui_buttons-skip_enb = abap_false.
  ENDIF.

  lo_el_ui_buttons->set_static_attributes( static_attributes = ls_ui_buttons ).

ENDMETHOD.

method WDDOAFTERACTION .
endmethod.

method WDDOBEFOREACTION .
*  data lo_api_controller type ref to if_wd_view_controller.
*  data lo_action         type ref to if_wd_action.

*  lo_api_controller = wd_this->wd_get_api( ).
*  lo_action = lo_api_controller->get_current_action( ).

*  if lo_action is bound.
*    case lo_action->name.
*      when '...'.

*    endcase.
*  endif.
endmethod.

method WDDOEXIT .
endmethod.

METHOD wddoinit.


ENDMETHOD.

METHOD wddomodifyview.

  IF wd_this->gv_question_index IS INITIAL.
    wd_this->gv_question_index = 1.
    wd_this->show_question( ).
    wd_this->show_progress( ).
  ENDIF.

ENDMETHOD.

method WDDOONCONTEXTMENU .
endmethod.

