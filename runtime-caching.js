const runtimeCaching = [
    {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
            cacheName: "google-fonts",
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
    },
    {
        urlPattern: /^https:\/\/your-api-domain\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
            cacheName: "api-cache",
            networkTimeoutSeconds: 10,
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
    },
    {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: "CacheFirst",
        options: {
            cacheName: "image-cache",
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
    },
];

export default runtimeCaching;
