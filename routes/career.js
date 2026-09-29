const express = require('express');
const router = express.Router();

// Fallback roadmap database for offline or API-free demoing
const CAREER_PROFILES = {
  Technology: {
    title: 'Software Developer / Digital Specialist',
    title_hi: 'सॉफ्टवेयर डेवलपर एवं कंप्यूटर विशेषज्ञ',
    whyFit: [
      'Strong inclination towards logical reasoning and problem solving',
      'Interest in modern computing and internet systems',
      'High remote work and high-growth potential accessible from rural areas'
    ],
    whyFit_hi: [
      'तार्किक सोच और समस्याओं को सुलझाने में गहरी रुचि',
      'कंप्यूटर, मोबाइल ऐप और इंटरनेट तकनीक के प्रति आकर्षण',
      'गांव या छोटे कस्बे से भी ऑनलाइन सीखकर आगे बढ़ने के अपार अवसर'
    ],
    roadmap: [
      { step: 1, title: 'School / 10th Stage', desc: 'Build solid basics in Mathematics, English, and basic computer fundamentals.' },
      { step: 2, title: 'Learn Foundational Coding', desc: 'Start with HTML, CSS, JavaScript, or Python using free mobile-friendly platforms.' },
      { step: 3, title: 'Build Practical Projects', desc: 'Create a simple village information website, calculator, or quiz app.' },
      { step: 4, title: 'Diploma / Degree / Certifications', desc: 'Pursue Polytechnic diploma in CS/IT, BCA, or B.Tech with scholarship support.' },
      { step: 5, title: 'Apprenticeship / Internship', desc: 'Gain real-world experience through digital freelance or entry-level tech internships.' },
      { step: 6, title: 'Junior Software Engineer Role', desc: 'Step into junior web developer, software engineer, or tech support roles.' }
    ],
    skills: ['HTML & CSS Basics', 'JavaScript / Python', 'Algorithmic Logic', 'Git & GitHub', 'English Communication']
  },
  Healthcare: {
    title: 'Community Health Officer / Nursing Specialist',
    title_hi: 'सामुदायिक स्वास्थ्य अधिकारी एवं नर्सिंग विशेषज्ञ',
    whyFit: [
      'Deep desire to serve rural communities and improve grassroots health',
      'Interest in human biology and medical science',
      'Respectful, stable, and essential public career'
    ],
    whyFit_hi: [
      'ग्रामीण और वंचित क्षेत्रों के लोगों के स्वास्थ्य की सेवा करने का जज्बा',
      'जीव विज्ञान और मानव शरीर की कार्यप्रणाली में रुचि',
      'स्थाई, सम्मानजनक और अत्यंत आवश्यक सेवा क्षेत्र'
    ],
    roadmap: [
      { step: 1, title: 'Class 10 Board Completion', desc: 'Score well in Science (Biology) and Chemistry.' },
      { step: 2, title: 'Class 11-12 (PCB)', desc: 'Choose Physics, Chemistry, and Biology stream.' },
      { step: 3, title: 'Entrance Exams', desc: 'Prepare for NEET, B.Sc Nursing entrance, or GNM/ANM diploma tests.' },
      { step: 4, title: 'Medical / Nursing Training', desc: 'Complete clinical hospital rotations with government stipend.' },
      { step: 5, title: 'Government Health Mission', desc: 'Join National Health Mission (NHM) as Community Health Officer (CHO).' }
    ],
    skills: ['First Aid & Triage', 'Basic Pharmacology', 'Empathy & Patient Care', 'Public Health Hygiene']
  },
  'Government Services': {
    title: 'Civil Services / Administrative Officer',
    title_hi: 'प्रशासनिक सेवाएं एवं सरकारी अधिकारी',
    whyFit: [
      'Passion for policy implementation, social justice, and village development',
      'Interest in history, civics, and economic governance',
      'High societal leadership and policy impact'
    ],
    whyFit_hi: [
      'नीतियों के क्रियान्वयन, सामाजिक न्याय और ग्रामीण विकास की ललक',
      'इतिहास, संविधान और भारतीय अर्थव्यवस्था को समझने की रुचि',
      'जिले और प्रखंड स्तर पर नेतृत्व और जनसेवा का अवसर'
    ],
    roadmap: [
      { step: 1, title: 'Foundational Schooling', desc: 'Develop strong habits of newspaper reading and general knowledge.' },
      { step: 2, title: '10+2 Any Stream', desc: 'Maintain high academic performance in Arts, Science, or Commerce.' },
      { step: 3, title: 'Undergraduate Degree', desc: 'Complete any graduation degree while studying NCERTs and current affairs.' },
      { step: 4, title: 'State PSC / SSC Exams', desc: 'Appear for State Public Service Commission (JPSC/BPSC) or Staff Selection Commission.' },
      { step: 5, title: 'Administrative Appointment', desc: 'Serve as Block Development Officer (BDO), Revenue Officer, or Inspector.' }
    ],
    skills: ['General Knowledge & Current Affairs', 'Constitutional Awareness', 'Analytical Essay Writing', 'Hindi & English Fluency']
  },
  Environment: {
    title: 'Agritech Specialist & Sustainable Forestry Officer',
    title_hi: 'कृषि तकनीक विशेषज्ञ एवं वन संरक्षण अधिकारी',
    whyFit: [
      'Deep affinity with nature, forest ecosystems, and sustainable agriculture',
      'Drive to modernize organic farming and water conservation',
      'High demand in soil health and climate adaptation sectors'
    ],
    whyFit_hi: [
      'प्रकृति, वन संपदा और पर्यावरण संरक्षण से गहरा जुड़ाव',
      'जैविक खेती, ड्रिप सिंचाई और मृदा स्वास्थ्य सुधारने की इच्छा',
      'जलवायु परिवर्तन और आधुनिक कृषि क्षेत्र में रोजगार के बढ़ते अवसर'
    ],
    roadmap: [
      { step: 1, title: 'Class 10 Science Foundation', desc: 'Understand plant biology, soil chemistry, and resource stewardship.' },
      { step: 2, title: '10+2 with Agriculture or Science', desc: 'Study Physics, Chemistry, and Biology/Agriculture.' },
      { step: 3, title: 'B.Sc Agriculture / Forestry', desc: 'Clear ICAR AIEEA exam for admission to agricultural universities.' },
      { step: 4, title: 'Field Research & Drones', desc: 'Learn GIS mapping, precision farming, and organic certification.' },
      { step: 5, title: 'Agritech / Forest Ranger Role', desc: 'Join state forest departments, NABARD, or organic agri-enterprises.' }
    ],
    skills: ['Soil Health Testing', 'Organic Farming Techniques', 'Irrigation Management', 'GIS & Satellite Basics']
  }
};

// GET /career - Render Form
router.get('/', (req, res) => {
  res.render('career', {
    activeTab: 'career',
    careerAdvice: null,
    formData: null
  });
});

// POST /career/advice - Generate AI Career Guidance
router.post('/advice', async (req, res) => {
  const { education_level, subjects, interest, skills, work_type } = req.body;
  const chosenInterest = interest || 'Technology';
  const apiKey = process.env.GEMINI_API_KEY;

  let advice = null;

  // 1. If Gemini API Key exists, try live AI generation
  if (apiKey && apiKey.length > 5 && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const prompt = `Student Profile:
Education Level: ${education_level || 'Class 10'}
Subjects: ${subjects || 'Science, Mathematics'}
Primary Interest: ${chosenInterest}
Existing Skills: ${skills || 'Basic problem solving'}
Work Preference: ${work_type || 'Hands-on practical'}

Generate a structured career roadmap tailored for a student from a rural/under-resourced background in India.
Include:
1. Suggested Career Title
2. 3 bullet points on Why it fits
3. A 5-step sequential roadmap from school to entry-level job
4. 4 foundational skills to start learning immediately.
Make sure to emphasize that this is empowering guidance, not a guaranteed outcome.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 750 }
          }),
          signal: AbortSignal.timeout(8000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          advice = {
            rawAiText: candidateText,
            isLive: true,
            title: chosenInterest + ' Specialist',
            interest: chosenInterest
          };
        }
      }
    } catch (err) {
      console.warn('Live Gemini career generation failed, using structured profile:', err.message);
    }
  }

  // 2. Structured Fallback Roadmap
  if (!advice) {
    const profile = CAREER_PROFILES[chosenInterest] || CAREER_PROFILES['Technology'];
    advice = {
      isLive: false,
      title: profile.title,
      title_hi: profile.title_hi,
      whyFit: profile.whyFit,
      whyFit_hi: profile.whyFit_hi,
      roadmap: profile.roadmap,
      skills: profile.skills,
      interest: chosenInterest
    };
  }

  // If request expects JSON (from fetch API)
  if (req.headers['accept']?.includes('application/json')) {
    return res.json(advice);
  }

  // Render view with advice
  res.render('career', {
    activeTab: 'career',
    careerAdvice: advice,
    formData: req.body
  });
});

module.exports = router;
