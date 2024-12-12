# Panda Express Store System
This project focuses on creating a modern and professional point-of-sale (POS) system designed to streamline operations and meet the needs of managers, employees (cashiers and cooks), and customers. The web-based system offers essential tools such as inventory tracking, employee management, checkout and new order screens, and sales analytics. Additionally, it adheres to current accessibility standards to support users with physical impairments.

The tech stack consists of:

    Svelte and Tailwind CSS for the frontend
    Drizzle for the backend
    PostgreSQL for the database

Key Features:

Manager View: One of the most successful elements of the system, featuring a clean and cohesive UI design. It eliminates the need for manual SQL queries, enabling seamless database interaction and providing significant value to users.

Lockdown Kiosks: These kiosks offer high functionality and utility. They embed the site efficiently, incorporate touchscreen keyboards where needed, and restrict users from exiting the kiosk app, making them ideal for deployment on Windows and Linux-based systems.

Getting Started:

To run the project locally:

Navigate to the project directory in your terminal.
Go to the panda/ folder.
Run the command:

    npm install

Then, run the command:

    npm run dev -- --open

Notes:

Some login features have been disabled for convenience, allowing any user to access most of the website. However, certain pages are still restricted and require login tokens.

The Cashier and Customer pages, which I personally worked on, are fully functional without the need for tokens. You can switch between the Cashier and Customer views by simply changing the URL to end with either /cashier or /customer.
