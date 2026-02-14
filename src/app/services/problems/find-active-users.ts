import { Problem } from '../../models/problem.model';

export const findActiveUsers: Problem = {
    id: 'find-active-users',
    title: 'Find Active Users',
    description: `Write a MongoDB query to find all <b>active</b> users who are older than <b>25</b>.

Return their <code>name</code>, <code>age</code>, and <code>city</code> fields only (exclude <code>_id</code>).

Sort the results by <code>name</code> in <b>ascending</b> order.

The <b>users</b> collection has the following document structure:
• <code>_id</code> (Number) — unique identifier
• <code>name</code> (String) — user's full name
• <code>age</code> (Number) — user's age
• <code>active</code> (Boolean) — whether the user is active
• <code>city</code> (String) — user's city of residence
• <code>score</code> (Number) — user's score`,
    difficulty: 'Easy',
    tags: ['NoSQL', 'MongoDB', 'find', '$gt', 'projection'],
    boilerplateCode: `// Write your MongoDB query below
// Use db.find(query, projection) to query the collection
// Chain .sort() for ordering and .toArray() to get results
// Example: return db.find({ field: value }, { _id: 0 }).sort({ name: 1 }).toArray();

return db.find(
  { /* your query here */ },
  { /* your projection here */ }
).toArray();`,
    testCases: [
        {
            id: 1,
            input: '{}',
            expectedOutput: JSON.stringify([
                { name: 'Alice Chen', age: 32, city: 'Seattle' },
                { name: 'Carol Smith', age: 28, city: 'Austin' },
                { name: 'Frank Lee', age: 45, city: 'Denver' },
                { name: 'Grace Kim', age: 29, city: 'Portland' },
            ]),
            isHidden: false,
        }
    ],
    examples: [
        {
            input: 'db.find({ active: true, age: { $gt: 25 } }, { _id: 0, name: 1, age: 1, city: 1 }).sort({ name: 1 }).toArray()',
            output: '[{ name: "Alice Chen", age: 32, city: "Seattle" }, ...]',
            explanation: 'Returns active users over 25, showing only name/age/city, sorted alphabetically by name.'
        }
    ],
    constraints: [
        'Use only standard MongoDB query syntax',
        'Return exactly three fields: name, age, city (exclude _id)',
        'Results must be sorted by name in ascending order',
        'Only return active users older than 25',
    ],
    language: 'nosql',
    questionType: 'nosql',
    setupSQL: JSON.stringify([
        { _id: 1, name: 'Alice Chen', age: 32, active: true, city: 'Seattle', score: 88 },
        { _id: 2, name: 'Bob Wilson', age: 24, active: true, city: 'Chicago', score: 72 },
        { _id: 3, name: 'Carol Smith', age: 28, active: true, city: 'Austin', score: 95 },
        { _id: 4, name: 'David Brown', age: 35, active: false, city: 'Miami', score: 60 },
        { _id: 5, name: 'Eve Taylor', age: 22, active: true, city: 'Boston', score: 81 },
        { _id: 6, name: 'Frank Lee', age: 45, active: true, city: 'Denver', score: 90 },
        { _id: 7, name: 'Grace Kim', age: 29, active: true, city: 'Portland', score: 77 },
        { _id: 8, name: 'Henry Park', age: 31, active: false, city: 'Dallas', score: 65 },
    ]),
    solutionTemplate: `return db.find(
  { active: true, age: { $gt: 25 } },
  { _id: 0, name: 1, age: 1, city: 1 }
).sort({ name: 1 }).toArray();`,
};
