-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "isMultiFile" BOOLEAN NOT NULL DEFAULT false,
    "templateFiles" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,
    "examples" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "boilerplateCode" TEXT NOT NULL DEFAULT '',
    "solutionTemplate" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Problem" ("boilerplateCode", "constraints", "createdAt", "description", "difficulty", "examples", "id", "isMultiFile", "solutionTemplate", "tags", "templateFiles", "testCases", "title", "updatedAt") SELECT "boilerplateCode", "constraints", "createdAt", "description", "difficulty", "examples", "id", "isMultiFile", "solutionTemplate", "tags", "templateFiles", "testCases", "title", "updatedAt" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
