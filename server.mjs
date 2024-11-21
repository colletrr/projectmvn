import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const app = express();
const IPINFO_TOKEN = '24392ab80b143c';

// Function to load blocked organizations from a text file
const loadBlockedOrgs = () => {
    const filePath = path.resolve('blocked_orgs.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line.length > 0);
};

// Middleware to handle redirection
app.use(async (req, res) => {
    try {
        const blockedOrgs = loadBlockedOrgs();

        // Get visitor's IP address
        const visitorIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Fetch IP info
        const response = await fetch(`https://ipinfo.io/${visitorIP}?token=${IPINFO_TOKEN}`);
        const data = await response.json();

        if (data && data.org) {
            const org = data.org.toLowerCase();
            const isBlocked = blockedOrgs.some(blockedOrg => org.includes(blockedOrg));

            if (isBlocked) {
                return res.redirect('https://google.com');
            }
        }

        return res.redirect('https://bing.com');
    } catch (error) {
        console.error('Error fetching IP info:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
