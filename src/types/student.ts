export interface StudentCORProps {
  studentNo: string
  college: string
  schoolYear: string
  name: string
  course: string
  gender: string
  major: string
  curriculum: string
  age: string
  yearLevel: string
  scholarship: string
  email: string
}

export interface ResultType extends Pick<StudentCORProps, "name"> {
  type?: "first" | "last" | "initial"
}
