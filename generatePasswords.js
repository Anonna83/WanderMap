const bcrypt = require('bcrypt');

async function generateHashedPasswords() {
    try {
        const password1 = '1234anu';
        const password2 = '1234nijhu';
        
        const hashedPassword1 = await bcrypt.hash(password1, 10);
        const hashedPassword2 = await bcrypt.hash(password2, 10);
        
        console.log('=== HASHED PASSWORDS ===');
        console.log(`Password: ${password1} -> Hash: ${hashedPassword1}`);
        console.log(`Password: ${password2} -> Hash: ${hashedPassword2}`);
        
        console.log('\n=== SQL COMMANDS ===');
        console.log('-- First, clear existing admin accounts:');
        console.log('DELETE FROM admin;');
        console.log('\n-- Then insert the new admin accounts:');
        console.log(`INSERT INTO admin (username, email, password) VALUES ('anonna', 'anonna@gmail.com', '${hashedPassword1}');`);
        console.log(`INSERT INTO admin (username, email, password) VALUES ('nirjhar', 'nijhu@gmail.com', '${hashedPassword2}');`);
        
    } catch (error) {
        console.error('Error generating passwords:', error);
    }
}

generateHashedPasswords(); 