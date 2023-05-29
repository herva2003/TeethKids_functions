import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendEmergencyNotification = functions
  .region("southamerica-east1")
  .firestore.document("emergencias/{docId}")
  .onCreate(async (snapshot) => {
    const usersSnapshot = await admin.firestore()
      .collection("users").where("status", "==", "ONLINE").get();

    const fcmTokens = usersSnapshot.docs.map((doc) => doc.data().fcmToken);

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: "Nova emergência!",
        body: ".....",
      },
      data: {
        id: snapshot.id,
        name: snapshot.get("clientName"),
        phone: snapshot.get("clientPhone"),
      },
    };

    const message: admin.messaging.MulticastMessage = {
      notification: payload.notification,
      data: payload.data,
      tokens: [],
    };

    message.tokens = fcmTokens;

    const response = await admin.messaging().sendMulticast(message);

    console.log(`${response} ${message.tokens}
     notifications sent successfully`);
  });


export const sendConsultaNotification = functions
  .region("southamerica-east1")
  .firestore.document("consulta/{docId}")
  .onCreate(async (snapshot) => {
    const docId = snapshot.id;

    const consultaSnapshot = await admin.firestore()
      .collection("consulta")
      .doc(docId)
      .get();

    const fcmToken = consultaSnapshot.get("fcmToken");

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: "Consulta marcada!",
        body: "Ligue e confirme os detalhes.",
      },
      data: {
        id: docId,
        name: snapshot.get("userPhoneNumber"),
      },
    };

    const message: admin.messaging.Message = {
      notification: payload.notification,
      data: payload.data,
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);

    console.log(`${response} notification sent successfully`);
  });
