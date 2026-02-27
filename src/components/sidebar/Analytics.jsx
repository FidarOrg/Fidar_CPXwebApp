import React from "react";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const tasks = [
    {
      id: 1,
      title: "Server outage - Payment API",
      priority: "Critical",
      status: "Pending",
      due: "27 Feb 2026",
      description:
        "Investigate and resolve the payment API server outage affecting live transactions. Coordinate with DevOps and backend teams to restore service and prevent future downtime.",
    },
    {
      id: 2,
      title: "Database backup verification",
      priority: "Critical",
      status: "In Progress",
      due: "28 Feb 2026",
      description:
        "Verify the integrity of recent database backups. Ensure disaster recovery compliance and confirm backup restoration works correctly in staging environment.",
    },
    {
      id: 3,
      title: "Client onboarding review",
      priority: "High",
      status: "Pending",
      due: "01 Mar 2026",
      description:
        "Review the onboarding documentation and workflow for new enterprise clients. Identify friction points and propose improvements for faster onboarding.",
    },
    {
      id: 4,
      title: "Prepare weekly performance report",
      priority: "High",
      status: "In Progress",
      due: "03 Mar 2026",
      description:
        "Compile weekly KPIs including revenue metrics, transaction success rate, and operational performance. Present findings to management team.",
    },
    {
      id: 5,
      title: "Update internal documentation",
      priority: "Low",
      status: "Completed",
      due: "05 Mar 2026",
      description:
        "Update internal technical documentation to reflect recent API changes and infrastructure upgrades. Ensure documentation is clear and up to date.",
    },
    {
      id: 6,
      title: "Team sync meeting preparation",
      priority: "Low",
      status: "Pending",
      due: "06 Mar 2026",
      description:
        "Prepare agenda and discussion points for the weekly team sync. Highlight blockers, upcoming releases, and performance insights.",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "";
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header type="employee" />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem="analytics" />
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto">

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                Task Insights & Descriptions
              </h1>
              <p className="text-muted-foreground mt-2">
                Detailed overview of all tasks assigned this week.
              </p>
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-card border shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {task.title}
                      </CardTitle>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Due: {task.due}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}