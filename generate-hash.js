const bcrypt = require('bcrypt');
const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error('❌ Uso: node generate-hash.js "tu-contraseña"');
  process.exit(1);
}

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) throw err;
  console.log('✅ Hash generado:');
  console.log(hash);
  console.log('📌 Copia este valor a ADMIN_PASSWORD_HASH en tu archivo .env');
});