const DATABASE = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  EXAMS: "exams",
  EXAM_SET: "examset",
};

const DATABASE_LIST = Object.values(DATABASE);

const SAMPLE_DATA = {
  [DATABASE.USERS]: [
    {
      name: "Student1",
      email: "student1@gmail.com",
      password:
        "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
      role: "student",
      dateOfBirth: "2024-12-01",
      location: "Chennai",
      pincode: "111111",
    },
    {
      name: "Student2",
      email: "student2@gmail.com",
      password:
        "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
      role: "student",
      dateOfBirth: "2024-12-02",
      location: "Delhi",
      pincode: "222222",
    },
    {
      name: "Student3",
      email: "student3@gmail.com",
      password:
        "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
      role: "student",
      dateOfBirth: "2024-12-03",
      location: "Kolkata",
      pincode: "333333",
    },
    {
      _id: "f164ac84ed0eb27c55cb5c6a30009aa1",
      orgId: "f164ac84ed0eb27c55cb5c6a30009ao1",
      name: "OrgAdmin1",
      email: "orgadmin1@gmail.com",
      password:
        "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
      role: "orgAdmin",
      dateOfBirth: "2024-12-18",
      location: "Pune",
      pincode: "111111",
    },
    {
      _id: "f164ac84ed0eb27c55cb5c6a30009aa2",
      orgId: "f164ac84ed0eb27c55cb5c6a30009ao2",
      name: "OrgAdmin2",
      email: "orgadmin2@gmail.com",
      password:
        "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
      role: "orgAdmin",
      dateOfBirth: "2024-12-18",
      location: "Mumbai",
      pincode: "222222",
    },
    {
      _id: "f164ac84ed0eb27c55cb5c6a30009aa3",
      orgId: "f164ac84ed0eb27c55cb5c6a30009ao3",
      name: "OrgAdmin3",
      email: "orgadmin3@gmail.com",
      password:
        "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
      role: "orgAdmin",
      dateOfBirth: "2024-12-18",
      location: "Agra",
      pincode: "333333",
    },
  ],
  [DATABASE.ORGANIZATIONS]: [
    {
      _id: "f164ac84ed0eb27c55cb5c6a30009ao1",
      name: "Org1",
    },
    {
      _id: "f164ac84ed0eb27c55cb5c6a30009ao2",
      name: "Org2",
    },
    {
      _id: "f164ac84ed0eb27c55cb5c6a30009ao3",
      name: "Org3",
    },
  ],
};

export { DATABASE, DATABASE_LIST, SAMPLE_DATA };
