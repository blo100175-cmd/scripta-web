"use client";

export default function ScrollHomeButton() {

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button className="scroll-home" onClick={scrollTop}>
      ⌂
    </button>
  );
}