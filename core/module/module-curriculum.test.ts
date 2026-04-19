import { describe, expect, it } from "vitest";

import { getDisplayCurriculum } from "./module-curriculum";

describe("getDisplayCurriculum", () => {
  it("returns persisted curriculum when available", () => {
    const curriculum = [
      {
        id: "section-1",
        lessons: [
          {
            completed: false,
            content: "Custom content",
            durationMinutes: 10,
            id: "lesson-1",
            title: "Custom lesson",
            type: "reading" as const,
          },
        ],
        order: 1,
        title: "Custom section",
      },
    ];

    expect(
      getDisplayCurriculum({
        curriculum,
        description: "Description",
        id: "module-1",
        name: "Algorithms",
      }),
    ).toBe(curriculum);
  });

  it("builds a starter curriculum when the module has no sections", () => {
    const curriculum = getDisplayCurriculum({
      curriculum: [],
      description: "Sorting, searching and complexity analysis.",
      id: "module-1",
      name: "Algorithms",
    });

    expect(curriculum).toHaveLength(2);
    expect(curriculum[0]?.lessons).toHaveLength(3);
    expect(curriculum[1]?.lessons.at(-1)).toMatchObject({
      title: "Checkpoint quiz",
      type: "quiz",
    });
  });
});