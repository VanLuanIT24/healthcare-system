// import-accounts.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

async function run() {
  const filePath = path.join(__dirname, 'account-data.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const accounts = JSON.parse(raw);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  for (const acc of accounts) {
    const email = acc.email.toLowerCase();

    // idempotent: update nếu đã có, ngược lại tạo mới
    const existing = await User.findOne({ email });
    if (existing) {
      existing.set(acc);
      await existing.save(); // hook pre-save sẽ giữ/hash mật khẩu nếu đổi
      console.log(`🔄 Updated: ${email}`);
    } else {
      await User.create(acc); // pre-save sẽ tự hash
      console.log(`➕ Created: ${email}`);
    }
  }

  await mongoose.disconnect();
  console.log('✅ Done');
}

run().catch(err => {
  console.error('❌ Error', err);
  process.exit(1);
});