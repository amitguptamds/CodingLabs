import { Problem } from '../../models/problem.model';

export const selectEmployeesHighSalary: Problem = {
    id: 'select-employees-high-salary',
    title: 'High Salary Employees',
    description: `Write a SQL query to find all employees who earn more than <code>50000</code>.\nReturn their <code>name</code>, <code>department</code>, and <code>salary</code>, ordered by salary in <b>descending</b> order.\n\nThe <b>employees</b> table has the following structure:\n• <code>id</code> (INTEGER) — primary key\n• <code>name</code> (TEXT) — employee name\n• <code>department</code> (TEXT) — department name\n• <code>salary</code> (INTEGER) — annual salary\n• <code>hire_date</code> (TEXT) — date hired`,
    difficulty: 'Easy',
    tags: ['SQL', 'SELECT', 'WHERE', 'ORDER BY'],
    isMultiFile: false,
    language: 'sql',
    questionType: 'sql',
    setupSQL: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL
);
INSERT INTO employees VALUES (1, 'Alice Johnson', 'Engineering', 95000, '2021-03-15');
INSERT INTO employees VALUES (2, 'Bob Smith', 'Marketing', 45000, '2022-06-01');
INSERT INTO employees VALUES (3, 'Carol White', 'Engineering', 105000, '2019-11-20');
INSERT INTO employees VALUES (4, 'David Brown', 'Sales', 52000, '2023-01-10');
INSERT INTO employees VALUES (5, 'Eve Davis', 'Engineering', 88000, '2020-07-22');
INSERT INTO employees VALUES (6, 'Frank Miller', 'HR', 48000, '2022-09-05');
INSERT INTO employees VALUES (7, 'Grace Lee', 'Sales', 67000, '2021-04-18');
INSERT INTO employees VALUES (8, 'Henry Wilson', 'Marketing', 51000, '2023-08-12');`,
    boilerplateCode: `-- Write your SQL query below\n-- Find employees earning more than 50000\n-- Return: name, department, salary\n-- Order by salary DESC\n\nSELECT `,
    solutionTemplate: '',
    testCases: [
        {
            id: 1,
            input: 'Full employees table',
            expectedOutput: JSON.stringify([
                { name: 'Carol White', department: 'Engineering', salary: 105000 },
                { name: 'Alice Johnson', department: 'Engineering', salary: 95000 },
                { name: 'Eve Davis', department: 'Engineering', salary: 88000 },
                { name: 'Grace Lee', department: 'Sales', salary: 67000 },
                { name: 'David Brown', department: 'Sales', salary: 52000 },
                { name: 'Henry Wilson', department: 'Marketing', salary: 51000 },
            ]),
            isHidden: false,
        },
    ],
    examples: [
        {
            input: 'SELECT name, department, salary FROM employees WHERE salary > 50000 ORDER BY salary DESC',
            output: '6 rows: Carol White (105000), Alice Johnson (95000), Eve Davis (88000), Grace Lee (67000), David Brown (52000), Henry Wilson (51000)',
            explanation: 'Returns all employees with salary > 50000 sorted by salary descending',
        },
    ],
    constraints: [
        'Use only standard SQL syntax',
        'Return exactly three columns: name, department, salary',
        'Results must be ordered by salary in descending order',
    ],
};
