// Authentic Seed Data for El Safwa Office (شركة الصفوة للخدمات الحكومية والإلكترونية)
// License No. 679 Group B | Minya El Qamh & Aziziyya, Sharqia

import { Branch, Profile, ServiceType, Client, RequestRecord, RequestStatusHistory, DocumentRecord, PaymentRecord, RequestStep } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-minya-el-qamh',
    name_ar: 'الفرع الرئيسي - منيا القمح',
    name_en: 'Main Branch - Minya El Qamh',
    city: 'منيا القمح',
    address: 'شارع الحرية - أمام مجلس المدينة - منيا القمح - الشرقية',
    phones: ['01115345157', '01020384273', '01210285290'],
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'br-aziziyya',
    name_ar: 'فرع العزيزية',
    name_en: 'Aziziyya Branch',
    city: 'العزيزية',
    address: 'الطريق العام - بجوار البنك الزراعي - العزيزية - منيا القمح',
    phones: ['01210285290', '01115345157'],
    is_active: true,
    created_at: '2026-01-05T08:00:00Z'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr-admin',
    full_name: 'أحمد إبراهيم الصفوي (المدير العام)',
    email: 'admin@elsafwa.com',
    phone: '01115345157',
    branch_id: 'br-minya-el-qamh',
    role: 'admin',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-mgr-minya',
    full_name: 'م. محمود عبد السلام (مدير فرع منيا القمح)',
    email: 'minya.mgr@elsafwa.com',
    phone: '01020384273',
    branch_id: 'br-minya-el-qamh',
    role: 'branch_manager',
    is_active: true,
    created_at: '2026-01-02T08:00:00Z'
  },
  {
    id: 'usr-mgr-aziz',
    full_name: 'أ. طارق الشريف (مدير فرع العزيزية)',
    email: 'aziz.mgr@elsafwa.com',
    phone: '01210285290',
    branch_id: 'br-aziziyya',
    role: 'branch_manager',
    is_active: true,
    created_at: '2026-01-05T08:00:00Z'
  },
  {
    id: 'usr-emp-1',
    full_name: 'إسلام حسن (مسؤول تراخيص ومرافق)',
    email: 'eslam@elsafwa.com',
    phone: '01144556677',
    branch_id: 'br-minya-el-qamh',
    role: 'employee',
    is_active: true,
    created_at: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-emp-2',
    full_name: 'منى فاروق (مستندات وتأسيس شركات)',
    email: 'mona@elsafwa.com',
    phone: '01099887766',
    branch_id: 'br-aziziyya',
    role: 'employee',
    is_active: true,
    created_at: '2026-01-12T08:00:00Z'
  }
];

export const INITIAL_SERVICE_TYPES: ServiceType[] = [
  {
    id: 'srv-building-permit',
    name_ar: 'خدمات تصاريح البناء والهدم',
    name_en: 'Building & Demolition Permits',
    category: 'التراخيص والهندسة',
    default_fee: 4500,
    required_documents: ['صورة بطاقة الرقم القومي', 'عقد الملكية المسجل', 'شهادة صلاحية الموقع', 'الرسومات الهندسية المعتمدة', 'تقرير الإجهاد والإستشاري'],
    workflow_steps: [
      {
        id: 'st-bld-1',
        title: 'مراجعة أصل الملكية والمستندات القانونية',
        description: 'فحص سند الملكية والتأكد من خلو العقار من المخالفات وأحقية المالك القانونية',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة بطاقة الرقم القومي', 'عقد الملكية المسجل']
      },
      {
        id: 'st-bld-2',
        title: 'المعاينة الميدانية واستخراج شهادة الصلاحية',
        description: 'معاينة الموقع وتحديد خطوط التنظيم واستخراج شهادة الصلاحية من المركز التكنولوجي',
        order: 2,
        estimated_days: 5,
        required_documents: ['شهادة صلاحية الموقع']
      },
      {
        id: 'st-bld-3',
        title: 'اعتماد الرسومات الهندسية وتقرير الاستشاري',
        description: 'مراجعة المخططات المعمارية والإنشائية مع نقابة المهندسين والمكتب الاستشاري',
        order: 3,
        estimated_days: 7,
        required_documents: ['الرسومات الهندسية المعتمدة', 'تقرير الإجهاد والإستشاري']
      },
      {
        id: 'st-bld-4',
        title: 'فحص الحماية المدنية وسداد رسوم التراخيص',
        description: 'مراجعة اشتراطات الدفاع المدني والكهرباء وتوريد رسوم مجلس المدينة',
        order: 4,
        estimated_days: 4,
        required_documents: ['موافقة الدفاع المدني والكهرباء']
      },
      {
        id: 'st-bld-5',
        title: 'طباعة واعتماد وتسليم رخصة البناء النهائية',
        description: 'صدور قرار الترخيص النهائي معتمد ومختوم وتسليم الأصول واللوحات للعميل',
        order: 5,
        estimated_days: 3,
        required_documents: []
      }
    ],
    estimated_days: 21,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-utilities',
    name_ar: 'مرافق (كهرباء - مياه - غاز)',
    name_en: 'Utility Permits (Electricity, Water, Gas)',
    category: 'المرافق والخدمات',
    default_fee: 1500,
    required_documents: ['صورة بطاقة الرقم القومي', 'صورة عقد العقار أو المحل', 'جواب مجلس المدينة / الحي', 'رسم كروكي بالموقع'],
    workflow_steps: [
      {
        id: 'st-utl-1',
        title: 'مراجعة مستندات العقار وإثبات الحيازة',
        description: 'استلام صورة العقد والبطاقة والتأكد من مطابقة العقار ومحضر التسليم',
        order: 1,
        estimated_days: 1,
        required_documents: ['صورة بطاقة الرقم القومي', 'صورة عقد العقار أو المحل']
      },
      {
        id: 'st-utl-2',
        title: 'استخراج خطاب مجلس المدينة / الحي',
        description: 'تقديم الطلب للحي واستخراج إفادة عدم وجود مخالفات بنائية سارية',
        order: 2,
        estimated_days: 3,
        required_documents: ['جواب مجلس المدينة / الحي']
      },
      {
        id: 'st-utl-3',
        title: 'المعاينة الفنية لشركة المرافق ورسم الكروكي',
        description: 'إجراء المعاينة وتحديد نقطة الربط ومطابقة الكروكي الميداني',
        order: 3,
        estimated_days: 2,
        required_documents: ['رسم كروكي بالموقع']
      },
      {
        id: 'st-utl-4',
        title: 'سداد المقايسة وصدور أمر تركيب العداد',
        description: 'توريد قيمة المقايسة واستلام تصريح الحفر وإذن تركيب العداد المعتمد',
        order: 4,
        estimated_days: 1,
        required_documents: []
      }
    ],
    estimated_days: 7,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-eng-drawings',
    name_ar: 'رسومات هندسية واشتراطات بنائية',
    name_en: 'Engineering Drawings & Blueprints',
    category: 'التراخيص والهندسة',
    default_fee: 3000,
    required_documents: ['صورة بطاقة الرقم القومي', 'صورة عقد الأرض / العقار', 'كروكي أبعاد الموقع'],
    workflow_steps: [
      {
        id: 'st-eng-1',
        title: 'الرفع المساحي ومعاينة الموقع على الطبيعة',
        description: 'استلام الأبعاد ومطابقة الجيران والشارع والكروكي التخطيطي',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة بطاقة الرقم القومي', 'صورة عقد الأرض / العقار', 'كروكي أبعاد الموقع']
      },
      {
        id: 'st-eng-2',
        title: 'إعداد الرسومات التنفيذية وختم الاستشاري والنقابة',
        description: 'إخراج المخططات الأوتوكاد كاملة وختمها من مهندس نقابي معتمد',
        order: 2,
        estimated_days: 3,
        required_documents: []
      }
    ],
    estimated_days: 5,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-shops',
    name_ar: 'تراخيص محلات تجارية',
    name_en: 'Commercial Shop Licenses',
    category: 'التراخيص المحليات',
    default_fee: 3500,
    required_documents: ['صورة بطاقة الرقم القومي', 'عقد إيجار / تمليك المحل', 'بطاقة ضريبية وسجل تجاري', 'رسم هندسي للمحل', 'موافقة الحماية المدنية'],
    workflow_steps: [
      {
        id: 'st-shp-1',
        title: 'فحص ومراجعة عقد المحل والسجل والبطاقة الضريبية',
        description: 'استلام ومطابقة عقد الإيجار/التمليك والبطاقة والنشاط التجاري المحدد',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة بطاقة الرقم القومي', 'عقد إيجار / تمليك المحل', 'بطاقة ضريبية وسجل تجاري']
      },
      {
        id: 'st-shp-2',
        title: 'إعداد الرسم الهندسي والمعاينة الميدانية للمحل',
        description: 'معاينة مساحة المحل والاشتراطات العامة والخاصة للمركز التكنولوجي',
        order: 2,
        estimated_days: 4,
        required_documents: ['رسم هندسي للمحل']
      },
      {
        id: 'st-shp-3',
        title: 'استيفاء اشتراطات الحماية المدنية والسلامة المهنية',
        description: 'معاينة طفايات الحريق وخطة الطوارئ وتأمين المنشأة واستخراج الموافقة',
        order: 3,
        estimated_days: 4,
        required_documents: ['موافقة الحماية المدنية']
      },
      {
        id: 'st-shp-4',
        title: 'سداد الرسوم واستلام إذن التشغيل والترخيص النهائي',
        description: 'توريد الرسوم المقررة واستلام الرخصة المؤقتة أو الدائمة معتمدة',
        order: 4,
        estimated_days: 4,
        required_documents: []
      }
    ],
    estimated_days: 14,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-reconciliation',
    name_ar: 'التصالح في مخالفات البناء',
    name_en: 'Engineering Building Reconciliation',
    category: 'التراخيص والهندسة',
    default_fee: 6000,
    required_documents: ['صورة الرقم القومي', 'تقرير سلامة إنسانية واستشارية', 'صورة من المخالفة إن وجدت', 'رسومات المعاينة والتصالح'],
    workflow_steps: [
      {
        id: 'st-rec-1',
        title: 'فحص أوراق المخالفة وتحديد نموذج التقديم',
        description: 'مراجعة نموذج التصالح وصور المخالفة وتاريخ تحريرها وسند الحيازة',
        order: 1,
        estimated_days: 3,
        required_documents: ['صورة الرقم القومي', 'صورة من المخالفة إن وجدت']
      },
      {
        id: 'st-rec-2',
        title: 'إعداد تقرير السلامة الإنشائية والاستشاري',
        description: 'فحص سلامة المبنى والهيكل الإنشائي والخرسانات بمعرفة استشاري معتمد',
        order: 2,
        estimated_days: 10,
        required_documents: ['تقرير سلامة إنسانية واستشارية']
      },
      {
        id: 'st-rec-3',
        title: 'إعداد رسومات المعاينة والتصالح الهندسي',
        description: 'رفع مخططات تفصيلية للمخالفة ومطابقتها لصور الأقمار الصناعية',
        order: 3,
        estimated_days: 7,
        required_documents: ['رسومات المعاينة والتصالح']
      },
      {
        id: 'st-rec-4',
        title: 'معاينة اللجنة الفنية واستلام نموذج 8 النهائي',
        description: 'بث اللجنة الفنية بالقبول وسداد مبالغ التصالح وتسليم نموذج 8 المعتمد',
        order: 4,
        estimated_days: 10,
        required_documents: []
      }
    ],
    estimated_days: 30,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-medical',
    name_ar: 'تراخيص عيادات طبية ومعامل ومستشفيات',
    name_en: 'Medical Clinics, Labs & Hospitals Licenses',
    category: 'تراخيص مهنية وتخصصية',
    default_fee: 5000,
    required_documents: ['صورة الرقم القومي', 'كارنيه نقابة الأطباء', 'ترخيص مزاولة المهنة', 'عقد المقر والتجهيزات الطبية', 'موافقة العلاج الحر والتخلص من النفايات'],
    workflow_steps: [
      {
        id: 'st-med-1',
        title: 'مراجعة كارنيه النقابة ومستندات الطبيب والمنشأة',
        description: 'مطابقة ترخيص مزاولة المهنة وتحديد التخصص والدرجة العلمية وعقد المكان',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة الرقم القومي', 'كارنيه نقابة الأطباء']
      },
      {
        id: 'st-med-2',
        title: 'معاينة إدارة العلاج الحر ومطابقة الاشتراطات الطبية',
        description: 'معاينة المقر وفحص التجهيزات والأجهزة الطبية وتوافق الاشتراطات الصحية',
        order: 2,
        estimated_days: 8,
        required_documents: ['ترخيص مزاولة المهنة', 'عقد المقر والتجهيزات الطبية']
      },
      {
        id: 'st-med-3',
        title: 'التعاقد على النفايات الخطرة وموافقة الحماية المدنية',
        description: 'استيفاء عقد التخلص الآمن من النفايات الطبية وتأمين العيادة ضد الحريق',
        order: 3,
        estimated_days: 6,
        required_documents: ['موافقة العلاج الحر والتخلص من النفايات']
      },
      {
        id: 'st-med-4',
        title: 'إصدار ترخيص التشغيل وشهادة تسجيل المنشأة الطبية',
        description: 'استلام شهادة القيد بالنقابة وترخيص وزارة الصحة والعلاج الحر النهائي',
        order: 4,
        estimated_days: 4,
        required_documents: []
      }
    ],
    estimated_days: 20,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-bakery-tourism',
    name_ar: 'تراخيص فرن بلدي وسياحي',
    name_en: 'Bakery & Tourism Facilities Licenses',
    category: 'تراخيص محليات وتموين',
    default_fee: 4000,
    required_documents: ['صورة الرقم القومي', 'عقد المقر معتمد', 'موافقة التموين والحماية المدنية', 'الشهادات الصحية للعاملين'],
    workflow_steps: [
      {
        id: 'st-bak-1',
        title: 'مراجعة عقد المقر والمواصفات الفنية للمخبز',
        description: 'فحص مساحة المخبز والمداخن والارتفاعات ومصادر المياه والوقود',
        order: 1,
        estimated_days: 3,
        required_documents: ['صورة الرقم القومي', 'عقد المقر معتمد']
      },
      {
        id: 'st-bak-2',
        title: 'معاينة التموين والصحة والشهادات الصحية',
        description: 'مطابقة حصة الدقيق أو فحص المعدات والشهادات الصحية للعاملين',
        order: 2,
        estimated_days: 6,
        required_documents: ['الشهادات الصحية للعاملين']
      },
      {
        id: 'st-bak-3',
        title: 'موافقة الحماية المدنية واعتماد ترخيص التشغيل',
        description: 'معاينة أجهزة الإطفاء واستلام ترخيص إدارة التموين والمركز التكنولوجي',
        order: 3,
        estimated_days: 6,
        required_documents: ['موافقة التموين والحماية المدنية']
      }
    ],
    estimated_days: 15,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-company-formation',
    name_ar: 'تأسيس شركات (فردية / أموال / مساهمة)',
    name_en: 'Company Formation & Legal Entity Setup',
    category: 'خدمات الاستثمار والشركات',
    default_fee: 7000,
    required_documents: ['صور بطاقات الشركاء', 'عقد مقترح للشركة', 'شهادة البنك بحساب التأسيس', 'عقد المقر أو السجل العقاري'],
    workflow_steps: [
      {
        id: 'st-cmp-1',
        title: 'فحص أسماء الشركات والتوكيلات والشركاء',
        description: 'التحقق من عدم تكرار الاسم التجاري واستلام التوكيلات الرسمية للشركاء',
        order: 1,
        estimated_days: 2,
        required_documents: ['صور بطاقات الشركاء', 'عقد مقترح للشركة']
      },
      {
        id: 'st-cmp-2',
        title: 'فتح حساب بنكي للتأسيس وتوثيق العقد بالشهر العقاري',
        description: 'إيداع رأس المال واستخراج الشهادة البنكية وتصديق نقابة المحامين',
        order: 2,
        estimated_days: 3,
        required_documents: ['شهادة البنك بحساب التأسيس']
      },
      {
        id: 'st-cmp-3',
        title: 'القيد بهيئة الاستثمار وإصدار البطاقة الضريبية',
        description: 'استخراج الموافقة الأمنية والقيد وإصدار ملف الضرائب العامة والقيمة المضافة',
        order: 3,
        estimated_days: 3,
        required_documents: ['عقد المقر أو السجل العقاري']
      },
      {
        id: 'st-cmp-4',
        title: 'استخراج السجل التجاري واستلام الدفاتر والأختام',
        description: 'طباعة مستخرج السجل التجاري المعتمد وتفعيل ملف التأمينات الاجتماعية',
        order: 4,
        estimated_days: 2,
        required_documents: []
      }
    ],
    estimated_days: 10,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-ida',
    name_ar: 'تراخيص هيئة التنمية الصناعية (IDA)',
    name_en: 'Industrial Development Authority (IDA) Licenses',
    category: 'خدمات الاستثمار والشركات',
    default_fee: 8500,
    required_documents: ['صورة السجل التجاري والبطاقة الضريبية', 'الدراسة البيئية والمخطط الصناعي', 'موافقة الدفاع المدني والكهرباء'],
    workflow_steps: [
      {
        id: 'st-ida-1',
        title: 'مراجعة الموقف العقاري والقانوني للمصنع',
        description: 'فحص تخصيص الأرض الصناعية والسجل التجاري والبطاقة الضريبية',
        order: 1,
        estimated_days: 4,
        required_documents: ['صورة السجل التجاري والبطاقة الضريبية']
      },
      {
        id: 'st-ida-2',
        title: 'إعداد الدراسة البيئية والمخطط الصناعي',
        description: 'إعداد تقرير تقييم الأثر البيئي ومخطط الماكينات وخطوط الإنتاج',
        order: 2,
        estimated_days: 10,
        required_documents: ['الدراسة البيئية والمخطط الصناعي']
      },
      {
        id: 'st-ida-3',
        title: 'موافقة الحماية المدنية والتغذية الكهربائية',
        description: 'مطابقة شبكة الحريق والتأريض والقدرات الكهربائية المطلوبة للمصنع',
        order: 3,
        estimated_days: 7,
        required_documents: ['موافقة الدفاع المدني والكهرباء']
      },
      {
        id: 'st-ida-4',
        title: 'صدور رخصة التشغيل والسجل الصناعي النهائي',
        description: 'اعتماد الملف من هيئة التنمية الصناعية وتسليم رخصة التشغيل الدائمة',
        order: 4,
        estimated_days: 4,
        required_documents: []
      }
    ],
    estimated_days: 25,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-cafe-artistic',
    name_ar: 'تراخيص الكافيهات (المصنفات الفنية)',
    name_en: 'Cafe & Artistic Works Licenses',
    category: 'التراخيص المحليات',
    default_fee: 3800,
    required_documents: ['صورة الرقم القومي', 'عقد المكان', 'موافقة شرطة المصنفات والحماية المدنية', 'موافقة السلامة والصحة المهنية'],
    workflow_steps: [
      {
        id: 'st-caf-1',
        title: 'استلام أصل العقد ومعاينة موقع الكافيه',
        description: 'فحص عقد المقر والتأكد من عدم مجاورة دور عبادة أو مدارس وفق الضوابط',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة الرقم القومي', 'عقد المكان']
      },
      {
        id: 'st-caf-2',
        title: 'معاينة شرطة المصنفات الفنية وجهاز الرقابة',
        description: 'فحص الشاشات وأنظمة الصوت والبرمجيات والمحتوى المرئي',
        order: 2,
        estimated_days: 4,
        required_documents: ['موافقة شرطة المصنفات والحماية المدنية']
      },
      {
        id: 'st-caf-3',
        title: 'اشتراطات السلامة والصحة المهنية والدفاع المدني',
        description: 'مطابقة أجهزة الإطفاء والمخارج ومسافات الأمان وموافقات البيئة',
        order: 3,
        estimated_days: 4,
        required_documents: ['موافقة السلامة والصحة المهنية']
      },
      {
        id: 'st-caf-4',
        title: 'توريد الرسوم واستلام تصريح التشغيل',
        description: 'سداد الرسوم بالمركز التكنولوجي واستلام ترخيص الكافيه المعتمد',
        order: 4,
        estimated_days: 2,
        required_documents: []
      }
    ],
    estimated_days: 12,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-insurance',
    name_ar: 'خدمات تأمينات ومعاشات',
    name_en: 'Social Insurance & Pensions Services',
    category: 'الخدمات الحكومية الجماهيرية',
    default_fee: 800,
    required_documents: ['صورة الرقم القومي', 'برينت تأميني حديث', 'طلب سداد / تسوية التأمينات'],
    workflow_steps: [
      {
        id: 'st-ins-1',
        title: 'استخراج البرينت التأميني وفحص المدد',
        description: 'سحب كشف مدد التأمين السابقة ومراجعة الرقم التأميني',
        order: 1,
        estimated_days: 1,
        required_documents: ['صورة الرقم القومي', 'برينت تأميني حديث']
      },
      {
        id: 'st-ins-2',
        title: 'تسوية المديونيات واستلام شهادة براءة الذمة',
        description: 'سداد الاشتراكات المتأخرة واستلام الإفادة الرسمية الموجهة للجهة المعنية',
        order: 2,
        estimated_days: 2,
        required_documents: ['طلب سداد / تسوية التأمينات']
      }
    ],
    estimated_days: 3,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'srv-tech-works',
    name_ar: 'الأعمال الفنية والهندسية واستخراج السجلات',
    name_en: 'Technical & Engineering Consultancy Services',
    category: 'الخدمات الحكومية الجماهيرية',
    default_fee: 2500,
    required_documents: ['صورة الرقم القومي', 'بيانات السجل أو النمط الفني', 'التفويض الرسمي'],
    workflow_steps: [
      {
        id: 'st-tch-1',
        title: 'مراجعة الملف الفني وسند التمثيل',
        description: 'فحص التوكيل أو التفويض وتدقيق البيانات الفنية للخدمة المطلوبة',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة الرقم القومي', 'التفويض الرسمي']
      },
      {
        id: 'st-tch-2',
        title: 'إنجاز الإجراء المكتبي واستلام الشهادة الفنية',
        description: 'التنسيق مع الجهة المختصة واستلام المحرر الفني المعتمد',
        order: 2,
        estimated_days: 3,
        required_documents: ['بيانات السجل أو النمط الفني']
      }
    ],
    estimated_days: 5,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    full_name: 'الحاج فريد السيد المحمدي',
    national_id: '27503121300456',
    primary_phone: '01012345678',
    secondary_phone: '01122334455',
    address: 'شارع سعد زغلول - منيا القمح - الشرقية',
    branch_id: 'br-minya-el-qamh',
    notes: 'عميل دائم - يرغب في استخراج ترخيص محلات وتوصيل مرافق',
    created_at: '2026-02-01T09:00:00Z'
  },
  {
    id: 'cli-002',
    full_name: 'د. سامح عبد الوهاب بدوي',
    national_id: '28211051500123',
    primary_phone: '01298765432',
    address: 'حي الزهور - العزيزية - الشرقية',
    branch_id: 'br-aziziyya',
    notes: 'طبيب باطنة - استخراج ترخيص عيادة طبية معتمدة',
    created_at: '2026-02-03T10:30:00Z'
  },
  {
    id: 'cli-003',
    full_name: 'المهندس طارق منصور الجيزاوي',
    national_id: '29008201200789',
    primary_phone: '01005544332',
    secondary_phone: '01555443322',
    address: 'قرية ملامس - منيا القمح - الشرقية',
    branch_id: 'br-minya-el-qamh',
    notes: 'صاحب شركة مقاولات - التصالح في بناء مخالف',
    created_at: '2026-02-05T11:15:00Z'
  },
  {
    id: 'cli-004',
    full_name: 'الأستاذة شيماء متولي عبده',
    national_id: '29506151400999',
    primary_phone: '01144332211',
    address: 'بجوار المدرسة الثانوية - العزيزية',
    branch_id: 'br-aziziyya',
    notes: 'تأسيس شركة توزيع ومستلزمات خفيفة',
    created_at: '2026-02-08T14:00:00Z'
  }
];

export const INITIAL_REQUESTS: RequestRecord[] = [
  {
    id: 'req-101',
    tracking_ref: 'SFW-2026-00101',
    client_id: 'cli-001',
    service_type_id: 'srv-shops',
    branch_id: 'br-minya-el-qamh',
    assigned_employee_id: 'usr-emp-1',
    status: 'submitted_authority',
    priority: 'high',
    govt_ref: 'GOV-2026-8841',
    office_ref: 'OFF-MN-55',
    total_fee: 3500,
    received_date: '2026-02-02',
    target_date: '2026-02-16',
    notes: 'تم فحص أوراق المحل التجاري وتمريرها لمجلس مدينة منيا القمح',
    created_at: '2026-02-02T09:30:00Z',
    client_name: 'الحاج فريد السيد المحمدي',
    client_phone: '01012345678',
    client_national_id: '27503121300456',
    service_name_ar: 'تراخيص محلات تجارية',
    service_name_en: 'Commercial Shop Licenses',
    branch_name_ar: 'الفرع الرئيسي - منيا القمح',
    assigned_employee_name: 'إسلام حسن (مسؤول تراخيص ومرافق)',
    paid_amount: 2000,
    balance_due: 1500
  },
  {
    id: 'req-102',
    tracking_ref: 'SFW-2026-00102',
    client_id: 'cli-002',
    service_type_id: 'srv-medical',
    branch_id: 'br-aziziyya',
    assigned_employee_id: 'usr-emp-2',
    status: 'under_inspection',
    priority: 'urgent',
    govt_ref: 'MED-AR-9932',
    office_ref: 'OFF-AZ-12',
    total_fee: 5000,
    received_date: '2026-02-04',
    target_date: '2026-02-24',
    notes: 'في انتظار المعاينة الفنية من قسم العلاج الحر',
    created_at: '2026-02-04T11:00:00Z',
    client_name: 'د. سامح عبد الوهاب بدوي',
    client_phone: '01298765432',
    client_national_id: '28211051500123',
    service_name_ar: 'تراخيص عيادات طبية ومعامل ومستشفيات',
    service_name_en: 'Medical Clinics, Labs & Hospitals Licenses',
    branch_name_ar: 'فرع العزيزية',
    assigned_employee_name: 'منى فاروق (مستندات وتأسيس شركات)',
    paid_amount: 5000,
    balance_due: 0
  },
  {
    id: 'req-103',
    tracking_ref: 'SFW-2026-00103',
    client_id: 'cli-003',
    service_type_id: 'srv-reconciliation',
    branch_id: 'br-minya-el-qamh',
    assigned_employee_id: 'usr-emp-1',
    status: 'docs_missing',
    priority: 'normal',
    govt_ref: 'REC-SH-4410',
    office_ref: 'OFF-MN-89',
    total_fee: 6000,
    received_date: '2026-02-06',
    target_date: '2026-03-08',
    notes: 'ينقص تقرير الاستشاري الهندسي والسلامة الإنشائية',
    created_at: '2026-02-06T12:15:00Z',
    client_name: 'المهندس طارق منصور الجيزاوي',
    client_phone: '01005544332',
    client_national_id: '29008201200789',
    service_name_ar: 'التصالح في مخالفات البناء',
    service_name_en: 'Engineering Building Reconciliation',
    branch_name_ar: 'الفرع الرئيسي - منيا القمح',
    assigned_employee_name: 'إسلام حسن (مسؤول تراخيص ومرافق)',
    paid_amount: 3000,
    balance_due: 3000
  },
  {
    id: 'req-104',
    tracking_ref: 'SFW-2026-00104',
    client_id: 'cli-004',
    service_type_id: 'srv-company-formation',
    branch_id: 'br-aziziyya',
    assigned_employee_id: 'usr-emp-2',
    status: 'approved',
    priority: 'high',
    govt_ref: 'INV-EG-10293',
    office_ref: 'OFF-AZ-44',
    total_fee: 7000,
    received_date: '2026-02-08',
    target_date: '2026-02-18',
    notes: 'تم صدور موافقة الهيئة العامة للاستثمار والسجل التجاري',
    created_at: '2026-02-08T14:30:00Z',
    client_name: 'الأستاذة شيماء متولي عبده',
    client_phone: '01144332211',
    client_national_id: '29506151400999',
    service_name_ar: 'تأسيس شركات (فردية / أموال / مساهمة)',
    service_name_en: 'Company Formation & Legal Entity Setup',
    branch_name_ar: 'فرع العزيزية',
    assigned_employee_name: 'منى فاروق (مستندات وتأسيس شركات)',
    paid_amount: 7000,
    balance_due: 0
  }
];

export const INITIAL_STATUS_HISTORY: RequestStatusHistory[] = [
  {
    id: 'hist-101-1',
    request_id: 'req-101',
    from_status: undefined,
    to_status: 'new',
    changed_by_user_id: 'usr-emp-1',
    changed_by_user_name: 'إسلام حسن (مسؤول تراخيص ومرافق)',
    comment: 'تم تسجيل الطلب واستلام أوراق المحل التجاري في الفرع الرئيسي',
    created_at: '2026-02-02T09:30:00Z'
  },
  {
    id: 'hist-101-2',
    request_id: 'req-101',
    from_status: 'new',
    to_status: 'under_review',
    changed_by_user_id: 'usr-emp-1',
    changed_by_user_name: 'إسلام حسن (مسؤول تراخيص ومرافق)',
    comment: 'تم مراجعة استيفاء عقد الإيجار وموافقة الحماية المدنية',
    created_at: '2026-02-03T10:00:00Z'
  },
  {
    id: 'hist-101-3',
    request_id: 'req-101',
    from_status: 'under_review',
    to_status: 'submitted_authority',
    changed_by_user_id: 'usr-mgr-minya',
    changed_by_user_name: 'م. محمود عبد السلام',
    comment: 'تم تسليم الملف رسمياً لمجلس مدينة منيا القمح برقم GOV-2026-8841',
    created_at: '2026-02-05T14:20:00Z'
  },
  {
    id: 'hist-102-1',
    request_id: 'req-102',
    from_status: undefined,
    to_status: 'new',
    changed_by_user_id: 'usr-emp-2',
    changed_by_user_name: 'منى فاروق (مستندات وتأسيس شركات)',
    comment: 'استلام طلب ترخيص عيادة طبية مع كامل الرسوم المقررة',
    created_at: '2026-02-04T11:00:00Z'
  },
  {
    id: 'hist-102-2',
    request_id: 'req-102',
    from_status: 'new',
    to_status: 'submitted_authority',
    changed_by_user_id: 'usr-emp-2',
    changed_by_user_name: 'منى فاروق (مستندات وتأسيس شركات)',
    comment: 'تقديم الأوراق لنقابة الأطباء ومديرية الصحة بالشرقية',
    created_at: '2026-02-07T09:00:00Z'
  },
  {
    id: 'hist-102-3',
    request_id: 'req-102',
    from_status: 'submitted_authority',
    to_status: 'under_inspection',
    changed_by_user_id: 'usr-mgr-aziz',
    changed_by_user_name: 'أ. طارق الشريف',
    comment: 'تحديد موعد المعاينة الميدانية من قسم العلاج الحر',
    created_at: '2026-02-10T13:45:00Z'
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-101-1',
    request_id: 'req-101',
    document_type: 'صورة بطاقة الرقم القومي',
    file_name: 'بطاقة_الرقم_القومي_فريد_السيد.pdf',
    file_path: '/uploads/req-101/id_card.pdf',
    file_size: 1420000,
    uploaded_by: 'usr-emp-1',
    uploaded_by_name: 'إسلام حسن',
    version: 1,
    created_at: '2026-02-02T09:35:00Z'
  },
  {
    id: 'doc-101-2',
    request_id: 'req-101',
    step_id: 'step-101-1',
    document_type: 'عقد إيجار / تمليك المحل',
    file_name: 'عقد_إيجار_محل_منيا_القمح.pdf',
    file_path: '/uploads/req-101/lease_contract.pdf',
    file_size: 2850000,
    uploaded_by: 'usr-emp-1',
    uploaded_by_name: 'إسلام حسن',
    version: 1,
    created_at: '2026-02-02T09:40:00Z'
  },
  {
    id: 'doc-102-1',
    request_id: 'req-102',
    step_id: 'step-102-1',
    document_type: 'كارنيه نقابة الأطباء',
    file_name: 'كارنيه_النقابة_د_سامح.pdf',
    file_path: '/uploads/req-102/doctor_syndicate.pdf',
    file_size: 980000,
    uploaded_by: 'usr-emp-2',
    uploaded_by_name: 'منى فاروق',
    version: 1,
    created_at: '2026-02-04T11:10:00Z'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-101-1',
    request_id: 'req-101',
    amount: 2000,
    payment_date: '2026-02-02',
    payment_method: 'cash',
    received_by: 'usr-emp-1',
    received_by_name: 'إسلام حسن',
    receipt_no: 'REC-2026-00891',
    notes: 'مقدم أتعاب ورسوم تقديم طلب ترخيص محل تجاري',
    created_at: '2026-02-02T09:45:00Z'
  },
  {
    id: 'pay-102-1',
    request_id: 'req-102',
    amount: 5000,
    payment_date: '2026-02-04',
    payment_method: 'vodafone_cash',
    received_by: 'usr-emp-2',
    received_by_name: 'منى فاروق',
    receipt_no: 'REC-2026-00892',
    notes: 'سداد كامل رسوم ترخيص العيادة عن طريق فودافون كاش',
    created_at: '2026-02-04T11:20:00Z'
  },
  {
    id: 'pay-103-1',
    request_id: 'req-103',
    amount: 3000,
    payment_date: '2026-02-06',
    payment_method: 'cash',
    received_by: 'usr-emp-1',
    received_by_name: 'إسلام حسن',
    receipt_no: 'REC-2026-00893',
    notes: 'دفعة أولى من رسوم التصالح والإستشاري',
    created_at: '2026-02-06T12:30:00Z'
  },
  {
    id: 'pay-104-1',
    request_id: 'req-104',
    amount: 7000,
    payment_date: '2026-02-08',
    payment_method: 'bank_transfer',
    received_by: 'usr-emp-2',
    received_by_name: 'منى فاروق',
    receipt_no: 'REC-2026-00894',
    notes: 'تحويل بنكي بالكامل لاتمام تأسيس الشركة السجل والاستثمار',
    created_at: '2026-02-08T14:40:00Z'
  }
];

export const INITIAL_REQUEST_STEPS: RequestStep[] = [
  // req-101 (تراخيص محلات تجارية)
  {
    id: 'step-101-1',
    request_id: 'req-101',
    title: 'فحص ومراجعة عقد المحل والسجل والبطاقة الضريبية',
    description: 'استلام ومطابقة عقد الإيجار/التمليك والبطاقة والنشاط التجاري المحدد',
    order: 1,
    estimated_days: 2,
    target_date: '2026-02-04',
    status: 'completed',
    completed_at: '2026-02-03',
    completed_by_name: 'إسلام حسن',
    required_documents: ['صورة بطاقة الرقم القومي', 'عقد إيجار / تمليك المحل', 'بطاقة ضريبية وسجل تجاري'],
    attached_document_ids: ['doc-101-1', 'doc-101-2'],
    created_at: '2026-02-02T09:30:00Z'
  },
  {
    id: 'step-101-2',
    request_id: 'req-101',
    title: 'إعداد الرسم الهندسي والمعاينة الميدانية للمحل',
    description: 'معاينة مساحة المحل والاشتراطات العامة والخاصة للمركز التكنولوجي',
    order: 2,
    estimated_days: 4,
    target_date: '2026-02-08',
    status: 'completed',
    completed_at: '2026-02-07',
    completed_by_name: 'إسلام حسن',
    required_documents: ['رسم هندسي للمحل'],
    attached_document_ids: [],
    created_at: '2026-02-02T09:30:00Z'
  },
  {
    id: 'step-101-3',
    request_id: 'req-101',
    title: 'استيفاء اشتراطات الحماية المدنية والسلامة المهنية',
    description: 'معاينة طفايات الحريق وخطة الطوارئ وتأمين المنشأة واستخراج الموافقة',
    order: 3,
    estimated_days: 4,
    target_date: '2026-02-12',
    status: 'in_progress',
    required_documents: ['موافقة الحماية المدنية'],
    attached_document_ids: [],
    created_at: '2026-02-02T09:30:00Z'
  },
  {
    id: 'step-101-4',
    request_id: 'req-101',
    title: 'سداد الرسوم واستلام إذن التشغيل والترخيص النهائي',
    description: 'توريد الرسوم المقررة واستلام الرخصة المؤقتة أو الدائمة معتمدة',
    order: 4,
    estimated_days: 4,
    target_date: '2026-02-16',
    status: 'pending',
    required_documents: [],
    attached_document_ids: [],
    created_at: '2026-02-02T09:30:00Z'
  },

  // req-102 (تراخيص عيادات طبية)
  {
    id: 'step-102-1',
    request_id: 'req-102',
    title: 'مراجعة كارنيه النقابة ومستندات الطبيب والمنشأة',
    description: 'مطابقة ترخيص مزاولة المهنة وتحديد التخصص والدرجة العلمية وعقد المكان',
    order: 1,
    estimated_days: 2,
    target_date: '2026-02-06',
    status: 'completed',
    completed_at: '2026-02-05',
    completed_by_name: 'منى فاروق',
    required_documents: ['صورة الرقم القومي', 'كارنيه نقابة الأطباء'],
    attached_document_ids: ['doc-102-1'],
    created_at: '2026-02-04T11:00:00Z'
  },
  {
    id: 'step-102-2',
    request_id: 'req-102',
    title: 'معاينة إدارة العلاج الحر ومطابقة الاشتراطات الطبية',
    description: 'معاينة المقر وفحص التجهيزات والأجهزة الطبية وتوافق الاشتراطات الصحية',
    order: 2,
    estimated_days: 8,
    target_date: '2026-02-14',
    status: 'in_progress',
    required_documents: ['ترخيص مزاولة المهنة', 'عقد المقر والتجهيزات الطبية'],
    attached_document_ids: [],
    created_at: '2026-02-04T11:00:00Z'
  },
  {
    id: 'step-102-3',
    request_id: 'req-102',
    title: 'التعاقد على النفايات الخطرة وموافقة الحماية المدنية',
    description: 'استيفاء عقد التخلص الآمن من النفايات الطبية وتأمين العيادة ضد الحريق',
    order: 3,
    estimated_days: 6,
    target_date: '2026-02-20',
    status: 'pending',
    required_documents: ['موافقة العلاج الحر والتخلص من النفايات'],
    attached_document_ids: [],
    created_at: '2026-02-04T11:00:00Z'
  },
  {
    id: 'step-102-4',
    request_id: 'req-102',
    title: 'إصدار ترخيص التشغيل وشهادة تسجيل المنشأة الطبية',
    description: 'استلام شهادة القيد بالنقابة وترخيص وزارة الصحة والعلاج الحر النهائي',
    order: 4,
    estimated_days: 4,
    target_date: '2026-02-24',
    status: 'pending',
    required_documents: [],
    attached_document_ids: [],
    created_at: '2026-02-04T11:00:00Z'
  },

  // req-103 (التصالح في مخالفات البناء)
  {
    id: 'step-103-1',
    request_id: 'req-103',
    title: 'فحص أوراق المخالفة وتحديد نموذج التقديم',
    description: 'مراجعة نموذج التصالح وصور المخالفة وتاريخ تحريرها وسند الحيازة',
    order: 1,
    estimated_days: 3,
    target_date: '2026-02-09',
    status: 'completed',
    completed_at: '2026-02-08',
    completed_by_name: 'إسلام حسن',
    required_documents: ['صورة الرقم القومي', 'صورة من المخالفة إن وجدت'],
    attached_document_ids: [],
    created_at: '2026-02-06T12:15:00Z'
  },
  {
    id: 'step-103-2',
    request_id: 'req-103',
    title: 'إعداد تقرير السلامة الإنشائية والاستشاري',
    description: 'فحص سلامة المبنى والهيكل الإنشائي والخرسانات بمعرفة استشاري معتمد',
    order: 2,
    estimated_days: 10,
    target_date: '2026-02-19',
    status: 'blocked',
    notes: 'موقوف مؤقتاً لحين استخراج واعتماد تقرير السلامة الإنشائية الاستشاري',
    required_documents: ['تقرير سلامة إنسانية واستشارية'],
    attached_document_ids: [],
    created_at: '2026-02-06T12:15:00Z'
  },
  {
    id: 'step-103-3',
    request_id: 'req-103',
    title: 'إعداد رسومات المعاينة والتصالح الهندسي',
    description: 'رفع مخططات تفصيلية للمخالفة ومطابقتها لصور الأقمار الصناعية',
    order: 3,
    estimated_days: 7,
    target_date: '2026-02-26',
    status: 'pending',
    required_documents: ['رسومات المعاينة والتصالح'],
    attached_document_ids: [],
    created_at: '2026-02-06T12:15:00Z'
  },
  {
    id: 'step-103-4',
    request_id: 'req-103',
    title: 'معاينة اللجنة الفنية واستلام نموذج 8 النهائي',
    description: 'بث اللجنة الفنية بالقبول وسداد مبالغ التصالح وتسليم نموذج 8 المعتمد',
    order: 4,
    estimated_days: 10,
    target_date: '2026-03-08',
    status: 'pending',
    required_documents: [],
    attached_document_ids: [],
    created_at: '2026-02-06T12:15:00Z'
  },

  // req-104 (تأسيس شركات)
  {
    id: 'step-104-1',
    request_id: 'req-104',
    title: 'فحص أسماء الشركات والتوكيلات والشركاء',
    description: 'التحقق من عدم تكرار الاسم التجاري واستلام التوكيلات الرسمية للشركاء',
    order: 1,
    estimated_days: 2,
    target_date: '2026-02-10',
    status: 'completed',
    completed_at: '2026-02-09',
    completed_by_name: 'منى فاروق',
    required_documents: ['صور بطاقات الشركاء', 'عقد مقترح للشركة'],
    attached_document_ids: [],
    created_at: '2026-02-08T14:30:00Z'
  },
  {
    id: 'step-104-2',
    request_id: 'req-104',
    title: 'فتح حساب بنكي للتأسيس وتوثيق العقد بالشهر العقاري',
    description: 'إيداع رأس المال واستخراج الشهادة البنكية وتصديق نقابة المحامين',
    order: 2,
    estimated_days: 3,
    target_date: '2026-02-13',
    status: 'completed',
    completed_at: '2026-02-12',
    completed_by_name: 'منى فاروق',
    required_documents: ['شهادة البنك بحساب التأسيس'],
    attached_document_ids: [],
    created_at: '2026-02-08T14:30:00Z'
  },
  {
    id: 'step-104-3',
    request_id: 'req-104',
    title: 'القيد بهيئة الاستثمار وإصدار البطاقة الضريبية',
    description: 'استخراج الموافقة الأمنية والقيد وإصدار ملف الضرائب العامة والقيمة المضافة',
    order: 3,
    estimated_days: 3,
    target_date: '2026-02-16',
    status: 'in_progress',
    required_documents: ['عقد المقر أو السجل العقاري'],
    attached_document_ids: [],
    created_at: '2026-02-08T14:30:00Z'
  },
  {
    id: 'step-104-4',
    request_id: 'req-104',
    title: 'استخراج السجل التجاري واستلام الدفاتر والأختام',
    description: 'طباعة مستخرج السجل التجاري المعتمد وتفعيل ملف التأمينات الاجتماعية',
    order: 4,
    estimated_days: 2,
    target_date: '2026-02-18',
    status: 'pending',
    required_documents: [],
    attached_document_ids: [],
    created_at: '2026-02-08T14:30:00Z'
  }
];
