import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, PaginatedResponse } from '@/types';

// State interface
interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  pendingTasks: Task[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
  stats: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  } | null;
  isLoading: boolean;
  isLoadingPending: boolean;
  isLoadingStats: boolean;
  error: string | null;
}

// Action types
type TaskAction =
  | { type: 'FETCH_TASKS_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: PaginatedResponse<Task> }
  | { type: 'FETCH_TASKS_FAILURE'; payload: string }
  | { type: 'FETCH_PENDING_START' }
  | { type: 'FETCH_PENDING_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_PENDING_FAILURE'; payload: string }
  | { type: 'FETCH_STATS_START' }
  | { type: 'FETCH_STATS_SUCCESS'; payload: TaskState['stats'] }
  | { type: 'FETCH_STATS_FAILURE'; payload: string }
  | { type: 'SELECT_TASK'; payload: Task | null }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'COMPLETE_TASK'; payload: Task }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  pendingTasks: [],
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 20,
  },
  stats: null,
  isLoading: false,
  isLoadingPending: false,
  isLoadingStats: false,
  error: null,
};

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_TASKS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_TASKS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tasks: action.payload.items,
        pagination: {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.current_page,
          perPage: action.payload.per_page,
        },
      };
    case 'FETCH_TASKS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_PENDING_START':
      return { ...state, isLoadingPending: true };
    case 'FETCH_PENDING_SUCCESS':
      return { ...state, isLoadingPending: false, pendingTasks: action.payload };
    case 'FETCH_PENDING_FAILURE':
      return { ...state, isLoadingPending: false, error: action.payload };
    case 'FETCH_STATS_START':
      return { ...state, isLoadingStats: true };
    case 'FETCH_STATS_SUCCESS':
      return { ...state, isLoadingStats: false, stats: action.payload };
    case 'FETCH_STATS_FAILURE':
      return { ...state, isLoadingStats: false, error: action.payload };
    case 'SELECT_TASK':
      return { ...state, selectedTask: action.payload };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        pendingTasks: state.pendingTasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        selectedTask:
          state.selectedTask?.id === action.payload.id
            ? action.payload
            : state.selectedTask,
      };
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        pendingTasks: state.pendingTasks.filter(
          (task) => task.id !== action.payload.id
        ),
        selectedTask:
          state.selectedTask?.id === action.payload.id
            ? action.payload
            : state.selectedTask,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        pendingTasks: state.pendingTasks.filter((task) => task.id !== action.payload),
        selectedTask:
          state.selectedTask?.id === action.payload ? null : state.selectedTask,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider
export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

// Hook
export function useTaskStore() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskStore must be used within a TaskProvider');
  }
  return context;
}

// Actions
export const fetchTasksStart = (): TaskAction => ({ type: 'FETCH_TASKS_START' });

export const fetchTasksSuccess = (response: PaginatedResponse<Task>): TaskAction => ({
  type: 'FETCH_TASKS_SUCCESS',
  payload: response,
});

export const fetchTasksFailure = (error: string): TaskAction => ({
  type: 'FETCH_TASKS_FAILURE',
  payload: error,
});

export const fetchPendingStart = (): TaskAction => ({ type: 'FETCH_PENDING_START' });

export const fetchPendingSuccess = (tasks: Task[]): TaskAction => ({
  type: 'FETCH_PENDING_SUCCESS',
  payload: tasks,
});

export const fetchPendingFailure = (error: string): TaskAction => ({
  type: 'FETCH_PENDING_FAILURE',
  payload: error,
});

export const fetchStatsStart = (): TaskAction => ({ type: 'FETCH_STATS_START' });

export const fetchStatsSuccess = (stats: TaskState['stats']): TaskAction => ({
  type: 'FETCH_STATS_SUCCESS',
  payload: stats,
});

export const fetchStatsFailure = (error: string): TaskAction => ({
  type: 'FETCH_STATS_FAILURE',
  payload: error,
});

export const selectTask = (task: Task | null): TaskAction => ({
  type: 'SELECT_TASK',
  payload: task,
});

export const updateTask = (task: Task): TaskAction => ({
  type: 'UPDATE_TASK',
  payload: task,
});

export const completeTask = (task: Task): TaskAction => ({
  type: 'COMPLETE_TASK',
  payload: task,
});

export const deleteTask = (taskId: number): TaskAction => ({
  type: 'DELETE_TASK',
  payload: taskId,
});

export const clearError = (): TaskAction => ({ type: 'CLEAR_ERROR' });

// Selectors
export const selectTasks = (state: TaskState): Task[] => state.tasks;
export const selectPendingTasks = (state: TaskState): Task[] => state.pendingTasks;
export const selectSelectedTask = (state: TaskState): Task | null => state.selectedTask;
export const selectPagination = (state: TaskState) => state.pagination;
export const selectStats = (state: TaskState) => state.stats;
export const selectIsLoading = (state: TaskState): boolean => state.isLoading;
export const selectIsLoadingPending = (state: TaskState): boolean => state.isLoadingPending;
export const selectError = (state: TaskState): string | null => state.error;

export const selectOverdueTasks = (state: TaskState): Task[] =>
  state.tasks.filter((task) => task.is_overdue);

export const selectTasksByLeadId = (state: TaskState, leadId: number): Task[] =>
  state.tasks.filter((task) => task.lead_id === leadId);
