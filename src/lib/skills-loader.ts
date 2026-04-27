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

export function getSkillMetadata(): Array<Pick<Skill, 'skill_id' | 'skill_name' | 'difficulty'>> {
  return [
    { skill_id: 'algorithms', skill_name: 'Algorithms & Data Structures', difficulty: 'A-Rank' },
    { skill_id: 'system-design', skill_name: 'System Design', difficulty: 'S-Rank' },
    { skill_id: 'design-patterns', skill_name: 'Design Patterns & SOLID', difficulty: 'A-Rank' },
    { skill_id: 'architecture-patterns', skill_name: 'Architecture Patterns', difficulty: 'S-Rank' },
    { skill_id: 'frontend-patterns', skill_name: 'Frontend Patterns', difficulty: 'B-Rank' },
    { skill_id: 'docker', skill_name: 'Docker', difficulty: 'B-Rank' },
    { skill_id: 'kubernetes', skill_name: 'Kubernetes', difficulty: 'A-Rank' },
    { skill_id: 'cicd', skill_name: 'CI/CD', difficulty: 'B-Rank' },
    { skill_id: 'linux', skill_name: 'Linux', difficulty: 'C-Rank' },
    { skill_id: 'nginx', skill_name: 'Nginx', difficulty: 'C-Rank' },
    { skill_id: 'git', skill_name: 'Git & Version Control', difficulty: 'C-Rank' },
    { skill_id: 'sql', skill_name: 'SQL & Databases', difficulty: 'B-Rank' },
    { skill_id: 'mongodb', skill_name: 'MongoDB', difficulty: 'B-Rank' },
    { skill_id: 'redis', skill_name: 'Redis', difficulty: 'B-Rank' },
    { skill_id: 'http', skill_name: 'HTTP', difficulty: 'B-Rank' },
    { skill_id: 'rest-api', skill_name: 'REST API Design', difficulty: 'B-Rank' },
    { skill_id: 'grpc', skill_name: 'gRPC', difficulty: 'B-Rank' },
    { skill_id: 'websockets', skill_name: 'WebSockets', difficulty: 'B-Rank' },
    { skill_id: 'microservices', skill_name: 'Microservices Communication', difficulty: 'A-Rank' },
    { skill_id: 'message-brokers', skill_name: 'Message Brokers (Kafka / RabbitMQ)', difficulty: 'A-Rank' },
    { skill_id: 'monitoring', skill_name: 'Monitoring & Observability', difficulty: 'B-Rank' },
    { skill_id: 'security', skill_name: 'Application Security', difficulty: 'A-Rank' },
    { skill_id: 'auth', skill_name: 'Authentication & OAuth', difficulty: 'B-Rank' },
    { skill_id: 'testing', skill_name: 'Testing', difficulty: 'B-Rank' },
    { skill_id: 'python', skill_name: 'Python', difficulty: 'B-Rank' },
    { skill_id: 'golang', skill_name: 'Go (Golang)', difficulty: 'B-Rank' },
    { skill_id: 'php', skill_name: 'PHP', difficulty: 'C-Rank' },
    { skill_id: 'ai-fundamentals', skill_name: 'AI / ML Fundamentals', difficulty: 'B-Rank' },
    { skill_id: 'agile', skill_name: 'Agile & Scrum', difficulty: 'D-Rank' },
    { skill_id: 'seo', skill_name: 'SEO', difficulty: 'C-Rank' },
    { skill_id: 'ui-ux', skill_name: 'UI/UX', difficulty: 'C-Rank' },
    { skill_id: 'production-pitfalls', skill_name: 'Production Pitfalls', difficulty: 'A-Rank' },
    { skill_id: 'chatbots', skill_name: 'Chatbots (Telegram / Discord)', difficulty: 'B-Rank' },
    { skill_id: 'interview-mindset', skill_name: 'Mindset кандидата і ринок', difficulty: 'D-Rank' },
    { skill_id: 'interview-screening', skill_name: 'Скринінг з рекрутером', difficulty: 'D-Rank' },
    { skill_id: 'interview-self-presentation', skill_name: 'Самопрезентація на співбесіді', difficulty: 'C-Rank' },
    { skill_id: 'interview-soft', skill_name: 'Soft questions (поведінкові)', difficulty: 'C-Rank' },
    { skill_id: 'interview-salary', skill_name: 'Зарплатні переговори', difficulty: 'C-Rank' },
    { skill_id: 'interview-tech-talk', skill_name: 'Технічна співбесіда: як говорити', difficulty: 'B-Rank' },
  ];
}

export { SKILL_IDS };
export type { SkillId };
