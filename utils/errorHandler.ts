
export const getFriendlyErrorMessage = (error: any): string => {
  const defaultMessage = 'An unexpected error occurred. Please try again.';

  if (!error || !error.message) {
    return defaultMessage;
  }

  let errorMessage = error.message;

  // Attempt to parse if it's a JSON string, which is common for API errors
  try {
    const parsedError = JSON.parse(errorMessage);
    if (parsedError.error && parsedError.error.message) {
      // Use the more specific message from the API response
      errorMessage = parsedError.error.message;
      
      // Add the status if available for more context
      if(parsedError.error.status) {
        errorMessage = `${parsedError.error.status}: ${errorMessage}`;
      }
    }
  } catch (e) {
    // Not a JSON string, continue with the original error message
  }

  if (errorMessage.includes('API_KEY_HTTP_REFERRER_BLOCKED') || (errorMessage.includes('Requests from referer') && errorMessage.includes('are blocked'))) {
    return 'API Key Error: Your API key has HTTP referrer restrictions that are blocking requests from this origin. To fix this, go to your Google Cloud Console, find the API key you are using, and under "Website restrictions," either remove the restrictions or add this website\'s URL to the allowed list.';
  }
  
  if (errorMessage.includes('API_KEY_INVALID')) {
    return 'API Key Error: The provided API key is invalid. Please check your API key in the Google Cloud Console.';
  }

  if (errorMessage.includes('PERMISSION_DENIED')) {
    return 'Permission Denied: Your API key may be invalid or lack necessary permissions. Please verify its configuration in the Google Cloud Console.';
  }
  
  if (errorMessage.includes('API_KEY environment variable is not set')) {
      return 'Configuration Error: The API key is missing. Please ensure it is configured correctly.';
  }
  
  if (errorMessage.includes('getUserMedia')) {
      return 'Microphone Error: Could not access the microphone. Please ensure you have granted the necessary permissions in your browser settings.';
  }

  // More generic but still useful messages
  if (errorMessage.includes('400')) {
      return `Bad Request: The server could not process the request. Please check your inputs. Details: ${errorMessage}`;
  }
  if (errorMessage.includes('500') || errorMessage.includes('503')) {
      return `Server Error: An internal server error occurred. Please try again later. Details: ${errorMessage}`;
  }

  return `An error occurred: ${errorMessage}`;
};
