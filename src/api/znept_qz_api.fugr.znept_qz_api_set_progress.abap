FUNCTION znept_qz_api_set_progress .
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  IMPORTING
*"     REFERENCE(IV_TEST_ID) TYPE  ZNEPT_QZ_TEST_ID_DE
*"     REFERENCE(IT_API_PROGRESS) TYPE  ZNEPT_QZ_API_PROGRESS_T
*"----------------------------------------------------------------------

  DATA: lv_new_sync_on  TYPE znept_qz_sync_date_de,
        lv_new_sync_at  TYPE znept_qz_sync_time_de,
        ls_db_tests_key TYPE znept_qz_db_tests_key_s,
        lv_sync_id      TYPE znept_qz_sync_id_de,
        lt_db_metrics   TYPE znept_qz_db_metrics_t.

  IF iv_test_id IS INITIAL OR it_api_progress IS INITIAL.
    RETURN.
  ENDIF.

  SELECT testid,
         questionid,
         syncid,
         progress
    FROM znept_qz_a_pquestion
    FOR ALL ENTRIES IN @it_api_progress
    WHERE testid = @iv_test_id
      AND questionid = @it_api_progress-question_id
    INTO TABLE @DATA(lt_qz_a_pquestion).

  IF sy-subrc <> 0.
    CLEAR lt_qz_a_pquestion.
  ENDIF.

  lv_new_sync_on = sy-datum.
  lv_new_sync_at = sy-timlo.

  LOOP AT it_api_progress ASSIGNING FIELD-SYMBOL(<fs_api_progress>).
    APPEND INITIAL LINE TO lt_db_metrics ASSIGNING FIELD-SYMBOL(<fs_db_metrics>).
    <fs_db_metrics>-sync_id = lv_sync_id.
    <fs_db_metrics>-question_id = <fs_api_progress>-question_id.
    <fs_db_metrics>-active_on = <fs_api_progress>-active_on.
    <fs_db_metrics>-active_at = <fs_api_progress>-active_at.
    <fs_db_metrics>-sync_on = lv_new_sync_on.
    <fs_db_metrics>-sync_at = lv_new_sync_at.

    IF <fs_api_progress>-correct IS INITIAL.
      <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_incorrect.
    ELSE.
      READ TABLE lt_qz_a_pquestion WITH KEY questionid = <fs_api_progress>-question_id ASSIGNING FIELD-SYMBOL(<fs_qz_a_pquestion>).
      IF sy-subrc = 0.
        CASE <fs_qz_a_pquestion>-progress.
          WHEN zcl_nept_qz_data_provider=>gc_progress_incorrect.
            <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_improved_low.
          WHEN zcl_nept_qz_data_provider=>gc_progress_improved_low.
            <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_improved_medium.
          WHEN zcl_nept_qz_data_provider=>gc_progress_improved_medium.
            <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_improved_high.
          WHEN zcl_nept_qz_data_provider=>gc_progress_improved_high.
            <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_correct.
          WHEN OTHERS.
            <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_correct.
        ENDCASE.
      ELSE.
        <fs_db_metrics>-progress = zcl_nept_qz_data_provider=>gc_progress_correct.
      ENDIF.
    ENDIF.
  ENDLOOP.

  SELECT SINGLE uploadon AS upload_on,
         uploadat AS upload_at,
         testid AS test_id
    FROM znept_qz_a_pquiz
    WHERE testid = @iv_test_id
    INTO ( @ls_db_tests_key-upload_on,
           @ls_db_tests_key-upload_at,
           @ls_db_tests_key-test_id ).

  IF sy-subrc <> 0.
    CLEAR ls_db_tests_key.
  ENDIF.

  CALL METHOD zcl_nept_qz_data_provider=>sync_metrics
    EXPORTING
      iv_old_sync_on  = zcl_nept_qz_data_provider=>gc_sync_date_final
      iv_old_sync_at  = zcl_nept_qz_data_provider=>gc_sync_time_initial
      iv_new_sync_on  = lv_new_sync_on
      iv_new_sync_at  = lv_new_sync_at
      is_db_tests_key = ls_db_tests_key
      it_db_metrics   = lt_db_metrics.

ENDFUNCTION.
