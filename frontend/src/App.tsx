import React, { useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { TasksPage } from "./pages/TasksPage";
import { AIPlannerPage } from "./pages/AIPlannerPage";
import { TimetablePage } from "./pages/TimetablePage";
import { CalendarPage } from "./pages/CalendarPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TaskModal } from "./components/TaskModal";
import { api } from "./services/api";
import { Task } from "./types";

export function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await api.tasks.create(taskData);
  };

  if (currentTab === "landing") {
    return (
      <LandingPage
        onEnterApp={(targetTab) => setCurrentTab(targetTab || "dashboard")}
      />
    );
  }

  const renderActivePage = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentTab} />;
      case "tasks":
        return <TasksPage />;
      case "planner":
        return <AIPlannerPage onNavigateTimetable={() => setCurrentTab("timetable")} />;
      case "timetable":
        return <TimetablePage />;
      case "calendar":
        return <CalendarPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
    >
      {renderActivePage()}

      {/* Global Quick Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </AppLayout>
  );
}

export default App;
