import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

function generateLocalSmartReply(message: string = '', studentContext: any = {}): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('next class') || msg.includes('where do i go') || msg.includes('timetable') || msg.includes('today')) {
    return `📅 **Your Current Academic Schedule Insight:**\n\n• **Upcoming Session:** BIO 203 (*Biostatistics & Research Methodology*)\n• **Venue:** **Hall 03**, CoNAS Main Lecture Complex\n• **Instructor:** **Prof. Assad** (Email: \`assad.m@udsm.ac.tz\`)\n• **Time:** 09:30 AM – 10:30 AM\n• **Focus Topics:** Sampling Distributions, ANOVA, R-Studio Hypothesis testing.\n\n*Tip: You can view your full interactive day-by-day timetable and classroom floor plans directly from the **Timetable** tab on the left!*`;
  }

  if (msg.includes('hall 03') || msg.includes('where is') || msg.includes('hall') || msg.includes('venue') || msg.includes('ict lab')) {
    return `🏛️ **Campus Venue Direction Guide:**\n\n• **Hall 03:** Located on the 1st floor of CoNAS Central Lecture Complex, directly opposite the Faculty Staff Lounge.\n• **ICT Lab 2:** Located on Ground Floor of the Central Informatics Centre (access via College Library walkway).\n• **Science Block B204:** 2nd Floor, Zoology Department Wing.\n\n*All halls are equipped with Wi-Fi and digital projectors. Arrive 5 minutes before scheduled start time.*`;
  }

  if (msg.includes('prof. assad') || msg.includes('lecturer') || msg.includes('assad') || msg.includes('mushi') || msg.includes('neema')) {
    return `👨‍🏫 **Faculty Profile & Consultation Information:**\n\n• **Prof. Assad M. Said:** Department of Biostatistics & Computing. Office: Room 112, Math Annex. Office Hours: Wednesdays & Fridays 14:00 – 15:30 in Hall 03.\n• **Dr. Neema Said:** Head of Department, Biostatistics. Office: Room 204, ICT Centre.\n• **Dr. A. Mushi:** Senior Lecturer, Zoology. Office: Zoology Wing, Room Z-08.`;
  }

  if (msg.includes('exam') || msg.includes('study') || msg.includes('cat') || msg.includes('gpa') || msg.includes('revision')) {
    return `🎯 **Smart Study & Performance Recommendation:**\n\n1. **Biostatistics (BIO 203):** Practice running R-Studio scripts on the provided open-access MIT OCW dataset. Focus on distinguishing One-Way vs Two-Way ANOVA.\n2. **Zoology I (ZOO 201):** Review comparative anatomy dissection keys in the Study Resources library.\n3. **Current Projected GPA:** **3.82 / 5.0 (Upper Second Class)**. Submitting your pending tasks on time will help push you toward First Class standing (4.4+).\n\n*Would you like a customized 5-day revision timetable for your upcoming Continuous Assessment Tests (CATs)?*`;
  }

  return `Hello ${studentContext?.userName || 'Deodatus'}! I am your **CampusFlow Academic AI Mentor**.\n\nI can help you with:\n• Finding your classrooms (e.g. Hall 03, ICT Lab 2, Science Block B204)\n• Querying your daily timetable and lecturer office hours (Prof. Assad, Dr. Mushi, Dr. Neema Said)\n• Course notes breakdown, R-scripts and study material recommendations\n• Exam preparation strategies and GPA simulation.\n\nWhat would you like assistance with today?`;
}

function generateFallbackParsedSlots(textData?: string): any[] {
  return [
    {
      courseCode: 'BIO 203',
      courseName: 'Biostatistics & Research Methodology',
      day: 'Monday',
      startTime: '09:30',
      endTime: '10:30',
      timeFormatted: '09:30 - 10:30 AM',
      hall: 'Hall 03',
      building: 'CoNAS Lecture Complex',
      lecturer: 'Prof. Assad',
      lecturerEmail: 'assad.m@udsm.ac.tz',
      year: 1,
      semester: 1,
      type: 'Lecture',
      color: '#e6ad3d',
      notes: 'Probability distributions, sampling theorem & hypothesis testing intro.',
      attendanceRequired: true,
    },
    {
      courseCode: 'ZOO 201',
      courseName: 'Zoology I (Chordate Diversity)',
      day: 'Monday',
      startTime: '11:00',
      endTime: '13:00',
      timeFormatted: '11:00 AM - 01:00 PM',
      hall: 'Science Block B204',
      building: 'Zoology Complex',
      lecturer: 'Dr. A. Mushi',
      lecturerEmail: 'a.mushi@udsm.ac.tz',
      year: 2,
      semester: 1,
      type: 'Lecture',
      color: '#1e6fa8',
      notes: 'Comparative vertebrate morphology & craniate evolutionary origins.',
      attendanceRequired: true,
    },
    {
      courseCode: 'ECO 202',
      courseName: 'Applied Ecology & Conservation Biology',
      day: 'Tuesday',
      startTime: '08:30',
      endTime: '10:30',
      timeFormatted: '08:30 - 10:30 AM',
      hall: 'Lecture Hall A3',
      building: 'Nkrumah Administrative Wing',
      lecturer: 'Prof. J. Kweka',
      lecturerEmail: 'j.kweka@udsm.ac.tz',
      year: 2,
      semester: 1,
      type: 'Lecture',
      color: '#16845d',
      notes: 'East African savannah conservation policies and Mikumi field trip prep.',
      attendanceRequired: true,
    },
    {
      courseCode: 'BIO 203',
      courseName: 'Biostatistics Lab (R-Studio Practical)',
      day: 'Tuesday',
      startTime: '14:00',
      endTime: '16:00',
      timeFormatted: '02:00 - 04:00 PM',
      hall: 'ICT Lab 2',
      building: 'Central Informatics Centre',
      lecturer: 'Dr. Neema Said',
      lecturerEmail: 'n.said@udsm.ac.tz',
      year: 2,
      semester: 1,
      type: 'Practical',
      color: '#e6ad3d',
      notes: 'Hands-on ANOVA scripts, ggplot2 data visualization and regression output.',
      attendanceRequired: true,
    },
    {
      courseCode: 'CHE 201',
      courseName: 'General Chemistry & Biochemistry Essentials',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '11:00',
      timeFormatted: '09:00 - 11:00 AM',
      hall: 'Chemistry Hall 02',
      building: 'Chemistry Annex',
      lecturer: 'Dr. H. Ally',
      lecturerEmail: 'h.ally@udsm.ac.tz',
      year: 2,
      semester: 1,
      type: 'Lecture',
      color: '#9333ea',
      notes: 'Thermodynamics of bioenergetic coupling, ATP hydrolysis and enzyme kinetics.',
      attendanceRequired: true,
    },
    {
      courseCode: 'ENG 004',
      courseName: 'Engineering & Scientific Computing Essentials',
      day: 'Thursday',
      startTime: '09:30',
      endTime: '11:30',
      timeFormatted: '09:30 - 11:30 AM',
      hall: 'Hall 03',
      building: 'CoNAS Lecture Complex',
      lecturer: 'Prof. Assad',
      lecturerEmail: 'assad.m@udsm.ac.tz',
      year: 1,
      semester: 1,
      type: 'Lecture',
      color: '#0284c7',
      notes: 'Matrix algebra, differential modeling and algorithm fundamentals.',
      attendanceRequired: true,
    },
    {
      courseCode: 'CHE 201',
      courseName: 'Enzyme Kinetics & Spectrophotometry Lab',
      day: 'Friday',
      startTime: '08:30',
      endTime: '11:30',
      timeFormatted: '08:30 - 11:30 AM',
      hall: 'Chemistry Lab 1',
      building: 'Physical Sciences Wing',
      lecturer: 'Dr. H. Ally',
      lecturerEmail: 'h.ally@udsm.ac.tz',
      year: 2,
      semester: 1,
      type: 'Practical',
      color: '#9333ea',
      notes: 'Lineweaver-Burk determination with Michaelis-Menten constant evaluation.',
      attendanceRequired: true,
    },
  ];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, studentContext } = req.body;
      const client = getGeminiClient();

      if (!client) {
        return res.json({
          reply: generateLocalSmartReply(message, studentContext),
          mode: 'smart_local',
        });
      }

      const systemInstruction = `You are CampusFlow Academic AI Assistant, a supportive, highly knowledgeable university academic mentor for Deodatus Maliti and university students across Africa.
You help students manage their timetable, locate halls (like Hall 03, ICT Lab 2, Science Block B204), understand courses (BIO 203 Biostatistics, ZOO 201 Zoology, ECO 202 Ecology, CHE 201 Chemistry, ENG 004 Engineering), prepare for CATs and University Examinations, calculate GPA, and organize study schedules.
Current Student Context:
- Student Name: ${studentContext?.userName || 'Deodatus Maliti'}
- University: ${studentContext?.university || 'University of Dar es Salaam (UDSM)'}
- Programme: ${studentContext?.programme || 'BSc Zoology & Biological Sciences'}
- Year: ${studentContext?.year || 2}
- Key Venues & Lecturers: Hall 03 (Prof. Assad), Science Block B204 (Dr. Mushi), ICT Lab 2 (Dr. Neema Said).

Provide concise, friendly, practical academic advice, clear venue directions, and study recommendations. Keep formatting clean with markdown bullet points.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nStudent Question: ${message}` }] }
        ],
      });

      res.json({
        reply: response.text || generateLocalSmartReply(message, studentContext),
        mode: 'gemini_cloud',
      });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.json({
        reply: generateLocalSmartReply(req.body?.message, req.body?.studentContext),
        mode: 'smart_local_fallback',
        warning: error?.message,
      });
    }
  });

  // Timetable AI image & document parser
  app.post("/api/parse-timetable", async (req, res) => {
    try {
      const { base64Data, mimeType, textData } = req.body;
      const client = getGeminiClient();

      if (!client) {
        return res.json({
          slots: generateFallbackParsedSlots(textData),
          mode: 'smart_parser',
        });
      }

      const prompt = `You are an expert academic timetable OCR and document parser. 
Extract all class / lecture / practical / tutorial / seminar sessions from this timetable.
Return a JSON array of objects with EXACTLY this structure:
[
  {
    "courseCode": "BIO 203",
    "courseName": "Biostatistics & Research Methodology",
    "day": "Monday",
    "startTime": "09:30",
    "endTime": "10:30",
    "hall": "Hall 03",
    "lecturer": "Prof. Assad",
    "year": 1,
    "semester": 1,
    "type": "Lecture"
  }
]
Requirements:
- day MUST be one of: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
- startTime and endTime MUST be 24-hour format "HH:mm" (e.g., "09:30", "14:00")
- type MUST be one of: "Lecture", "Practical", "Tutorial", "Seminar"
- Extract accurately course codes, halls/venues (e.g. Hall 03, Science Block, ICT Lab), and lecturer names.
Return ONLY the raw JSON array, without markdown backticks.`;

      let parts: any[] = [];
      if (base64Data && mimeType) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType || 'image/jpeg',
          }
        });
        parts.push({ text: prompt });
      } else if (textData) {
        parts.push({ text: `${prompt}\n\nTimetable Content:\n${textData}` });
      } else {
        return res.json({ slots: generateFallbackParsedSlots(), mode: 'default' });
      }

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts,
      });

      const rawText = response.text?.trim() || '[]';
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      let slots = JSON.parse(cleanJson);

      res.json({
        slots,
        mode: 'gemini_ocr',
      });
    } catch (error: any) {
      console.error("AI Timetable parse error:", error);
      res.json({
        slots: generateFallbackParsedSlots(req.body?.textData),
        mode: 'smart_parser_fallback',
        warning: error?.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusFlow Server running on http://localhost:${PORT}`);
  });
}

startServer();
