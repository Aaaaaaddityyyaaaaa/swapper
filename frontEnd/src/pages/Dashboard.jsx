import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export const dashboardLoader = async () => {
  const token = localStorage.getItem("token");

  if (!token) return { redirect: "/login" };

  try {
    const eventsRes = await fetch("http://localhost:5000/api/event/get", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const eventsData = await eventsRes.json();

    const swapRes = await fetch("http://localhost:5000/api/swap/swap/all", {
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
  const [isSwappable, setIsSwappable] = useState(false);
  const [events, setEvents] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchData = async () => {
      try {
        const eventsRes = await fetch("http://localhost:5000/api/event/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);

        const swapRes = await fetch("http://localhost:5000/api/swap/swap/all", {
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

  // ✅ Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    const now = new Date();
    if (new Date(startTime) < now || new Date(endTime) < now) {
      alert("You cannot select a past date/time!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/event/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, startTime, endTime, isSwappable }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvents([...events, ...data.data.events.slice(-1)]);
        setTitle("");
        setStartTime("");
        setEndTime("");
        setIsSwappable(false);
      } else {
        alert(data.message || "Error creating event");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/swap-requests/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setEvents(events.filter((e) => e._id !== eventId));
      } else {
        alert(data.message || "Error deleting event");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwapResponse = async (swapId, action) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/swap-requests/swap/${swapId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );
      if (res.ok) window.location.reload();
      else {
        const data = await res.json();
        alert(data.message || "Error processing swap");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isPending = (eventId) =>
    sentRequests.some(
      (r) => r.requesterEvent._id === eventId && r.status === "PENDING"
    );

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="dashboard">
      {/* Create Event */}
      <div className="create-event">
        <h2>Create Event</h2>
        <form onSubmit={handleCreateEvent}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            min={minDateTime}
            required
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={minDateTime}
            required
          />

          <label style={{ display: "block", marginTop: "8px" }}>
            <input
              type="checkbox"
              checked={isSwappable}
              onChange={(e) => setIsSwappable(e.target.checked)}
            />{" "}
            Make this event swappable
          </label>

          <button type="submit" style={{ marginTop: "10px" }}>
            Create
          </button>
        </form>
      </div>

      {/* Your Events */}
      <div className="event-list">
        <h2>Your Events</h2>
        <ul>
          {events.map((e) => (
            <li key={e._id}>
              {e.title} |{" "}
              {new Date(e.startTime).toLocaleString()} -{" "}
              {new Date(e.endTime).toLocaleString()} |{" "}
              {e.isSwappable ? "Swappable" : "Busy"}

              {/* Request Swap Button */}
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

              {/* ✅ Delete Button */}
              <button
                onClick={() => handleDeleteEvent(e._id)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
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
                {r.requester.username} wants to swap{" "}
                <b>{r.requesterEvent.title}</b> with your{" "}
                <b>{r.receiverEvent.title}</b>
              </p>
              <button onClick={() => handleSwapResponse(r._id, "ACCEPT")}>
                Accept
              </button>
              <button onClick={() => handleSwapResponse(r._id, "REJECT")}>
                Reject
              </button>
            </div>
          ))}
        </div>

        <div className="sent">
          <h2>Sent Requests</h2>
          {sentRequests.map((r) => (
            <div key={r._id} className="swap-request">
              <p>
                You requested to swap <b>{r.requesterEvent.title}</b> with{" "}
                {r.receiver.username}'s <b>{r.receiverEvent.title}</b>
              </p>
              <p>Status: {r.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
