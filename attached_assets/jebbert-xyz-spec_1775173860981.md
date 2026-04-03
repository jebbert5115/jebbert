# jebbert.xyz — Full Design & Feature Spec
> Give this entire document to Replit Agent to start building.

---

## 🎯 Project Overview

Build a personal website for **jebbert.xyz** — a quirky, maximalist, retro-internet personal hub. The site should feel like a weird, lovingly handcrafted corner of the internet. Think early 2000s web energy meets modern interactivity. Chaotic but intentional. Fun but personal.

**Stack:** HTML + CSS + Vanilla JavaScript (no frameworks — keep it simple and portable)
**Hosting target:** GitHub Pages (so everything must be static — no backend, no server-side code)

---

## 🎨 Visual Design Direction

### Aesthetic
- **Vibe:** Retro-internet maximalism. Think Myspace-era personal pages but polished. Loud, colorful, full of personality.
- **NOT:** Clean minimalism, generic bootstrap, boring white backgrounds.

### Color Palette
```
--bg:           #0a0a0f        /* near-black background */
--surface:      #12121a        /* card/panel background */
--border:       #2a2a3d        /* subtle borders */
--accent-1:     #7c3aed        /* purple — primary accent */
--accent-2:     #06b6d4        /* cyan — secondary accent */
--accent-3:     #f59e0b        /* amber — highlight */
--text:         #e2e8f0        /* primary text */
--text-muted:   #64748b        /* muted text */
```

### Typography
- **Display font:** `"Press Start 2P"` from Google Fonts — pixelated, retro, memorable
- **Body font:** `"DM Mono"` from Google Fonts — clean monospace with personality
- **Accent font:** `"Orbitron"` from Google Fonts — for status labels and badges

### Effects & Atmosphere
- Subtle scanline overlay across the whole page (CSS pseudo-element)
- Faint grid/dot pattern on background
- Glowing borders on hover (box-shadow with accent colors)
- Custom cursor — a small crosshair or pixel cursor
- Text glitch animation on the main title (CSS keyframes)
- Neon glow on active/highlighted elements

---

## 📁 File Structure

```
jebbert.xyz/
├── index.html          ← Homepage / Profile hub
├── games.html          ← Mini games page
├── extras.html         ← Useless features & fun tools
├── secret.html         ← Hidden easter egg page
├── css/
│   ├── main.css        ← Global styles, variables, typography
│   ├── animations.css  ← All keyframe animations
│   └── components.css  ← Reusable card/badge/button styles
├── js/
│   ├── lanyard.js      ← Discord/Spotify presence fetching
│   ├── games/
│   │   ├── snake.js
│   │   ├── clicker.js
│   │   └── memory.js
│   └── extras/
│       ├── compliments.js
│       ├── terminal.js
│       └── konami.js   ← Easter egg trigger
└── assets/
    ├── favicon.ico
    └── sounds/
        ├── pop.mp3
        ├── error.mp3
        └── success.mp3
```

---

## 📄 Page 1: Homepage (index.html)

The main profile hub. This is the face of the site.

### Layout
Split into a left sidebar and right content area on desktop. Stacks vertically on mobile.

### Left Sidebar — Profile Card
- **Animated avatar** pulled from Discord via Lanyard API
  - Avatar URL format: `https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.gif`
  - User ID: `751276412308291634`
  - Add a glowing ring around avatar that changes color based on Discord status
- **Display name:** Jebbert (with glitch text animation)
- **Username:** jebbert5115
- **Guild badge:** Show "BOOT" tag as a styled badge
- **Discord status indicator:**
  - 🟢 Online → green glow
  - 🟡 Idle → yellow glow
  - 🔴 DND → red glow
  - ⚫ Offline → grey
- **Custom status message** pulled live from Lanyard (e.g. "Where are you, boot?")
- **Links/buttons:**
  - GitHub
  - Discord (link to profile or server)
  - Any other socials

### Right Content Area — Sections

#### 1. Now Playing (Spotify)
Pull live from Lanyard API. Show:
- Album art (from `spotify.album_art_url`)
- Song name (`spotify.song`)
- Artist (`spotify.artist`)
- Animated progress bar (calculate from `timestamps.start` and `timestamps.end`)
- Subtle pulsing animation when active
- If not listening: show "not listening to anything" in muted text

Lanyard API endpoint:
```
GET https://api.lanyard.rest/v1/users/751276412308291634
```

Full Lanyard response shape (relevant fields):
```json
{
  "data": {
    "discord_status": "dnd",           // online | idle | dnd | offline
    "discord_user": {
      "id": "751276412308291634",
      "username": "jebbert5115",
      "display_name": "Jebbert",
      "avatar": "a_24e9a71343bdaba35bf565e50286a823",
      "global_name": "Jebbert"
    },
    "activities": [...],               // array of activities
    "listening_to_spotify": true,
    "spotify": {
      "song": "Always",
      "artist": "blink-182",
      "album": "blink-182",
      "album_art_url": "https://i.scdn.co/image/ab67616d0000b2730a4ae12eb3a9fb7e3815001c",
      "timestamps": {
        "start": 1775173093177,        // ms epoch
        "end": 1775173345070           // ms epoch
      },
      "track_id": "1JfNuvdAIqI3ggkzXuBvPp"
    },
    "active_on_discord_desktop": true,
    "active_on_discord_mobile": false
  }
}
```

Poll the API every **30 seconds** to keep presence fresh. No websocket needed.

#### 2. About Me
A short handwritten-style blurb section. Static text, styled nicely. Include:
- A few sentences about yourself
- A "currently obsessed with" line you can update manually

#### 3. Currently
A simple card with manually updated fields:
- 🎮 Playing: [game]
- 📺 Watching: [show]
- 📖 Reading: [book/article]
- 🎵 Favorite song rn: [song] (separate from live Spotify)

#### 4. Favorites Tier List
A static visual tier list with absurd categories. Example:
- **Tier list: Types of loading screens**
- S tier, A tier, B tier, C tier, F tier
- Style it like a real tier list with colored rows

#### 5. Navigation Bar
Sticky top nav with links to:
- Home
- Games
- Extras
- (secret page NOT linked — only reachable via easter egg)

---

## 📄 Page 2: Games (games.html)

A collection of playable mini games. Each game lives in its own card/panel.

### Game 1: Snake
Classic snake game. Use arrow keys or WASD. Show high score (save to localStorage). Retro pixelated look using a canvas element.

### Game 2: The Clicker
Click a big button as many times as possible. Show total clicks. Add absurd milestones:
- 10 clicks: "ok"
- 100 clicks: "why"
- 1000 clicks: "please stop"
- 10000 clicks: "you need help"
Save click count to localStorage so it persists between visits.

### Game 3: Memory Card Flip
A grid of face-down cards. Flip two at a time to find matching pairs. Track time and moves. Show a win screen with a silly message.

### Game 4: Don't Click The Red Button
A game where a red button dares you not to click it. If you click it... something silly happens (sound effect + dramatic fake error screen). Has a timer for how long you lasted.

---

## 📄 Page 3: Extras (extras.html)

A collection of useless but delightful features.

### Feature 1: The Useless Button
A large, serious-looking button labeled "DO NOT PRESS." When clicked, it does absolutely nothing. But the label changes each time to something increasingly dramatic:
- "I said don't."
- "That's strike two."
- "You were warned."
- "Fine. Nothing happened. Happy?"

### Feature 2: Compliment Generator
A button that generates a random genuine compliment. Pull from an array of 30+ compliments. New one every click. Add a little confetti burst on click.

### Feature 3: Excuse Generator
Generate a random excuse for being late, not doing homework, missing a message, etc. Absurd and funny. Array of 30+ excuses.

### Feature 4: Fake Hacker Terminal
A text area that looks like a terminal. When you type anything and hit enter, it responds with dramatic fake hacking output:
- "Accessing mainframe..."
- "Bypassing firewall..."
- "Downloading the internet..."
- "ERROR: too cool to hack"
Add a typing sound effect.

### Feature 5: Vibe Checker
A button labeled "Check Your Vibe." It asks you 3 quick silly questions (multiple choice), then gives you a completely unrelated vibe result regardless of your answers. Results like "Chaotic Neutral Frog Energy" or "Main Character but Make it Monday."

### Feature 6: The Button That Runs Away
A button labeled "Click Me." When you hover over it, it moves to a random position on the screen. If you somehow click it, confetti + a congratulations message.

### Feature 7: Sound Board
A small grid of buttons that each play a different silly sound effect. Label them dramatically. Examples: "THE BELL," "VINE BOOM," "BRUH," "WINDOWS ERROR," "ACHIEVEMENT UNLOCKED."

---

## 🥚 Secret Page (secret.html)

Not linked anywhere. Only reachable two ways:

### Trigger 1: Konami Code
Type ↑ ↑ ↓ ↓ ← → ← → B A on any page → redirect to `/secret.html`

### Trigger 2: Hidden Link
Somewhere on the homepage, hide a tiny near-invisible clickable element (1px, or blended into background). Clicking it goes to `/secret.html`.

### What's on the secret page
- Big ASCII art header: "YOU FOUND IT"
- A dramatic message congratulating them
- A fun little reward: a rare compliment, a secret tier list, or a mini exclusive game
- A counter showing "You are visitor #[X]" — use localStorage to fake this (increment each time the page loads, store in localStorage)
- A button to go back that says "forget you were ever here"

---

## ⚙️ Technical Requirements

### Lanyard API Integration (js/lanyard.js)
```javascript
const USER_ID = '751276412308291634';
const LANYARD_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;

async function fetchPresence() {
  const res = await fetch(LANYARD_URL);
  const data = await res.json();
  return data.data;
}

// Poll every 30 seconds
fetchPresence().then(updateUI);
setInterval(() => fetchPresence().then(updateUI), 30000);
```

### Spotify Progress Bar
Calculate progress from timestamps:
```javascript
function getSpotifyProgress(timestamps) {
  const now = Date.now();
  const duration = timestamps.end - timestamps.start;
  const elapsed = now - timestamps.start;
  return Math.min((elapsed / duration) * 100, 100);
}
// Update progress bar every second with setInterval
```

### Avatar URL
```javascript
// Animated GIF avatar (starts with a_)
const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`;
// Fallback to PNG if not animated
const avatarFallback = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
```

### LocalStorage Usage (no backend needed)
```javascript
// Snake high score
localStorage.setItem('snake_highscore', score);
localStorage.getItem('snake_highscore');

// Clicker count
localStorage.setItem('click_count', count);

// Secret page visitor counter (fake but fun)
let visits = parseInt(localStorage.getItem('secret_visits') || '0') + 1;
localStorage.setItem('secret_visits', visits);
```

### Konami Code Listener
```javascript
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
  if (e.key === KONAMI[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === KONAMI.length) {
      window.location.href = '/secret.html';
    }
  } else {
    konamiIndex = 0;
  }
});
```

---

## 📱 Responsive Design

- Desktop: sidebar + content layout
- Tablet: stacked, full width cards
- Mobile: single column, touch-friendly game controls for Snake (add on-screen arrow buttons)

---

## 🚀 Build Order for Replit Agent

Tell Replit Agent to build in this order to avoid getting overwhelmed:

1. **Global styles** — CSS variables, fonts, background, scanline effect, nav bar
2. **Homepage layout** — sidebar + content area skeleton
3. **Lanyard integration** — fetch API, render avatar, status, custom status
4. **Spotify card** — album art, song name, progress bar
5. **About / Currently / Tier List sections**
6. **Games page** — Snake first, then Clicker, then Memory, then Red Button
7. **Extras page** — Useless Button, Compliment Generator, Excuse Generator, Terminal, others
8. **Secret page** — Konami code trigger, hidden link, secret page content
9. **Polish** — animations, sound effects, cursor, mobile responsiveness

---

## 💬 Suggested Replit Agent Starter Prompt

> Build me a personal website called jebbert.xyz. Use the full spec in this document. Start with step 1: set up the global CSS with the exact color palette, fonts (Press Start 2P, DM Mono, Orbitron from Google Fonts), a dark background with a subtle scanline overlay and dot grid pattern, and a sticky nav bar linking to Home, Games, and Extras. Then build the homepage layout with a left sidebar and right content area. Don't add content yet — just get the structure and styles right first. Keep all CSS in separate files as described in the file structure. Make it look incredible.

Then for each subsequent step, paste the relevant section of this spec to Replit Agent one step at a time.
