import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const file = path.resolve('./data.json');

function init() {
  if (!fs.existsSync(file)) {
    const seed = {
      users: [
        {
          id: 'U1',
          email: 'mariusz.rybicki@animex.pl',
          role: 'admin',
          passwordHash: bcrypt.hashSync('snzzz', 10)
        }
      ],
      psn: [],
      registry: []
    };
    fs.writeFileSync(file, JSON.stringify(seed, null, 2));
  }
}

init();

export const db = JSON.parse(fs.readFileSync(file, 'utf-8'));

export function save() {
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}
