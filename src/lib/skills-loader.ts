import type { Skill } from '@/types/skill';
import { SKILL_IDS, type SkillId } from '@/data/skills-manifest';

const cache = new Map<string, Skill>();

export async function loadSkill(id: SkillId): Promise<Skill> {
  if (cache.has(id)) return cache.get(id)!;
  const res = await fetch(`/skills/${id}.json`);
  if (!res.ok) throw new Error(`Skill "${id}" not found`);
  const data = (await res.json()) as Skill;
  cache.set(id, data);
  return data;
}

export function getSkillMetadata(): Array<
  Pick<Skill, 'skill_id' | 'skill_name' | 'difficulty'> & { description: string }
> {
  return [
    { skill_id: 'algorithms', skill_name: 'Algorithms & Data Structures', difficulty: 'A-Rank', description: 'Класичні алгоритми, складність O(n), масиви, дерева, графи. База для технічних інтервʼю та LeetCode.' },
    { skill_id: 'system-design', skill_name: 'System Design', difficulty: 'S-Rank', description: 'Проєктування великих систем: масштабування, кешування, шардинг, CAP. Сеньйор-рівень інтервʼю.' },
    { skill_id: 'design-patterns', skill_name: 'Design Patterns & SOLID', difficulty: 'A-Rank', description: 'GoF-патерни і SOLID-принципи. Як писати чистий, розширюваний код, який не розвалиться через рік.' },
    { skill_id: 'architecture-patterns', skill_name: 'Architecture Patterns', difficulty: 'S-Rank', description: 'Hexagonal, Clean, DDD, CQRS, Event Sourcing. Як організувати кодову базу великого продукту.' },
    { skill_id: 'frontend-patterns', skill_name: 'Frontend Patterns', difficulty: 'B-Rank', description: 'Компонентні підходи, state management, рендер-патерни, оптимізація React/Vue застосунків.' },
    { skill_id: 'docker', skill_name: 'Docker', difficulty: 'B-Rank', description: 'Контейнери, образи, Dockerfile, networks, volumes. Must-have для будь-якого бекенд-розробника.' },
    { skill_id: 'kubernetes', skill_name: 'Kubernetes', difficulty: 'A-Rank', description: 'Pods, Deployments, Services, Ingress, Helm. Оркестрація контейнерів у проді.' },
    { skill_id: 'cicd', skill_name: 'CI/CD', difficulty: 'B-Rank', description: 'GitHub Actions, GitLab CI, пайплайни, blue-green, canary. Автоматичний шлях коду в прод.' },
    { skill_id: 'linux', skill_name: 'Linux', difficulty: 'C-Rank', description: 'Шелл, права, процеси, systemd, мережа. Базовий інструмент серверного розробника.' },
    { skill_id: 'nginx', skill_name: 'Nginx', difficulty: 'C-Rank', description: 'Reverse proxy, load balancing, SSL, кешування, rate limiting. Парадні двері більшості бекендів.' },
    { skill_id: 'git', skill_name: 'Git & Version Control', difficulty: 'C-Rank', description: 'Branching, rebase, merge, conflict resolution, workflows. Інструмент №1 у щоденній роботі.' },
    { skill_id: 'sql', skill_name: 'SQL & Databases', difficulty: 'B-Rank', description: 'JOIN, indexes, transactions, normalization, EXPLAIN. Як не вбити прод повільним запитом.' },
    { skill_id: 'mongodb', skill_name: 'MongoDB', difficulty: 'B-Rank', description: 'Document model, aggregation, індекси, репліки. NoSQL для гнучких схем і high-load.' },
    { skill_id: 'redis', skill_name: 'Redis', difficulty: 'B-Rank', description: 'Кеш, pub/sub, черги, rate limiting, locks. In-memory швидкість для гарячих даних.' },
    { skill_id: 'http', skill_name: 'HTTP', difficulty: 'B-Rank', description: 'Методи, статуси, headers, кешування, HTTP/2-3, CORS. Те, на чому стоїть весь веб.' },
    { skill_id: 'rest-api', skill_name: 'REST API Design', difficulty: 'B-Rank', description: 'Ресурси, версіонування, ідемпотентність, пагінація, помилки. Як не зробити API, яким соромно користуватись.' },
    { skill_id: 'grpc', skill_name: 'gRPC', difficulty: 'B-Rank', description: 'Protobuf, streaming, deadlines, interceptors. Швидкий бінарний RPC між сервісами.' },
    { skill_id: 'websockets', skill_name: 'WebSockets', difficulty: 'B-Rank', description: 'Real-time звʼязок, heartbeat, scaling, fallback. Чати, нотифікації, live-дашборди.' },
    { skill_id: 'microservices', skill_name: 'Microservices Communication', difficulty: 'A-Rank', description: 'Sync vs async, service mesh, circuit breakers, sagas. Як сервіси домовляються, не розвалюючи систему.' },
    { skill_id: 'message-brokers', skill_name: 'Message Brokers (Kafka / RabbitMQ)', difficulty: 'A-Rank', description: 'Topics, partitions, exchanges, consumers, idempotency. Асинхронний хребет великих систем.' },
    { skill_id: 'monitoring', skill_name: 'Monitoring & Observability', difficulty: 'B-Rank', description: 'Logs, metrics, traces, SLI/SLO, alerts. Як бачити прод і не дізнаватись про падіння від користувачів.' },
    { skill_id: 'security', skill_name: 'Application Security', difficulty: 'A-Rank', description: 'OWASP Top 10, SQL-i, XSS, CSRF, secrets management. Як не злити дані юзерів у твіттер.' },
    { skill_id: 'auth', skill_name: 'Authentication & OAuth', difficulty: 'B-Rank', description: 'JWT, OAuth 2.0, OIDC, sessions, refresh tokens. Хто ти такий і що тобі дозволено.' },
    { skill_id: 'testing', skill_name: 'Testing', difficulty: 'B-Rank', description: 'Unit, integration, e2e, mocks, test pyramid, TDD. Як спати спокійно після релізу в пʼятницю.' },
    { skill_id: 'python', skill_name: 'Python', difficulty: 'B-Rank', description: 'GIL, async, generators, decorators, type hints. Мова для бекенду, скриптів і ML.' },
    { skill_id: 'golang', skill_name: 'Go (Golang)', difficulty: 'B-Rank', description: 'Goroutines, channels, interfaces, generics. Швидка компільована мова для cloud-native.' },
    { skill_id: 'php', skill_name: 'PHP', difficulty: 'C-Rank', description: 'Сучасний PHP 8+, Composer, Laravel/Symfony, OPcache. Не той PHP з 2010 року, обіцяємо.' },
    { skill_id: 'nodejs', skill_name: 'Node.js', difficulty: 'B-Rank', description: 'Event loop, async patterns, streams, cluster vs worker_threads, error handling. JS runtime на V8 + libuv.' },
    { skill_id: 'ai-fundamentals', skill_name: 'AI / ML Fundamentals', difficulty: 'B-Rank', description: 'LLM, embeddings, RAG, prompt engineering, vector DB. Що питають у 2026 на будь-якому інтервʼю.' },
    { skill_id: 'agile', skill_name: 'Agile & Scrum', difficulty: 'D-Rank', description: 'Спринти, рітроспективи, story points, Kanban. Як працюють команди в нормальних компаніях.' },
    { skill_id: 'seo', skill_name: 'SEO', difficulty: 'C-Rank', description: 'Meta-теги, Core Web Vitals, schema.org, sitemap, AI Overviews. Щоб гугл і ChatGPT тебе знайшли.' },
    { skill_id: 'ui-ux', skill_name: 'UI/UX', difficulty: 'C-Rank', description: 'Контраст, типографіка, accessibility, user flow, гештальт. База, без якої фронт виглядає як 2003.' },
    { skill_id: 'production-pitfalls', skill_name: 'Production Pitfalls', difficulty: 'A-Rank', description: 'Типові факапи в проді: race conditions, мемлік, retry storms, cascading failures. Чужий біль, твій досвід.' },
    { skill_id: 'chatbots', skill_name: 'Chatbots (Telegram / Discord)', difficulty: 'B-Rank', description: 'Bot API, webhooks, inline keyboards, state, deploy. Як зробити бота, який не падає на 100 юзерах.' },
    { skill_id: 'interview-mindset', skill_name: 'Mindset кандидата і ринок', difficulty: 'D-Rank', description: 'Як читати ринок праці, грейди, очікування. Психологія пошуку роботи без вигорання.' },
    { skill_id: 'interview-screening', skill_name: 'Скринінг з рекрутером', difficulty: 'D-Rank', description: 'Як пройти першу розмову з HR, що казати про досвід, червоні прапорці. Воротар перед інтервʼю.' },
    { skill_id: 'interview-self-presentation', skill_name: 'Самопрезентація на співбесіді', difficulty: 'C-Rank', description: 'Tell me about yourself, story-arc, акценти на результатах. 3 хвилини, які вирішують все.' },
    { skill_id: 'interview-soft', skill_name: 'Soft questions (поведінкові)', difficulty: 'C-Rank', description: 'STAR-метод, конфлікти, лідерство, провали. Як відповідати на «Розкажіть про випадок, коли…».' },
    { skill_id: 'interview-salary', skill_name: 'Зарплатні переговори', difficulty: 'C-Rank', description: 'Як назвати число, торгуватись, рахувати оффер цілісно. Не залишити гроші на столі.' },
    { skill_id: 'interview-tech-talk', skill_name: 'Технічна співбесіда: як говорити', difficulty: 'B-Rank', description: 'Думати вголос, ставити запитання, фреймити рішення. Не що знаєш, а як це показуєш.' },
  ];
}

export { SKILL_IDS };
export type { SkillId };
