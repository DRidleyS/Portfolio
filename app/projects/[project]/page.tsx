import { projects } from "../../../lib/projects";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const projectData = projects.find(
    (p) => p.title.toLowerCase().replace(/\s+/g, "-") === project
  );

  if (!projectData) return notFound();

  return (
    <main className="max-w-4xl mx-auto pt-40 pb-16 px-4 min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center w-full">
        {/* Image Gallery */}
        <div className="flex-1 w-full md:w-1/2 flex flex-col gap-4 sticky top-32 z-10">
          {projectData.images && projectData.images.length > 0 ? (
            <div className="flex flex-col gap-4">
              <img
                src={projectData.images[0]}
                alt={projectData.title}
                className="rounded-lg shadow-lg w-full max-h-96 object-contain bg-neutral-900 border border-neutral-800"
              />
              {projectData.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pt-2">
                  {projectData.images.slice(1).map((img, idx) => (
                    <img
                      key={img}
                      src={img}
                      alt={projectData.title + " " + (idx + 2)}
                      className="w-24 h-20 object-cover rounded border border-neutral-800 bg-neutral-900 shadow-sm hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-500">
              No image available
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 w-full md:w-1/2 flex flex-col gap-6 items-center text-center">
          <h1 className="text-4xl font-extrabold mb-2 text-white leading-tight">
            {projectData.title}
          </h1>
          <div className="text-lg text-neutral-300 mb-2">
            {projectData.description}
          </div>
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {projectData.tech.map((tech) => (
              <span
                key={tech}
                className="bg-neutral-800 px-3 py-1 rounded-full text-xs font-semibold text-neutral-200 border border-neutral-700"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            {projectData.github && (
              <a
                href={projectData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition-colors"
              >
                GitHub
              </a>
            )}
            {projectData.demo && (
              <a
                href={projectData.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow transition-colors"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
