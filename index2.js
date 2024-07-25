

const crypto = require('crypto');
const fs = require('fs');

// Function to fetch the file from the API
async function fetchFile(url) {
    // const response = await fetch(url);

    const response = await fetch(url , {
                method : "post" ,
                body : JSON.stringify({"id" : "66a218631775f701fc617119"}) ,
                headers : {
                    "Content-type" : "application/json"
                }
            });



    if (!response.ok) {
        throw new Error(`Failed to fetch the file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// Function to encrypt the buffer using AES-256-CBC
function encrypt(buffer, password) {
    const key = crypto.scryptSync(password, 'salt', 32); // Derive a key from the password
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}




// Function to decrypt the buffer using AES-256-CBC
function decrypt(encryptedData, iv, password) {
    const key = crypto.scryptSync(password, 'salt', 32); // Derive a key from the password
    const ivBuffer = Buffer.from(iv, 'hex'); // Convert the IV back to a buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'hex'); // Convert the encrypted data back to a buffer

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
}

async function main() {
    const fileUrl = 'http://192.168.9.91:3000/v1/onefile';
    const password = '1234';
    const encryptedFilePath = './encrypted_file.xlsx';
    const decryptedFilePath = './decrypted_file.xlsx';

    try {
        // Encrypt the file
        const fileBuffer = await fetchFile(fileUrl);
        const encrypted = encrypt(fileBuffer, password);
        
        // Save encrypted data to a file
        fs.writeFileSync(encryptedFilePath, JSON.stringify(encrypted));
        console.log(`Encrypted data saved to ${encryptedFilePath}`);
        




        // Read the encrypted data from the file
        const encryptedDataFromFile = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));

        // Decrypt the file
        const decryptedData = decrypt(encryptedDataFromFile.encryptedData, encryptedDataFromFile.iv, password);
        
        // Save decrypted data to a file
        fs.writeFileSync(decryptedFilePath, decryptedData);
        console.log(`Decrypted data saved to ${decryptedFilePath}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();