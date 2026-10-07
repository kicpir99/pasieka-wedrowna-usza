import fs from 'fs';
import path from 'path';

async function generateDatabase() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('Downloading official InPost database from inpost.pl...');
  const res = await fetch('https://inpost.pl/sites/default/files/points.json');
  const data = await res.json();
  console.log('Downloaded', data.items.length, 'points');

  // Filter parcel lockers (t === 1)
  const lockers = data.items.filter(i => i.t === 1);

  // Map to optimized lightweight structure
  const mapped = lockers.map(i => {
    const province = (i.r || '').toLowerCase();
    const city = (i.c || '').trim();
    return {
      code: i.n,
      address: `${i.e} ${i.b}${i.d ? ' (' + i.d.replace(/[\r\n\t]/g, ' ').trim() + ')' : ''}`,
      city: city,
      province: province,
      postcode: i.o || '',
      lat: Number(i.l.a),
      lng: Number(i.l.o)
    };
  });

  // Filter all Dolny Śląsk + Opole + Lubuskie + all major Polish cities and regional capitals
  const targetLockers = mapped.filter(item => {
    const p = item.province;
    const c = item.city.toLowerCase();
    return (
      p.includes('dolnośląskie') ||
      p.includes('dolnoslaskie') ||
      p.includes('opolskie') ||
      p.includes('lubuskie') ||
      c === 'lubań' ||
      c === 'luban' ||
      c === 'wrocław' ||
      c === 'wroclaw' ||
      [
        'warszawa', 'kraków', 'krakow', 'łódź', 'lodz', 'poznań', 'poznan',
        'gdańsk', 'gdansk', 'szczecin', 'bydgoszcz', 'lublin', 'białystok',
        'bialystok', 'katowice', 'gdynia', 'częstochowa', 'czestochowa',
        'radom', 'toruń', 'torun', 'sosnowiec', 'rzeszów', 'rzeszow',
        'kielce', 'gliwice', 'zabrze', 'olsztyn', 'bielsko-biała', 'bielsko-biala',
        'bytom', 'zielona góra', 'zielona gora', 'rybnik', 'ruda śląska',
        'ruda slaska', 'opole', 'tychy', 'gorzów wielkopolski', 'gorzow wielkopolski',
        'dąbrowa górnicza', 'dabrowa gornicza', 'płock', 'plock', 'elbląg', 'elblag'
      ].includes(c)
    );
  });

  console.log('Filtered', targetLockers.length, 'lockers for Lower Silesia, Lubań & Major Cities');

  const outDir = path.resolve('public', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'inpost_lockers.json');
  fs.writeFileSync(outFile, JSON.stringify(targetLockers), 'utf-8');
  console.log('Saved to', outFile, 'Size:', (fs.statSync(outFile).size / 1024).toFixed(2), 'KB');

  // Verify Strzegomska & Lubań
  const strzegomska = targetLockers.filter(l => l.city.toLowerCase() === 'wrocław' && l.address.toLowerCase().includes('strzegomsk'));
  console.log('Strzegomska verification:', strzegomska.map(x => `${x.code}: ${x.address}`));

  const luban = targetLockers.filter(l => l.city.toLowerCase() === 'lubań');
  console.log('Lubań verification count:', luban.length, luban.slice(0, 3).map(x => `${x.code}: ${x.address}`));
}

generateDatabase();
