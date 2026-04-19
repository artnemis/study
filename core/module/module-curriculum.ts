import type { ModuleSection, StudyModule } from "./module.types";

export function getDisplayCurriculum(
  studyModule: Pick<StudyModule, "id" | "name" | "description" | "curriculum">,
): ModuleSection[] {
  if (studyModule.curriculum.length > 0) {
    return studyModule.curriculum;
  }

  return [
    {
      id: `${studyModule.id}-section-1`,
      lessons: [
        {
          completed: false,
          content: studyModule.description,
          durationMinutes: 20,
          id: `${studyModule.id}-lesson-1`,
          title: `Core concepts in ${studyModule.name}`,
          type: "reading",
        },
        {
          completed: false,
          content: `Map the key definitions and principles behind ${studyModule.name}.`,
          durationMinutes: 18,
          id: `${studyModule.id}-lesson-2`,
          title: `Key terminology and mental models`,
          type: "video",
        },
        {
          completed: false,
          content: `Work through one guided example that uses the main ideas from ${studyModule.name}.`,
          durationMinutes: 25,
          id: `${studyModule.id}-lesson-3`,
          title: `Guided example`,
          type: "exercise",
        },
      ],
      order: 1,
      title: `${studyModule.name}: foundations`,
    },
    {
      id: `${studyModule.id}-section-2`,
      lessons: [
        {
          completed: false,
          content: `Summarise ${studyModule.name} in your own words and list the tricky parts.`,
          durationMinutes: 15,
          id: `${studyModule.id}-lesson-4`,
          title: `Active recall and summary`,
          type: "reading",
        },
        {
          completed: false,
          content: `Solve two independent practice tasks on ${studyModule.name}.`,
          durationMinutes: 30,
          id: `${studyModule.id}-lesson-5`,
          title: `Independent practice`,
          type: "exercise",
        },
        {
          completed: false,
          content: `Test mastery with a short quiz covering the main points of ${studyModule.name}.`,
          durationMinutes: 12,
          id: `${studyModule.id}-lesson-6`,
          title: `Checkpoint quiz`,
          type: "quiz",
        },
      ],
      order: 2,
      title: `${studyModule.name}: mastery`,
    },
  ];
}