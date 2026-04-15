# Foodify

Foodify is a React-based web application that allows users to search for food products and view their nutritional information using the Open Food Facts API.

## Methodology: How I built this

I focused on creating a reliable search experience that handles the limitations of a public API.

### Data Handling
The Open Food Facts API is the primary data source. I built a service layer to handle two types of lookups: 
- **Barcode Search**: If the input is numeric, the app performs a direct barcode lookup for an exact match.
- **Text Search**: Otherwise, it performing a general keyword search.

Since the API sometimes returns inconsistent data, I added a client-side filtering layer. This ensures that only products with names are displayed, and when sorting by nutrition grade, only products with valid grades (A-E) are shown in the correct order.

### State and Navigation
I used the React Context API to manage the application's state globally. This allows the search results and filter settings to stay active even when a user navigates between the main list and a specific product's details.

### Performance and Stability
- **Infinite Scroll**: Instead of standard pagination, I used the Intersection Observer API to load more products as the user scrolls down.
- **Request Management**: I used AbortController to cancel older search requests if a user types quickly, preventing the UI from showing outdated results.
- **Network Reliability**: I added a simple retry mechanism for API calls to handle temporary network issues or timeouts.

## Tech Stack
- React 19
- Vite
- Axios for API requests
- React Router for navigation
- Framer Motion for basic transitions

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdulaziz-06/Foodify.git
   cd foodify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
