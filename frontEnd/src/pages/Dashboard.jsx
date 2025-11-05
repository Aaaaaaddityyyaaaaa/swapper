import { useState } from "react";
import { useLoaderData, Navigate ,useNavigate} from "react-router";

// src/loaders/dashboardLoader.js
export const dashboardLoader = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in, redirect to login
    return { redirect: "/login" };
  }

  try {
    // Fetch events
    const eventsRes = await fetch("http://localhost:5000/api/event", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const eventsData = await eventsRes.json();

    // Fetch swap requests
    const swapRes = await fetch("http://localhost:5000/api/swap-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const swapData = await swapRes.json();

    return {
      events: eventsData.events || [],
      receivedRequests: swapData.received || [],
      sentRequests: swapData.sent || [],
    };
  } catch (err) {
    console.error(err);
    return { events: [], receivedRequests: [], sentRequests: [] };
  }
};


export default function Dashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [events, setEvents] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchData = async () => {
      try {
        const eventsRes = await fetch("http://localhost:5000/api/event", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);

        const swapRes = await fetch("http://localhost:5000/api/swap-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const swapData = await swapRes.json();
        setReceivedRequests(swapData.received || []);
        setSentRequests(swapData.sent || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token, navigate]);

  // Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, startTime, endTime }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents([...events, ...data.data.events.slice(-1)]);
        setTitle(""); setStartTime(""); setEndTime("");
      } else alert(data.message || "Error creating event");
    } catch (err) {
      console.error(err);
    }
  };

  // Accept / Reject swap request
  const handleSwapResponse = async (swapId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/swap/${swapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (res.ok) window.location.reload();
      else {
        const data = await res.json();
        alert(data.message || "Error processing swap");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isPending = (eventId) => {
    return sentRequests.some(
      (r) => r.requesterEvent._id === eventId && r.status === "PENDING"
    );
  };

  return (
    <div className="dashboard">
      {/* Create Event */}
      <div className="create-event">
        <h2>Create Event</h2>
        <form onSubmit={handleCreateEvent}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          <button type="submit">Create</button>
        </form>
      </div>

      {/* Your Events */}
      <div className="event-list">
        <h2>Your Events</h2>
        <ul>
          {events.map((e) => (
            <li key={e._id}>
              {e.title} | {new Date(e.startTime).toLocaleString()} - {new Date(e.endTime).toLocaleString()} | {e.isSwappable ? "Swappable" : "Busy"}
              {e.isSwappable && (
                <button
                  disabled={isPending(e._id)}
                  onClick={() => {
                    localStorage.setItem("selectedEventId", e._id);
                    navigate("/marketplace");
                  }}
                >
                  {isPending(e._id) ? "Pending" : "Request Swap"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Swap Requests */}
      <div className="swap-requests">
        <div className="received">
          <h2>Received Requests</h2>
          {receivedRequests.map((r) => (
            <div key={r._id} className="swap-request">
              <p>
                {r.requester.username} wants to swap <b>{r.requesterEvent.title}</b> with your <b>{r.receiverEvent.title}</b>
              </p>
              <button onClick={() => handleSwapResponse(r._id, "ACCEPT")}>Accept</button>
              <button onClick={() => handleSwapResponse(r._id, "REJECT")}>Reject</button>
            </div>
          ))}
        </div>
        <div className="sent">
          <h2>Sent Requests</h2>
          {sentRequests.map((r) => (
            <div key={r._id} className="swap-request">
              <p>You requested to swap <b>{r.requesterEvent.title}</b> with {r.receiver.username}'s <b>{r.receiverEvent.title}</b></p>
              <p>Status: {r.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}