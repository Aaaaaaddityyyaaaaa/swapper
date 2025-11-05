// src/pages/Marketplace.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Marketplace() {
  const navigate = useNavigate();
  const [swappableEvents, setSwappableEvents] = useState([]);
  const token = localStorage.getItem("token");
  const requesterEventId = localStorage.getItem("selectedEventId");

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchSwappable = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/marketplace", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSwappableEvents(data.events || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSwappable();
  }, [token, navigate]);

  const handleRequestSwap = async (receiverEventId) => {
    try {
      const res = await fetch("http://localhost:5000/api/swap-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requesterEvent: requesterEventId, receiverEvent: receiverEventId }),
      });
      const data = await res.json();
      if (res.ok) navigate("/dashboard");
      else alert(data.message || "Failed to request swap");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="marketplace">
      <h2>Marketplace: Swappable Events</h2>
      <ul>
        {swappableEvents.map((e) => (
          <li key={e._id}>
            {e.title} | {new Date(e.startTime).toLocaleString()} - {new Date(e.endTime).toLocaleString()} | Owner: {e.user.username}
            <button onClick={() => handleRequestSwap(e._id)}>Request Swap</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
