module.exports = {
  index:
    'query index {\n  userAuth {\n    user {\n      prereserveAuto: getSchConfig(extra: true, fields: "prereserve.auto")\n    }\n    currentUser {\n      sch {\n        isShowCommon\n      }\n    }\n    prereserve {\n      libs {\n        is_open\n        lib_floor\n        lib_group_id\n        lib_id\n        lib_name\n        num\n        seats_total\n      }\n    }\n    oftenseat {\n      prereserveList {\n        id\n        info\n        lib_id\n        seat_key\n        status\n      }\n    }\n  }\n}',
  userInfo:
    'query index($pos: String!, $param: [hash]) {\n userAuth {\n oftenseat {\n list {\n id\n info\n lib_id\n seat_key\n status\n }\n }\n message {\n new(from: "system") {\n has\n from_user\n title\n num\n }\n indexMsg {\n message_id\n title\n content\n isread\n isused\n from_user\n create_time\n }\n }\n reserve {\n reserve {\n token\n status\n user_id\n user_nick\n sch_name\n lib_id\n lib_name\n lib_floor\n seat_key\n seat_name\n date\n exp_date\n exp_date_str\n validate_date\n hold_date\n diff\n diff_str\n mark_source\n isRecordUser\n isChooseSeat\n isRecord\n mistakeNum\n openTime\n threshold\n daynum\n mistakeNum\n closeTime\n timerange\n forbidQrValid\n renewTimeNext\n forbidRenewTime\n forbidWechatCancle\n }\n getSToken\n }\n currentUser {\n user_id\n user_nick\n user_mobile\n user_sex\n user_sch_id\n user_sch\n user_last_login\n user_avatar(size: MIDDLE)\n user_adate\n user_student_no\n user_student_name\n area_name\n user_deny {\n deny_deadline\n }\n sch {\n sch_id\n sch_name\n activityUrl\n isShowCommon\n isBusy\n }\n }\n }\n ad(pos: $pos, param: $param) {\n name\n pic\n url\n }\n}',
  libLayout:
    'query libLayout($libId: Int, $libType: Int) {\n userAuth {\n reserve {\n libs(libType: $libType, libId: $libId) {\n lib_id\n is_open\n lib_floor\n lib_name\n lib_type\n lib_layout {\n seats_total\n seats_booking\n seats_used\n max_x\n max_y\n seats {\n x\n y\n key\n type\n name\n seat_status\n status\n }\n }\n }\n }\n }\n}',
  reserveSeat:
    'mutation reserveSeat($libId: Int!, $seatKey: String!, $captchaCode: String, $captcha: String!) {\n userAuth {\n reserve {\n reserveSeat(\n libId: $libId\n seatKey: $seatKey\n captchaCode: $captchaCode\n captcha: $captcha\n )\n }\n }\n}',
  pre_index:
    'query index {\n userAuth {\n user {\n prereserveAuto: getSchConfig(extra: true, fields: "prereserve.auto")\n }\n currentUser {\n sch {\n isShowCommon\n }\n }\n prereserve {\n libs {\n is_open\n lib_floor\n lib_group_id\n lib_id\n lib_name\n num\n seats_total\n }\n }\n oftenseat {\n prereserveList {\n id\n info\n lib_id\n seat_key\n status\n }\n }\n }\n}',
  pre_libLayout:
    'query libLayout($libId: Int!) {\n userAuth {\n prereserve {\n libLayout(libId: $libId) {\n max_x\n max_y\n seats_booking\n seats_total\n seats_used\n seats {\n key\n name\n seat_status\n status\n type\n x\n y\n }\n }\n }\n }\n}',
  pre_reserveSeat:
    'mutation save($key: String!, $libid: Int!, $captchaCode: String, $captcha: String) {\n userAuth {\n prereserve {\n save(key: $key, libId: $libid, captcha: $captcha, captchaCode: $captchaCode)\n }\n }\n}',
  prereserveCheckMsg:
    'query prereserveCheckMsg {\n userAuth {\n prereserve {\n prereserveCheckMsg\n }\n }\n}',
  getList:
    'query getList {\n userAuth {\n credit {\n tasks {\n id\n task_id\n task_name\n task_info\n task_url\n credit_num\n contents\n conditions\n task_type\n status\n }\n staticTasks {\n id\n name\n task_type_name\n credit_num\n contents\n button\n }\n }\n }\n}',
  checkIn:
    'mutation done($user_task_id: Int!) {\n userAuth {\n credit {\n done(user_task_id: $user_task_id)\n }\n }\n}',
  user_credit: 'query user_credit {\n userAuth {\n currentUser {\n user_credit\n }\n }\n}'
}
