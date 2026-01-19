import ShiftLights from "@/components/ShiftLights";
import NeonLogo from "@/components/NeonLogo";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full px-6 py-20">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mt-30 mb-16">
          <ShiftLights count={7} className="mb-8 justify-center opacity-60" />
          <h1
            className="text-5xl font-bold mb-4 text-white"
            style={{
              textShadow:
                "0 0 12px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)",
            }}
          >
            About Me
          </h1>
          <p className="text-xl text-neutral-300">
            Performance-Driven Software Engineer
          </p>
        </div>

        {/* Content Section */}
        <div
          className="rounded-lg border-2 border-neutral-700 p-8 md:p-12 space-y-6"
          style={{
            backgroundColor: "rgba(23, 23, 23, 0.8)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Background</h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {/* Add your background story here */}
              I’m a full‑stack software engineer who approaches development the
              same way I approach performance cars: with precision, curiosity,
              and a deep respect for clean engineering. I didn’t come into tech
              through a traditional path — I built my foundation through
              hands‑on, project‑driven learning, constantly pushing myself to
              understand not just what works, but why it works. That mindset
              shaped me into an engineer who thrives on solving complex
              problems, refining systems, and building experiences that feel
              effortless on the surface and rock‑solid underneath.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Skills & Expertise
            </h2>
            <p className="text-lg text-neutral-300 leading-relaxed mb-4">
              {/* Add your skills description here */}
              My work lives at the intersection of frontend craftsmanship,
              full‑stack reliability, and high‑performance UI engineering. I
              specialize in React, Next.js, Node.js, and Python, and I’m fluent
              in designing interfaces that feel alive — from subtle
              micro‑interactions to full GSAP‑powered motion systems. I’m
              comfortable jumping into legacy codebases, architecting new
              systems from scratch, or collaborating across teams to ship
              polished, maintainable features. Whether I’m building automation
              pipelines, mobile apps, or premium UI experiences, I focus on
              clarity, scalability, and long‑term maintainability.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {/* Add your tech stack badges */}
              {[
                "React",
                "Next.js",
                "TypeScript",
                "Node.js",
                "Tailwind CSS",
                "GSAP",
                "PostgreSQL",
                "Git",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 text-sm text-neutral-200 rounded-full border border-neutral-600"
                  style={{
                    backgroundColor: "rgba(64, 64, 64, 0.6)",
                    boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              What I'm Working On
            </h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {/* Add current projects/interests here */}
              Right now, I’m deep into refining my animation and interaction
              design skills — exploring how motion can communicate intent, guide
              users, and elevate an interface from “functional” to “memorable.”
              I’m also building production‑ready tools and workflows that unify
              APIs, automation, and data pipelines into clean, reliable systems.
              Every project is an opportunity to tune, refine, and push the
              limits of what I can build.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Beyond Code</h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {/* Add personal interests here */}
              Outside of engineering, I’m drawn to anything that blends
              creativity with mechanics — automotive design, motion graphics,
              and the kind of UI that feels like it belongs in a cockpit. I love
              exploring new technologies, experimenting with design ideas, and
              working on side projects that challenge my thinking. Whether I’m
              sketching out a new interface, optimizing a workflow, or diving
              into a new framework, I’m always chasing that feeling of building
              something that just clicks.
            </p>
          </section>
        </div>

        {/* Bottom Shift Lights */}
        <ShiftLights count={5} className="mt-12 justify-center opacity-50" />

        {/* Neon Logo */}
        <NeonLogo size="md" className="mt-8" />
      </div>
    </div>
  );
}
