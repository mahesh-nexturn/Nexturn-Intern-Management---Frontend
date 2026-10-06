export type User = {
  name: string;
  email: string;
  password: string;
  role: "HR" | "MENTOR" | "INTERN";
};

export const users: User[] = [
  // HR
  {
    name: "Admin",
    email: "hr@gmail.com",
    password: "hr123",
    role: "HR",
  },

  // Mentors
  {
    name: "Rahul",
    email: "rahul@gmail.com",
    password: "rahul123",
    role: "MENTOR",
  },
  {
    name: "Priya",
    email: "priya@gmail.com",
    password: "priya123",
    role: "MENTOR",
  },
  {
    name: "Sarath",
    email: "sarath@gmail.com",
    password: "sarath123",
    role: "MENTOR",
  },
  {
    name: "Arun",
    email: "arun@gmail.com",
    password: "arun123",
    role: "MENTOR",
  },
  {
    name: "Sneha",
    email: "sneha@gmail.com",
    password: "sneha123",
    role: "MENTOR",
  },

  // Interns
  {
    name: "John",
    email: "john@gmail.com",
    password: "john123",
    role: "INTERN",
  },
  {
    name: "Emily",
    email: "emily@gmail.com",
    password: "emily123",
    role: "INTERN",
  },
  {
    name: "David",
    email: "david@gmail.com",
    password: "david123",
    role: "INTERN",
  },
];