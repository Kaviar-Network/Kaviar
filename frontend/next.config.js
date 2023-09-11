/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: { 
        unoptimized: true 
    },
    env: {
        NEXT_PUBLIC_FIREBASE_APIKEY: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
        NEXT_PUBLIC_FIREBASE_AUTHDOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECTID: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
        NEXT_PUBLIC_FIREBASE_STORAGEBUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGESENDERID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGESENDERID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_MEASUREMENTID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
    },
    experimental: {
        esmExternals: "loose",
    },
}

module.exports = nextConfig;
