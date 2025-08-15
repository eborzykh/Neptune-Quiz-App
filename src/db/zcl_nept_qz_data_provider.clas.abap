class ZCL_NEPT_QZ_DATA_PROVIDER definition
  public
  final
  create public .

public section.

  constants GC_PROGRESS_UNANSWERED type ZNEPT_QZ_PROGRESS_DE value '0' ##NO_TEXT.
  constants GC_PROGRESS_INCORRECT type ZNEPT_QZ_PROGRESS_DE value '1' ##NO_TEXT.
  constants GC_PROGRESS_IMPROVED_LOW type ZNEPT_QZ_PROGRESS_DE value '2' ##NO_TEXT.
  constants GC_PROGRESS_IMPROVED_MEDIUM type ZNEPT_QZ_PROGRESS_DE value '3' ##NO_TEXT.
  constants GC_PROGRESS_IMPROVED_HIGH type ZNEPT_QZ_PROGRESS_DE value '4' ##NO_TEXT.
  constants GC_PROGRESS_CORRECT type ZNEPT_QZ_PROGRESS_DE value '5' ##NO_TEXT.
  constants GC_BOOKMARK_UNMARKED type ZNEPT_QZ_BOOKMARK_DE value ' ' ##NO_TEXT.
  constants GC_BOOKMARK_BOOKMARKED type ZNEPT_QZ_BOOKMARK_DE value 'X' ##NO_TEXT.
  constants GC_SYNC_DATE_INITIAL type ZNEPT_QZ_SYNC_DATE_DE value '00000000' ##NO_TEXT.
  constants GC_SYNC_TIME_INITIAL type ZNEPT_QZ_SYNC_TIME_DE value '000000' ##NO_TEXT.
  constants GC_SYNC_DATE_FINAL type ZNEPT_QZ_SYNC_DATE_DE value '99991231' ##NO_TEXT.
  constants GC_QUIZ_PUBLISHED type ZNEPT_QZ_PUBLISHED_DE value 'X' ##NO_TEXT.
  constants GC_QUIZ_PRIVATE type ZNEPT_QZ_PUBLISHED_DE value ' ' ##NO_TEXT.

  class-methods READ_AVAILABLE_METRICS
    exporting
      !ET_DB_TESTS_KEY type ZNEPT_QZ_DB_TESTS_KEY_T .
  class-methods READ_AVAILABLE_TEST
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
      !ES_DB_TESTS type ZNEPT_QZ_DB_TESTS_S
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
      !IV_VERSION type ZNEPT_QZ_COUNT_VERSION_DE
    exporting
      !EV_VERSION type ZNEPT_QZ_COUNT_VERSION_DE
      !ET_DB_PARTS type ZNEPT_QZ_DB_PARTS_T
      !ET_DB_QUESTIONS type ZNEPT_QZ_DB_QUESTIONS_T
      !ET_DB_VARIANTS type ZNEPT_QZ_DB_VARIANTS_T
      !ET_DB_CHECK type ZNEPT_QZ_DB_CHECK_T
      !EV_DB_ERROR type ABAP_BOOL .
  class-methods CHECK .
  class-methods SYNC_BOOKMARKS
    importing
      value(IV_OLD_SYNC_ON) type ZNEPT_QZ_SYNC_DATE_DE
      value(IV_OLD_SYNC_AT) type ZNEPT_QZ_SYNC_TIME_DE
      value(IV_NEW_SYNC_ON) type ZNEPT_QZ_SYNC_DATE_DE
      value(IV_NEW_SYNC_AT) type ZNEPT_QZ_SYNC_TIME_DE
      value(IS_DB_TESTS_KEY) type ZNEPT_QZ_DB_TESTS_KEY_S
      value(IT_DB_BOOKMARKS) type ZNEPT_QZ_DB_BOOKMARKS_T
    exporting
      !ET_DB_BOOKMARKS type ZNEPT_QZ_DB_BOOKMARKS_T
      !EV_DB_ERROR type ABAP_BOOL
      !EV_DO_COMMIT type ABAP_BOOL .
  class-methods SYNC_METRICS
    importing
      value(IV_OLD_SYNC_ON) type ZNEPT_QZ_SYNC_DATE_DE
      value(IV_OLD_SYNC_AT) type ZNEPT_QZ_SYNC_TIME_DE
      value(IV_NEW_SYNC_ON) type ZNEPT_QZ_SYNC_DATE_DE
      value(IV_NEW_SYNC_AT) type ZNEPT_QZ_SYNC_TIME_DE
      value(IS_DB_TESTS_KEY) type ZNEPT_QZ_DB_TESTS_KEY_S
      value(IT_DB_METRICS) type ZNEPT_QZ_DB_METRICS_T
    exporting
      !ET_DB_METRICS type ZNEPT_QZ_DB_METRICS_T
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


  METHOD add.

    DATA: ls_db_tests     TYPE znept_qz_db_tests_s,
          lt_db_parts     TYPE znept_qz_db_parts_t,
          lt_db_questions TYPE znept_qz_db_questions_t,
          lt_db_variants  TYPE znept_qz_db_variants_t.

    CLEAR: ev_db_error, ev_do_commit.

    CLEAR es_db_tests.

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

    LOOP AT lt_db_parts ASSIGNING FIELD-SYMBOL(<fs_db_parts>).
      <fs_db_parts>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    LOOP AT lt_db_questions ASSIGNING FIELD-SYMBOL(<fs_db_questions>).
      <fs_db_questions>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    LOOP AT lt_db_variants ASSIGNING FIELD-SYMBOL(<fs_db_variants>).
      <fs_db_variants>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    INSERT znept_qz_tst FROM ls_db_tests.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ELSE.
      ev_do_commit = abap_true.
    ENDIF.

    INSERT znept_qz_prt FROM TABLE lt_db_parts.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ELSE.
      ev_do_commit = abap_true.
    ENDIF.

    INSERT znept_qz_qst FROM TABLE lt_db_questions.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ELSE.
      ev_do_commit = abap_true.
    ENDIF.

    INSERT znept_qz_var FROM TABLE lt_db_variants.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ELSE.
      ev_do_commit = abap_true.
    ENDIF.

    es_db_tests = ls_db_tests.

  ENDMETHOD.


  METHOD delete.

    DATA: lv_test_id    TYPE znept_qz_test_id_de.

    CLEAR: ev_db_error, ev_do_commit.

    IF key_check( is_db_tests_key ) = abap_true.

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

        DELETE FROM znept_qz_bmr WHERE test_id = lv_test_id.

        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ENDIF.

      ENDIF.

    ENDIF.

  ENDMETHOD.


  METHOD get.

    DATA: lv_test_id      TYPE znept_qz_test_id_de,
          lv_version      TYPE znept_qz_count_version_de,
          lt_db_parts     TYPE znept_qz_db_parts_t,
          lt_db_questions TYPE znept_qz_db_questions_t,
          lt_db_variants  TYPE znept_qz_db_variants_t,
          lt_db_check     TYPE znept_qz_db_check_t,
          ls_db_questions TYPE znept_qz_db_questions_s,
          ls_db_variants  TYPE znept_qz_db_variants_s,
          ls_db_parts     TYPE znept_qz_db_parts_s,
          ls_db_check     TYPE znept_qz_db_check_s.

    CLEAR: ev_db_error.

    REFRESH: et_db_parts, et_db_questions, et_db_variants, et_db_check.

*TODO version constants -1 -2 move to NEPT class

    IF key_check( is_db_tests_key ) = abap_false.

* if we are in "SHORT SYNC" we are expecting this data
* it has been deleted

      IF iv_version = -1.
        ev_db_error = abap_true.
      ENDIF.

      RETURN.
    ENDIF.

    IF iv_version = -1 OR iv_version >= 0.

      SELECT SINGLE test_id version FROM znept_qz_tst INTO ( lv_test_id, lv_version )
        WHERE test_id = is_db_tests_key-test_id
          AND ( published = gc_quiz_published OR upload_by = sy-uname ).

      IF sy-subrc = 0.

        IF lv_version > iv_version.

* reading order Variants -> Questions -> Parts prevents inconsistencies

          SELECT * FROM znept_qz_var INTO TABLE lt_db_variants
            WHERE test_id = lv_test_id.

          IF sy-subrc = 0.
            SORT lt_db_variants BY test_id question_id variant_id.
          ENDIF.

          SELECT * FROM znept_qz_qst INTO TABLE lt_db_questions
            WHERE test_id = lv_test_id.

          IF sy-subrc = 0.
            SORT lt_db_questions BY test_id part_id question_id.

            LOOP AT lt_db_questions INTO ls_db_questions.
              READ TABLE lt_db_variants WITH KEY test_id = ls_db_questions-test_id
                                                 question_id = ls_db_questions-question_id TRANSPORTING NO FIELDS.
              IF sy-subrc <> 0.
                DELETE lt_db_questions.
              ENDIF.
            ENDLOOP.

            LOOP AT lt_db_variants INTO ls_db_variants.
              READ TABLE lt_db_questions WITH KEY test_id = ls_db_variants-test_id
                                                  question_id = ls_db_variants-question_id TRANSPORTING NO FIELDS.
              IF sy-subrc <> 0.
                ev_db_error = abap_true.
                RETURN.
              ENDIF.
            ENDLOOP.
          ENDIF.

          SELECT * FROM znept_qz_prt INTO TABLE lt_db_parts
            WHERE test_id = lv_test_id.

          IF sy-subrc = 0.
            SORT lt_db_parts BY test_id part_id.

            LOOP AT lt_db_parts INTO ls_db_parts.
              READ TABLE lt_db_questions WITH KEY test_id = ls_db_parts-test_id
                                                  part_id = ls_db_parts-part_id TRANSPORTING NO FIELDS.
              IF sy-subrc <> 0.
                DELETE lt_db_parts.
              ENDIF.
            ENDLOOP.

            LOOP AT lt_db_questions INTO ls_db_questions.
              READ TABLE lt_db_parts WITH KEY test_id = ls_db_questions-test_id
                                              part_id = ls_db_questions-part_id TRANSPORTING NO FIELDS.
              IF sy-subrc <> 0.
                ev_db_error = abap_true.
                RETURN.
              ENDIF.
            ENDLOOP.
          ENDIF.

* collect checks to remove deleted items on the client

          IF iv_version <> -1.
* reading delta if not the first sync

            LOOP AT lt_db_questions INTO ls_db_questions.
              CLEAR ls_db_check.
              ls_db_check-test_id = ls_db_questions-test_id.
              ls_db_check-question_id = ls_db_questions-question_id.
              ls_db_check-part_id = ls_db_questions-part_id.

              LOOP AT lt_db_variants INTO ls_db_variants WHERE question_id = ls_db_questions-question_id.
                ls_db_check-variant_id = ls_db_variants-variant_id.
                APPEND ls_db_check TO lt_db_check.
              ENDLOOP.
            ENDLOOP.

*            LOOP AT lt_db_questions INTO ls_db_questions.
*              CLEAR ls_db_check.
*              ls_db_check-test_id = ls_db_questions-test_id.
*              ls_db_check-question_id = ls_db_questions-question_id.
*              ls_db_check-part_id = ls_db_questions-part_id.
*
*              CLEAR ls_db_check-variant_id_low.
*              CLEAR ls_db_check-variant_id_high.
*
*              LOOP AT lt_db_variants INTO ls_db_variants WHERE question_id = ls_db_questions-question_id.
*
*                IF ls_db_check-variant_id_low IS INITIAL.
*                  ls_db_check-variant_id_low = ls_db_variants-variant_id.
*                  ls_db_check-variant_id_high = ls_db_variants-variant_id.
*                  CONTINUE.
*                ENDIF.
*
*                ls_db_check-variant_id_high = ls_db_check-variant_id_high + 1.
*
*                IF ls_db_check-variant_id_high = ls_db_variants-variant_id.
*                  CONTINUE.
*                ELSE.
*                  ls_db_check-variant_id_high = ls_db_check-variant_id_high - 1.
*
*                  APPEND ls_db_check TO lt_db_check.
*                  CLEAR ls_db_check-variant_id_low.
*                  CLEAR ls_db_check-variant_id_high.
*                ENDIF.
*              ENDLOOP.
*
*              APPEND ls_db_check TO lt_db_check.
*              CLEAR ls_db_check-variant_id_low.
*              CLEAR ls_db_check-variant_id_high.
*            ENDLOOP.

            et_db_check[] = lt_db_check[].
          ENDIF.

* trim inconsistencies free content by requested version

          DELETE lt_db_parts WHERE version LE iv_version.
          DELETE lt_db_questions WHERE version LE iv_version.
          DELETE lt_db_variants WHERE version LE iv_version.

          et_db_parts[] = lt_db_parts[].
          et_db_questions[] = lt_db_questions[].
          et_db_variants[] = lt_db_variants[].

        ENDIF.

        ev_version = lv_version.
      ELSE.

* if we are in "SHORT SYNC" we are expecting this data
* it has been made private

        IF iv_version = -1.
          ev_db_error = abap_true.
        ENDIF.
      ENDIF.

    ENDIF.

  ENDMETHOD.


  METHOD info.

    DATA: lv_test_id         TYPE znept_qz_test_id_de,
          lv_total_parts     TYPE i,
          lv_total_questions TYPE i.

    CLEAR: ev_total_parts, ev_total_questions.

    IF key_check( is_db_tests_key ) = abap_true.

      SELECT SINGLE test_id FROM znept_qz_tst INTO lv_test_id
        WHERE test_id = is_db_tests_key-test_id
          AND ( published = gc_quiz_published OR upload_by = sy-uname ).

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


  METHOD key_check.

    DATA: test_id_dummy   TYPE znept_qz_test_id_de,
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


  METHOD publish.

    DATA: lv_published TYPE znept_qz_published_de.

    CLEAR: ev_db_error, ev_do_commit.

    IF key_check( is_db_tests_key ) = abap_true.

      SELECT SINGLE published FROM znept_qz_tst
        INTO lv_published
        WHERE test_id   = is_db_tests_key-test_id
          AND upload_by = sy-uname.

      IF sy-subrc = 0 AND lv_published <> iv_published.

        UPDATE znept_qz_tst
          SET published = iv_published
          WHERE test_id = is_db_tests_key-test_id.

        IF sy-subrc = 0.
          ev_do_commit = abap_true.
        ELSE.
          ev_db_error = abap_true.
        ENDIF.

      ELSE.
        ev_db_error = abap_true.
      ENDIF.

    ELSE.
      ev_db_error = abap_true.
    ENDIF.

  ENDMETHOD.


  METHOD rename.

    DATA: lv_test_id     TYPE znept_qz_test_id_de,
          lv_description TYPE znept_qz_test_name_de.

    CLEAR: ev_db_error, ev_do_commit.

    IF iv_description IS INITIAL.
      RETURN.
    ENDIF.

    IF key_check( is_db_tests_key ) = abap_true.

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


  METHOD read_available_test.

    DATA: lt_db_tests TYPE znept_qz_db_tests_t.

    REFRESH et_db_tests[].

    SELECT * FROM znept_qz_tst INTO TABLE lt_db_tests
      WHERE upload_by = sy-uname
         OR published = gc_quiz_published.

    IF sy-subrc = 0.
      et_db_tests[] = lt_db_tests[].
    ENDIF.

  ENDMETHOD.


  METHOD read_available_metrics.

    DATA: lt_db_sync TYPE znept_qz_db_sync_t.

    REFRESH et_db_tests_key[].

    SELECT * FROM znept_qz_mts INTO TABLE lt_db_sync
      WHERE sync_by = sy-uname.

    IF sy-subrc = 0.
      MOVE-CORRESPONDING lt_db_sync[] TO et_db_tests_key[].
    ENDIF.

  ENDMETHOD.


  METHOD sync_bookmarks.

    DATA: ls_db_tests     TYPE znept_qz_db_tests_s,
          ls_db_bookmarks TYPE znept_qz_db_bookmarks_s,
          lt_db_bookmarks TYPE znept_qz_db_bookmarks_t.

    CLEAR: ev_db_error, ev_do_commit.

    REFRESH et_db_bookmarks.

    SELECT SINGLE * FROM znept_qz_tst INTO ls_db_tests
      WHERE test_id   = is_db_tests_key-test_id
        AND upload_on = is_db_tests_key-upload_on
        AND upload_at = is_db_tests_key-upload_at.

    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    SELECT * FROM znept_qz_bmr INTO TABLE lt_db_bookmarks
      WHERE sync_by = sy-uname
        AND test_id = ls_db_tests-test_id
        AND ( sync_on > iv_old_sync_on OR
              sync_on = iv_old_sync_on AND sync_at > iv_old_sync_at ).

    IF sy-subrc = 0.
      et_db_bookmarks[] = lt_db_bookmarks[].
    ENDIF.

    IF NOT it_db_bookmarks[] IS INITIAL.

      REFRESH lt_db_bookmarks.
      LOOP AT it_db_bookmarks INTO ls_db_bookmarks.
        ls_db_bookmarks-sync_by = sy-uname.
        ls_db_bookmarks-test_id = ls_db_tests-test_id.
        ls_db_bookmarks-sync_on = iv_new_sync_on.
        ls_db_bookmarks-sync_at = iv_new_sync_at.
        APPEND ls_db_bookmarks TO lt_db_bookmarks.
        CLEAR ls_db_bookmarks.
      ENDLOOP.

      MODIFY znept_qz_bmr FROM TABLE lt_db_bookmarks.

      IF sy-subrc <> 0.
        ev_db_error = abap_true.
        RETURN.
      ENDIF.

      ev_do_commit = abap_true.

    ENDIF.

  ENDMETHOD.


  METHOD sync_metrics.

    DATA: ls_db_sync     TYPE znept_qz_db_sync_s,
          ls_db_metrics  TYPE znept_qz_db_metrics_s,
          lt_db_metrics  TYPE znept_qz_db_metrics_t.

    CLEAR: ev_db_error, ev_do_commit.

    REFRESH et_db_metrics.

    SELECT SINGLE * FROM znept_qz_mts INTO ls_db_sync
      WHERE sync_by   = sy-uname
        AND test_id   = is_db_tests_key-test_id
        AND upload_on = is_db_tests_key-upload_on
        AND upload_at = is_db_tests_key-upload_at.

    IF sy-subrc = 0.

      IF NOT it_db_metrics[] IS INITIAL.
* select and delete Unanswered activities from the DB if we are replacing them with the latest data

        SELECT * FROM znept_qz_mtd INTO TABLE lt_db_metrics
          FOR ALL ENTRIES IN it_db_metrics
          WHERE sync_id     = ls_db_sync-sync_id
            AND question_id = it_db_metrics-question_id
            AND progress    = gc_progress_unanswered
            AND ( active_on < it_db_metrics-active_on OR
                  active_on = it_db_metrics-active_on AND active_at < it_db_metrics-active_at ).

        IF sy-subrc = 0.
          DELETE znept_qz_mtd FROM TABLE lt_db_metrics.

          IF sy-subrc <> 0.
            ev_db_error = abap_true.
            RETURN.
          ENDIF.
        ENDIF.

      ENDIF.

      SELECT * FROM znept_qz_mtd INTO TABLE lt_db_metrics
        WHERE sync_id = ls_db_sync-sync_id
          AND ( sync_on > iv_old_sync_on OR
                sync_on = iv_old_sync_on AND sync_at > iv_old_sync_at ).

      IF sy-subrc = 0.
        et_db_metrics[] = lt_db_metrics[].
      ENDIF.

    ELSE.

      MOVE-CORRESPONDING is_db_tests_key TO ls_db_sync.

      DO.
        ls_db_sync-sync_id = ls_db_sync-sync_id + 1.

        SELECT sync_id UP TO 1 ROWS
          FROM znept_qz_mts INTO ls_db_sync-sync_id
          WHERE sync_id = ls_db_sync-sync_id.
        ENDSELECT.

        IF sy-subrc <> 0.
          EXIT.
        ENDIF.
      ENDDO.

      ls_db_sync-sync_by = sy-uname.

      MODIFY znept_qz_mts FROM ls_db_sync.

      IF sy-subrc <> 0.
        ev_db_error = abap_true.
        RETURN.
      ENDIF.

    ENDIF.

    IF NOT it_db_metrics[] IS INITIAL.

      REFRESH lt_db_metrics.
      LOOP AT it_db_metrics INTO ls_db_metrics.
        ls_db_metrics-sync_id = ls_db_sync-sync_id.
        ls_db_metrics-sync_on = iv_new_sync_on.
        ls_db_metrics-sync_at = iv_new_sync_at.
        APPEND ls_db_metrics TO lt_db_metrics.
        CLEAR ls_db_metrics.
      ENDLOOP.

      MODIFY znept_qz_mtd FROM TABLE lt_db_metrics.

      IF sy-subrc <> 0.
        ev_db_error = abap_true.
        RETURN.
      ENDIF.

    ENDIF.

    ev_do_commit = abap_true.

  ENDMETHOD.


  METHOD check.
  ENDMETHOD.
ENDCLASS.
