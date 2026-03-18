"use client";

import { useState } from "react";

export default function ContactSection() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    /* ====================================
       RECEIVING EMAIL ADDRESS (EDIT HERE)
    ==================================== */

    const receiverEmail = "hello@scripta.ai";   // <-- CHANGE THIS

    const subject = encodeURIComponent(
      `Scripta Inquiry from ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    const mailtoLink = `mailto:${receiverEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
  }

  return (
    <section id="contact" className="contact-section">

      {/* SECTION TITLE */}
      <h2 className="contact-title">
        CONTACT US
      </h2>

      {/* SUBTEXT */}
      <p className="contact-subtext">
        Have questions or feedback about Scripta? Send us a message and we will get back to you.
      </p>

      {/* FORM */}
      <form className="contact-form" onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Your Name"
          className="contact-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Your Email"
          className="contact-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          placeholder="Your Message"
          className="contact-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button type="submit" className="contact-button">
          SEND MESSAGE
        </button>

      </form>

    </section>
  );
}