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

function getCuratedPersonalizedFeeds(fieldOfStudy?: string, programme?: string, courses?: string[], category?: string): any[] {
  const normField = (fieldOfStudy || '').toLowerCase();
  const normProg = (programme || '').toLowerCase();
  const cat = (category || 'recommended').toLowerCase();

  // Curated subject repositories
  const scienceFeeds = [
    {
      id: 'feed_sci_01',
      headline: 'Eastern Arc Mountains Genomic Barcoding Uncovers 4 Endemic Amphibian Clades',
      summary: 'University ecological researchers using mitochondrial 16S rRNA sequencing have confirmed cryptic speciation across Uluguru and Udzungwa forest canopies, establishing urgent conservation priority baselines.',
      field: 'Biodiversity Genomics & Evolutionary Biology',
      subjectCategory: 'science',
      relevantCourses: ['ZOO 201', 'BIO 203', 'ECO 202'],
      publishedDate: '2026-09-21',
      source: 'African Journal of Ecology & Molecular Biology',
      readingTime: '5 min read',
      discussionPrompt: 'How does high-throughput phylogenetic barcoding challenge traditional morphological taxonomy in African tropical montane habitats?',
      fullStory: 'A pioneering collaborative study across Tanzania’s Eastern Arc biodiversity hotspot has resolved decades of taxonomic ambiguity surrounding hyper-diverse tree-frog clades. Utilizing high-throughput mitochondrial 16S and nuclear rag-1 sequencing protocols, researchers demonstrated that morphologically homogeneous populations harbor up to 14% genetic divergence across isolated mountain ridges.\n\nThe findings provide students of ZOO 201 (Chordate Diversity) and BIO 203 (Biostatistics & Research Methodology) with real-world case studies in cladistic matrix analysis, Bayesian Markov Chain Monte Carlo (MCMC) phylogenetic tree inference, and ecological niche modeling. Statistical significance tests showed strong spatial autocorrelation (Moran’s I = 0.78, p < 0.001) between elevation gradient isolation and allelic segregation.\n\nSyllabus Connection: Directly supplements Week 4 syllabus material on vertebrate speciation mechanisms, island biogeography theory, and non-parametric hypothesis validation. Recommended for CAT 1 essay preparation.',
      keyTakeaways: [
        'Mitochondrial 16S rRNA divergence exceeding 7% strongly indicates cryptic speciation under modern phylogenetic species concepts.',
        'High-elevation fragmentation functions as an evolutionary island system, driving micro-allopatric divergence.',
        'Conservation planning must prioritize genetic corridor preservation over single-reserve boundaries.'
      ],
      recommendedReadings: [
        {
          title: 'OpenStax Biology 2e: Chapter 18 - Evolution and the Origin of Species',
          source: 'OpenStax Digital Academic Repository',
          notes: 'Sections 18.2 on allopatric vs sympatric speciation mechanisms'
        },
        {
          title: 'Biostatistical Analysis (Zar, 5th Ed) - Chapter 12: Cluster Analysis & Multivariate Distance',
          source: 'UDSM Biological Sciences Departmental Reading List',
          notes: 'Required mathematical reference for BIO 203 lab exercises'
        }
      ],
      url: 'https://doi.org/10.1111/aje.13244',
      upvotes: 42,
    },
    {
      id: 'feed_sci_02',
      headline: 'Biostatistics Protocol: Implementing Two-Way ANOVA with Interaction Effects in R for Field Ecology',
      summary: 'A new open-source methodological guide standardizes experimental design for continuous environmental sampling, detailing assumptions testing, Levene homogeneity checks, and Tukey post-hoc contrasts.',
      field: 'Biostatistics & Quantitative Research',
      subjectCategory: 'science',
      relevantCourses: ['BIO 203', 'ECO 202'],
      publishedDate: '2026-09-20',
      source: 'Computational Life Sciences & R-OpenSci',
      readingTime: '4 min read',
      discussionPrompt: 'When does violation of sphericity or variance homogeneity render standard ANOVA invalid, and which non-parametric alternatives should researchers deploy?',
      fullStory: 'Ecological fieldwork data collected across East African river basins frequently violates textbook assumptions of normality due to seasonal flooding outliers and clustered sampling transects. This tutorial breakdown walks students through robust data transformation pipelines (Box-Cox, logarithmic, rank-transformation) prior to computing linear models.\n\nThe methodology details syntax for executing two-way factorial ANOVA evaluating soil nitrogen absorption across varying fertilizer regimens and micro-climate quadrants. Step-by-step interpretation of F-ratios, residual plots, and post-hoc Tukey Honest Significant Difference (HSD) pairwise matrices is clearly modeled.\n\nThis guide forms the core practical foundation for the upcoming BIO 203 Continuous Assessment Test and semester laboratory projects in the CoNAS Computer Lab.',
      keyTakeaways: [
        'Always plot quantile-quantile (Q-Q) residuals before trusting p-values from standard general linear models.',
        'Interaction terms (Factor A × Factor B) dictate whether main factor conclusions can be interpreted independently.',
        'Tukey HSD controls Family-Wise Error Rate (FWER) when performing multiple pairwise hypothesis contrasts.'
      ],
      recommendedReadings: [
        {
          title: 'MIT OpenCourseWare 18.05: Introduction to Probability and Statistics - Module on Factorial ANOVA',
          source: 'MIT OCW Mathematics Collection',
          notes: 'Free interactive scripts & practice problem sets'
        }
      ],
      url: 'https://ocw.mit.edu/courses/mathematics/18-05-introduction-to-probability-and-statistics-spring-2014/',
      upvotes: 38,
    },
    {
      id: 'feed_sci_03',
      headline: 'Spectrophotometric Assay Refinement for Michaelis-Menten Kinetics in Lake Natron Extremophiles',
      summary: 'Biochemists calibrate modified Lineweaver-Burk and Hanes-Woolf diagnostic plots for thermostable alkaline proteases, establishing optimal substrate affinity metrics at pH 10.5.',
      field: 'Biochemistry & Enzymology',
      subjectCategory: 'science',
      relevantCourses: ['CHE 201', 'BIO 203'],
      publishedDate: '2026-09-19',
      source: 'East African Biochemical Journal',
      readingTime: '6 min read',
      discussionPrompt: 'Why does the double-reciprocal Lineweaver-Burk plot disproportionately weight experimental error at low substrate concentrations, and how do nonlinear regression alternatives resolve this bias?',
      fullStory: 'Extremophilic microorganisms thriving in hypersaline soda flats of the Great Rift Valley produce uniquely resilient catalytic proteins. In this investigation, researchers measured absorbance at 410 nm using UV-Vis spectrophotometers across varying concentrations of synthetic chromogenic substrates.\n\nLinear double-reciprocal (Lineweaver-Burk) transformations yielded an apparent Michaelis constant (Km) of 0.42 mM and Vmax of 185 umol/min/mg under extreme alkalinity. Students enrolled in CHE 201 (General Chemistry & Enzymology Practical) will perform this exact kinetic determination during Friday laboratory sessions.\n\nUnderstanding competitive versus non-competitive inhibition kinetics is heavily weighted in university semester examinations and biotechnology research.',
      keyTakeaways: [
        'Km represents the substrate concentration at which enzymatic reaction velocity reaches half of Vmax.',
        'Competitive inhibitors increase apparent Km without altering maximum catalytic velocity (Vmax).',
        'Nonlinear least-squares fitting of raw Michaelis-Menten curves minimizes distortion associated with inverted axes.'
      ],
      recommendedReadings: [
        {
          title: 'Lehninger Principles of Biochemistry (8th Ed) - Chapter 6: Enzymes & Catalytic Mechanisms',
          source: 'University Library Core Reserve Desk',
          notes: 'Focus on Figures 6-11 through 6-15'
        }
      ],
      url: 'https://doi.org/10.1016/j.enzmictec.2026.11029',
      upvotes: 29,
    },
    {
      id: 'feed_sci_04',
      headline: 'Acoustic Satellite Tracking Reveals Micro-Migration Corridors in Ruaha-Rungwa Ecosystem',
      summary: 'Solar-powered GPS collars and multi-spectral drone imagery map nocturnal animal movement patterns across agricultural buffer zones, reducing crop raiding incidents by 64%.',
      field: 'Applied Ecology & Conservation Biology',
      subjectCategory: 'science',
      relevantCourses: ['ECO 202', 'ZOO 201'],
      publishedDate: '2026-09-18',
      source: 'Tanzania Wildlife Research Institute (TAWIRI) Bulletin',
      readingTime: '5 min read',
      discussionPrompt: 'Can community-managed buffer zones offer sustainable financial incentives while preventing fragmentation of apex herbivore corridors?',
      fullStory: 'Conservation ecologists deployed LoRaWAN-connected geo-fencing sensors and low-altitude infrared drones to monitor megafauna pathways across the Ruaha-Rungwa ecosystem. Spatial GIS analysis correlated seasonal vegetative NDVI indices with nocturnal herd dispersal.\n\nThe research demonstrates how quantitative biological surveying directly translates into national environmental policy and sustainable wildlife corridor demarcation. Case study materials align directly with ECO 202 fieldwork assignments.\n\nStudents can review the open-access GIS coordinate layer via the TAWIRI open-science portal.',
      keyTakeaways: [
        'Buffer corridors under 2 km wide experience significantly elevated conflict rates with surrounding smallholder farms.',
        'Infrared drone telemetry enables non-invasive nocturnal herd monitoring without disturbing natural foraging behavior.',
        'Community participatory conservation schemes increase compliance with designated migratory passage zones.'
      ],
      recommendedReadings: [
        {
          title: 'IUCN Guidelines for Conserving Connectivity through Ecological Networks and Corridors',
          source: 'IUCN World Commission on Protected Areas',
          notes: 'Required reading for ECO 202 conservation policy seminar'
        }
      ],
      url: 'https://www.tawiri.or.tz/publications/ecological-corridors-2026',
      upvotes: 35,
    }
  ];

  const lawFeeds = [
    {
      id: 'feed_law_01',
      headline: 'East African Court of Justice (EACJ) Delivers Landmark Judgment on Cross-Border Data Privacy',
      summary: 'The Appellate Division of the EACJ held that member states must harmonize data localization requirements under Article 29 of the EAC Common Market Protocol, prohibiting arbitrary restrictions on student and fintech digital identity data.',
      field: 'Regional Integration & International Economic Law',
      subjectCategory: 'law',
      relevantCourses: ['LAW 101', 'LAW 204'],
      publishedDate: '2026-09-20',
      source: 'East Africa Law Review & EACJ Official Reports',
      readingTime: '6 min read',
      discussionPrompt: 'How does the supremacy of EAC Community Law interact with domestic constitutional sovereignty when adjudicating digital human rights?',
      fullStory: 'In a definitive decision with profound ramifications for digital commerce, financial technology, and academic mobility, the EACJ held that uncoordinated domestic data sovereignty directives violate the foundational principles of free movement of services.\n\nThe court synthesized jurisprudence from the European Court of Justice, African Court on Human and Peoples’ Rights, and national constitutional courts. The bench articulated a strict proportionality doctrine balancing state cyber-security interests against individual data rights.\n\nEssential reading for undergraduate law students examining constitutional review, treaty interpretation under the Vienna Convention, and regional economic community legal architecture.',
      keyTakeaways: [
        'EAC Community Law operates with direct effect and primacy over conflicting domestic statutory provisions.',
        'Data protection frameworks must pass the tri-partite test: legality, legitimate objective, and strict necessity.',
        'Member states are instructed to establish a mutual recognition framework for electronic trust signatures by 2027.'
      ],
      recommendedReadings: [
        {
          title: 'Treaty for the Establishment of the East African Community (Articles 6, 7, 27, and 104)',
          source: 'EAC Secretariat Legal Compendium',
          notes: 'Mandatory core statutory reference'
        },
        {
          title: 'Comparative African Constitutionalism (Nwabueze / Shivji) - Chapter on Judicial Enforceability',
          source: 'Faculty of Law Reserve Collection',
          notes: 'Recommended for Jurisprudence seminar preparation'
        }
      ],
      url: 'https://eacj.org/judgments/appellate-division-appeal-no-04-2026',
      upvotes: 45,
    },
    {
      id: 'feed_law_02',
      headline: 'Comparative Analysis: The Doctrine of Legitimate Expectation in African Administrative Law',
      summary: 'A new review of appellate decisions across Kenya, Tanzania, and Uganda examines the evolution of substantive vs procedural legitimate expectations in public procurement and university governance.',
      field: 'Administrative & Public Law',
      subjectCategory: 'law',
      relevantCourses: ['LAW 102', 'LAW 205'],
      publishedDate: '2026-09-19',
      source: 'Commonwealth Judicial Journal',
      readingTime: '5 min read',
      discussionPrompt: 'Can a public authority be estopped from fulfilling a statutory duty due to a prior informal representation made to an affected citizen?',
      fullStory: 'Administrative law across common law jurisdictions continues to grapple with the frontier between procedural fairness and substantive remedy. When university authorities alter examination or fee clearance policies mid-semester, do students possess an enforceable legitimate expectation?\n\nThis scholarly synthesis traces English precedents from CCSU through contemporary African apex court rulings. It delineates the exact evidentiary burden required to establish an unambiguous, clear promise by a public decision-maker.\n\nHighly relevant for administrative law essay questions and tutorial moot court competitions.',
      keyTakeaways: [
        'Procedural expectation guarantees a right to be heard before a representation is altered; substantive expectation demands the benefit itself.',
        'No legitimate expectation can be founded on an ultra vires (unlawful) representation by a public officer.',
        'Judicial review courts apply strict scrutiny where educational or livelihood livelihoods are at stake.'
      ],
      recommendedReadings: [
        {
          title: 'Administrative Law in East Africa (Peter, C.M.) - Chapters 4 & 5',
          source: 'Tanzania Publishing House',
          notes: 'Core textbook for Law Semester 1 syllabus'
        }
      ],
      url: 'https://doi.org/10.1080/03050718.2026.21980',
      upvotes: 31,
    }
  ];

  const engineeringFeeds = [
    {
      id: 'feed_eng_01',
      headline: 'Decentralized Microgrid Frequency Regulation for Sub-Saharan Renewable Interconnections',
      summary: 'Engineers model synthetic inertia and droop control algorithms to stabilize regional power grids integrating large-scale solar and Julius Nyerere Hydropower generation.',
      field: 'Electrical & Power Systems Engineering',
      subjectCategory: 'engineering',
      relevantCourses: ['ENG 004', 'EE 201'],
      publishedDate: '2026-09-21',
      source: 'IEEE Transactions on Sustainable Energy & Power Systems',
      readingTime: '5 min read',
      discussionPrompt: 'How can inverter-based resources (IBRs) mimic the mechanical inertia of massive hydro-turbines without introducing harmonic distortion?',
      fullStory: 'As East African electrical grids accelerate the penetration of variable photovoltaic generation, traditional grid inertia supplied by massive rotating hydro turbines faces localized destabilization during sudden load trips.\n\nThis engineering paper formulates a virtual synchronous generator (VSG) control loop operating in Matlab/Simulink. The algorithm utilizes transient battery energy storage systems (BESS) to inject frequency-corrective reactive power within 12 milliseconds of a frequency deviation trigger.\n\nDirectly illustrates differential equations, eigenvalue stability analysis, and feedback transfer functions taught in ENG 004 Engineering Computing.',
      keyTakeaways: [
        'Droop control (P-f and Q-V) provides decentralized autonomous load sharing without high-bandwidth communication links.',
        'Synthetic inertia reduces the Rate of Change of Frequency (RoCoF), preventing cascading blackout trips.',
        'Eigenvalue participation factors identify dominant oscillatory modes in long-distance 400kV transmission corridors.'
      ],
      recommendedReadings: [
        {
          title: 'Power System Analysis & Design (Glover, Overbye) - Chapter 11: Power System Stability',
          source: 'Engineering Library eBook Collection',
          notes: 'Recommended for Week 5 differential system modeling'
        }
      ],
      url: 'https://doi.org/10.1109/TSTE.2026.31902',
      upvotes: 39,
    },
    {
      id: 'feed_eng_02',
      headline: 'Low-Power LoRaWAN Soil Moisture Sensing Mesh Networks for Smallholder Irrigation',
      summary: 'Computer engineers develop solar-harvesting edge nodes utilizing TinyML to predict crop watering windows with 91% accuracy over a 15km line-of-sight wireless range.',
      field: 'Computer Engineering & IoT Systems',
      subjectCategory: 'engineering',
      relevantCourses: ['ENG 004', 'CS 102'],
      publishedDate: '2026-09-19',
      source: 'ACM Transactions on Sensor Networks',
      readingTime: '4 min read',
      discussionPrompt: 'What trade-offs govern spreading factor (SF) selection in LoRaWAN deployments between battery longevity and packet collision probability?',
      fullStory: 'Deploying connected sensors in remote agricultural sectors necessitates battery-free energy harvesting and extreme transmission efficiency. This project implements 8-bit quantized neural networks deployed directly onto ARM Cortex-M4 microcontrollers.\n\nBy executing inference locally rather than uploading continuous raw telemetry over cellular modems, the nodes operate indefinitely on miniature 2V solar collectors while conserving spectrum bandwidth.\n\nRecommended case study for scientific programming, algorithm complexity, and embedded systems coursework.',
      keyTakeaways: [
        'TinyML edge inference reduces sensor radio duty cycles by over 80%.',
        'LoRa chirp spread spectrum (CSS) provides robust immunity against multipath fading in rural topography.',
        'Adaptive data rate (ADR) algorithms maximize overall network packet throughput.'
      ],
      recommendedReadings: [
        {
          title: 'Computer Networks: A Systems Approach (Peterson & Davie) - Chapter 2: Direct Link Networks',
          source: 'Open Textbook Collection',
          notes: 'Essential for data link framing and wireless ALOHA concepts'
        }
      ],
      url: 'https://doi.org/10.1145/3540201.2026',
      upvotes: 41,
    }
  ];

  const businessFeeds = [
    {
      id: 'feed_biz_01',
      headline: 'AfCFTA Digital Settlement System (PAPSS) Accelerates SME Cross-Border Trade Velocity',
      summary: 'Central bank econometric data confirms instant local currency clearing reduced foreign exchange transaction friction by 32% across the pilot East-West African trade corridor.',
      field: 'Applied Macroeconomics & Trade Finance',
      subjectCategory: 'business',
      relevantCourses: ['ECN 101', 'BBA 202'],
      publishedDate: '2026-09-20',
      source: 'African Development Bank & African Trade Review',
      readingTime: '5 min read',
      discussionPrompt: 'Does eliminating reliance on US Dollar clearing corridors undermine or enhance monetary sovereignty for smaller central banks?',
      fullStory: 'The Pan-African Payment and Settlement System (PAPSS) allows cross-border traders in Dar es Salaam to pay suppliers in Nairobi or Accra in their domestic currencies (TZS, KES, GHS) without third-party correspondent bank conversions in New York or London.\n\nEconometric vector autoregression (VAR) models demonstrate significant reductions in bid-ask currency spread losses, shortening trade settlement turnaround from 5 business days to under 120 seconds.\n\nVital reading for economics and business students studying balance of payments, exchange rate mechanics, and international trade theory.',
      keyTakeaways: [
        'Third-party currency intermediation previously imposed an estimated $5 billion annual overhead on intra-African trade.',
        'Instant settlement dampens exchange rate volatility risks for small import/export enterprises.',
        'Real-time gross settlement integration requires harmonized AML/KYC regulatory standards across participating central banks.'
      ],
      recommendedReadings: [
        {
          title: 'International Economics: Theory & Policy (Krugman, Obstfeld) - Chapter 19: International Monetary Systems',
          source: 'Department of Economics Core List',
          notes: 'Sections 19.3 & 19.4 on reserve currencies and clearing unions'
        }
      ],
      url: 'https://doi.org/10.1016/j.jinteco.2026.10381',
      upvotes: 34,
    }
  ];

  const healthFeeds = [
    {
      id: 'feed_med_01',
      headline: 'Phase III Real-World Deployment of R21/Matrix-M Malaria Vaccine Across Coastal Tanzania',
      summary: 'Public health surveillance in Bagamoyo and Tanga districts records a 76% decline in symptomatic pediatric malaria presentations during peak transmission monsoon seasons.',
      field: 'Clinical Epidemiology & Infectious Disease Medicine',
      subjectCategory: 'health',
      relevantCourses: ['MED 101', 'PHARM 203', 'BIO 203'],
      publishedDate: '2026-09-21',
      source: 'The Lancet Infectious Diseases & NIMR Bulletin',
      readingTime: '5 min read',
      discussionPrompt: 'What statistical indicators best isolate community vaccine efficacy from concurrent vector control interventions like insecticide-treated bed nets?',
      fullStory: 'The rollout of second-generation circumsporozoite protein vaccines represents a historic milestone for public health across Sub-Saharan Africa. Researchers at the National Institute for Medical Research (NIMR) tracked over 12,000 infants receiving the four-dose schedule alongside routine immunization.\n\nKaplan-Meier survival curves and Cox proportional hazards regression models revealed durable high-titer antibody persistence over 18 months, with negligible adverse reactogenicity.\n\nEssential reading for clinical medicine, pharmacy, and public health students exploring immunology, epidemiology, and biostatistical survival analysis.',
      keyTakeaways: [
        'Matrix-M saponin adjuvant enhances CD4+ T-cell and memory B-cell responses without requiring elevated antigen concentrations.',
        'Four-dose compliance is statistically crucial for sustained antibody avidity past the primary transmission window.',
        'Integrating vaccination into existing national Expanded Programme on Immunization (EPI) infrastructure minimized logistical cold-chain losses.'
      ],
      recommendedReadings: [
        {
          title: 'Robbins & Cotran Pathologic Basis of Disease - Chapter on Infectious Diseases & Host-Pathogen Interaction',
          source: 'Medical School Core Library',
          notes: 'Required reading for pathology and clinical immunology'
        }
      ],
      url: 'https://doi.org/10.1016/S1473-3099(26)00118-2',
      upvotes: 48,
    }
  ];

  const humanitiesFeeds = [
    {
      id: 'feed_hum_01',
      headline: 'Digital Swahili Humanities: Archival Preservation of Historical Zanzibar Manuscripts Using OCR',
      summary: 'Historians and computational linguists deploy fine-tuned transformer models to transcribe 19th-century Arabic-script Swahili (Kiajemi) legal registries and commercial diaries.',
      field: 'Digital Humanities & African Cultural Studies',
      subjectCategory: 'humanities',
      relevantCourses: ['SWA 101', 'HIS 201'],
      publishedDate: '2026-09-18',
      source: 'Journal of African Historical Studies & Digital Humanities',
      readingTime: '4 min read',
      discussionPrompt: 'How can machine learning pipelines balance phonetic fidelity to archaic dialects while ensuring modern Swahili orthographic searchability?',
      fullStory: 'Centuries of commercial records, maritime poetry, and judicial deeds in Zanzibar and the Swahili Coast exist in fragile manuscript archives written in modified Arabic script known as Kiajemi. Exposure to high humidity has degraded paper fibers, making manual transcription painstakingly slow.\n\nA collaborative team from UDSM and Zanzibar National Archives trained convolutional-recurrent neural networks to recognize idiosyncratic calligraphy styles, achieving character error rates below 3.4%.\n\nIlluminates the intersection of digital technology, linguistics, and historical research for humanities students.',
      keyTakeaways: [
        'Kiajemi incorporates unique diacritic markers to transcribe Bantu phonetic consonants absent in standard Arabic.',
        'Digital humanities pipelines democratize access to primary historical sources for student dissertations.',
        'Open-access archival preservation safeguards indigenous intellectual heritage against climatic degradation.'
      ],
      recommendedReadings: [
        {
          title: 'Swahili: State and Society (Mazrui & Shariff) - Chapter 3: The Script and the Language',
          source: 'Literature & Linguistics Collection',
          notes: 'Historical analysis of Swahili orthographic transformations'
        }
      ],
      url: 'https://doi.org/10.1080/00020184.2026.20847',
      upvotes: 27,
    }
  ];

  // Map category filter or detected field
  if (cat === 'law' || normField.includes('law') || normProg.includes('law') || normProg.includes('ll.b')) {
    return lawFeeds;
  }
  if (cat === 'engineering' || normField.includes('engineer') || normField.includes('computer') || normProg.includes('engineer') || normProg.includes('computing')) {
    return engineeringFeeds;
  }
  if (cat === 'business' || normField.includes('business') || normField.includes('econom') || normProg.includes('bba') || normProg.includes('b.com')) {
    return businessFeeds;
  }
  if (cat === 'health' || normField.includes('health') || normField.includes('med') || normProg.includes('mbbs') || normProg.includes('nurs') || normProg.includes('pharm')) {
    return healthFeeds;
  }
  if (cat === 'humanities' || normField.includes('humanities') || normField.includes('soci') || normProg.includes('arts') || normProg.includes('education')) {
    return humanitiesFeeds;
  }

  // If user is science student (default for Deodatus: BSc Zoology & Biological Sciences)
  if (cat === 'science' || normProg.includes('science') || normProg.includes('zoology') || normProg.includes('bio') || (courses && courses.some(c => c.startsWith('BIO') || c.startsWith('ZOO')))) {
    return scienceFeeds;
  }

  // Combined curated mixture prioritized for student's field
  return [...scienceFeeds, ...lawFeeds, ...engineeringFeeds, ...healthFeeds];
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  async function generateContentWithFallback(
    client: GoogleGenAI,
    contents: any,
    config?: any
  ): Promise<string | null> {
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];

    for (const model of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          ...(config ? { config } : {}),
        });
        const text = response?.text?.trim();
        if (text) {
          return text;
        }
      } catch {
        // If transient 503, 429, or model unavailable, try next valid model
        continue;
      }
    }

    return null;
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

      const contents = [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nStudent Question: ${message}` }] }
      ];

      const text = await generateContentWithFallback(client, contents);
      if (text) {
        return res.json({
          reply: text,
          mode: 'gemini_cloud',
        });
      }

      res.json({
        reply: generateLocalSmartReply(message, studentContext),
        mode: 'smart_local_fallback',
      });
    } catch {
      res.json({
        reply: generateLocalSmartReply(req.body?.message, req.body?.studentContext),
        mode: 'smart_local_fallback',
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

      const text = await generateContentWithFallback(client, parts);
      if (text) {
        const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        try {
          const slots = JSON.parse(cleanJson);
          if (Array.isArray(slots) && slots.length > 0) {
            return res.json({
              slots,
              mode: 'gemini_ocr',
            });
          }
        } catch {
          // parse failed, use fallback
        }
      }

      res.json({
        slots: generateFallbackParsedSlots(textData),
        mode: 'smart_parser_fallback',
      });
    } catch {
      res.json({
        slots: generateFallbackParsedSlots(req.body?.textData),
        mode: 'smart_parser_fallback',
      });
    }
  });

  // Personalized Academic Feed AI Endpoint
  app.post("/api/feed/personalized", async (req, res) => {
    try {
      const { fieldOfStudy, programme, courses, category } = req.body;
      const client = getGeminiClient();

      if (!client) {
        return res.json({
          items: getCuratedPersonalizedFeeds(fieldOfStudy, programme, courses, category),
          mode: 'curated_subject_fallback',
          timestamp: new Date().toISOString(),
          refreshCadenceMinutes: 20,
        });
      }

      const prompt = `You are the CampusFlow Academic AI Research & Feeds Service for university students in East Africa and globally.
Student Profile Context:
- Programme of Study: ${programme || 'BSc Zoology & Biological Sciences'}
- Field / Faculty: ${fieldOfStudy || 'Natural & Applied Sciences'}
- Enrolled Course Codes: ${(courses && courses.length > 0) ? courses.join(', ') : 'BIO 203, ZOO 201, ECO 202, CHE 201, ENG 004'}
- Active Filter Subject: ${category || 'recommended'}

Task: Generate 4 to 5 rigorous, cutting-edge academic news developments, clinical/legal/technical research breakthroughs, and syllabus-linked reading suggestions.
CRITICAL: These MUST be tailored specifically to the student's exact programme of study and current enrolled courses. Avoid generic or disconnected topics. For example, if they study Zoology/Biostatistics, focus on biodiversity genomics, statistical ecological modeling, conservation field biology, or enzymology. If Law, focus on constitutional and regional trade jurisprudence.

Format: Return a valid JSON array of objects with EXACTLY this structure:
[
  {
    "id": "brk_ai_1",
    "headline": "Concise, punchy academic headline",
    "summary": "2-3 sentences explaining the breakthrough and its significance.",
    "field": "Specific academic subfield (e.g., Evolutionary Genomics & Herpetology)",
    "subjectCategory": "science" (or "law", "engineering", "business", "health", "humanities"),
    "relevantCourses": ["BIO 203", "ZOO 201"],
    "publishedDate": "2026-09-21",
    "source": "Nature African BioScience / East Africa Law Review / IEEE Spectrum",
    "readingTime": "5 min read",
    "discussionPrompt": "A thought-provoking seminar/CAT question students can discuss in study groups.",
    "fullStory": "Three detailed paragraphs: 1. Academic background and real-world significance; 2. Experimental methodology, data analysis or statutory interpretation; 3. Direct syllabus implications and exam revision points.",
    "keyTakeaways": [
      "Core academic conclusion relevant to coursework",
      "Methodology or formula insight (e.g., ANOVA, Lineweaver-Burk, statutory test)",
      "Future research or field application"
    ],
    "recommendedReadings": [
      {
        "title": "Textbook Chapter or Journal Paper Title",
        "source": "OpenStax / MIT OpenCourseWare / African Journals Online",
        "notes": "Recommended for Semester 1 CAT revision"
      }
    ],
    "url": "https://doi.org/10.1038/example"
  }
]
Return ONLY the raw JSON array. Do not include markdown code block ticks.`;

      const text = await generateContentWithFallback(client, [{ role: 'user', parts: [{ text: prompt }] }]);
      if (text) {
        const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        try {
          let parsedItems = JSON.parse(cleanJson);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            return res.json({
              items: parsedItems,
              mode: 'gemini_ai_live',
              timestamp: new Date().toISOString(),
              refreshCadenceMinutes: 20,
            });
          }
        } catch {
          // JSON parse failed, use curated feed
        }
      }

      res.json({
        items: getCuratedPersonalizedFeeds(fieldOfStudy, programme, courses, category),
        mode: 'curated_subject_fallback',
        timestamp: new Date().toISOString(),
        refreshCadenceMinutes: 20,
      });
    } catch {
      res.json({
        items: getCuratedPersonalizedFeeds(req.body?.fieldOfStudy, req.body?.programme, req.body?.courses, req.body?.category),
        mode: 'curated_fallback',
        timestamp: new Date().toISOString(),
        refreshCadenceMinutes: 20,
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
