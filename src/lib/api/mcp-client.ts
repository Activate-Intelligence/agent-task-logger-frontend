/**
 * MCP (Model Context Protocol) Client for Task Logger
 * Communicates with the Task Logger MCP server via Lambda Function URL
 */

export interface Task {
  task_id: string;
  user_name: string;
  client_name: string;
  project_name: string;
  task_description: string;
  task_type: 'completed' | 'daily' | 'future';
  task_date: string;
  date_logged: string;
  status: 'completed' | 'in_progress' | 'pending';
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  milestone?: string;
  related_links?: string[];
  blocked_by?: string;
  outcome?: string;
  client_input?: string;
  project_input?: string;
}

export interface LogTaskRequest {
  user_name?: string;
  client_name: string;
  project_name: string;
  task_description: string;
  task_type: 'completed' | 'daily' | 'future';
  task_date?: string;
  status?: 'completed' | 'in_progress' | 'pending';
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  milestone?: string;
  related_links?: string[];
  blocked_by?: string;
  outcome?: string;
}

export interface GetTasksFilters {
  client_name?: string;
  project_name?: string;
  user_name?: string;
  task_type?: 'completed' | 'daily' | 'future';
  status?: 'completed' | 'in_progress' | 'pending';
  date_range?: string;
  date_filter_type?: 'task_date' | 'date_completed' | 'date_logged' | 'date_started';
  limit?: number;
}

export interface UpdateTaskRequest {
  task_id: string;
  client_name: string;
  project_name: string;
  task_description?: string;
  task_type?: 'completed' | 'daily' | 'future';
  task_date?: string;
  status?: 'completed' | 'in_progress' | 'pending';
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  milestone?: string;
  related_links?: string[];
  blocked_by?: string;
  outcome?: string;
  user_name?: string;
}

export interface GenerateReportRequest {
  report_type: 'client_summary' | 'project_summary' | 'user_summary' | 'time_tracking' | 'detailed';
  date_range: string;
  client_name?: string;
  project_name?: string;
  user_name?: string;
  date_filter_type?: 'task_date' | 'date_completed' | 'date_logged' | 'date_started';
  group_by?: 'client' | 'project' | 'user' | 'date';
  include_hours?: boolean;
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class MCPClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Normalize URL by removing trailing slashes
    this.baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    // Don't throw during build time (SSG), only validate at runtime
    if (typeof window !== 'undefined' && !this.baseUrl) {
      throw new Error('VITE_API_URL environment variable is not set');
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async callTool(toolName: string, args: any): Promise<MCPResponse> {
    if (!this.token) {
      throw new Error('Authentication token not set');
    }

    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'MCP tool call failed');
    }

    return data.result;
  }

  async logTask(request: LogTaskRequest): Promise<Task> {
    const result = await this.callTool('log_task', request);

    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Failed to log task');
    }

    // Parse the response text to extract task data
    const responseText = result.content[0]?.text || '';
    const taskData = this.parseTaskFromResponse(responseText);

    return taskData;
  }

  async getTasks(filters?: GetTasksFilters): Promise<Task[]> {
    const result = await this.callTool('get_tasks', filters || {});

    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Failed to get tasks');
    }

    // Parse the response text to extract tasks
    const responseText = result.content[0]?.text || '';
    const tasks = this.parseTasksFromResponse(responseText);

    return tasks;
  }

  async updateTask(request: UpdateTaskRequest): Promise<Task> {
    const result = await this.callTool('update_task', request);

    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Failed to update task');
    }

    const responseText = result.content[0]?.text || '';
    const taskData = this.parseTaskFromResponse(responseText);

    return taskData;
  }

  async deleteTask(taskId: string, clientName: string, projectName: string): Promise<void> {
    const result = await this.callTool('delete_task', {
      task_id: taskId,
      client_name: clientName,
      project_name: projectName,
    });

    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Failed to delete task');
    }
  }

  async generateReport(request: GenerateReportRequest): Promise<string> {
    const result = await this.callTool('generate_report', request);

    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Failed to generate report');
    }

    return result.content[0]?.text || '';
  }

  // Helper methods to parse MCP text responses
  private parseTaskFromResponse(text: string): Task {
    // MCP returns formatted text, extract JSON if present or parse formatted text
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse task JSON:', e);
    }

    // Fallback: create a basic task object from the text
    return {
      task_id: '',
      user_name: '',
      client_name: '',
      project_name: '',
      task_description: text,
      task_type: 'completed',
      task_date: new Date().toISOString().split('T')[0],
      date_logged: new Date().toISOString(),
      status: 'completed',
    };
  }

  private parseTasksFromResponse(text: string): Task[] {
    // Try to parse JSON array from response
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse tasks JSON:', e);
    }

    // Return empty array if parsing fails
    return [];
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();
