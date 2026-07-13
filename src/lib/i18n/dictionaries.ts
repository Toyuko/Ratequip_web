import type { Locale } from "./config";

export type Dictionary = {
  nav: {
    suppliers: string;
    rfqs: string;
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
    heroTitle: string;
    heroBody: string;
    findSuppliers: string;
    join: string;
    searchPlaceholder: string;
    topSuppliers: string;
    topSuppliersBody: string;
    viewDirectory: string;
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
    suppliers: "Suppliers",
    rfqs: "RFQs",
    categories: "Categories",
    pricing: "Pricing",
  },
  auth: {
    signIn: "Sign in",
    getStarted: "Get started",
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
    heroTitle: "Trust the suppliers who build your plant.",
    heroBody:
      "Independent B2B reputation, RFQs and equipment intelligence — so every purchase decision starts with verified evidence.",
    findSuppliers: "Find suppliers",
    join: "Join RateQuip",
    searchPlaceholder: "Search suppliers, categories, or RFQs…",
    topSuppliers: "Top trusted suppliers",
    topSuppliersBody:
      "Ranked by RateQuip Trust Score from verified reviews and evidence.",
    viewDirectory: "View directory",
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
    suppliers: "ซัพพลายเออร์",
    rfqs: "RFQ",
    categories: "หมวดหมู่",
    pricing: "ราคา",
  },
  auth: {
    signIn: "เข้าสู่ระบบ",
    getStarted: "เริ่มต้นใช้งาน",
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
    heroTitle: "เชื่อมั่นในซัพพลายเออร์ที่สร้างโรงงานของคุณ",
    heroBody:
      "ชื่อเสียง B2B อิสระ RFQ และข้อมูลอุปกรณ์ — ให้ทุกการตัดสินใจซื้อเริ่มจากหลักฐานที่ตรวจสอบได้",
    findSuppliers: "ค้นหาซัพพลายเออร์",
    join: "เข้าร่วม RateQuip",
    searchPlaceholder: "ค้นหาซัพพลายเออร์ หมวดหมู่ หรือ RFQ…",
    topSuppliers: "ซัพพลายเออร์ที่น่าเชื่อถือสูงสุด",
    topSuppliersBody:
      "จัดอันดับด้วย RateQuip Trust Score จากรีวิวและหลักฐานที่ยืนยันแล้ว",
    viewDirectory: "ดูไดเรกทอรี",
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
    suppliers: "供应商",
    rfqs: "询价",
    categories: "分类",
    pricing: "定价",
  },
  auth: {
    signIn: "登录",
    getStarted: "立即开始",
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
    heroTitle: "信任那些建设您工厂的供应商。",
    heroBody:
      "独立的 B2B 信誉、询价与设备情报——让每一次采购决策都从可验证证据开始。",
    findSuppliers: "查找供应商",
    join: "加入 RateQuip",
    searchPlaceholder: "搜索供应商、分类或询价…",
    topSuppliers: "最受信赖的供应商",
    topSuppliersBody: "按 RateQuip 信任评分排序，基于已验证评价与证据。",
    viewDirectory: "查看名录",
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
