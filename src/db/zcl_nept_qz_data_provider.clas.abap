CLASS zcl_nept_qz_data_provider DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    CONSTANTS gc_progress_unanswered TYPE znept_qz_progress_de VALUE '0' ##NO_TEXT.
    CONSTANTS gc_progress_incorrect TYPE znept_qz_progress_de VALUE '1' ##NO_TEXT.
    CONSTANTS gc_progress_improved_low TYPE znept_qz_progress_de VALUE '2' ##NO_TEXT.
    CONSTANTS gc_progress_improved_medium TYPE znept_qz_progress_de VALUE '3' ##NO_TEXT.
    CONSTANTS gc_progress_improved_high TYPE znept_qz_progress_de VALUE '4' ##NO_TEXT.
    CONSTANTS gc_progress_correct TYPE znept_qz_progress_de VALUE '5' ##NO_TEXT.
    CONSTANTS gc_bookmark_unmarked TYPE znept_qz_bookmark_de VALUE ' ' ##NO_TEXT.
    CONSTANTS gc_bookmark_bookmarked TYPE znept_qz_bookmark_de VALUE 'X' ##NO_TEXT.
    CONSTANTS gc_sync_date_initial TYPE znept_qz_sync_date_de VALUE '00000000' ##NO_TEXT.
    CONSTANTS gc_sync_time_initial TYPE znept_qz_sync_time_de VALUE '000000' ##NO_TEXT.
    CONSTANTS gc_sync_date_final TYPE znept_qz_sync_date_de VALUE '99991231' ##NO_TEXT.
    CONSTANTS gc_quiz_published TYPE znept_qz_published_de VALUE 'X' ##NO_TEXT.
    CONSTANTS gc_quiz_private TYPE znept_qz_published_de VALUE ' ' ##NO_TEXT.

    CLASS-METHODS read_available_metrics
      EXPORTING
        !et_db_tests_key TYPE znept_qz_db_tests_key_t .
    CLASS-METHODS read_available_test
      EXPORTING
        !et_db_tests TYPE znept_qz_db_tests_t .
    CLASS-METHODS publish
      IMPORTING
        !is_db_tests_key TYPE znept_qz_db_tests_key_s
        !iv_published    TYPE znept_qz_published_de
      EXPORTING
        !ev_db_error     TYPE abap_bool
        !ev_do_commit    TYPE abap_bool .
    CLASS-METHODS delete
      IMPORTING
        !is_db_tests_key TYPE znept_qz_db_tests_key_s
      EXPORTING
        !ev_db_error     TYPE abap_bool
        !ev_do_commit    TYPE abap_bool .
    CLASS-METHODS add
      IMPORTING
        !iv_test_id      TYPE znept_qz_test_id_de OPTIONAL
        !iv_description  TYPE znept_qz_test_name_de
        !iv_published    TYPE znept_qz_published_de
        !it_db_parts     TYPE znept_qz_db_parts_t
        !it_db_questions TYPE znept_qz_db_questions_t
        !it_db_variants  TYPE znept_qz_db_variants_t
      EXPORTING
        !es_db_tests     TYPE znept_qz_db_tests_s
        !ev_db_error     TYPE abap_bool
        !ev_do_commit    TYPE abap_bool .
    CLASS-METHODS rename
      IMPORTING
        !is_db_tests_key TYPE znept_qz_db_tests_key_s
        !iv_description  TYPE znept_qz_test_name_de
      EXPORTING
        !ev_db_error     TYPE abap_bool
        !ev_do_commit    TYPE abap_bool .
    CLASS-METHODS get
      IMPORTING
        !is_db_tests_key TYPE znept_qz_db_tests_key_s
        !iv_version      TYPE znept_qz_count_version_de
      EXPORTING
        !ev_version      TYPE znept_qz_count_version_de
        !et_db_parts     TYPE znept_qz_db_parts_t
        !et_db_questions TYPE znept_qz_db_questions_t
        !et_db_variants  TYPE znept_qz_db_variants_t
        !et_db_check     TYPE znept_qz_db_check_t
        !ev_db_error     TYPE abap_bool .
    CLASS-METHODS check .
    CLASS-METHODS sync_bookmarks
      IMPORTING
        VALUE(iv_old_sync_on)  TYPE znept_qz_sync_date_de
        VALUE(iv_old_sync_at)  TYPE znept_qz_sync_time_de
        VALUE(iv_new_sync_on)  TYPE znept_qz_sync_date_de
        VALUE(iv_new_sync_at)  TYPE znept_qz_sync_time_de
        VALUE(is_db_tests_key) TYPE znept_qz_db_tests_key_s
        VALUE(it_db_bookmarks) TYPE znept_qz_db_bookmarks_t
      EXPORTING
        !et_db_bookmarks       TYPE znept_qz_db_bookmarks_t
        !ev_db_error           TYPE abap_bool
        !ev_do_commit          TYPE abap_bool .
    CLASS-METHODS sync_metrics
      IMPORTING
        VALUE(iv_old_sync_on)  TYPE znept_qz_sync_date_de
        VALUE(iv_old_sync_at)  TYPE znept_qz_sync_time_de
        VALUE(iv_new_sync_on)  TYPE znept_qz_sync_date_de
        VALUE(iv_new_sync_at)  TYPE znept_qz_sync_time_de
        VALUE(is_db_tests_key) TYPE znept_qz_db_tests_key_s
        VALUE(it_db_metrics)   TYPE znept_qz_db_metrics_t
      EXPORTING
        !et_db_metrics         TYPE znept_qz_db_metrics_t
        !ev_db_error           TYPE abap_bool
        !ev_do_commit          TYPE abap_bool .
    CLASS-METHODS info
      IMPORTING
        !is_db_tests_key    TYPE znept_qz_db_tests_key_s
      EXPORTING
        !ev_total_parts     TYPE int2
        !ev_total_questions TYPE int2 .
  PROTECTED SECTION.
  PRIVATE SECTION.

    CLASS-METHODS key_check
      IMPORTING
        !is_db_tests_key TYPE znept_qz_db_tests_key_s
      RETURNING
        VALUE(rv_result) TYPE abap_bool .
ENDCLASS.



CLASS zcl_nept_qz_data_provider IMPLEMENTATION.


  METHOD add.

    DATA: ls_db_tests        TYPE znept_qz_db_tests_s,
          lt_db_parts        TYPE znept_qz_db_parts_t,
          lt_db_questions    TYPE znept_qz_db_questions_t,
          lt_db_variants     TYPE znept_qz_db_variants_t,
          ls_db_tests_key    TYPE znept_qz_db_tests_key_s,
          lv_count_parts     TYPE int2,
          lv_count_questions TYPE int2.

    CLEAR: ev_db_error, ev_do_commit.

    CLEAR es_db_tests.

    IF it_db_questions[] IS INITIAL OR it_db_variants[] IS INITIAL.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.

    lt_db_parts[] = it_db_parts[].
    lt_db_questions[] = it_db_questions[].
    lt_db_variants[] = it_db_variants[].

    CLEAR ls_db_tests.

    IF iv_test_id IS INITIAL.
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

      INSERT znept_qz_tst FROM ls_db_tests.

      IF sy-subrc <> 0.
        ev_db_error = abap_true.
        RETURN.
      ENDIF.
      ev_do_commit = abap_true.

    ELSE.
      ls_db_tests-test_id = iv_test_id.
      MOVE-CORRESPONDING ls_db_tests TO ls_db_tests_key.

      zcl_nept_qz_data_provider=>info( EXPORTING is_db_tests_key    = ls_db_tests_key
                                       IMPORTING ev_total_parts     = lv_count_parts
                                                 ev_total_questions = lv_count_questions ).

      IF lv_count_parts > 0 OR lv_count_questions > 0.
        ev_db_error = abap_true.
        RETURN.
      ENDIF.
    ENDIF.

* Insert Parts

    LOOP AT lt_db_parts ASSIGNING FIELD-SYMBOL(<fs_db_parts>).
      <fs_db_parts>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    INSERT znept_qz_prt FROM TABLE lt_db_parts.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.
    ev_do_commit = abap_true.

* Insert Question

    LOOP AT lt_db_questions ASSIGNING FIELD-SYMBOL(<fs_db_questions>).
      <fs_db_questions>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    INSERT znept_qz_qst FROM TABLE lt_db_questions.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.
    ev_do_commit = abap_true.

* Insert Variants

    LOOP AT lt_db_variants ASSIGNING FIELD-SYMBOL(<fs_db_variants>).
      <fs_db_variants>-test_id = ls_db_tests-test_id.
    ENDLOOP.

    INSERT znept_qz_var FROM TABLE lt_db_variants.

    IF sy-subrc <> 0.
      ev_db_error = abap_true.
      RETURN.
    ENDIF.
    ev_do_commit = abap_true.

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

    DATA: ls_db_sync    TYPE znept_qz_db_sync_s,
          ls_db_metrics TYPE znept_qz_db_metrics_s,
          lt_db_metrics TYPE znept_qz_db_metrics_t.

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
