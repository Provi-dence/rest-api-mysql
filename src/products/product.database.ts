import { Product, UnitProduct } from "./product.interface";
import { v4 as uuidv4 } from "uuid";
import mysql from "mysql";

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'junwell',
    password: 'Aq_@zbnm',
    database: 'my-rest',
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

export const findAll = async (): Promise<UnitProduct[]> => {
  const query = "SELECT * FROM products";
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results: UnitProduct[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

export const findOne = async (id: string): Promise<UnitProduct | null> => {
  const query = "SELECT * FROM products WHERE id = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [id], (error, results: UnitProduct[]) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

export const create = async (productInfo: Product): Promise<UnitProduct | null> => {
  const id = uuidv4();
  const { name, price, quantity, image } = productInfo;
  const query = "INSERT INTO products (id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?)";
  const values = [id, name, price, quantity, image];
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve({ id, ...productInfo });
      }
    });
  });
};

export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
  const { name, price, quantity, image } = updateValues;
  const query = "UPDATE products SET name = ?, price = ?, quantity = ?, image = ? WHERE id = ?";
  const values = [name, price, quantity, image, id];
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve({ id, ...updateValues });
      }
    });
  });
};

export const remove = async (id: string): Promise<void> => {
  const query = "DELETE FROM products WHERE id = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [id], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export default connection; // Export the MySQL connection