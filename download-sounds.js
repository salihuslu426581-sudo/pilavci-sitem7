const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // Handle redirect
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
           res.pipe(file);
           file.on('finish', () => { file.close(); resolve(); });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', err => { reject(err); });
  });
};

async function main() {
  try {
    await download('https://cdn.pixabay.com/download/audio/2022/03/15/audio_248c775080.mp3', path.join(dir, 'table.mp3'));
    await download('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3', path.join(dir, 'paket.mp3'));
    console.log('All downloads completed successfully!');
  } catch(e) {
    console.error('Download failed:', e);
  }
}
main();
