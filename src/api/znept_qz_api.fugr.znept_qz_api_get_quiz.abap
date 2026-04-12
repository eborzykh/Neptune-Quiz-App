FUNCTION znept_qz_api_get_quiz .
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  IMPORTING
*"     REFERENCE(IV_TEST_ID) TYPE  ZNEPT_QZ_TEST_ID_DE
*"  EXPORTING
*"     REFERENCE(ET_API_QUESTION) TYPE  ZNEPT_QZ_API_QUESTION_T
*"     REFERENCE(ET_API_VARIANT) TYPE  ZNEPT_QZ_API_VARIANT_T
*"----------------------------------------------------------------------

  DATA: lt_test_id_ra TYPE RANGE OF znept_qz_test_id_de.

  CLEAR: et_api_question, et_api_variant.

  IF NOT iv_test_id IS INITIAL.
    APPEND INITIAL LINE TO lt_test_id_ra ASSIGNING FIELD-SYMBOL(<fs_test_id_ra>).
    <fs_test_id_ra>-option = 'EQ'.
    <fs_test_id_ra>-sign = 'I'.
    <fs_test_id_ra>-low = iv_test_id.
  ENDIF.

  SELECT testid AS test_id,
         questionid AS question_id,
         partid AS part_id,
         part_description,
         question,
         explanation,
         sort,
         part_sort,
         syncid,
         progress,
         no_progress
    FROM znept_qz_a_pquestion
    WHERE testid IN @lt_test_id_ra
    ORDER BY part_sort, sort
    INTO TABLE @DATA(lt_qz_a_pquestion).

  IF sy-subrc = 0.
    MOVE-CORRESPONDING lt_qz_a_pquestion TO et_api_question.
  ENDIF.

  SELECT testid AS test_id,
         questionid AS question_id,
         variantid AS variant_id,
         correct,
         variant,
         sort,
         part_sort,
         question_sort
    FROM znept_qz_a_pvariant
    WHERE testid IN @lt_test_id_ra
    ORDER BY part_sort, question_sort, sort
    INTO TABLE @DATA(lt_qz_a_pvariant).

  IF sy-subrc = 0.
    MOVE-CORRESPONDING lt_qz_a_pvariant TO et_api_variant.
  ENDIF.

ENDFUNCTION.
