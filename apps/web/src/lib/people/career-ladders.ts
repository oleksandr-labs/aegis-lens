import type { CareerLadder, Discipline } from "./types";

export const CALIBRATION_COMMITTEE_EN =
  "Cross-discipline calibration committee meets quarterly to ensure consistent leveling across all career ladders.";

export const CALIBRATION_COMMITTEE_UK =
  "Міждисциплінарний калібрувальний комітет збирається щоквартально для забезпечення однаковості рівнів.";

export const CAREER_LADDERS: CareerLadder[] = [
  {
    discipline: "engineering",
    managementSplit: true,
    managementTrackStart: "l4",
    description_en:
      "Software engineering track covering individual contributor path from junior engineer through distinguished engineer, with a management fork at Staff level (L4). Both tracks are fully compensated and respected.",
    description_uk:
      "Трек програмної інженерії охоплює шлях індивідуального учасника від молодшого інженера до видатного інженера, з розгалуженням на менеджмент на рівні Staff (L4). Обидва треки повністю компенсуються та поважаються.",
    levels: [
      {
        id: "l1",
        title_en: "Junior Engineer",
        title_uk: "Молодший інженер",
        scope_en:
          "Works on well-defined, scoped tasks within a single service or component. Requires regular guidance and review from senior colleagues.",
        scope_uk:
          "Працює над чітко визначеними завданнями в рамках одного сервісу або компонента. Потребує регулярного керівництва та огляду від старших колег.",
        impact_en:
          "Delivers assigned tasks reliably and on time. Learns to estimate accurately and communicate blockers early.",
        impact_uk:
          "Надійно і вчасно виконує доручені завдання. Вчиться точно оцінювати та завчасно повідомляти про блокери.",
        leadership_en:
          "Contributes positively to team rituals. Asks clarifying questions rather than making assumptions.",
        leadership_uk:
          "Позитивно бере участь у командних ритуалах. Задає уточнювальні питання, а не робить припущення.",
        craft_en:
          "Writes clean, readable code in the team's primary language. Learns testing practices and applies them to own work.",
        craft_uk:
          "Пише чистий, читабельний код основною мовою команди. Вивчає практики тестування і застосовує їх у власній роботі.",
        typicalYearsExperience: 0,
      },
      {
        id: "l2",
        title_en: "Engineer",
        title_uk: "Інженер",
        scope_en:
          "Owns small features end-to-end within a single service. Handles moderately ambiguous requirements with some guidance.",
        scope_uk:
          "Відповідає за невеликі функції від початку до кінця в межах одного сервісу. Справляється з помірно неоднозначними вимогами за деякого керівництва.",
        impact_en:
          "Ships features with measurable user or system impact. Proactively identifies edge cases and technical risks before they become incidents.",
        impact_uk:
          "Поставляє функції з вимірюваним впливом на користувачів або систему. Проактивно виявляє крайні випадки та технічні ризики до того, як вони стають інцидентами.",
        leadership_en:
          "Participates in code reviews constructively. Onboards new team members to specific areas of the codebase.",
        leadership_uk:
          "Конструктивно бере участь у код-рев'ю. Вводить нових членів команди до конкретних частин кодової бази.",
        craft_en:
          "Writes well-tested, documented code. Understands the team's architecture and can reason about trade-offs at the feature level.",
        craft_uk:
          "Пише добре протестований, задокументований код. Розуміє архітектуру команди і може міркувати про компроміси на рівні функцій.",
        typicalYearsExperience: 2,
      },
      {
        id: "l3",
        title_en: "Senior Engineer",
        title_uk: "Старший інженер",
        scope_en:
          "Owns complex features or entire subsystems. Drives technical decisions for their team's domain with confidence.",
        scope_uk:
          "Відповідає за складні функції або цілі підсистеми. Впевнено приймає технічні рішення для домену своєї команди.",
        impact_en:
          "Multiplies team output by resolving ambiguity, unblocking others, and delivering consistently high-quality work at pace.",
        impact_uk:
          "Примножує результат команди, вирішуючи невизначеність, розблоковуючи інших і стабільно виконуючи якісну роботу в темпі.",
        leadership_en:
          "Actively mentors L1–L2 engineers. Leads team retrospectives and drives improvements to team processes.",
        leadership_uk:
          "Активно наставляє інженерів L1–L2. Веде командні ретроспективи та впроваджує покращення командних процесів.",
        craft_en:
          "Designs robust, maintainable systems. Identifies and pays down technical debt proactively. Champions testing and observability standards.",
        craft_uk:
          "Проектує надійні, підтримувані системи. Проактивно виявляє та погашає технічний борг. Відстоює стандарти тестування та спостережуваності.",
        typicalYearsExperience: 5,
      },
      {
        id: "l4",
        title_en: "Staff Engineer",
        title_uk: "Старший штатний інженер",
        scope_en:
          "Operates across multiple teams. Defines technical strategy for a product area and ensures alignment across engineering squads.",
        scope_uk:
          "Працює в кількох командах. Визначає технічну стратегію для продуктового напрямку та забезпечує узгодженість між інженерними групами.",
        impact_en:
          "Drives technical decisions that reduce systemic risk, improve reliability, or unlock significant velocity improvements across teams.",
        impact_uk:
          "Приймає технічні рішення, що знижують системний ризик, підвищують надійність або розблоковують значне підвищення швидкості між командами.",
        leadership_en:
          "Sponsors and grows L2–L3 engineers. Leads cross-team technical reviews. At this level, management track (Engineering Manager) becomes available.",
        leadership_uk:
          "Підтримує та розвиває інженерів L2–L3. Веде міжкомандні технічні огляди. На цьому рівні стає доступним трек менеджменту (Engineering Manager).",
        craft_en:
          "Architects systems that scale across teams and time. Produces design docs that become org-wide reference material.",
        craft_uk:
          "Проектує системи, що масштабуються між командами та в часі. Створює проектні документи, які стають загальноорганізаційними довідковими матеріалами.",
        typicalYearsExperience: 8,
      },
      {
        id: "l5",
        title_en: "Principal Engineer",
        title_uk: "Головний інженер",
        scope_en:
          "Org-wide scope. Sets technical direction that aligns with multi-year product and company strategy.",
        scope_uk:
          "Масштаб всієї організації. Встановлює технічний напрямок, що узгоджується з багаторічною продуктовою та корпоративною стратегією.",
        impact_en:
          "Initiates and leads initiatives that improve engineering quality, velocity, or capabilities org-wide. Measurable multi-quarter impact.",
        impact_uk:
          "Ініціює та веде ініціативи, що покращують якість, швидкість або можливості інженерії в масштабах організації. Вимірюваний вплив протягом кількох кварталів.",
        leadership_en:
          "Influential across the entire engineering organization. Creates leverage through documentation, tooling, and cultural shaping.",
        leadership_uk:
          "Впливовий у всій інженерній організації. Створює важелі через документацію, інструментарій та формування культури.",
        craft_en:
          "Recognized expert in multiple technical domains. Evaluates and adopts new technologies at the org level with rigorous cost-benefit analysis.",
        craft_uk:
          "Визнаний експерт у кількох технічних доменах. Оцінює та впроваджує нові технології на рівні організації з ретельним аналізом витрат і вигод.",
        typicalYearsExperience: 12,
      },
      {
        id: "distinguished",
        title_en: "Distinguished Engineer",
        title_uk: "Видатний інженер",
        scope_en:
          "Industry-level scope. Represents the organization externally and shapes the external technical discourse in relevant domains.",
        scope_uk:
          "Галузевий масштаб. Представляє організацію зовні та формує зовнішній технічний дискурс у відповідних доменах.",
        impact_en:
          "Work has measurable industry impact: open-source projects with wide adoption, influential publications, or standards contributions.",
        impact_uk:
          "Робота має вимірюваний галузевий вплив: проекти з відкритим вихідним кодом із широким впровадженням, впливові публікації або внески в стандарти.",
        leadership_en:
          "Defines what engineering excellence looks like for the entire organization and for the industry. Attracts top talent by association.",
        leadership_uk:
          "Визначає, як виглядає інженерна досконалість для всієї організації та галузі. Приваблює найкращі таланти своєю причетністю.",
        craft_en:
          "Invented or significantly advanced techniques used widely beyond this organization. Peers are other Distinguished Engineers and industry leaders.",
        craft_uk:
          "Винайшов або суттєво просунув методи, що широко використовуються за межами цієї організації. Рівні — інші видатні інженери та галузеві лідери.",
        typicalYearsExperience: 18,
      },
    ],
  },
  {
    discipline: "design",
    managementSplit: true,
    managementTrackStart: "l4",
    description_en:
      "Product design track covering UX, UI, and design systems from junior through principal. Management fork at Lead Designer (L4) into Design Manager track.",
    description_uk:
      "Трек продуктового дизайну охоплює UX, UI та дизайн-системи від молодшого до головного дизайнера. Розгалуження на менеджмент на рівні Lead Designer (L4) до треку Design Manager.",
    levels: [
      {
        id: "l1",
        title_en: "Junior Designer",
        title_uk: "Молодший дизайнер",
        scope_en:
          "Executes well-defined design tasks: UI screens, icons, and small interaction patterns under close guidance.",
        scope_uk:
          "Виконує чітко визначені дизайн-завдання: UI-екрани, іконки та невеликі шаблони взаємодії під тісним керівництвом.",
        impact_en:
          "Delivers polished assets on time. Rapidly incorporates feedback without defensiveness.",
        impact_uk:
          "Вчасно поставляє відполіровані ресурси. Швидко враховує відгуки без захисної реакції.",
        leadership_en:
          "Participates in design critiques. Documents their own design decisions clearly.",
        leadership_uk:
          "Бере участь у дизайн-критиках. Чітко документує власні дизайн-рішення.",
        craft_en:
          "Proficient in Figma. Applies established design system components consistently and flags inconsistencies.",
        craft_uk:
          "Володіє Figma. Послідовно застосовує встановлені компоненти дизайн-системи та позначає невідповідності.",
        typicalYearsExperience: 0,
      },
      {
        id: "l2",
        title_en: "Designer",
        title_uk: "Дизайнер",
        scope_en:
          "Owns design for a feature from discovery through delivery. Conducts user research independently for scoped problems.",
        scope_uk:
          "Відповідає за дизайн функції від виявлення до поставки. Самостійно проводить дослідження користувачів для обмежених завдань.",
        impact_en:
          "Designs experiences that measurably improve user task completion or satisfaction metrics.",
        impact_uk:
          "Проектує досвід, що вимірювано покращує виконання завдань користувачем або метрики задоволеності.",
        leadership_en:
          "Facilitates design reviews. Collaborates cross-functionally with engineering and product.",
        leadership_uk:
          "Проводить дизайн-огляди. Співпрацює між функціональними підрозділами з інженерією та продуктом.",
        craft_en:
          "Creates high-fidelity prototypes. Contributes new components to the design system with proper documentation.",
        craft_uk:
          "Створює прототипи високої точності. Додає нові компоненти до дизайн-системи з належною документацією.",
        typicalYearsExperience: 2,
      },
      {
        id: "l3",
        title_en: "Senior Designer",
        title_uk: "Старший дизайнер",
        scope_en:
          "Leads design for a product area or multiple interrelated features. Defines the design vision for complex, multi-team projects.",
        scope_uk:
          "Очолює дизайн для продуктового напрямку або кількох взаємопов'язаних функцій. Визначає дизайн-бачення для складних, багатокомандних проектів.",
        impact_en:
          "Elevates the craft bar across the team through critique leadership and design system stewardship.",
        impact_uk:
          "Підвищує планку майстерності в команді через керівництво критикою та управління дизайн-системою.",
        leadership_en:
          "Mentors junior designers. Drives alignment between design, product, and engineering on complex trade-offs.",
        leadership_uk:
          "Наставляє молодших дизайнерів. Забезпечує узгодженість між дизайном, продуктом та інженерією у складних компромісах.",
        craft_en:
          "Expert in information architecture, interaction design, and accessibility. Runs usability studies and synthesizes findings into actionable design iterations.",
        craft_uk:
          "Експерт з інформаційної архітектури, дизайну взаємодії та доступності. Проводить дослідження юзабіліті та синтезує висновки в дієві дизайн-ітерації.",
        typicalYearsExperience: 5,
      },
      {
        id: "l4",
        title_en: "Lead Designer",
        title_uk: "Провідний дизайнер",
        scope_en:
          "Sets design direction across multiple product areas. Owns the design system strategy and cross-functional design quality bar.",
        scope_uk:
          "Встановлює дизайн-напрямок для кількох продуктових напрямків. Відповідає за стратегію дизайн-системи та міжфункціональну планку якості дизайну.",
        impact_en:
          "Design decisions shape product perception, retention, and brand cohesion at a company-wide level.",
        impact_uk:
          "Дизайн-рішення формують сприйняття продукту, утримання та цілісність бренду на рівні всієї компанії.",
        leadership_en:
          "Leads a design guild or team. At this level, Design Manager track becomes available as an alternative path.",
        leadership_uk:
          "Керує дизайн-гільдією або командою. На цьому рівні трек Design Manager стає доступним як альтернативний шлях.",
        craft_en:
          "Defines design principles and quality standards. Produces frameworks adopted by the entire design organization.",
        craft_uk:
          "Визначає дизайн-принципи та стандарти якості. Виробляє фреймворки, прийняті всією дизайн-організацією.",
        typicalYearsExperience: 8,
      },
      {
        id: "principal",
        title_en: "Principal Designer",
        title_uk: "Головний дизайнер",
        scope_en:
          "Org-wide design leadership. Shapes product design strategy in partnership with C-suite and drives design as a competitive differentiator.",
        scope_uk:
          "Дизайн-лідерство в масштабах організації. Формує стратегію продуктового дизайну у партнерстві з C-suite та просуває дизайн як конкурентний диференціатор.",
        impact_en:
          "Work is externally recognized: conference keynotes, published design systems, or widely-cited UX research.",
        impact_uk:
          "Робота визнана зовні: keynote на конференціях, опубліковані дизайн-системи або широко цитовані UX-дослідження.",
        leadership_en:
          "Defines the design culture and career framework. Attracts senior design talent and builds the design brand externally.",
        leadership_uk:
          "Визначає дизайн-культуру та кар'єрний фреймворк. Приваблює старших дизайн-таланти та будує дизайн-бренд зовні.",
        craft_en:
          "Industry expert in design methodology, accessibility, and emerging interaction paradigms. Publishes or speaks about design practice.",
        craft_uk:
          "Галузевий експерт з методології дизайну, доступності та нових парадигм взаємодії. Публікує або виступає про практику дизайну.",
        typicalYearsExperience: 12,
      },
    ],
  },
  {
    discipline: "product",
    managementSplit: true,
    managementTrackStart: "l4",
    description_en:
      "Product management track from Associate PM through VP of Product. Management split at Group PM (L4) where ICs may choose a people-management or staff IC path.",
    description_uk:
      "Трек продуктового менеджменту від Associate PM до VP Product. Розгалуження на менеджмент на рівні Group PM (L4), де IC можуть обрати шлях управління людьми або штатний IC-шлях.",
    levels: [
      {
        id: "l1",
        title_en: "Associate PM",
        title_uk: "Асоційований менеджер продукту",
        scope_en:
          "Assists senior PMs on a defined feature or problem space. Writes PRDs with guidance and tracks delivery milestones.",
        scope_uk:
          "Допомагає старшим PM у визначеній функції або проблемному просторі. Пише PRD під керівництвом і відстежує віхи поставки.",
        impact_en:
          "Keeps features on track. Flags risks early. Builds relationships with engineering and design counterparts.",
        impact_uk:
          "Тримає функції в графіку. Завчасно сигналізує про ризики. Будує відносини з інженерними та дизайн-колегами.",
        leadership_en:
          "Participates actively in sprint ceremonies. Synthesizes customer feedback and presents it clearly to the team.",
        leadership_uk:
          "Активно бере участь у спринт-церемоніях. Синтезує відгуки клієнтів і чітко представляє їх команді.",
        craft_en:
          "Writes clear, testable acceptance criteria. Learns to use analytics tools to validate assumptions post-launch.",
        craft_uk:
          "Пише чіткі, перевірювані критерії прийняття. Вчиться використовувати інструменти аналітики для перевірки припущень після запуску.",
        typicalYearsExperience: 0,
      },
      {
        id: "l2",
        title_en: "Product Manager",
        title_uk: "Менеджер продукту",
        scope_en:
          "Owns a feature area end-to-end: discovery, definition, delivery, and iteration. Manages relationship with one engineering team.",
        scope_uk:
          "Відповідає за область функцій від початку до кінця: виявлення, визначення, поставка та ітерація. Управляє відносинами з однією інженерною командою.",
        impact_en:
          "Ships features that move product KPIs. Makes data-informed prioritization decisions independently.",
        impact_uk:
          "Поставляє функції, що переміщують KPI продукту. Самостійно приймає рішення про пріоритизацію на основі даних.",
        leadership_en:
          "Drives squad rituals effectively. Negotiates trade-offs between scope, quality, and timeline without escalation.",
        leadership_uk:
          "Ефективно веде ритуали загону. Веде переговори щодо компромісів між обсягом, якістю та часовими рамками без ескалації.",
        craft_en:
          "Writes compelling, concise PRDs. Runs structured customer interviews. Builds and validates product hypotheses through experiments.",
        craft_uk:
          "Пише переконливі, стислі PRD. Проводить структуровані інтерв'ю з клієнтами. Будує та перевіряє продуктові гіпотези через експерименти.",
        typicalYearsExperience: 2,
      },
      {
        id: "l3",
        title_en: "Senior PM",
        title_uk: "Старший менеджер продукту",
        scope_en:
          "Owns a significant product area or multiple teams. Drives 6-12 month roadmap with clear strategy and measurable outcomes.",
        scope_uk:
          "Відповідає за значний продуктовий напрямок або кілька команд. Веде дорожню карту на 6-12 місяців із чіткою стратегією та вимірюваними результатами.",
        impact_en:
          "Decisions materially affect revenue, retention, or market positioning. Acts as the voice of the customer in leadership discussions.",
        impact_uk:
          "Рішення суттєво впливають на дохід, утримання або ринкове позиціонування. Виступає голосом клієнта в лідерських дискусіях.",
        leadership_en:
          "Mentors junior PMs. Represents product in cross-functional leadership forums. Influences engineering and design roadmaps.",
        leadership_uk:
          "Наставляє молодших PM. Представляє продукт на міжфункціональних лідерських форумах. Впливає на дорожні карти інженерії та дизайну.",
        craft_en:
          "Expert in Jobs-to-be-Done, OKR frameworks, and quantitative analytics. Writes strategy documents that earn executive buy-in.",
        craft_uk:
          "Експерт з Jobs-to-be-Done, OKR-фреймворків та кількісної аналітики. Пише стратегічні документи, що отримують підтримку керівництва.",
        typicalYearsExperience: 5,
      },
      {
        id: "l4",
        title_en: "Group PM",
        title_uk: "Груповий менеджер продукту",
        scope_en:
          "Owns a product line or business unit. Sets vision and strategy for a cluster of related product areas across multiple teams.",
        scope_uk:
          "Відповідає за продуктову лінію або бізнес-підрозділ. Встановлює бачення та стратегію для кластера пов'язаних продуктових напрямків між кількома командами.",
        impact_en:
          "Decisions shape company-level metrics. Defines what success looks like for an entire product domain.",
        impact_uk:
          "Рішення формують метрики на рівні компанії. Визначає, як виглядає успіх для цілого продуктового домену.",
        leadership_en:
          "Manages or mentors PM team. At this level, people-management path (Director of Product) and staff IC path both open up.",
        leadership_uk:
          "Управляє командою PM або є їх ментором. На цьому рівні відкриваються шляхи управління людьми (Director of Product) та штатний IC.",
        craft_en:
          "Deeply understands market dynamics, competitive landscape, and business model. Drives company-level trade-off decisions.",
        craft_uk:
          "Глибоко розуміє ринкову динаміку, конкурентне середовище та бізнес-модель. Веде рішення щодо компромісів на рівні компанії.",
        typicalYearsExperience: 8,
      },
      {
        id: "l5",
        title_en: "Director of Product",
        title_uk: "Директор продукту",
        scope_en:
          "Leads the product organization for a major business area. Shapes hiring, culture, and process for the PM function.",
        scope_uk:
          "Керує продуктовою організацією для великого бізнес-напрямку. Формує найм, культуру та процес для PM-функції.",
        impact_en:
          "Product strategy drives company-level OKRs. Allocates product investment across competing priorities with board-level visibility.",
        impact_uk:
          "Продуктова стратегія керує OKR на рівні компанії. Розподіляє продуктові інвестиції між конкуруючими пріоритетами з видимістю на рівні ради директорів.",
        leadership_en:
          "Builds and retains a high-performing PM team. Represents product at C-suite and investor level.",
        leadership_uk:
          "Будує та утримує високоефективну команду PM. Представляє продукт на рівні C-suite та інвесторів.",
        craft_en:
          "Recognized product leader internally and often externally. Shapes the product methodology and culture across the organization.",
        craft_uk:
          "Визнаний продуктовий лідер внутрішньо і часто зовнішньо. Формує продуктову методологію та культуру в організації.",
        typicalYearsExperience: 12,
      },
      {
        id: "l6",
        title_en: "VP of Product",
        title_uk: "Віцепрезидент з продукту",
        scope_en:
          "Owns the entire product portfolio. Sets multi-year product vision in partnership with CEO. Accountable for product revenue and growth.",
        scope_uk:
          "Відповідає за весь продуктовий портфель. Встановлює багаторічне продуктове бачення у партнерстві з CEO. Відповідальний за продуктовий дохід та зростання.",
        impact_en:
          "Shapes the company's market position and product differentiation strategy at the board and investor level.",
        impact_uk:
          "Формує ринкову позицію компанії та стратегію продуктової диференціації на рівні ради та інвесторів.",
        leadership_en:
          "Builds org-wide product culture. Attracts principal-level PM talent. Represents the product to press and analysts.",
        leadership_uk:
          "Будує продуктову культуру в масштабах організації. Приваблює PM-таланти рівня principal. Представляє продукт пресі та аналітикам.",
        craft_en:
          "Defines the product operating model for the company. Industry-recognized product leader with demonstrated track record of building category-defining products.",
        craft_uk:
          "Визначає операційну модель продукту для компанії. Визнаний галузевий продуктовий лідер з підтвердженим досвідом створення продуктів, що визначають категорії.",
        typicalYearsExperience: 15,
      },
    ],
  },
  {
    discipline: "ai-ml",
    managementSplit: false,
    description_en:
      "AI/ML research and engineering track. Unique dual focus on research rigor (publishing, benchmarking, novel methods) and production impact (deployed models, measurable system improvements).",
    description_uk:
      "Трек досліджень і розробки AI/ML. Унікальний подвійний фокус на дослідницькій суворості (публікації, бенчмаркінг, нові методи) та виробничому впливі (розгорнуті моделі, вимірювані покращення системи).",
    levels: [
      {
        id: "l1",
        title_en: "Research Associate",
        title_uk: "Науковий асоційований",
        scope_en:
          "Implements and evaluates existing ML models and baselines under supervision. Runs experiments and documents results carefully.",
        scope_uk:
          "Реалізовує та оцінює існуючі моделі ML та базові лінії під наглядом. Ретельно проводить експерименти та документує результати.",
        impact_en:
          "Produces reliable experiment results and clean ablation reports that inform team decisions.",
        impact_uk:
          "Виробляє надійні результати експериментів та чисті абляційні звіти, що інформують рішення команди.",
        leadership_en:
          "Presents experiment results in team meetings. Contributes to internal research notes and shared notebooks.",
        leadership_uk:
          "Представляє результати експериментів на командних зустрічах. Вносить вклад у внутрішні дослідницькі нотатки та спільні ноутбуки.",
        craft_en:
          "Proficient in Python, PyTorch or JAX, and standard ML tooling. Can reproduce published results reliably.",
        craft_uk:
          "Володіє Python, PyTorch або JAX та стандартним ML-інструментарієм. Може надійно відтворювати опубліковані результати.",
        typicalYearsExperience: 0,
      },
      {
        id: "l2",
        title_en: "ML Engineer",
        title_uk: "Інженер машинного навчання",
        scope_en:
          "Trains, evaluates, and deploys ML models for production systems. Manages the full ML lifecycle for assigned components.",
        scope_uk:
          "Навчає, оцінює та розгортає моделі ML для виробничих систем. Управляє повним ML-lifecycle для призначених компонентів.",
        impact_en:
          "Ships models that improve measurable product metrics: classification accuracy, latency, false-positive rates.",
        impact_uk:
          "Поставляє моделі, що покращують вимірювані метрики продукту: точність класифікації, затримку, частоту хибнопозитивних результатів.",
        leadership_en:
          "Documents training pipelines and evaluation methodology thoroughly. Helps onboard new research associates.",
        leadership_uk:
          "Ретельно документує навчальні конвеєри та методологію оцінки. Допомагає ввести нових наукових асоційованих.",
        craft_en:
          "Builds robust training, evaluation, and serving infrastructure. Expert in experiment tracking, dataset management, and model versioning.",
        craft_uk:
          "Будує надійну інфраструктуру навчання, оцінки та обслуговування. Експерт у відстеженні експериментів, управлінні наборами даних і версіонуванні моделей.",
        typicalYearsExperience: 2,
      },
      {
        id: "l3",
        title_en: "Senior ML Engineer",
        title_uk: "Старший інженер машинного навчання",
        scope_en:
          "Leads a research-to-production pipeline for a core AI capability. Defines evaluation methodology and success criteria.",
        scope_uk:
          "Веде конвеєр від досліджень до виробництва для основної AI-можливості. Визначає методологію оцінки та критерії успіху.",
        impact_en:
          "Drives meaningful improvements in model performance that have direct product impact. Identifies and mitigates failure modes proactively.",
        impact_uk:
          "Забезпечує значні покращення продуктивності моделі з прямим продуктовим впливом. Проактивно виявляє та пом'якшує режими збоїв.",
        leadership_en:
          "Mentors L1–L2 researchers and engineers. Collaborates with product and engineering on ML integration design.",
        leadership_uk:
          "Наставляє дослідників і інженерів L1–L2. Співпрацює з продуктом та інженерією у проектуванні ML-інтеграції.",
        craft_en:
          "Deep expertise in at least two ML sub-domains (e.g., NLP, computer vision, anomaly detection). Contributes to research literature or open-source tooling.",
        craft_uk:
          "Глибока експертиза принаймні в двох піддоменах ML (наприклад, NLP, комп'ютерний зір, виявлення аномалій). Вносить внесок у дослідницьку літературу або інструментарій з відкритим вихідним кодом.",
        typicalYearsExperience: 5,
      },
      {
        id: "l4",
        title_en: "Staff ML Researcher",
        title_uk: "Штатний дослідник машинного навчання",
        scope_en:
          "Defines the AI/ML research agenda for a product domain. Evaluates novel methods and determines which merit engineering investment.",
        scope_uk:
          "Визначає дослідницьку програму AI/ML для продуктового домену. Оцінює нові методи та визначає, які заслуговують інженерних інвестицій.",
        impact_en:
          "Research results translate directly into product capabilities or published work cited by external practitioners.",
        impact_uk:
          "Результати досліджень безпосередньо переходять у продуктові можливості або опубліковані роботи, цитовані зовнішніми практиками.",
        leadership_en:
          "Shapes the research culture and standards of the AI team. Recruits and evaluates ML talent. Represents AI research externally.",
        leadership_uk:
          "Формує дослідницьку культуру та стандарти AI-команди. Залучає та оцінює ML-таланти. Представляє AI-дослідження зовні.",
        craft_en:
          "Peer-reviewed publications or equivalent research artifacts. Expert in research methodology, statistical rigor, and frontier model techniques.",
        craft_uk:
          "Рецензовані публікації або еквівалентні дослідницькі артефакти. Експерт з методології досліджень, статистичної суворості та технік фронтирних моделей.",
        typicalYearsExperience: 8,
      },
      {
        id: "l5",
        title_en: "Principal ML Researcher",
        title_uk: "Головний дослідник машинного навчання",
        scope_en:
          "Sets multi-year AI research direction for the organization. Identifies which ML bets the company should make and builds the team to execute them.",
        scope_uk:
          "Встановлює багаторічний напрямок AI-досліджень для організації. Визначає, на які ML-ставки компанія повинна зробити та будує команду для їх реалізації.",
        impact_en:
          "Research output shapes the company's AI product differentiation and is recognized externally as meaningful contributions to the field.",
        impact_uk:
          "Результати досліджень формують AI-продуктову диференціацію компанії та визнаються зовні як значущий внесок у галузь.",
        leadership_en:
          "Recognized thought leader in AI/ML community. Keynote speaker or program committee member at top venues (NeurIPS, ICML, ACL, ICCV).",
        leadership_uk:
          "Визнаний лідер думки в спільноті AI/ML. Keynote-спікер або член програмного комітету на провідних майданчиках (NeurIPS, ICML, ACL, ICCV).",
        craft_en:
          "Invented techniques or architectures with broad adoption. Authors papers with 100+ citations. Shapes org-wide ML standards and safety practices.",
        craft_uk:
          "Винайшов техніки або архітектури з широким впровадженням. Автор статей з 100+ цитуваннями. Формує ML-стандарти та практики безпеки в масштабах організації.",
        typicalYearsExperience: 12,
      },
      {
        id: "distinguished",
        title_en: "Distinguished Researcher",
        title_uk: "Видатний дослідник",
        scope_en:
          "Industry-recognized authority. Research defines or significantly advances the state-of-the-art in domains critical to the company's mission.",
        scope_uk:
          "Визнаний галузевий авторитет. Дослідження визначає або суттєво просуває стан мистецтва в доменах, критичних для місії компанії.",
        impact_en:
          "Work cited across the field. Active in AI policy or ethics discussions at national or international level.",
        impact_uk:
          "Робота цитується по всій галузі. Активний в обговореннях AI-політики або етики на національному або міжнародному рівні.",
        leadership_en:
          "Defines the research agenda and ethics standards for the entire AI organization. Attracts world-class research talent by reputation.",
        leadership_uk:
          "Визначає дослідницьку програму та стандарти етики для всієї AI-організації. Приваблює дослідницькі таланти світового класу своєю репутацією.",
        craft_en:
          "Seminal publications. Inventor of techniques in widespread production use across industry. Peer of other Distinguished Researchers globally.",
        craft_uk:
          "Фундаментальні публікації. Винахідник технік, що широко використовуються у виробництві по всій галузі. Рівень інших видатних дослідників у світі.",
        typicalYearsExperience: 18,
      },
    ],
  },
  {
    discipline: "osint-analyst",
    managementSplit: false,
    description_en:
      "OSINT analyst track specific to the Aegis Lens platform. Combines domain expertise (conflict, geopolitics, disinformation) with technical OSINT tradecraft. No management split — senior analysts remain individual contributors with high autonomy.",
    description_uk:
      "Трек аналітика OSINT специфічний для платформи Aegis Lens. Поєднує доменну експертизу (конфлікти, геополітика, дезінформація) з технічними OSINT-навичками. Без розгалуження на менеджмент — старші аналітики залишаються індивідуальними учасниками з високою автономією.",
    levels: [
      {
        id: "l1",
        title_en: "Junior Analyst",
        title_uk: "Молодший аналітик",
        scope_en:
          "Conducts structured open-source research on assigned topics. Uses established methodologies and documented search frameworks.",
        scope_uk:
          "Проводить структуровані дослідження відкритих джерел за призначеними темами. Використовує встановлені методології та задокументовані фреймворки пошуку.",
        impact_en:
          "Produces accurate, well-sourced research briefs that feed into senior analyst reports. Zero tolerance for unsourced claims.",
        impact_uk:
          "Виробляє точні, добре підкріплені дослідницькі брифи, що доповнюють звіти старших аналітиків. Нульова толерантність до непідкріплених тверджень.",
        leadership_en:
          "Follows source verification protocols rigorously. Documents methodology for each investigation so it can be peer-reviewed.",
        leadership_uk:
          "Суворо дотримується протоколів верифікації джерел. Документує методологію кожного розслідування для рецензування.",
        craft_en:
          "Proficient in Google dorking, social media OSINT, reverse image search, and basic geolocation techniques.",
        craft_uk:
          "Володіє Google dorking, OSINT у соціальних мережах, зворотним пошуком зображень та базовими техніками геолокації.",
        typicalYearsExperience: 0,
      },
      {
        id: "l2",
        title_en: "Analyst",
        title_uk: "Аналітик",
        scope_en:
          "Independently leads investigations on scoped topics. Selects and applies appropriate OSINT methodologies for the investigation type.",
        scope_uk:
          "Самостійно веде розслідування за обмеженими темами. Вибирає та застосовує відповідні OSINT-методології для типу розслідування.",
        impact_en:
          "Investigations result in publishable, citation-ready reports. Identifies patterns across multiple sources that reveal non-obvious insights.",
        impact_uk:
          "Розслідування призводять до публікаційних, готових до цитування звітів. Виявляє закономірності в кількох джерелах, що розкривають неочевидні інсайти.",
        leadership_en:
          "Peer-reviews junior analyst work. Shares tradecraft knowledge through internal knowledge base contributions.",
        leadership_uk:
          "Рецензує роботу молодших аналітиків. Ділиться знаннями про методи роботи через внески у внутрішню базу знань.",
        craft_en:
          "Expert in satellite imagery analysis, network mapping, entity resolution, and temporal correlation. Proficient in at least one scripting language for data collection automation.",
        craft_uk:
          "Експерт з аналізу супутникових знімків, мережевого картографування, розпізнавання сутностей та часової кореляції. Володіє принаймні однією мовою сценаріїв для автоматизації збору даних.",
        typicalYearsExperience: 2,
      },
      {
        id: "l3",
        title_en: "Senior Analyst",
        title_uk: "Старший аналітик",
        scope_en:
          "Leads complex, multi-threaded investigations. Develops novel investigative methodologies and contributes them to the team playbook.",
        scope_uk:
          "Веде складні, багатопотокові розслідування. Розробляє нові дослідницькі методології та вносить їх у командний playbook.",
        impact_en:
          "Investigation outputs cited by journalists, NGOs, or government bodies. Findings withstand adversarial scrutiny.",
        impact_uk:
          "Результати розслідувань цитуються журналістами, НГО або державними органами. Висновки витримують ворожу перевірку.",
        leadership_en:
          "Trains and mentors junior analysts. Defines quality standards for the analysis function. Reviews reports before external publication.",
        leadership_uk:
          "Навчає та наставляє молодших аналітиків. Визначає стандарти якості для аналітичної функції. Перевіряє звіти перед зовнішньою публікацією.",
        craft_en:
          "Deep expertise in at least two regional or thematic domains (e.g., Ukrainian conflict, disinformation networks, sanctions evasion). Recognized in OSINT community.",
        craft_uk:
          "Глибока експертиза принаймні у двох регіональних або тематичних доменах (наприклад, український конфлікт, мережі дезінформації, обхід санкцій). Визнаний у спільноті OSINT.",
        typicalYearsExperience: 5,
      },
      {
        id: "l4",
        title_en: "Lead Analyst",
        title_uk: "Провідний аналітик",
        scope_en:
          "Owns the investigative agenda for a domain or region. Coordinates multi-analyst investigations. Interfaces with editorial, legal, and platform teams.",
        scope_uk:
          "Відповідає за дослідницьку програму для домену або регіону. Координує розслідування кількох аналітиків. Взаємодіє з редакційною, юридичною та платформними командами.",
        impact_en:
          "Investigations drive platform content strategy and inform policy decisions. Work featured in external media or cited by policymakers.",
        impact_uk:
          "Розслідування визначають стратегію контенту платформи та інформують рішення щодо політики. Робота публікується у зовнішніх ЗМІ або цитується особами, що приймають рішення.",
        leadership_en:
          "Leads a team of analysts on complex investigations. Represents the analysis team in cross-functional leadership forums.",
        leadership_uk:
          "Очолює команду аналітиків у складних розслідуваннях. Представляє аналітичну команду на міжфункціональних лідерських форумах.",
        craft_en:
          "Recognized externally as a domain authority. Publishes methodological guides or speaks at OSINT conferences (e.g., OSMOSIS, SANS OSINT Summit).",
        craft_uk:
          "Визнаний зовні як доменний авторитет. Публікує методологічні посібники або виступає на OSINT-конференціях (наприклад, OSMOSIS, SANS OSINT Summit).",
        typicalYearsExperience: 8,
      },
      {
        id: "principal",
        title_en: "Principal Analyst",
        title_uk: "Головний аналітик",
        scope_en:
          "Defines the organization's OSINT methodology and ethical framework. Sets the investigative standards adopted across all regional teams.",
        scope_uk:
          "Визначає OSINT-методологію та етичний фреймворк організації. Встановлює стандарти розслідування, прийняті у всіх регіональних командах.",
        impact_en:
          "Work shapes industry-wide OSINT practices. Testimony or reports inform government policy or international investigations.",
        impact_uk:
          "Робота формує галузеві практики OSINT. Свідчення або звіти інформують урядову політику або міжнародні розслідування.",
        leadership_en:
          "Defines the hiring bar and career development framework for all analysts. Represents the organization in external forensic and investigative communities.",
        leadership_uk:
          "Визначає планку найму та фреймворк кар'єрного розвитку для всіх аналітиків. Представляє організацію у зовнішніх судово-медичних та слідчих спільнотах.",
        craft_en:
          "Pioneered techniques now used widely in the OSINT community. Author of public methodological frameworks. Peer of investigative leaders at Bellingcat, ACLED, or equivalent organizations.",
        craft_uk:
          "Розробив техніки, що тепер широко використовуються у спільноті OSINT. Автор публічних методологічних фреймворків. Рівень слідчих лідерів у Bellingcat, ACLED або еквівалентних організаціях.",
        typicalYearsExperience: 12,
      },
    ],
  },
];

export function getCareerLadder(discipline: Discipline): CareerLadder | undefined {
  return CAREER_LADDERS.find((ladder) => ladder.discipline === discipline);
}
