import type { Locale } from "@/lib/types";

export type BackgroundAnswers = {
  age: string;
  gender: string;
  born: string;
  bornSpecify: string;
  grewUp: string;
  grewUpSpecify: string;
  livesNow: string;
  livesSpecify: string;
  yearsOutside: string;
  firstLanguage: string;
  languageSpecify: string;
  chineseWebUse: string;
  designExperience: string;
};

type Option = { value: string; label: string };

export type BackgroundQuestion = {
  id: keyof BackgroundAnswers;
  specifyKey?: keyof BackgroundAnswers;
  prompt: string;
  optional?: boolean;
  options: Option[];
};

const questions = {
  en: [
    {
      id: "age",
      prompt: "What is your age?",
      options: [
        { value: "18-24", label: "18–24" },
        { value: "25-34", label: "25–34" },
        { value: "35-44", label: "35–44" },
        { value: "45-54", label: "45–54" },
        { value: "55+", label: "55 or older" },
      ],
    },
    {
      id: "gender",
      prompt: "What is your gender? (optional)",
      optional: true,
      options: [
        { value: "woman", label: "Woman" },
        { value: "man", label: "Man" },
        { value: "nonbinary", label: "Non-binary" },
        { value: "undisclosed", label: "Prefer not to say" },
      ],
    },
    {
      id: "born",
      specifyKey: "bornSpecify",
      prompt: "Where were you born?",
      options: [
        { value: "mainland", label: "Mainland China" },
        { value: "other", label: "Other (please specify)" },
      ],
    },
    {
      id: "grewUp",
      specifyKey: "grewUpSpecify",
      prompt: "Where did you grow up (until age 18)?",
      options: [
        { value: "mainland", label: "Mainland China" },
        { value: "other", label: "Other (please specify)" },
      ],
    },
    {
      id: "livesNow",
      specifyKey: "livesSpecify",
      prompt: "Where do you live now?",
      options: [
        { value: "mainland", label: "Mainland China" },
        { value: "us", label: "United States" },
        { value: "other", label: "Other (please specify)" },
      ],
    },
    {
      id: "yearsOutside",
      prompt: "In total, how long have you lived outside China?",
      options: [
        { value: "never", label: "Never" },
        { value: "lt1", label: "Less than 1 year" },
        { value: "1-3", label: "1–3 years" },
        { value: "4-10", label: "4–10 years" },
        { value: "gt10", label: "More than 10 years" },
      ],
    },
    {
      id: "firstLanguage",
      specifyKey: "languageSpecify",
      prompt: "What is your first language?",
      options: [
        { value: "mandarin", label: "Mandarin Chinese" },
        { value: "cantonese", label: "Cantonese" },
        { value: "other", label: "Other (please specify)" },
      ],
    },
    {
      id: "chineseWebUse",
      prompt: "How often do you use Chinese websites or apps (e.g., Taobao, Meituan, WeChat)?",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "rarely", label: "Rarely" },
        { value: "never", label: "Never" },
      ],
    },
    {
      id: "designExperience",
      prompt: "Do you have education or work experience in design (e.g., graphic, web or UX design)?",
      options: [
        { value: "none", label: "None" },
        { value: "some", label: "Some (courses or hobby)" },
        { value: "professional", label: "Professional" },
      ],
    },
  ],
  zh: [
    {
      id: "age",
      prompt: "您的年龄？",
      options: [
        { value: "18-24", label: "18–24 岁" },
        { value: "25-34", label: "25–34 岁" },
        { value: "35-44", label: "35–44 岁" },
        { value: "45-54", label: "45–54 岁" },
        { value: "55+", label: "55 岁及以上" },
      ],
    },
    {
      id: "gender",
      prompt: "您的性别？（可选）",
      optional: true,
      options: [
        { value: "woman", label: "女" },
        { value: "man", label: "男" },
        { value: "nonbinary", label: "非二元性别" },
        { value: "undisclosed", label: "不愿透露" },
      ],
    },
    {
      id: "born",
      specifyKey: "bornSpecify",
      prompt: "您出生在哪里？",
      options: [
        { value: "mainland", label: "中国大陆" },
        { value: "other", label: "其他（请注明）" },
      ],
    },
    {
      id: "grewUp",
      specifyKey: "grewUpSpecify",
      prompt: "您 18 岁之前主要在哪里长大？",
      options: [
        { value: "mainland", label: "中国大陆" },
        { value: "other", label: "其他（请注明）" },
      ],
    },
    {
      id: "livesNow",
      specifyKey: "livesSpecify",
      prompt: "您现在住在哪里？",
      options: [
        { value: "mainland", label: "中国大陆" },
        { value: "us", label: "美国" },
        { value: "other", label: "其他（请注明）" },
      ],
    },
    {
      id: "yearsOutside",
      prompt: "您在中国以外生活的时间总共有多久？",
      options: [
        { value: "never", label: "从未" },
        { value: "lt1", label: "不到 1 年" },
        { value: "1-3", label: "1–3 年" },
        { value: "4-10", label: "4–10 年" },
        { value: "gt10", label: "10 年以上" },
      ],
    },
    {
      id: "firstLanguage",
      specifyKey: "languageSpecify",
      prompt: "您的母语是什么？",
      options: [
        { value: "mandarin", label: "普通话" },
        { value: "cantonese", label: "粤语" },
        { value: "other", label: "其他（请注明）" },
      ],
    },
    {
      id: "chineseWebUse",
      prompt: "您多久使用一次中国的网站或应用（如淘宝、美团、微信）？",
      options: [
        { value: "daily", label: "每天" },
        { value: "weekly", label: "每周" },
        { value: "monthly", label: "每月" },
        { value: "rarely", label: "很少" },
        { value: "never", label: "从不" },
      ],
    },
    {
      id: "designExperience",
      prompt: "您是否有设计方面的学习或工作经验（如平面、网页或用户体验设计）？",
      options: [
        { value: "none", label: "没有" },
        { value: "some", label: "有一些（课程或爱好）" },
        { value: "professional", label: "专业" },
      ],
    },
  ],
} as const satisfies Record<Locale, BackgroundQuestion[]>;

export const backgroundQuestions = (locale: Locale): BackgroundQuestion[] =>
  questions[locale].map((question) => ({ ...question }));

const allowed = (question: BackgroundQuestion) => new Set(question.options.map((option) => option.value));

export const backgroundIsComplete = (locale: Locale, answers: BackgroundAnswers) =>
  backgroundQuestions(locale).every((question) => {
    const value = answers[question.id];
    if (!value) return Boolean(question.optional);
    if (!allowed(question).has(value)) return false;
    if (question.specifyKey && value === "other") return answers[question.specifyKey].trim().length > 0;
    return true;
  });

export const backgroundIsValid = (answers: BackgroundAnswers) => backgroundIsComplete("en", answers);
