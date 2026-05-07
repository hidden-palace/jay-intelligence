const crmStore = {
  transactions: [
    {
      id: "txn_001",
      name: "John Carter",
      stage: "Inspection Stage",
      closingDate: "May 18"
    },
    {
      id: "txn_002",
      name: "Emily Rodriguez",
      stage: "Attorney Review",
      closingDate: "TBD"
    },
    {
      id: "txn_003",
      name: "Michael Chen",
      stage: "Closing Scheduled",
      closingDate: "May 24"
    }
  ],
  tasks: [
    {
      id: "task_001",
      taskName: "Follow up inspection",
      dueDate: "May 7",
      status: "Open",
      contactName: "John Carter"
    },
    {
      id: "task_002",
      taskName: "Call seller",
      dueDate: "May 8",
      status: "Open",
      contactName: "Emily Rodriguez"
    }
  ],
  appointments: [
    {
      id: "appt_001",
      title: "Buyer Consultation",
      dateTime: "May 9, 10:00 AM"
    }
  ]
};

export function getTransactions() {
  return crmStore.transactions;
}

export function getTasks() {
  return crmStore.tasks;
}

export function getAppointments() {
  return crmStore.appointments;
}

export function createTask({ task_name, due_date, contact_name }) {
  const task = {
    id: `task_${Date.now()}`,
    taskName: task_name,
    dueDate: due_date,
    status: "Open",
    contactName: contact_name
  };

  crmStore.tasks.unshift(task);
  return task;
}
