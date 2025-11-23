# YSAG Website Content Editing Guide

This guide explains how to edit the content of the YSAG website without touching the HTML code. All editable content is stored in simple text files (JSON format) in the `content` folder.

## 📁 Content Structure

All editable content is located in the `content` folder:

```
content/
├── hero.json                 # Homepage hero section
├── about.json                # About section (mission, vision, team)
├── resources.json            # Academic resources and courses
├── recommendations.json      # Dr. recommendations
├── reports.json              # Student reports and stories
├── footer.json               # Footer information
└── images/                   # Team member photos and other images
    ├── team-member-1.svg
    ├── team-member-2.svg
    ├── team-member-3.svg
    └── team-member-4.svg
```

## 📝 How to Edit Content

### 1. Hero Section (`content/hero.json`)

This controls the main banner at the top of the homepage.

**What you can change:**
- Main title
- Description text
- Button text and links

**Example:**
```json
{
  "title": "Your New Title Here",
  "description": "Your new description here",
  "buttons": [
    {
      "text": "Button Text",
      "link": "#section-id",
      "isPrimary": true
    }
  ]
}
```

### 2. About Section (`content/about.json`)

This controls the "Who We Are" section including mission, vision, and team members.

**What you can change:**
- Pro tip text
- Vision, Mission, and What is YSAG descriptions
- Team member names, roles, and photos

**To add a new team member:**
1. Add their photo to `content/images/` (name it like `team-member-5.svg` or `.jpg`)
2. Add their information to the team array:
```json
{
  "name": "New Member Name",
  "role": "Their Role",
  "image": "content/images/team-member-5.jpg"
}
```

### 3. Academic Resources (`content/resources.json`)

This controls the courses/resources section.

**What you can change:**
- Section title and subtitle
- Each course's information (title, description, links)

**To add a new course:**
Add a new entry to the `courses` array:
```json
{
  "title": "New Course Name",
  "description": "Course description",
  "category": "category name for search",
  "icon": "fas fa-book",
  "color": "#FF5733",
  "filesLink": "https://drive.google.com/your-link",
  "videosLink": "",
  "videosMessage": "Videos coming soon!"
}
```

**Available icons:** Visit [Font Awesome](https://fontawesome.com/icons) to find icon codes.

**Color codes:** Use hex colors like `#FF5733` or color names like `blue`, `red`, etc.

### 4. Dr. Recommendations (`content/recommendations.json`)

This controls the recommendations section.

**To add a new recommendation:**
```json
{
  "text": "The recommendation text goes here",
  "author": "Dr. Name or Department"
}
```

### 5. Student Reports (`content/reports.json`)

This controls the blog/reports section.

**To add a new report:**
```json
{
  "day": "25",
  "month": "DEC",
  "title": "Report Title",
  "description": "Brief description of the report",
  "link": "#"
}
```

### 6. Footer (`content/footer.json`)

This controls the footer information and social media links.

**What you can change:**
- Organization name and location
- Social media links
- Copyright text

**To add a new social media link:**
```json
{
  "platform": "TikTok",
  "icon": "fab fa-tiktok",
  "url": "https://tiktok.com/@yourhandle"
}
```

## 🖼️ Managing Images

### Team Member Photos

1. **Prepare your image:**
   - Recommended size: 150x150 pixels (square)
   - Supported formats: JPG, PNG, SVG
   - Keep file sizes small (under 100KB if possible)

2. **Add the image:**
   - Place the image file in `content/images/`
   - Name it descriptively (e.g., `ahmed-alyemeni.jpg`)

3. **Update the team member entry:**
   ```json
   {
     "name": "Ahmed Al-Yemeni",
     "role": "President",
     "image": "content/images/ahmed-alyemeni.jpg"
   }
   ```

## ⚠️ Important Tips

1. **JSON Format Rules:**
   - Always use double quotes `"` not single quotes `'`
   - Don't forget commas between items
   - Last item in a list should NOT have a comma
   - Check your syntax using an online JSON validator if unsure

2. **Testing Your Changes:**
   - After editing, open `index.html` in a web browser
   - Refresh the page to see your changes
   - If something doesn't show up, check the browser console (F12) for errors

3. **Making Backups:**
   - Before making major changes, save a copy of the file
   - You can use Git to track changes and revert if needed

4. **Special Characters:**
   - To use quotes in your text, use `\"`
   - Example: `"text": "She said \"Hello\""`

## 🆘 Common Issues

### My changes don't appear
- Make sure you saved the file
- Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check that the JSON syntax is correct

### I see an error in the browser console
- Check for missing commas or quotes
- Use a JSON validator: https://jsonlint.com/
- Make sure all brackets and braces are matched

### Images don't show up
- Check the image path is correct
- Make sure the image file exists in `content/images/`
- Check that the file extension matches (.jpg, .png, .svg)

## 📧 Need Help?

If you encounter any issues or need assistance, please contact the IT Lead or create an issue in the repository.

---

**Last Updated:** November 2025
