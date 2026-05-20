# Student Mental Health Support App HCI Project

Project title: **CalmCampus: Student Mental Health Support App**

This folder contains a complete Human-Computer Interaction group project package for a university student mental health support app. It is organized to match the 6-week project timeline and the 40-mark grading criteria.

## Main Deliverables

- `final-report.md` - complete project report covering all weeks and grading criteria.
- `prototype/index.html` - clickable high-fidelity web prototype for live demo.
- `prototype/styles.css` - prototype visual design.
- `prototype/app.js` - prototype interaction logic.
- `presentation-outline.md` - 10-15 minute group presentation script and slide plan.
- `usability-testing-materials.md` - testing scripts, tasks, consent note, metrics, and findings.
- `wireframes-and-user-flow.md` - low-fidelity screen descriptions and user journeys.

## How To Demo

Open `prototype/index.html` in a browser. The prototype works as a static local file and does not need a server.

For loopback testing, run:

```bash
node serve-prototype.cjs
```

Then open `http://127.0.0.1:8765/`.

Recommended demo flow:

1. Complete the mood check-in.
2. View personalized self-care suggestions and complete an activity.
3. Book a counselor appointment and see it saved.
4. Open the anonymous support chat and send a message.
5. View progress to see saved check-ins, actions, and bookings.
6. Use the SOS quick help button.

## Functional Prototype Features

- Saves mood check-ins, private notes, and reason tags in browser `localStorage`.
- Tracks completed self-care actions and updates the dashboard/progress screens.
- Saves counselor bookings and allows cancelling confirmed appointments.
- Persists anonymous chat messages and returns simulated peer-support replies.
- Shows a 7-day mood trend based on saved check-ins.
- Includes a reset button for usability testing with a clean state.
