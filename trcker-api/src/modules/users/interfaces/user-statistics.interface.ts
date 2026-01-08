export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  lockedUsers: number;
  usersByRole: {
    roleId: string;
    roleName: string;
    count: number;
  }[];
  recentRegistrations: {
    date: string;
    count: number;
  }[];
}