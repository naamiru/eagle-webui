import { describe, expect, it } from "vitest";
import { buildAggregateFolderCounts } from "./AppNavbar";
import type { Folder } from "@/data/types";

describe("buildAggregateFolderCounts", () => {
  it("sums descendant folder counts", () => {
    const folders: Folder[] = [
      createFolder({ id: "root", children: ["child"], itemCount: 2 }),
      createFolder({
        id: "child",
        parentId: "root",
        children: ["leaf"],
        itemCount: 3,
      }),
      createFolder({ id: "leaf", parentId: "child", itemCount: 5 }),
    ];

    const totals = buildAggregateFolderCounts(folders);
    expect(totals.get("leaf")).toBe(5);
    expect(totals.get("child")).toBe(8);
    expect(totals.get("root")).toBe(10);
  });

  it("ignores unknown child references", () => {
    const folders: Folder[] = [
      createFolder({ id: "root", children: ["missing"], itemCount: 4 }),
    ];

    const totals = buildAggregateFolderCounts(folders);
    expect(totals.get("root")).toBe(4);
  });
});

function createFolder(overrides: Partial<Folder> & { id: string }): Folder {
  const name = overrides.name ?? overrides.id;

  return {
    id: overrides.id,
    name,
    nameForSort: overrides.nameForSort ?? name,
    description: overrides.description ?? "",
    children: overrides.children ?? [],
    parentId: overrides.parentId,
    manualOrder: overrides.manualOrder ?? 0,
    itemCount: overrides.itemCount ?? 0,
    modificationTime: overrides.modificationTime ?? 0,
    tags: overrides.tags ?? [],
    password: overrides.password ?? "",
    passwordTips: overrides.passwordTips ?? "",
    coverId: overrides.coverId,
    orderBy: overrides.orderBy ?? "GLOBAL",
    sortIncrease: overrides.sortIncrease ?? true,
  };
}
