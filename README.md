# Pixel Resenha

Um joguinho em pixel art para ficar de resenha com a galera: cria uma sala, monta o personagem, anda pelo mapa e conversa por chat ou voz.

**[Jogar agora](https://pixelresenha.vercel.app)**

- Salas multiplayer em tempo real, com editor de sala
- Editor de personagem
- Chat de texto e chat de voz
- Funciona no celular, com joystick virtual

Feito com Next.js e TypeScript. O tempo real roda num servidor Socket.IO separado, a voz usa WebRTC e os dados ficam no PostgreSQL (Neon).

## Rodar local

```bash
cp .env.example .env.local   # preencha DATABASE_URL e as URLs
npm install
npm run dev
```

O servidor de tempo real fica em `server/` e roda à parte.
