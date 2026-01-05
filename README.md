# Foodify 

**A modern, high-performance food discovery engine built with React and Vite.**

Foodify is a responsive web application that empowers users to make healthier food choices by providing instant access to nutritional grades, ingredient breakdowns, and product details sourced from the Open Food Facts API.

---

##  Methodology: How I Solved the Problem

To build a robust and performant food discovery engine, I followed a systematic engineering approach focusing on **state management, data integrity, and network resilience.**

### 1. Data Architecture & API Strategy
The Open Food Facts API is powerful but presents challenges like inconsistent data and CORS restrictions.
- **Service Layer Abstraction**: Created a dedicated `api.js` service to decouple API logic from UI components. This allowed for centralized handling of barcode vs. text search.
- **Hybrid Search Logic**: Implemented a search bar which can make searched based on either barcode or product name. This feature enhances usability and flexibility for users.
- **Client-Side Data Refinement**: Since the API doesn't always guarantee sorted results, what we do is sort them smartly, when we want to sort using nutrition we render 100 products at a time so that most of the sorted grade components be visible on the screen for the user to see the difference between Grade A and B.
- **Data Integrity Checks**: Added checks to filter out products lacking essential information such as nutrition scores, ingredients, or allergens.
### 2. State Management & UX Flow
- **Centralized Product Context**: Used the React Context API to manage global state (search queries, filters, products). This ensures a "persistent UI" where users can view product details and return to their exact scroll position without redundant API calls."IT helps us avoid problems such as prop drilling". And also it allows us to keep track of the last viewed product index so that we can resume viewing from there after refreshing the page.
- **Lazy Loading Components**: Utilized lazy loading for non-critical components like nutrition bars and detailed views. This improves initial load times and reduces memory usage.
- **Infinite Scrolling**: Developed a custom hook utilizing the `IntersectionObserver` API. This solves the problem of clunky pagination by fetching the next page of results just before the user reaches the bottom.
- **Race Condition Prevention**: Integrated `AbortController` in the fetch cycle. If a user types quickly or switches filters rapidly, previous pending requests are cancelled to ensure the UI only reflects the most recent intent.

### 3. Performance & Resilience
- **Network Resilience**: Implemented an Axios interceptor with **exponential backoff retry logic**. The app automatically retries failed requests due to network hiccups, significantly improving reliability.
- **Debounced Interaction**: Optimized the search engine with a 500ms(can be increased) debounce to minimize unnecessary API calls.
- **Skeleton Loading**: Engineered CSS-based skeleton states to provide immediate visual feedback during data fetching, reducing perceived latency(It looks fancy no other reason for it).

---

##  Key Features

*   **Smart Search**: Automatic detection between barcodes and product names.
*   **Nutrition-First Sorting**: Prioritizes healthier products (Grade A) while filtering out products with missing data.
*   **Dietary Filtering**: Real-time "Veg Only" filtering using complex ingredient analysis tags.(only for my vegitarian GYM friends)
*   **Premium UI**: Smooth `framer-motion` transitions and a fully responsive grid layout.

---

##  Technical Stack

-   **Frontend**: React.js (v19)
-   **Bundler**: Vite
-   **State**: Context API
-   **Navigation**: React Router 7
-   **Icons**: Lucide React
-   **Animations**: Framer Motion

---

##  Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Abdulaziz-06/Foodify.git
    cd foodify
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will launch at `http://localhost:5173`.
