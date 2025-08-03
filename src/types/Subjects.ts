export const FE_SUBJECTS = {
  "2019Pattern": [
    { name: "Engineering Mathematics I", code: "EM1" },
    { name: "Engineering Mathematics II", code: "EM2" },
    { name: "Engineering Physics", code: "EP" },
    { name: "Engineering Chemistry", code: "EC" },
    { name: "Basic Electrical Engineering", code: "BEE" },
    { name: "Basic Electronics Engineering", code: "BXC" },
    { name: "Engineering Mechanics", code: "EM" },
    { name: "Engineering Graphics", code: "EG" },
    { name: "Programming and Problem Solving", code: "PPS" },
    { name: "System in Mechanical Engineering", code: "SME" },
  ],
  "2024Pattern": [
    { name: "Engineering Mathematics I", code: "EM1" },
    { name: "Engineering Mathematics II", code: "EM2" },
    { name: "Engineering Physics", code: "EP" },
    { name: "Engineering Chemistry", code: "EC" },
    { name: "Basic Electrical Engineering", code: "BEE" },
    { name: "Basic Electronics Engineering", code: "BXC" },
    { name: "Engineering Mechanics", code: "EM" },
    { name: "Engineering Graphics", code: "EG" },
    { name: "Programming and Problem Solving", code: "PPS" },
    { name: "Fundamentals of Programming Language", code: "FPL" },
  ],
};

export const IT_SUBJECTS = {
  "2019Pattern": {
    SE: [
      { name: "Discrete Mathematics", code: "DM", semester: 3 },
      {
        name: "Logic Design & Computer Organization",
        code: "LDCO",
        semester: 3,
      },
      { name: "Data Structures & Algorithms", code: "DSA", semester: 3 },
      { name: "Objects Oriented Programming", code: "OOP", semester: 3 },
      { name: "Basics of Computer Network", code: "BCN", semester: 3 },
      { name: "Engineering Mathematics-III", code: "EM3", semester: 4 },
      { name: "Processor Architecture", code: "PA", semester: 4 },
      { name: "Database Management System", code: "DBMS", semester: 4 },
      { name: "Computer Graphics", code: "CG", semester: 4 },
      { name: "Software Engineering", code: "SE", semester: 4 },
    ],
    TE: [
      { name: "Theory of Computation", code: "TOC", semester: 5 },
      { name: "Operating Systems", code: "OS", semester: 5 },
      { name: "Machine Learning", code: "ML", semester: 5 },
      { name: "Human Computer Interaction", code: "HCI", semester: 5 },
      { name: "Elective-I", code: "E1", semester: 5 },
      { name: "Computer Networks & Security", code: "CNS", semester: 6 },
      {
        name: "Data Science and Big Data Analytics",
        code: "DSBDA",
        semester: 6,
      },
      { name: "Web Application Development", code: "WAD", semester: 6 },
      { name: "Elective-II", code: "E2", semester: 6 },
    ],
    BE: [
      { name: "Information Storage and Retrieval", code: "ISR", semester: 7 },
      { name: "Software Project Management", code: "SPM", semester: 7 },
      { name: "Deep Learning", code: "DL", semester: 7 },
      { name: "Elective III", code: "E3", semester: 7 },
      { name: "Elective IV", code: "E4", semester: 7 },
      { name: "Distributed Systems", code: "DS", semester: 8 },
      { name: "Elective V", code: "E5", semester: 8 },
      { name: "Elective VI", code: "E6", semester: 8 },
    ],
  },
  "2024Pattern": {
    SE: [
      { name: "Data Structures & Algorithms", code: "DSA", semester: 3 },
      { name: "Objects Oriented Programming", code: "OOP", semester: 3 },
      { name: "Basics of Computer Network", code: "BCN", semester: 3 },
      { name: "Open Elective-1", code: "OE1", semester: 3 },
      {
        name: "Digital Electronics & Logic Design",
        code: "DELD",
        semester: 3,
      },
      { name: "Database Management System", code: "DBMS", semester: 4 },
      { name: "Computer Graphics", code: "CG", semester: 4 },
      { name: "Software Engineering", code: "SE", semester: 4 },
      { name: "Open Elective-2", code: "OE2", semester: 4 },
      { name: "Processor Architecture", code: "PA", semester: 4 },
    ],
    TE: [],
    BE: [],
  },
};

export const CS_SUBJECTS = {
  "2019Pattern": {
    SE: [],
    TE: [
      // Semester 5
      { name: "Database Management Systems", code: "DBMS", semester: 5 },
      { name: "Theory of Computation", code: "TOC", semester: 5 },
      {
        name: "Systems Programming and Operating System",
        code: "SPOS",
        semester: 5,
      },
      { name: "Computer Networks and Security", code: "CNS", semester: 5 },
      {
        name: "Elective I - Software Project Management",
        code: "SPM",
        semester: 5,
      },

      // Semester 6
      {
        name: "Data Science and Big Data Analytics",
        code: "DSBDA",
        semester: 6,
      },
      { name: "Web Technology", code: "WT", semester: 6 },
      { name: "Artificial Intelligence", code: "AI", semester: 6 },
      { name: "Elective II - Cloud Computing", code: "CC", semester: 6 },
    ],
    BE: [],
  },
  "2024Pattern": {
    SE: [],
    TE: [],
    BE: [],
  },
};

type Branch = "FE" | "CS" | "IT" | "Civil" | "Mechanical";
type Year = "SE" | "TE" | "BE";
type Pattern = "2019Pattern" | "2024Pattern";

interface Subject {
  name: string;
  code: string;
  semester?: number;
}

export function getSubjects(
  branch: Branch,
  sem: number,
  pattern: Pattern,
  year?: Year | ""
): Subject[] {
  if (branch === "FE") {
    // Year is irrelevant for FE
    const subjects = FE_SUBJECTS[pattern] || [];
    if (sem === 1) return subjects.slice(0, 5);
    if (sem === 2) return subjects.slice(5);
    return [];
  }

  if (!year) {
    throw new Error("Year must be provided for IT and CS branches.");
  }

  let subjectSource;
  if (branch === "IT") subjectSource = IT_SUBJECTS;
  else if (branch === "CS") subjectSource = CS_SUBJECTS;
  else return [];

  const allSubjects: Subject[] = subjectSource[pattern]?.[year] || [];
  return allSubjects.filter((subj) => subj.semester == sem);
}
