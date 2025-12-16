
# Truverizen Platform


Truverizen is a modern SaaS dashboard application designed for high-volume legal and administrative document processing. It features AI-powered tools such as Court Indexing, OCR Processing, and Master Deduplication, wrapped in an intuitive Role-Based Access Control (RBAC) interface.

## 🚀 Features

### Core Functionality

  * **Document History Dashboard:** Track status, duration, and file details for processed documents.
  * **AI Tool Integration:** Interfaces for AI Court Indexing, OCR, Entity Extraction, and Deduplication.
  * **User Management:** Comprehensive Admin dashboard to Create, Update, Revoke, and Delete users.
  * **Company Management:** Manage client companies, validity periods, and point-of-contact (POC) details.

### UI/UX Highlights

  * **Responsive Design:** Fully responsive layout built with Tailwind CSS.
  * **Data Visualization:** Interactive data tables with sorting, filtering, and pagination.
  * **Feedback Systems:** Integrated Toast notifications (Sonner) for success/error states.
  * **Modern Components:** Built using a modular UI architecture (based on Shadcn/Radix UI).

## 🛠️ Tech Stack

  * **Frontend Framework:** React (with TypeScript)
  * **Build Tool:** Vite
  * **Styling:** Tailwind CSS
  * **Icons:** Lucide React
  * **Animations:** Motion (Framer Motion)
  * **State Management:** React Hooks
  * **HTTP Client:** Native Fetch API

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:

  * **Node.js**: v18.0.0 or higher
  * **npm**: v9.0.0 or higher

## 📦 Installation

Follow these steps to set up the project locally:

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/truverizen-platform.git
    cd truverizen-platform
    ```

2.  **Install Dependencies**

    ```bash
    npm i
    ```

3.  **Start Development Server**

    ```bash
    npm run dev
    ```

The application will typically start at `http://localhost:5173`.

## 🔧 Configuration

To connect to the backend API, ensure your environment is set up correctly.

1.  Create a `.env` file in the root directory.
2.  Add your API base URL (Default currently points to the testing server):

<!-- end list -->

```env
VITE_API_BASE_URL=http://16.16.197.117:5050
```

*Note: If no `.env` is provided, the application may default to the hardcoded backend URL.*

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

