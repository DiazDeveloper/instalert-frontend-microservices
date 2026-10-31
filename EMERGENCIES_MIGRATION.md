# Emergencies — local Sprint 2

Angular still calls Gateway on localhost:8080. Emergencies now runs independently on 8083 and derives ownership from Account sessions; the frontend never sends an owner ID.

Transport maps UUIDs, structured coordinates, paginated private history and ACTIVE/CANCELLED domain states to the existing presentation. All history pages are loaded. Creation retains its key and payload after an uncertain network failure, prevents double submission and refreshes browser coordinates for new requests. Cancellation restores its final state from the backend, and entering the view restores an existing active alert. Account changes clear local emergency state.

The panic button submits without an extra confirmation when location permission is already granted. Browser location permission remains necessary. Coordinates are not sent to a reverse-geocoding provider; obtaining a street name no longer delays creation. Invalid or unavailable location does not create a successful alert. Display no longer claims notification delivery to authorities or a hardcoded count of 14 users; accepted contacts now receive creation/cancellation notices in the persisted in-app inbox at /app/avisos. External authority/device delivery remains outside the local implementation.

Run `npm start`, open http://localhost:4200/login and enter with a real local account. Backend startup, Swagger, variables and limitations: backend `docs/EMERGENCIES_LOCAL.md`.

Validation: `npm run test:emergencies`, `npm run test:account`, `npm run build`. Real GPS requires a device/browser able to provide location; API samples do not prove GPS accuracy.

Local notices: open Avisos y contactos, invite another Account UUID via the directory, accept from that account, and create/cancel an emergency. The recipient inbox polls every three seconds and supports read acknowledgment and opt-out. Directory entries alone never authorize receipt. See backend docs/NOTIFICATIONS_LOCAL.md for setup and real recovery evidence.
