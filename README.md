# Why?

I play a Dnd campaign with a few friends. The current platform we use was not user friendly and caused alot of confusion on how to use the platform. This project was made to address a few of those problems and create a simpler, more intuitive character sheet. May or may not continue the project.

## PWA + iOS (Capacitor)

- PWA service worker is enabled in production builds via `next-pwa`.
- Build with webpack (required by `next-pwa` on Next 16):
  - `npm run build`
- iOS native shell commands:
  - `npm run cap:sync`
  - `npm run cap:add:ios` (first time only)
  - `npm run cap:open:ios`

### Local iOS dev against Next server

1. Start Next on your machine: `npm run dev`
2. Run Capacitor with server URL (simulator defaults to localhost):
   - `npm run cap:run:ios:dev`
   - Or set a custom URL for device testing:
     - `CAP_SERVER_URL=http://YOUR_LAN_IP:3000 npm run cap:run:ios:dev`
