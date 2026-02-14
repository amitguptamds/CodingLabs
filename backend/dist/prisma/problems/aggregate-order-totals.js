"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateOrderTotals = void 0;
exports.aggregateOrderTotals = {
    id: 'aggregate-order-totals',
    title: 'Aggregate Order Totals',
    description: `Write a MongoDB <b>aggregation pipeline</b> to calculate the <b>total order amount</b> per customer.\n\nGroup all orders by <code>customer</code> and compute:\n• <code>totalAmount</code> — the sum of all <code>amount</code> values\n• <code>orderCount</code> — the number of orders\n\nRename the <code>_id</code> field to <code>customer</code> in the output using <code>$project</code>.\nSort the results by <code>totalAmount</code> in <b>descending</b> order.\n\nThe <b>orders</b> collection has the following document structure:\n• <code>_id</code> (Number) — unique identifier\n• <code>customer</code> (String) — customer name\n• <code>product</code> (String) — product purchased\n• <code>amount</code> (Number) — order amount in USD\n• <code>status</code> (String) — order status (completed, pending, cancelled)`,
    difficulty: 'Medium',
    tags: ['NoSQL', 'MongoDB', 'aggregate', '$group', '$sort', '$project'],
    isMultiFile: false,
    language: 'nosql',
    questionType: 'nosql',
    setupSQL: JSON.stringify([
        { _id: 1, customer: 'Alice', product: 'Laptop', amount: 250, status: 'completed' },
        { _id: 2, customer: 'Bob', product: 'Phone', amount: 180, status: 'completed' },
        { _id: 3, customer: 'Alice', product: 'Headphones', amount: 75, status: 'completed' },
        { _id: 4, customer: 'Charlie', product: 'Monitor', amount: 350, status: 'completed' },
        { _id: 5, customer: 'Diana', product: 'Keyboard', amount: 120, status: 'completed' },
        { _id: 6, customer: 'Bob', product: 'Mouse', amount: 180, status: 'pending' },
        { _id: 7, customer: 'Alice', product: 'Webcam', amount: 150, status: 'completed' },
        { _id: 8, customer: 'Charlie', product: 'USB Hub', amount: 160, status: 'completed' },
        { _id: 9, customer: 'Diana', product: 'Cable', amount: 100, status: 'cancelled' },
    ]),
    boilerplateCode: `// Write your aggregation pipeline below\n// Use db.aggregate(pipeline) where pipeline is an array of stages\n// Common stages: $match, $group, $sort, $project\n// Example: return db.aggregate([{ $group: { _id: "$field", total: { $sum: "$value" } } }]);\n\nreturn db.aggregate([\n  // Stage 1: Group by customer\n  {\n    $group: {\n      _id: "TODO",\n      totalAmount: { /* accumulator */ },\n      orderCount: { /* accumulator */ }\n    }\n  },\n  // Stage 2: Reshape output\n  // Stage 3: Sort\n]);`,
    solutionTemplate: '',
    templateFiles: [],
    testCases: [
        {
            id: 1,
            input: '{}',
            expectedOutput: JSON.stringify([
                { customer: 'Charlie', totalAmount: 510, orderCount: 2 },
                { customer: 'Alice', totalAmount: 475, orderCount: 3 },
                { customer: 'Bob', totalAmount: 360, orderCount: 2 },
                { customer: 'Diana', totalAmount: 220, orderCount: 2 },
            ]),
            isHidden: false,
        },
    ],
    examples: [
        {
            input: 'db.aggregate([{ $group: { _id: "$customer", totalAmount: { $sum: "$amount" }, orderCount: { $sum: 1 } } }, { $project: { _id: 0, customer: "$_id", totalAmount: 1, orderCount: 1 } }, { $sort: { totalAmount: -1 } }])',
            output: '[{ customer: "Charlie", totalAmount: 510, orderCount: 2 }, ...]',
            explanation: 'Groups orders by customer, sums amounts and counts orders, then sorts by total descending.',
        },
    ],
    constraints: [
        'Use a MongoDB aggregation pipeline',
        'Group orders by the customer field',
        'Compute totalAmount using $sum and orderCount using $sum: 1',
        'Rename _id to customer in the output using $project',
        'Sort by totalAmount in descending order',
    ],
};
//# sourceMappingURL=aggregate-order-totals.js.map