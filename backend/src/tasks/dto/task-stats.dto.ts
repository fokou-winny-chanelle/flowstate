export class TaskStatsDto {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  today: number;
  upcoming: number;
  noDate: number;
  highPriority: number;
  byPriority: {
    [key: number]: number;
  };
  byEnergyLevel: {
    low: number;
    medium: number;
    high: number;
  };
  completionRate: number;
}

