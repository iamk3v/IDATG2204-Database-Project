

## Deployment

The project uses XAMPP with phpMyAdmin as the database. XAMPP uses MySQL with MariaDB to build a functional database.
XAMPP can be installed here: https://www.apachefriends.org/

### 1. Clone the Project

If you have the source code, skip this step and follow from step 2.
Clone the program by using the following command:

```git clone https://github.com/iamk3v/idatg2204-Database-Project.git```

### 2. Install Required Packages

Once the project is cloned, you can open it in Visual Studio Code or another editor and install the required packages.
Run the following commands from the project root:
```
cd ElectroMart
npm install

cd ../ElectroMart-backend
npm install
```
This will install all the required packages by reading the package.json files.

### 3. Initialize the Database

This step requires XAMPP to be installed, and both the MySQL and Apache servers to be started.

    1. Open phpMyAdmin

    2. Copy the contents of the DDL.sql file into the SQL window and execute it

This will create the tables, set up relations, and add roles, views, and permissions.

### 4. Populate the Database

After running DDL.sql, you need to insert data into the tables.

    1. Copy the contents of insertData.sql
    
    2. Paste them into phpMyAdmin and run the script

Make sure that you are using the electromart database.

### 5. Start the Services

After the data is inserted, you can run the project by opening two terminal windows (in your editor or terminal of choice).

Terminal 1 – Start the backend:
```
cd ElectroMart/ElectroMart-backend
node server.js
```
    Note: The default backend port is 5000. On macOS, this can conflict with the AirPlay Receiver. You may need to change the port in your code and settings.

Terminal 2 – Start the frontend:
```
cd ElectroMart
npm run dev
```
### 6. Access the Webpage

Once the frontend runs, a localhost URL with a port will be printed in the terminal.
Click or paste that URL in your browser to access the website.

