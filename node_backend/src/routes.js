const express = require('express');
const router = express.Router();
const { Event, Participant } = require('./models');

router.get('/stats', async (req, res) => {
    try {
        const total    = await Event.count();
        const upcoming = await Event.count({ where: { status: 'upcoming' } });
        const ongoing  = await Event.count({ where: { status: 'ongoing' } });
        const finished = await Event.count({ where: { status: 'finished' } });
        res.json({ total, upcoming, ongoing, finished });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const { status } = req.query; 
        const whereClause = {};
        
        if (status) {
            whereClause.status = status;
        }

        const events = await Event.findAll({ where: whereClause });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/events', async (req, res) => {
    try {
        res.status(201).json(await Event.create(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/events/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(await event.update(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/events/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        await event.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/participants/:id', async (req, res) => {
    try {
        const p = await Participant.findByPk(req.params.id);
        if (!p) return res.status(404).json({ error: 'Participant not found' });
        res.json(await p.update(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/participants/:id', async (req, res) => {
    try {
        const p = await Participant.findByPk(req.params.id);
        if (!p) return res.status(404).json({ error: 'Participant not found' });
        await p.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/participants', async (req, res) => {
    try {
        res.json(await Participant.findAll());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/participants', async (req, res) => {
    try {
        res.status(201).json(await Participant.create(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { eventId, participantId } = req.body;
        const event = await Event.findByPk(eventId);
        const participant = await Participant.findByPk(participantId);

        if (!event || !participant) {
            return res.status(404).json({ error: "Event or Participant not found" });
        }

        await event.addParticipant(participant);
        res.json({ message: "Inscription réussie" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;