export const urlParsers = {
  cleanDriveLink(url: string): string | null {
    const match = url.match(/(\/d\/|id=|\/folders\/)([a-zA-Z0-9_-]{10,})/);
    if (!match) return null;

    const id = match[2];
    const isFolder = url.includes("/folders/");
    return isFolder
      ? `https://drive.google.com/drive/folders/${id}`
      : `https://drive.google.com/file/d/${id}`;
  },

  extractDriveId(url: string) {
    const regex = /(?:\/d\/|id=|\/folders\/)([a-zA-Z0-9_-]{10,})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },
};
