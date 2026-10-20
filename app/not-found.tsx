import { Metadata } from "next";
import css from "./NotFound.module.css";

export const metadata: Metadata = {
  title: "404 - Page Not Found | NoteHub",
  description: "This page does not exist or has been moved.",
  openGraph: {
    title: "404 - Page Not Found | NoteHub",
    description: "404 - Page Not Found | NoteHub",
    url: "https://notehub.com/",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub Open Graph Image",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <div>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}
