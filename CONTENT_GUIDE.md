# YSAG Website Content Editing Guide

This guide explains how to edit the content of the YSAG website without touching the HTML code. All editable content is stored in simple text files (JSON format) inside the `content` folder.

## 🌐 The site is bilingual (English + Arabic)

Content is split into two language folders, **`en`** (English) and **`ar`** (Arabic), each holding the **same set of files with the same structure** — only the text is translated. A visitor switches language with the **English / العربية** button in the top bar. When Arabic is selected, the page automatically flips to right-to-left (RTL).

> ⚠️ **Most important rule:** whenever you add, remove, or re-order an item (a team member, a course, a button…), do the **exact same change in both `en/` and `ar/`**. The two folders must always have matching keys, and the `team` and `courses` lists should stay in the same order. If they drift apart, switching language will show missing or mismatched content.

The default language is English. The site loads `content/en/…` first and only loads `content/ar/…` when the user toggles to Arabic.

## 📁 Content Structure

```
content/
├── en/                     # English content
│   ├── hero.json           # Homepage hero/banner
│   ├── about.json          # Pro-tip, vision/mission, and team members
│   ├── resources.json      # E-Library & course cards
│   ├── footer.json         # Footer info + social links
│   └── ui.json             # Static interface text (nav, buttons, form labels)
├── ar/                     # Arabic content — same 5 files, Arabic text
│   ├── hero.json
│   ├── about.json
│   ├── resources.json
│   ├── footer.json
│   └── ui.json
└── images/                 # Photos, logos, backgrounds (.webp / .png)
```

> Note: `recommendations.json`, `reports.json`, and the old `team-member-*.svg` placeholders no longer exist — they were removed when the site moved to its current bilingual structure.

## 📝 How to Edit Content

> Reminder: every change below must be applied to **both** `content/en/<file>.json` **and** `content/ar/<file>.json`.

### 1. Hero Section (`hero.json`)

The main banner at the top of the homepage, including its rotating background images.

```json
{
  "title": "Knowledge Shared is Knowledge Doubled",
  "description": "Developing, consolidating, and disseminating knowledge among all students.",
  "backgroundImages": [
    {
      "desktop": "content/images/Class-1.webp",
      "mobile": "content/images/Class-1-potrait.webp"
    }
  ],
  "buttons": [
    {
      "text": "Explore Resources",
      "link": "#resources",
      "isPrimary": true,
      "icon": "fas fa-book-open"
    }
  ]
}
```

- **`backgroundImages`** — a slideshow. Each entry needs a `desktop` and a `mobile` (portrait) image. Add more entries to add more slides.
- **`buttons.link`** — use a section anchor like `#resources`, `#about`, or `#contribute`.
- **`buttons.icon`** — a [Font Awesome](https://fontawesome.com/icons) class.

### 2. About Section (`about.json`)

Controls the "Did you know?" pro-tip, the Vision/Mission/What-is-YSAG cards, and the team carousel.

```json
{
  "proTip": "YSAG is a non-profit committee entirely run by students to students.",
  "missionVision": [
    {
      "icon": "fas fa-eye",
      "title": "Our Vision",
      "description": "…"
    }
  ],
  "team": [
    {
      "name": "Zeyad Maresh",
      "role": "Leader",
      "image": "content/images/Zeyad-Maresh(Leader).webp"
    }
  ]
}
```

**To add a team member:**
1. Add their photo to `content/images/` (see the image tips below).
2. Add an entry to the `team` array in **both** `en/about.json` and `ar/about.json` (translate `name`/`role` for Arabic, keep the same `image`).

The team list scrolls automatically as an infinite carousel, so order matters — keep it identical between the two languages.

### 3. E-Library & Courses (`resources.json`)

Controls the searchable course cards. Each card can show up to three buttons: **Files** (Google Drive), **Group** (WhatsApp), and **Videos** (YouTube).

```json
{
  "title": "Academic Resources",
  "subtitle": "One stop for Files, Books, and Video Lectures.",
  "searchPlaceholder": "Search courses (e.g., Civil, CS, Math)...",
  "courses": [
    {
      "title": "Civil Engineering",
      "description": "Structures, Soil Mechanics, Concrete, and Surveying resources.",
      "category": "civil engineering",
      "icon": "fas fa-hard-hat",
      "color": "#e67e22",
      "filesLink": "https://drive.google.com/drive/folders/…",
      "whatsappLink": "https://chat.whatsapp.com/…",
      "playlists": [
        { "name": "Soil Mechanics", "url": "https://youtube.com/playlist?list=…" }
      ]
    }
  ]
}
```

**Course fields:**
| Field | Required | Purpose |
|-------|----------|---------|
| `title` | ✅ | Card heading |
| `description` | ✅ | Short blurb |
| `category` | ✅ | Lowercase keywords used by the search box (e.g. `"computer science engineering"`) |
| `icon` | ✅ | Font Awesome class shown in the colored header |
| `color` | ✅ | Hex color for the card header, e.g. `#3498db` |
| `filesLink` | optional | Google Drive link → shows the **Files** button. Omit/empty to hide it. |
| `whatsappLink` | optional | WhatsApp group link → shows the **Group** button. Omit/empty to hide it. |

**The Videos button follows this logic (use only one):**
1. If **`playlists`** is present (an array of `{ "name", "url" }`), the button opens a popup listing all playlists.
2. Else if **`videosLink`** is present, the button links straight to that URL.
3. Else the button is **disabled** and shows a message — `videosMessage` if you set one, otherwise it defaults to "Coming Soon" / "قريباً".

```json
{ "title": "Petroleum Engineering", "…": "…", "videosMessage": "Coming Soon" }
```

### 4. Footer (`footer.json`)

```json
{
  "organizationName": "YSAG",
  "fullName": "Yemeni Student Academic Group - ISS Yemen",
  "location": "Johor Bahru, Johor, Malaysia",
  "socialLinks": [
    { "platform": "YouTube", "icon": "fab fa-youtube", "url": "https://www.youtube.com/@YSAG-my" }
  ],
  "copyright": "2025 YSAG. Non-profit Educational Organization."
}
```

To add a social link, add an entry to `socialLinks` with a `platform`, a Font Awesome brand `icon` (e.g. `fab fa-tiktok`), and a `url`.

### 5. Interface Text (`ui.json`)

This file holds the **static labels** that aren't tied to a specific content card — the navigation menu, the Volunteer section, the Contact/Feedback section, and the form labels. It's grouped into sections: `nav`, `team`, `volunteer`, `contact`, and `form`.

```json
{
  "nav": { "home": "Home", "about": "About", "resources": "E-Library & Courses" },
  "volunteer": { "title": "Volunteer & Contribute", "btnUpload": "Upload Materials" },
  "form": {
    "emailLabel": "Your Email",
    "topicOptions": { "general": "General Inquiry", "bug": "Report Technical Issue" }
  }
}
```

- Keep the **keys exactly the same** in `en` and `ar`; only translate the values.
- A few values intentionally contain HTML tags (e.g. `<strong>…</strong>` in `volunteer.desc`). That's fine — keep the tags and translate the text around them.

## 🖼️ Managing Images

All images live in `content/images/`.

**Team photos** (referenced from `about.json`):
- Roughly square works best (they're shown as circular avatars).
- **`.webp`** is preferred (smaller files); `.jpg`/`.png` also work.
- Keep files reasonably small (aim for well under ~200 KB).
- Use descriptive names, e.g. `Zeyad-Maresh(Leader).webp`.

**Hero background images** (referenced from `hero.json`): provide both a wide `desktop` version and a portrait `mobile` version for each slide.

> **Branding & SEO images** — `favicon.ico` (site root), plus `favicon-96x96.png`, `favicon-48x48.png`, `apple-touch-icon.png`, `og-banner.png`, and `YSAGLogo.png` (all in `content/images/`) — are wired into `index.html`, **not** through these JSON files. If you replace the logo, regenerate that set and keep the filenames the same so the existing references keep working.

## ⚠️ Important Tips

1. **JSON format rules:**
   - Use double quotes `"`, never single quotes `'`.
   - Put a comma between items, but **no comma after the last item** in a list or object.
   - Validate with [jsonlint.com](https://jsonlint.com/) if unsure.

2. **Keep both languages in sync** — same files, same keys, same item order in `en/` and `ar/`.

3. **Special characters:** to use a quote inside text, escape it as `\"` — e.g. `"text": "She said \"Hello\""`.

4. **Testing your changes:** refresh the page (Ctrl+F5 / Cmd+Shift+R), then **toggle the language** to confirm both versions look right. If something is missing, open the browser console (F12) for errors.

## 🆘 Common Issues

### My changes don't appear
- Make sure you saved the file and hard-refreshed (Ctrl+F5 / Cmd+Shift+R).
- Confirm you edited the file in the **correct language folder**.
- Check the JSON syntax (a stray or missing comma will break the whole file).

### Content is missing only in one language
- You almost certainly edited `en/` but not `ar/` (or vice-versa). Mirror the change.

### A course's Videos button doesn't work as expected
- Remember the priority: `playlists` → `videosLink` → disabled `videosMessage`. If you set `playlists`, `videosLink` is ignored.

### Images don't show up
- Check the path matches exactly, including the folder (`content/images/…`) and the file extension (`.webp`, `.png`, `.jpg`).
- Confirm the file actually exists in `content/images/`.

## 📧 Need Help?

If you run into issues, contact the IT Lead or open an issue in the repository.

---

**Last Updated:** June 2026
