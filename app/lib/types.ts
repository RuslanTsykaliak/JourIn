export interface Goal {
  id: string; // Unique ID (e.g., using uuid)
  name: string; // "Find a job", "Build followers"
  specifics: string; // User-defined details
  isDefault: boolean; // true for pre-defined goals, false for user-created
}
