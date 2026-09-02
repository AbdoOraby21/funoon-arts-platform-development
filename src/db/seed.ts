/**
 * سكربت بذر قاعدة بيانات «فُنون» — يملأ المنصة بمحتوى تجريبي ثري.
 * التشغيل: npx tsx src/db/seed.ts
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "crypto";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  artworks,
  courseEnrollments,
  courses,
  examSubmissions,
  exams,
  offers,
  pages,
  users,
  workshopBookings,
  workshops,
} from "./schema";

function hash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);
const daysAhead = (n: number, h = 17) => {
  const d = new Date(Date.now() + n * 86400_000);
  d.setHours(h, 0, 0, 0);
  return d;
};
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - n);
  return d;
};

const YT = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";

async function main() {
  const [existing] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  if ((existing?.n ?? 0) > 0) {
    console.log("ℹ️  القاعدة مملوءة بالفعل — تخطّيت البذر.");
    return;
  }

  /* ------------------------------ المستخدمون ------------------------------ */
  const [admin, salma, karim, nour, omar, lina] = await db
    .insert(users)
    .values([
      {
        name: "فريق فُنون",
        email: "admin@funoon.art",
        passwordHash: hash("admin123"),
        role: "admin",
        level: "advanced",
        artType: "painting",
        verified: true,
        bio: "حساب إدارة المنصة.",
        createdAt: monthsAgo(5),
      },
      {
        name: "سلمى النجّار",
        email: "salma@funoon.art",
        passwordHash: hash("funoon123"),
        level: "advanced",
        artType: "painting",
        verified: true,
        phone: "0500000001",
        bio: "تُلوّن الماء حتى يحكي.",
        createdAt: monthsAgo(5),
      },
      {
        name: "كريم العودي",
        email: "karim@funoon.art",
        passwordHash: hash("funoon123"),
        level: "intermediate",
        artType: "music",
        verified: true,
        phone: "0500000002",
        bio: "عازف عود، يبحث عن المقام الضائع.",
        createdAt: monthsAgo(4),
      },
      {
        name: "نور الشامي",
        email: "nour@funoon.art",
        passwordHash: hash("funoon123"),
        level: "advanced",
        artType: "writing",
        verified: true,
        phone: "0500000003",
        bio: "أكتب كي لا تنام المدينة جائعة.",
        createdAt: monthsAgo(3),
      },
      {
        name: "عمر لطفي",
        email: "omar@funoon.art",
        passwordHash: hash("funoon123"),
        level: "intermediate",
        artType: "photography",
        verified: true,
        phone: "0500000004",
        bio: "مصوّر شوارع — أطارد الضوء في الأزقة.",
        createdAt: monthsAgo(2),
      },
      {
        name: "لينا مراد",
        email: "lina@funoon.art",
        passwordHash: hash("funoon123"),
        level: "beginner",
        artType: "video",
        verified: true,
        phone: "0500000005",
        bio: "صانعة أفلام قصيرة في أول الطريق.",
        createdAt: monthsAgo(1),
      },
    ])
    .returning();

  /* ------------------------------ الأعمال الفنية ------------------------------ */
  const artRows = [
    {
      userId: salma.id,
      type: "painting",
      title: "نِزفُ الورد والذهب",
      description: "تجريد مائي على ورق قطني مصنوع يدويًا — تركت الألوان تنزف نحو بعضها دون تدخّل، ثم أضفت رشّات ذهبية وهي ما تزال رطبة.",
      fileUrl: "/art/painting-1.jpg",
      fileKind: "image",
      likesCount: 96,
      viewsCount: 412,
      createdAt: daysAgo(1),
    },
    {
      userId: salma.id,
      type: "painting",
      title: "غروب فوق أسطح القاهرة",
      description: "زيت على كانفس بسكّين الرسم — أسطح المدينة القديمة تذوب في الكهرمان والسيينا.",
      fileUrl: "/art/painting-2.jpg",
      fileKind: "image",
      likesCount: 121,
      viewsCount: 530,
      createdAt: daysAgo(4),
    },
    {
      userId: karim.id,
      type: "music",
      title: "تقاسيم على مقام البياتي",
      description: "تسجيل استوديو من مقطوعة ارتجالية على العود — تتبّع كيف يتدرّج المقام من قرار البياتي إلى جوابه.",
      fileUrl: "/art/music-1.jpg",
      fileKind: "image",
      likesCount: 64,
      viewsCount: 288,
      createdAt: daysAgo(2),
    },
    {
      userId: karim.id,
      type: "music",
      title: "أسطوانة نصف الليل",
      description: "فينيل عربي قديم من مكتبة جدي — رقمّته وسجّلت فوقه توزيعًا هادئًا بعود وجيتار.",
      fileUrl: "/art/music-2.jpg",
      fileKind: "image",
      likesCount: 58,
      viewsCount: 240,
      createdAt: daysAgo(7),
    },
    {
      userId: nour.id,
      type: "writing",
      title: "تمرين النون بالرقعة",
      description: "صفحة مُشكاتي اليومية: النون وسُلّمها، بقلم البامبو والحبر الأسود مع إمساك ذهبي للنقطة.",
      fileUrl: "/art/writing-1.jpg",
      fileKind: "image",
      likesCount: 77,
      viewsCount: 310,
      createdAt: daysAgo(3),
    },
    {
      userId: nour.id,
      type: "writing",
      title: "رسائل إلى مدينةٍ نائمة",
      description: "نص قصير من مجموعتي «ليالٍ لا تعرف الفجر».",
      fileUrl: "",
      fileKind: "text",
      textContent:
        "أيّتها المدينة التي تغفين على كتف النهر،\nاسمحي لي أن أترك تحت مصابيحك رسائل من حبرٍ لم يجفّ:\nرسالةً للنادل الذي يحفظ طلبات الغرباء،\nوأخرى لامرأةٍ تُعيد ترتيب الياسمين كلّ صباح،\nوثالثةً — وهي الأطول — لشيءٍ فيّ يشبهكِ ولا يُشبه أحدًا.\n\nفإذا استيقظتِ يومًا ووجدتِ النوافذ تكتب وحدها،\nفلا تخافي…\nإنّنا نحن الكتّاب، نمرّ من هنا ليلًا،\nنستعير من ضوئك آيةً، ونردّها لكِ فجرًا.",
      likesCount: 143,
      viewsCount: 620,
      createdAt: daysAgo(5),
    },
    {
      userId: omar.id,
      type: "photography",
      title: "زقاق الحُسين منتصف الليل",
      description: "عدسة 35mm، تعريض طويل على حجرٍ مبلّل بمطر خفيف — الفوانيس تكفي لإضاءة المشهد كله.",
      fileUrl: "/art/photo-1.jpg",
      fileKind: "image",
      likesCount: 109,
      viewsCount: 470,
      createdAt: daysAgo(1),
    },
    {
      userId: omar.id,
      type: "photography",
      title: "يدا الحرفي",
      description: "بورتريه ضوئي بإضاءة نافذة واحدة — النحّاسي في ورشته بسوق النحّاسين.",
      fileUrl: "/art/photo-2.jpg",
      fileKind: "image",
      likesCount: 88,
      viewsCount: 350,
      createdAt: daysAgo(8),
    },
    {
      userId: lina.id,
      type: "video",
      title: "عين الكاميرا — كواليس",
      description: "لقطة كواليس من فيلمي القصير الأول «نقطة فاصلة» — الرِّيج والإضاءة العملية كما هي بلا معالجة.",
      fileUrl: "/art/video-1.jpg",
      fileKind: "image",
      likesCount: 45,
      viewsCount: 190,
      createdAt: daysAgo(2),
    },
    {
      userId: lina.id,
      type: "video",
      title: "العارض القديم",
      description: "ساوند ديزاين تجريبي: شعاع جهاز عرض سينما مهجورة + غبار + صمت ثقيل. اللقطة الختامية لمشروع التخرج.",
      fileUrl: "/art/video-2.jpg",
      fileKind: "image",
      likesCount: 52,
      viewsCount: 168,
      createdAt: daysAgo(6),
    },
    {
      userId: nour.id,
      type: "writing",
      title: "دفتر الحِبر الدافئ",
      description: "توثيق لطقوس الكتابة الليلية: قلمه فضة، مصباح نحاسي، وكوب قهوة لا يبرد.",
      fileUrl: "/art/writing-2.jpg",
      fileKind: "image",
      likesCount: 39,
      viewsCount: 145,
      createdAt: daysAgo(9),
    },
    {
      userId: salma.id,
      type: "painting",
      title: "سكتش الأسبوع: عود",
      description: "دراسة سريعة بأقلام الفحم لآلة العود استعدادًا لسلسلة «موسيقى تُرى».",
      fileUrl: "/art/music-1.jpg",
      fileKind: "image",
      likesCount: 0,
      viewsCount: 12,
      createdAt: daysAgo(0),
    },
  ];
  const insertedArt = await db.insert(artworks).values(artRows).returning();

  // إعجابات عشوائية خفيفة
  const likeTargets = insertedArt.slice(0, 6);
  await Promise.all(
    likeTargets.flatMap((a, i) => [
      db.execute(
        sql`insert into artwork_likes (artwork_id, user_id) values (${a.id}, ${[karim.id, nour.id, omar.id, lina.id, salma.id][i % 5]}) on conflict do nothing`,
      ),
    ]),
  );

  /* ------------------------------ الاختبارات ------------------------------ */
  const [examPaint, examMusic, examWrite] = await db
    .insert(exams)
    .values([
      {
        title: "أساسيات الألوان والتكوين",
        artType: "painting",
        description: "يقيس فهمك لعجلة الألوان، التباين، وقواعد التكوين البصري في اللوحة.",
        durationMin: 10,
        questions: [
          {
            question: "ما اللون التكميلي للأزرق على عجلة الألوان؟",
            options: ["الأخضر", "البرتقالي", "البنفسجي", "الأصفر"],
            correctIndex: 1,
          },
          {
            question: "قاعدة الأثلاث تعني تقسيم اللوحة إلى:",
            options: ["ثلاثة ألوان فقط", "تسعة أقسام متساوية بخطين عموديين وأفقيين", "ثلاث طبقات طلاء", "ثلاث نقاط تلاشٍ"],
            correctIndex: 1,
          },
          {
            question: "التباين (Contrast) الأعلى يتحقق بين:",
            options: ["لونين متجاورين على العجلة", "درجتين من نفس اللون", "لون دافئ وآخر بارد فقط", "أفتح وأغمق قيمة"],
            correctIndex: 3,
          },
          {
            question: "«النقطة المحورية» (Focal Point) في التكوين هي:",
            options: ["مركز اللوحة دائمًا", "العنصر الذي يستقطب عين المشاهد أولًا", "أغمق بقعة في اللوحة", "إطار اللوحة الخارجي"],
            correctIndex: 1,
          },
          {
            question: "أي من الآتي لون «دافئ»؟",
            options: ["الفيروزي", "النيلي", "العنبري", "الرمادي المزرق"],
            correctIndex: 2,
          },
        ],
      },
      {
        title: "مقامات الموسيقى العربية",
        artType: "music",
        description: "اختبار قصير في التعرف على المقامات وخصائصها الأدائية.",
        durationMin: 10,
        questions: [
          {
            question: "مقام البياتي يبدأ عادةً على درجة:",
            options: ["الدو (راست)", "الري (نهاوند)", "الصبا", "العجم"],
            correctIndex: 1,
          },
          {
            question: "العلامة الفارقة في المقام العربي مقارنة بالغربي هي:",
            options: ["استخدام الإيقاع فقط", "الأرباع الصوتية (ربع البعد)", "عدم وجود تونيك", "استخدام آلة واحدة"],
            correctIndex: 1,
          },
          {
            question: "مقام الراست يُوصف شعوره غالبًا بأنه:",
            options: ["حزين عميق", "فَرِح فخور وطَرَبي", "غامض شرقي ثقيل", "رومانسي هادئ"],
            correctIndex: 1,
          },
          {
            question: "«الجُزء الأوسط» الذي يُظهر شخصية المقام يُسمى:",
            options: ["القرار", "الجواب", "الوسط/الغمّاز", "الختام"],
            correctIndex: 2,
          },
          {
            question: "أي آلة تُعدّ «سلطانة» آلات التخت العربي؟",
            options: ["الناي", "العود", "الدف", "الكمان"],
            correctIndex: 1,
          },
        ],
      },
      {
        title: "الحكي وبناء القصة القصيرة",
        artType: "writing",
        description: "نظري + تسليم عملي: ستحكي لنا مشهدًا قصصيًا بذاتك ليعتمده المدرّب.",
        durationMin: 15,
        practicalRequired: true,
        practicalPrompt: "اكتب مشهدًا قصصيًا من ٨٠–١٢٠ كلمة يبدأ بالجملة: «لم يكن الباب موصدًا هذه المرة…» — ارفعه صورة مخطوطة أو اكتبه في ملاحظة التسليم.",
        questions: [
          {
            question: "العقدة (Climax) في القصة القصيرة هي:",
            options: ["المشهد الافتتاحي", "ذروة الصراع وتحوّل مصير الشخصية", "وصف المكان", "الجملة الأخيرة حصرًا"],
            correctIndex: 1,
          },
          {
            question: "وجهة نظر السارد العليم تعني أنه:",
            options: ["يعرف أفكار كل الشخصيات", "يروي بضمير المتكلم دائمًا", "لا يعرف شيئًا عن المستقبل", "يصف ما يُرى فقط"],
            correctIndex: 0,
          },
          {
            question: "الحوار الجيد في القصة يجب أن:",
            options: ["يكون طويلًا ليكون واقعيًا", "يكشف شخصية أو يدفع الحدث", "يشرح الحبكة مباشرة", "يحل محل الوصف تمامًا"],
            correctIndex: 1,
          },
          {
            question: "«الافتتاحية الماسك» (Hook) أفضلها:",
            options: ["تشرح خلفية البطل كاملة", "جملة تثير سؤالًا لا يفلت القارئ قبل إجابته", "وصف الطقس دائمًا", "اقتباس مشهور"],
            correctIndex: 1,
          },
          {
            question: "القاعدة الذهبية «أرِ ولا تخبر» (Show, don’t tell) تعني:",
            options: ["استخدام الصور بدل النص", "التعبير عن المشاعر بالفعل والتفصيل لا بالتسمية", "عدم استخدام الحوار", "الكتابة بصيغة المضارع"],
            correctIndex: 1,
          },
        ],
      },
    ])
    .returning();

  // نتائج اختبارات جاهزة
  await db.insert(examSubmissions).values([
    {
      userId: salma.id,
      examId: examPaint.id,
      answers: [1, 1, 3, 1, 2],
      score: 100,
      status: "scored",
      createdAt: daysAgo(12),
    },
    {
      userId: karim.id,
      examId: examMusic.id,
      answers: [1, 1, 1, 2, 1],
      score: 100,
      status: "scored",
      createdAt: daysAgo(9),
    },
    {
      userId: omar.id,
      examId: examPaint.id,
      answers: [1, 1, 0, 1, 2],
      score: 80,
      status: "scored",
      createdAt: daysAgo(4),
    },
    {
      userId: lina.id,
      examId: examWrite.id,
      answers: [1, 0, 1, 1, 1],
      score: 100,
      status: "pending",
      practicalNote: "مشهد «الباب الموارب» — ١١٠ كلمات، انتظر ملاحظات المدرّب بفارغ الصبر.",
      createdAt: daysAgo(1),
    },
  ]);

  /* ------------------------------ الورش ------------------------------ */
  const [ws1, ws2, ws3] = await db
    .insert(workshops)
    .values([
      {
        title: "حضور الضوء: ورشة بورتريه ميدانية",
        artType: "photography",
        description: "ثلاث ساعات في أزقة المدينة القديمة نتعلّم فيها قراءة الضوء الطبيعي وتوجيه الموديل دون تكلّف. أحضر كاميرتك وعدستك المفضلة.",
        mode: "live",
        instructor: "عمر لطفي",
        location: "القاهرة — الحسين",
        startsAt: daysAhead(6, 16),
        capacity: 12,
      },
      {
        title: "من المقام إلى الأغنية: التطريب للمبتدئين",
        artType: "music",
        description: "ورشة تطبيقية في مقام البياتي: الفرق بين الإنشاد والتطريب، وتمارين صوتية مباشرة مع التصحيح الفردي.",
        mode: "live",
        instructor: "كريم العودي",
        location: "أونلاين — بث مباشر",
        startsAt: daysAhead(9, 19),
        capacity: 25,
      },
      {
        title: "ساعة حِبر: الحكي التفاعلي",
        artType: "writing",
        description: "نكتب مشهدًا جماعيًا سطرًا بسطر، ثم نفكك اختياراتنا اللغوية معًا. ورشة خفيفة تُشعل شهية الكتابة.",
        mode: "live",
        instructor: "نور الشامي",
        location: "أونلاين — بث مباشر",
        startsAt: daysAhead(14, 20),
        capacity: 40,
      },
      {
        title: "تسجيل مصوّر: أساسيات الألوان المائية",
        artType: "painting",
        description: "التسجيل الكامل لورشة الموسم الماضي — ٩٠ دقيقة تأسيسية من أول بلّل الورق إلى آخر رشّة.",
        mode: "recorded",
        instructor: "سلمى النجّار",
        location: "تسجيل",
        videoUrl: YT,
        capacity: 999,
        startsAt: daysAgo(20),
      },
      {
        title: "تسجيل مصوّر: قراءة فيلم قصير",
        artType: "video",
        description: "تحليل لقطة بلقطة لفيلم قصير عربي: لماذا نجح، ومتى كان يجب أن يتوقف المونتير.",
        mode: "recorded",
        instructor: "لينا مراد",
        location: "تسجيل",
        videoUrl: YT,
        capacity: 999,
        startsAt: daysAgo(30),
      },
    ])
    .returning();

  await db.insert(workshopBookings).values([
    { userId: karim.id, workshopId: ws1.id, createdAt: daysAgo(2) },
    { userId: nour.id, workshopId: ws1.id, createdAt: daysAgo(1) },
    { userId: lina.id, workshopId: ws1.id, createdAt: daysAgo(1) },
    { userId: omar.id, workshopId: ws2.id, createdAt: daysAgo(3) },
    { userId: salma.id, workshopId: ws3.id, createdAt: daysAgo(2) },
  ]);

  /* ------------------------------ الكورسات ------------------------------ */
  const [cPaint, cMusic, cWrite, cPhoto, cVideo] = await db
    .insert(courses)
    .values([
      {
        title: "مدخل إلى الألوان المائية",
        artType: "painting",
        level: "beginner",
        description: "أول كورس يمسك يدك فعلًا: خاماتك الأولى، التحكم في الماء، وغسلات اللون الثلاث — حتى لوحتك الأولى المكتملة.",
        price: 0,
        instructor: "سلمى النجّار",
        modules: [
          { title: "خاماتك الأولى: ورق وفرش وألوان تستحق الشراء", kind: "video", videoUrl: YT, body: "جولة عملية على الخامات: أنواع الورق القطني، الفرش الدائرية والمفلطحة، ولماذا لا تحتاج أكثر من ستة ألوان في بدايتك.", durationMin: 18 },
          { title: "قراءة: فلسفة الماء — لماذا لا نُقاتل اللون؟", kind: "reading", body: "الألوان المائية ليست طلاءً نُطيعه، بل شريكًا نتحاور معه. في هذه القراءة نفهم مفهوم «الرطوبة الثلاث»: ورق مبلل، فرشاة نصف رطبة، ولون كثيف — ومتى نتدخل ومتى نترك الورقة تعمل وحدها.", durationMin: 10 },
          { title: "تمرين: غسلات اللون الثلاث", kind: "exercise", body: "على ورقة A4: نفّذ غسلة مستوية، ثم متدرجة، ثم مبلل على مبلل. صوّر النتيجة وارفعها في الاستوديو لتصلك ملاحظات.", durationMin: 40 },
          { title: "لوحتك الأولى: سماء غروب مكتملة", kind: "video", videoUrl: YT, body: "نطبّق كل ما سبق خطوة بخطوة على لوحة غروب — من تثبيت الورق حتى رشّة النجوم الأخيرة.", durationMin: 32 },
        ],
      },
      {
        title: "العود من الصفر",
        artType: "music",
        level: "beginner",
        description: "مسارك الأول مع سلطان الآلات: طريقة الإمساك، أسماء الأوتار، وأولى التقاسيم على البياتي.",
        price: 150,
        instructor: "كريم العودي",
        modules: [
          { title: "تعريف العود وأجزائه وكيف نقف ونمسك", kind: "video", videoUrl: YT, body: "الظهر الكمثري، الصندوق الصوتي، المفاتيح والأوتار الخمسة المزدوجة — ووضعية الجسد الصحيحة التي تمنع آلام الكتف.", durationMin: 20 },
          { title: "قراءة: الأوتار المفتوحة وتدوينها", kind: "reading", body: "نتعلم أسماء الأوتار من الأعلى للأسفل: دو، صول، ري، لا، دو — وكيف نقرأها في التدوين العربي الحديث.", durationMin: 12 },
          { title: "تقاسيمك الأولى على البياتي", kind: "video", videoUrl: YT, body: "سُلّم مقام البياتي ببطء شديد، ثم تقسيمة صغيرة من أربع جمل نعزفها معًا وترةً بوترة.", durationMin: 28 },
        ],
      },
      {
        title: "كتابة القصة القصيرة: من الشرارة إلى القيد",
        artType: "writing",
        level: "intermediate",
        description: "للكاتب الذي بدأ ويريد أن يُتقن: بناء الشخصية، هندسة العقدة، وصنعة النهايات التي تبقى.",
        price: 0,
        instructor: "نور الشامي",
        modules: [
          { title: "الشرارة: من أين تأتي القصص فعلًا؟", kind: "reading", body: "الفرق بين الفكرة والقصة: الفكرة ساكنة، والقصة فكرة بدأ ينازعها شيء ما. نتدرب على تحويل الملاحظات اليومية إلى بذور سردية.", durationMin: 12 },
          { title: "هندسة الشخصية: الرغبة قبل الأسماء", kind: "video", videoUrl: YT, body: "لا تبدأ بالاسم والعمر — ابدأ بما تريده شخصيتك وتخشاه. نموذج ورشة مباشر على شخصية من الثلاجة إلى العيادة.", durationMin: 24 },
          { title: "تمرين: اكتب افتتاحيتين لقصة واحدة", kind: "exercise", body: "بأسلوبين مختلفين تمامًا: افتتاحية صدمة وأخرى همس. قارن بينهما — أيهما أصدق لقصتك؟", durationMin: 35 },
          { title: "صنعة النهايات", kind: "reading", body: "النهاية المفتوحة ليست كسلًا، والمغلقة ليست فجاجة. نقرأ ثلاث نهايات عربية خالدة ونفكك آليتها: Echo، Reversal، Resonance.", durationMin: 15 },
        ],
      },
      {
        title: "التصوير السينمائي الليلي",
        artType: "photography",
        level: "advanced",
        description: "تقنيات ما بعد الغروب: قياس الضوء المختلط، التعريضات الطويلة، وبناء صورة تحمل مزاج الفيلم.",
        price: 250,
        instructor: "عمر لطفي",
        modules: [
          { title: "قراءة الضوء المختلط في الشارع", kind: "video", videoUrl: YT, body: "نيون، تنجستن، وقمر في مشهد واحد — كيف تقرّر أي مصدر يسود وأيها يخدم الخلفية.", durationMin: 22 },
          { title: "التعريض الطويل بيدٍ ثابتة", kind: "video", body: "مثلث التعريض ليلًا: متى تختار 1/15 بدل الثانيتين، وحيل التثبيت دون حامل.", durationMin: 18 },
          { title: "قراءة: مزاج اللقطة الواحدة", kind: "reading", body: "لماذا تشعر أن بعض الصور «مقطع من فيلم»؟ عن عمق الميدان، حركة داخل الإطار، وقصة لا تُروى بالكامل.", durationMin: 14 },
          { title: "تمرين مشروع: ليلة واحدة، ثلاث حكايات", kind: "exercise", body: "اخرج ليلة الجمعة والتقط ثلاث صور: حضور إنساني، عمارة تتكلم، وانعكاس. انشرها في الاستوديو كسلسلة واحدة.", durationMin: 120 },
        ],
      },
      {
        title: "مونتاج الفيلم القصير",
        artType: "video",
        level: "intermediate",
        description: "من القصة إلى الجدول الزمني: نظرية القطع، إيقاع المشهد، وأخطاء المونتاج السبعة القاتلة.",
        price: 180,
        instructor: "لينا مراد",
        modules: [
          { title: "نظرية القطع: لماذا نشعر بالقفزة؟", kind: "video", videoUrl: YT, body: "قاعدة الـ30 درجة، التطابق بالحركة، ومتى تكون القفزة خيارًا أسلوبيًا لا خطأ تقنيًا.", durationMin: 20 },
          { title: "إيقاع المشهد قبل إيقاع الموسيقى", kind: "reading", body: "المونتاج ليس رقصًا على البيت — إيقاع الحوار والنظرات يقود. مثال تحليلي لمشهد صامت بنبض مكتمل.", durationMin: 12 },
          { title: "تمرين: أعد تركيب المشهد", kind: "exercise", body: "بالمادة الخام المرفقة في الوصف أعد مونتاج مشهد دقيقة واحدة بثلاث حلول: توتر، دفء، كوميديا.", durationMin: 90 },
        ],
      },
    ])
    .returning();

  await db.insert(courseEnrollments).values([
    { userId: nour.id, courseId: cWrite.id, completedAt: daysAgo(6), createdAt: daysAgo(15) },
    { userId: omar.id, courseId: cPhoto.id, createdAt: daysAgo(5) },
    { userId: lina.id, courseId: cVideo.id, createdAt: daysAgo(4) },
    { userId: karim.id, courseId: cMusic.id, createdAt: daysAgo(10) },
    { userId: salma.id, courseId: cPaint.id, completedAt: daysAgo(20), createdAt: daysAgo(40) },
  ]);

  void [admin];

  /* ------------------------------ العروض ------------------------------ */
  await db.insert(offers).values([
    {
      title: "خصم ٢٥٪ على كل الكورسات المدفوعة",
      description: "بمناسبة موسم الاستوديو الشتوي — استخدم الكود عند الاشتراك في أي كورس مدفوع وشاهد السعر يتغيّر فورًا.",
      discount: "خصم 25٪",
      code: "FUN25",
      active: true,
      expiresAt: daysAhead(18),
      createdAt: daysAgo(2),
    },
    {
      title: "ورشة مباشرة مجانية لمشتركي الكورسات",
      description: "لكل مشترك جديد في أي كورس — مقعد مجاني في ورشة «ساعة حِبر» القادمة. الكود يصل بريدك بعد الاشتراك.",
      discount: "ورشة مجانية",
      code: "WEEKEND",
      active: true,
      expiresAt: daysAhead(30),
      createdAt: daysAgo(5),
    },
    {
      title: "عرض الافتتاح الكبير (انتهى)",
      description: "خصم ٤٠٪ على أول ١٠٠ اشتراك — اكتمل العدد في أسبوعه الأول. شكرًا لثقتكم!",
      discount: "خصم 40٪",
      code: "OPEN40",
      active: false,
      expiresAt: daysAgo(15),
      createdAt: daysAgo(45),
    },
  ]);

  /* ------------------------------ الصفحات ------------------------------ */
  await db.insert(pages).values([
    {
      slug: "about",
      title: "من نحن — حكاية فُنون",
      content:
        "بدأت فُنون من سؤال بسيط: لماذا يتنقّل الفنان العربي بين عشرة تطبيقات ليعرض ألوانه في واحد وصوته في آخر وكلماته في ثالث؟\n\n«فُنون» بيت واحد يجمع الفنون الخمسة — الرسم والموسيقى والكتابة والتصوير والفيديو — تحت سقف واحد وبجدران تليق بالفن. هنا يرفع الفنان عمله فيجد من يفهمه، يختبر مستواه باختبارات نظرية وعملية يعتمدها فنانون حقيقيون، ثم يكمل طريقه بورش وكورسات صُممت بعناية حرفيين. الجميل في فُنون أن كل فنٍ له روحه حتى في شكله: لكل جناح لونه وخلفيته المرسومة وإيقاعه الخاص — لأننا نؤمن أن الواجهة هي أولى اللوحات.\n\nفريقنا صغير، فضولنا كبير، وقهوتنا لا تبرد. مرحبًا بك في بيتك.",
      published: true,
    },
    {
      slug: "terms",
      title: "شروط الاستخدام",
      content:
        "١) المحتوى: تحتفظ بكامل ملكية أعمالك الفنية، وتمنح فُنون ترخيصًا غير حصري لعرضها داخل المنصة فقط.\n٢) السلوك: يُمنع نشر أعمال الغير أو المحتوى المسيء، وللإدارة حق إزالة ما يخالف ذلك دون إنذار.\n٣) الخدمة: الحجوزات والاشتراكات تُدار عبر حسابك، والمحتوى التجريبي الحالي مخصص للمعاينة.\n٤) التغييرات: قد تُحدَّث هذه الشروط دوريًا، واستمرارك في الاستخدام يُعد موافقة عليها.",
      published: true,
    },
    {
      slug: "privacy",
      title: "سياسة الخصوصية",
      content:
        "خصوصيتك أمانة:\n\n• نجمع فقط ما يلزم لتشغيل حسابك: الاسم، البريد، رقم الهاتف (للتحقق)، وأعمالك المرفوعة.\n• لا نبيع بياناتك ولا نشاركها مع طرف ثالث لأغراض إعلانية، مُطلقًا.\n• تُخزَّن بيانات الاعتماد مشفّرة (scrypt) ولا يطّلع عليها أحد من الفريق.\n• يمكنك طلب حذف حسابك وأعمالك كاملة في أي وقت فيُنفَّذ الحذف خلال ٧٢ ساعة.",
      published: true,
    },
  ]);

  console.log("✅ تم بذر قاعدة بيانات فُنون بنجاح!");
  console.log("   الإدارة:  admin@funoon.art / admin123");
  console.log("   فنانون:  salma|karim|nour|omar|lina @funoon.art / funoon123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ فشل البذر:", err);
    process.exit(1);
  });
