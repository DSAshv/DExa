const ROLES_TABS_MAP = {
    ["pre-exam"]: {
        ["student"]: [
            { id: "dashboard", name: "Dashboard" },
            { id: "exams", name: "Exams" },
        ],
        ["orgAdmin"]: [
            { id: "dashboard", name: "Dashboard" },
            { id: "exams", name: "Exams" },
            { id: "createexam", name: "Create Exam" },
        ]
    },
    ["exam"]: {
        ["student"]: [
            { id: "general", name: "General" },
            { id: "exam", name: "Exam" },
            { id: "submit", name: "Submit" },
        ],
        ["orgAdmin"]: [
            { id: "attendance", name: "Attendance" },
            { id: "submissions", name: "Submissions" },
            { id: "feedbacks", name: "Feedbacks" },
        ]
    }
}

export { ROLES_TABS_MAP };
