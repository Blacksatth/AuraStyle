// setAdmin.js
import admin from 'firebase-admin'
import fs from 'fs'

const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf-8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

// Reemplaza con el UID del usuario de Google que quieres hacer admin
const uid = '8McEpGQYAOQdIu1wrTyx0pOQV502'

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('✅ Usuario marcado como admin')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Error asignando claim', err)
    process.exit(1)
  })
