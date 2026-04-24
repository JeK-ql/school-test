import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateSkill } from '../src/lib/validate-skills';

const dir = join(process.cwd(), 'src/data/skills');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

let ok = true;
for (const f of files) {
  try {
    const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const skill = validateSkill(raw);
    console.log(`OK  ${f}  (${skill.questions.length} q)`);
  } catch (err) {
    ok = false;
    console.error(`FAIL ${f}  ${(err as Error).message}`);
  }
}
process.exit(ok ? 0 : 1);
