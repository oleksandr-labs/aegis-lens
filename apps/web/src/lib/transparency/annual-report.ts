export type TransparencyReportSection =
  | "takedowns"
  | "gov-requests"
  | "ai-accuracy"
  | "source-coverage"
  | "retractions"
  | "reviewer-disagreements"
  | "abuse-misuse"
  | "locale-coverage";

export interface TransparencyReportConfig {
  year: number;
  publishQuarter: "Q1";
  sections: TransparencyReportSection[];
  locales: string[];
  formats: ("pdf" | "web")[];
  description_en: string;
  description_uk: string;
}

export const TRANSPARENCY_REPORT_TEMPLATE: TransparencyReportConfig = {
  year: new Date().getFullYear() - 1,
  publishQuarter: "Q1",
  sections: [
    "takedowns",
    "gov-requests",
    "ai-accuracy",
    "source-coverage",
    "retractions",
    "reviewer-disagreements",
    "abuse-misuse",
    "locale-coverage",
  ],
  locales: ["en", "uk", "de", "fr"],
  formats: ["pdf", "web"],
  description_en:
    "Annual public transparency report covering the prior calendar year. Published in Q1 in all supported locales. Covers platform actions, AI performance, government interactions, and coverage statistics.",
  description_uk:
    "Щорічний публічний звіт про прозорість, що охоплює попередній календарний рік. Публікується в Q1 у всіх підтримуваних локалях. Охоплює дії платформи, продуктивність AI, взаємодії з урядом та статистику охоплення.",
};

export const TRANSPARENCY_SECTIONS_EN: Record<
  TransparencyReportSection,
  { title: string; description: string }
> = {
  takedowns: {
    title: "Content Takedowns",
    description:
      "Aggregate count of content removed or restricted during the reporting year, broken down by category (legal obligation, policy violation, court order) and region. Includes number of appeals received and outcomes.",
  },
  "gov-requests": {
    title: "Government & Law Enforcement Requests",
    description:
      "All requests received from government bodies or law enforcement agencies, aggregated by country. Each entry records the request type, legal basis cited, outcome (complied in full, partially complied, rejected, challenged in court), and response time. Individual cases are not identified.",
  },
  "ai-accuracy": {
    title: "AI Output Accuracy Metrics",
    description:
      "Measured accuracy metrics for all AI-assisted features on the platform: classification precision/recall, geolocation confidence scores, entity resolution accuracy, and known systematic failure modes. Includes methodology for how accuracy is measured and who performs the evaluation.",
  },
  "source-coverage": {
    title: "Source Coverage Statistics",
    description:
      "Count and diversity breakdown of sources monitored by the platform: news outlets, social media platforms, government databases, satellite imagery providers, and other open-source repositories. Geographic and linguistic distribution of sources included.",
  },
  retractions: {
    title: "Retractions & Corrections",
    description:
      "Total number of published reports or analyses that were retracted or materially corrected during the reporting year. Each retraction includes the original claim, the correction, the reason for the error, and the process improvement implemented to prevent recurrence.",
  },
  "reviewer-disagreements": {
    title: "Reviewer Disagreement Rates",
    description:
      "Aggregate statistics on cases where two or more human reviewers disagreed on classification, severity, or recommended action. Broken down by content type and domain. High disagreement rates trigger methodology review and updated guidance.",
  },
  "abuse-misuse": {
    title: "Abuse & Misuse Cases",
    description:
      "Anonymized summary of confirmed cases where the platform was misused or abused: data scraping in violation of terms, doxxing attempts, coordinated inauthentic behavior, and API abuse. Includes actions taken and platform changes made in response.",
  },
  "locale-coverage": {
    title: "Per-Locale Coverage Statistics",
    description:
      "Coverage depth and source availability broken down by language and region. Highlights gaps where source coverage is thin, languages underrepresented in AI models, and regions where verification capacity is limited. Includes planned investments to close identified gaps.",
  },
};

export const TRANSPARENCY_SECTIONS_UK: Record<
  TransparencyReportSection,
  { title: string; description: string }
> = {
  takedowns: {
    title: "Видалення контенту",
    description:
      "Сукупна кількість контенту, видаленого або обмеженого протягом звітного року, з розбивкою за категорією (юридичне зобов'язання, порушення політики, судовий наказ) та регіоном. Включає кількість отриманих апеляцій та їх результати.",
  },
  "gov-requests": {
    title: "Запити від уряду та правоохоронних органів",
    description:
      "Усі запити, отримані від державних органів або правоохоронних органів, агреговані за країною. Кожен запис фіксує тип запиту, посилання на правову підставу, результат (виконано повністю, виконано частково, відхилено, оскаржено в суді) та час відповіді. Окремі справи не ідентифікуються.",
  },
  "ai-accuracy": {
    title: "Метрики точності виводу ШІ",
    description:
      "Виміряні метрики точності для всіх функцій на платформі з підтримкою ШІ: точність/повнота класифікації, оцінки достовірності геолокації, точність розпізнавання сутностей та відомі систематичні режими збоїв. Включає методологію вимірювання точності та хто проводить оцінку.",
  },
  "source-coverage": {
    title: "Статистика охоплення джерел",
    description:
      "Кількість та розподіл за різноманітністю джерел, що моніторяться платформою: новинні видання, платформи соціальних мереж, урядові бази даних, постачальники супутникових знімків та інші репозиторії відкритих джерел. Включено географічний та мовний розподіл джерел.",
  },
  retractions: {
    title: "Спростування та виправлення",
    description:
      "Загальна кількість опублікованих звітів або аналізів, які були відкликані або суттєво виправлені протягом звітного року. Кожне спростування включає оригінальне твердження, виправлення, причину помилки та вдосконалення процесу, впроваджене для запобігання повторенню.",
  },
  "reviewer-disagreements": {
    title: "Показники розбіжностей між рецензентами",
    description:
      "Сукупна статистика випадків, коли два або більше людських рецензентів не погоджувалися щодо класифікації, серйозності або рекомендованих дій. З розбивкою за типом контенту та доменом. Високі показники розбіжностей ініціюють методологічний огляд та оновлені настанови.",
  },
  "abuse-misuse": {
    title: "Випадки зловживань та неналежного використання",
    description:
      "Анонімізований опис підтверджених випадків, коли платформа використовувалася неналежно або зловживалася: витік даних на порушення умов, спроби доксингу, скоординована неавтентична поведінка та зловживання API. Включає вжиті заходи та зміни платформи у відповідь.",
  },
  "locale-coverage": {
    title: "Статистика охоплення за локалями",
    description:
      "Глибина охоплення та доступність джерел з розбивкою за мовою та регіоном. Висвітлює прогалини, де охоплення джерел недостатнє, мови, недостатньо представлені в AI-моделях, та регіони, де можливості верифікації обмежені. Включає заплановані інвестиції для усунення виявлених прогалин.",
  },
};

export const TRANSPARENCY_MOAT_EN =
  "Few competitors publish transparency reports. We will, every year. It is a defensible trust moat.";

export const TRANSPARENCY_MOAT_UK =
  "Мало конкурентів публікують звіти про прозорість. Ми будемо — щороку. Це захищена перевага довіри.";

export const GOVERNMENT_REQUEST_HANDLING_EN =
  "All law enforcement requests are logged by country, outcome (complied / rejected / challenged). Aggregate published annually.";

export const GOVERNMENT_REQUEST_HANDLING_UK =
  "Усі запити правоохоронців фіксуються за країною та результатом. Агреговані дані публікуються щорічно.";

export const AI_ACCURACY_DISCLOSURE_EN =
  "AI output accuracy metrics and known failure modes published annually. No AI hallucination is papered over.";

export const AI_ACCURACY_DISCLOSURE_UK =
  "Метрики точності ШІ та відомі режими збоїв публікуються щорічно. Жоден галюцинат ШІ не замовчується.";
