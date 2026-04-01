import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../contexts/auth/useAuth";

export default function NotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH (REAL-TIME) ================= */

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= MARK AS READ ================= */

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        isRead: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="p-6 text-white">Loading notifications...</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {!notifications.length && (
        <p className="text-slate-400">No notifications yet</p>
      )}

      <div className="space-y-3">

        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markAsRead(item.id)}
            className={`p-4 rounded-xl cursor-pointer transition ${
              item.isRead
                ? "bg-white/5"
                : "bg-indigo-500/20 border border-indigo-400"
            }`}
          >
            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-300">
                  {item.message}
                </p>
              </div>

              {!item.isRead && (
                <span className="h-2 w-2 bg-indigo-400 rounded-full" />
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}