// Seeds the backend with demo mentors + interns matching the original frontend mock data,
// so the newly-integrated UI shows realistic data out of the box.
//
// Usage:
//   node scripts/seed-demo-data.mjs
//
// Requires the backend to be running at http://localhost:8080 (default application.yml port)
// and the default admin seed user (admin@nexturn.com / Admin@123) to exist.

const BASE_URL = "http://localhost:8080/api";
const ADMIN_EMAIL = "admin@nexturn.com";
const ADMIN_PASSWORD = "Admin@123";
const DEMO_PASSWORD = "Demo@123";

async function request(path, options = {}, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    throw new Error(
      `${options.method || "GET"} ${path} -> ${res.status}: ${JSON.stringify(json)}`
    );
  }

  return json;
}

async function login() {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  return res.data.accessToken;
}

async function createUser(token, { name, email, role }) {
  const res = await request(
    "/users",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password: DEMO_PASSWORD, role }),
    },
    token
  );
  return res.data;
}

async function createMentor(token, { name, email, department, designation, userId }) {
  const res = await request(
    "/mentors",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        department,
        designation,
        status: "Active",
        userId,
      }),
    },
    token
  );
  return res.data;
}

async function createIntern(token, { name, email, department, mentorId, userId }) {
  const res = await request(
    "/interns",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        department,
        status: "Active",
        mentorId,
        userId,
      }),
    },
    token
  );
  return res.data;
}

const MENTORS = [
  { name: "Rahul Sharma", email: "rahul.mentor@nexturn.com", department: "Engineering", designation: "Senior Software Engineer" },
  { name: "Priya Nair", email: "priya.mentor@nexturn.com", department: "Engineering", designation: "Tech Lead" },
  { name: "Sarath Kumar", email: "sarath.mentor@nexturn.com", department: "Data Science", designation: "Senior Data Scientist" },
  { name: "Arun Verma", email: "arun.mentor@nexturn.com", department: "Design", designation: "Design Lead" },
  { name: "Sneha Reddy", email: "sneha.mentor@nexturn.com", department: "QA", designation: "QA Lead" },
];

const INTERNS = [
  { name: "John Mathew", email: "john.intern@nexturn.com", department: "Engineering", mentorEmail: "rahul.mentor@nexturn.com" },
  { name: "Emily Thomas", email: "emily.intern@nexturn.com", department: "Engineering", mentorEmail: "priya.mentor@nexturn.com" },
  { name: "David Joseph", email: "david.intern@nexturn.com", department: "Data Science", mentorEmail: "sarath.mentor@nexturn.com" },
  { name: "Keerthi Menon", email: "keerthi.intern@nexturn.com", department: "Design", mentorEmail: "arun.mentor@nexturn.com" },
  { name: "Sai Krishna", email: "sai.intern@nexturn.com", department: "QA", mentorEmail: "sneha.mentor@nexturn.com" },
];

async function main() {
  console.log("Logging in as admin...");
  const token = await login();
  console.log("Login OK. Seeding demo data...");

  const mentorIdByEmail = new Map();

  for (const m of MENTORS) {
    try {
      const user = await createUser(token, { name: m.name, email: m.email, role: "MENTOR" });
      const mentor = await createMentor(token, { ...m, userId: user.id });
      mentorIdByEmail.set(m.email, mentor.id);
      console.log(`Created mentor: ${m.name} (userId=${user.id}, mentorId=${mentor.id})`);
    } catch (err) {
      console.warn(`Skipping mentor ${m.name}: ${err.message}`);
    }
  }

  for (const i of INTERNS) {
    try {
      const mentorId = mentorIdByEmail.get(i.mentorEmail) ?? null;
      const user = await createUser(token, { name: i.name, email: i.email, role: "INTERN" });
      const intern = await createIntern(token, {
        name: i.name,
        email: i.email,
        department: i.department,
        mentorId,
        userId: user.id,
      });
      console.log(`Created intern: ${i.name} (userId=${user.id}, internId=${intern.id}, mentorId=${mentorId})`);
    } catch (err) {
      console.warn(`Skipping intern ${i.name}: ${err.message}`);
    }
  }

  console.log("\nDone. All demo accounts use password: " + DEMO_PASSWORD);
  console.log("Example logins:");
  console.log("  Mentor: rahul.mentor@nexturn.com / " + DEMO_PASSWORD);
  console.log("  Intern: john.intern@nexturn.com / " + DEMO_PASSWORD);
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
