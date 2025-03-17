import { YoutubeTranscript } from 'youtube-transcript';

async function getTranscript(videoId: string) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  return transcript.map(entry => entry.text).join(" ");
}

export default getTranscript
