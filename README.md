# Panda Express Store System

This project focuses on creating a modern and professional point-of-sale (POS) system, designed to streamline operations and meet the needs of managers, employees (cashiers and cooks), and customers. The web-based system procides essential tools such as inventory tracking, employee management, checkout and new order screens, and sales analytics. It also adheres to current accessibility standards to support users with physical impairments. The tech stack conisists of Svelte and Tailwind CSS for the front end and drizzle for the backend along with a PostgreSQL database.

One of the most successful elements is the manager view with its clean and cohesive UI design. It eliminates the need to write SQL queries, enabling seamless database interaction and delivering significant value to users. Another key achievement is the lockdown kiosks, which excel in functionality and utility. They embed the site efficiently, incorporate touchscreen keyboards where required, and restrict users from exiting, making them particularly well-suited for deployment on Windows and Linux-based kiosk systems.

To run the project: 
Navigate to the project directory in the terminal
Navigate to the panda/ folder
Run the command: npm install
Run the command: npm run dev -- --open

Note: 
I disabled some of the login features to allow any user to have access to most of the website, but there are some pages that are innaccessible to due necessary login tokens. The Cashier and Customer pages are the main ones I personally worked on, and their full functionality is available without the need for tokens.
To switch between Cashier and Customer views, simply change the URL to end with either /cashier or /customer. 
