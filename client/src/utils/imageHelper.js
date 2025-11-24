/**
 * Get the correct image URL for display
 * Handles both old absolute paths and new relative paths
 */
export const getImageUrl = (photo) => {
  if (!photo) return 'https://via.placeholder.com/400x300?text=No+Image';

  // Use thumbnail if available, otherwise use original
  const imagePath = photo.thumbnailPath || photo.filePath;

  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';

  // If path is already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If path starts with /tmp or is an absolute path, extract just the filename
  if (imagePath.includes('/tmp/') || imagePath.startsWith('/')) {
    // Extract just the filename from absolute path
    const parts = imagePath.split('/');
    const filename = parts[parts.length - 1];

    // Check if it's in a subdirectory (thumbnails, watermarked)
    if (imagePath.includes('/thumbnails/')) {
      return `/uploads/thumbnails/${filename}`;
    } else if (imagePath.includes('/watermarked/')) {
      return `/uploads/watermarked/${filename}`;
    } else {
      return `/uploads/${filename}`;
    }
  }

  // Otherwise, it's already a relative path, just prepend /uploads/
  return `/uploads/${imagePath}`;
};

/**
 * Get the download URL for a photo
 */
export const getDownloadUrl = (photoId) => {
  return `/api/photos/${photoId}/download`;
};
