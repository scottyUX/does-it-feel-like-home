import type {
  Enjoyment,
  Locale,
  OriginChoice,
  ReasonTag,
  SiteType,
} from "@/lib/types";

export const copy = {
  en: {
    timedHint: "Please take a little more time to look at the websites.",
    lastStep: "One last step",
    describe: "Please describe",
    deviceTitle: "A larger screen is needed",
    deviceMessage:
      "This study needs a laptop or desktop computer. Please open this link on a larger screen.",
    loadFailed: "This website didn't load. Please try again.",
    loading: "Loading website…",
    reload: "Reload",
    leave: "Are you sure you want to leave? Your progress will be saved.",
    mark: "Mark on website",
    box: "Box",
    circle: "Circle",
    highlight: "Highlight",
    markHelp:
      "Drag on the website to mark a spot. Switch tabs to mark the other website.",
    note: "Add a note (optional)",
    done: "Done",
    cancel: "Cancel",
    remove: "Remove",
    captureError: "The screenshot could not be saved. Please try again.",
    markLimit:
      "Please finish or remove a mark before adding more (20 per pair).",
    savedMarks: "Saved marks",
    resume: "Continue study",

    chooseLanguage: "Choose your language",
    english: "English",
    chinese: "简体中文",
    intro: "You will compare two websites at a time.",
    notReady: "The websites are not ready yet.",
    storeUnavailable: "Answers cannot be saved right now.",
    progress: (index: number, count: number) => `Pair ${index} of ${count}`,
    wideScreen:
      "Please use a laptop or desktop computer. Tablets and phones are not supported.",
    optionA: "Option A",
    optionB: "Option B",
    aBetter: "A is better",
    bBetter: "B is better",
    both: "Both",
    neither: "Neither",
    tooDifferent: "Too different to compare",
    enjoyment:
      "Choose which website you enjoy more, or another option if it is difficult to decide.",
    familiarity:
      "How much does this website look like the websites you use in China?",
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
    welcomeLead:
      "Thank you for taking part in this study from the University of California, Santa Cruz.",
    welcomeTask:
      "You will see {count} pairs of websites created by AI tools for users in China. For each pair, you'll look at both websites and answer a few short questions about them.",
    howTitle: "How it works",
    howSteps: [
      "Use the Website A and Website B tabs at the top of the screen to switch between the two websites.",
      "Look through each website carefully to get a good sense of it.",
      "Answer the questions at the bottom of the screen.",
    ],
    opinionNote:
      "There are no right or wrong answers. We are interested in your own opinion.",
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
    enjoyHelp:
      "Look at both websites using the Website A and Website B tabs at the top of the screen, then choose one answer below.",
    enjoyA: "I enjoy A more",
    enjoyBoth: "I enjoy both",
    enjoyNeither: "I enjoy neither",
    enjoyB: "I enjoy B more",
    or: "or",
    familiarHelp:
      "Rate each website. You can switch between them using the tabs at the top.",
    notAtAll: "Not at all",
    veryMuch: "Very much",
    websiteA: "Website A",
    websiteB: "Website B",
    originHelp:
      "Look at both websites again if you need to, then choose one answer.",
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
    backgroundHelp:
      "Almost done. These questions help us understand the results.",
    optional: "Optional",
    requiredStatus: "Answer all required questions to continue.",
    readyStatus: "All required questions are answered.",
    submit: "Submit",
    thanksKicker: "Study complete",
    thanksTitle: "Thank you!",
    thanksBody:
      "Your answers have been saved. We appreciate the time you spent on this study.",
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
    timedHint: "请再多花一点时间浏览网站。",
    lastStep: "最后一步",
    describe: "请说明",
    deviceTitle: "请使用更大的屏幕",
    deviceMessage:
      "本研究需要使用笔记本电脑或台式电脑。请在更大的屏幕上打开此链接。",
    loadFailed: "网站未能加载，请重试。",
    loading: "正在加载网站…",
    reload: "重新加载",
    leave: "确定要离开吗？您的进度将被保存。",
    mark: "在网站上标记",
    box: "方框",
    circle: "圆圈",
    highlight: "高亮",
    markHelp: "在网站上拖动以标记位置。您也可以切换标签标记另一个网站。",
    note: "添加备注（可选）",
    done: "完成",
    cancel: "取消",
    remove: "移除",
    captureError: "截图未能保存，请重试。",
    markLimit: "每组最多可保存20个标记。请先完成或移除一个标记。",
    savedMarks: "已保存的标记",
    resume: "继续研究",

    chooseLanguage: "选择语言",
    english: "English",
    chinese: "简体中文",
    intro: "你将每次比较两个网站。",
    notReady: "网站还没有准备好。",
    storeUnavailable: "现在无法保存回答。",
    progress: (index: number, count: number) =>
      `第 ${index} 组，共 ${count} 组`,
    wideScreen: "请使用笔记本电脑或台式电脑参加，不支持平板电脑和手机。",
    optionA: "选项 A",
    optionB: "选项 B",
    aBetter: "A 更好",
    bBetter: "B 更好",
    both: "两个都好",
    neither: "两个都不好",
    tooDifferent: "差别太大，无法比较",
    enjoyment: "请选择您更喜欢的网站；如果难以决定，请选择其他选项。",
    familiarity: "这个网站和您在中国使用的网站有多像？",
    familiarityLeft: "选项 A",
    familiarityRight: "选项 B",
    scale: ["1 完全不像", "2", "3", "4", "5 非常像"],
    origin: "您认为哪个网站是由中国人工智能模型制作的？",
    reason: "您对这一组网站做出以上选择的原因是什么？（可选）",
    continue: "继续",
    saving: "正在保存",
    backgroundTitle: "关于您的几个问题",
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
      "您将看到 {count} 组由人工智能工具为中国用户制作的网站。对于每一组网站，请查看两个网站，然后回答几个简短的问题。",
    howTitle: "使用方法",
    howSteps: [
      "使用屏幕上方的“网站 A”和“网站 B”标签在两个网站之间切换。",
      "仔细浏览每个网站，对它有充分的了解。",
      "在屏幕下方回答问题。",
    ],
    opinionNote: "答案没有对错之分，我们只想了解您自己的看法。",
    detailTime: "大约 20 分钟",
    detailDevice: "仅限笔记本电脑或台式电脑（不支持平板和手机）",
    detailAnonymous: "匿名，仅用于研究",
    tourNote: "接下来，一段简短导览会说明本研究使用方法。",
    contact: "如有疑问，请联系 [姓名，邮箱]。",
    tourSkip: "跳过",
    tourNext: "下一步",
    tourStart: "开始",
    tourSteps: [
      {
        title: "在两个网站之间切换",
        copy: "每组有两个网站：A 和 B。使用这些标签在两个网站之间切换，请先查看两个网站再作答。",
      },
      {
        title: "浏览每个网站",
        copy: "回答前请仔细浏览每个网站，对它有充分的了解。您可以按自己的节奏进行。",
      },
      {
        title: "在这里作答",
        copy: "每组网站有几个简短的问题。查看两个网站后，即可选择答案。",
      },
    ],
    lookThenAnswer: "请查看两个网站，然后回答下方的问题。",
    questionOf: (index: number) => `第 ${index} 题，共 3 题`,
    tourCount: (index: number) => `简短导览 · ${index} / 3`,
    enjoyQuestion: "您更喜欢哪个网站？",
    enjoyHelp:
      "请使用屏幕上方的“网站 A”和“网站 B”标签查看两个网站，然后在下方选择一个答案。",
    enjoyA: "我更喜欢 A",
    enjoyBoth: "两个都喜欢",
    enjoyNeither: "两个都不喜欢",
    enjoyB: "我更喜欢 B",
    or: "或",
    familiarHelp: "请为每个网站评分。您可以使用屏幕上方的标签切换网站。",
    notAtAll: "完全不像",
    veryMuch: "非常像",
    websiteA: "网站 A",
    websiteB: "网站 B",
    originHelp: "如有需要，可以再次查看两个网站，然后选择一个答案。",
    cantDecide: "无法判断",
    lockedHint: "请先打开网站 A 和网站 B。",
    reasonsEyebrow: "您的理由（可选）",
    reasonsTitle: "您为什么这样选择？",
    reasonsHelp: "可多选。",
    reasonsNote: "还有其他想补充的吗？",
    reasonsPlaceholder: "请在这里输入您的想法，中文或英文均可。",
    next: "下一步",
    nextPair: "下一组",
    reasonTags: [
      { id: "layout", label: "布局" },
      { id: "colors", label: "颜色" },
      { id: "images", label: "图片" },
      { id: "fonts", label: "字体" },
      { id: "density", label: "信息密度" },
      { id: "wording", label: "用语" },
      { id: "feel", label: "整体感觉" },
      { id: "other", label: "其他" },
    ] as { id: ReasonTag; label: string }[],
    backgroundKicker: "最后一步",
    backgroundHelp: "快完成了。这些问题将帮助我们理解研究结果。",
    optional: "可选",
    requiredStatus: "请回答所有必答问题后继续。",
    readyStatus: "必填问题已全部回答。",
    submit: "提交",
    thanksKicker: "研究完成",
    thanksTitle: "感谢您的参与！",
    thanksBody: "您的回答已保存。感谢您抽出时间参加本研究。",
    thanksClose: "现在您可以关闭此窗口。",
    thanksContact: "如对本研究有任何疑问，请联系 [姓名，邮箱]。",
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
              : [
                  "您觉得这两个网站差别太大，无法比较。",
                  "是什么让您有这种感觉？",
                ];
    const familiarityRow =
      leftScore === rightScore
        ? [
            "您认为两个网站像您在中国使用的网站的程度相同。",
            "是什么让它们有这种感觉？",
          ]
        : leftScore > rightScore
          ? ["您认为网站 A 更像您在中国使用的网站。", "是什么让您有这种感觉？"]
          : ["您认为网站 B 更像您在中国使用的网站。", "是什么让您有这种感觉？"];
    const originRow =
      origin === "unsure"
        ? ["您无法判断。", "是什么让您难以判断？"]
        : origin === "left"
          ? [
              "您认为网站 A 是由中国人工智能模型制作的。",
              "是什么让您这样认为？",
            ]
          : [
              "您认为网站 B 是由中国人工智能模型制作的。",
              "是什么让您这样认为？",
            ];
    return [
      {
        id: "enjoyment" as const,
        reminder: enjoymentRow[0],
        prompt: enjoymentRow[1],
      },
      ...(leftScore === rightScore
        ? []
        : [
            {
              id: "familiarity" as const,
              reminder: familiarityRow[0],
              prompt: familiarityRow[1],
            },
          ]),
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
            ? [
                "You don't enjoy either website.",
                "What made you feel that way?",
              ]
            : [
                "You found them too different to compare.",
                "What made them so different?",
              ];
  const familiarityRow =
    leftScore === rightScore
      ? [
          "You rated both websites as equally like the websites you use in China.",
          "What made them feel that way?",
        ]
      : leftScore > rightScore
        ? [
            "You rated Website A as more like the websites you use in China.",
            "What made it feel that way?",
          ]
        : [
            "You rated Website B as more like the websites you use in China.",
            "What made it feel that way?",
          ];
  const originRow =
    origin === "unsure"
      ? ["You couldn't decide.", "What made it hard to tell?"]
      : origin === "left"
        ? [
            "You think Website A was made by a Chinese AI model.",
            "What made you think so?",
          ]
        : [
            "You think Website B was made by a Chinese AI model.",
            "What made you think so?",
          ];
  return [
    {
      id: "enjoyment" as const,
      reminder: enjoymentRow[0],
      prompt: enjoymentRow[1],
    },
    ...(leftScore === rightScore
      ? []
      : [
          {
            id: "familiarity" as const,
            reminder: familiarityRow[0],
            prompt: familiarityRow[1],
          },
        ]),
    { id: "origin" as const, reminder: originRow[0], prompt: originRow[1] },
  ];
};

export const typeLabel = (locale: Locale, siteType: SiteType) => {
  const labels = {
    en: {
      clothing: "Clothing shop",
      restaurant: "Restaurant",
      news: "News",
      "social-media": "Social media",
      travel: "Travel",
      bank: "Bank",
      "food-delivery": "Food delivery",
      "beauty-salon": "Beauty salon",
      learning: "Online learning",
      "home-cleaning": "Home cleaning",
    },
    zh: {
      clothing: "女装店",
      restaurant: "餐厅",
      news: "新闻",
      "social-media": "社交媒体",
      travel: "旅行预订",
      bank: "银行",
      "food-delivery": "外卖",
      "beauty-salon": "美容美发",
      learning: "在线学习",
      "home-cleaning": "家政清洁",
    },
  } as const;
  return labels[locale][siteType];
};
