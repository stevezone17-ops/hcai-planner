import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Lock,
  Edit3,
  RefreshCw,
  Sliders,
  ChevronRight,
  Check,
  Zap,
  Play
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AdaptiveNetwork3D } from "../components/3d/AdaptiveNetwork3D";

interface LandingPageProps {
  onEnterApp: (targetTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  // Interactive demo state on landing page
  const [demoState, setDemoState] = useState<"initial" | "conflict" | "replanned">("initial");

  const handleSimulateConflict = () => {
    setDemoState("conflict");
    setTimeout(() => {
      setDemoState("replanned");
    }, 900);
  };

  const handleResetDemo = () => {
    setDemoState("initial");
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-subtle">
              H
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">HCAI Planner</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#interactive-demo" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Interactive Demo</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Trust Principles</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEnterApp("dashboard")}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Workspace
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Human-in-the-Loop AI Scheduling</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Plan less. <br />
                <span className="text-[#5B5CE2] dark:text-[#818cf8]">
                  Accomplish more.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed pt-2">
                AI proposes the schedule. You stay in control. Enforces hard availability constraints, optimizes soft preferences, and adapts to your real-world habits.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onEnterApp("planner")}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Build My Schedule
              </Button>
              <a
                href="#interactive-demo"
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-subtle"
              >
                See How It Works
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4">
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white block">100%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Deterministic Uptime</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">83.3%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">HITL Approval Rate</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#5B5CE2] dark:text-[#818cf8] block">Zero</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Silent Overrides</span>
              </div>
            </div>
          </div>

          {/* Hero Right 3D Spatial Canvas */}
          <div className="relative rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2 shadow-card">
            <AdaptiveNetwork3D />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Core Loop</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">How HCAI Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A feedback-driven cycle where artificial intelligence assists candidate generation while humans retain absolute authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-200 dark:border-indigo-800">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Proposes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Considers your availability, hard deadlines, durations, and priorities to generate an initial timetable.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-200 dark:border-indigo-800">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">You Review</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Transparent "Why this time?" explanations let you inspect exact reasons for each slot placement.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-200 dark:border-amber-800">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">You Decide</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Accept recommendations, drag-and-drop to adjust timings, reject slots, or lock critical tasks as immutable.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Planner Adapts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Learned preferences update behavioral biases so future timetables reflect your real working rhythms.
            </p>
          </Card>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="interactive-demo" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Interactive Simulation</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Experience Human-in-the-Loop Replanning</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See how the engine preserves your 🔒 Locked decisions when sudden unavailability occurs.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Scenario: Today's Schedule</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Task 1 is locked. An unexpected 14:00 - 17:00 meeting arises.</p>
            </div>
            <div className="flex items-center gap-2">
              {demoState === "initial" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSimulateConflict}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Simulate Conflict (14:00 - 17:00)
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetDemo}
                >
                  Reset Demo
                </Button>
              )}
            </div>
          </div>

          {/* Schedule slots display */}
          <div className="space-y-3">
            {/* Slot 1: Locked */}
            <div className="p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/40 flex items-center justify-between shadow-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> Locked Constraint
                  </span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">09:00 – 11:00</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Presentation Preparation</h4>
              </div>
              <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Preserved</span>
            </div>

            {/* Slot 2: Displaced during conflict */}
            <div
              className={`p-3.5 rounded-xl border transition-all duration-300 shadow-subtle ${
                demoState === "conflict"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500 animate-pulse"
                  : demoState === "replanned"
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40"
                  : "bg-slate-50/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        demoState === "replanned"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300"
                      }`}
                    >
                      {demoState === "replanned" ? "Modified by Replan" : "AI Suggested"}
                    </span>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {demoState === "replanned" ? (
                        <>
                          <span className="line-through text-rose-500 mr-1.5">14:00 – 15:30</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">17:30 – 19:00</span>
                        </>
                      ) : (
                        "14:00 – 15:30"
                      )}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Network Security Assignment</h4>
                </div>

                <div className="text-right">
                  {demoState === "conflict" && (
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">Conflict Detected</span>
                  )}
                  {demoState === "replanned" && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Auto-rescheduled</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Principles Section */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Trust Guarantee</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Never Overrides Your Decisions</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Most automated planners create frustration by silently reshuffling your day. HCAI Planner guarantees that your approvals and locked slots remain immutable hard constraints.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                "Locked tasks are mathematically immovable during replanning",
                "Human modifications generate feedback signals rather than penalties",
                "Full deterministic fallback—works without third-party API dependencies",
                "Complete audit trail of AI recommendations vs human selections",
              ].map((point) => (
                <div key={point} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 space-y-6 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-gradient-to-br dark:from-indigo-950/20 dark:to-slate-900 shadow-card">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready to take control of your time?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Step into the AI Scheduling Workspace. Create tasks, set your weekly availability, and experience adaptive timetable generation.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onEnterApp("planner")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Start Planning Now
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        HCAI Planner — Adaptive Timetable Generation System with User-Controlled Scheduling.
      </footer>
    </div>
  );
};
