import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  INITIAL_COURSES,
  INITIAL_TEACHERS,
  INITIAL_ADMISSIONS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_GALLERY,
  INITIAL_NOTICES,
  INITIAL_RESULTS,
  INITIAL_STATS
} from "./src/data/initialData";
import {
  Course,
  Teacher,
  AdmissionApplication,
  ContactMessage,
  GalleryItem,
  Notice,
  StudentResult
} from "./src/types";

// Initialize In-Memory / Stateful Collections
let courses: Course[] = [...INITIAL_COURSES];
let teachers: Teacher[] = [...INITIAL_TEACHERS];
let admissions: AdmissionApplication[] = [...INITIAL_ADMISSIONS];
let messages: ContactMessage[] = [...INITIAL_CONTACT_MESSAGES];
let gallery: GalleryItem[] = [...INITIAL_GALLERY];
let notices: Notice[] = [...INITIAL_NOTICES];
let results: StudentResult[] = [...INITIAL_RESULTS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for Gemini AI Client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      }
    }
    return aiClient;
  }

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", institute: "Royal Academy Mansoorabad Faisalabad" });
  });

  // Analytics & Stats
  app.get("/api/stats", (_req, res) => {
    res.json({
      totalStudents: 850 + admissions.filter(a => a.status === 'Approved').length,
      totalCourses: courses.length,
      pendingAdmissions: admissions.filter(a => a.status === 'Pending').length,
      totalTeachers: teachers.length,
      unreadMessages: messages.filter(m => m.status === 'Unread').length,
      totalApplications: admissions.length
    });
  });

  // 1. COURSES API
  app.get("/api/courses", (_req, res) => {
    res.json(courses);
  });

  app.get("/api/courses/:id", (req, res) => {
    const course = courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  });

  app.post("/api/courses", (req, res) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: req.body.title || "New Course",
      category: req.body.category || "Tuition Classes",
      shortDescription: req.body.shortDescription || "",
      fullDescription: req.body.fullDescription || "",
      duration: req.body.duration || "1 Month",
      fee: Number(req.body.fee) || 0,
      feePeriod: req.body.feePeriod || "per month",
      image: req.body.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
      features: req.body.features || [],
      schedule: req.body.schedule || "Mon - Sat",
      instructor: req.body.instructor || "Faculty Staff",
      appliesCount: 0,
      featured: Boolean(req.body.featured)
    };
    courses.unshift(newCourse);
    res.status(201).json(newCourse);
  });

  app.put("/api/courses/:id", (req, res) => {
    const idx = courses.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Course not found" });
    courses[idx] = { ...courses[idx], ...req.body };
    res.json(courses[idx]);
  });

  app.delete("/api/courses/:id", (req, res) => {
    courses = courses.filter(c => c.id !== req.params.id);
    res.json({ success: true, id: req.params.id });
  });

  // 2. TEACHERS API
  app.get("/api/teachers", (_req, res) => {
    res.json(teachers);
  });

  app.post("/api/teachers", (req, res) => {
    const newTeacher: Teacher = {
      id: `teach-${Date.now()}`,
      name: req.body.name,
      role: req.body.role || "Faculty Member",
      qualification: req.body.qualification || "M.Sc / M.Phil",
      experience: req.body.experience || "5+ Years",
      subject: req.body.subject || "General Science",
      photo: req.body.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      bio: req.body.bio || "",
      email: req.body.email || "info@royalacademy.edu.pk",
      phone: req.body.phone || "0329-0247580",
      featured: Boolean(req.body.featured)
    };
    teachers.unshift(newTeacher);
    res.status(201).json(newTeacher);
  });

  app.put("/api/teachers/:id", (req, res) => {
    const idx = teachers.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Teacher not found" });
    teachers[idx] = { ...teachers[idx], ...req.body };
    res.json(teachers[idx]);
  });

  app.delete("/api/teachers/:id", (req, res) => {
    teachers = teachers.filter(t => t.id !== req.params.id);
    res.json({ success: true, id: req.params.id });
  });

  // 3. ADMISSIONS API
  app.get("/api/admissions", (_req, res) => {
    res.json(admissions);
  });

  app.get("/api/admissions/status/:query", (req, res) => {
    const query = req.params.query.trim().toLowerCase();
    const match = admissions.find(
      a =>
        a.id.toLowerCase() === query ||
        a.phone.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, "")) ||
        a.cnicBForm.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, ""))
    );
    if (!match) {
      return res.status(404).json({ error: "No admission application found matching this ID, Phone, or CNIC." });
    }
    res.json(match);
  });

  app.post("/api/admissions", (req, res) => {
    const {
      studentName,
      fatherName,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      courseId,
      courseName,
      previousEducation,
      cnicBForm,
      guardianPhone
    } = req.body;

    if (!studentName || !phone || !courseName) {
      return res.status(400).json({ error: "Please fill in all required fields (Student Name, Phone, and Course)." });
    }

    const newApp: AdmissionApplication = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName,
      fatherName: fatherName || "",
      email: email || "",
      phone,
      gender: gender || "Male",
      dateOfBirth: dateOfBirth || "",
      address: address || "",
      courseId: courseId || "general",
      courseName,
      previousEducation: previousEducation || "Matric / Intermediate",
      cnicBForm: cnicBForm || "",
      guardianPhone: guardianPhone || phone,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    admissions.unshift(newApp);

    // Increment applies count for course
    const course = courses.find(c => c.id === courseId || c.title === courseName);
    if (course) {
      course.appliesCount = (course.appliesCount || 0) + 1;
    }

    res.status(201).json(newApp);
  });

  app.put("/api/admissions/:id/status", (req, res) => {
    const appItem = admissions.find(a => a.id === req.params.id);
    if (!appItem) return res.status(404).json({ error: "Application not found" });
    if (req.body.status) appItem.status = req.body.status;
    if (req.body.adminNotes !== undefined) appItem.adminNotes = req.body.adminNotes;
    res.json(appItem);
  });

  app.patch("/api/admissions/:id", (req, res) => {
    const appItem = admissions.find(a => a.id === req.params.id);
    if (!appItem) return res.status(404).json({ error: "Application not found" });
    if (req.body.status) appItem.status = req.body.status;
    if (req.body.adminNotes !== undefined) appItem.adminNotes = req.body.adminNotes;
    res.json(appItem);
  });

  app.delete("/api/admissions/:id", (req, res) => {
    admissions = admissions.filter(a => a.id !== req.params.id);
    res.json({ success: true });
  });

  // 4. CONTACT MESSAGES API
  app.get("/api/messages", (_req, res) => {
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required." });
    }
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email: email || "",
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
      date: new Date().toISOString(),
      status: "Unread"
    };
    messages.unshift(newMsg);
    res.status(201).json(newMsg);
  });

  app.put("/api/messages/:id/status", (req, res) => {
    const msg = messages.find(m => m.id === req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    if (req.body.status) msg.status = req.body.status;
    res.json(msg);
  });

  app.delete("/api/messages/:id", (req, res) => {
    messages = messages.filter(m => m.id !== req.params.id);
    res.json({ success: true });
  });

  // 5. GALLERY API
  app.get("/api/gallery", (_req, res) => {
    res.json(gallery);
  });

  app.post("/api/gallery", (req, res) => {
    const newGal: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: req.body.title || "Academy Campus Life",
      category: req.body.category || "Classroom",
      image: req.body.image || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800",
      date: req.body.date || "Recent",
      description: req.body.description || ""
    };
    gallery.unshift(newGal);
    res.status(201).json(newGal);
  });

  app.delete("/api/gallery/:id", (req, res) => {
    gallery = gallery.filter(g => g.id !== req.params.id);
    res.json({ success: true });
  });

  // 6. NOTICES API
  app.get("/api/notices", (_req, res) => {
    res.json(notices);
  });

  app.post("/api/notices", (req, res) => {
    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      title: req.body.title || "Academy Notice",
      category: req.body.category || "General",
      content: req.body.content || "",
      date: new Date().toISOString().split("T")[0],
      urgent: Boolean(req.body.urgent)
    };
    notices.unshift(newNotice);
    res.status(201).json(newNotice);
  });

  app.delete("/api/notices/:id", (req, res) => {
    notices = notices.filter(n => n.id !== req.params.id);
    res.json({ success: true });
  });

  // 7. STUDENT RESULTS SEARCH API
  app.get("/api/results", (req, res) => {
    const query = (req.query.q as string || "").trim().toLowerCase();
    if (!query) {
      return res.json(results);
    }
    const filtered = results.filter(
      r =>
        r.rollNumber.toLowerCase().includes(query) ||
        r.studentName.toLowerCase().includes(query) ||
        r.fatherName.toLowerCase().includes(query)
    );
    res.json(filtered);
  });

  // 8. ADMIN LOGIN API
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (
      (email === "ayeshawadood02@gmail.com" || email === "admin@royalacademy.edu.pk" || email === "admin") &&
      (password === "ayesha@08" || password === "admin123" || password === "royal2026")
    ) {
      return res.json({
        success: true,
        user: {
          id: "admin-1",
          username: "ayeshawadood02",
          name: "Miss Ayesha Wadood (Principal / Admin)",
          email: "ayeshawadood02@gmail.com",
          role: "Super Admin",
          token: `jwt-royal-token-${Date.now()}`
        }
      });
    }
    res.status(401).json({ error: "Invalid admin email or password." });
  });

  // 9. GEMINI AI ASSISTANT API FOR ROYAL ACADEMY
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, conversation = [] } = req.body;
      if (!message) return res.status(400).json({ error: "Message is required" });

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          reply: "Welcome to Royal Academy! We are located in Mansoorabad, Farooqabad, Street 14, Faisalabad, Pakistan. Phone: 0329-0247580. We offer Matric, F.Sc, ICS, MDCAT/ECAT Entry Test, Spoken English, and Computer courses. How can I help you today?"
        });
      }

      const systemPrompt = `You are the official Royal Academy AI Admissions & Student Advisory Assistant.
Key Details about Royal Academy:
- Name: Royal Academy
- Location: Mansoorabad, Farooqabad, Street 14, Faisalabad, Pakistan
- Phone: 0329-0247580
- Courses offered: Matric (Science/Arts), Intermediate (F.Sc Pre-Medical, F.Sc Pre-Engineering, ICS), MDCAT & ECAT Entry Test Preparation, Spoken English & Public Speaking, Computer Short Courses & Web Dev, Evening Tuition Classes (Grades 6th to 8th).
- Timings: Morning & Evening batches available.
- Principal: Prof. Muhammad Akram (18+ years experience).
- Tone: Professional, welcoming, encouraging, helpful, polite, and well-structured.
- Direct students to fill the online admission form or call 0329-0247580 for immediate registration. Keep replies concise and nicely formatted with bullet points when listing details.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
        ],
      });

      const reply = response.text || "Thank you for contacting Royal Academy! Please call 0329-0247580 or visit our campus in Mansoorabad, Faisalabad for details.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Gemini AI error:", error);
      res.json({
        reply: "Thank you for reaching out to Royal Academy! Our admissions office is located at Mansoorabad, Farooqabad, Street 14, Faisalabad. Call us directly at 0329-0247580 or apply online via our Admission tab."
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Royal Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
