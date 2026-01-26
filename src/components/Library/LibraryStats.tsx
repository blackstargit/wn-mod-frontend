import React from "react";
import { BookOpen, CheckCircle, Eye, BookMarked } from "lucide-react";
import type { LibraryStatsProps } from "../../types";

const LibraryStats: React.FC<LibraryStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: "Total Novels",
      value: stats.total,
      icon: BookOpen,
      colorClass: "bg-slate-800/50 border-slate-700/50",
      textColor: "text-white",
    },
    {
      label: "Scraped",
      value: stats.scraped,
      icon: CheckCircle,
      colorClass: "bg-green-500/10 border-green-500/30",
      textColor: "text-green-400",
    },
    {
      label: "Reading",
      value: stats.reading,
      icon: Eye,
      colorClass: "bg-blue-500/10 border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      label: "Unread",
      value: stats.unread,
      icon: BookMarked,
      colorClass: "bg-orange-500/10 border-orange-500/30",
      textColor: "text-orange-400",
    },
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 gradient-text">
        📊 Library Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-lg p-4 border ${item.colorClass} transition-all hover:scale-105`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.textColor}`} />
                <div
                  className={`text-sm ${item.textColor.replace("text-", "text-").replace("-400", "-500")}`}
                >
                  {item.label}
                </div>
              </div>
              <div className={`text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryStats;
