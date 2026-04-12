FUNCTION znept_qz_api_get_list .
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  EXPORTING
*"     REFERENCE(ET_API_QUIZ) TYPE  ZNEPT_QZ_API_QUIZ_T
*"----------------------------------------------------------------------

  CLEAR et_api_quiz.

  SELECT testid AS test_id,
         uploadon AS upload_on,
         uploadat AS upload_at,
         uploadby AS upload_by,
         published,
         description,
         progress,
         percentage,
         part_count,
         question_count,
         no_sync_data,
         upload_by_name
    FROM znept_qz_a_pquiz
    ORDER BY as_owner DESCENDING, uploadtstmp
    INTO TABLE @DATA(lt_qz_a_pquiz).

  IF sy-subrc = 0.
    MOVE-CORRESPONDING lt_qz_a_pquiz TO et_api_quiz.
  ENDIF.

ENDFUNCTION.
