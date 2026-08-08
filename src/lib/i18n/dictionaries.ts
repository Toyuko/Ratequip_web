import type { Locale } from "./config";

export type Dictionary = {
  nav: {
    equipment: string;
    suppliers: string;
    rfqs: string;
    industries: string;
    compare: string;
    howItWorks: string;
    categories: string;
    pricing: string;
  };
  auth: {
    signIn: string;
    getStarted: string;
    dashboard: string;
  };
  theme: {
    label: string;
    light: string;
    dark: string;
    auto: string;
  };
  language: {
    label: string;
  };
  common: {
    search: string;
    menu: string;
    allRightsReserved: string;
  };
  footer: {
    blurb: string;
    platform: string;
    company: string;
    rfqMarketplace: string;
    comingModules: string;
    about: string;
    contact: string;
    buyerDashboard: string;
    supplierDashboard: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    heroSearchPlaceholder: string;
    searchRateQuip: string;
    postRfq: string;
    filterEquipment: string;
    filterSupplier: string;
    filterCategory: string;
    filterCountry: string;
    findSuppliers: string;
    join: string;
    searchPlaceholder: string;
    exploreTitle: string;
    exploreEquipment: string;
    exploreEquipmentBody: string;
    exploreSuppliers: string;
    exploreSuppliersBody: string;
    exploreRfqs: string;
    exploreRfqsBody: string;
    exploreNetwork: string;
    exploreNetworkBody: string;
    featuredEquipment: string;
    featuredEquipmentBody: string;
    viewEquipment: string;
    compareAction: string;
    topSuppliers: string;
    topSuppliersBody: string;
    viewDirectory: string;
    reputationTitle: string;
    reputationBody: string;
    reputationCta: string;
    latestRfqs: string;
    latestRfqsBody: string;
    createRfq: string;
    browseRfqs: string;
    rfqSpotlightTitle: string;
    rfqSpotlightBody: string;
    compareTitle: string;
    compareBody: string;
    openCompare: string;
    industriesTitle: string;
    industriesBody: string;
    journeysTitle: string;
    journeysBody: string;
    buyerTitle: string;
    buyerBody: string;
    buyerCta: string;
    supplierTitle: string;
    supplierBody: string;
    supplierCta: string;
    creditsTitle: string;
    creditsBody: string;
    creditsInvite: string;
    creditsCta: string;
    networkTitle: string;
    networkBody: string;
    networkCountries: string;
    finalTitle: string;
    finalBody: string;
    exploreCta: string;
    howTitle: string;
    howBody: string;
    discoverTitle: string;
    discoverBody: string;
    requestTitle: string;
    requestBody: string;
    verifyTitle: string;
    verifyBody: string;
    browseCategories: string;
  };
  about: {
    title: string;
    p1: string;
    p2: string;
  };
  contact: {
    title: string;
    body: string;
    emailLabel: string;
  };
  pricing: {
    title: string;
    body: string;
    buyers: string;
    suppliers: string;
  };
  suppliers: {
    title: string;
    body: string;
    searchPlaceholder: string;
    countryPlaceholder: string;
    filter: string;
  };
  requests: {
    title: string;
    body: string;
    newRfq: string;
  };
};

const en: Dictionary = {
  nav: {
    equipment: "Equipment",
    suppliers: "Suppliers",
    rfqs: "RFQs",
    industries: "Industries",
    compare: "Compare",
    howItWorks: "How It Works",
    categories: "Categories",
    pricing: "Pricing",
  },
  auth: {
    signIn: "Sign in",
    getStarted: "Join RateQuip",
    dashboard: "Dashboard",
  },
  theme: {
    label: "Color theme",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
  },
  language: {
    label: "Language",
  },
  common: {
    search: "Search",
    menu: "Toggle menu",
    allRightsReserved: "All rights reserved.",
  },
  footer: {
    blurb:
      "Independent B2B trust, procurement and equipment-lifecycle platform. Rate suppliers. Compare quotes. Connect with verified partners.",
    platform: "Platform",
    company: "Company",
    rfqMarketplace: "RFQ marketplace",
    comingModules: "Coming modules",
    about: "About",
    contact: "Contact",
    buyerDashboard: "Buyer dashboard",
    supplierDashboard: "Supplier dashboard",
  },
  home: {
    heroEyebrow: "The industrial equipment network built for better decisions",
    heroTitle: "Find. Compare. Source. Connect.",
    heroBody:
      "Discover verified suppliers, compare equipment, issue RFQs, build your industry reputation and connect with companies around the world — in one platform.",
    heroSearchPlaceholder:
      "Search equipment, suppliers, manufacturers or categories…",
    searchRateQuip: "Search RateQuip",
    postRfq: "Post an RFQ",
    filterEquipment: "Equipment",
    filterSupplier: "Supplier",
    filterCategory: "Category",
    filterCountry: "Country",
    findSuppliers: "Find suppliers",
    join: "Join RateQuip",
    searchPlaceholder: "Search suppliers, categories, or RFQs…",
    exploreTitle: "Explore RateQuip",
    exploreEquipment: "Equipment",
    exploreEquipmentBody: "Discover and compare industrial machinery.",
    exploreSuppliers: "Suppliers",
    exploreSuppliersBody: "Find manufacturers, distributors and integrators.",
    exploreRfqs: "RFQs & Opportunities",
    exploreRfqsBody: "Post requirements or discover active projects.",
    exploreNetwork: "Industry Network",
    exploreNetworkBody: "Build connections, reputation and partnerships.",
    featuredEquipment: "Featured equipment",
    featuredEquipmentBody:
      "Machinery with real specifications — not empty catalogue placeholders.",
    viewEquipment: "View equipment",
    compareAction: "Compare",
    topSuppliers: "Find the right supplier — with evidence",
    topSuppliersBody:
      "Don’t rely on a sales pitch. See the company behind the equipment: independent ratings, capabilities, history and connections.",
    viewDirectory: "Browse suppliers",
    reputationTitle: "Industrial reputation built on evidence — not marketing claims",
    reputationBody:
      "RateQuip’s trust graph grows from verified transactions, reviews, response performance and completed projects — so buyers can judge suppliers the way plant teams actually do.",
    reputationCta: "See how reputation works",
    latestRfqs: "Latest RFQs",
    latestRfqsBody: "One requirement. Multiple qualified suppliers.",
    createRfq: "Create an RFQ",
    browseRfqs: "Browse RFQs",
    rfqSpotlightTitle: "Need equipment instead?",
    rfqSpotlightBody:
      "Post a requirement once and collect qualified responses in one workspace.",
    compareTitle: "Compare equipment side-by-side",
    compareBody:
      "Specifications, capabilities, supplier, location and ratings — so COMPARE isn’t just in the name.",
    openCompare: "Open comparison workspace",
    industriesTitle: "Industries & categories",
    industriesBody:
      "Explore the plant floor by what you actually buy and install.",
    journeysTitle: "What brings you to RateQuip?",
    journeysBody: "Built for both sides of industry.",
    buyerTitle: "I’m buying equipment",
    buyerBody:
      "Search, compare, create RFQs, shortlist suppliers and request quotes — with reputation evidence at every step.",
    buyerCta: "Start as a buyer",
    supplierTitle: "I supply equipment",
    supplierBody:
      "Build your profile, list equipment, receive RFQs, earn reputation and generate qualified leads.",
    supplierCta: "Start as a supplier",
    creditsTitle: "RateQuip Credits & network growth",
    creditsBody:
      "Credits power profile boosts, featured listings, premium RFQ access and discovery placements. Invite industry businesses — they get a welcome benefit; you earn credits when they join and participate.",
    creditsInvite: "Invite partners & earn credits",
    creditsCta: "Explore referrals",
    networkTitle: "Global industrial network",
    networkBody:
      "Companies and suppliers across represented markets — growing into a live discovery map.",
    networkCountries: "Represented countries",
    finalTitle:
      "Your next supplier, machine, customer or opportunity could already be here.",
    finalBody:
      "Explore RateQuip as an industrial marketplace, reputation network and procurement platform — not just a directory.",
    exploreCta: "Explore RateQuip",
    howTitle: "How RateQuip works",
    howBody:
      "One workflow from need to verified supplier — without leaving the platform.",
    discoverTitle: "Discover",
    discoverBody: "Search suppliers by category, location and Trust Score.",
    requestTitle: "Request",
    requestBody: "Post RFQs, collect quotes and compare in one workspace.",
    verifyTitle: "Verify",
    verifyBody: "Upload purchase evidence and leave reviews that count.",
    browseCategories: "Browse categories",
  },
  about: {
    title: "About",
    p1: "RateQuip.com is an independent B2B trust, procurement, supplier intelligence, marketplace and equipment-lifecycle platform. It connects buyers, suppliers, manufacturers, contractors, inspectors, freight providers, finance partners and enterprise procurement teams.",
    p2: "Our north star: a buyer can move from need identification to supplier selection, verification, quotation, contracting, installation, lifecycle support and resale without leaving the platform — and every completed workflow improves the trust graph for everyone.",
  },
  contact: {
    title: "Contact",
    body: "Questions about RateQuip, partnerships or enterprise onboarding?",
    emailLabel: "Email us",
  },
  pricing: {
    title: "Pricing",
    body: "Plans for buyers and suppliers — start free, upgrade when you scale.",
    buyers: "Buyers",
    suppliers: "Suppliers",
  },
  suppliers: {
    title: "Suppliers",
    body: "Browse verified industrial suppliers ranked by Trust Score.",
    searchPlaceholder: "Search suppliers…",
    countryPlaceholder: "Country",
    filter: "Filter",
  },
  requests: {
    title: "RFQ marketplace",
    body: "Open procurement requests from buyers across ASEAN and beyond.",
    newRfq: "Post RFQ",
  },
};

const th: Dictionary = {
  nav: {
    equipment: "อุปกรณ์",
    suppliers: "ซัพพลายเออร์",
    rfqs: "RFQ",
    industries: "อุตสาหกรรม",
    compare: "เปรียบเทียบ",
    howItWorks: "วิธีการทำงาน",
    categories: "หมวดหมู่",
    pricing: "ราคา",
  },
  auth: {
    signIn: "เข้าสู่ระบบ",
    getStarted: "เข้าร่วม RateQuip",
    dashboard: "แดชบอร์ด",
  },
  theme: {
    label: "ธีมสี",
    light: "สว่าง",
    dark: "มืด",
    auto: "อัตโนมัติ",
  },
  language: {
    label: "ภาษา",
  },
  common: {
    search: "ค้นหา",
    menu: "เปิด/ปิดเมนู",
    allRightsReserved: "สงวนลิขสิทธิ์",
  },
  footer: {
    blurb:
      "แพลตฟอร์ม B2B สำหรับความน่าเชื่อถือ การจัดซื้อ และวงจรชีวิตอุปกรณ์อย่างอิสระ ให้คะแนนซัพพลายเออร์ เปรียบเทียบใบเสนอราคา และเชื่อมต่อกับพาร์ทเนอร์ที่ผ่านการตรวจสอบ",
    platform: "แพลตฟอร์ม",
    company: "บริษัท",
    rfqMarketplace: "ตลาด RFQ",
    comingModules: "โมดูลที่กำลังมา",
    about: "เกี่ยวกับเรา",
    contact: "ติดต่อ",
    buyerDashboard: "แดชบอร์ดผู้ซื้อ",
    supplierDashboard: "แดชบอร์ดซัพพลายเออร์",
  },
  home: {
    heroEyebrow: "เครือข่ายอุปกรณ์อุตสาหกรรมสำหรับการตัดสินใจที่ดีกว่า",
    heroTitle: "ค้นหา เปรียบเทียบ จัดหา เชื่อมต่อ",
    heroBody:
      "ค้นหาซัพพลายเออร์ที่ผ่านการตรวจสอบ เปรียบเทียบอุปกรณ์ ออก RFQ สร้างชื่อเสียงในอุตสาหกรรม และเชื่อมต่อกับบริษัททั่วโลก — ในแพลตฟอร์มเดียว",
    heroSearchPlaceholder: "ค้นหาอุปกรณ์ ซัพพลายเออร์ ผู้ผลิต หรือหมวดหมู่…",
    searchRateQuip: "ค้นหา RateQuip",
    postRfq: "โพสต์ RFQ",
    filterEquipment: "อุปกรณ์",
    filterSupplier: "ซัพพลายเออร์",
    filterCategory: "หมวดหมู่",
    filterCountry: "ประเทศ",
    findSuppliers: "ค้นหาซัพพลายเออร์",
    join: "เข้าร่วม RateQuip",
    searchPlaceholder: "ค้นหาซัพพลายเออร์ หมวดหมู่ หรือ RFQ…",
    exploreTitle: "สำรวจ RateQuip",
    exploreEquipment: "อุปกรณ์",
    exploreEquipmentBody: "ค้นพบและเปรียบเทียบเครื่องจักรอุตสาหกรรม",
    exploreSuppliers: "ซัพพลายเออร์",
    exploreSuppliersBody: "ค้นหาผู้ผลิต ผู้จัดจำหน่าย และอินทิเกรเตอร์",
    exploreRfqs: "RFQ และโอกาส",
    exploreRfqsBody: "โพสต์ความต้องการหรือค้นหาโปรเจกต์ที่เปิดอยู่",
    exploreNetwork: "เครือข่ายอุตสาหกรรม",
    exploreNetworkBody: "สร้างการเชื่อมต่อ ชื่อเสียง และพันธมิตร",
    featuredEquipment: "อุปกรณ์แนะนำ",
    featuredEquipmentBody: "เครื่องจักรพร้อมสเปกจริง — ไม่ใช่แคตตาล็อกว่าง",
    viewEquipment: "ดูอุปกรณ์",
    compareAction: "เปรียบเทียบ",
    topSuppliers: "หาซัพพลายเออร์ที่ใช่ — ด้วยหลักฐาน",
    topSuppliersBody:
      "อย่าเชื่อแค่การขาย ดูบริษัทที่อยู่เบื้องหลังอุปกรณ์: คะแนนอิสระ ความสามารถ ประวัติ และการเชื่อมต่อ",
    viewDirectory: "ดูซัพพลายเออร์",
    reputationTitle: "ชื่อเสียงอุตสาหกรรมจากหลักฐาน — ไม่ใช่คำโฆษณา",
    reputationBody:
      "กราฟความน่าเชื่อถือของ RateQuip เติบโตจากธุรกรรมที่ยืนยันแล้ว รีวิว ประสิทธิภาพการตอบกลับ และโปรเจกต์ที่เสร็จสมบูรณ์",
    reputationCta: "ดูว่าระบบชื่อเสียงทำงานอย่างไร",
    latestRfqs: "RFQ ล่าสุด",
    latestRfqsBody: "หนึ่งความต้องการ หลายซัพพลายเออร์ที่ผ่านคุณสมบัติ",
    createRfq: "สร้าง RFQ",
    browseRfqs: "เรียกดู RFQ",
    rfqSpotlightTitle: "ต้องการอุปกรณ์ใช่ไหม?",
    rfqSpotlightBody:
      "โพสต์ความต้องการครั้งเดียว และรับคำตอบจากซัพพลายเออร์ที่ผ่านคุณสมบัติในที่เดียว",
    compareTitle: "เปรียบเทียบอุปกรณ์แบบเคียงข้าง",
    compareBody:
      "สเปก ความสามารถ ซัพพลายเออร์ ที่ตั้ง และคะแนน — ให้ COMPARE ไม่ได้มีแค่ในชื่อ",
    openCompare: "เปิดพื้นที่เปรียบเทียบ",
    industriesTitle: "อุตสาหกรรมและหมวดหมู่",
    industriesBody: "สำรวจโรงงานตามสิ่งที่คุณซื้อและติดตั้งจริง",
    journeysTitle: "คุณมา RateQuip เพื่ออะไร?",
    journeysBody: "ออกแบบมาสำหรับทั้งสองฝั่งของอุตสาหกรรม",
    buyerTitle: "ฉันต้องการซื้ออุปกรณ์",
    buyerBody:
      "ค้นหา เปรียบเทียบ สร้าง RFQ คัดเลือกซัพพลายเออร์ และขอใบเสนอราคา — พร้อมหลักฐานชื่อเสียงทุกขั้นตอน",
    buyerCta: "เริ่มในฐานะผู้ซื้อ",
    supplierTitle: "ฉันเป็นผู้จำหน่ายอุปกรณ์",
    supplierBody:
      "สร้างโปรไฟล์ ลงทะเบียนอุปกรณ์ รับ RFQ สร้างชื่อเสียง และสร้างลีดที่มีคุณภาพ",
    supplierCta: "เริ่มในฐานะซัพพลายเออร์",
    creditsTitle: "RateQuip Credits และการเติบโตของเครือข่าย",
    creditsBody:
      "เครดิตใช้สำหรับบูสต์โปรไฟล์ รายการแนะนำ การเข้าถึง RFQ พรีเมียม และการโฆษณา เชิญธุรกิจในอุตสาหกรรม — พวกเขาได้รับสิทธิประโยชน์ต้อนรับ คุณได้รับเครดิตเมื่อพวกเขาเข้าร่วมและมีส่วนร่วม",
    creditsInvite: "เชิญพาร์ทเนอร์และรับเครดิต",
    creditsCta: "สำรวจระบบแนะนำ",
    networkTitle: "เครือข่ายอุตสาหกรรมระดับโลก",
    networkBody:
      "บริษัทและซัพพลายเออร์ในตลาดที่มีตัวแทน — กำลังเติบโตสู่แผนที่ค้นหาแบบสด",
    networkCountries: "ประเทศที่มีตัวแทน",
    finalTitle: "ซัพพลายเออร์ เครื่องจักร ลูกค้า หรือโอกาสถัดไปของคุณอาจอยู่ที่นี่แล้ว",
    finalBody:
      "สำรวจ RateQuip ในฐานะตลาดอุตสาหกรรม เครือข่ายชื่อเสียง และแพลตฟอร์มจัดซื้อ — ไม่ใช่แค่ไดเรกทอรี",
    exploreCta: "สำรวจ RateQuip",
    howTitle: "RateQuip ทำงานอย่างไร",
    howBody:
      "เวิร์กโฟลว์เดียวจากความต้องการไปจนถึงซัพพลายเออร์ที่ผ่านการตรวจสอบ — โดยไม่ต้องออกจากแพลตฟอร์ม",
    discoverTitle: "ค้นพบ",
    discoverBody: "ค้นหาซัพพลายเออร์ตามหมวดหมู่ ที่ตั้ง และ Trust Score",
    requestTitle: "ร้องขอ",
    requestBody: "โพสต์ RFQ รับใบเสนอราคา และเปรียบเทียบในที่เดียว",
    verifyTitle: "ตรวจสอบ",
    verifyBody: "อัปโหลดหลักฐานการซื้อและเขียนรีวิวที่มีน้ำหนัก",
    browseCategories: "เรียกดูหมวดหมู่",
  },
  about: {
    title: "เกี่ยวกับ",
    p1: "RateQuip.com เป็นแพลตฟอร์ม B2B อิสระด้านความน่าเชื่อถือ การจัดซื้อ ข้อมูลซัพพลายเออร์ ตลาดกลาง และวงจรชีวิตอุปกรณ์ เชื่อมต่อผู้ซื้อ ซัพพลายเออร์ ผู้ผลิต ผู้รับเหมา ผู้ตรวจสอบ ผู้ให้บริการขนส่ง พันธมิตรทางการเงิน และทีมจัดซื้อองค์กร",
    p2: "เป้าหมายของเรา: ผู้ซื้อสามารถเดินทางจากระบุความต้องการ ไปจนถึงคัดเลือกซัพพลายเออร์ ตรวจสอบ ขอใบเสนอราคา ทำสัญญา ติดตั้ง ดูแลตลอดอายุการใช้งาน และขายต่อ โดยไม่ต้องออกจากแพลตฟอร์ม — และทุกเวิร์กโฟลว์ที่เสร็จสมบูรณ์จะเสริมกราฟความน่าเชื่อถือให้ทุกคน",
  },
  contact: {
    title: "ติดต่อ",
    body: "มีคำถามเกี่ยวกับ RateQuip พันธมิตร หรือการเริ่มใช้งานองค์กร?",
    emailLabel: "อีเมลถึงเรา",
  },
  pricing: {
    title: "ราคา",
    body: "แพ็กเกจสำหรับผู้ซื้อและซัพพลายเออร์ — เริ่มฟรี อัปเกรดเมื่อขยายธุรกิจ",
    buyers: "ผู้ซื้อ",
    suppliers: "ซัพพลายเออร์",
  },
  suppliers: {
    title: "ซัพพลายเออร์",
    body: "เรียกดูซัพพลายเออร์อุตสาหกรรมที่ผ่านการตรวจสอบ จัดอันดับด้วย Trust Score",
    searchPlaceholder: "ค้นหาซัพพลายเออร์…",
    countryPlaceholder: "ประเทศ",
    filter: "กรอง",
  },
  requests: {
    title: "ตลาด RFQ",
    body: "คำขอจัดซื้อที่เปิดอยู่จากผู้ซื้อทั่วอาเซียนและทั่วโลก",
    newRfq: "โพสต์ RFQ",
  },
};

const zh: Dictionary = {
  nav: {
    equipment: "设备",
    suppliers: "供应商",
    rfqs: "询价",
    industries: "行业",
    compare: "对比",
    howItWorks: "运作方式",
    categories: "分类",
    pricing: "定价",
  },
  auth: {
    signIn: "登录",
    getStarted: "加入 RateQuip",
    dashboard: "控制台",
  },
  theme: {
    label: "颜色主题",
    light: "浅色",
    dark: "深色",
    auto: "自动",
  },
  language: {
    label: "语言",
  },
  common: {
    search: "搜索",
    menu: "切换菜单",
    allRightsReserved: "保留所有权利。",
  },
  footer: {
    blurb:
      "独立的 B2B 信任、采购与设备全生命周期平台。评价供应商、比较报价、连接经过验证的合作伙伴。",
    platform: "平台",
    company: "公司",
    rfqMarketplace: "询价市场",
    comingModules: "即将推出的模块",
    about: "关于我们",
    contact: "联系我们",
    buyerDashboard: "采购方控制台",
    supplierDashboard: "供应商控制台",
  },
  home: {
    heroEyebrow: "为更好决策而生的工业设备网络",
    heroTitle: "发现. 对比. 采购. 连接.",
    heroBody:
      "发现已验证供应商、对比设备、发布询价、建立行业信誉，并与全球企业连接——尽在同一平台。",
    heroSearchPlaceholder: "搜索设备、供应商、制造商或分类…",
    searchRateQuip: "搜索 RateQuip",
    postRfq: "发布询价",
    filterEquipment: "设备",
    filterSupplier: "供应商",
    filterCategory: "分类",
    filterCountry: "国家/地区",
    findSuppliers: "查找供应商",
    join: "加入 RateQuip",
    searchPlaceholder: "搜索供应商、分类或询价…",
    exploreTitle: "探索 RateQuip",
    exploreEquipment: "设备",
    exploreEquipmentBody: "发现并对比工业机械。",
    exploreSuppliers: "供应商",
    exploreSuppliersBody: "查找制造商、经销商与集成商。",
    exploreRfqs: "询价与商机",
    exploreRfqsBody: "发布需求或发现进行中的项目。",
    exploreNetwork: "产业网络",
    exploreNetworkBody: "建立连接、信誉与合作伙伴关系。",
    featuredEquipment: "精选设备",
    featuredEquipmentBody: "带真实规格的机械——不是空洞目录占位。",
    viewEquipment: "查看设备",
    compareAction: "对比",
    topSuppliers: "用证据找到合适供应商",
    topSuppliersBody:
      "不要只听销售话术。查看设备背后的企业：独立评分、能力、历史与连接。",
    viewDirectory: "浏览供应商",
    reputationTitle: "建立在证据上的工业信誉——而非营销话术",
    reputationBody:
      "RateQuip 的信任图谱来自已验证交易、评价、响应表现与已完成项目——让买家像工厂团队一样评估供应商。",
    reputationCta: "了解信誉如何运作",
    latestRfqs: "最新询价",
    latestRfqsBody: "一个需求。多个合格供应商。",
    createRfq: "创建询价",
    browseRfqs: "浏览询价",
    rfqSpotlightTitle: "需要设备？",
    rfqSpotlightBody: "发布一次需求，在同一工作区收集合格响应。",
    compareTitle: "并排对比设备",
    compareBody: "规格、能力、供应商、地点与评分——让 COMPARE 不只是名字。",
    openCompare: "打开对比工作区",
    industriesTitle: "行业与分类",
    industriesBody: "按你真正采购与安装的内容浏览工厂现场。",
    journeysTitle: "你来 RateQuip 做什么？",
    journeysBody: "为产业供需双方而建。",
    buyerTitle: "我要采购设备",
    buyerBody:
      "搜索、对比、创建询价、短名单供应商并索取报价——每一步都有信誉证据。",
    buyerCta: "以采购方开始",
    supplierTitle: "我供应设备",
    supplierBody: "建立档案、上架设备、接收询价、积累信誉并生成优质线索。",
    supplierCta: "以供应方开始",
    creditsTitle: "RateQuip 积分与网络增长",
    creditsBody:
      "积分用于档案提升、精选上架、高级询价准入与发现位投放。邀请行业企业——受邀方获得欢迎权益；当他们加入并参与时，你获得积分。",
    creditsInvite: "邀请伙伴并赚取积分",
    creditsCta: "探索推荐计划",
    networkTitle: "全球工业网络",
    networkBody: "覆盖已有代表市场的企业与供应商——正在成长为实时发现地图。",
    networkCountries: "已覆盖国家/地区",
    finalTitle: "你的下一个供应商、机器、客户或商机，可能已经在这里。",
    finalBody:
      "把 RateQuip 当作工业市场、信誉网络与采购平台来探索——而不只是名录。",
    exploreCta: "探索 RateQuip",
    howTitle: "RateQuip 如何运作",
    howBody: "从需求到已验证供应商的一站式流程——无需离开平台。",
    discoverTitle: "发现",
    discoverBody: "按分类、地区和信任评分搜索供应商。",
    requestTitle: "询价",
    requestBody: "发布询价、收集报价，并在同一工作区比较。",
    verifyTitle: "验证",
    verifyBody: "上传采购证据并留下真正有价值的评价。",
    browseCategories: "浏览分类",
  },
  about: {
    title: "关于",
    p1: "RateQuip.com 是独立的 B2B 信任、采购、供应商情报、市场与设备全生命周期平台。它连接采购方、供应商、制造商、承包商、检验方、货运商、金融合作伙伴以及企业采购团队。",
    p2: "我们的北极星目标：采购方可从需求识别一路走到供应商甄选、验证、报价、签约、安装、全生命周期支持与转售，全程无需离开平台——每一次完成的流程都会强化所有人的信任图谱。",
  },
  contact: {
    title: "联系我们",
    body: "关于 RateQuip、合作伙伴关系或企业入驻有疑问？",
    emailLabel: "发邮件给我们",
  },
  pricing: {
    title: "定价",
    body: "面向采购方与供应商的方案——免费起步，扩展时再升级。",
    buyers: "采购方",
    suppliers: "供应商",
  },
  suppliers: {
    title: "供应商",
    body: "浏览经验证的工业供应商，按信任评分排序。",
    searchPlaceholder: "搜索供应商…",
    countryPlaceholder: "国家/地区",
    filter: "筛选",
  },
  requests: {
    title: "询价市场",
    body: "来自东盟及其他地区采购方的公开采购需求。",
    newRfq: "发布询价",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  th,
  zh,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
