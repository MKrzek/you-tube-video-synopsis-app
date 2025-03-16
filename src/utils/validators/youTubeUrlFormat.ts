const validateYouTubeUrl = (value: string) => {
    // Regex to validate all possible YouTube URLs
    const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;

    if (!youtubeRegex.test(value)) {
        return 'This is not a valid YouTube URL';
    }

    // Extract videoId from the URL
    const match = value.match(youtubeRegex);
    const videoId = match ? match[5] : null; // The 5th capturing group is the videoId

    // Check if videoId is valid (11 characters)
    if (!videoId || videoId.length !== 11) {
        return 'The video ID in the URL is invalid';
    }

    return true;
};

export default validateYouTubeUrl