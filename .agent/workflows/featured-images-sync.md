# Cloudinary Differential Sync Workflow

This workflow describes how to implement a non-blocking background synchronization between a Cloudinary "Featured" tag and a local Electron assets folder. This allows the photobooth to mirror a cloud-managed gallery with zero manual file management on the local machine.

## 1. Cloudinary Setup
Ensure your Cloudinary project is configured to allow fetching resource lists by tag:
- **Source of Truth**: `https://res.cloudinary.com/<cloud_name>/image/list/<tag>.json`
- **Security**: Note that this endpoint requires the "Resource List" capability to be enabled in your Cloudinary Security settings (Settings > Security > Restricted Media Types > Resource List).

## 2. Electron Main Process (`main.cjs`)
Implement the IPC handlers to manage the local filesystem. This logic uses **Differential Sync**: it only downloads what is missing and deletes what is no longer tagged.

```javascript
const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// 1. Get current local state
ipcMain.handle('get-featured-info', async () => {
    const featuredPath = app.isPackaged 
        ? path.join(app.getPath('userData'), 'Featured') 
        : path.join(__dirname, '../Featured');

    if (!fs.existsSync(featuredPath)) fs.mkdirSync(featuredPath, { recursive: true });

    const files = fs.readdirSync(featuredPath)
        .filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(f => path.join(featuredPath, f));

    return { count: files.length, files };
});

// 2. Perform Differential Sync
ipcMain.handle('sync-featured-images', async (event, imageData) => {
    const axios = require('axios'); // Ensure axios is required
    const featuredPath = app.isPackaged 
        ? path.join(app.getPath('userData'), 'Featured') 
        : path.join(__dirname, '../Featured');

    if (!fs.existsSync(featuredPath)) fs.mkdirSync(featuredPath, { recursive: true });

    try {
        const localFiles = fs.readdirSync(featuredPath);
        const remoteIds = imageData.map(img => `${img.id}${path.extname(img.url)}`);

        // STEP A: Delete local files not in remote list
        for (const file of localFiles) {
            if (!remoteIds.includes(file)) {
                fs.unlinkSync(path.join(featuredPath, file));
            }
        }

        // STEP B: Download missing files
        for (const img of imageData) {
            const ext = path.extname(img.url);
            const fileName = `${img.id}${ext}`;
            const filePath = path.join(featuredPath, fileName);

            if (!fs.existsSync(filePath)) {
                const response = await axios({ url: img.url, method: 'GET', responseType: 'stream' });
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
            }
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
```

## 3. React Implementation (`App.tsx`)
Trigger the sync on app start and during idle states. This keeps the gallery fresh without blocking the user experience.

```tsx
const CLOUDINARY_CLOUD_NAME = "your_cloud_name";

useEffect(() => {
    const syncFeaturedImages = async () => {
        try {
            // Fetch list of images with the "Featured" tag
            const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/Featured.json`);

            // Handle Empty State (404 = no images with this tag)
            if (response.status === 404) {
                await ipcRenderer.invoke('sync-featured-images', []);
                return;
            }

            if (!response.ok) return;

            const data = await response.json();
            const cloudinaryImages = data.resources || [];

            // Map to standard format for the main process
            const imageData = cloudinaryImages.map((img: any) => ({
                id: img.public_id,
                url: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v${img.version}/${img.public_id}.${img.format}`
            }));

            // Invoke Differential Sync
            await ipcRenderer.invoke('sync-featured-images', imageData);
        } catch (err) {
            console.warn('[Sync] Failed:', err);
        }
    };

    syncFeaturedImages();
}, []); // Run on mount
```

## 4. UI Usage (`GalleryComponent.tsx`)
Always fetch the local file paths from the main process to ensure the UI is seeing the mirrored state.

```tsx
useEffect(() => {
    const loadLocalImages = async () => {
        const { files } = await ipcRenderer.invoke('get-featured-info');
        setImages(files);
    };
    loadLocalImages();
}, []);
```

## 5. Summary of Benefits
- **Zero Configuration**: No need to manually transfer files to the booth.
- **Offline Resilient**: Once synced, the gallery works without an internet connection.
- **Background Optimized**: Syncing is non-blocking and doesn't affect frame rates during user interactions.
- **Mirroring**: Deletes old content automatically, keeping local disk space clean.
