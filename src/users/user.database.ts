import { UnitUser } from "./user.interface";
import bcrypt from "bcryptjs";
import mysql from 'mysql';
import { v4 as uuidv4 } from "uuid";



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'junwell',
    password: 'Aq_@zbnm',
    database: 'my-rest',
});

// Define the query function with proper types
const query = (sql: string, values: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
          if (error) {
              reject(error);
          } else {
              resolve(results);
          }
      });
  });
};


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database');
});

export const findAll = async (): Promise<UnitUser[]> => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users', (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

export const findOne = async (id: string): Promise<UnitUser | null> => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users WHERE id = ?', id, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0] || null);
            }
        });
    });
};


export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
  try {
      const id = uuidv4();
      const { username, email, password } = userData;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Execute the INSERT query to add the user to the database
      await query('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)', [id, username, email, hashedPassword]);

      // Return the created user object
      return { id, username, email, password: hashedPassword };
  } catch (error) {
      console.error('Error creating user:', error);
      return null;
  }
}



// Remove a user
export const remove = async (id: string): Promise<void> => {
    try {
        await query('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error removing user:', error);
    }
};


// Find a user by email
export const findByEmail = async (user_email: string): Promise<UnitUser | null> => {
    try {
        const [user] = await query('SELECT * FROM users WHERE email = ?', [user_email]);
        return user || null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        return null;
    }
};

// Compare user password with supplied password
export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
    try {
        const user = await findByEmail(email);
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(supplied_password, user.password);
        return isValidPassword ? user : null;
    } catch (error) {
        console.error('Error comparing password:', error);
        return null;
    }
};

// Update a user's information
// Update a user's information
export const update = async (id: string, updateValues: Partial<UnitUser>): Promise<UnitUser | null> => {
    try {
        const userExists = await findOne(id);
        if (!userExists) return null;

        // Generate new hashed password if updated
        if (updateValues.password) {
            const salt = await bcrypt.genSalt(10);
            updateValues.password = await bcrypt.hash(updateValues.password, salt);
        }

        // Build the update query
        const { password, ...otherValues } = updateValues;
        const updateQuery = `UPDATE users SET ${Object.keys(otherValues).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;

        // Execute the update query
        await query(updateQuery, [...Object.values(otherValues), id]);

        return { ...userExists, ...updateValues } as UnitUser;
    } catch (error) {
        console.error('Error updating user:', error);
        return null;
    }
};


// Search users by name
export const searchByName = async (name: string): Promise<UnitUser[]> => {
    try {
        const [users] = await query('SELECT * FROM users WHERE username LIKE ?', [`%${name}%`]);
        return users || [];
    } catch (error) {
        console.error('Error searching users by name:', error);
        return [];
    }
};

// Search users by email
export const searchByEmail = async (partialEmail: string): Promise<UnitUser[]> => {
    try {
        const [users] = await query('SELECT * FROM users WHERE email LIKE ?', [`%${partialEmail}%`]);
        return users || [];
    } catch (error) {
        console.error('Error searching users by email:', error);
        return [];
    }
};


