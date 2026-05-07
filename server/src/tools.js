import {
  createTask,
  getAppointments,
  getTasks,
  getTransactions
} from "./mockCrm.js";

export const crmTools = [
  {
    type: "function",
    function: {
      name: "get_transactions",
      description:
        "Fetch active real estate transactions with client name, stage, and closing date.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tasks",
      description:
        "Fetch open CRM tasks with task name, due date, status, and contact name.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_appointments",
      description: "Fetch upcoming appointments with title and date/time.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new real estate CRM follow-up task.",
      parameters: {
        type: "object",
        properties: {
          task_name: {
            type: "string",
            description: "Short name for the task."
          },
          due_date: {
            type: "string",
            description: "Human-readable due date, such as May 10 or 2026-05-10."
          },
          contact_name: {
            type: "string",
            description: "Name of the contact the task belongs to."
          }
        },
        required: ["task_name", "due_date", "contact_name"],
        additionalProperties: false
      }
    }
  }
];

export function executeCrmTool(name, args = {}) {
  switch (name) {
    case "get_transactions":
      return { transactions: getTransactions() };
    case "get_tasks":
      return { tasks: getTasks() };
    case "get_appointments":
      return { appointments: getAppointments() };
    case "create_task":
      return { task: createTask(args) };
    default:
      throw new Error(`Unknown CRM tool: ${name}`);
  }
}
