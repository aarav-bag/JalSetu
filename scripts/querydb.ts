import { db } from '../server/db';
import { farms, fields } from '../shared/schema';

async function main() {
  const f = await db.select({ id: farms.id, name: farms.name, userId: farms.userId }).from(farms);
  const fi = await db.select({ id: fields.id, name: fields.name, farmId: fields.farmId }).from(fields);
  console.log('FARMS:', JSON.stringify(f));
  console.log('FIELDS:', JSON.stringify(fi));
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
