METHOD handlein.

  CALL FUNCTION 'ZNEPT_QZ_API_SET_PROGRESS'
    EXPORTING
      iv_test_id      = iv_test_id
      it_api_progress = it_api_progress.

  wd_this->refresh_list( ).

ENDMETHOD.

METHOD onactionstart.

  DATA: lr_node            TYPE REF TO if_wd_context_node,
        lo_api_controller  TYPE REF TO if_wd_controller,
        lo_message_manager TYPE REF TO if_wd_message_manager,
        lt_element         TYPE wdr_context_element_set,
        ls_quiz_list       TYPE if_v_quiz=>element_quiz_list.

  lr_node = wd_context->get_child_node( 'QUIZ_LIST' ).
  lt_element = lr_node->get_selected_elements( including_lead_selection = abap_false ).

  IF lt_element IS INITIAL.
    lo_api_controller ?= wd_this->wd_get_api( ).
    lo_message_manager = lo_api_controller->get_message_manager( ).
    lo_message_manager->raise_error_message( message_text = 'Select Quiz from the list' ).
  ENDIF.

  LOOP AT lt_element ASSIGNING FIELD-SYMBOL(<fs_element>).
    <fs_element>->get_static_attributes( IMPORTING static_attributes = ls_quiz_list ).
  ENDLOOP.

  wd_this->fire_out_variant_plg( iv_testid = ls_quiz_list-test_id
                                 iv_description = ls_quiz_list-description ).

ENDMETHOD.

METHOD refresh_list.

  DATA: lo_nd_quiz_list TYPE REF TO if_wd_context_node,
        lt_quiz_list    TYPE wd_this->elements_quiz_list.

*  DATA lt_db_tests     TYPE znept_qz_db_tests_t.
*
*  CALL METHOD zcl_nept_qz_data_provider=>read_available_test
*    IMPORTING
*      et_db_tests = lt_db_tests.
*
*  MOVE-CORRESPONDING lt_db_tests TO lt_quiz_list.

  DATA: lt_api_quiz TYPE znept_qz_api_quiz_t.

  CALL FUNCTION 'ZNEPT_QZ_API_GET_LIST'
    IMPORTING
      et_api_quiz = lt_api_quiz.

  MOVE-CORRESPONDING lt_api_quiz TO lt_quiz_list.

  lo_nd_quiz_list = wd_context->get_child_node( name = wd_this->wdctx_quiz_list ).
  lo_nd_quiz_list->bind_table( new_items = lt_quiz_list set_initial_elements = abap_true ).

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

method WDDOINIT .
endmethod.

METHOD wddomodifyview.

  IF first_time IS NOT INITIAL.
    wd_this->refresh_list( ).
  ENDIF.

ENDMETHOD.

method WDDOONCONTEXTMENU .
endmethod.

