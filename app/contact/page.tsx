"use client";

import { useState, FormEvent } from "react";
import ShiftLights from "@/components/ShiftLights";
import NeonLogo from "@/components/NeonLogo";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_u7s21h9";
const TEMPLATE_ID = "template_xqjtocw";
const PUBLIC_KEY = "S_Ih5vNRt-Hnjc9N1";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        PUBLIC_KEY
      );
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <ShiftLights count={7} className="mb-8 justify-center opacity-60" />
          <h1
            className="text-5xl font-bold mb-4 text-white"
            style={{
              textShadow:
                "0 0 12px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)",
            }}
          >
            Get In Touch
          </h1>
          <p className="text-lg text-neutral-300">
            Let's discuss your next project or opportunity
          </p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border-2 border-neutral-700 p-8"
          style={{
            backgroundColor: "rgba(23, 23, 23, 0.8)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Name Field */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-neutral-200 font-semibold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded bg-neutral-900 border border-neutral-700 text-white focus:border-red-500 focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-neutral-200 font-semibold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded bg-neutral-900 border border-neutral-700 text-white focus:border-red-500 focus:outline-none transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-neutral-200 font-semibold mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 py-3 rounded bg-neutral-900 border border-neutral-700 text-white focus:border-red-500 focus:outline-none transition-colors resize-none"
              placeholder="Tell me about your project, or why you want me on your team..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: "0 0 10px rgba(220, 38, 38, 0.4)",
            }}
          >
            {status === "sending"
              ? "Sending..."
              : status === "success"
              ? "Message Sent!"
              : status === "error"
              ? "Error - Try Again"
              : "Send Message"}
          </button>

          {/* Status Messages */}
          {status === "success" && (
            <p className="mt-4 text-green-400 text-center">
              Thanks for reaching out! I'll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-red-400 text-center">
              Something went wrong. Please try again or email me directly.
            </p>
          )}
        </form>

        {/* Bottom Shift Lights */}
        <ShiftLights count={5} className="mt-8 justify-center opacity-50" />

        {/* Neon Logo */}
        <NeonLogo size="md" className="mt-8" />
      </div>
    </div>
  );
}
