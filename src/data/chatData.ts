import { StudyGroup, DirectConversation } from '../types';

export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'sg_zoo_201',
    name: 'Zoology Lab & Specimen Study Pod',
    courseCode: 'ZOO 201',
    courseTitle: 'Zoology I (Vertebrate & Invertebrate Diversity)',
    creatorId: 'usr_baraka_02',
    creatorName: 'Baraka Mdee',
    maxMembers: 10,
    currentMembers: 6,
    meetingType: 'Hybrid (Science Block Rm 4 & Google Meet)',
    description: 'Weekly review of invertebrate specimen slides, dissection techniques, and continuous assessment test prep.',
    isJoined: true,
    isMuted: false,
    unreadCount: 0,
    createdAt: '2026-09-15',
    members: [
      {
        userId: 'usr_udsm_2026_094',
        name: 'Deodatus Maliti',
        role: 'member',
        programme: 'BSc Zoology',
        year: 2,
        isOnline: true,
        joinedAt: '2026-09-15'
      },
      {
        userId: 'usr_baraka_02',
        name: 'Baraka Mdee',
        role: 'leader',
        programme: 'BSc Zoology',
        year: 2,
        isOnline: true,
        joinedAt: '2026-09-15'
      },
      {
        userId: 'usr_neema_03',
        name: 'Neema Mwangi',
        role: 'member',
        programme: 'BSc Zoology',
        year: 2,
        isOnline: false,
        joinedAt: '2026-09-16'
      },
      {
        userId: 'usr_sarah_04',
        name: 'Sarah Kimaro',
        role: 'member',
        programme: 'BSc Biology',
        year: 2,
        isOnline: false,
        joinedAt: '2026-09-16'
      },
      {
        userId: 'usr_juma_05',
        name: 'Juma Bakari',
        role: 'member',
        programme: 'BSc Wildlife Ecology',
        year: 2,
        isOnline: true,
        joinedAt: '2026-09-18'
      },
      {
        userId: 'usr_lec_mushi',
        name: 'Dr. A. Mushi',
        role: 'leader',
        programme: 'Faculty Tutor (Zoology)',
        year: 4,
        isOnline: false,
        joinedAt: '2026-09-15'
      }
    ],
    messages: [
      {
        id: 'msg_zg_01',
        authorId: 'usr_lec_mushi',
        authorName: 'Dr. A. Mushi',
        authorRole: 'Senior Lecturer',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        content: '🚨 Notice for Thursday practical: Ensure everyone has reviewed the chordate anatomy slides before arriving at Science Block B204. Scalpels and trays are prepped in Lab 4.',
        timestamp: 'Yesterday at 09:30 AM',
        likes: 8,
        isPinned: true,
        isAlert: true,
        alertType: 'venue',
        reactions: { '👍': ['usr_udsm_2026_094', 'usr_baraka_02', 'usr_neema_03'], '🔬': ['usr_sarah_04'] }
      },
      {
        id: 'msg_zg_02',
        authorId: 'usr_baraka_02',
        authorName: 'Baraka Mdee',
        authorRole: 'Pod Leader',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        content: 'Thanks Dr. Mushi! Does anyone have the specimen identification key PDF downloaded from the study materials archives?',
        timestamp: 'Yesterday at 10:15 AM',
        likes: 2,
        reactions: { '🙋': ['usr_juma_05'] }
      },
      {
        id: 'msg_zg_03',
        authorId: 'usr_udsm_2026_094',
        authorName: 'Deodatus Maliti',
        authorRole: 'Class Rep',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Here is the official practical manual from the materials hub! Page 12 covers the exact dissection procedures and diagram labels.',
        timestamp: 'Yesterday at 11:20 AM',
        likes: 6,
        replyTo: {
          id: 'msg_zg_02',
          authorName: 'Baraka Mdee',
          content: 'Does anyone have the specimen identification key PDF downloaded from the study materials archives?'
        },
        sharedMaterial: {
          id: 'mat_zoo_01',
          title: 'Vertebrate Anatomy & Dissection Guide',
          fileName: 'ZOO201_Lab_Dissection_Guide.pdf',
          fileType: 'pdf',
          courseCode: 'ZOO 201'
        },
        reactions: { '❤️': ['usr_baraka_02', 'usr_sarah_04', 'usr_neema_03'], '🔥': ['usr_juma_05'] }
      },
      {
        id: 'msg_zg_04',
        authorId: 'usr_sarah_04',
        authorName: 'Sarah Kimaro',
        authorRole: 'Student',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        content: 'Super helpful Deo! I also found this comparative vertebrate anatomy visual atlas online:',
        timestamp: 'Today at 08:15 AM',
        likes: 3,
        sharedLink: {
          url: 'https://openstax.org/books/biology-2e/pages/29-introduction',
          title: 'OpenStax Biology - Vertebrate Evolution & Morphology',
          description: 'Free open peer-reviewed chapter on chordates and anatomical taxonomy.'
        },
        reactions: { '💡': ['usr_udsm_2026_094', 'usr_baraka_02'] }
      }
    ]
  },
  {
    id: 'sg_bst_203',
    name: 'Biostatistics R-Studio & SPSS Squad',
    courseCode: 'BIO 203',
    courseTitle: 'Biostatistics & Research Methodology',
    creatorId: 'usr_amina_06',
    creatorName: 'Amina Juma',
    maxMembers: 12,
    currentMembers: 8,
    meetingType: 'Online (Google Meet & WhatsApp)',
    description: 'Collaborative problem sets, ANOVA scripts, hypothesis testing walkthroughs, and past exam reviews.',
    isJoined: true,
    isMuted: false,
    unreadCount: 1,
    createdAt: '2026-09-10',
    members: [
      {
        userId: 'usr_udsm_2026_094',
        name: 'Deodatus Maliti',
        role: 'member',
        programme: 'BSc Zoology',
        year: 2,
        isOnline: true,
        joinedAt: '2026-09-10'
      },
      {
        userId: 'usr_amina_06',
        name: 'Amina Juma',
        role: 'leader',
        programme: 'BSc Computer Science',
        year: 2,
        isOnline: true,
        joinedAt: '2026-09-10'
      },
      {
        userId: 'usr_elizabeth_07',
        name: 'Elizabeth Mushi',
        role: 'member',
        programme: 'BSc Mathematics & Stats',
        year: 2,
        isOnline: false,
        joinedAt: '2026-09-11'
      }
    ],
    messages: [
      {
        id: 'msg_bs_01',
        authorId: 'usr_amina_06',
        authorName: 'Amina Juma',
        authorRole: 'Pod Leader',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        content: 'Hey everyone! Remember Prof. Assad requested us to submit our R markdown knit files by Friday 5 PM. We are holding a study sprint on Meet tonight at 8 PM.',
        timestamp: 'Yesterday at 04:30 PM',
        likes: 5,
        reactions: { '🙌': ['usr_udsm_2026_094', 'usr_elizabeth_07'] }
      },
      {
        id: 'msg_bs_02',
        authorId: 'usr_udsm_2026_094',
        authorName: 'Deodatus Maliti',
        authorRole: 'Class Rep',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'I already tested the dataset with `aov(yield ~ treatment, data=agriData)` and verified normality with Shapiro-Wilk test. Will share our sample script.',
        timestamp: 'Yesterday at 06:10 PM',
        likes: 4,
        reactions: { '💡': ['usr_amina_06'] }
      }
    ]
  },
  {
    id: 'sg_anat_201',
    name: 'Anatomy Cadaver Dissection Peer Circle',
    courseCode: 'ANAT 201',
    courseTitle: 'Human Anatomy & Histology I',
    creatorId: 'usr_neema_03',
    creatorName: 'Neema Mwangi',
    maxMembers: 6,
    currentMembers: 5,
    meetingType: 'In-person (Cadaver Lab 2)',
    description: 'Pre-exam thoracic and abdominal cavity dissection review with senior clinical demonstrators.',
    isJoined: false,
    isMuted: false,
    unreadCount: 0,
    createdAt: '2026-09-08',
    members: [
      {
        userId: 'usr_neema_03',
        name: 'Neema Mwangi',
        role: 'leader',
        programme: 'Doctor of Medicine (MD)',
        year: 2,
        isOnline: false,
        joinedAt: '2026-09-08'
      }
    ],
    messages: [
      {
        id: 'msg_an_01',
        authorId: 'usr_neema_03',
        authorName: 'Neema Mwangi',
        authorRole: 'Pod Leader',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        content: 'Welcome newcomers! Group slots for Cadaver Room 2 are open for next Monday. Click Join Pod to register your station.',
        timestamp: '3 days ago',
        likes: 3,
        reactions: { '🩺': ['usr_udsm_2026_094'] }
      }
    ]
  }
];

export const INITIAL_DIRECT_CONVERSATIONS: DirectConversation[] = [
  {
    id: 'conv_baraka_02',
    participantId: 'usr_baraka_02',
    participantName: 'Baraka Mdee',
    participantRole: 'Student (Zoology Yr 2)',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    participantProgramme: 'BSc Zoology & Biological Sciences',
    participantYear: 2,
    isBlocked: false,
    isMuted: false,
    unreadCount: 0,
    lastMessageTimestamp: '10:45 AM',
    messages: [
      {
        id: 'dm_1',
        authorId: 'usr_baraka_02',
        authorName: 'Baraka Mdee',
        authorRole: 'Student',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        content: 'Habari Deo! Are we still meeting in the Zoology library wing at 3 PM today to compare field survey notes?',
        timestamp: '10:30 AM',
        likes: 0
      },
      {
        id: 'dm_2',
        authorId: 'usr_udsm_2026_094',
        authorName: 'Deodatus Maliti',
        authorRole: 'Class Rep',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Ndiyo Baraka! I will bring my laptop with the R-Studio regression models. Let me also attach the lecture slides we need.',
        timestamp: '10:42 AM',
        likes: 1,
        sharedMaterial: {
          id: 'mat_zoo_02',
          title: 'Chordate Evolution & Taxonomy Slides',
          fileName: 'ZOO201_Chordate_Evolution_Lecture.pptx',
          fileType: 'pptx',
          courseCode: 'ZOO 201'
        },
        reactions: { '👍': ['usr_baraka_02'] }
      },
      {
        id: 'dm_3',
        authorId: 'usr_baraka_02',
        authorName: 'Baraka Mdee',
        authorRole: 'Student',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        content: 'Asante sana! See you in Hall 03 corridor at 3 PM.',
        timestamp: '10:45 AM',
        likes: 1,
        reactions: { '🤝': ['usr_udsm_2026_094'] }
      }
    ]
  },
  {
    id: 'conv_neema_03',
    participantId: 'usr_neema_03',
    participantName: 'Neema Mwangi',
    participantRole: 'Peer Mentor (Medicine Yr 3)',
    participantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    participantProgramme: 'Doctor of Medicine (MD)',
    participantYear: 3,
    isBlocked: false,
    isMuted: false,
    unreadCount: 1,
    lastMessageTimestamp: 'Yesterday',
    messages: [
      {
        id: 'dm_nm_1',
        authorId: 'usr_neema_03',
        authorName: 'Neema Mwangi',
        authorRole: 'Peer Mentor',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        content: 'Hi Deo! I noticed you are leading the Zoology group. If your group needs past CAT exam papers with anatomy answers, let me know and I will send them over.',
        timestamp: 'Yesterday at 02:15 PM',
        likes: 1,
        reactions: { '🙏': ['usr_udsm_2026_094'] }
      }
    ]
  }
];
