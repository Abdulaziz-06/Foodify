# Foodify 

**A modern, high-performance food discovery engine built with React and Vite.**

Foodify is a responsive web application that empowers users to make healthier food choices by providing instant access to nutritional grades, ingredient breakdowns, and product details sourced from the Open Food Facts API.

##  Key Features

*   **Smart Search Engine**: Hybrid search capability that automatically detects barcodes for direct product lookup or performs keyword-based queries for general browsing.
*   **Nutrition-First Sorting**: Custom sorting algorithm that prioritizes nutritional quality (Grades A-E), strictly filtering out incomplete data for reliable results.
*   **Seamless Infinite Scroll**: Implemented a custom `IntersectionObserver` hook to load products dynamically, replacing clunky pagination with a fluid user experience.
*   **Dietary Filtering**: "Veg Only" toggle that analyzes complex ingredient tags to accurately filter vegetarian-safe products in real-time.
*   **Premium UI/UX**: Features skeletal loading states, high-resolution imagery, and smooth `framer-motion` transitions for an app-like feel.

##  Technical Architecture

### Core Stack
-   **Frontend**: React.js (v18), Vite
-   **State Management**: React Context API
-   **Styling**: CSS Modules (Scoped & Modular)
-   **Routing**: React Router DOM
-   **Animations**: Framer Motion

###  Engineering Highlights

#### 1. Robust API Gateway
To overcome the limitations of the public Open Food Facts API (CORS restrictions, rate limiting), I engineered a custom proxy layer in `vite.config.js`. 
-   **Proxy Configuration**: Consolidates API traffic through a local dev server to bypass CORS.
-   **Network Resilience**: Implemented an Axios interceptor with **exponential backoff retry logic**. This ensures the application remains stable even during network hiccups or API timeouts.
-   **Connection Optimization**: Configured `keep-alive` headers and extended timeouts (60s) to handle large data batches without dropping connections.

#### 2. Performance Optimization
-   **Client-Side Caching & sorting**: To ensure strictly accurate sorting (which the API doesn't fully support native sorting for), raw data is fetched in batches and strictly sorted/filtered on the client side before rendering.
-   **Debounced Search**: Search input is debounced to utilize API quota efficiently and prevent unneccesary network requests.
-   **Context-Based Persistence**: Search state, filters, and product lists are persisted via Global Context, allowing users to navigate between detailed views and the grid without losing their place.

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


