const jwt = require('jsonwebtoken');
const { execSync } = require('child_process');
require('dotenv').config();

async function main() {
  const usersStr = execSync(`mysql -u root -p110905 -e "USE sistem_surat_sulsel; SELECT id, email, role, instansiId FROM users WHERE role = 'USER_INSTANSI';" --batch --skip-column-names`).toString();
  
  const users = usersStr.trim().split('\n').map(line => {
    const [id, email, role, instansiId] = line.split('\t');
    return { id: Number(id), email, role, instansiId: instansiId === 'NULL' ? null : Number(instansiId) };
  });

  console.log(`Found ${users.length} USER_INSTANSI accounts.`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          adminType: null, // USER_INSTANSI usually has no adminType
          instansiId: user.instansiId ?? null,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // 1. Create Surat
      const fd = new URLSearchParams();
      fd.append('nomorSurat', 'TEST-AUTO-' + user.id + '-' + Date.now());
      fd.append('tanggalSurat', '2026-09-07');
      fd.append('kabupatenIds', JSON.stringify([1])); // Assuming Kabupaten Bantaeng is ID 1

      const reqHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      const createRes = await fetch('http://localhost:5000/api/surat', {
        method: 'POST',
        headers: reqHeaders,
        body: fd.toString()
      });
      const createData = await createRes.json();
      
      if (!createData.success) {
        console.error(`❌ [${user.email}] Failed to create surat:`, createData.message);
        failCount++;
        continue;
      }
      
      const suratId = createData.data.id;

      // 2. Send Surat
      const sendRes = await fetch(`http://localhost:5000/api/surat/${suratId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'TERKIRIM' })
      });
      const sendData = await sendRes.json();
      
      if (!sendData.success) {
        console.error(`❌ [${user.email}] Failed to send surat:`, sendData.message);
        failCount++;
        continue;
      }
      
      console.log(`✅ [${user.email}] Successfully created and sent surat #${suratId}`);
      successCount++;
      
    } catch (err) {
      console.error(`❌ [${user.email}] Exception:`, err.message);
      failCount++;
    }
  }

  console.log(`\nTest completed. Success: ${successCount}, Fail: ${failCount}`);
  process.exit(0);
}

main().catch(console.error);
