const express = require("express");
const app = express();
const PORT = 3000;

// Initialize 10 seats
let seats = {};
for (let i = 1; i <= 5; i++) {
  seats[i] = {status: "available"};
}

// ✅ 1. Get all seats
app.get("/seats", (req, res) => {
  res.json(seats);
});

// ✅ 2. Lock a seat
app.post("/lock/:id", (req, res) => {
  const id = req.params.id;

  if (!seats[id]) {
    return res.status(400).json({ message: "Invalid seat number" });
  }

  if (seats[id].status === "booked") {
    return res.status(400).json({ message: `Seat ${id} is already booked` });
  }

  if (seats[id].status === "locked") {
    return res.status(400).json({ message: `Seat ${id} is already locked` });
  }

  // Lock the seat
  seats[id].status = "locked";

  // Set 1-minute timer to auto-release
  seats[id].lockTimer = setTimeout(() => {
    seats[id].status = "available";
    seats[id].lockTimer = null;
  }, 60000);

  res.json({ message: `Seat ${id} locked successfully. Confirm within 1 minute.` });
});

// ✅ 3. Confirm a seat
app.post("/confirm/:id", (req, res) => {
  const id = req.params.id;

  if (!seats[id]) {
    return res.status(400).json({ message: "Invalid seat number" });
  }

  if (seats[id].status !== "locked") {
    return res.status(400).json({ message: "Seat is not locked and cannot be booked" });
  }

  // Clear the timer and confirm
  clearTimeout(seats[id].lockTimer);
  seats[id].lockTimer = null;
  seats[id].status = "booked";

  res.json({ message: `Seat ${id} booked successfully!` });
});

// ✅ 4. Reset server endpoint (optional for testing)
app.post("/reset", (req, res) => {
  for (let i = 1; i <= 10; i++) {
    if (seats[i].lockTimer) clearTimeout(seats[i].lockTimer);
    seats[i] = { status: "available", lockTimer: null };
  }
  res.json({ message: "All seats reset to available" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
