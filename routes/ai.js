const express = require('express');
const router = express.Router();

const LANG_NAMES = {
  hi: 'Hindi',
  en: 'English',
  bn: 'Bengali',
  or: 'Odia',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  ta: 'Tamil',
  sat: 'Santhali'
};

const SYSTEM_PROMPT = `You are EduSaarthi, an educational AI tutor for students from rural and tribal regions. Explain concepts clearly and simply. Adapt explanations to the student's education level. Always answer directly in the requested target language using natural, simple, and warm expressions. Use examples from everyday rural life (such as agriculture, bicycles, cooking, rivers, nature, weather) when useful. For academic questions, prioritize conceptual understanding. For mathematical problems, show step-by-step reasoning. Never pretend to know information you do not know. Keep your tone encouraging and patient.`;

// Curated educational responses for fallback mode across languages
const FALLBACK_TOPICS = {
  photosynthesis: {
    en: `### What is Photosynthesis?
Photosynthesis is how green plants make their own food using sunlight.

#### Simple Recipe:
1. **Raw Ingredients:** Carbon dioxide ($CO_2$) from air + Water ($H_2O$) from soil.
2. **Kitchen:** The green leaves containing **chlorophyll**.
3. **Stove/Heat Source:** **Sunlight**.
4. **Finished Dish:** Glucose (food for energy) + Oxygen ($O_2$) released for all living beings to breathe!

**Everyday Analogy:** Just like a farmer uses seeds, water, and sun to grow wheat, the leaf uses chlorophyll like solar panels to bake food.`,

    hi: `### प्रकाश संश्लेषण (Photosynthesis) क्या है?
प्रकाश संश्लेषण वह प्राकृतिक प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश की मदद से अपना भोजन स्वयं बनाते हैं।

#### आसान चरण:
1. **सामग्री:** हवा से कार्बन डाइऑक्साइड ($CO_2$) + जड़ों से पानी ($H_2O$)।
2. **रसोई घर:** हरी पत्तियां, जिनमें **क्लोरोफिल** (हरा वर्णक) होता है।
3. **ऊर्जा का स्रोत:** **सूर्य का प्रकाश**।
4. **तैयार भोजन:** ग्लूकोज (पौधों की वृद्धि के लिए) और **ऑक्सीजन** ($O_2$), जिससे हम सब सांस लेते हैं!

**दैनिक उदाहरण:** जैसे घर में चूल्हे की गर्मी और पानी-अनाज से भोजन पकता है, वैसे ही पत्तियां धूप की मदद से पौधे के लिए भोजन पकाती हैं।`,

    bn: `### সালোকসংশ্লেষ (Photosynthesis) কী?
সালোকসংশ্লেষ হলো এমন একটি প্রাকৃতিক প্রক্রিয়া যার মাধ্যমে সবুজ উদ্ভিদ সূর্যালোকের সাহায্যে নিজেদের খাদ্য তৈরি করে।

#### সহজ ধাপসমূহ:
1. **উপাদান:** বাতাস থেকে কার্বন ডাই অক্সাইড ($CO_2$) + মাটি থেকে জল ($H_2O$)।
2. **রান্নাঘর:** সবুজ পাতা, যাতে **ক্লোরোফিল** থাকে।
3. **শক্তির উৎস:** **সূর্যের আলো**।
4. **উৎপাদিত খাদ্য:** গ্লুকোজ (উদ্ভিদের বৃদ্ধির জন্য) এবং **অক্সিজেন** ($O_2$), যা আমরা শ্বাস নিতে ব্যবহার করি!

**বাস্তব জীবনের উদাহরণ:** যেমন ঘরে উনানের তাপে জল ও চাল দিয়ে ভাত রান্না হয়, তেমনই গাছের পাতা সূর্যের আলো ও জল দিয়ে খাবার তৈরি করে।`,

    or: `### ଆଲୋକ ଶ୍ଳେଷଣ (Photosynthesis) କ'ଣ?
ଆଲୋକ ଶ୍ଳେଷଣ ହେଉଛି ସେହି ପ୍ରାକୃତିକ ପ୍ରକ୍ରିୟା ଯାହା ଦ୍ୱାରା ସବୁଜ ଉଦ୍ଭିଦ ସୂର୍ଯ୍ୟାଲୋକର ସାହାଯ୍ୟରେ ନିଜ ଖାଦ୍ୟ ନିଜେ ପ୍ରସ୍ତୁତ କରେ।

#### ସରଳ ପଦକ୍ଷେପ:
1. **ଉପାଦାନ:** ବାୟୁରୁ ଅଙ୍ଗାରକାମ୍ଳ ($CO_2$) + ଚେର ମାଧ୍ୟମରେ ମାଟିରୁ ଜଳ ($H_2O$)।
2. **ରୋଷେଇ ଘର:** ସବୁଜ ପତ୍ର, ଯେଉଁଥିରେ **ହରିତକଣିକା (କ୍ଲୋରୋଫିଲ୍)** ଥାଏ।
3. **ଶକ୍ତିର ଉତ୍ସ:** **ସୂର୍ଯ୍ୟକିରଣ**।
4. **ପ୍ରସ୍ତୁତ ଖାଦ୍ୟ:** ଗ୍ଲୁକୋଜ୍ ଏବଂ **ଅମ୍ଳଜାନ** ($O_2$), ଯାହା ଆମେ ଶ୍ୱାସକ୍ରିୟାରେ ନେଉ!

**ଦୈନନ୍ଦିନ ଉଦାହରଣ:** ଯେପରି ଚୁଲିରେ ପାଣି ଓ ଚାଉଳ ଦ୍ୱାରା ଭାତ ରନ୍ଧା ହୁଏ, ସେହିପରି ଗଛର ପତ୍ର ସୂର୍ଯ୍ୟକିରଣରେ ନିଜ ଖାଦ୍ୟ ତିଆରି କରେ।`,

    te: `### కిరణజన్య సంయోగక్రియ (Photosynthesis) అంటే ఏమిటి?
కిరణజన్య సంయోగక్రియ అనేది ఆకుపచ్చని మొక్కలు సూర్యరశ్మి సహాయంతో తమ స్వంత ఆహారాన్ని తయారు చేసుకునే సహజ ప్రక్రియ.

#### సులభమైన దశలు:
1. **కావలసిన పదార్థాలు:** గాలి నుండి కార్బన్ డయాక్సైడ్ ($CO_2$) + నేల నుండి నీరు ($H_2O$).
2. **వంటగది:** **క్లోరోఫిల్** కలిగిన ఆకుపచ్చని ఆకులు.
3. **శక్తి మూలం:** **సూర్యకాంతి**.
4. **తయారైన ఆహారం:** గ్లూకోజ్ మరియు జీవుల శ్వాసక్రియకు ఉపయోగపడే **ఆక్సిజన్** ($O_2$)!

**నిత్యజీవిత ఉదాహరణ:** మనం పొయ్యిపై నీరు, ధాన్యంతో ఆహారాన్ని వండినట్లే, మొక్కల ఆకులు సూర్యకాంతి సహాయంతో ఆహారాన్ని తయారు చేసుకుంటాయి.`,

    mr: `### प्रकाशसंश्लेषण (Photosynthesis) म्हणजे काय?
प्रकाशसंश्लेषण ही एक नैसर्गिक प्रक्रिया आहे ज्याद्वारे हिरव्या वनस्पती सूर्यप्रकाशाच्या मदतीने स्वतःचे अन्न स्वतः तयार करतात.

#### सोपे टप्पे:
1. **साहित्य:** हवेतील कार्बन डायऑक्साइड ($CO_2$) + मुळांमार्फत जमिनीतील पाणी ($H_2O$).
2. **स्वयंपाकघर:** हिरवी पाने, ज्यामध्ये **क्लोरोफिल** (हरितद्रव्य) असते.
3. **ऊर्जेचा स्रोत:** **सूर्यप्रकाश**.
4. **तयार अन्न:** ग्लुकोज आणि सर्व सजीवांसाठी आवश्यक असणारा **ऑक्सिजन** ($O_2$)!

**दैनंदिन उदाहरण:** जसे आपण चुलीवर पाणी आणि धान्यापासून जेवण बनवतो, तसेच वनस्पतींची पाने सूर्यप्रकाशात अन्न शिजवतात.`
  },

  sky_blue: {
    en: `### Why is the Sky Blue?
Sunlight is actually a mixture of all the rainbow colors. Blue light travels in smaller, shorter waves and scatters in all directions as it hits gas molecules in the atmosphere, filling our sky with blue light!`,
    hi: `### आकाश नीला क्यों दिखाई देता है?
सूर्य के प्रकाश में सातों रंग होते हैं। नीले रंग की तरंगें सबसे छोटी होती हैं और वायुमंडल के गैस कणों से टकराकर सबसे ज्यादा चारों तरफ बिखर जाती हैं, जिससे आकाश नीला दिखता है!`,
    bn: `### আকাশ নীল দেখায় কেন?
সূর্যের আলোতে রামধনুর সব রং মিশে থাকে। নীল রঙের তরঙ্গদৈর্ঘ্য কম হওয়ায় তা বায়ুমণ্ডলের ধূলিকণা ও গ্যাসে বাধা পেয়ে আকাশে সবচেয়ে বেশি ছড়িয়ে পড়ে, তাই আকাশ নীল দেখায়।`,
    or: `### ଆକାଶ ନୀଳ କାହିଁକି ଦେଖାଯାଏ?
ସୂର୍ଯ୍ୟାଲୋକରେ ସାତୋଟି ରଙ୍ଗ ଥାଏ। ନୀଳ ରଙ୍ଗର ତରଙ୍ଗଦୈର୍ଘ୍ୟ କମ୍ ଥିବାରୁ ଏହା ବାୟୁମଣ୍ଡଳରେ ସର୍ବାଧିକ ବିଚ୍ଛୁରିତ ହୋଇ ଆମ ଆଖିରେ ପହଞ୍ଚେ, ତେଣୁ ଆକାଶ ନୀଳ ଦିଶେ।`,
    te: `### ఆకాశం నీలంగా ఎందుకు కనిపిస్తుంది?
సూర్యకాంతిలో ఏడు రంగులు ఉంటాయి. నీలి రంగు తరంగదైర్ఘ్యం తక్కువగా ఉండటం వల్ల వాతావరణంలోని కణాలతో ఢీకొని అన్ని దిశలా ఎక్కువగా వ్యాపిస్తుంది, అందుకే ఆకాశం నీలంగా కనిపిస్తుంది.`,
    mr: `### आकाश निळे का दिसते?
सूर्यप्रकाशात सात रंग असतात. निळ्या रंगाची तरंगलांबी सर्वात कमी असल्याने तो वातावरणातील सूक्ष्म कणांवर आदळून सर्वत्र विखुरतो, त्यामुळे आकाश निळे दिसते.`
  },

  newton_third: {
    en: `### Newton's Third Law of Motion
**"For every action, there is an equal and opposite reaction."**
- **Walking:** Foot pushes ground back; ground pushes foot forward.
- **Swimming:** Arms push water back; water pushes swimmer forward.`,
    hi: `### न्यूटन का तीसरा गति नियम
**"प्रत्येक क्रिया के बराबर और विपरीत दिशा में प्रतिक्रिया होती है।"**
- **चलना:** पैर जमीन को पीछे धकेलता है; जमीन पैर को आगे धकेलती है।
- **नदी में तैरना:** हाथ पानी को पीछे फेंकते हैं; पानी शरीर को आगे बढ़ाता है।`,
    bn: `### নিউটনের তৃতীয় গতিসূত্র
**"প্রত্যেক ক্রিয়ারই একটি সমান ও বিপরীত প্রতিক্রিয়া আছে।"**
- **হাঁটা:** পা মাটিকে পিছনের দিকে ঠেলে; মাটি পা-কে সামনের দিকে এগিয়ে দেয়।
- **সাঁতার:** হাত জলকে পিছনে ঠেলে; জল শরীরকে সামনে এগিয়ে নিয়ে যায়।`,
    or: `### ନ୍ୟୁଟନଙ୍କ ତୃତୀୟ ଗତି ନିୟମ
**"ପ୍ରତ୍ୟେକ କ୍ରିୟାର ଏକ ସମାନ ଏବଂ ବିପରୀତ ପ୍ରତିକ୍ରିୟା ଥାଏ।"**
- **ଚାଲିବା:** ପାଦ ମାଟିକୁ ପଛକୁ ଠେଲେ; ମାଟି ପାଦକୁ ଆଗକୁ ବଢ଼ାଏ।
- **ପହଁରିବା:** ହାତ ପାଣିକୁ ପଛକୁ ଠେଲେ; ପାଣି ଶରୀରକୁ ଆଗକୁ ନିଏ।`,
    te: `### న్యూటన్ మూడవ చలన సూత్రం
**"ప్రతి చర్యకు సమానమైన మరియు వ్యతిరేకమైన ప్రతిచర్య ఉంటుంది."**
- **నడక:** పాదం భూమిని వెనక్కి నెడుతుంది; భూమి పాదాన్ని ముందుకు నెడుతుంది.
- **ఈత:** చేతులు నీటిని వెనక్కి నెడతాయి; నీరు శరీరాన్ని ముందుకు నెడుతుంది.`,
    mr: `### न्यूटनचा तिसरा गतीचा नियम
**"प्रत्येक क्रियेला समान आणि विरुद्ध दिशेने प्रतिक्रिया असते."**
- **चालणे:** पाय जमिनीला मागे ढकलतो; जमीन पायाला पुढे ढकलते.
- **पोहणे:** हात पाण्याला मागे ढकलतात; पाणी शरीराला पुढे नेते.`
  },

  math_problem: {
    en: `### Step-by-Step Math Problem Solving
1. Write down what is **Given**.
2. Label the unknown as **$x$**.
3. Form the mathematical **Equation**.
4. Solve step-by-step using inverse operations.
5. Verify your answer in the original equation!`,
    hi: `### गणित के सवाल हल करने के 5 आसान चरण
1. प्रश्न में दी गई जानकारी (**ज्ञात मान**) को लिखें।
2. जो निकालना है उसे **$x$** मानें।
3. प्रश्न के अनुसार **समीकरण** बनाएं।
4. चरणबद्ध तरीके से $x$ का मान ज्ञात करें।
5. उत्तर की जांच करें!`,
    bn: `### গণিতের সমস্যা সমাধানের সহজ নিয়ম
১. প্রশ্নে কী দেওয়া আছে তা স্পষ্টভাবে লিখুন।
২. যা বের করতে হবে তাকে **$x$** ধরুন।
৩. শর্ত অনুযায়ী **সমীকরণ** তৈরি করুন।
৪. ধাপে ধাপে সমীকরণটি সমাধান করুন।
৫. প্রাপ্ত উত্তরটি যাচাই করুন!`,
    or: `### ଗଣିତ ପ୍ରଶ୍ନ ସମାଧାନର ସରଳ ପଦ୍ଧତି
୧. ପ୍ରଶ୍ନରେ କ'ଣ ଦିଆଯାଇଛି ତାହା ଲେଖନ୍ତୁ।
୨. ଯାହା ନିର୍ଣ୍ଣୟ କରିବାକୁ ହେବ ତାକୁ **$x$** ଧରନ୍ତୁ।
୩. ସର୍ତ୍ତ ଅନୁଯାୟୀ ଏକ **ସମୀକରଣ** ଗଠନ କରନ୍ତୁ।
୪. ଧাপে ଧাপে ସମାଧାନ କରି $x$ ର ମୂଲ୍ୟ ବାହାର କରନ୍ତୁ।
୫. ଉତ୍ତରର ଯାଞ୍ଚ କରନ୍ତୁ!`,
    te: `### గణిత సమస్యలను సాధించే సులభమైన దశలు
1. లెక్కలో ఇచ్చిన వివరాలను రాసుకోండి.
2. కనుగొనవలసిన విలువను **$x$** అనుకోండి.
3. వివరాల ప్రకారం **సమీకరణాన్ని** రూపొందించండి.
4. క్రమపద్ధతిలో సాధించి $x$ విలువను కనుగొనండి.
5. జవాబును సరిచూసుకోండి!`,
    mr: `### गणिताचे प्रश्न सोडवण्याची सोपी पद्धत
१. प्रश्नात दिलेली माहिती लिहून घ्या.
२. शोधायच्या मूल्याला **$x$** माना.
३. दिलेल्या अटींनुसार **समीकरण** तयार करा.
४. टप्प्याटप्प्याने सोडवून $x$ ची किंमत काढा.
५. उत्तर बरोबर आहे का ते पडताळून पहा!`
  }
};

// GET /tutor - Render AI Tutor Page
router.get('/', (req, res) => {
  res.render('tutor', {
    activeTab: 'tutor',
    initialMode: req.query.mode || 'text'
  });
});

// POST /api/ai/chat or /tutor/chat - Process Chat Query
router.post('/chat', async (req, res) => {
  const { message, language = 'hi', educationLevel = 'Class 10', history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const userQuery = message.trim();
  const lowerQuery = userQuery.toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;
  const targetLanguageName = LANG_NAMES[language] || 'Hindi';

  // 1. Attempt Gemini Live API Call if Key is present
  if (apiKey && apiKey.length > 5 && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: `${SYSTEM_PROMPT}\nStudent Education Level: ${educationLevel}.\nTarget Response Language: ${targetLanguageName} (${language}).\nPlease answer accurately, simply, and warmly entirely in ${targetLanguageName} with clear step-by-step everyday life examples.` }]
            },
            contents: [
              ...history.slice(-4).map(h => ({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
              })),
              {
                role: 'user',
                parts: [{ text: userQuery }]
              }
            ],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 650
            }
          }),
          signal: AbortSignal.timeout(8000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates && data.candidates[0];
        if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0]) {
          return res.json({
            reply: candidate.content.parts[0].text,
            source: 'gemini-live',
            language
          });
        }
      } else {
        console.warn('Gemini API returned error status:', response.status);
      }
    } catch (apiErr) {
      console.warn('Gemini API call failed or timed out:', apiErr.message);
    }
  }

  // 2. Resilient Multilingual Educational Fallback Mode
  let matchedTopic = null;

  if (
    lowerQuery.includes('photo') || lowerQuery.includes('संश्लेषण') || lowerQuery.includes('प्रकाश') ||
    lowerQuery.includes('সালোকসংশ্লেষ') || lowerQuery.includes('ଆଲୋକ') || lowerQuery.includes('కిరణజన్య')
  ) {
    matchedTopic = FALLBACK_TOPICS.photosynthesis;
  } else if (
    lowerQuery.includes('sky') || lowerQuery.includes('blue') || lowerQuery.includes('नीला') || lowerQuery.includes('आसमान') ||
    lowerQuery.includes('নীল') || lowerQuery.includes('ନୀଳ') || lowerQuery.includes('నీలం')
  ) {
    matchedTopic = FALLBACK_TOPICS.sky_blue;
  } else if (
    lowerQuery.includes('newton') || lowerQuery.includes('न्यूटन') || lowerQuery.includes('third law') || lowerQuery.includes('गति') ||
    lowerQuery.includes('নিউটনের') || lowerQuery.includes('ନ୍ୟୁଟନ') || lowerQuery.includes('న్యూటన్')
  ) {
    matchedTopic = FALLBACK_TOPICS.newton_third;
  } else if (
    lowerQuery.includes('math') || lowerQuery.includes('गणित') || lowerQuery.includes('हल') || lowerQuery.includes('solve') ||
    lowerQuery.includes('অঙ্ক') || lowerQuery.includes('ଗଣିତ') || lowerQuery.includes('లెక్క')
  ) {
    matchedTopic = FALLBACK_TOPICS.math_problem;
  }

  if (matchedTopic) {
    const regionalReply = matchedTopic[language] || matchedTopic.hi || matchedTopic.en;
    return res.json({
      reply: regionalReply,
      source: 'offline-knowledge-base',
      language
    });
  }

  // Generic multilingual fallback
  let genericResponse = `### EduSaarthi AI (${targetLanguageName}):\n\n**Question:** "${userQuery}"\n\n- **Concept:** This is a vital question in your curriculum. Breaking it down step-by-step makes it easiest to understand.\n- **Everyday Analogy:** Just like small streams join together to form a river, small concepts connect to solve complex problems.\n\n*(Note: Offline mode. Add GEMINI_API_KEY in .env for custom live generative responses.)*`;

  if (language === 'hi') {
    genericResponse = `### एडू-सारथी एआई:\n\n**प्रश्न:** "${userQuery}"\n\n- **मुख्य विचार:** यह अवधारणा आपके अध्ययन के महत्वपूर्ण सिद्धांतों से जुड़ी है। इसे छोटे-छोटे चरणों में समझना सबसे आसान होता है।\n- **दैनिक उदाहरण:** जैसे छोटी-छोटी धाराएं मिलकर बड़ी नदी बनाती हैं, वैसे ही बुनियादी सिद्धांत मिलकर बड़े सवालों को आसान करते हैं।\n\n*(नोट: सजीव उत्तर के लिए अपना GEMINI_API_KEY .env में जोड़ें।)*`;
  } else if (language === 'bn') {
    genericResponse = `### এডু-সারথী এআই:\n\n**প্রশ্ন:** "${userQuery}"\n\n- **মূল ধারণা:** এটি আপনার পাঠ্যক্রমের একটি গুরুত্বপূর্ণ বিষয়। এটিকে সহজ ধাপে ভাগ করে বোঝা সবচেয়ে ভালো।\n- **বাস্তব উদাহরণ:** যেমন ছোট ছোট জলধারা মিলে নদী তৈরি হয়, তেমনই ছোট ছোট নিয়ম মিলে জটিল সমস্যার সমাধান করে।`;
  } else if (language === 'or') {
    genericResponse = `### ଏଡୁ-ସାରଥି ଏଆଇ:\n\n**ପ୍ରଶ୍ନ:** "${userQuery}"\n\n- **ମୁଖ୍ୟ ଧାରଣା:** ଏହା ଆପଣଙ୍କ ପାଠ୍ୟକ୍ରମର ଏକ ମହତ୍ତ୍ୱପୂର୍ଣ୍ଣ ପ୍ରଶ୍ନ। ଏହାକୁ ଛୋଟ ଛୋଟ ପଦକ୍ଷେପରେ ବୁଝିବା ସବୁଠାରୁ ସହଜ।\n- **ଦୈନନ୍ଦିନ ଉଦାହରଣ:** ଯେପରି ଛୋଟ ଝରଣା ମିଶି ନଦୀ ହୁଏ, ସେହିପରି ମୌଳିକ ନିୟମଗୁଡ଼ିକ କଠିନ ସମସ୍ୟାକୁ ସହଜ କରେ।`;
  } else if (language === 'te') {
    genericResponse = `### ఎడ్యుసారథి AI:\n\n**ప్రశ్న:** "${userQuery}"\n\n- **ముఖ్యమైన భావన:** ఇది మీ సిలబస్‌లోని ముఖ్యమైన విషయం. దీనిని చిన్న చిన్న దశలుగా విభజించి నేర్చుకోవడం చాలా సులభం.\n- **నిత్యజీవిత ఉదాహరణ:** చిన్న చిన్న ప్రవాహాలు కలిసి పెద్ద నదిగా మారినట్లే, చిన్న చిన్న అంశాలు పెద్ద సమస్యలను సులభంగా పరిష్కరిస్తాయి.`;
  } else if (language === 'mr') {
    genericResponse = `### एड्यू-सारथी एआय:\n\n**प्रश्न:** "${userQuery}"\n\n- **मुख्य संकल्पना:** हा तुमच्या अभ्यासक्रमातील महत्त्वाचा भाग आहे. छोट्या छोट्या टप्प्यांत समजून घेतल्यास हे सहज लक्षात राहते.\n- **दैनंदिन उदाहरण:** जसे लहान प्रवाह एकत्र येऊन मोठी नदी बनते, तसेच लहान नियम मोठ्या समस्या सोडवतात.`;
  }

  return res.json({
    reply: genericResponse,
    source: 'educational-fallback',
    language
  });
});

module.exports = router;
