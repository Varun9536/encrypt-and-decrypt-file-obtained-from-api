const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

// Function to encrypt data
function encryptData(data, password) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, "salt", 32);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const ivHex = iv.toString("hex");
    return ivHex + encrypted;

}

// Function to fetch API data, encrypt, and save it
async function fetchAndEncrypt(apiUrl, password, outputPath) {
    try {
        // Fetch data from the API
        const response = await axios.post(apiUrl, {
            id: "66a1deb86631383082b747e0",
        });
        const data = JSON.stringify(response.data);

        // Encrypt the data
        const encryptedData = encryptData(data, password);

        // Save the encrypted data to a file
        fs.writeFileSync(outputPath, encryptedData);
        console.log(`Data encrypted and saved to ${ outputPath }`);
    } catch (error) {
        console.error("Error fetching or encrypting data:", error);
    }
}

// Usage example
const apiUrl = "http://192.168.9.91:3000/v1/onefile"; // Replace with your API URL
const password = "12345"; // Replace with your password
const outputPath = "my_encrypt_file_name.txt"; // Replace with your desired output file path

fetchAndEncrypt(apiUrl, password, outputPath);