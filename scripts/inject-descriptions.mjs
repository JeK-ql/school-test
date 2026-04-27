import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIRS = [
  join(__dirname, '..', 'public', 'skills'),
  join(__dirname, '..', 'src', 'data', 'skills'),
];

const descriptions = {
  'algorithms': 'Класичні алгоритми, складність O(n), масиви, дерева, графи. База для технічних інтервʼю та LeetCode.',
  'system-design': 'Проєктування великих систем: масштабування, кешування, шардинг, CAP. Сеньйор-рівень інтервʼю.',
  'design-patterns': 'GoF-патерни і SOLID-принципи. Як писати чистий, розширюваний код, який не розвалиться через рік.',
  'architecture-patterns': 'Hexagonal, Clean, DDD, CQRS, Event Sourcing. Як організувати кодову базу великого продукту.',
  'frontend-patterns': 'Компонентні підходи, state management, рендер-патерни, оптимізація React/Vue застосунків.',
  'docker': 'Контейнери, образи, Dockerfile, networks, volumes. Must-have для будь-якого бекенд-розробника.',
  'kubernetes': 'Pods, Deployments, Services, Ingress, Helm. Оркестрація контейнерів у проді.',
  'cicd': 'GitHub Actions, GitLab CI, пайплайни, blue-green, canary. Автоматичний шлях коду в прод.',
  'linux': 'Шелл, права, процеси, systemd, мережа. Базовий інструмент серверного розробника.',
  'nginx': 'Reverse proxy, load balancing, SSL, кешування, rate limiting. Парадні двері більшості бекендів.',
  'git': 'Branching, rebase, merge, conflict resolution, workflows. Інструмент №1 у щоденній роботі.',
  'sql': 'JOIN, indexes, transactions, normalization, EXPLAIN. Як не вбити прод повільним запитом.',
  'mongodb': 'Document model, aggregation, індекси, репліки. NoSQL для гнучких схем і high-load.',
  'redis': 'Кеш, pub/sub, черги, rate limiting, locks. In-memory швидкість для гарячих даних.',
  'http': 'Методи, статуси, headers, кешування, HTTP/2-3, CORS. Те, на чому стоїть весь веб.',
  'rest-api': 'Ресурси, версіонування, ідемпотентність, пагінація, помилки. Як не зробити API, яким соромно користуватись.',
  'grpc': 'Protobuf, streaming, deadlines, interceptors. Швидкий бінарний RPC між сервісами.',
  'websockets': 'Real-time звʼязок, heartbeat, scaling, fallback. Чати, нотифікації, live-дашборди.',
  'microservices': 'Sync vs async, service mesh, circuit breakers, sagas. Як сервіси домовляються, не розвалюючи систему.',
  'message-brokers': 'Topics, partitions, exchanges, consumers, idempotency. Асинхронний хребет великих систем.',
  'monitoring': 'Logs, metrics, traces, SLI/SLO, alerts. Як бачити прод і не дізнаватись про падіння від користувачів.',
  'security': 'OWASP Top 10, SQL-i, XSS, CSRF, secrets management. Як не злити дані юзерів у твіттер.',
  'auth': 'JWT, OAuth 2.0, OIDC, sessions, refresh tokens. Хто ти такий і що тобі дозволено.',
  'testing': 'Unit, integration, e2e, mocks, test pyramid, TDD. Як спати спокійно після релізу в пʼятницю.',
  'python': 'GIL, async, generators, decorators, type hints. Мова для бекенду, скриптів і ML.',
  'golang': 'Goroutines, channels, interfaces, generics. Швидка компільована мова для cloud-native.',
  'php': 'Сучасний PHP 8+, Composer, Laravel/Symfony, OPcache. Не той PHP з 2010 року, обіцяємо.',
  'ai-fundamentals': 'LLM, embeddings, RAG, prompt engineering, vector DB. Що питають у 2026 на будь-якому інтервʼю.',
  'agile': 'Спринти, рітроспективи, story points, Kanban. Як працюють команди в нормальних компаніях.',
  'seo': 'Meta-теги, Core Web Vitals, schema.org, sitemap, AI Overviews. Щоб гугл і ChatGPT тебе знайшли.',
  'ui-ux': 'Контраст, типографіка, accessibility, user flow, гештальт. База, без якої фронт виглядає як 2003.',
  'production-pitfalls': 'Типові факапи в проді: race conditions, мемлік, retry storms, cascading failures. Чужий біль, твій досвід.',
  'chatbots': 'Bot API, webhooks, inline keyboards, state, deploy. Як зробити бота, який не падає на 100 юзерах.',
  'interview-mindset': 'Як читати ринок праці, грейди, очікування. Психологія пошуку роботи без вигорання.',
  'interview-screening': 'Як пройти першу розмову з HR, що казати про досвід, червоні прапорці. Воротар перед інтервʼю.',
  'interview-self-presentation': 'Tell me about yourself, story-arc, акценти на результатах. 3 хвилини, які вирішують все.',
  'interview-soft': 'STAR-метод, конфлікти, лідерство, провали. Як відповідати на «Розкажіть про випадок, коли…».',
  'interview-salary': 'Як назвати число, торгуватись, рахувати оффер цілісно. Не залишити гроші на столі.',
  'interview-tech-talk': 'Думати вголос, ставити запитання, фреймити рішення. Не що знаєш, а як це показуєш.',
};

let updated = 0;
for (const dir of SKILL_DIRS) {
  for (const [id, description] of Object.entries(descriptions)) {
    const path = join(dir, `${id}.json`);
    let raw;
    try {
      raw = await readFile(path, 'utf8');
    } catch {
      continue;
    }
    const data = JSON.parse(raw);
    if (data.description === description) continue;
    const reordered = {
      skill_id: data.skill_id,
      skill_name: data.skill_name,
      difficulty: data.difficulty,
      description,
      questions: data.questions,
    };
    await writeFile(path, JSON.stringify(reordered, null, 2) + '\n', 'utf8');
    updated++;
    console.log(`✓ ${dir.includes('public') ? 'public' : 'src/data'}/${id}`);
  }
}
console.log(`\nUpdated ${updated} skill file entries.`);
