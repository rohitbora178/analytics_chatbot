const { readDb, writeDb } = require("../utils/db");
const { validateTicketData, sanitizeString } = require("../utils/validation");

async function getTickets(req, res) {
  try {
    const { status, username } = req.query;
    const db = await readDb();
    let tickets = db.supportTickets || [];

    if (username && username.trim().length > 0) {
      const sanitizedUsername = sanitizeString(username);
      tickets = tickets.filter((ticket) => ticket.username.toLowerCase().includes(sanitizedUsername.toLowerCase()));
    }

    if (status && status.trim().length > 0) {
      const validStatuses = ["open", "in-progress", "resolved", "closed"];
      const sanitizedStatus = sanitizeString(status).toLowerCase();
      if (validStatuses.includes(sanitizedStatus)) {
        tickets = tickets.filter((ticket) => ticket.status === sanitizedStatus);
      }
    }

    res.json(tickets);
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ error: "Unable to fetch support tickets." });
  }
}

async function createTicket(req, res) {
  try {
    // Validate input
    const errors = validateTicketData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    const { name, email, subject, message, username } = req.body;

    // Additional validation for required fields
    if (!name || !email || !subject || !message || !username) {
      return res.status(400).json({ error: "All ticket fields are required." });
    }

    const db = await readDb();
    db.supportTickets = db.supportTickets || [];
    const maxId = db.supportTickets.length > 0 ? Math.max(...db.supportTickets.map((t) => t.id || 0)) : 0;

    const now = new Date().toISOString();
    const newTicket = {
      id: maxId + 1,
      name: sanitizeString(name),
      email: sanitizeString(email).toLowerCase(),
      username: sanitizeString(username),
      subject: sanitizeString(subject),
      message: sanitizeString(message),
      status: "open",
      createdAt: now,
      updatedAt: now,
      history: [
        {
          status: "open",
          message: "Ticket created",
          timestamp: now,
        },
      ],
    };

    db.supportTickets.push(newTicket);
    await writeDb(db);

    res.status(201).json({ message: "Support ticket submitted.", ticket: newTicket });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ error: "Unable to create support ticket." });
  }
}

function validateTicketStatus(currentStatus, nextStatus) {
  const allowedStatuses = ["open", "in-progress", "resolved", "closed"];
  if (!allowedStatuses.includes(nextStatus)) {
    return `Status must be one of: ${allowedStatuses.join(", ")}.`;
  }

  if (currentStatus === "closed") {
    return "Closed tickets cannot be updated.";
  }

  return null;
}

async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required to update ticket." });
    }

    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId) || ticketId < 1) {
      return res.status(400).json({ error: "Invalid ticket ID." });
    }

    const db = await readDb();
    const ticket = (db.supportTickets || []).find((ticket) => ticket.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found." });
    }

    const validationError = validateTicketStatus(ticket.status, sanitizeString(status).toLowerCase());
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    ticket.status = sanitizeString(status).toLowerCase();
    ticket.updatedAt = new Date().toISOString();
    ticket.history = ticket.history || [];
    ticket.history.push({
      status: ticket.status,
      message: message ? sanitizeString(message) : `Status changed to ${ticket.status}`,
      timestamp: ticket.updatedAt,
    });

    if (ticket.status === "resolved" || ticket.status === "closed") {
      ticket.resolution = message ? sanitizeString(message) : ticket.resolution || "Issue has been addressed.";
    }

    await writeDb(db);
    res.json({ message: `Ticket updated to ${ticket.status}.`, ticket });
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ error: "Unable to update ticket status." });
  }
}

async function resolveTicket(req, res) {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId) || ticketId < 1) {
      return res.status(400).json({ error: "Invalid ticket ID." });
    }

    const db = await readDb();
    const ticket = (db.supportTickets || []).find((ticket) => ticket.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found." });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({ error: "Closed tickets cannot be resolved again." });
    }

    ticket.status = "resolved";
    ticket.resolution = resolution ? sanitizeString(resolution) : "Your issue has been resolved.";
    ticket.updatedAt = new Date().toISOString();
    ticket.history = ticket.history || [];
    ticket.history.push({
      status: "resolved",
      message: ticket.resolution,
      timestamp: ticket.updatedAt,
    });

    await writeDb(db);
    res.json({ message: "Ticket marked as resolved.", ticket });
  } catch (error) {
    console.error("Resolve ticket error:", error);
    res.status(500).json({ error: "Unable to resolve support ticket." });
  }
}

async function getTicketById(req, res) {
  try {
    const { id } = req.params;
    const db = await readDb();
    const ticket = (db.supportTickets || []).find((ticket) => String(ticket.id) === String(id));
    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found." });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch support ticket." });
  }
}

async function getActivity(req, res) {
  try {
    const db = await readDb();
    const users = db.users || [];
    const tickets = db.supportTickets || [];

    const events = [
      ...users.map((user) => ({
        id: `user-${user.id}`,
        type: "signup",
        title: "New user registered",
        description: `${user.name} joined from ${user.city}.`,
        createdAt: user.createdAt || new Date().toISOString(),
      })),
      ...tickets.map((ticket) => ({
        id: `ticket-${ticket.id}`,
        type: "support",
        title: "New support request",
        description: `${ticket.subject} submitted by ${ticket.username}.`,
        createdAt: ticket.createdAt,
      })),
    ];

    const sortedEvents = events
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(sortedEvents.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch activity." });
  }
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  resolveTicket,
  getActivity,
};