export type TaskType = 'completed' | 'daily' | 'future'
export type TaskStatus = 'completed' | 'in_progress' | 'pending'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  task_id: string
  client_name: string
  project_name: string
  user_name: string
  task_type: TaskType
  task_description: string
  task_date: string
  status: TaskStatus
  date_logged: string
  tags?: string[]
  estimated_hours?: number
  actual_hours?: number
  notes?: string
  priority?: TaskPriority
  category?: string
  milestone?: string
  related_links?: string[]
  blocked_by?: string
  outcome?: string
}

export interface CreateTaskInput {
  client_name: string
  project_name: string
  user_name: string
  task_type: TaskType
  task_description: string
  task_date?: string
  status?: TaskStatus
  tags?: string[]
  estimated_hours?: number
  actual_hours?: number
  notes?: string
  priority?: TaskPriority
  category?: string
  milestone?: string
  related_links?: string[]
  blocked_by?: string
  outcome?: string
}

export interface UpdateTaskInput {
  task_id: string
  client_name: string
  project_name: string
  task_description?: string
  status?: TaskStatus
  tags?: string[]
  estimated_hours?: number
  actual_hours?: number
  notes?: string
  priority?: TaskPriority
  category?: string
  milestone?: string
  related_links?: string[]
  blocked_by?: string
  outcome?: string
}

export interface GetTasksParams {
  client_name?: string
  project_name?: string
  user_name?: string
  task_type?: TaskType
  status?: TaskStatus
  date_range?: string
  limit?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth Types
export interface AuthUser {
  username: string
  role: 'admin' | 'user'
  email?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}
