export type Language = 'en' | 'hi' | 'bn';

export interface TranslationDictionary {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: TranslationDictionary = {
  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    bn: 'ড্যাশবোর্ড',
  },
  'nav.founders': {
    en: 'Founders',
    hi: 'संस्थापक',
    bn: 'প্রতিষ্ঠাতা',
  },
  'nav.inventory': {
    en: 'Inventory',
    hi: 'इन्वेंट्री',
    bn: 'ইনভেন্টরি',
  },
  'nav.marketplace': {
    en: 'Marketplace',
    hi: 'बाज़ार',
    bn: 'মার্কেটপ্লেস',
  },
  'nav.scan': {
    en: 'Scan',
    hi: 'स्कैन करें',
    bn: 'স্ক্যান করুন',
  },
  'nav.analytics': {
    en: 'Analytics',
    hi: 'विश्लेषण',
    bn: 'অ্যানালিটিক্স',
  },
  'nav.login': {
    en: 'Login',
    hi: 'लॉगिन',
    bn: 'লগইন',
  },
  'nav.signup': {
    en: 'Sign up',
    hi: 'साइन अप',
    bn: 'সাইন আপ',
  },
  'nav.signout': {
    en: 'Sign out',
    hi: 'साइन आउट',
    bn: 'সাইন আউট',
  },
  'nav.openApp': {
    en: 'Open app',
    hi: 'ऐप खोलें',
    bn: 'অ্যাপ খুলুন',
  },
  'nav.loggedIn': {
    en: 'Logged in',
    hi: 'लॉग इन हैं',
    bn: 'লগইন করা আছে',
  },

  // Hero Section
  'hero.platform': {
    en: 'Sugam Seva Platform',
    hi: 'सुगम सेवा प्लेटफॉर्म',
    bn: 'সুগম সেবা প্ল্যাটফর্ম',
  },
  'hero.title': {
    en: 'Less waste, more meals for every house.',
    hi: 'कम बर्बादी, हर घर के लिए अधिक भोजन।',
    bn: 'কম অপচয়, প্রতিটি বাড়ির জন্য আরও খাবার।',
  },
  'hero.subtitle': {
    en: 'Vasundhara helps community kitchens, volunteers, and city teams track food, move extra stock quickly, and show the impact in plain language.',
    hi: 'वसुंधरा सामुदायिक रसोई, स्वयंसेवकों और शहर की टीमों को भोजन को ट्रैक करने, अतिरिक्त स्टॉक को जल्दी से स्थानांतरित करने और प्रभाव को स्पष्ट भाषा में दिखाने में मदद करती है।',
    bn: 'বসুন্ধরা কমিউনিটি রান্নাঘর, স্বেচ্ছাসেবক এবং শহরের দলগুলিকে খাবার ট্র্যাক করতে, অতিরিক্ত স্টক দ্রুত স্থানান্তর করতে এবং সহজ ভাষায় প্রভাব প্রদর্শন করতে সহায়তা করে।',
  },
  'hero.enterDashboard': {
    en: 'Enter Dashboard',
    hi: 'डैशबोर्ड में प्रवेश करें',
    bn: 'ড্যাশবোর্ডে প্রবেশ করুন',
  },
  'hero.watchScan': {
    en: 'Watch scan-to-sale',
    hi: 'स्कैन-टू-सेल देखें',
    bn: 'স্ক্যান-টু-সেল দেখুন',
  },

  // Hero Stats
  'stats.neighborhoods': {
    en: 'Neighborhoods live',
    hi: 'सक्रिय पड़ोस',
    bn: 'সক্রিয় পাড়া',
  },
  'stats.neighborhoods.detail': {
    en: '+6 joined this month',
    hi: 'इस महीने +6 शामिल हुए',
    bn: 'এই মাসে +৬ যুক্ত হয়েছে',
  },
  'stats.foodSaved': {
    en: 'Food saved each week',
    hi: 'हर हफ्ते बचाया गया भोजन',
    bn: 'প্রতি সপ্তাহে সংরক্ষিত খাদ্য',
  },
  'stats.foodSaved.detail': {
    en: 'Shared instead of wasted',
    hi: 'बर्बाद होने के बजाय साझा किया',
    bn: 'অপচয়ের বদলে ভাগ করা হয়েছে',
  },
  'stats.responseTime': {
    en: 'Help response time',
    hi: 'सहायता प्रतिक्रिया समय',
    bn: 'সহায়তা প্রতিক্রিয়া সময়',
  },
  'stats.responseTime.detail': {
    en: 'From alert to action',
    hi: 'चेतावनी से कार्रवाई तक',
    bn: 'অ্যালার্ট থেকে অ্যাকশন',
  },

  // Live Signals
  'live.signal': {
    en: 'Live signal',
    hi: 'लाइव सिग्नल',
    bn: 'লাইভ সিগন্যাল',
  },
  'live.realtime': {
    en: 'Realtime',
    hi: 'वास्तविक समय',
    bn: 'রিয়েলটাইম',
  },
  'live.ribbon': {
    en: 'Vision + Voice + ML fused in one ribbon.',
    hi: 'एक रिबन में विजन + वॉयस + एमएल का संयोजन।',
    bn: 'একটি ফিতায় ভিশন + ভয়েস + এমএল এর সমন্বয়।',
  },
  'live.automation': {
    en: '98.4% automation for repetitive inputs—humans just approve the magic.',
    hi: 'दोरहाव इनपुट्स के लिए 98.4% स्वचालन—इंसान सिर्फ जादू को मंजूरी देते हैं।',
    bn: 'পুনরাবৃত্তিমূলক ইনপুটের জন্য ৯৮.৪% অটোমেশন—মানুষ কেবল জাদুটিকে অনুমোদন করে।',
  },
  'live.pantryTitle': {
    en: 'Pantry update',
    hi: 'पेंट्री अपडेट',
    bn: 'প্যান্ট্রি আপডেট',
  },
  'live.pantryDetail': {
    en: '17 items arriving today • 5 expiring soon',
    hi: '17 आइटम आज आ रहे हैं • 5 जल्द ही समाप्त हो रहे हैं',
    bn: '১৭টি আইটেম আজ আসছে • ৫টি দ্রুত মেয়াদোত্তীর্ণ হচ্ছে',
  },
  'live.pantryHighlight': {
    en: 'Extra stock automatically sent to nearby NGOs',
    hi: 'अतिरिक्त स्टॉक स्वचालित रूप से पास के गैर सरकारी संगठनों को भेजा गया',
    bn: 'অতিরিক্ত স্টক স্বয়ংক্রিয়ভাবে কাছাকাছি এনজিওতে পাঠানো হয়েছে',
  },
  'live.marketTitle': {
    en: 'Marketplace spotlight',
    hi: 'मार्केटप्लेस स्पॉटलाइट',
    bn: 'মার্কেটপ্লেস স্পটলাইট',
  },
  'live.marketDetail': {
    en: '138 local buyers online',
    hi: '138 स्थानीय खरीदार ऑनलाइन',
    bn: '১৩৮ জন স্থানীয় ক্রেতা অনলাইনে',
  },
  'live.marketHighlight': {
    en: 'Prices adjust so farmers and SHGs earn fairly',
    hi: 'कीमतें समायोजित होती हैं ताकि किसानों और स्वयं सहायता समूहों को उचित कमाई हो',
    bn: 'মূল্য সমন্বয় করা হয় যাতে কৃষক এবং এসএইচজি-রা ন্যায্য উপার্জন করে',
  },
  'live.drivesTitle': {
    en: 'Community drives',
    hi: 'सामुदायिक अभियान',
    bn: 'কমিউনিটি ড্রাইভ',
  },
  'live.drivesDetail': {
    en: '4 Sugam Seva drives live right now',
    hi: '4 सुगम सेवा अभियान अभी लाइव हैं',
    bn: '৪টি সুগম সেবা ড্রাইভ এখন লাইভ আছে',
  },
  'live.drivesHighlight': {
    en: 'Volunteers get credits and UPI payouts on time',
    hi: 'स्वयंसेवकों को समय पर क्रेडिट और यूपीआई भुगतान मिलते हैं',
    bn: 'স্বেচ্ছাসেবকরা সময়মতো ক্রেডিট এবং ইউপিআই পেমেন্ট পান',
  },

  // About Section
  'about.title': {
    en: 'About us',
    hi: 'हमारे बारे में',
    bn: 'আমাদের সম্পর্কে',
  },
  'about.heading': {
    en: 'Built with cities and citizens together.',
    hi: 'शहरों और नागरिकों के साथ मिलकर बनाया गया।',
    bn: 'শহর এবং নাগরিকদের সাথে একসাথে নির্মিত।',
  },
  'about.description': {
    en: 'Vasundhara is a simple mission hub where households, volunteers, NGOs, and city offices work off the same facts and move faster for the community.',
    hi: 'वसुंधरा एक सरल मिशन हब है जहां परिवार, स्वयंसेवक, गैर सरकारी संगठन और शहर के कार्यालय एक ही तथ्यों पर काम करते हैं और समुदाय के लिए तेजी से कदम उठाते हैं।',
    bn: 'বসুন্ধরা হল একটি সহজ মিশন হাব যেখানে পরিবার, স্বেচ্ছাসেবক, এনজিও এবং শহরের অফিসগুলি একই তথ্যের উপর ভিত্তি করে কাজ করে এবং সম্প্রদায়ের জন্য দ্রুত এগিয়ে চলে।',
  },
  'about.playbook': {
    en: 'Read our playbook',
    hi: 'हमारी प्लेबुक पढ़ें',
    bn: 'আমাদের প্লেবুক পড়ুন',
  },

  // Pillars
  'pillar.safe.title': {
    en: 'Safe for public teams',
    hi: 'सार्वजनिक टीमों के लिए सुरक्षित',
    bn: 'পাবলিক টিমের জন্য নিরাপদ',
  },
  'pillar.safe.copy': {
    en: 'Secure logins and audit trails protect citizen data.',
    hi: 'सुरक्षित लॉगिन और ऑडिट ट्रेल्स नागरिक डेटा की रक्षा करते हैं।',
    bn: 'সুরক্ষিত লগইন এবং অডিট ট্রেইল নাগরিক ডেটা রক্ষা করে।',
  },
  'pillar.everyone.title': {
    en: 'Made for everyone',
    hi: 'सभी के लिए बनाया गया',
    bn: 'সবার জন্য তৈরি',
  },
  'pillar.everyone.copy': {
    en: 'Households, shops, NGOs, and city staff share one simple picture.',
    hi: 'परिवार, दुकानें, गैर सरकारी संगठन और शहर के कर्मचारी एक सरल तस्वीर साझा करते हैं।',
    bn: 'পরিবার, দোকান, এনজিও এবং শহরের কর্মীরা একটি সহজ চিত্র ভাগ করে নেয়।',
  },
  'pillar.automation.title': {
    en: 'Helpful automation',
    hi: 'सहायक स्वचालन',
    bn: 'সহায়ক অটোমেশন',
  },
  'pillar.automation.copy': {
    en: 'The system suggests next steps while you stay in control.',
    hi: 'जब आप नियंत्रण में रहते हैं तो सिस्टम अगले कदमों का सुझाव देता है।',
    bn: 'আপনি নিয়ন্ত্রণে থাকাকালীন সিস্টেমটি পরবর্তী পদক্ষেপগুলির পরামর্শ দেয়।',
  },

  // Inventory Features Section
  'features.title': {
    en: 'Inventory & workflows',
    hi: 'इन्वेंट्री और वर्कफ़्लो',
    bn: 'ইনভেন্টরি এবং ওয়ার্কফ্লো',
  },
  'features.heading': {
    en: 'Everything in one simple place.',
    hi: 'सब कुछ एक सरल स्थान पर।',
    bn: 'সবকিছু এক সহজ জায়গায়।',
  },
  'features.description': {
    en: 'Scan stock, speak updates, plan meals, donate extras, and sell fresh produce without jumping across apps.',
    hi: 'ऐप्स के बीच कूदने के बिना स्टॉक स्कैन करें, अपडेट बोलें, भोजन की योजना बनाएं, अतिरिक्त दान करें, और ताजा उपज बेचें।',
    bn: 'বিভিন্ন অ্যাপে না গিয়েই স্টক স্ক্যান করুন, আপডেট মুখে বলুন, খাবারের পরিকল্পনা করুন, অতিরিক্ত খাবার দান করুন এবং তাজা পণ্য বিক্রি করুন।',
  },
  'features.previewAnalytics': {
    en: 'Preview analytics',
    hi: 'विश्लेषण का पूर्वावलोकन करें',
    bn: 'অ্যানালিটিক্স প্রিভিউ',
  },
  'features.scan.title': {
    en: 'Quick barcode scan',
    hi: 'त्वरित बारकोड स्कैन',
    bn: 'দ্রুত বারকোড স্ক্যান',
  },
  'features.scan.copy': {
    en: 'Point a camera or scan a code to add items and expiries in seconds.',
    hi: 'कुछ ही सेकंड में आइटम और समाप्ति तिथियों को जोड़ने के लिए कैमरा या कोड स्कैन करें।',
    bn: 'কয়েক সেকেন্ডের মধ্যে আইটেম এবং মেয়াদ যুক্ত করতে একটি ক্যামেরা বা কোড স্ক্যান করুন।',
  },
  'features.scan.badge': {
    en: 'Scan fast',
    hi: 'तेज़ी से स्कैन करें',
    bn: 'দ্রুত স্ক্যান',
  },
  'features.voice.title': {
    en: 'Talk-to-add',
    hi: 'बोलकर जोड़ें',
    bn: 'টপ-টু-অ্যাড (মুখে বলে যুক্ত করা)',
  },
  'features.voice.copy': {
    en: 'Say “add 10 kg rice for house 3” and the form fills up for you.',
    hi: 'कहें "वार्ड 3 के लिए 10 किलो चावल जोड़ें" और फॉर्म आपके लिए भर जाएगा।',
    bn: 'বলুন “ওয়ার্ড ৩ এর জন্য ১০ কেজি চাল যোগ করুন” এবং ফর্মটি আপনার জন্য পূরণ হয়ে যাবে।',
  },
  'features.voice.badge': {
    en: 'Voice input',
    hi: 'वॉयस इनपुट',
    bn: 'ভয়েস ইনপুট',
  },
  'features.planning.title': {
    en: 'Smart planning',
    hi: 'स्मार्ट योजना',
    bn: 'স্মার্ট পরিকল্পনা',
  },
  'features.planning.copy': {
    en: 'We suggest what to cook, donate, or sell so nothing spoils.',
    hi: 'हम सुझाव देते हैं कि क्या पकाना है, दान करना है, या बेचना है ताकि कुछ भी खराब न हो।',
    bn: 'আমরা পরামর্শ দিই কী রান্না করতে হবে, দান করতে হবে বা বিক্রি করতে হবে যাতে কিছুই নষ্ট না হয়।',
  },
  'features.planning.badge': {
    en: 'Plan smart',
    hi: 'स्मार्ट योजना बनाएं',
    bn: 'স্মার্ট প্ল্যান',
  },
  'features.reports.title': {
    en: 'Impact reports',
    hi: 'प्रभाव रिपोर्ट',
    bn: 'প্রভাব রিপোর্ট',
  },
  'features.reports.copy': {
    en: 'Simple dashboards show meals served, money saved, and carbon reduced.',
    hi: 'सरल डैशबोर्ड परोसने वाले भोजन, बचाए गए धन और कम किए गए कार्बन को दर्शाते हैं।',
    bn: 'সহজ ড্যাশবোর্ডগুলি পরিবেশন করা খাবার, সংরক্ষিত অর্থ এবং হ্রাস করা কার্বন দেখায়।',
  },
  'features.reports.badge': {
    en: 'See results',
    hi: 'परिणाम देखें',
    bn: 'ফলাফল দেখুন',
  },

  // Journey Steps
  'journey.title': {
    en: 'How it works',
    hi: 'यह कैसे काम करता है',
    bn: 'এটি কীভাবে কাজ করে',
  },
  'journey.heading': {
    en: 'Follow the journey at a glance.',
    hi: 'एक नज़र में यात्रा देखें।',
    bn: 'এক নজরে যাত্রা দেখুন।',
  },
  'journey.description': {
    en: 'These four steps show how food moves from scan to table without waste.',
    hi: 'ये चार चरण दर्शाते हैं कि भोजन बिना किसी बर्बादी के स्कैन से मेज तक कैसे पहुंचता है।',
    bn: 'এই চারটি ধাপ দেখায় কিভাবে খাবার অপচয় ছাড়াই স্ক্যান থেকে টেবিলে চলে যায়।',
  },
  'journey.synced': {
    en: 'synced across devices',
    hi: 'सभी उपकरणों पर सिंक किया गया',
    bn: 'সব ডিভাইসে সিঙ্ক করা আছে',
  },
  'journey.phase': {
    en: 'Phase',
    hi: 'चरण',
    bn: 'ফেজ',
  },
  'journey.step1.title': {
    en: 'Capture in seconds',
    hi: 'सेकंड में कैप्चर करें',
    bn: 'কয়েক সেকেন্ডে ক্যাপচার',
  },
  'journey.step1.copy': {
    en: 'Scan or speak to log stock. No spreadsheets or long forms.',
    hi: 'स्टॉक दर्ज करने के लिए स्कैन या बोलें। कोई स्प्रेडशीट या लंबे फॉर्म की आवश्यकता नहीं।',
    bn: 'স্টক লগ করতে স্ক্যান করুন বা বলুন। কোন স্প্রেডশীট বা দীর্ঘ ফর্মের প্রয়োজন নেই।',
  },
  'journey.step2.title': {
    en: 'Organize automatically',
    hi: 'स्वचालित रूप से व्यवस्थित करें',
    bn: 'স্বয়ংক্রিয়ভাবে সংগঠিত করা',
  },
  'journey.step2.copy': {
    en: 'Expiry dates, locations, and recipes link themselves up.',
    hi: 'समाप्ति तिथियां, स्थान और व्यंजन विधि स्वचालित रूप से जुड़ जाती हैं।',
    bn: 'মেয়াদোত্তীর্ণের তারিখ, অবস্থান এবং রেসিপিগুলি নিজেরাই লিঙ্ক হয়ে যায়।',
  },
  'journey.step3.title': {
    en: 'Share or sell fast',
    hi: 'तेज़ी से साझा या बेचें',
    bn: 'দ্রুত শেয়ার বা বিক্রি করুন',
  },
  'journey.step3.copy': {
    en: 'Push items to donation drives, kitchens, or the marketplace with one tap.',
    hi: 'एक टैप से वस्तुओं को दान अभियान, रसोई या बाज़ार में भेजें।',
    bn: 'এক ট্যাপে আইটেমগুলিকে অনুদান ড্রাইভ, রান্নাঘর বা মার্কেটপ্লেসে পুশ করুন।',
  },
  'journey.step4.title': {
    en: 'Celebrate impact',
    hi: 'प्रभाव का जश्न मनाएं',
    bn: 'প্রভাব উদযাপন করুন',
  },
  'journey.step4.copy': {
    en: 'See live counts of meals served and waste avoided.',
    hi: 'परोसे गए भोजन और बचाई गई बर्बादी की लाइव गणना देखें।',
    bn: 'পরিবেশন করা খাবার এবং এড়ানো অপচয়ের লাইভ কাউন্ট দেখুন।',
  },

  // Experience Section
  'exp.title': {
    en: 'Friendly experience',
    hi: 'अनुकूल अनुभव',
    bn: 'বান্ধব অভিজ্ঞতা',
  },
  'exp.heading': {
    en: 'Feels alive, not complicated.',
    hi: 'जीवंत लगता है, जटिल नहीं।',
    bn: 'জীবন্ত মনে হয়, জটিল নয়।',
  },
  'exp.description': {
    en: 'Smooth animations guide your eye, show live changes, and make every action feel rehouseing for citizens and staff alike.',
    hi: 'सहज एनिमेशन आपकी आंखों का मार्गदर्शन करते हैं, लाइव बदलाव दिखाते हैं, और नागरिकों और कर्मचारियों दोनों के लिए हर क्रिया को सुखद बनाते हैं।',
    bn: 'মসৃণ অ্যানিমেশনগুলি আপনার চোখকে নির্দেশিত করে, লাইভ পরিবর্তন দেখায় এবং নাগরিক ও কর্মীদের জন্য প্রতিটি কাজকে ফলপ্রসূ করে তোলে।',
  },
  'exp.badge1': {
    en: 'Micro-interactions',
    hi: 'सूक्ष्म-इंटरैक्शन',
    bn: 'মাইক্রো-ইন্টারঅ্যাকশন',
  },
  'exp.badge2': {
    en: 'Lottie ready',
    hi: 'लोटी रेडी',
    bn: 'লটি রেডি',
  },
  'exp.badge3': {
    en: 'Framer Motion',
    hi: 'फ्रेमर मोशन',
    bn: 'ফ্রেমার মোশন',
  },
  'exp.pilotTitle': {
    en: 'Ready to launch Sugam Seva drives in your house?',
    hi: 'क्या आप अपने घर में सुगम सेवा अभियान शुरू करने के लिए तैयार हैं?',
    bn: 'আপনার বাড়িতে কি সুগম সেবা ড্রাইভ চালু করতে প্রস্তুত?',
  },
  'exp.pilotSubtitle': {
    en: 'Spin up the dashboard, invite volunteers, and broadcast impact in minutes.',
    hi: 'डैशबोर्ड चालू करें, स्वयंसेवकों को आमंत्रित करें, और मिनटों में प्रभाव का प्रसारण करें।',
    bn: 'ড্যাশবোর্ড চালু করুন, স্বেচ্ছাসেবকদের আমন্ত্রণ জানান এবং মিনিটের মধ্যে প্রভাব প্রচার করুন।',
  },
  'exp.pilotLaunch': {
    en: 'Launch pilot',
    hi: 'पायलट लॉन्च करें',
    bn: 'পাইলট চালু করুন',
  },
  'exp.pilotMarketplace': {
    en: 'View marketplace',
    hi: 'मार्केटप्लेस देखें',
    bn: 'মার্কেটপ্লেস দেখুন',
  },
  'exp.cardText': {
    en: 'Designed for continuous discovery—drag, tap, hover, and feel the platform respond.',
    hi: 'निरंतर खोज के लिए डिज़ाइन किया गया—खींचें, टैप करें, होवर करें और प्रतिक्रिया महसूस करें।',
    bn: 'ক্রমাগত অন্বেষণের জন্য ডিজাইন করা—টেনে আনুন, ট্যাপ করুন, হোভার করুন এবং প্ল্যাটফর্মের সাড়া অনুভব করুন।',
  },

  // Auth Card
  'auth.heading': {
    en: 'Sign in or create an account.',
    hi: 'साइन इन करें या खाता बनाएं।',
    bn: 'সাইন ইন করুন বা একটি অ্যাকাউন্ট তৈরি করুন।',
  },
  'auth.copy': {
    en: 'You can use this quick form or open the full auth page. Either way you get access to the same tools.',
    hi: 'आप इस त्वरित फ़ॉर्म का उपयोग कर सकते हैं या पूर्ण प्रमाणीकरण पृष्ठ खोल सकते हैं। दोनों ही मामलों में आपको समान उपकरण प्राप्त होते हैं।',
    bn: 'আপনি এই দ্রুত ফর্মটি ব্যবহার করতে পারেন বা সম্পূর্ণ প্রমাণীকরণ পৃষ্ঠাটি খুলতে পারেন। উভয় ক্ষেত্রেই আপনি একই সরঞ্জামগুলিতে অ্যাক্সেস পাবেন।',
  },
  'auth.benefit1': {
    en: 'One login covers the dashboard, drives, and marketplace.',
    hi: 'एक लॉगिन डैशबोर्ड, अभियानों और बाज़ार को कवर करता है।',
    bn: 'একটি লগইনেই ড্যাশবোর্ড, ড্রাইভ এবং মার্কেটপ্লেস কভার করে।',
  },
  'auth.benefit2': {
    en: 'Light or dark mode keeps your screen comfortable.',
    hi: 'लाइट या डार्क मोड आपकी स्क्रीन को आरामदायक रखता है।',
    bn: 'লাইট বা ডার্ক মোড আপনার স্ক্রীনকে আরামদায়ক রাখে।',
  },
  'auth.benefit3': {
    en: 'Guests can still explore before signing up.',
    hi: 'अतिथि साइन अप करने से पहले भी खोज कर सकते हैं।',
    bn: 'অতিথিরা সাইন আপ করার আগেও অন্বেষণ করতে পারেন।',
  },
  'auth.placeholderFirstName': {
    en: 'First name',
    hi: 'पहला नाम',
    bn: 'প্রথম নাম',
  },
  'auth.placeholderLastName': {
    en: 'Last name',
    hi: 'अंतिम नाम',
    bn: 'শেষ নাম',
  },
  'auth.placeholderEmail': {
    en: 'Email',
    hi: 'ईमेल',
    bn: 'ইমেল',
  },
  'auth.placeholderPassword': {
    en: 'Password',
    hi: 'पासवर्ड',
    bn: 'পাসওয়ার্ড',
  },
  'auth.buttonLogin': {
    en: 'Login and continue',
    hi: 'लॉगिन करें और जारी रखें',
    bn: 'লগইন করে এগিয়ে যান',
  },
  'auth.buttonSignup': {
    en: 'Create account',
    hi: 'खाता बनाएं',
    bn: 'অ্যাকাউন্ট তৈরি করুন',
  },
  'auth.processing': {
    en: 'Processing...',
    hi: 'प्रक्रिया चल रही है...',
    bn: 'প্রসেসিং হচ্ছে...',
  },
  'auth.missionText': {
    en: 'By continuing you agree to the mission: reduce waste, feed more, and keep Sugam Seva thriving.',
    hi: 'जारी रखकर आप मिशन से सहमत होते हैं: बर्बादी कम करें, अधिक लोगों को खिलाएं, और सुगम सेवा को समृद्ध रखें।',
    bn: 'এগিয়ে যাওয়ার মাধ্যমে আপনি এই মিশনের সাথে সম্মত হচ্ছেন: অপচয় হ্রাস করা, আরও বেশি মানুষকে খাওয়ানো এবং সুগম সেবা চালু রাখা।',
  },
  'auth.feedbackComplete': {
    en: 'Please complete all required fields.',
    hi: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    bn: 'দয়া করে সব প্রয়োজনীয় ঘরগুলি পূরণ করুন।',
  },
  'auth.feedbackWelcome': {
    en: 'Welcome aboard! Redirecting you to the dashboard.',
    hi: 'स्वागत है! आपको डैशबोर्ड पर निर्देशित किया जा रहा है।',
    bn: 'স্বাগতম! আপনাকে ড্যাশবোর্ডে পুনঃনির্দেশিত করা হচ্ছে।',
  },
  'auth.feedbackFailed': {
    en: 'Authentication failed. Please double-check your details.',
    hi: 'प्रमाणीकरण विफल रहा। कृपया अपने विवरण की दोबारा जांच करें।',
    bn: 'প্রমাণীকরণ ব্যর্থ হয়েছে। আপনার বিবরণ অনুগ্রহ করে পুনরায় যাচাই করুন।',
  },

  // Dashboard Page
  'dashboard.title': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    bn: 'ড্যাশবোর্ড',
  },
  'dashboard.welcome': {
    en: "Welcome back! Here's what's happening with your food waste management.",
    hi: 'वापसी पर स्वागत है! यहां बताया गया है कि आपके खाद्य अपशिष्ट प्रबंधन के साथ क्या चल रहा है।',
    bn: 'স্বাগতম! আপনার খাদ্য অপচয় ব্যবস্থাপনার বর্তমান পরিস্থিতি নিচে দেওয়া হল।',
  },
  'dashboard.restricted': {
    en: 'Awaiting admin approval',
    hi: 'प्रशासक की स्वीकृति की प्रतीक्षा है',
    bn: 'অ্যাডমিন অনুমোদনের অপেক্ষায়',
  },
  'dashboard.stats.total': {
    en: 'Total Items',
    hi: 'कुल वस्तुएं',
    bn: 'মোট আইটেম',
  },
  'dashboard.stats.expiring': {
    en: 'Expiring Soon',
    hi: 'जल्द समाप्त होने वाले',
    bn: 'দ্রুত মেয়াদোত্তীর্ণ হচ্ছে',
  },
  'dashboard.stats.money': {
    en: 'Money Saved',
    hi: 'बचाया गया धन',
    bn: 'সংরক্ষিত অর্থ',
  },
  'dashboard.stats.waste': {
    en: 'Waste Reduced',
    hi: 'कचरा कम हुआ',
    bn: 'অপচয় হ্রাস',
  },
  'dashboard.quickActions': {
    en: 'Quick Actions',
    hi: 'त्वरित कार्रवाई',
    bn: 'কুইক অ্যাকশন',
  },
  'dashboard.action.add': {
    en: 'Add New Item',
    hi: 'नया आइटम जोड़ें',
    bn: 'নতুন আইটেম যোগ করুন',
  },
  'dashboard.action.scan': {
    en: 'Scan Barcode',
    hi: 'बारकोड स्कैन करें',
    bn: 'বারকোড স্ক্যান করুন',
  },
  'dashboard.action.plan': {
    en: 'Plan Meals',
    hi: 'भोजन की योजना बनाएं',
    bn: 'খাবারের পরিকল্পনা করুন',
  },
  'dashboard.action.clear': {
    en: 'Clear Inventory',
    hi: 'इन्वेंट्री साफ करें',
    bn: 'ইনভেন্টরি খালি করুন',
  },
  'dashboard.action.clearDesc': {
    en: 'Deletes all items permanently',
    hi: 'सभी वस्तुओं को स्थायी रूप से हटा देता है',
    bn: 'স্থায়ীভাবে সমস্ত আইটেম মুছে ফেলুন',
  },
  'dashboard.clearConfirm.title': {
    en: 'Clear inventory?',
    hi: 'इन्वेंट्री साफ करें?',
    bn: 'ইনভেন্টরি খালি করবেন?',
  },
  'dashboard.clearConfirm.desc': {
    en: 'This permanently deletes every inventory item. This action cannot be undone.',
    hi: 'यह प्रत्येक इन्वेंट्री आइटम को स्थायी रूप से हटा देता है। यह कार्रवाई पूर्ववत नहीं की जा सकती।',
    bn: 'এটি স্থায়ীভাবে সমস্ত ইনভেন্টরি আইটেম মুছে ফেলবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
  },
  'dashboard.clearConfirm.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    bn: 'বাতিল করুন',
  },
  'dashboard.clearConfirm.ok': {
    en: 'OK',
    hi: 'ठीक है',
    bn: 'ঠিক আছে',
  },
  'dashboard.restrictedMessage': {
    en: "Your account is pending admin approval. You can explore data but can't make changes yet.",
    hi: 'आपका खाता प्रशासक की स्वीकृति के लिए लंबित है। आप डेटा का पता लगा सकते हैं लेकिन अभी बदलाव नहीं कर सकते।',
    bn: 'আপনার অ্যাকাউন্টটি অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে। আপনি অন্বেষণ করতে পারেন তবে কোনও পরিবর্তন করতে পারবেন না।',
  },
  // Expanded Navigation Translations
  'nav.home': {
    en: 'Home',
    hi: 'मुख्य पृष्ठ',
    bn: 'হোম',
  },
  'nav.mealPlanning': {
    en: 'Meal Planning',
    hi: 'भोजन योजना',
    bn: 'খাবার পরিকল্পনা',
  },
  'nav.rehouses': {
    en: 'Rehouses',
    hi: 'पुरस्कार',
    bn: 'পুরস্কার',
  },
  'nav.notifications': {
    en: 'Notifications',
    hi: 'सूचनाएं',
    bn: 'বিজ্ঞপ্তি',
  },
  'nav.settings': {
    en: 'Settings',
    hi: 'सेटिंग्स',
    bn: 'সেটিংস',
  },
  'nav.orders': {
    en: 'Orders',
    hi: 'ऑर्डर',
    bn: 'অর্ডার',
  },
  'nav.inventoryShop': {
    en: 'Inventory (Shop)',
    hi: 'इन्वेंट्री (दुकान)',
    bn: 'ইনভেন্টরি (দোকান)',
  },
  'nav.overview': {
    en: 'Overview',
    hi: 'अवलोकन',
    bn: 'ওভারভিউ',
  },
  'nav.usersShops': {
    en: 'Users & Shops',
    hi: 'उपयोगकर्ता और दुकानें',
    bn: 'ব্যবহারকারী ও দোকান',
  },
  // Inventory Page translations
  'inventory.title': {
    en: 'Inventory Management',
    hi: 'इन्वेंट्री प्रबंधन',
    bn: 'ইনভেন্টরি ম্যানেজমেন্ট',
  },
  'inventory.subtitle': {
    en: 'Track and manage your food items with AI-powered insights',
    hi: 'एआई-संचालित अंतर्दृष्टि के साथ अपने खाद्य पदार्थों को ट्रैक और प्रबंधित करें',
    bn: 'এআই-চালিত অন্তর্দৃষ্টির সাথে আপনার খাদ্য আইটেমগুলি ট্র্যাক এবং পরিচালনা করুন',
  },
  'inventory.searchPlaceholder': {
    en: 'Search items...',
    hi: 'आइटम खोजें...',
    bn: 'আইটেম খুঁজুন...',
  },
  'inventory.allStatus': {
    en: 'All Status',
    hi: 'सभी स्थिति',
    bn: 'সমস্ত স্ট্যাটাস',
  },
  'inventory.critical': {
    en: 'Expires Today',
    hi: 'आज समाप्त हो रहा है',
    bn: 'আজ শেষ হবে',
  },
  'inventory.warning': {
    en: 'Expires Soon',
    hi: 'जल्द समाप्त होने वाला',
    bn: 'দ্রুত মেয়াদ শেষ হবে',
  },
  'inventory.caution': {
    en: 'Expires This Week',
    hi: 'इस सप्ताह समाप्त हो रहा है',
    bn: 'এই সপ্তাহে মেয়াদ শেষ হবে',
  },
  'inventory.good': {
    en: 'Fresh',
    hi: 'ताज़ा',
    bn: 'তাজা',
  },
  'inventory.allCategories': {
    en: 'All Categories',
    hi: 'सभी श्रेणियां',
    bn: 'সমস্ত বিভাগ',
  },
  'inventory.scanItem': {
    en: 'Scan Item',
    hi: 'आइटम स्कैन करें',
    bn: 'আইটেম স্ক্যান করুন',
  },
  'inventory.qrCode': {
    en: 'QR Code',
    hi: 'क्यूआर कोड',
    bn: 'কিউআর কোড',
  },
  'inventory.addItem': {
    en: 'Add Item',
    hi: 'आइटम जोड़ें',
    bn: 'আইটেম যোগ করুন',
  },
  'inventory.clearInventory': {
    en: 'Clear Inventory',
    hi: 'इन्वेंट्री साफ करें',
    bn: 'ইনভেন্টরি খালি করুন',
  },
  'inventory.quantity': {
    en: 'Quantity',
    hi: 'मात्रा',
    bn: 'পরিমাণ',
  },
  'inventory.price': {
    en: 'Price',
    hi: 'कीमत',
    bn: 'মূল্য',
  },
  'inventory.unitCost': {
    en: 'Unit Cost',
    hi: 'इकाई लागत',
    bn: 'ইউনিট খরচ',
  },
  'inventory.expires': {
    en: 'Expires',
    hi: 'समाप्ति तिथि',
    bn: 'মেয়াদ শেষ',
  },
  'inventory.daysLeft': {
    en: 'Days left',
    hi: 'दिन शेष',
    bn: 'দিন বাকি',
  },
  'inventory.enterExpiry': {
    en: 'Enter expiry',
    hi: 'समाप्ति तिथि दर्ज करें',
    bn: 'মেয়াদোত্তীর্ণের তারিখ লিখুন',
  },
  'inventory.expired': {
    en: 'Expired',
    hi: 'समाप्त हो गया',
    bn: 'মেয়াদোত্তীর্ণ',
  },
  'inventory.expiresToday': {
    en: 'Expires today',
    hi: 'आज समाप्त हो रहा है',
    bn: 'আজ মেয়াদ শেষ হবে',
  },
  'inventory.day': {
    en: '1 day',
    hi: '1 दिन',
    bn: '১ দিন',
  },
  'inventory.days': {
    en: 'days',
    hi: 'दिन',
    bn: 'দিন',
  },
  'inventory.noItems': {
    en: 'No items found',
    hi: 'कोई आइटम नहीं मिला',
    bn: 'কোন আইটেম পাওয়া যায়নি',
  },
  'inventory.noItemsDetailFilters': {
    en: 'Try adjusting your search or filters',
    hi: 'अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें',
    bn: 'আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন',
  },
  'inventory.noItemsDetailEmpty': {
    en: 'Start by adding your first food item to track',
    hi: 'ट्रैक करने के लिए अपना पहला खाद्य आइटम जोड़ना शुरू करें',
    bn: 'ট্র্যাক করার জন্য আপনার প্রথম খাদ্য আইটেম যোগ করুন',
  },
  'inventory.addFirstItem': {
    en: 'Add Your First Item',
    hi: 'अपना पहला आइटम जोड़ें',
    bn: 'আপনার প্রথম আইটেম যোগ করুন',
  },
  'inventory.add': {
    en: 'Add',
    hi: 'जोड़ें',
    bn: 'যোগ করুন',
  },
  'inventory.useNow': {
    en: 'Use Now',
    hi: 'अभी उपयोग करें',
    bn: 'এখন ব্যবহার করুন',
  },
  // Auth Page translations
  'auth.signIn': {
    en: 'Sign in',
    hi: 'साइन इन करें',
    bn: 'সাইন ইন করুন',
  },
  'auth.signUp': {
    en: 'Sign up',
    hi: 'साइन अप करें',
    bn: 'সাইন আপ করুন',
  },
  'auth.continueAs': {
    en: 'Continue as:',
    hi: 'इस रूप में जारी रखें:',
    bn: 'এই হিসাবে এগিয়ে যান:',
  },
  'auth.emailLabel': {
    en: 'Email',
    hi: 'ईमेल',
    bn: 'ইমেল',
  },
  'auth.emailPlaceholder': {
    en: 'you@example.com',
    hi: 'you@example.com',
    bn: 'you@example.com',
  },
  'auth.passwordLabel': {
    en: 'Password',
    hi: 'पासवर्ड',
    bn: 'পাসওয়ার্ড',
  },
  'auth.passwordPlaceholderLogin': {
    en: 'Enter your password',
    hi: 'अपना पासवर्ड दर्ज करें',
    bn: 'আপনার পাসওয়ার্ড লিখুন',
  },
  'auth.passwordPlaceholderSignup': {
    en: 'Create a strong password',
    hi: 'एक मजबूत पासवर्ड बनाएं',
    bn: 'একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন',
  },
  'auth.rememberMe': {
    en: 'Remember me',
    hi: 'मुझे याद रखें',
    bn: 'আমাকে মনে রাখুন',
  },
  'auth.forgotPassword': {
    en: 'Forgot password?',
    hi: 'पासवर्ड भूल गए?',
    bn: 'পাসওয়ার্ড ভুলে গেছেন?',
  },
  'auth.orContinueWith': {
    en: 'or continue with',
    hi: 'या इसके साथ जारी रखें',
    bn: 'অথবা এটি দিয়ে এগিয়ে যান',
  },
  'auth.continueGuest': {
    en: 'Continue as Guest',
    hi: 'अतिथि के रूप में जारी रखें',
    bn: 'অতিথি হিসাবে এগিয়ে যান',
  },
  'auth.firstNameLabel': {
    en: 'First name',
    hi: 'पहला नाम',
    bn: 'প্রথম নাম',
  },
  'auth.firstNamePlaceholder': {
    en: 'Enter your first name',
    hi: 'अपना पहला नाम दर्ज करें',
    bn: 'আপনার প্রথম নাম লিখুন',
  },
  'auth.lastNameLabel': {
    en: 'Last name',
    hi: 'अंतिम नाम',
    bn: 'শেষ নাম',
  },
  'auth.lastNamePlaceholder': {
    en: 'Enter your last name',
    hi: 'अपना अंतिम नाम दर्ज करें',
    bn: 'আপনার শেষ নাম লিখুন',
  },
  'auth.profilePictureLabel': {
    en: 'Profile picture',
    hi: 'प्रोफ़ाइल चित्र',
    bn: 'প্রোফাইল পিকচার',
  },
  'auth.uploadPhoto': {
    en: 'Upload photo',
    hi: 'फोटो अपलोड करें',
    bn: 'ছবি আপলোড করুন',
  },
  'auth.removePhoto': {
    en: 'Remove photo',
    hi: 'फोटो हटाएं',
    bn: 'ছবি সরিয়ে ফেলুন',
  },
  'auth.photoHint': {
    en: 'Square images work best. Max 3 MB.',
    hi: 'चौकोर चित्र सबसे अच्छा काम करते हैं। अधिकतम 3 एमबी।',
    bn: 'বর্গাকার ছবি সবচেয়ে ভালো কাজ করে। সর্বোচ্চ ৩ এমবি।',
  },
  'auth.phoneNumberLabel': {
    en: 'Phone number',
    hi: 'फ़ोन नंबर',
    bn: 'ফোন নম্বর',
  },
  'auth.phoneNumberPlaceholder': {
    en: '+91 98765 43210',
    hi: '+91 98765 43210',
    bn: '+91 98765 43210',
  },
  'auth.householdDetails': {
    en: 'Household details',
    hi: 'पारिवारिक विवरण',
    bn: 'পারিবারিক বিবরণ',
  },
  'auth.familySizePlaceholder': {
    en: 'Family size (e.g., 4)',
    hi: 'परिवार का आकार (जैसे, 4)',
    bn: 'পরিবারের সদস্য সংখ্যা (যেমন, ৪)',
  },
  'auth.addressPlaceholder': {
    en: 'Address',
    hi: 'पता',
    bn: 'ঠিকানা',
  },
  'auth.housePlaceholder': {
    en: 'house / Block',
    hi: 'वार्ड / ब्लॉक',
    bn: 'ওয়ার্ড / ব্লক',
  },
  'auth.shopkeeperDetails': {
    en: 'Shopkeeper details',
    hi: 'दुकानदार का विवरण',
    bn: 'দোকানদারের বিবরণ',
  },
  'auth.businessNamePlaceholder': {
    en: 'Business name',
    hi: 'व्यवसाय का नाम',
    bn: 'ব্যবসার নাম',
  },
  'auth.licensePlaceholder': {
    en: 'License / GST number',
    hi: 'लाइसेंस / जीएसटी नंबर',
    bn: 'লাইসেন্স / জিএসটি নম্বর',
  },
  'auth.shopAddressPlaceholder': {
    en: 'Shop address',
    hi: 'दुकान का पता',
    bn: 'দোকানের ঠিকানা',
  },
  'auth.createAccountButton': {
    en: 'Create Account',
    hi: 'खाता बनाएं',
    bn: 'অ্যাকাউন্ট তৈরি করুন',
  },
  'auth.tryGuestButton': {
    en: 'Try as Guest',
    hi: 'अतिथि के रूप में प्रयास करें',
    bn: 'অতিথি হিসাবে চেষ্টা করুন',
  },
  'auth.terms': {
    en: 'Terms',
    hi: 'नियम',
    bn: 'শর্তাবলী',
  },
  'auth.privacyPolicy': {
    en: 'Privacy Policy',
    hi: 'गोपनीयता नीति',
    bn: 'গোপনীয়তা নীতি',
  },
  'auth.welcomeBack': {
    en: 'Welcome back!',
    hi: 'वापसी पर स्वागत है!',
    bn: 'স্বাগতম!',
  },
  // Dashboard Extra Translations
  'dashboard.inventoryOverview': {
    en: 'Inventory Overview',
    hi: 'इन्वेंट्री अवलोकन',
    bn: 'ইনভেন্টরি ওভারভিউ',
  },
  'dashboard.stats.critical': {
    en: 'Critical',
    hi: 'गंभीर',
    bn: 'গুরুতর',
  },
  'dashboard.stats.warning': {
    en: 'Warning',
    hi: 'चेतावनी',
    bn: 'সতর্কতা',
  },
  'dashboard.recentItems': {
    en: 'Recent Items',
    hi: 'हाल की वस्तुएं',
    bn: 'সাম্প্রতিক আইটেম',
  },
  'dashboard.noExpiry': {
    en: 'No expiry',
    hi: 'कोई समाप्ति नहीं',
    bn: 'কোন মেয়াদ নেই',
  },
  'dashboard.expiresDate': {
    en: 'Expires',
    hi: 'समाप्ति',
    bn: 'মেয়াদ শেষ',
  },
  'dashboard.wasteAnalytics': {
    en: 'Waste Analytics',
    hi: 'कचरा विश्लेषण',
    bn: 'অপচয় অ্যানালিটিক্স',
  },
  'dashboard.less': {
    en: 'less',
    hi: 'कम',
    bn: 'কম',
  },
  'dashboard.saved': {
    en: 'saved',
    hi: 'बचाया',
    bn: 'সংরক্ষিত',
  },
  'dashboard.thisWeekWaste': {
    en: "This Week's Waste",
    hi: 'इस सप्ताह का कचरा',
    bn: 'এই সপ্তাহের অপচয়',
  },
  'dashboard.wasteByCategory': {
    en: 'Waste by Category',
    hi: 'श्रेणी के अनुसार कचरा',
    bn: 'বিভাগ অনুযায়ী অপচয়',
  },
  'dashboard.noWasteData': {
    en: 'No waste data yet',
    hi: 'अभी तक कोई कचरा डेटा नहीं है',
    bn: 'এখনো কোন অপচয়ের তথ্য নেই',
  },
  'dashboard.viewDetails': {
    en: 'View Details',
    hi: 'विवरण देखें',
    bn: 'বিস্তারিত দেখুন',
  },

  // Inventory Modals Translations
  'inventory.modal.addTitle': {
    en: 'Add Item',
    hi: 'आइटम जोड़ें',
    bn: 'আইটেম যোগ করুন',
  },
  'inventory.modal.editTitle': {
    en: 'Edit Item',
    hi: 'आइटम संपादित करें',
    bn: 'আইটেম এডিট করুন',
  },
  'inventory.modal.uploadPhoto': {
    en: 'Upload Product Photo',
    hi: 'उत्पाद की फोटो अपलोड करें',
    bn: 'প্রোডাক্টের ছবি আপলোড করুন',
  },
  'inventory.modal.photoHint': {
    en: 'PNG, JPG up to 2MB',
    hi: 'PNG, JPG अधिकतम 2MB',
    bn: 'PNG, JPG সর্বোচ্চ ২ এমবি',
  },
  'inventory.modal.itemName': {
    en: 'Item name',
    hi: 'आइटम का नाम',
    bn: 'আইটেমের নাম',
  },
  'inventory.modal.category': {
    en: 'Category',
    hi: 'श्रेणी',
    bn: 'বিভাগ',
  },
  'inventory.modal.expiryDate': {
    en: 'Expiry date',
    hi: 'समाप्ति तिथि',
    bn: 'মেয়াদোত্তীর্ণের তারিখ',
  },
  'inventory.modal.qty': {
    en: 'Qty',
    hi: 'मात्रा',
    bn: 'পরিমাণ',
  },
  'inventory.modal.unit': {
    en: 'Unit (kg, g...)',
    hi: 'इकाई (kg, g...)',
    bn: 'ইউনিট (কেজি, গ্রাম...)',
  },
  'inventory.modal.price': {
    en: 'Price',
    hi: 'कीमत',
    bn: 'মূল্য',
  },
  'inventory.modal.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    bn: 'বাতিল করুন',
  },
  'inventory.modal.save': {
    en: 'Save',
    hi: 'सहेजें',
    bn: 'সংরক্ষণ করুন',
  },
  'inventory.modal.add': {
    en: 'Add',
    hi: 'जोड़ें',
    bn: 'যোগ করুন',
  },
  'inventory.modal.addStockTitle': {
    en: 'Add Stock',
    hi: 'स्टॉक जोड़ें',
    bn: 'স্টক যোগ করুন',
  },
  'inventory.modal.currentStock': {
    en: 'Current Stock',
    hi: 'वर्तमान स्टॉक',
    bn: 'বর্তমান স্টক',
  },
  'inventory.modal.amountToAdd': {
    en: 'Amount to Add',
    hi: 'जोड़ने की मात्रा',
    bn: 'যোগ করার পরিমাণ',
  },
  'inventory.modal.useItemTitle': {
    en: 'Use',
    hi: 'उपयोग करें',
    bn: 'ব্যবহার করুন',
  },
  'inventory.modal.amountUsed': {
    en: 'Amount Used',
    hi: 'उपयोग की गई मात्रा',
    bn: 'ব্যবহৃত পরিমাণ',
  },
  'inventory.modal.confirmUsage': {
    en: 'Confirm Usage',
    hi: 'उपयोग की पुष्टि करें',
    bn: 'ব্যবহার নিশ্চিত করুন',
  },

  // Meal Planning Translations
  'meals.title': {
    en: 'Meal Planning',
    hi: 'भोजन योजना',
    bn: 'খাবার পরিকল্পনা',
  },
  'meals.subtitle': {
    en: 'Plan delicious meals using your expiring ingredients',
    hi: 'अपने समाप्त होने वाले अवयवों का उपयोग करके स्वादिष्ट भोजन की योजना बनाएं',
    bn: 'আপনার মেয়াদোত্তীর্ণ হতে চলা উপাদানগুলি ব্যবহার করে সুস্বাদু খাবারের পরিকল্পনা করুন',
  },
  'meals.aiBlueprint': {
    en: 'Vard Meal Suggestion',
    hi: 'वर्ड मील सुझाव',
    bn: 'ভার্ড মিলের পরামর্শ',
  },
  'meals.aiAnalyzing': {
    en: 'AI is analyzing your expiring ingredients...',
    hi: 'एआई आपके समाप्त होने वाले अवयवों का विश्लेषण कर रहा है...',
    bn: 'এআই আপনার মেয়াদোত্তীর্ণ হতে চলা উপাদানগুলি বিশ্লেষণ করছে...',
  },
  'meals.aiReady': {
    en: 'Personalized picks ready to schedule.',
    hi: 'शेड्यूल करने के लिए व्यक्तिगत पसंद तैयार हैं।',
    bn: 'শিডিউল করার জন্য আপনার পছন্দের তালিকা প্রস্তুত।',
  },
  'meals.aiUnlock': {
    en: 'Add expiring items to unlock AI guidance.',
    hi: 'एआई मार्गदर्शन अनलॉक करने के लिए समाप्त होने वाले आइटम जोड़ें।',
    bn: 'এআই নির্দেশিকা আনলক করতে মেয়াদোত্তীর্ণ হতে চলা আইটেম যোগ করুন।',
  },
  'meals.refreshAi': {
    en: 'Refresh AI',
    hi: 'एआई रीफ्रेश करें',
    bn: 'এআই রিফ্রেশ করুন',
  },
  'meals.thinking': {
    en: 'Thinking...',
    hi: 'सोच रहा हूँ...',
    bn: 'ভাবছে...',
  },
  'meals.aiPick': {
    en: 'AI Pick',
    hi: 'एआई पसंद',
    bn: 'এআই চয়েস',
  },
  'meals.scheduleMeal': {
    en: 'Schedule Meal',
    hi: 'भोजन शेड्यूल करें',
    bn: 'খাবার শিডিউল করুন',
  },
  'meals.viewPlan': {
    en: 'View Plan',
    hi: 'योजना देखें',
    bn: 'পরিকল্পনা দেখুন',
  },
  'meals.emptyText': {
    en: 'Your meal plan is empty. Add items to your inventory to get AI-powered suggestions!',
    hi: 'आपकी भोजन योजना खाली है। एआई-संचालित सुझाव प्राप्त करने के लिए अपनी इन्वेंट्री में आइटम जोड़ें!',
    bn: 'আপনার খাবার পরিকল্পনা খালি। এআই-চালিত পরামর্শ পেতে আপনার ইনভেন্টরিতে আইটেম যোগ করুন!',
  },
  'meals.slot.Breakfast': {
    en: 'Breakfast',
    hi: 'नाश्ता',
    bn: 'প্রাতঃরাশ',
  },
  'meals.slot.Lunch': {
    en: 'Lunch',
    hi: 'दोपहर का भोजन',
    bn: 'দুপুরের খাবার',
  },
  'meals.slot.Dinner': {
    en: 'Dinner',
    hi: 'रात का भोजन',
    bn: 'রাতের খাবার',
  },
  'meals.slot.Snacks': {
    en: 'Snacks',
    hi: 'स्नैक्स',
    bn: 'স্ন্যাক্স',
  },

  // Scan Page Translations
  'scan.title': {
    en: 'Scan Items',
    hi: 'आइटम स्कैन करें',
    bn: 'আইটেম স্ক্যান করুন',
  },
  'scan.subtitle': {
    en: 'Add items to your inventory using barcode scanning, QR codes, or camera',
    hi: 'बारकोड स्कैनिंग, क्यूआर कोड या कैमरे का उपयोग करके अपनी इन्वेंट्री में आइटम जोड़ें',
    bn: 'বারকোড স্ক্যানিং, কিউআর কোড বা ক্যামেরা ব্যবহার করে আপনার ইনভেন্টরিতে আইটেম যোগ করুন',
  },
  'scan.chooseMethod': {
    en: 'Choose Scanning Method',
    hi: 'स्कैनिंग विधि चुनें',
    bn: 'স্ক্যানিং পদ্ধতি বেছে নিন',
  },
  'scan.method.barcode': {
    en: 'Barcode',
    hi: 'बारकोड',
    bn: 'বারকোড',
  },
  'scan.method.qr': {
    en: 'QR Code',
    hi: 'क्यूआर कोड',
    bn: 'কিউআর কোড',
  },
  'scan.method.camera': {
    en: 'Camera',
    hi: 'कैमरा',
    bn: 'ক্যামেরা',
  },
  'scan.method.manual': {
    en: 'Manual',
    hi: 'मैनुअल',
    bn: 'ম্যানুয়াল',
  },
  'scan.scanner.barcode': {
    en: 'Barcode Scanner',
    hi: 'बारकोड स्कैनर',
    bn: 'বারকোড স্ক্যানার',
  },
  'scan.scanner.qr': {
    en: 'QR Code Scanner',
    hi: 'क्यूआर कोड स्कैनर',
    bn: 'কিউআর কোড স্ক্যানার',
  },
  'scan.scanner.camera': {
    en: 'Camera Scanner',
    hi: 'कैमरा स्कैनर',
    bn: 'ক্যামেরা স্ক্যানার',
  },
  'scan.scanner.manual': {
    en: 'Manual Entry',
    hi: 'मैनुअल प्रविष्टि',
    bn: 'ম্যানুয়াল এন্ট্রি',
  },
  'scan.input.itemName': {
    en: 'Item Name',
    hi: 'आइटम का नाम',
    bn: 'আইটেমের নাম',
  },
  'scan.input.placeholder': {
    en: 'Enter item name...',
    hi: 'आइटम का नाम दर्ज करें...',
    bn: 'আইটেমের নাম লিখুন...',
  },
  'scan.button.addItem': {
    en: 'Add Item',
    hi: 'आइटम जोड़ें',
    bn: 'আইটেম যোগ করুন',
  },
  'scan.status.scanning': {
    en: 'Scanning...',
    hi: 'स्कैन किया जा रहा है...',
    bn: 'স্ক্যান করা হচ্ছে...',
  },
  'scan.status.ready': {
    en: 'Ready to Scan',
    hi: 'स्कैन करने के लिए तैयार',
    bn: 'স্ক্যান করার জন্য প্রস্তুত',
  },
  'scan.status.lastScanned': {
    en: 'Last scanned',
    hi: 'पिछला स्कैन किया गया',
    bn: 'সর্বশেষ স্ক্যান করা',
  },
  'scan.confirm.title': {
    en: 'Confirm scanned product',
    hi: 'स्कैन किए गए उत्पाद की पुष्टि करें',
    bn: 'স্ক্যান করা প্রোডাক্টটি নিশ্চিত করুন',
  },
  'scan.confirm.brand': {
    en: 'Brand',
    hi: 'ब्रांड',
    bn: 'ব্র্যান্ড',
  },
  'scan.confirm.expiry': {
    en: 'Expiry date (optional)',
    hi: 'समाप्ति तिथि (वैकल्पिक)',
    bn: 'মেয়াদোত্তীর্ণের তারিখ (ঐচ্ছিক)',
  },
  'scan.confirm.addInventory': {
    en: 'Add to Inventory',
    hi: 'इन्वेंट्री में जोड़ें',
    bn: 'ইনভেন্টরিতে যোগ করুন',
  },
  'scan.button.startScan': {
    en: 'Start Scan',
    hi: 'स्कैन शुरू करें',
    bn: 'স্ক্যান শুরু করুন',
  },
  'scan.button.stop': {
    en: 'Stop',
    hi: 'रोकें',
    bn: 'थামুন',
  },
  'scan.hint.permission': {
    en: 'Ensure camera permission is allowed. If scanning fails, try Manual entry.',
    hi: 'सुनिश्चित करें कि कैमरा अनुमति दी गई है। यदि स्कैनिंग विफल रहती है, तो मैनुअल प्रविष्टि का प्रयास करें।',
    bn: 'ক্যামেরার অনুমতি দেওয়া আছে কিনা নিশ্চিত করুন। স্ক্যান ব্যর্থ হলে ম্যানুয়াল এন্ট্রি চেষ্টা করুন।',
  },
  'scan.recentTitle': {
    en: 'Recently Scanned Items',
    hi: 'हाल ही में स्कैन किए गए आइटम',
    bn: 'সাম্প্রতিক স্ক্যান করা আইটেম',
  },
  'scan.recent.confidence': {
    en: 'Confidence',
    hi: 'विश्वास स्तर',
    bn: 'কনফিডেন্স',
  },
  'scan.recent.added': {
    en: 'Added to inventory',
    hi: 'इन्वेंट्री में जोड़ा गया',
    bn: 'ইনভেন্টরিতে যোগ করা হয়েছে',
  },
  'scan.recent.edit': {
    en: 'Edit',
    hi: 'संपादित करें',
    bn: 'এডিট',
  },

  // Marketplace Page Translations
  'market.title': {
    en: 'Marketplace',
    hi: 'बाज़ार',
    bn: 'মার্কেটপ্লেস',
  },
  'market.subtitle': {
    en: 'Share surplus food and find great deals from your community',
    hi: 'अतिरिक्त भोजन साझा करें और अपने समुदाय से बेहतरीन सौदे पाएं',
    bn: 'উদ্বৃত্ত খাবার শেয়ার করুন এবং আপনার কমিউনিটি থেকে দারুণ ডিল খুঁজুন',
  },
  'market.betaTitle': {
    en: 'Marketplace beta update',
    hi: 'मार्केटप्लेस बीटा अपडेट',
    bn: 'মার্কেটপ্লেস বিটা আপডেট',
  },
  'market.betaHeading': {
    en: 'Collect sample listings while we finish the release',
    hi: 'जब तक हम रिलीज़ समाप्त नहीं कर लेते, तब तक नमूना लिस्टिंग एकत्र करें',
    bn: 'আমরা রিলিজ শেষ করার আগে পর্যন্ত ডেমো লিস্টিং সংগ্রহ করুন',
  },
  'market.betaDescription': {
    en: "Add your surplus items below to preview how listings will appear. We'll open community-wide exchanges once moderation and pickup flows are finalized.",
    hi: 'यह देखने के लिए कि लिस्टिंग कैसे दिखाई देगी, नीचे अपने अतिरिक्त आइटम जोड़ें। एक बार मॉडरेशन और पिकअप प्रवाह अंतिम रूप ले लेने के बाद हम समुदाय-व्यापी आदान-प्रदान खोलेंगे।',
    bn: 'লিস্টিংগুলি কীভাবে প্রদর্শিত হবে তা দেখতে নিচে আপনার উদ্বৃত্ত আইটেমগুলি যোগ করুন। মডারেশন এবং পিকআপের প্রবাহগুলি চূড়ান্ত হয়ে গেলে আমরা কমিউনিটি-ভিত্তিক বিনিময় শুরু করব।',
  },
  'market.searchPlaceholder': {
    en: 'Search for food items...',
    hi: 'खाद्य पदार्थों की खोज करें...',
    bn: 'খাদ্য আইটেম খুঁজুন...',
  },
  'market.freeOnly': {
    en: 'Free Only',
    hi: 'केवल मुफ़्त',
    bn: 'শুধুমাত্র ফ্রি',
  },
  'market.listItem': {
    en: 'List Item',
    hi: 'आइटम सूचीबद्ध करें',
    bn: 'আইটেম লিস্ট করুন',
  },
  'market.form.title': {
    en: 'List an item for early access',
    hi: 'जल्दी पहुंच के लिए एक आइटम सूचीबद्ध करें',
    bn: 'তাড়াতাড়ি অ্যাক্সেসের জন্য একটি আইটেম লিস্ট করুন',
  },
  'market.form.itemName': {
    en: 'Item name',
    hi: 'आइटम का नाम',
    bn: 'আইটেমের নাম',
  },
  'market.form.itemNamePlaceholder': {
    en: 'e.g., Organic tomatoes',
    hi: 'जैसे, जैविक टमाटर',
    bn: 'যেমন, অর্গানিক টমেটো',
  },
  'market.form.pickupWindow': {
    en: 'Pickup window',
    hi: 'पिकअप विंडो',
    bn: 'পিকআপ উইন্ডো',
  },
  'market.form.pickupPlaceholder': {
    en: 'Today 4-6 PM',
    hi: 'आज शाम 4-6 बजे',
    bn: 'আজ বিকেল ৪-৬টা',
  },
  'market.form.quantity': {
    en: 'Quantity',
    hi: 'मात्रा',
    bn: 'পরিমাণ',
  },
  'market.form.price': {
    en: 'Price (₹)',
    hi: 'कीमत (₹)',
    bn: 'মূল্য (₹)',
  },
  'market.form.originalPrice': {
    en: 'Original price (₹)',
    hi: 'मूल कीमत (₹)',
    bn: 'আসল মূল্য (₹)',
  },
  'market.form.optional': {
    en: 'Optional',
    hi: 'वैकल्पिक',
    bn: 'ঐচ্ছিক',
  },
  'market.form.description': {
    en: 'Description',
    hi: 'विवरण',
    bn: 'বিবরণ',
  },
  'market.form.descPlaceholder': {
    en: 'Share freshness details, expiry, or serving ideas',
    hi: 'ताजगी का विवरण, समाप्ति या परोसने के विचार साझा करें',
    bn: 'তাজাতা, মেয়াদ বা পরিবেশনের ধারণাগুলি শেয়ার করুন',
  },
  'market.form.pickupLocation': {
    en: 'Pickup location',
    hi: 'पिकअप स्थान',
    bn: 'পিকআপ লোকেশন',
  },
  'market.form.pickupLocPlaceholder': {
    en: 'Neighborhood or pickup point',
    hi: 'पड़ोस या पिकअप बिंदु',
    bn: 'পাড়া বা পিকআপ পয়েন্ট',
  },
  'market.form.storedLocally': {
    en: 'Listings are stored locally for now and help us polish the experience.',
    hi: 'लिस्टिंग अभी के लिए स्थानीय रूप से सहेजी जाती हैं और अनुभव को बेहतर बनाने में मदद करती हैं।',
    bn: 'লিস্টিংগুলি আপাতত লোকাল স্টোরেজে সংরক্ষণ করা হচ্ছে যা অভিজ্ঞতা উন্নত করতে সাহায্য করে।',
  },
  'market.form.savePreview': {
    en: 'Save preview listing',
    hi: 'पूर्वावलोकन लिस्टिंग सहेजें',
    bn: 'প্রিভিউ লিস্টিং সংরক্ষণ করুন',
  },
  'market.grid.free': {
    en: 'FREE',
    hi: 'मुफ़्त',
    bn: 'ফ্রি',
  },
  'market.grid.postedBy': {
    en: 'Posted by',
    hi: 'द्वारा पोस्ट किया गया',
    bn: 'পোস্ট করেছেন',
  },
  'market.grid.pickup': {
    en: 'Pickup',
    hi: 'पिकअप',
    bn: 'পিকআপ',
  },
  'market.grid.originalPrice': {
    en: 'Original price',
    hi: 'मूल कीमत',
    bn: 'আসল মূল্য',
  },
  'market.grid.request': {
    en: 'Request',
    hi: 'अनुरोध करें',
    bn: 'অনুরোধ',
  },
  'market.grid.share': {
    en: 'Share',
    hi: 'साझा करें',
    bn: 'শেয়ার',
  },
  'market.grid.copied': {
    en: 'Link copied to clipboard',
    hi: 'लिंक क्लिपबोर्ड पर कॉपी किया गया',
    bn: 'লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে',
  },
  'market.emptyTitle': {
    en: 'No listings yet',
    hi: 'अभी तक कोई लिस्टिंग नहीं है',
    bn: 'এখনো কোন লিস্টিং নেই',
  },
  'market.emptyDetail': {
    en: 'Use the form above to add your first preview listing while we finish the public rollout.',
    hi: 'सार्वजनिक रोलआउट समाप्त होने तक अपनी पहली पूर्वावलोकन लिस्टिंग जोड़ने के लिए ऊपर दिए गए फ़ॉर्म का उपयोग करें।',
    bn: 'পাবলিক রিলিজের কাজ শেষ হওয়ার আগে পর্যন্ত আপনার প্রথম ডেমো লিস্টিংটি যোগ করতে উপরের ফর্মটি ব্যবহার করুন।',
  },
  'market.emptyHint': {
    en: 'Everything stays on your device until the marketplace opens.',
    hi: 'मार्केटप्लेस खुलने तक सब कुछ आपके डिवाइस पर ही रहता है।',
    bn: 'মার্কেটপ্লেস চালু হওয়ার আগে পর্যন্ত সবকিছু আপনার ডিভাইসেই থাকবে।',
  },

  // Settings Page Translations
  'settings.title': {
    en: 'Settings',
    hi: 'सेटिंग्स',
    bn: 'সেটিংস',
  },
  'settings.subtitle': {
    en: 'Manage your account and app preferences',
    hi: 'अपने खाते और ऐप प्राथमिकताओं को प्रबंधित करें',
    bn: 'আপনার অ্যাকাউন্ট ও অ্যাপের সেটিংস পরিচালনা করুন',
  },
  'settings.profileTitle': {
    en: 'Profile Settings',
    hi: 'प्रोफ़ाइल सेटिंग्स',
    bn: 'প্রোফাইল সেটিংস',
  },
  'settings.changePhoto': {
    en: 'Change Photo',
    hi: 'फोटो बदलें',
    bn: 'ছবি পরিবর্তন করুন',
  },
  'settings.firstName': {
    en: 'First Name',
    hi: 'पहला नाम',
    bn: 'প্রথম নাম',
  },
  'settings.lastName': {
    en: 'Last Name',
    hi: 'अंतिम नाम',
    bn: 'শেষ नाम',
  },
  'settings.email': {
    en: 'Email',
    hi: 'ईमेल',
    bn: 'ইমেল',
  },
  'settings.emailHint': {
    en: 'Email cannot be changed.',
    hi: 'ईमेल बदला नहीं जा सकता।',
    bn: 'ইমেল পরিবর্তন করা যাবে না।',
  },
  'settings.saving': {
    en: 'Saving...',
    hi: 'सहेजा जा रहा है...',
    bn: 'সংরক্ষণ করা হচ্ছে...',
  },
  'settings.saveChanges': {
    en: 'Save Changes',
    hi: 'बदलाव सहेजें',
    bn: 'পরিবর্তনগুলি সংরক্ষণ করুন',
  },
  'settings.preferences': {
    en: 'Preferences',
    hi: 'प्राथमिकताएं',
    bn: 'পছন্দসমূহ',
  },
  'settings.prefDetail': {
    en: 'Notification and privacy settings will appear here.',
    hi: 'अधिसूचना और गोपनीयता सेटिंग्स यहाँ दिखाई देंगी।',
    bn: 'বিজ্ঞপ্তি এবং গোপনীয়তা সেটিংস এখানে প্রদর্শিত হবে।',
  },
  'settings.editPref': {
    en: 'Edit preferences',
    hi: 'प्राथमिकताएं संपादित करें',
    bn: 'পছন্দগুলি এডিট করুন',
  },
  'settings.prefAlert': {
    en: 'Preferences coming soon',
    hi: 'प्राथमिकताएं जल्द ही आ रही हैं',
    bn: 'পছন্দগুলি শীঘ্রই আসছে',
  },

  // About Page Translations
  'about.backHome': {
    en: '← Back to Home',
    hi: '← मुख्य पृष्ठ पर वापस जाएं',
    bn: '← হোমে ফিরে যান',
  },
  'about.scrollDown': {
    en: 'Scroll down for more details',
    hi: 'अधिक जानकारी के लिए नीचे स्क्रॉल करें',
    bn: 'আরও বিস্তারিত জানার জন্য নিচে স্ক্রোল করুন',
  },
  'about.scrollMember': {
    en: 'Scroll down to view',
    hi: 'देखने के लिए नीचे स्क्रॉल करें',
    bn: 'দেখতে নিচে স্ক্রোল করুন',
  },
  'about.communicationMode': {
    en: 'Mode of Communication',
    hi: 'संचार का माध्यम',
    bn: 'যোগাযোগের মাধ্যম',
  },

  // Voice Assistant Translations
  'voice.floating.label': {
    en: 'Interactive Voice Add',
    hi: 'इंटरैक्टिव वॉयस जोड़ें',
    bn: 'ইন্টারেক্টিভ ভয়েস অ্যাড',
  },
  'voice.floating.speakInitial': {
    en: 'What would you like to add?',
    hi: 'आप क्या जोड़ना चाहेंगे?',
    bn: 'আপনি কি যোগ করতে চান?',
  },
  'voice.floating.speakQty': {
    en: 'How many?',
    hi: 'कितना?',
    bn: 'কতগুলি?',
  },
  'voice.floating.speakCategory': {
    en: 'What category is this?',
    hi: 'यह किस श्रेणी का है?',
    bn: 'এটি কোন ক্যাটাগরির?',
  },
  'voice.floating.speakExpiry': {
    en: 'When does it expire?',
    hi: 'यह कब समाप्त होगा?',
    bn: 'এটির মেয়াদ কবে শেষ হবে?',
  },
  'voice.floating.speakPrice': {
    en: 'What is the price?',
    hi: 'कीमत क्या है?',
    bn: 'এটির মূল্য কত?',
  },
  'voice.floating.speakConfirm': {
    en: 'Please confirm the details.',
    hi: 'कृपया विवरण की पुष्टि करें।',
    bn: 'দয়া করে বিস্তারিত তথ্য নিশ্চিত করুন।',
  },
  'voice.floating.noSpeech': {
    en: 'No speech detected. Please try again.',
    hi: 'कोई आवाज़ नहीं मिली। कृपया पुनः प्रयास करें।',
    bn: 'কোন শব্দ সনাক্ত করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
  },
  'voice.floating.listening': {
    en: 'Listening...',
    hi: 'सुन रहा हूँ...',
    bn: 'শুনছি...',
  },
  'voice.floating.listeningItem': {
    en: 'Listening for item...',
    hi: 'आइटम के लिए सुन रहा हूँ...',
    bn: 'আইটেমের জন্য শুনছি...',
  },
  'voice.floating.listeningQty': {
    en: 'Listening for quantity...',
    hi: 'मात्रा के लिए सुन रहा हूँ...',
    bn: 'পরিমাণের জন্য শুনছি...',
  },
  'voice.floating.listeningCategory': {
    en: 'Listening for category...',
    hi: 'श्रेणी के लिए सुन रहा हूँ...',
    bn: 'ক্যাটাগরির জন্য শুনছি...',
  },
  'voice.floating.listeningExpiry': {
    en: 'Listening for expiry...',
    hi: 'समाप्ति के लिए सुन रहा हूँ...',
    bn: 'মেয়াদের জন্য শুনছি...',
  },
  'voice.floating.listeningPrice': {
    en: 'Listening for price...',
    hi: 'कीमत के लिए सुन रहा हूँ...',
    bn: 'মূল্যের জন্য শুনছি...',
  },
  'voice.floating.processing': {
    en: 'Processing...',
    hi: 'प्रक्रिया चल रही है...',
    bn: 'প্রসেসিং হচ্ছে...',
  },
  'voice.floating.confirmDetails': {
    en: 'Confirm Details',
    hi: 'विवरण की पुष्टि करें',
    bn: 'বিস্তারিত নিশ্চিত করুন',
  },
  'voice.floating.name': {
    en: 'Name',
    hi: 'नाम',
    bn: 'নাম',
  },
  'voice.floating.qty': {
    en: 'Qty',
    hi: 'मात्रा',
    bn: 'পরিমাণ',
  },
  'voice.floating.category': {
    en: 'Category',
    hi: 'श्रेणी',
    bn: 'ক্যাটাগরি',
  },
  'voice.floating.expiry': {
    en: 'Expiry',
    hi: 'समाप्ति',
    bn: 'মেয়াদ',
  },
  'voice.floating.price': {
    en: 'Price',
    hi: 'कीमत',
    bn: 'মূল্য',
  },
  'voice.floating.confirm': {
    en: 'Confirm',
    hi: 'पुष्टि करें',
    bn: 'নিশ্চিত করুন',
  },
  'voice.floating.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    bn: 'বাতিল করুন',
  },
  'voice.floating.cancelInteraction': {
    en: 'Cancel Interaction',
    hi: 'बातचीत रद्द करें',
    bn: 'মিথস্ক্রিয়া বাতিল করুন',
  },
  'voice.floating.added': {
    en: 'Added',
    hi: 'जोड़ा गया',
    bn: 'যুক্ত করা হয়েছে',
  },
  'voice.manual.title': {
    en: 'Add item by voice',
    hi: 'आवाज से आइटम जोड़ें',
    bn: 'ভয়েস দিয়ে আইটেম যোগ করুন',
  },
  'voice.manual.notSupported': {
    en: 'Speech recognition not supported in this browser. Use Manual entry.',
    hi: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। मैनुअल प्रविष्टि का उपयोग करें।',
    bn: 'এই ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়। ম্যানুয়াল এন্ট্রি ব্যবহার করুন।',
  },
  'voice.manual.step': {
    en: 'Step',
    hi: 'चरण',
    bn: 'ধাপ',
  },
  'voice.manual.micStart': {
    en: '🎤 Start listening',
    hi: '🎤 सुनना शुरू करें',
    bn: '🎤 শোনা শুরু করুন',
  },
  'voice.manual.stop': {
    en: 'Stop',
    hi: 'रोकें',
    bn: 'থামুন',
  },
  'voice.manual.noInput': {
    en: 'No input yet',
    hi: 'अभी तक कोई इनपुट नहीं',
    bn: 'কোন ইনপুট নেই',
  },
  'voice.manual.prev': {
    en: 'Prev',
    hi: 'पिछला',
    bn: 'পূর্ববর্তী',
  },
  'voice.manual.next': {
    en: 'Next',
    hi: 'अगला',
    bn: 'পরবর্তী',
  },
  'voice.manual.finish': {
    en: 'Finish & Add',
    hi: 'समाप्त करें और जोड़ें',
    bn: 'শেষ করুন ও যোগ করুন',
  },
  'voice.manual.addedAlert': {
    en: 'Item added via voice:',
    hi: 'आवाज के माध्यम से जोड़ा गया आइटम:',
    bn: 'ভয়েসের মাধ্যমে আইটেম যোগ করা হয়েছে:',
  },
};



