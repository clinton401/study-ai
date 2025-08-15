import withPWAInit from "next-pwa";
import runtimeCaching from './runtime-caching.js';


const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  
  disable: process.env.NODE_ENV === "development", 
  runtimeCaching, 
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
