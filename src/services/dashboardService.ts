import { Task, List, Resource } from '../types/content';
import { getUserTasks, getUserLists } from './taskServics';
import { resourcesService } from './resourcesService';
import { papersService } from './papersService';
import { bookmarkService } from './bookmarkService';

export interface DashboardStats {
  totalTasks: number;
  defaultListTasks: number;
  highPriorityTasks: number;
  availablePapers: number;
  availableResources: number;
  bookmarks: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: Task[];
  recentResources: Resource[];
  recentBookmarks: any[];
  lists: List[];
}

export const dashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Fetch all data in parallel
      const [
        tasks,
        lists,
        resources,
        papers,
        bookmarks
      ] = await Promise.all([
        getUserTasks(userId),
        getUserLists(userId),
        resourcesService.getResources(),
        papersService.getPapers(),
        bookmarkService.getBookmarks(userId)
      ]);

      // Get the default list (position 0)
      const defaultList = lists.find((list: List) => list.position === 0);
      
      // Calculate stats
      const stats: DashboardStats = {
        totalTasks: tasks.length,
        defaultListTasks: defaultList ? tasks.filter((task: Task) => task.listId === defaultList.id).length : 0,
        highPriorityTasks: tasks.filter((task: Task) => task.priority === 'high').length,
        availablePapers: papers.length,
        availableResources: resources.length,
        bookmarks: bookmarks.length
      };

      // Get recent items
      const recentTasks = tasks.slice(0, 5);
      const recentResources = resources.slice(0, 5);
      const recentBookmarks = bookmarks.slice(0, 5);

      return {
        stats,
        recentTasks,
        recentResources,
        recentBookmarks,
        lists
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Helper function to get tasks by list
  getTasksByList(tasks: Task[], listId: string): Task[] {
    return tasks.filter(task => task.listId === listId);
  },

  // Helper function to get priority color
  getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}; 