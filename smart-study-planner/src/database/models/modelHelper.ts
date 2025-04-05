/**
 * Helper utilities for Sequelize models to prevent client-side errors
 */

/**
 * Check if the code is running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Safely initialize a Sequelize model, handling browser/server environments
 * 
 * @param initFn Function that initializes the model on the server
 * @param dummyInit Function that creates a dummy placeholder in the browser
 */
export function safeModelInit(initFn: () => void, dummyInit: () => void): void {
  if (isBrowser) {
    // In browser, use the dummy initialization
    dummyInit();
  } else {
    // On server, use the real initialization
    initFn();
  }
}

/**
 * Helper to safely type attributes for model creation
 * This handles the common ID issue with Sequelize's type expectations
 * 
 * @param attributes Object with attributes for the model
 * @returns The same object but with proper type for Sequelize
 */
export function safeModelCreate<T>(attributes: Partial<T>): any {
  // This function just returns the same object but with a type assertion
  // that satisfies Sequelize's type checking
  return attributes as any;
}

/**
 * Ensure fields in models have compatible default values
 * 
 * @param value The value to validate
 * @param defaultValue The default value to use if value is undefined/null
 * @returns The original value or default value
 */
export function ensureField<T>(value: T | undefined | null, defaultValue: T): T {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
}

/**
 * Process a list of models for API responses
 * Removes any sensitive information and standardizes output
 * 
 * @param models Array of model instances
 * @returns Processed array safe for API response
 */
export function processModelsForAPI(models: any[] | null): any[] {
  if (!models) return [];
  
  return models.map(model => {
    // Convert to plain object if it's a model instance
    const data = model.toJSON ? model.toJSON() : model;
    
    // Remove sensitive fields
    if (data.password) delete data.password;
    
    return data;
  });
} 