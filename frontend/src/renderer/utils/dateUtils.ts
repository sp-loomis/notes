/**
 * Format a date to a human-readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // If the date is today, show only time
  const today = new Date();
  if (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  ) {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If the date is yesterday, show "Yesterday"
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }
  
  // Otherwise, show date in format: "Jan 1, 2021"
  return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Helper function to prepare data for Redux by serializing Date objects
 * @param data The data object to prepare for Redux
 * @returns A new object with Date objects converted to ISO strings
 */
export function prepareForRedux<T>(data: T): T {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => prepareForRedux(item)) as unknown as T;
  }
  
  // Handle objects
  const result = { ...data };
  
  for (const key in result) {
    const value = result[key];
    
    if (value instanceof Date) {
      // Convert Date to ISO string
      result[key] = value.toISOString() as any;
    } else if (value && typeof value === 'object') {
      // Recursively process nested objects
      result[key] = prepareForRedux(value);
    }
  }
  
  return result;
}