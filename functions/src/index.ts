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
