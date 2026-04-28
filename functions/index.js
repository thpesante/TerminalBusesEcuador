const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * 1. ASIGNACIÓN DE CUSTOM CLAIMS (RUC AISLAMIENTO)
 * Se dispara cuando se actualiza el perfil de un usuario con un RUC.
 */
exports.onUserRucAssigned = functions.firestore
    .document('users/{uid}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();
        const uid = context.params.uid;

        // Si el RUC cambió o se asignó por primera vez
        if (newData.ruc_empresa && newData.ruc_empresa !== oldData.ruc_empresa) {
            console.log(`Asignando Custom Claim RUC: ${newData.ruc_empresa} al usuario ${uid}`);
            
            await admin.auth().setCustomUserClaims(uid, {
                ruc_empresa: newData.ruc_empresa,
                role: newData.role || 'OFICINA'
            });
            
            // Forzar actualización de token en el cliente
            await db.collection('users').doc(uid).update({
                claimsUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });

/**
 * 2. RESERVA DE RANGOS SECUENCIALES (SOPORTE OFFLINE)
 * Permite que una oficina reserve un bloque de 100 números para facturar sin internet.
 */
exports.requestNextRange = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Debe estar logueado.');
    
    const ruc = context.auth.token.ruc_empresa;
    const puntoEmision = data.puntoEmision; // Ej: "001"
    
    if (!ruc || !puntoEmision) throw new functions.https.HttpsError('invalid-argument', 'Faltan parámetros.');

    const rangeRef = db.collection('sequential_ranges').doc(`${ruc}_${puntoEmision}`);

    return await db.runTransaction(async (transaction) => {
        const rangeDoc = await transaction.get(rangeRef);
        let lastNumber = 0;

        if (rangeDoc.exists()) {
            lastNumber = rangeDoc.data().lastAssignedNumber;
        }

        const start = lastNumber + 1;
        const end = lastNumber + 100;

        transaction.set(rangeRef, {
            ruc_empresa: ruc,
            puntoEmision: puntoEmision,
            lastAssignedNumber: end,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { start, end };
    });
});

/**
 * 3. FIRMA ELECTRÓNICA Y FACTURACIÓN SRI (BOCETO ARQUITECTURA)
 * Se dispara al crear un ticket para iniciar el proceso de facturación electrónica.
 */
exports.onTicketCreated = functions.firestore
    .document('tickets/{ticketId}')
    .onCreate(async (snap, context) => {
        const ticket = snap.data();
        const ticketId = context.params.ticketId;

        console.log(`Iniciando proceso de firma para Ticket: ${ticketId}`);

        try {
            // 1. Generar Clave de Acceso (49 dígitos)
            // 2. Construir XML según esquema del SRI
            // 3. Firmar XML usando certificado P12 (Almacenado en Secret Manager)
            // 4. Enviar a Recepción SRI
            // 5. Si es aceptado, enviar a Autorización SRI
            
            // Simulación de actualización de estado
            return snap.ref.update({
                sriStatus: 'PENDIENTE_FIRMA',
                claveAcceso: '0000000000000000000000000000000000000000000000000'
            });
        } catch (error) {
            console.error("Error en facturación electrónica:", error);
        }
    });
