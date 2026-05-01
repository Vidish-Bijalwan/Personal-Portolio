# 🚀 Vidish Bijalwan — AI/ML Portfolio

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-ff0055?style=for-the-badge&logo=framer)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)

**🌐 Live Site: [vidish-bijalwan.vercel.app](https://vidish-bijalwan.vercel.app)**

</div>

---

## 👨‍💻 About

A modern, premium AI/ML portfolio for **Vidish Bijalwan**, a Machine Learning and Data Science enthusiast specializing in production-ready predictive systems, computer vision, and analytical pipelines. Built with cutting-edge web technologies, featuring a custom Neural Network background animation and deployed on Vercel.

---

## ✨ Features

- **🧠 Neural Network Background** — Custom HTML5 Canvas animation simulating a deep learning model training in real-time (forward pass signal propagation across layered nodes)
- **🌗 Dark / Light Mode** — Seamless theme switching powered by `next-themes`
- **📸 Premium Profile Photos** — Glassmorphism hero frame with grayscale-to-color hover, 3D floating card on the about page
- **🎓 PESE600 Assessment Section** — Dedicated section for exam submissions including:
  - Live e-portfolio link
  - Handwritten essay (PDF) on *Remote Work – Future of Employment*
  - Recorded self-introduction video placeholder
- **📢 Assessment Banner** — Animated slide-down notification for evaluators visiting the site
- **⚡ Smooth Scroll Navigation** — Accessible keyboard & mouse navigation across all sections
- **📱 Fully Responsive** — Optimized for mobile, tablet, and desktop
- **🎞️ Framer Motion Animations** — Scroll-triggered transitions and micro-animations throughout
- **📬 Contact Form** — Functional contact section with form validation

---

## 🗂️ Sections

| Section | Description |
|---|---|
| **Hero** | Animated intro with profile photo, typewriter effect, and social links |
| **About** | Background, skills breakdown, education timeline |
| **Skills** | Visual skill showcase with progress bars |
| **Projects** | Filterable project cards with live demo and GitHub links |
| **Experience** | Work experience timeline |
| **Assessment** | PESE600 Sessional Assessment submission (essay + self-intro video) |
| **Contact** | Contact form + social links |

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **HTML5 Canvas** | Custom neural network background |
| **next-themes** | Dark/light mode |
| **Lucide React** | Icon library |
| **Radix UI** | Accessible headless UI components |
| **Vercel** | Hosting and deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Vidish-Bijalwan/Personal-Portolio.git
cd Personal-Portolio

# Install dependencies (use legacy-peer-deps due to date-fns peer conflict)
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx          # Main page composition
│   ├── layout.tsx        # Root layout with theme provider
│   └── globals.css       # Global styles
├── components/
│   ├── hero.tsx               # Hero section with profile photo
│   ├── about.tsx              # About section with 3D photo card
│   ├── skills.tsx             # Skills visualization
│   ├── projects.tsx           # Filterable projects grid
│   ├── experience.tsx         # Experience timeline
│   ├── assessment.tsx         # PESE600 assessment section
│   ├── assessment-banner.tsx  # Alert banner for evaluators
│   ├── particle-background.tsx # Neural network canvas animation
│   ├── contact.tsx            # Contact form
│   └── navbar.tsx             # Sticky navigation bar
├── public/
│   ├── profile.png            # Hero profile photo
│   ├── profile_photo.png      # About section photo
│   ├── essay.pdf              # PESE600 handwritten essay
│   └── vidish_resume6sem.pdf  # Resume PDF
└── utils/
    └── smooth-scroll.ts       # Custom smooth scroll utility
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Vidish-Bijalwan">Vidish Bijalwan</a>
</div>
