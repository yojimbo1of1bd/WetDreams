import { fetchPerformerScenes } from './scene-fetcher.mjs';

async function test() {
  const names = ['Kendra Lust', 'Angela White', 'Cory Chase'];
  for (const name of names) {
    const scenes = await fetchPerformerScenes(name);
    console.log(`\n=== ${name}: ${scenes.length} real scenes ===`);
    if (scenes.length) {
      console.log('Scene 1:', JSON.stringify(scenes[0], null, 2));
      console.log('Scene 2:', JSON.stringify(scenes[1], null, 2));
    }
  }
}
test();

