const EXAM_STATUS = {
  APPLICATION_OPEN: "applicationOpen",
  APPLICATION_CLOSE: "applicationClose",
  EXAM_SCHEDULED: "examScheduled",
  EXAM_LIVE: "examLive",
  EXAM_OVER: "examOver",
  EXAM_ENDED: "examEnded",
};

const USER_ROLES = {
  STUDENT: "student",
  ORGADMIN: "orgAdmin",
  SUPERADMIN: "superAdmin",
};

const EXAM_STATUS_TEXT = {
    [EXAM_STATUS.APPLICATION_OPEN]: "Application Open",
    [EXAM_STATUS.APPLICATION_CLOSE]: "Application Close",
    [EXAM_STATUS.EXAM_SCHEDULED]: "Exam Scheduled",
    [EXAM_STATUS.EXAM_LIVE]: "Exam Live",
    [EXAM_STATUS.EXAM_OVER]: "Exam Over",
    [EXAM_STATUS.EXAM_ENDED]: "Exam Ended",
}

const API_RESPONSE = {
  SUCCESS: "success",
  FAILURE: "failure",
};


export { EXAM_STATUS, EXAM_STATUS_TEXT, USER_ROLES, API_RESPONSE };
