class ZCL_NEPT_QZ_APP_CLASS definition
  public
  final
  create public .

public section.

  interfaces /NEPTUNE/IF_NAD_SERVER .

  data GT_SY_TESTS type ZNEPT_QZ_SY_TESTS_T .
  data GT_SY_PARTS type ZNEPT_QZ_SY_PARTS_T .
  data GT_SY_QUESTIONS type ZNEPT_QZ_SY_QUESTIONS_T .
  data GT_SY_VARIANTS type ZNEPT_QZ_SY_VARIANTS_T .
  data GT_SY_SYNC_METRICS type ZNEPT_QZ_SY_SYNC_T .
  data GT_SY_METRICS type ZNEPT_QZ_SY_METRICS_T .
  data GT_SY_SYNC_BOOKMARKS type ZNEPT_QZ_SY_SYNC_T .
  data GT_SY_BOOKMARKS type ZNEPT_QZ_SY_BOOKMARKS_T .
  data GS_SY_TESTS type ZNEPT_QZ_SY_TESTS_S .
  data GS_SY_PARTS type ZNEPT_QZ_SY_PARTS_S .
  data GS_SY_QUESTIONS type ZNEPT_QZ_SY_QUESTIONS_S .
  data GS_SY_VARIANTS type ZNEPT_QZ_SY_VARIANTS_S .
  data GS_SY_SYNC type ZNEPT_QZ_SY_SYNC_S .
  data GS_SY_METRICS type ZNEPT_QZ_SY_METRICS_S .
  data GS_SY_BOOKMARKS type ZNEPT_QZ_SY_BOOKMARKS_S .
  data GT_LS_TESTS type ZNEPT_QZ_LS_TESTS_T .
  data GT_LS_PARTS type ZNEPT_QZ_LS_PARTS_T .
  data GT_LS_QUESTIONS type ZNEPT_QZ_LS_QUESTIONS_T .
  data GT_LS_VARIANTS type ZNEPT_QZ_LS_VARIANTS_T .
  data GT_LS_SYNC_METRICS type ZNEPT_QZ_LS_SYNC_T .
  data GT_LS_METRICS type ZNEPT_QZ_LS_METRICS_T .
  data GS_LS_TESTS type ZNEPT_QZ_LS_TESTS_S .
  data GS_LS_PARTS type ZNEPT_QZ_LS_PARTS_S .
  data GS_LS_QUESTIONS type ZNEPT_QZ_LS_QUESTIONS_S .
  data GS_LS_VARIANTS type ZNEPT_QZ_LS_VARIANTS_S .
  data GS_LS_SYNC type ZNEPT_QZ_LS_SYNC_S .
  data GS_LS_METRICS type ZNEPT_QZ_LS_METRICS_S .
  data GT_UI_TESTS type ZNEPT_QZ_UI_TESTS_T .
  data GT_UI_PQ type ZNEPT_QZ_UI_PQ_T .
  data GT_UI_QUESTIONS type ZNEPT_QZ_UI_QUESTIONS_T .
  data GT_UI_VARIANTS type ZNEPT_QZ_UI_VARIANTS_T .
  data GS_UI_TESTS type ZNEPT_QZ_UI_TESTS_S .
  data GS_UI_PQ type ZNEPT_QZ_UI_PQ_S .
  data GS_UI_QUESTIONS type ZNEPT_QZ_UI_QUESTIONS_S .
  data GS_UI_VARIANTS type ZNEPT_QZ_UI_VARIANTS_S .
  data GS_SY type ZNEPT_QZ_SY_S .
  data GS_UI_PARAMETERS type ZNEPT_QZ_UI_PARAMETERS_S .
protected section.
private section.

  data GV_DB_ERROR type ABAP_BOOL .
  data GV_DO_COMMIT type ABAP_BOOL .
  constants GC_SY_ACT_UPDATE type ZNEPT_QZ_SY_ACTION_DE value 'U' ##NO_TEXT.
  constants GC_SY_ACT_DELETE type ZNEPT_QZ_SY_ACTION_DE value 'D' ##NO_TEXT.
  constants GC_SY_ACT_INSERT type ZNEPT_QZ_SY_ACTION_DE value 'I' ##NO_TEXT.

  methods AJAX_DELETE .
  methods AJAX_RENAME .
  methods AJAX_REFRESH .
  methods AJAX_ACTIVITIES .
  methods AJAX_DOWNLOAD .
  methods AJAX_UPLOAD
    importing
      !IS_REQUEST type /NEPTUNE/DATA_REQUEST .
  methods AJAX_PUBLISH .
  methods GET_USER_NAME
    importing
      !IV_USER_ID type ZNEPT_QZ_UPLOAD_USER_DE
    returning
      value(RV_USER_NAME) type ZNEPT_QZ_UPLOAD_NAME_DE .
  methods CREATE_EXAMPLE .
ENDCLASS.



CLASS ZCL_NEPT_QZ_APP_CLASS IMPLEMENTATION.


  METHOD /neptune/if_nad_server~handle_on_ajax.

    CLEAR: return, gv_db_error, gv_do_commit.

* ------------------------------------------------------------
    me->create_example( ). " Creates an example (optional)
* ------------------------------------------------------------

    gs_sy-sap_user = sy-uname.

    SELECT SINGLE upddat, updtim FROM /neptune/app INTO @DATA(ls_nept_app)
      WHERE applid = @applid.
    IF sy-subrc = 0.
      CONCATENATE ls_nept_app-upddat+3(1) ls_nept_app-upddat+4(2) ls_nept_app-upddat+6(2)
                  ls_nept_app-updtim+0(2) ls_nept_app-updtim+2(2)
        INTO gs_sy-active_ui_version SEPARATED BY '.'.
    ENDIF.

    CASE ajax_id.

      WHEN 'REFRESH'.

        me->ajax_refresh( ).

      WHEN 'DOWNLOAD'.

        me->ajax_download( ).

      WHEN 'ACTIVITIES'.

        me->ajax_activities( ).

      WHEN 'UPLOAD'.

        me->ajax_upload( is_request = request ).

      WHEN 'PUBLISH'.

        me->ajax_publish( ).

      WHEN 'RENAME'.

        me->ajax_rename( ).

      WHEN 'DELETE'.

        me->ajax_delete( ).

    ENDCASE.

    IF gv_db_error = abap_false AND gv_do_commit = abap_true.
      COMMIT WORK AND WAIT.
    ELSEIF gv_db_error = abap_true.
      ROLLBACK WORK.

      return-status_code = 500.                          "#EC NUMBER_OK
    ENDIF.

  ENDMETHOD.


  METHOD /NEPTUNE/IF_NAD_SERVER~HANDLE_ON_REQUEST.          "#EC NEEDED
  ENDMETHOD.


  METHOD /NEPTUNE/IF_NAD_SERVER~HANDLE_ON_RESPONSE.         "#EC NEEDED
  ENDMETHOD.


  METHOD /NEPTUNE/IF_NAD_SERVER~HANDLE_ON_SUBMIT.           "#EC NEEDED
  ENDMETHOD.


  METHOD /NEPTUNE/IF_NAD_SERVER~HANDLE_ON_SYNC_IN.          "#EC NEEDED
  ENDMETHOD.


  METHOD /NEPTUNE/IF_NAD_SERVER~HANDLE_ON_SYNC_OUT.         "#EC NEEDED
  ENDMETHOD.


  METHOD ajax_delete.

    DATA: ls_db_tests_key TYPE znept_qz_db_tests_key_s.

    MOVE-CORRESPONDING gs_sy_tests TO ls_db_tests_key.

    CALL METHOD zcl_nept_qz_data_provider=>delete
      EXPORTING
        is_db_tests_key = ls_db_tests_key
      IMPORTING
        ev_db_error     = gv_db_error
        ev_do_commit    = gv_do_commit.

  ENDMETHOD.


  METHOD ajax_download.

    DATA: ls_db_tests_key TYPE znept_qz_db_tests_key_s,
          lt_db_parts     TYPE znept_qz_db_parts_t,
          lt_db_questions TYPE znept_qz_db_questions_t,
          lt_db_variants  TYPE znept_qz_db_variants_t.

    MOVE-CORRESPONDING gs_sy_tests TO ls_db_tests_key.

    CALL METHOD zcl_nept_qz_data_provider=>get
      EXPORTING
        is_db_tests_key = ls_db_tests_key
      IMPORTING
        et_db_parts     = lt_db_parts
        et_db_questions = lt_db_questions
        et_db_variants  = lt_db_variants
        ev_db_error     = gv_db_error.

    MOVE-CORRESPONDING lt_db_parts[] TO gt_sy_parts[].
    MOVE-CORRESPONDING lt_db_questions[] TO gt_sy_questions[].
    MOVE-CORRESPONDING lt_db_variants[] TO gt_sy_variants[].

  ENDMETHOD.


  METHOD ajax_publish.

    DATA: ls_db_tests_key TYPE znept_qz_db_tests_key_s,
          lv_published    TYPE znept_qz_published_de.

    MOVE-CORRESPONDING gs_sy_tests TO ls_db_tests_key.

    lv_published = gs_sy_tests-published.

    CALL METHOD zcl_nept_qz_data_provider=>publish
      EXPORTING
        is_db_tests_key = ls_db_tests_key
        iv_published    = lv_published
      IMPORTING
        ev_db_error     = gv_db_error
        ev_do_commit    = gv_do_commit.

  ENDMETHOD.


  METHOD ajax_refresh.

    DATA: ls_db_tests_key TYPE znept_qz_db_tests_key_s,
          lt_db_tests     TYPE znept_qz_db_tests_t,
          ls_db_tests     TYPE znept_qz_db_tests_s,
          lt_sy_tests     TYPE znept_qz_sy_tests_t,
          ls_sy_tests     TYPE znept_qz_sy_tests_s.

    CALL METHOD zcl_nept_qz_data_provider=>read_available_test
      IMPORTING
        et_db_tests = lt_db_tests.

    LOOP AT lt_db_tests INTO ls_db_tests.
      CLEAR ls_sy_tests.

      READ TABLE gt_sy_tests INTO ls_sy_tests WITH KEY test_id   = ls_db_tests-test_id
                                                       upload_on = ls_db_tests-upload_on
                                                       upload_at = ls_db_tests-upload_at.
      IF sy-subrc = 0.
        IF  ls_db_tests-description = ls_sy_tests-description AND ls_db_tests-published = ls_sy_tests-published.
          CONTINUE.
        ENDIF.

        ls_sy_tests-description = ls_db_tests-description.
        ls_sy_tests-published   = ls_db_tests-published.
        ls_sy_tests-sy_action   = gc_sy_act_update.
      ELSE.
        MOVE-CORRESPONDING ls_db_tests TO ls_sy_tests.
        ls_sy_tests-sy_action = gc_sy_act_insert.

        MOVE-CORRESPONDING ls_db_tests TO ls_db_tests_key.

        CALL METHOD zcl_nept_qz_data_provider=>info
          EXPORTING
            is_db_tests_key    = ls_db_tests_key
          IMPORTING
            ev_total_parts     = ls_sy_tests-sy_count_parts
            ev_total_questions = ls_sy_tests-sy_count_questions.

        ls_sy_tests-sy_upload_by_name = get_user_name( iv_user_id = ls_db_tests-upload_by ).
      ENDIF.

      APPEND ls_sy_tests TO lt_sy_tests.
      CLEAR ls_db_tests.
    ENDLOOP.

    LOOP AT gt_sy_tests INTO ls_sy_tests.
      READ TABLE lt_db_tests INTO ls_db_tests WITH KEY test_id   = ls_sy_tests-test_id
                                                       upload_on = ls_sy_tests-upload_on
                                                       upload_at = ls_sy_tests-upload_at.
      IF sy-subrc <> 0.
        ls_sy_tests-sy_action = gc_sy_act_delete.
        APPEND ls_sy_tests TO lt_sy_tests.
      ENDIF.

      CLEAR ls_sy_tests.
    ENDLOOP.

    gt_sy_tests[] = lt_sy_tests[].

  ENDMETHOD.


  METHOD ajax_rename.

    DATA: ls_db_tests_key TYPE znept_qz_db_tests_key_s,
          lv_description  TYPE znept_qz_test_name_de.

    MOVE-CORRESPONDING gs_sy_tests TO ls_db_tests_key.
    lv_description = gs_sy_tests-description.

    CALL METHOD zcl_nept_qz_data_provider=>rename
      EXPORTING
        is_db_tests_key = ls_db_tests_key
        iv_description  = lv_description
      IMPORTING
        ev_db_error     = gv_db_error
        ev_do_commit    = gv_do_commit.

  ENDMETHOD.


  METHOD ajax_upload.

    DATA: lt_db_parts     TYPE znept_qz_db_parts_t,
          lt_db_questions TYPE znept_qz_db_questions_t,
          lt_db_variants  TYPE znept_qz_db_variants_t,
          ls_db_parts     TYPE znept_qz_db_parts_s,
          ls_db_questions TYPE znept_qz_db_questions_s,
          ls_db_variants  TYPE znept_qz_db_variants_s,
          lv_test_name    TYPE znept_qz_test_name_de,
          lv_xcontent     TYPE xstring,
          lv_content      TYPE string,
          lt_file         TYPE TABLE OF string,
          lt_block        TYPE TABLE OF string,
          lv_line         TYPE string,
          lv_block        TYPE string,
          lv_dummy        TYPE string,                      "#EC NEEDED
          lv_block_size   TYPE i,
          lv_total_lines  TYPE i,
          lv_tabix        TYPE i.

    IF is_request-it_files[] IS INITIAL.
      RETURN.
    ENDIF.

    READ TABLE is_request-it_files INTO DATA(ls_files) INDEX 1.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    lv_xcontent = ls_files-content.

    CALL FUNCTION 'ECATT_CONV_XSTRING_TO_STRING'
      EXPORTING
        im_xstring  = lv_xcontent
        im_encoding = 'UTF-8'
      IMPORTING
        ex_string   = lv_content.

    IF lv_content IS INITIAL.
      RETURN.
    ELSE.
      SPLIT lv_content AT cl_abap_char_utilities=>cr_lf INTO TABLE lt_file.
    ENDIF.

    SPLIT ls_files-filename AT '.' INTO lv_test_name lv_dummy.

    lv_total_lines = lines( lt_file ).

    LOOP AT lt_file INTO lv_line.                          "#EC INTO_OK
      lv_tabix = sy-tabix.

      IF strlen( lv_line ) > 1.
        APPEND lv_line TO lt_block.

        IF lv_tabix < lv_total_lines.
          CONTINUE.
        ENDIF.
      ENDIF.

      IF lt_block[] IS INITIAL.
        CONTINUE.
      ENDIF.

      lv_block_size = lines( lt_block ).

      LOOP AT lt_block INTO lv_block.                      "#EC INTO_OK

        IF lv_block_size = 1.
          SPLIT lv_block AT cl_abap_char_utilities=>horizontal_tab INTO ls_db_parts-description lv_dummy.

          ls_db_parts-part_id = ls_db_parts-part_id + 1.
          APPEND ls_db_parts TO lt_db_parts.

          CONTINUE.
        ENDIF.

        IF ls_db_variants-variant_id IS INITIAL.
          ls_db_questions-part_id     = ls_db_parts-part_id.
          ls_db_questions-question_id = ls_db_questions-question_id + 1.

          SPLIT lv_block AT cl_abap_char_utilities=>horizontal_tab INTO ls_db_questions-question ls_db_questions-explanation.

          APPEND ls_db_questions TO lt_db_questions.
          ls_db_variants-variant_id = 1.
        ELSE.
*          ls_db_variants-part_id     = ls_db_parts-part_id.
          ls_db_variants-question_id = ls_db_questions-question_id.

          SPLIT lv_block AT cl_abap_char_utilities=>horizontal_tab INTO ls_db_variants-variant ls_db_variants-correct.

          IF NOT ls_db_variants-correct IS INITIAL.
            ls_db_variants-correct = abap_true.
          ENDIF.

          APPEND ls_db_variants TO lt_db_variants.
          ls_db_variants-variant_id = ls_db_variants-variant_id + 1.
        ENDIF.

        CLEAR lv_block.
      ENDLOOP.

      CLEAR lt_block[].
      CLEAR ls_db_variants.

      CLEAR lv_line.
    ENDLOOP.

    IF lt_db_questions[] IS INITIAL.
      RETURN.
    ENDIF.

    CALL METHOD zcl_nept_qz_data_provider=>add
      EXPORTING
        iv_description  = lv_test_name
        iv_published    = abap_false
        it_db_parts     = lt_db_parts
        it_db_questions = lt_db_questions
        it_db_variants  = lt_db_variants
      IMPORTING
        ev_db_error     = gv_db_error
        ev_do_commit    = gv_do_commit.

  ENDMETHOD.


  METHOD create_example.

    DATA: lt_db_parts     TYPE znept_qz_db_parts_t,
          lt_db_questions TYPE znept_qz_db_questions_t,
          lt_db_variants  TYPE znept_qz_db_variants_t.

    SELECT COUNT(*) FROM znept_qz_tst INTO @DATA(lv_dummy_count). "#EC NEEDED
    IF sy-subrc <> 0.

      lt_db_parts = VALUE #(
        ( part_id = 1 description = 'Part 1. Neptune Software' )
        ( part_id = 2 description = 'Part 2. The Quiz Neptune App' )
        ( part_id = 3 description = 'Part 3. Question Type Examples' ) ).

      lt_db_questions = VALUE #(
        ( part_id = 1 question_id = 1 question = 'Is this statement TRUE or FALSE? You can only use Neptune Software with SAP.'
                                      explanation = 'Not only with SAP. Neptune has SAP and Open Edition.' )

        ( part_id = 1 question_id = 2 question = 'Select types of applications you can build with Neptune.'
                                      explanation = 'With Neptune you can quickly develop browser and mobile cross platforms applications.' )

        ( part_id = 1 question_id = 3 question = 'How many developer licenses will be included in Neptune Software Free Trial? Type your answer.'
                                      explanation = 'With the Neptune Software Free Trial, you get 2 developer licenses.' )

        ( part_id = 2 question_id = 4 question = 'If the owner deletes or sets as private a quiz which you have already started. Then:'
                                      explanation = 'Users will be able to continue the quiz they have already started due to offline capabilities in the Quiz Neptune App. ' )

        ( part_id = 2 question_id = 5 question = 'Is this statement TRUE or FALSE? The Quiz Neptune App can only work in browser.'
                                      explanation = 'The Quiz Neptune App can work in both browser and the Neptune mobile client.' )

        ( part_id = 2 question_id = 6 question = 'Select all types of questions supported by the Quiz Neptune App.'
                                      explanation = 'The Quiz Neptune App supports single, multiple and free choice question types.' )

        ( part_id = 3 question_id = 7 question = '1. Single choice question example. Select one correct answer from below.'
                                      explanation = 'Single choice question will be displayed if there is only one correct answer provided.' )

        ( part_id = 3 question_id = 8 question = '2. Multiple choice question example. Select from multiple answers below.'
                                      explanation = 'Multiple choice question will be displayed if there are more than one correct answer provided.' )

        ( part_id = 3 question_id = 9 question = '3. Free choice question example. Type correct answer below ( 2+2 = ? ).'
                                      explanation = 'Free choice questions give the user an input field where they must type the correct answer.' ) ).

      lt_db_variants = VALUE #(
        ( question_id = 1 variant_id = 1 variant = 'A. TRUE' correct = '' )
        ( question_id = 1 variant_id = 2 variant = 'B. FALSE' correct = 'X' )

        ( question_id = 2 variant_id = 1 variant = 'A. Browser applications.' correct = 'X' )
        ( question_id = 2 variant_id = 2 variant = 'B. Microsoft Windows desktop application.' correct = '' )
        ( question_id = 2 variant_id = 3 variant = 'C. Native Android applications.' correct = '' )
        ( question_id = 2 variant_id = 4 variant = 'D. Mobile cross platforms.' correct = 'X' )

        ( question_id = 3 variant_id = 1 variant = '2' correct = '' )

        ( question_id = 4 variant_id = 1 variant = 'A. Deleted or set as private quiz will be removed from all users.' correct = '' )
        ( question_id = 4 variant_id = 2 variant = 'B. Users will be able to continue the quiz they have already started.' correct = 'X' )
        ( question_id = 4 variant_id = 3 variant = 'C. The app will notify and block from deleting or making content as private if someone is using it.' correct = '' )

        ( question_id = 5 variant_id = 1 variant = 'A. TRUE' correct = '' )
        ( question_id = 5 variant_id = 2 variant = 'B. FALSE' correct = 'X' )

        ( question_id = 6 variant_id = 1 variant = 'A. Multiple choice' correct = 'X' )
        ( question_id = 6 variant_id = 2 variant = 'B. Single choice' correct = 'X' )
        ( question_id = 6 variant_id = 3 variant = 'C. Fill in the blank' correct = '' )
        ( question_id = 6 variant_id = 4 variant = 'D. Free choice (typing)' correct = 'X' )
        ( question_id = 6 variant_id = 5 variant = 'E. All above' correct = '' )

        ( question_id = 7 variant_id = 1 variant = 'A. Wrong variant' correct = '' )
        ( question_id = 7 variant_id = 2 variant = 'B. Correct variant' correct = 'X' )

        ( question_id = 8 variant_id = 1 variant = 'A. Correct variant' correct = 'X' )
        ( question_id = 8 variant_id = 2 variant = 'B. Wrong variant' correct = '' )
        ( question_id = 8 variant_id = 3 variant = 'C. Correct variant' correct = 'X' )

        ( question_id = 9 variant_id = 1 variant = '4' correct = '' ) ).

      CALL METHOD zcl_nept_qz_data_provider=>add
        EXPORTING
          iv_description  = 'Quiz Neptune Application'
          iv_published    = abap_true
          it_db_parts     = lt_db_parts
          it_db_questions = lt_db_questions
          it_db_variants  = lt_db_variants
        IMPORTING
          ev_db_error     = gv_db_error
          ev_do_commit    = gv_do_commit.

      IF gv_db_error = abap_false AND gv_do_commit = abap_true.
        COMMIT WORK AND WAIT.
      ELSEIF gv_db_error = abap_true.
        ROLLBACK WORK.
      ENDIF.

      CLEAR: gv_db_error, gv_do_commit.

    ENDIF.

  ENDMETHOD.


  METHOD get_user_name.

    DATA: ls_user_address TYPE addr3_val.

    CLEAR rv_user_name.

    CALL FUNCTION 'SUSR_USER_ADDRESS_READ'
      EXPORTING
        user_name              = iv_user_id
      IMPORTING
        user_address           = ls_user_address
      EXCEPTIONS
        user_address_not_found = 1
        OTHERS                 = 2.

    IF sy-subrc = 0.
      rv_user_name = ls_user_address-name_text.
    ELSE.
      rv_user_name = iv_user_id.
    ENDIF.

  ENDMETHOD.


  METHOD ajax_activities.

    DATA: lt_db_tests_key      TYPE znept_qz_db_tests_key_t,
          ls_db_tests_key      TYPE znept_qz_db_tests_key_s,
          ls_sy_sync           TYPE znept_qz_sy_sync_s,
          lt_sy_sync_metrics   TYPE znept_qz_sy_sync_t,
          lt_sy_sync_bookmarks TYPE znept_qz_sy_sync_t,
          ls_sy_metrics        TYPE znept_qz_sy_metrics_s,
          lt_sy_metrics        TYPE znept_qz_sy_metrics_t,
          ls_sy_bookmarks      TYPE znept_qz_sy_bookmarks_s,
          lt_sy_bookmarks      TYPE znept_qz_sy_bookmarks_t,
          ls_db_metrics        TYPE znept_qz_db_metrics_s,
          lt_db_metrics        TYPE znept_qz_db_metrics_t,
          ls_db_bookmarks      TYPE znept_qz_db_bookmarks_s,
          lt_db_bookmarks      TYPE znept_qz_db_bookmarks_t,
          lv_new_sync_on       TYPE znept_qz_sync_date_de,
          lv_new_sync_at       TYPE znept_qz_sync_time_de.

    lv_new_sync_on = sy-datum.
    lv_new_sync_at = sy-timlo.

    IF NOT gt_sy_sync_metrics[] IS INITIAL.

      READ TABLE gt_sy_sync_metrics INDEX 1 INTO ls_sy_sync.
      IF sy-subrc = 0 AND NOT ls_sy_sync-sync_id IS INITIAL.

        CALL METHOD zcl_nept_qz_data_provider=>read_available_metrics
          IMPORTING
            et_db_tests_key = lt_db_tests_key.

        LOOP AT lt_db_tests_key INTO ls_db_tests_key.
          READ TABLE gt_sy_sync_metrics WITH KEY test_id   = ls_db_tests_key-test_id
                                                 upload_on = ls_db_tests_key-upload_on
                                                 upload_at = ls_db_tests_key-upload_at TRANSPORTING NO FIELDS.
          IF sy-subrc = 0.
            CONTINUE.
          ENDIF.

          CLEAR ls_sy_sync.
          MOVE-CORRESPONDING ls_db_tests_key TO ls_sy_sync.
          APPEND ls_sy_sync TO gt_sy_sync_metrics.

          CLEAR ls_db_tests_key.
        ENDLOOP.
      ENDIF.

      LOOP AT gt_sy_sync_metrics INTO ls_sy_sync.

        LOOP AT gt_sy_metrics INTO ls_sy_metrics WHERE sync_id = ls_sy_sync-sync_id.
          CLEAR ls_db_metrics.
          MOVE-CORRESPONDING ls_sy_metrics TO ls_db_metrics.
          APPEND ls_db_metrics TO lt_db_metrics.
          CLEAR ls_sy_metrics.
        ENDLOOP.

        MOVE-CORRESPONDING ls_sy_sync TO ls_db_tests_key.

        CALL METHOD zcl_nept_qz_data_provider=>sync_metrics
          EXPORTING
            iv_old_sync_on  = ls_sy_sync-sync_on
            iv_old_sync_at  = ls_sy_sync-sync_at
            iv_new_sync_on  = lv_new_sync_on
            iv_new_sync_at  = lv_new_sync_at
            is_db_tests_key = ls_db_tests_key
            it_db_metrics   = lt_db_metrics
          IMPORTING
            et_db_metrics   = lt_db_metrics
            ev_db_error     = gv_db_error
            ev_do_commit    = gv_do_commit.

        IF NOT gv_db_error IS INITIAL.
          EXIT.
        ENDIF.

        IF NOT lt_db_metrics IS INITIAL.
          LOOP AT lt_db_metrics INTO ls_db_metrics.
            IF sy-tabix = 1.
              ls_sy_sync-sync_id = ls_db_metrics-sync_id.
              ls_sy_sync-sync_on = lv_new_sync_on.
              ls_sy_sync-sync_at = lv_new_sync_at.
              APPEND ls_sy_sync TO lt_sy_sync_metrics.
            ENDIF.
            MOVE-CORRESPONDING ls_db_metrics TO ls_sy_metrics.
            APPEND ls_sy_metrics TO lt_sy_metrics.
            CLEAR ls_db_metrics.
          ENDLOOP.
        ENDIF.

        REFRESH lt_db_metrics.
        CLEAR ls_sy_sync.
      ENDLOOP.

    ENDIF.

    IF NOT gt_sy_sync_bookmarks[] IS INITIAL AND gv_db_error IS INITIAL.

      LOOP AT gt_sy_sync_bookmarks INTO ls_sy_sync.

        LOOP AT gt_sy_bookmarks INTO ls_sy_bookmarks WHERE sync_id = ls_sy_sync-sync_id.
          CLEAR ls_db_bookmarks.
          MOVE-CORRESPONDING ls_sy_bookmarks TO ls_db_bookmarks.
          APPEND ls_db_bookmarks TO lt_db_bookmarks.
          CLEAR ls_sy_bookmarks.
        ENDLOOP.

        MOVE-CORRESPONDING ls_sy_sync TO ls_db_tests_key.

        CALL METHOD zcl_nept_qz_data_provider=>sync_bookmarks
          EXPORTING
            iv_old_sync_on  = ls_sy_sync-sync_on
            iv_old_sync_at  = ls_sy_sync-sync_at
            iv_new_sync_on  = lv_new_sync_on
            iv_new_sync_at  = lv_new_sync_at
            is_db_tests_key = ls_db_tests_key
            it_db_bookmarks = lt_db_bookmarks
          IMPORTING
            et_db_bookmarks = lt_db_bookmarks
            ev_db_error     = gv_db_error
            ev_do_commit    = gv_do_commit.

        IF NOT gv_db_error IS INITIAL.
          EXIT.
        ENDIF.

        IF NOT lt_db_bookmarks IS INITIAL.
          LOOP AT lt_db_bookmarks INTO ls_db_bookmarks.
            IF sy-tabix = 1.
              ls_sy_sync-sync_id = ls_db_bookmarks-test_id.
              ls_sy_sync-sync_on = lv_new_sync_on.
              ls_sy_sync-sync_at = lv_new_sync_at.
              APPEND ls_sy_sync TO lt_sy_sync_bookmarks.
            ENDIF.
            MOVE-CORRESPONDING ls_db_bookmarks TO ls_sy_bookmarks.
            ls_sy_bookmarks-sync_id = ls_db_bookmarks-test_id.
            APPEND ls_sy_bookmarks TO lt_sy_bookmarks.
            CLEAR ls_db_bookmarks.
          ENDLOOP.
        ENDIF.

        REFRESH lt_db_bookmarks.
        CLEAR ls_sy_sync.
      ENDLOOP.

    ENDIF.

    IF gv_db_error IS INITIAL.
      gt_sy_sync_metrics[] = lt_sy_sync_metrics[].
      gt_sy_metrics[] = lt_sy_metrics[].
      gt_sy_sync_bookmarks[] = lt_sy_sync_bookmarks[].
      gt_sy_bookmarks[] = lt_sy_bookmarks[].
    ELSE.
      REFRESH: gt_sy_sync_metrics, gt_sy_metrics, gt_sy_sync_bookmarks, gt_sy_bookmarks.
    ENDIF.

  ENDMETHOD.
ENDCLASS.
