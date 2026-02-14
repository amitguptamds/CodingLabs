import { Problem } from '../../models/problem.model';

export const optimizeOrderQuery: Problem = {
    id: 'optimize-order-query',
    title: 'Optimize Order Query',
    description: `You are given a slow SQL query that uses a <b>correlated subquery</b> to find customer orders.\nRewrite it using a <code>JOIN</code> to achieve the same results more efficiently.\n\nThe current slow query is:\n<pre>SELECT o.id, o.total,\n  (SELECT c.name FROM customers c WHERE c.id = o.customer_id) AS customer_name\nFROM orders o\nWHERE o.total > 100</pre>\n\nRewrite this query using an <code>INNER JOIN</code> instead of a subquery.\nReturn: <code>id</code>, <code>total</code>, <code>customer_name</code> — ordered by <code>total DESC</code>.`,
    difficulty: 'Medium',
    tags: ['SQL', 'JOIN', 'Optimization', 'Performance'],
    isMultiFile: false,
    language: 'sql',
    questionType: 'sql',
    setupSQL: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total REAL NOT NULL,
  order_date TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
INSERT INTO customers VALUES (1, 'Acme Corp', 'acme@example.com');
INSERT INTO customers VALUES (2, 'Globex Inc', 'globex@example.com');
INSERT INTO customers VALUES (3, 'Initech', 'initech@example.com');
INSERT INTO customers VALUES (4, 'Umbrella Co', 'umbrella@example.com');
INSERT INTO orders VALUES (1, 1, 250.00, '2024-01-15');
INSERT INTO orders VALUES (2, 2, 89.50, '2024-01-16');
INSERT INTO orders VALUES (3, 1, 175.00, '2024-02-01');
INSERT INTO orders VALUES (4, 3, 320.00, '2024-02-10');
INSERT INTO orders VALUES (5, 4, 45.00, '2024-02-15');
INSERT INTO orders VALUES (6, 2, 150.00, '2024-03-01');
INSERT INTO orders VALUES (7, 3, 110.00, '2024-03-05');
INSERT INTO orders VALUES (8, 1, 95.00, '2024-03-10');`,
    boilerplateCode: `-- Rewrite the correlated subquery as a JOIN\n-- Return: id, total, customer_name\n-- Filter: total > 100\n-- Order by: total DESC\n\nSELECT `,
    solutionTemplate: '',
    testCases: [
        {
            id: 1,
            input: 'Orders with total > 100',
            expectedOutput: JSON.stringify([
                { id: 4, total: 320.0, customer_name: 'Initech' },
                { id: 1, total: 250.0, customer_name: 'Acme Corp' },
                { id: 3, total: 175.0, customer_name: 'Acme Corp' },
                { id: 6, total: 150.0, customer_name: 'Globex Inc' },
                { id: 7, total: 110.0, customer_name: 'Initech' },
            ]),
            isHidden: false,
        },
    ],
    examples: [
        {
            input: 'SELECT o.id, o.total, c.name AS customer_name FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE o.total > 100 ORDER BY o.total DESC',
            output: '5 rows: Order 4 ($320), Order 1 ($250), Order 3 ($175), Order 6 ($150), Order 7 ($110)',
            explanation: 'JOIN replaces the correlated subquery, same results but better performance.',
        },
    ],
    constraints: [
        'Must use an INNER JOIN (not a subquery)',
        'Column alias must be customer_name',
        'Return exactly 3 columns: id, total, customer_name',
        'Order results by total DESC',
    ],
};
