class ZCL_NEPT_QZ_DATA_PROVIDER definition
  public
  final
  create public .

public section.

  class-methods REFRESH
    exporting
      !ET_DB_TESTS type ZNEPT_QZ_DB_TESTS_T .
  class-methods PUBLISH
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
      !IV_PUBLISHED type ZNEPT_QZ_PUBLISHED_DE
    exporting
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods DELETE
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
    exporting
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods ADD
    importing
      !IV_DESCRIPTION type ZNEPT_QZ_TEST_NAME_DE
      !IV_PUBLISHED type ZNEPT_QZ_PUBLISHED_DE
      !IT_DB_PARTS type ZNEPT_QZ_DB_PARTS_T
      !IT_DB_QUESTIONS type ZNEPT_QZ_DB_QUESTIONS_T
      !IT_DB_VARIANTS type ZNEPT_QZ_DB_VARIANTS_T
    exporting
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods RENAME
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
      !IV_DESCRIPTION type ZNEPT_QZ_TEST_NAME_DE
    exporting
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods GET
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
    exporting
      !ET_DB_PARTS type ZNEPT_QZ_DB_PARTS_T
      !ET_DB_QUESTIONS type ZNEPT_QZ_DB_QUESTIONS_T
      !ET_DB_VARIANTS type ZNEPT_QZ_DB_VARIANTS_T
      !EV_DB_ERROR type ABAP_BOOL .
  class-methods SYNC_METRICS
    importing
      value(IS_DB_SYNC) type ZNEPT_QZ_DB_SYNC_S
      value(IT_DB_METRICS) type ZNEPT_QZ_DB_METRICS_T
    exporting
      !ES_DB_SYNC type ZNEPT_QZ_DB_SYNC_S
      !ET_DB_METRICS type ZNEPT_QZ_DB_METRICS_T
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods RESET_METRICS
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
    exporting
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods INFO
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
    exporting
      !EV_TOTAL_PARTS type INT2
      !EV_TOTAL_QUESTIONS type INT2 .
protected section.
private section.

  class-methods KEY_CHECK
    importing
      !IS_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_S
    returning
      value(RV_RESULT) type ABAP_BOOL .
ENDCLASS.



CLASS ZCL_NEPT_QZ_DATA_PROVIDER IMPLEMENTATION.


  METHOD ADD.

    DATA:
      ls_db_tests     TYPE znept_qz_db_tests_s,
      lt_db_parts     TYPE znept_qz_db_parts_t,
      lt_db_questions TYPE znept_qz_db_questions_t,
      lt_db_variants  TYPE znept_qz_db_variants_t.

    FIELD-SYMBOLS:
      <fs_db_parts>     TYPE znept_qz_db_parts_s,
      <fs_db_questions> TYPE znept_qz_db_questions_s,
      <fs_db_variants>  TYPE znept_qz_db_variants_s.

    CLEAR: ev_db_error, ev_do_commit.

    CHECK NOT it_db_questions[] IS INITIAL.

    lt_db_parts[] = it_db_parts[].
    lt_db_questions[] = it_db_questions[].
    lt_db_variants[] = it_db_variants[].

    DO.
      ls_db_tests-test_id = ls_db_tests-test_id + 1.
      SELECT test_id UP TO 1 ROWS FROM znept_qz_tst INTO ls_db_tests-test_id
        WHERE test_id = ls_db_tests-test_id.
      ENDSELECT.
      IF sy-subrc <> 0.
        EXIT.
      ENDIF.
    ENDDO.

    ls_db_tests-upload_on = sy-datum.
    ls_db_tests-upload_at = sy-uzeit.
    ls_db_tests-upload_by = sy-uname.
    ls_db_tests-description = iv_description.
    ls_db_tests-published = iv_published.

    LOOP AT lt_db_parts ASSIGNING <fs_db_parts>.
      <fs_db_parts>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    LOOP AT lt_db_questions ASSIGNING <fs_db_questions>.
      <fs_db_questions>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    LOOP AT lt_db_variants ASSIGNING <fs_db_variants>.
      <fs_db_variants>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    INSERT znept_qz_tst FROM ls_db_tests.
    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.

    INSERT znept_qz_prt FROM TABLE lt_db_parts.
    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.

    INSERT znept_qz_qst FROM TABLE lt_db_questions.
    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.

    INSERT znept_qz_var FROM TABLE lt_db_variants.
    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.

    ev_do_commit = abap_true.

  ENDMETHOD.


  METHOD DELETE.

    DATA:
      lv_test_id TYPE znept_qz_test_id_de,
      lv_sync_id TYPE znept_qz_sync_id_de.

    CLEAR: ev_db_error, ev_do_commit.

    IF key_check( is_db_tests_key ) = abap_true. " check for call from CDS

      SELECT SINGLE test_id FROM znept_qz_tst INTO lv_test_id
        WHERE test_id   = is_db_tests_key-test_id
          AND upload_by = sy-uname.

      IF sy-subrc = 0.

        DELETE FROM znept_qz_tst WHERE test_id = lv_test_id.
        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

        DELETE FROM znept_qz_prt WHERE test_id = lv_test_id.
        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

        DELETE FROM znept_qz_qst WHERE test_id = lv_test_id.
        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

        DELETE FROM znept_qz_var WHERE test_id = lv_test_id.
        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

      ENDIF.

      SELECT SINGLE sync_id FROM znept_qz_mts INTO lv_sync_id
        WHERE sync_by   = sy-uname
          AND test_id   = is_db_tests_key-test_id
          AND upload_on = is_db_tests_key-upload_on
          AND upload_at = is_db_tests_key-upload_at.

      IF sy-subrc = 0.

        DELETE FROM znept_qz_mts WHERE sync_by   = sy-uname
                                   AND test_id   = is_db_tests_key-test_id
                                   AND upload_on = is_db_tests_key-upload_on
                                   AND upload_at = is_db_tests_key-upload_at.
        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

        DELETE FROM znept_qz_mtd WHERE sync_id = lv_sync_id
                                   AND sync_by = sy-uname.
        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

      ENDIF.
    ENDIF.

  ENDMETHOD.


  METHOD GET.

    DATA:
      lv_test_id      TYPE znept_qz_test_id_de,
      lt_db_parts     TYPE znept_qz_db_parts_t,
      lt_db_questions TYPE znept_qz_db_questions_t,
      lt_db_variants  TYPE znept_qz_db_variants_t.

    CLEAR: ev_db_error, et_db_parts[], et_db_questions[], et_db_variants[].

    IF key_check( is_db_tests_key ) = abap_true. " check for call from CDS

      SELECT SINGLE test_id FROM znept_qz_tst INTO lv_test_id
        WHERE test_id   = is_db_tests_key-test_id
          AND ( published = 'X' OR upload_by = sy-uname ).

      IF sy-subrc = 0.

        SELECT * FROM znept_qz_prt INTO TABLE lt_db_parts
          WHERE test_id = lv_test_id.

        IF sy-subrc = 0.
          SORT lt_db_parts BY test_id part_id.
        ENDIF.

        SELECT * FROM znept_qz_qst INTO TABLE lt_db_questions
          WHERE test_id = lv_test_id.

        IF sy-subrc = 0.
          SORT lt_db_questions BY test_id part_id question_id.
        ENDIF.

        SELECT * FROM znept_qz_var INTO TABLE lt_db_variants
          WHERE test_id = lv_test_id.

        IF sy-subrc = 0.
          SORT lt_db_variants BY test_id part_id question_id variant_id.
        ENDIF.

        et_db_parts[] = lt_db_parts[].
        et_db_questions[] = lt_db_questions[].
        et_db_variants[] = lt_db_variants[].

      ELSE.
        ev_db_error = abap_true.
      ENDIF.

    ELSE.
      ev_db_error = abap_true.
    ENDIF.

  ENDMETHOD.


  METHOD INFO.

    DATA:
      lv_test_id         TYPE znept_qz_test_id_de,
      lv_total_parts     TYPE i,
      lv_total_questions TYPE i.

    CLEAR: ev_total_parts, ev_total_questions.

    IF key_check( is_db_tests_key ) = abap_true. " check for call from CDS

      SELECT SINGLE test_id FROM znept_qz_tst INTO lv_test_id
        WHERE test_id = is_db_tests_key-test_id
          AND ( published = 'X' OR upload_by = sy-uname ).

      IF sy-subrc = 0.

        SELECT COUNT( * ) INTO lv_total_parts FROM znept_qz_prt
          WHERE test_id = lv_test_id.

        IF sy-subrc = 0.
          ev_total_parts = lv_total_parts.
        ENDIF.

        SELECT COUNT( * ) INTO lv_total_questions FROM znept_qz_qst
          WHERE test_id = lv_test_id.

        IF sy-subrc = 0.
          ev_total_questions = lv_total_questions.
        ENDIF.

      ENDIF.

    ENDIF.

  ENDMETHOD.


  METHOD KEY_CHECK.

    DATA:
      test_id_dummy   TYPE znept_qz_test_id_de,
      lt_upload_on_ra TYPE RANGE OF znept_qz_upload_date_de,
      lt_upload_at_ra TYPE RANGE OF znept_qz_upload_time_de.

    CLEAR rv_result.

    IF NOT is_db_tests_key-upload_on IS INITIAL AND NOT is_db_tests_key-upload_at IS INITIAL.
      lt_upload_on_ra = VALUE #( sign = 'I' option = 'EQ' ( low = is_db_tests_key-upload_on ) ).
      lt_upload_at_ra = VALUE #( sign = 'I' option = 'EQ' ( low = is_db_tests_key-upload_at ) ).
    ENDIF.

    SELECT SINGLE test_id FROM znept_qz_tst
      INTO test_id_dummy
      WHERE test_id = is_db_tests_key-test_id
        AND upload_on IN lt_upload_on_ra
        AND upload_at IN lt_upload_at_ra.

    IF sy-subrc = 0.

      rv_result = abap_true.

    ENDIF.

  ENDMETHOD.


  METHOD PUBLISH.

    DATA:
      lv_published TYPE znept_qz_published_de.

    CLEAR: ev_db_error, ev_do_commit.

    IF key_check( is_db_tests_key ) = abap_true. " check for call from CDS

      SELECT SINGLE published FROM znept_qz_tst
        INTO lv_published
        WHERE test_id   = is_db_tests_key-test_id
          AND upload_by = sy-uname.

      IF sy-subrc = 0 AND lv_published <> iv_published.

        UPDATE znept_qz_tst
          SET published = iv_published
          WHERE test_id = is_db_tests_key-test_id.

        IF sy-subrc <> 0.
          ev_db_error = abap_true.
        ENDIF.

        ev_do_commit = abap_true.

      ELSE.
        ev_db_error = abap_true.
      ENDIF.

    ELSE.
      ev_db_error = abap_true.
    ENDIF.

  ENDMETHOD.


  METHOD REFRESH.

    DATA:
      lt_db_tests TYPE znept_qz_db_tests_t.

    CLEAR et_db_tests[].

    SELECT * FROM znept_qz_tst INTO TABLE lt_db_tests
      WHERE upload_by = sy-uname
         OR published = 'X'.

    IF sy-subrc = 0.

      et_db_tests[] = lt_db_tests[].

    ENDIF.

  ENDMETHOD.


  METHOD RENAME.

    DATA:
      lv_test_id     TYPE znept_qz_test_id_de,
      lv_description TYPE znept_qz_test_name_de.

    CLEAR: ev_db_error, ev_do_commit.

    IF iv_description IS INITIAL.
      RETURN.
    ENDIF.

    IF key_check( is_db_tests_key ) = abap_true. " check for call from CDS

      SELECT SINGLE test_id description INTO ( lv_test_id, lv_description )
        FROM znept_qz_tst
        WHERE upload_by = sy-uname
          AND test_id   = is_db_tests_key-test_id.

      IF sy-subrc = 0 AND lv_description <> iv_description.

        UPDATE znept_qz_tst
          SET   description = iv_description
          WHERE test_id     = lv_test_id.

        IF sy-subrc <> 0.
          ev_db_error = abap_true.
        ENDIF.

        ev_do_commit = abap_true.

      ELSE.
        ev_db_error = abap_true.
      ENDIF.

    ELSE.
      ev_db_error = abap_true.
    ENDIF.

  ENDMETHOD.


  METHOD RESET_METRICS.

    DATA:
      lv_sync_id TYPE znept_qz_sync_id_de.

    CLEAR: ev_db_error, ev_do_commit.

    SELECT SINGLE sync_id FROM znept_qz_mts INTO lv_sync_id
      WHERE sync_by   = sy-uname
        AND test_id   = is_db_tests_key-test_id
        AND upload_on = is_db_tests_key-upload_on
        AND upload_at = is_db_tests_key-upload_at.

    IF sy-subrc = 0.

      DELETE FROM znept_qz_mtd WHERE sync_by = sy-uname
                               AND sync_id = lv_sync_id.
      IF sy-subrc = 0.
        ev_do_commit = abap_true.
      ENDIF.

    ENDIF.

  ENDMETHOD.


  METHOD SYNC_METRICS.

    DATA:
      ls_db_sync    TYPE znept_qz_db_sync_s,
      ls_db_metrics TYPE znept_qz_db_metrics_s,
      lt_db_metrics TYPE znept_qz_db_metrics_t.

    CLEAR: es_db_sync, et_db_metrics[], ev_db_error, ev_do_commit.

    SELECT SINGLE * FROM znept_qz_mts INTO ls_db_sync
      WHERE sync_by   = sy-uname
        AND upload_on = is_db_sync-upload_on
        AND upload_at = is_db_sync-upload_at
        AND test_id   = is_db_sync-test_id.

    IF sy-subrc <> 0.

      ls_db_sync = is_db_sync.

      CLEAR ls_db_sync-sync_id.

      DO.
        ls_db_sync-sync_id = ls_db_sync-sync_id + 1.

        SELECT sync_id UP TO 1 ROWS
          FROM znept_qz_mts INTO ls_db_sync-sync_id
          WHERE sync_by = sy-uname
            AND sync_id = ls_db_sync-sync_id.
        ENDSELECT.
        IF sy-subrc <> 0.
          EXIT.
        ENDIF.
      ENDDO.

    ENDIF.

    IF NOT it_db_metrics[] IS INITIAL.

      LOOP AT it_db_metrics INTO ls_db_metrics.
        ls_db_metrics-sync_id = ls_db_sync-sync_id.
        APPEND ls_db_metrics TO lt_db_metrics.
        CLEAR ls_db_metrics.
      ENDLOOP.

      MODIFY znept_qz_mtd FROM TABLE lt_db_metrics.

      IF sy-subrc <> 0.
        ev_db_error = abap_true.
        RETURN.
      ENDIF.

    ENDIF.

    IF NOT ( ls_db_sync-sync_on = is_db_sync-sync_on AND ls_db_sync-sync_at = is_db_sync-sync_at ).

      SELECT * FROM znept_qz_mtd INTO TABLE lt_db_metrics
        WHERE sync_by = sy-uname
          AND sync_id = ls_db_sync-sync_id.

      IF sy-subrc = 0.

        et_db_metrics[] = lt_db_metrics[].

      ELSE.

* send a dummy record to reset other devices
        CLEAR ls_db_metrics.
        ls_db_metrics-sync_by = sy-uname.
        ls_db_metrics-sync_id = ls_db_sync-sync_id.
        APPEND ls_db_metrics TO lt_db_metrics.

      ENDIF.

      et_db_metrics[] = lt_db_metrics[].

    ENDIF.

    ls_db_sync-sync_on = sy-datum.
    ls_db_sync-sync_at = sy-timlo.

    MODIFY znept_qz_mts FROM ls_db_sync.

    IF sy-subrc = 0.

      es_db_sync = ls_db_sync.

      ev_do_commit = abap_true.

    ELSE.

      ev_db_error = abap_true.

    ENDIF.

  ENDMETHOD.
ENDCLASS.
