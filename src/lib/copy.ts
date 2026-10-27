import type { Enjoyment, Locale, OriginChoice, ReasonTag, SiteType } from "@/lib/types";

export const copy = {
  en: {
    chooseLanguage: "Choose a language",
    english: "English",
    chinese: "简体中文",
    intro: "You will compare two websites at a time.",
    notReady: "The websites are not ready yet.",
    storeUnavailable: "Answers cannot be saved right now.",
    progress: (index: number, count: number) => `Pair ${index} of ${count}`,
    wideScreen: "Please use a laptop or desktop computer. Tablets and phones are not supported.",
    optionA: "Option A",
    optionB: "Option B",
    aBetter: "A is better",
    bBetter: "B is better",
    both: "Both",
    neither: "Neither",
    tooDifferent: "Too different to compare",
    enjoyment: "Choose which website you enjoy more, or another option if it is difficult to decide.",
    familiarity: "How much does this website look like the websites you use in China?",
    familiarityLeft: "Option A",
    familiarityRight: "Option B",
    scale: ["1 Not at all", "2", "3", "4", "5 Very much"],
    origin: "Which website do you think was made by a Chinese AI model?",
    reason: "What made you decide on your answers for this pair? (Optional)",
    continue: "Continue",
    saving: "Saving",
    backgroundTitle: "A few questions about you",
    livesNow: "Where do you live now?",
    yearsAbroad: "How many years have you lived abroad?",
    designExperience: "What design experience do you have?",
    welcomeTitle: "Welcome",
    welcomeBody: [
      "Thank you for taking part in this study from the University of California, Santa Cruz.",
      "In this study, you will see 10 pairs of websites. The websites were created by AI tools for users in China. For each pair, you can open both websites, scroll and click around, and then answer a few short questions about them.",
      "There are no right or wrong answers. We are interested in your own opinion.",
      "The study takes about 20 minutes. Please use a laptop or desktop computer. Tablets and phones are not supported.",
      "Your answers are anonymous and will be used for research only.",
      "Questions? Contact [name, email].",
    ],
    start: "Start",
    studyKicker: "Website comparison study",
    welcomeLead: "Thank you for taking part in this study from the University of California, Santa Cruz.",
    welcomeTask:
      "You will see 10 pairs of websites created by AI tools for users in China. For each pair, you'll look at both websites and answer a few short questions about them.",
    howTitle: "How it works",
    howSteps: [
      "Use the Website A and Website B tabs at the top of the screen to switch between the two websites.",
      "Look through each website carefully to get a good sense of it.",
      "Answer the questions at the bottom of the screen.",
    ],
    opinionNote: "There are no right or wrong answers. We are interested in your own opinion.",
    detailTime: "About 20 minutes",
    detailDevice: "Laptop or desktop only (no tablets or phones)",
    detailAnonymous: "Anonymous, for research only",
    tourNote: "Next, a short tour will show you how the study works.",
    contact: "Questions? Contact [name, email].",
    tourSkip: "Skip",
    tourNext: "Next",
    tourStart: "Start",
    tourSteps: [
      {
        title: "Switch between the two websites",
        copy: "Each pair has two websites, A and B. Use these tabs to switch between them, and look at both before you answer.",
      },
      {
        title: "Explore each website",
        copy: "Look through each website carefully to get a good sense of it before you answer. Take as much time as you need.",
      },
      {
        title: "Answer here",
        copy: "Answer a few short questions about each pair. The answers open once you've looked at both websites.",
      },
    ],
    lookThenAnswer: "Look at both websites, then answer the questions below.",
    questionOf: (index: number) => `Question ${index} of 3`,
    tourCount: (index: number) => `Quick tour · ${index} of 3`,
    enjoyQuestion: "Which website do you enjoy more?",
    enjoyHelp: "Look at both websites using the Website A and Website B tabs, then choose one answer.",
    enjoyA: "I enjoy A more",
    enjoyBoth: "I enjoy both",
    enjoyNeither: "I enjoy neither",
    enjoyB: "I enjoy B more",
    or: "or",
    familiarHelp: "Rate each website. You can switch between them using the tabs.",
    notAtAll: "Not at all",
    veryMuch: "Very much",
    websiteA: "Website A",
    websiteB: "Website B",
    originHelp: "Look at both websites again if you need to, then choose one answer.",
    cantDecide: "Can't decide",
    lockedHint: "Please open both Website A and Website B first.",
    reasonsEyebrow: "Your reasons (optional)",
    reasonsTitle: "Why did you choose these answers?",
    reasonsHelp: "Choose any that apply.",
    reasonsNote: "Anything else you'd like to add?",
    reasonsPlaceholder: "Type your thoughts here, in Chinese or English.",
    next: "Next",
    nextPair: "Next pair",
    reasonTags: [
      { id: "layout", label: "Layout" },
      { id: "colors", label: "Colors" },
      { id: "images", label: "Images" },
      { id: "fonts", label: "Fonts" },
      { id: "density", label: "Content density" },
      { id: "wording", label: "Wording" },
      { id: "feel", label: "Overall feel" },
      { id: "other", label: "Other" },
    ] as { id: ReasonTag; label: string }[],
    backgroundKicker: "Final step",
    backgroundHelp: "Almost done. These questions help us understand the results.",
    optional: "Optional",
    requiredStatus: "Answer all required questions to continue.",
    readyStatus: "All required questions are answered.",
    submit: "Submit",
    thanksKicker: "Study complete",
    thanksTitle: "Thank you!",
    thanksBody: "Your answers have been saved. We appreciate the time you spent on this study.",
    thanksClose: "You can now close this window.",
    thanksContact: "Questions about the study? Contact [name, email].",
    specify: "Please specify",
    thanks: "Thank you. Your answers have been recorded.",
    galleryTitle: "All websites",
    galleryPassword: "Password",
    galleryUnlock: "Open",
    galleryWrong: "That password is not right.",
    openSite: "Open",
    country: "Country",
    model: "Model",
    type: "Type",
  },
  zh: {
    chooseLanguage: "请选择语言",
    english: "English",
    chinese: "简体中文",
    intro: "你将每次比较两个网站。",
    notReady: "网站还没有准备好。",
    storeUnavailable: "现在无法保存回答。",
    progress: (index: number, count: number) => `第 ${index} 组，共 ${count} 组`,
    wideScreen: "请使用笔记本电脑或台式电脑参加，不支持平板电脑和手机。",
    optionA: "选项 A",
    optionB: "选项 B",
    aBetter: "A 更好",
    bBetter: "B 更好",
    both: "两个都好",
    neither: "两个都不好",
    tooDifferent: "差异太大，无法比较",
    enjoyment: "请选择您更喜欢的网站；如果难以决定，请选择其他选项。",
    familiarity: "这个网站有多像您在中国使用的网站？",
    familiarityLeft: "选项 A",
    familiarityRight: "选项 B",
    scale: ["1 完全不像", "2", "3", "4", "5 非常像"],
    origin: "您认为哪个网站是由中国的人工智能模型制作的？",
    reason: "您对这一组网站做出以上选择的原因是什么？（可选）",
    continue: "继续",
    saving: "正在保存",
    backgroundTitle: "几个关于你的问题",
    livesNow: "你现在住在哪里？",
    yearsAbroad: "你在国外生活了多少年？",
    designExperience: "你有哪些设计相关经验？",
    welcomeTitle: "欢迎参加本研究",
    welcomeBody: [
      "感谢您参加加州大学圣克鲁兹分校（UC Santa Cruz）的这项研究。",
      "在本研究中，您将看到 10 组网站。这些网站由人工智能工具为中国用户制作。对于每一组网站，您可以打开两个网站，滚动浏览并点击，然后回答几个关于这两个网站的简短问题。",
      "答案没有对错之分，我们只想了解您自己的看法。",
      "本研究大约需要 20 分钟。请使用笔记本电脑或台式电脑参加，不支持平板电脑和手机。",
      "您的回答是匿名的，仅用于研究。",
      "如有疑问，请联系 [姓名，邮箱]。",
    ],
    start: "开始",
    studyKicker: "网站比较研究",
    welcomeLead: "感谢您参加加州大学圣克鲁兹分校（UC Santa Cruz）的这项研究。",
    welcomeTask:
      "您将看到 10 组由人工智能工具为中国用户制作的网站。对于每一组，您会看两个网站，并回答几个简短问题。",
    howTitle: "如何进行",
    howSteps: [
      "使用屏幕上方的「网站 A」和「网站 B」标签，在两个网站之间切换。",
      "仔细浏览每个网站，充分感受它。",
      "回答屏幕下方的问题。",
    ],
    opinionNote: "答案没有对错之分。我们想了解的是您自己的看法。",
    detailTime: "大约 20 分钟",
    detailDevice: "仅限笔记本电脑或台式电脑（不支持平板和手机）",
    detailAnonymous: "匿名，仅用于研究",
    tourNote: "接下来，一段简短导览会说明本研究如何进行。",
    contact: "如有疑问，请联系 [姓名，邮箱]。",
    tourSkip: "跳过",
    tourNext: "下一步",
    tourStart: "开始",
    tourSteps: [
      {
        title: "在两个网站之间切换",
        copy: "每一组有两个网站，A 和 B。使用这些标签切换，回答前请先看过两个网站。",
      },
      {
        title: "浏览每个网站",
        copy: "回答前请仔细浏览每个网站，充分感受它。您可以按自己的节奏进行。",
      },
      {
        title: "在这里回答",
        copy: "每一组有几个简短问题。看过两个网站后，答案才会打开。",
      },
    ],
    lookThenAnswer: "请先看两个网站，再回答下面的问题。",
    questionOf: (index: number) => `第 ${index} 题，共 3 题`,
    tourCount: (index: number) => `简短导览 · ${index} / 3`,
    enjoyQuestion: "您更喜欢哪个网站？",
    enjoyHelp: "使用「网站 A」和「网站 B」标签看过两个网站后，选择一个答案。",
    enjoyA: "我更喜欢 A",
    enjoyBoth: "两个我都喜欢",
    enjoyNeither: "两个我都不喜欢",
    enjoyB: "我更喜欢 B",
    or: "或",
    familiarHelp: "请为每个网站评分。您可以用标签在它们之间切换。",
    notAtAll: "完全不像",
    veryMuch: "非常像",
    websiteA: "网站 A",
    websiteB: "网站 B",
    originHelp: "如有需要，可以再看一遍两个网站，然后选择一个答案。",
    cantDecide: "无法判断",
    lockedHint: "请先打开网站 A 和网站 B。",
    reasonsEyebrow: "您的原因（可选）",
    reasonsTitle: "您为什么选择这些答案？",
    reasonsHelp: "可多选。",
    reasonsNote: "还有什么想补充的吗？",
    reasonsPlaceholder: "用中文或英文写下您的想法。",
    next: "下一步",
    nextPair: "下一组",
    reasonTags: [
      { id: "layout", label: "版式" },
      { id: "colors", label: "颜色" },
      { id: "images", label: "图片" },
      { id: "fonts", label: "字体" },
      { id: "density", label: "内容密度" },
      { id: "wording", label: "用词" },
      { id: "feel", label: "整体感觉" },
      { id: "other", label: "其他" },
    ] as { id: ReasonTag; label: string }[],
    backgroundKicker: "最后一步",
    backgroundHelp: "快完成了。这些问题帮助我们理解研究结果。",
    optional: "可选",
    requiredStatus: "请回答所有必填问题后继续。",
    readyStatus: "必填问题已全部回答。",
    submit: "提交",
    thanksKicker: "研究完成",
    thanksTitle: "谢谢！",
    thanksBody: "您的回答已保存。感谢您为此研究花费的时间。",
    thanksClose: "您现在可以关闭此窗口。",
    thanksContact: "对本研究有疑问？请联系 [姓名，邮箱]。",
    specify: "请注明",
    thanks: "谢谢。你的回答已记录。",
    galleryTitle: "全部网站",
    galleryPassword: "密码",
    galleryUnlock: "打开",
    galleryWrong: "密码不正确。",
    openSite: "打开",
    country: "国家",
    model: "模型",
    type: "类型",
  },
} as const;

export const reasonPrompts = (
  locale: Locale,
  enjoyment: Enjoyment,
  leftScore: number,
  rightScore: number,
  origin: OriginChoice,
) => {
  if (locale === "zh") {
    const enjoymentRow =
      enjoyment === "left"
        ? ["您更喜欢网站 A。", "是什么让您喜欢它？"]
        : enjoyment === "right"
          ? ["您更喜欢网站 B。", "是什么让您喜欢它？"]
          : enjoyment === "both"
            ? ["您两个网站都喜欢。", "是什么让您喜欢它们？"]
            : enjoyment === "neither"
              ? ["您两个网站都不喜欢。", "是什么让您有这种感觉？"]
              : ["您觉得这两个网站差异太大，无法比较。", "是什么让您有这种感觉？"];
    const familiarityRow =
      leftScore === rightScore
        ? ["您认为两个网站像您在中国使用的网站的程度相同。", "是什么让它们有这种感觉？"]
        : leftScore > rightScore
          ? ["您认为网站 A 更像您在中国使用的网站。", "是什么让您有这种感觉？"]
          : ["您认为网站 B 更像您在中国使用的网站。", "是什么让您有这种感觉？"];
    const originRow =
      origin === "unsure"
        ? ["您无法判断哪个网站是由中国的人工智能模型制作的。", "是什么让您难以判断？"]
        : origin === "left"
          ? ["您认为网站 A 是由中国的人工智能模型制作的。", "是什么让您这样认为？"]
          : ["您认为网站 B 是由中国的人工智能模型制作的。", "是什么让您这样认为？"];
    return [
      { id: "enjoyment" as const, reminder: enjoymentRow[0], prompt: enjoymentRow[1] },
      { id: "familiarity" as const, reminder: familiarityRow[0], prompt: familiarityRow[1] },
      { id: "origin" as const, reminder: originRow[0], prompt: originRow[1] },
    ];
  }

  const enjoymentRow =
    enjoyment === "left"
      ? ["You enjoy Website A more.", "What made you enjoy it?"]
      : enjoyment === "right"
        ? ["You enjoy Website B more.", "What made you enjoy it?"]
        : enjoyment === "both"
          ? ["You enjoy both websites.", "What made you enjoy them?"]
          : enjoyment === "neither"
            ? ["You enjoy neither website.", "What made you feel that way?"]
            : ["You found these websites too different to compare.", "What made you feel that way?"];
  const familiarityRow =
    leftScore === rightScore
      ? ["You rated both websites as equally like the websites you use in China.", "What made them feel that way?"]
      : leftScore > rightScore
        ? ["You rated Website A as more like the websites you use in China.", "What made it feel that way?"]
        : ["You rated Website B as more like the websites you use in China.", "What made it feel that way?"];
  const originRow =
    origin === "unsure"
      ? ["You couldn't decide which website was made by a Chinese AI model.", "What made it hard to decide?"]
      : origin === "left"
        ? ["You think Website A was made by a Chinese AI model.", "What made you think so?"]
        : ["You think Website B was made by a Chinese AI model.", "What made you think so?"];
  return [
    { id: "enjoyment" as const, reminder: enjoymentRow[0], prompt: enjoymentRow[1] },
    { id: "familiarity" as const, reminder: familiarityRow[0], prompt: familiarityRow[1] },
    { id: "origin" as const, reminder: originRow[0], prompt: originRow[1] },
  ];
};

export const typeLabel = (locale: Locale, siteType: SiteType) => {
  const labels = {
    en: { clothing: "Clothing shop", restaurant: "Restaurant", news: "News" },
    zh: { clothing: "女装店", restaurant: "餐厅", news: "新闻" },
  } as const;
  return labels[locale][siteType];
};
